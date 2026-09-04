import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gamepad2, Heart, Music, Clock, Video, Palette, Trophy, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PixelPetSprite } from '../props/PixelPetSprites';
import { CharacterFaceSvg, GUESS_CHARACTERS } from '../props/GuessWhoCharacters';
import { AvatarFrameOverlay } from '../props/AvatarFrames';
import { audioSynth } from '../../services/audioSynthesizer';

interface LandingHeroProps {
  onOpenCreateModal: () => void;
  onOpenProfileModal: () => void;
  onQuickJoin: (roomId: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenCreateModal,
  onOpenProfileModal,
  onQuickJoin,
}) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const userChar = GUESS_CHARACTERS.find((c) => c.id === user.avatarId) || GUESS_CHARACTERS[0];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between px-4 py-8 overflow-hidden">
      {/* Background Decor Ambient Elements */}
      <div className="absolute inset-0 scanlines-overlay opacity-30 pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full max-w-6xl flex items-center justify-between py-3 px-4 bg-white/75 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border-2 border-pink-300 dark:border-cyan-500/50 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-400 dark:bg-cyan-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-pixel text-xs sm:text-sm text-pink-600 dark:text-cyan-400 font-bold tracking-tight">
              STUDYVERSE ✨
            </h1>
            <span className="font-pixel text-[7px] text-slate-500 dark:text-slate-400">
              AESTHETIC VIRTUAL CO-STUDY SANCTUARY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile Capsule */}
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-100 dark:bg-slate-800 border border-pink-300 dark:border-cyan-500/50 hover:scale-105 transition-transform"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-pink-400 flex items-center justify-center">
              <CharacterFaceSvg character={userChar} className="w-5 h-5" />
              <AvatarFrameOverlay frameId={user.frameId} />
            </div>
            <span className="font-pixel text-[8px] text-slate-800 dark:text-cyan-300 hidden sm:inline">
              {user.name}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'kawaii' ? 'cyber' : 'kawaii')}
            className="px-3 py-1.5 rounded-xl bg-pink-500 dark:bg-cyan-500 text-white font-pixel text-[8px] hover:scale-105 transition-transform"
          >
            {theme === 'kawaii' ? '⚡ Cyber Mode' : '🌸 Kawaii Mode'}
          </button>
        </div>
      </header>

      {/* Main Hero Banner */}
      <main className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center my-auto py-8">
        {/* Animated Pixel Mascot Header */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="relative mb-3 flex items-center justify-center gap-4"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg">
            <PixelPetSprite species="cat" stage={2} />
          </div>
          <div className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-lg">
            <PixelPetSprite species="dragon" stage={3} />
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg">
            <PixelPetSprite species="bunny" stage={2} />
          </div>
        </motion.div>

        {/* Hero Title with authentic retro drop-shadows */}
        <h2 className="font-pixel text-2xl sm:text-4xl md:text-5xl text-pink-600 dark:text-cyan-400 pixel-shadow-pink dark:pixel-shadow-cyan tracking-tight mb-4 leading-tight">
          STUDY. HANGOUT. EVOLVE.
        </h2>

        <p className="font-body text-slate-700 dark:text-slate-300 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed font-semibold">
          Step into your cozy pixel sanctuary featuring real-time draggable video avatars, synchronized Pomodoro timers, Lo-Fi radio sync, growing virtual companions, and 6 multiplayer mini-games!
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={() => onQuickJoin('lofi-lounge')}
            className="pixel-button-kawaii dark:pixel-button-cyber text-xs sm:text-sm px-6 py-3.5 shadow-pixel-kawaii dark:shadow-pixel-cyber"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enter Study Sanctuary</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="font-pixel text-xs sm:text-sm px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-3 border-pink-400 dark:border-cyan-400 shadow-md hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-pink-500 dark:text-cyan-400" />
            <span>Create Custom Room</span>
          </button>

          <button
            onClick={onOpenProfileModal}
            className="font-pixel text-xs px-5 py-3.5 rounded-xl bg-pink-100 dark:bg-slate-800 text-pink-700 dark:text-cyan-300 border-2 border-pink-300 dark:border-slate-700 hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            <span>Customize Avatar</span>
          </button>
        </div>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full text-left">
          {/* Card 1: Video & WebRTC */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border-2 border-pink-300 dark:border-cyan-500/50 shadow-sm hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-slate-800 flex items-center justify-center text-pink-500 dark:text-cyan-400 mb-3">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-pixel text-xs text-pink-600 dark:text-cyan-400 font-bold mb-1.5">
              Draggable Video Bubbles
            </h3>
            <p className="font-body text-xs text-slate-600 dark:text-slate-300 font-medium">
              Real-time WebRTC audio/video feeds rendered in floating circular bubbles with customizable frames (Cat ears, Halo, Cyber neon).
            </p>
          </div>

          {/* Card 2: Virtual Pet System */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border-2 border-pink-300 dark:border-cyan-500/50 shadow-sm hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-slate-800 flex items-center justify-center text-purple-500 dark:text-fuchsia-400 mb-3">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-pixel text-xs text-purple-600 dark:text-fuchsia-400 font-bold mb-1.5">
              Growing Pixel Companion
            </h3>
            <p className="font-body text-xs text-slate-600 dark:text-slate-300 font-medium">
              Evolve your cute pixel pet through 4 stages with bouncy squash-and-stretch feeding animations and study XP rewards.
            </p>
          </div>

          {/* Card 3: 6 Mini Games */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border-2 border-pink-300 dark:border-cyan-500/50 shadow-sm hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-slate-800 flex items-center justify-center text-amber-500 mb-3">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h3 className="font-pixel text-xs text-amber-600 dark:text-amber-400 font-bold mb-1.5">
              6 In-Room Mini-Games
            </h3>
            <p className="font-body text-xs text-slate-600 dark:text-slate-300 font-medium">
              Play Guess the Person, Word Finder Race, Tic-Tac-Toe, Connect Four, Study Flashcard Quiz, and Whiteboard Doodles!
            </p>
          </div>

          {/* Card 4: Synced Pomodoro */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border-2 border-pink-300 dark:border-cyan-500/50 shadow-sm hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-slate-800 flex items-center justify-center text-rose-500 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-pixel text-xs text-rose-600 dark:text-rose-400 font-bold mb-1.5">
              Synced Pomodoro Timer
            </h3>
            <p className="font-body text-xs text-slate-600 dark:text-slate-300 font-medium">
              Synchronized 25/5 intervals, customized study durations, chime audio notifications, and streak celebrations.
            </p>
          </div>

          {/* Card 5: Lo-Fi Radio */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border-2 border-pink-300 dark:border-cyan-500/50 shadow-sm hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-slate-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3">
              <Music className="w-5 h-5" />
            </div>
            <h3 className="font-pixel text-xs text-cyan-600 dark:text-cyan-400 font-bold mb-1.5">
              YouTube & Spotify Sync
            </h3>
            <p className="font-body text-xs text-slate-600 dark:text-slate-300 font-medium">
              Curated Lo-Fi video stream stations, 16:9 video / audio-only modes, and full Spotify playlist embeds synced across all room members.
            </p>
          </div>

          {/* Card 6: Room Decorator */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border-2 border-pink-300 dark:border-cyan-500/50 shadow-sm hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 mb-3">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="font-pixel text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1.5">
              Room Decorator Mode
            </h3>
            <p className="font-body text-xs text-slate-600 dark:text-slate-300 font-medium">
              Place, drag, rotate, and customize fairy lights, ramen bowls, succulent desk plants, and cute polaroids.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl text-center py-4 border-t border-pink-200 dark:border-slate-800 text-xs font-pixel text-slate-500 dark:text-slate-400">
        ✨ StudyVerse • Built with Cute Pixel Art, WebRTC, Socket.io & Web Audio Engine ✨
      </footer>
    </div>
  );
};
