import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { LandingHero } from './components/landing/LandingHero';
import { StudyRoomView } from './components/room/StudyRoomView';
import { RoomCreationModal } from './components/landing/RoomCreationModal';
import { ProfileCustomizerModal } from './components/landing/ProfileCustomizerModal';

const AppContent: React.FC = () => {
  const { roomId, joinRoom, leaveRoom } = useSocket();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Auto-join room from URL search parameter or hash if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && !roomId) {
      joinRoom(roomParam, 'Cozy Study Sanctuary');
    }
  }, [joinRoom, roomId]);

  const handleJoinRoom = (targetRoomId: string, roomName?: string) => {
    joinRoom(targetRoomId, roomName);
    // Update URL without reload
    window.history.pushState({}, '', `?room=${targetRoomId}`);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-kawaii-cream dark:bg-cyber-bg text-slate-800 dark:text-slate-100 font-body transition-colors duration-300">
      {roomId ? (
        <StudyRoomView onLeave={handleLeaveRoom} />
      ) : (
        <LandingHero
          onOpenCreateModal={() => setShowCreateModal(true)}
          onOpenProfileModal={() => setShowProfileModal(true)}
          onQuickJoin={(id) => handleJoinRoom(id, 'Lo-Fi Chill Lounge')}
        />
      )}

      {/* Global Modals */}
      <RoomCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onJoinRoom={handleJoinRoom}
      />

      <ProfileCustomizerModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
