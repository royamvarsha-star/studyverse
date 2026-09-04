import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

interface RoomData {
  id: string;
  name: string;
  theme: string;
  backdropId: string;
  customBackdropUrl?: string;
  participants: Record<string, any>;
  pomodoro: {
    mode: string;
    timeLeft: number;
    isRunning: boolean;
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    totalSessionsCompleted: number;
    lastUpdated: number;
  };
  youtube: {
    videoId: string;
    videoTitle: string;
    isPlaying: boolean;
    currentTime: number;
    lastSyncTimestamp: number;
    displayMode?: string;
  };
  spotify: {
    uriOrUrl: string;
    title: string;
    embedType: 'playlist' | 'track' | 'album';
    embedId: string;
    viewMode: 'compact' | 'full';
    lastSyncTimestamp: number;
  };
  activeMusicSource: 'youtube' | 'spotify';
  pet: {
    species: string;
    name: string;
    stage: number;
    xp: number;
    maxExp: number;
    happiness: number;
    hunger: number;
    isSleeping: boolean;
    lastInteraction: number;
  };
  placedStickers: any[];
  activeGame: string | null;
  chatMessages: any[];
}

const rooms = new Map<string, RoomData>();

function getOrCreateRoom(roomId: string): RoomData {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
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
        videoId: 'jfKfPfyJRdk',
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
        stage: 1,
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
          text: '✨ Welcome to StudyVerse! Connect, focus, chill to lo-fi beats, and level up together!',
          timestamp: Date.now(),
          isSystem: true,
        },
      ],
    });
  }
  return rooms.get(roomId)!;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now(), roomsCount: rooms.size });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  res.json(room);
});

// Socket.io Realtime Events
io.on('connection', (socket: Socket) => {
  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;

  console.log('⚡ User connected:', socket.id);

  socket.on('join_room', ({ roomId, user }) => {
    currentRoomId = roomId;
    currentUserId = user.id;

    socket.join(roomId);
    const room = getOrCreateRoom(roomId);

    room.participants[user.id] = {
      ...user,
      socketId: socket.id,
      isMuted: false,
      isVideoOff: false,
      isSpeaking: false,
      isHost: Object.keys(room.participants).length === 0,
      x: 80 + Math.random() * 80,
      y: 100 + Math.random() * 40,
    };

    // Broadcast updated state to room members
    io.to(roomId).emit('room_state', room);

    // Notify other peers for WebRTC mesh connection
    socket.to(roomId).emit('user_joined', {
      peerId: user.id,
      socketId: socket.id,
      user: room.participants[user.id],
    });

    console.log(`👤 ${user.name} (${user.id}) joined room [${roomId}]`);
  });

  socket.on('update_room_state', ({ roomId, state }) => {
    const room = getOrCreateRoom(roomId);
    Object.assign(room, state);
    socket.to(roomId).emit('room_state_updated', state);
  });

  socket.on('send_chat', ({ roomId, message }) => {
    const room = getOrCreateRoom(roomId);
    const fullMsg = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      senderId: currentUserId || 'anon',
      senderName: message.senderName,
      avatarId: message.avatarId,
      text: message.text,
      timestamp: Date.now(),
    };
    room.chatMessages.push(fullMsg);
    io.to(roomId).emit('chat_received', fullMsg);
  });

  // WebRTC Signaling
  socket.on('signal_offer', ({ targetSocketId, offer }) => {
    io.to(targetSocketId).emit('signal_offer', {
      senderSocketId: socket.id,
      senderUserId: currentUserId,
      offer,
    });
  });

  socket.on('signal_answer', ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit('signal_answer', {
      senderSocketId: socket.id,
      senderUserId: currentUserId,
      answer,
    });
  });

  socket.on('signal_ice_candidate', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('signal_ice_candidate', {
      senderSocketId: socket.id,
      senderUserId: currentUserId,
      candidate,
    });
  });

  // Mini-Games Action Broadcast
  socket.on('game_action', ({ roomId, gameType, action, payload }) => {
    socket.to(roomId).emit('game_action_received', { gameType, action, payload });
  });

  socket.on('disconnect', () => {
    if (currentRoomId && currentUserId) {
      const room = rooms.get(currentRoomId);
      if (room && room.participants[currentUserId]) {
        delete room.participants[currentUserId];
        io.to(currentRoomId).emit('user_left', { peerId: currentUserId });
        io.to(currentRoomId).emit('room_state', room);
      }
    }
    console.log('🔌 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`✨ StudyVerse Backend Server listening on http://localhost:${PORT}`);
});
