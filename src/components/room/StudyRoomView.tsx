import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { RoomHeader } from '../layout/RoomHeader';
import { RoomBackdropCanvas } from './RoomBackdropCanvas';
import { DraggableVideoBubble } from '../video/DraggableVideoBubble';
import { PomodoroTimer } from '../study/PomodoroTimer';
import { VirtualPetWidget } from '../pet/VirtualPetWidget';
import { MusicLoungeWidget } from '../study/MusicLoungeWidget';
import { ChatBox } from '../study/ChatBox';
import { StickerDecoratorDrawer } from './StickerDecoratorDrawer';
import { BackdropSelectorModal } from './BackdropSelectorModal';
import { ProfileCustomizerModal } from '../landing/ProfileCustomizerModal';

// 6 Mini Games
import { GuessThePerson } from '../games/GuessThePerson';
import { WordFinderRace } from '../games/WordFinderRace';
import { TicTacToe } from '../games/TicTacToe';
import { ConnectFour } from '../games/ConnectFour';
import { TriviaQuiz } from '../games/TriviaQuiz';
import { Whiteboard } from '../games/Whiteboard';

import { Clock, Heart, Music, MessageSquare, Sparkles } from 'lucide-react';

export const StudyRoomView: React.FC<{ onLeave: () => void }> = ({ onLeave }) => {
  const { user } = useAuth();
  const {
    roomState,
    localStream,
    remoteStreams,
    isMuted,
    isVideoOff,
    toggleMic,
    toggleCam,
    setActiveGame,
  } = useSocket();

  const [isDecoratorMode, setIsDecoratorMode] = useState(false);
  const [showBackdropsModal, setShowBackdropsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Bottom drawer active widget tab ('pomo' | 'pet' | 'music' | 'chat')
  const [activeWidget, setActiveWidget] = useState<'pomo' | 'pet' | 'music' | 'chat'>('pomo');

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col">
      {/* Top Room Navigation Header */}
      <RoomHeader
        isDecoratorMode={isDecoratorMode}
        onToggleDecorator={() => setIsDecoratorMode(!isDecoratorMode)}
        onOpenBackdrops={() => setShowBackdropsModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onLeaveRoom={onLeave}
      />

      {/* Main Room Canvas with dynamic backdrop & placed props */}
      <RoomBackdropCanvas isDecoratorMode={isDecoratorMode}>
        {/* Render Self Draggable Video Bubble */}
        <DraggableVideoBubble
          participant={{
            id: user.id,
            name: user.name,
            avatarId: user.avatarId,
            frameId: user.frameId,
            isMuted,
            isVideoOff,
            isSpeaking: false,
            isHost: true,
            badge: user.badge,
          }}
          isSelf={true}
          stream={localStream}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
          initialX={60}
          initialY={100}
        />

        {/* Render Remote Peers Draggable Video Bubbles */}
        {Object.entries(roomState.participants)
          .filter(([id]) => id !== user.id)
          .map(([id, peer], index) => (
            <DraggableVideoBubble
              key={id}
              participant={peer}
              isSelf={false}
              stream={remoteStreams.get(id) || null}
              initialX={200 + index * 140}
              initialY={100 + (index % 2) * 40}
            />
          ))}

        {/* Right Side Docked Widgets (Desktop view) */}
        <div className="hidden lg:flex absolute right-6 top-16 bottom-6 flex-col gap-3 w-80 z-20 overflow-y-auto pr-1">
          <PomodoroTimer />
          <VirtualPetWidget />
          <MusicLoungeWidget />
          <ChatBox />
        </div>

        {/* Mobile / Tablet Docked Floating Utility Widget Drawer */}
        <div className="lg:hidden absolute bottom-4 left-4 right-4 z-30 flex flex-col items-center">
          {/* Active Widget Content */}
          <div className="w-full max-w-sm mb-2">
            {activeWidget === 'pomo' && <PomodoroTimer />}
            {activeWidget === 'pet' && <VirtualPetWidget />}
            {activeWidget === 'music' && <MusicLoungeWidget />}
            {activeWidget === 'chat' && <ChatBox />}
          </div>

          {/* Quick Tab Switcher Pill */}
          <div className="flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 p-1.5 rounded-full border-2 border-pink-400 dark:border-cyan-400 shadow-xl">
            <button
              onClick={() => setActiveWidget('pomo')}
              className={`px-3 py-1.5 rounded-full font-pixel text-[8px] flex items-center gap-1 ${
                activeWidget === 'pomo' ? 'bg-pink-500 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Clock className="w-3 h-3" /> Timer
            </button>
            <button
              onClick={() => setActiveWidget('pet')}
              className={`px-3 py-1.5 rounded-full font-pixel text-[8px] flex items-center gap-1 ${
                activeWidget === 'pet' ? 'bg-pink-500 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Heart className="w-3 h-3" /> Pet
            </button>
            <button
              onClick={() => setActiveWidget('music')}
              className={`px-3 py-1.5 rounded-full font-pixel text-[8px] flex items-center gap-1 ${
                activeWidget === 'music' ? 'bg-pink-500 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Music className="w-3 h-3" /> Music
            </button>
            <button
              onClick={() => setActiveWidget('chat')}
              className={`px-3 py-1.5 rounded-full font-pixel text-[8px] flex items-center gap-1 ${
                activeWidget === 'chat' ? 'bg-pink-500 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <MessageSquare className="w-3 h-3" /> Chat
            </button>
          </div>
        </div>
      </RoomBackdropCanvas>

      {/* Sticker Decorator Drawer */}
      <StickerDecoratorDrawer
        isOpen={isDecoratorMode}
        onClose={() => setIsDecoratorMode(false)}
      />

      {/* Backdrop & Ambience Modal */}
      <BackdropSelectorModal
        isOpen={showBackdropsModal}
        onClose={() => setShowBackdropsModal(false)}
      />

      {/* Profile & Avatar Customizer Modal */}
      <ProfileCustomizerModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* 6 Mini-Games Modal Overlays */}
      {roomState.activeGame === 'guess_person' && (
        <GuessThePerson onClose={() => setActiveGame(null)} />
      )}
      {roomState.activeGame === 'word_finder' && (
        <WordFinderRace onClose={() => setActiveGame(null)} />
      )}
      {roomState.activeGame === 'tic_tac_toe' && (
        <TicTacToe onClose={() => setActiveGame(null)} />
      )}
      {roomState.activeGame === 'connect_four' && (
        <ConnectFour onClose={() => setActiveGame(null)} />
      )}
      {roomState.activeGame === 'trivia_quiz' && (
        <TriviaQuiz onClose={() => setActiveGame(null)} />
      )}
      {roomState.activeGame === 'whiteboard' && (
        <Whiteboard onClose={() => setActiveGame(null)} />
      )}
    </div>
  );
};
