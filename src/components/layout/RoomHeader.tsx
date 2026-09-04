import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Gamepad2,
  Image,
  Sparkles,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Copy,
  Check,
  UserPlus,
  User,
  LogOut,
  Palette,
  ChevronDown,
} from 'lucide-react';
import { MiniGameType } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';

const MINI_GAMES: { id: MiniGameType; name: string; icon: string; desc: string }[] = [
  { id: 'guess_person', name: 'Guess the Person 🕵️', icon: '🕵️', desc: 'Guess Who style avatar elimination' },
  { id: 'word_finder', name: 'Word Finder Race ⚡', icon: '⚡', desc: 'Anagram dictionary scramble' },
  { id: 'tic_tac_toe', name: 'Tic-Tac-Toe ✨', icon: '✨', desc: 'Pixel Heart vs Star showdown' },
  { id: 'connect_four', name: 'Connect Four 🔴', icon: '🔴', desc: '7x6 Drop physics fruit battle' },
  { id: 'trivia_quiz', name: 'Study Flashcards 🎓', icon: '🎓', desc: 'Trivia challenge & custom study decks' },
  { id: 'whiteboard', name: 'Doodle Whiteboard 🎨', icon: '🎨', desc: 'Real-time collaborative canvas' },
];

interface RoomHeaderProps {
  isDecoratorMode: boolean;
  onToggleDecorator: () => void;
  onOpenBackdrops: () => void;
  onOpenProfile: () => void;
  onLeaveRoom: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  isDecoratorMode,
  onToggleDecorator,
  onOpenBackdrops,
  onOpenProfile,
  onLeaveRoom,
}) => {
  const { roomState, setActiveGame, addMockStudyPeer } = useSocket();
  const { theme, setTheme, isMuted, toggleMute } = useTheme();
  const { user } = useAuth();

  const [copied, setCopied] = useState(false);
  const [showGamesMenu, setShowGamesMenu] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomState.id);
    setCopied(true);
    audioSynth.playVictoryFanfare();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectGame = (gameId: MiniGameType) => {
    setActiveGame(gameId);
    setShowGamesMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-2.5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b-3 border-pink-300 dark:border-cyan-500/50 flex items-center justify-between shadow-md">
      {/* Left: Study Room Title & Code badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-pixel text-xs sm:text-sm text-pink-600 dark:text-cyan-400 font-bold drop-shadow-sm">
          <span className="text-base sm:text-lg">✨</span>
          <span className="truncate max-w-[140px] sm:max-w-[240px]">{roomState.name}</span>
        </div>

        {/* Room Code Badge */}
        <button
          onClick={handleCopyCode}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-100 dark:bg-slate-800 border border-pink-300 dark:border-cyan-500/60 font-pixel text-[8px] text-pink-700 dark:text-cyan-300 hover:scale-105 transition-transform"
          title="Click to copy Room Code"
        >
          <span>CODE: {roomState.id}</span>
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-70" />}
        </button>
      </div>

      {/* Right Controls & Utilities */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Games Menu Launcher */}
        <div className="relative">
          <button
            onClick={() => setShowGamesMenu(!showGamesMenu)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 dark:from-cyan-500 dark:to-blue-600 text-white font-pixel text-[8px] sm:text-[9px] shadow-sm hover:scale-105 flex items-center gap-1.5 transition-transform"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">MINI-GAMES</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Games Dropdown */}
          {showGamesMenu && (
            <div className="absolute right-0 top-11 bg-white dark:bg-slate-900 border-2 border-pink-400 dark:border-cyan-400 rounded-2xl p-2 shadow-2xl w-64 z-50 space-y-1">
              <span className="font-pixel text-[8px] text-pink-600 dark:text-cyan-400 px-2 py-1 block">
                CHOOSE MINI-GAME:
              </span>
              {MINI_GAMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSelectGame(g.id)}
                  className="w-full p-2 rounded-xl text-left font-body text-xs font-semibold hover:bg-pink-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors group"
                >
                  <span className="text-base group-hover:scale-125 transition-transform">{g.icon}</span>
                  <div>
                    <div className="font-pixel text-[8px] text-slate-800 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-cyan-400">
                      {g.name}
                    </div>
                    <span className="text-[10px] text-slate-400 block">{g.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Decorator Mode Button */}
        <button
          onClick={onToggleDecorator}
          className={`p-2 rounded-xl border font-pixel text-[8px] flex items-center gap-1 transition-all ${
            isDecoratorMode
              ? 'bg-pink-500 text-white border-pink-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-pink-200 dark:border-slate-700 hover:bg-pink-50'
          }`}
          title="Toggle Room Decorator Props Mode"
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isDecoratorMode ? 'Decor: ON' : 'Decor'}</span>
        </button>

        {/* Backdrops & Ambience modal */}
        <button
          onClick={onOpenBackdrops}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-pink-200 dark:border-slate-700 hover:bg-pink-50 hover:scale-105 transition-transform"
          title="Backdrops & Ambience"
        >
          <Image className="w-3.5 h-3.5" />
        </button>

        {/* Add Mock Peer (Solo Testing Helper) */}
        <button
          onClick={addMockStudyPeer}
          className="hidden lg:flex p-2 rounded-xl bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-cyan-400 border border-pink-200 dark:border-slate-700 hover:scale-105 transition-transform"
          title="Invite Simulated Co-Study Peer"
        >
          <UserPlus className="w-3.5 h-3.5" />
        </button>

        {/* Theme Switcher (Kawaii vs Cyber) */}
        <button
          onClick={() => setTheme(theme === 'kawaii' ? 'cyber' : 'kawaii')}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-pink-200 dark:border-slate-700 hover:scale-105 transition-transform"
          title={theme === 'kawaii' ? 'Switch to Cyber Lofi Theme' : 'Switch to Kawaii Theme'}
        >
          {theme === 'kawaii' ? <Moon className="w-3.5 h-3.5 text-purple-600" /> : <Sun className="w-3.5 h-3.5 text-yellow-400" />}
        </button>

        {/* Mute Audio SFX */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-pink-200 dark:border-slate-700 hover:scale-105 transition-transform"
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
        </button>

        {/* User Profile Customizer Trigger */}
        <button
          onClick={onOpenProfile}
          className="p-2 rounded-xl bg-pink-100 dark:bg-slate-800 text-pink-700 dark:text-cyan-300 border border-pink-300 dark:border-cyan-500/60 hover:scale-105 transition-transform"
          title="Customize Profile & Frame"
        >
          <User className="w-3.5 h-3.5" />
        </button>

        {/* Leave Room Button */}
        <button
          onClick={onLeaveRoom}
          className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 hover:bg-rose-500 hover:text-white transition-colors"
          title="Leave Sanctuary"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
