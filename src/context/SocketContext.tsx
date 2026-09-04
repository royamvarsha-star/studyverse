import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { socketService } from '../services/socket';
import { webrtc } from '../services/webrtc';
import { useAuth } from './AuthContext';
import {
  RoomState,
  RoomParticipant,
  PomodoroState,
  YouTubeState,
  PetState,
  PlacedSticker,
  ChatMessage,
  MiniGameType,
} from '../types';
import { audioSynth } from '../services/audioSynthesizer';
import confetti from 'canvas-confetti';

interface SocketContextType {
  isConnected: boolean;
  roomId: string | null;
  roomState: RoomState;
  joinRoom: (roomId: string, roomName?: string) => void;
  leaveRoom: () => void;
  setLocalMedia: (audio: boolean, video: boolean) => void;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isMuted: boolean;
  isVideoOff: boolean;
  toggleMic: () => void;
  toggleCam: () => void;
  updatePomodoro: (pomodoro: Partial<PomodoroState>) => void;
  updateYouTube: (yt: Partial<YouTubeState>) => void;
  updateSpotify: (spotify: Partial<SpotifyState>) => void;
  setActiveMusicSource: (source: MusicSource) => void;
  updatePet: (pet: Partial<PetState>) => void;
  feedPet: () => void;
  petThePet: () => void;
  togglePetSleep: () => void;
  addSticker: (stickerId: string, x?: number, y?: number) => void;
  updateSticker: (sticker: PlacedSticker) => void;
  removeSticker: (stickerId: string) => void;
  setActiveGame: (game: MiniGameType) => void;
  sendChat: (text: string) => void;
  emitGameAction: (gameType: string, action: string, payload: unknown) => void;
  addMockStudyPeer: () => void;
}

const INITIAL_ROOM_STATE: RoomState = {
  id: 'lobby',
  name: 'Lo-Fi Chill Study Nook',
  theme: 'kawaii',
  backdropId: 'anime_bedroom',
  participants: {},
  pomodoro: {
    mode: 'focus',
    timeLeft: 25 * 60,
    isRunning: false,
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    totalSessionsCompleted: 0,
    lastUpdated: Date.now(),
  },
  youtube: {
    videoId: 'jfKfPfyJRdk', // Lofi Girl 24/7 stream
    videoTitle: 'Lofi Girl - Relaxing Beats to Study/Chill to ☕',
    isPlaying: true,
    currentTime: 0,
    lastSyncTimestamp: Date.now(),
    displayMode: 'video',
  },
  spotify: {
    uriOrUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    title: 'Lo-Fi Beats (Official Spotify)',
    embedType: 'playlist',
    embedId: '37i9dQZF1DXdLEN7aqioXM',
    viewMode: 'compact',
    lastSyncTimestamp: Date.now(),
  },
  activeMusicSource: 'youtube',
  pet: {
    species: 'cat',
    name: 'Mochi',
    stage: 1, // Baby Calico Cat
    xp: 20,
    maxExp: 100,
    happiness: 85,
    hunger: 70,
    isSleeping: false,
    lastInteraction: Date.now(),
  },
  placedStickers: [
    { id: 's1', stickerId: 'fairy_lights', x: 50, y: 12, scale: 1.2, rotation: 0 },
    { id: 's2', stickerId: 'succulent_plant', x: 18, y: 78, scale: 1, rotation: 0 },
    { id: 's3', stickerId: 'coffee_mug', x: 82, y: 76, scale: 1, rotation: 0 },
  ],
  activeGame: null,
  chatMessages: [
    {
      id: 'm1',
      senderId: 'sys',
      senderName: 'StudyVerse Bot',
      avatarId: 'char_1',
      text: '✨ Welcome to your cozy study sanctuary! Drag your video bubble anywhere, start the Pomodoro timer, feed Mochi, or challenge friends to a mini-game!',
      timestamp: Date.now() - 60000,
      isSystem: true,
    },
  ],
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addStudyMinutes, incrementPomodoros, incrementPetsEvolved } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState>(INITIAL_ROOM_STATE);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);

  const socketRef = useRef(socketService.connect());
  const pomodoroIntervalRef = useRef<number | null>(null);

  // Initialize media streams
  useEffect(() => {
    webrtc.getLocalStream().then((stream) => {
      setLocalStream(stream);
    });

    const unsubscribe = webrtc.onRemoteStream((peerId, stream) => {
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.set(peerId, stream);
        return next;
      });
    });

    return () => {
      unsubscribe();
      webrtc.cleanup();
    };
  }, []);

  // Listen to Socket.io events
  useEffect(() => {
    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room_state', (incomingState: RoomState) => {
      setRoomState(incomingState);
    });

    socket.on('room_state_updated', (partial: Partial<RoomState>) => {
      setRoomState((prev) => ({ ...prev, ...partial }));
    });

    socket.on('chat_received', (msg: ChatMessage) => {
      setRoomState((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages, msg],
      }));
      audioSynth.playClick();
    });

    socket.on('game_state_updated', ({ gameType, state }: { gameType: string; state: unknown }) => {
      setRoomState((prev) => {
        const updated = { ...prev };
        if (gameType === 'guess_person') updated.guessPersonGame = state as never;
        if (gameType === 'word_finder') updated.wordFinderGame = state as never;
        if (gameType === 'tic_tac_toe') updated.ticTacToeGame = state as never;
        if (gameType === 'connect_four') updated.connectFourGame = state as never;
        if (gameType === 'trivia_quiz') updated.triviaQuizGame = state as never;
        if (gameType === 'whiteboard') updated.whiteboardStrokes = state as never;
        return updated;
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room_state');
      socket.off('room_state_updated');
      socket.off('chat_received');
      socket.off('game_state_updated');
    };
  }, []);

  // Pomodoro countdown timer tick
  useEffect(() => {
    if (roomState.pomodoro.isRunning) {
      pomodoroIntervalRef.current = window.setInterval(() => {
        setRoomState((prev) => {
          if (!prev.pomodoro.isRunning) return prev;
          if (prev.pomodoro.timeLeft <= 1) {
            // Timer Finished!
            audioSynth.playPomodoroAlarm();
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });

            const isFocus = prev.pomodoro.mode === 'focus';
            const nextMode = isFocus ? 'shortBreak' : 'focus';
            const nextDuration = (nextMode === 'focus' ? prev.pomodoro.focusDuration : prev.pomodoro.shortBreakDuration) * 60;

            if (isFocus) {
              addStudyMinutes(prev.pomodoro.focusDuration);
              incrementPomodoros();
              // Feed & evolve pet with XP
              const nextXp = prev.pet.xp + 40;
              let nextStage = prev.pet.stage;
              let nextMaxXp = prev.pet.maxExp;
              if (nextXp >= prev.pet.maxExp && prev.pet.stage < 3) {
                nextStage = (prev.pet.stage + 1) as 0 | 1 | 2 | 3;
                nextMaxXp = prev.pet.maxExp * 1.5;
                incrementPetsEvolved();
                audioSynth.playVictoryFanfare();
              }

              return {
                ...prev,
                pomodoro: {
                  ...prev.pomodoro,
                  mode: nextMode,
                  timeLeft: nextDuration,
                  isRunning: false,
                  totalSessionsCompleted: prev.pomodoro.totalSessionsCompleted + 1,
                  lastUpdated: Date.now(),
                },
                pet: {
                  ...prev.pet,
                  xp: nextXp,
                  stage: nextStage,
                  maxExp: nextMaxXp,
                  happiness: Math.min(100, prev.pet.happiness + 20),
                },
              };
            }

            return {
              ...prev,
              pomodoro: {
                ...prev.pomodoro,
                mode: nextMode,
                timeLeft: nextDuration,
                isRunning: false,
                lastUpdated: Date.now(),
              },
            };
          }

          return {
            ...prev,
            pomodoro: {
              ...prev.pomodoro,
              timeLeft: prev.pomodoro.timeLeft - 1,
            },
          };
        });
      }, 1000);
    } else {
      if (pomodoroIntervalRef.current) {
        clearInterval(pomodoroIntervalRef.current);
        pomodoroIntervalRef.current = null;
      }
    }

    return () => {
      if (pomodoroIntervalRef.current) {
        clearInterval(pomodoroIntervalRef.current);
      }
    };
  }, [roomState.pomodoro.isRunning, addStudyMinutes, incrementPomodoros, incrementPetsEvolved]);

  const joinRoom = useCallback(
    (newRoomId: string, roomName?: string) => {
      setRoomId(newRoomId);
      socketService.joinRoom(newRoomId, {
        id: user.id,
        name: user.name,
        avatarId: user.avatarId,
        frameId: user.frameId,
        badge: user.badge,
      });

      // Update current user in participant list
      const selfParticipant: RoomParticipant = {
        id: user.id,
        name: user.name,
        avatarId: user.avatarId,
        frameId: user.frameId,
        isMuted: false,
        isVideoOff: false,
        isSpeaking: false,
        isHost: true,
        badge: user.badge,
        x: 80,
        y: 120,
      };

      setRoomState((prev) => ({
        ...prev,
        id: newRoomId,
        name: roomName || prev.name,
        participants: {
          ...prev.participants,
          [user.id]: selfParticipant,
        },
      }));

      audioSynth.playClick();
    },
    [user]
  );

  const leaveRoom = useCallback(() => {
    socketService.leaveRoom();
    setRoomId(null);
  }, []);

  const toggleMic = () => {
    const next = !isMuted;
    setIsMuted(next);
    webrtc.toggleAudio(!next);
    audioSynth.playClick();
  };

  const toggleCam = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    webrtc.toggleVideo(!next);
    audioSynth.playClick();
  };

  const setLocalMedia = (audio: boolean, video: boolean) => {
    setIsMuted(!audio);
    setIsVideoOff(!video);
    webrtc.toggleAudio(audio);
    webrtc.toggleVideo(video);
  };

  const updatePomodoro = (updates: Partial<PomodoroState>) => {
    setRoomState((prev) => {
      const nextPomodoro = { ...prev.pomodoro, ...updates };
      socketService.updateRoomState({ pomodoro: nextPomodoro });
      return { ...prev, pomodoro: nextPomodoro };
    });
    audioSynth.playClick();
  };

  const updateYouTube = (updates: Partial<YouTubeState>) => {
    setRoomState((prev) => {
      const nextYt = { ...prev.youtube, ...updates };
      socketService.updateRoomState({ youtube: nextYt });
      return { ...prev, youtube: nextYt };
    });
  };

  const updateSpotify = (updates: Partial<SpotifyState>) => {
    setRoomState((prev) => {
      const nextSpotify = { ...prev.spotify, ...updates };
      socketService.updateRoomState({ spotify: nextSpotify });
      return { ...prev, spotify: nextSpotify };
    });
  };

  const setActiveMusicSource = (source: MusicSource) => {
    setRoomState((prev) => {
      socketService.updateRoomState({ activeMusicSource: source });
      return { ...prev, activeMusicSource: source };
    });
    audioSynth.playClick();
  };

  const updatePet = (updates: Partial<PetState>) => {
    setRoomState((prev) => {
      const nextPet = { ...prev.pet, ...updates };
      socketService.updateRoomState({ pet: nextPet });
      return { ...prev, pet: nextPet };
    });
  };

  const feedPet = () => {
    audioSynth.playFeedChime();
    setRoomState((prev) => {
      const newXp = prev.pet.xp + 15;
      let newStage = prev.pet.stage;
      let newMaxXp = prev.pet.maxExp;

      if (newXp >= prev.pet.maxExp && prev.pet.stage < 3) {
        newStage = (prev.pet.stage + 1) as 0 | 1 | 2 | 3;
        newMaxXp = prev.pet.maxExp * 1.5;
        incrementPetsEvolved();
        audioSynth.playVictoryFanfare();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }

      const nextPet: PetState = {
        ...prev.pet,
        hunger: Math.min(100, prev.pet.hunger + 25),
        happiness: Math.min(100, prev.pet.happiness + 15),
        xp: newXp,
        stage: newStage,
        maxExp: newMaxXp,
        lastInteraction: Date.now(),
      };
      socketService.updateRoomState({ pet: nextPet });
      return { ...prev, pet: nextPet };
    });
  };

  const petThePet = () => {
    audioSynth.playPetHeart();
    setRoomState((prev) => {
      const nextPet: PetState = {
        ...prev.pet,
        happiness: Math.min(100, prev.pet.happiness + 10),
        lastInteraction: Date.now(),
      };
      socketService.updateRoomState({ pet: nextPet });
      return { ...prev, pet: nextPet };
    });
  };

  const togglePetSleep = () => {
    audioSynth.playClick();
    setRoomState((prev) => {
      const nextPet: PetState = {
        ...prev.pet,
        isSleeping: !prev.pet.isSleeping,
        lastInteraction: Date.now(),
      };
      socketService.updateRoomState({ pet: nextPet });
      return { ...prev, pet: nextPet };
    });
  };

  const addSticker = (stickerId: string, x = 50, y = 50) => {
    const newSticker: PlacedSticker = {
      id: 'sticker_' + Math.random().toString(36).substring(2, 9),
      stickerId,
      x,
      y,
      scale: 1,
      rotation: 0,
    };
    setRoomState((prev) => {
      const nextStickers = [...prev.placedStickers, newSticker];
      socketService.updateRoomState({ placedStickers: nextStickers });
      return { ...prev, placedStickers: nextStickers };
    });
    audioSynth.playClick();
  };

  const updateSticker = (updated: PlacedSticker) => {
    setRoomState((prev) => {
      const nextStickers = prev.placedStickers.map((s) => (s.id === updated.id ? updated : s));
      socketService.updateRoomState({ placedStickers: nextStickers });
      return { ...prev, placedStickers: nextStickers };
    });
  };

  const removeSticker = (stickerId: string) => {
    setRoomState((prev) => {
      const nextStickers = prev.placedStickers.filter((s) => s.id !== stickerId);
      socketService.updateRoomState({ placedStickers: nextStickers });
      return { ...prev, placedStickers: nextStickers };
    });
    audioSynth.playClick();
  };

  const setActiveGame = (game: MiniGameType) => {
    audioSynth.playClick();
    setRoomState((prev) => {
      socketService.updateRoomState({ activeGame: game });
      return { ...prev, activeGame: game };
    });
  };

  const sendChat = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      senderId: user.id,
      senderName: user.name,
      avatarId: user.avatarId,
      text: text.trim(),
      timestamp: Date.now(),
    };
    setRoomState((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, msg],
    }));
    socketService.sendChatMessage({
      text: text.trim(),
      senderName: user.name,
      avatarId: user.avatarId,
    });
  };

  const emitGameAction = (gameType: string, action: string, payload: unknown) => {
    socketService.emitGameAction(gameType, action, payload);
  };

  // Add a cute mock study buddy for testing multi-user rooms
  const addMockStudyPeer = () => {
    const mockNames = ['SakuraChan', 'CyberCoder', 'TeaLover', 'PixelWizard', 'LofiBreeze'];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const mockId = 'peer_' + Math.random().toString(36).substring(2, 7);

    const mockPeer: RoomParticipant = {
      id: mockId,
      name: randomName,
      avatarId: 'char_' + (Math.floor(Math.random() * 24) + 1),
      frameId: 'angel_halo',
      isMuted: false,
      isVideoOff: false,
      isSpeaking: Math.random() > 0.5,
      isHost: false,
      badge: 'Focus Master ⭐',
      x: 80 + Math.random() * 100,
      y: 280 + Math.random() * 80,
    };

    setRoomState((prev) => ({
      ...prev,
      participants: {
        ...prev.participants,
        [mockId]: mockPeer,
      },
    }));

    audioSynth.playVictoryFanfare();
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        roomId,
        roomState,
        joinRoom,
        leaveRoom,
        setLocalMedia,
        localStream,
        remoteStreams,
        isMuted,
        isVideoOff,
        toggleMic,
        toggleCam,
        updatePomodoro,
        updateYouTube,
        updateSpotify,
        setActiveMusicSource,
        updatePet,
        feedPet,
        petThePet,
        togglePetSleep,
        addSticker,
        updateSticker,
        removeSticker,
        setActiveGame,
        sendChat,
        emitGameAction,
        addMockStudyPeer,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
