import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Music2, Sparkles } from 'lucide-react';
import { YouTubePlayer } from './YouTubePlayer';
import { SpotifyPlayer } from './SpotifyPlayer';
import { useSocket } from '../../context/SocketContext';
import { MusicSource } from '../../types';

export const MusicLoungeWidget: React.FC = () => {
  const { roomState, setActiveMusicSource } = useSocket();
  const activeSource: MusicSource = roomState.activeMusicSource || 'youtube';

  const handleSelectSource = (src: MusicSource) => {
    setActiveMusicSource(src);
  };

  return (
    <div className="w-full max-w-sm flex flex-col">
      {/* Source Selector Tab Pill */}
      <div className="flex items-center gap-1.5 p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border-2 border-pink-300 dark:border-cyan-500/50 mb-2 shadow-sm">
        <button
          onClick={() => handleSelectSource('youtube')}
          className={`flex-1 py-1.5 rounded-xl font-pixel text-[8px] sm:text-[8.5px] flex items-center justify-center gap-1.5 transition-all ${
            activeSource === 'youtube'
              ? 'bg-pink-500 text-white shadow-md font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-pink-100/50 dark:hover:bg-slate-800'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>YouTube Lo-Fi</span>
        </button>

        <button
          onClick={() => handleSelectSource('spotify')}
          className={`flex-1 py-1.5 rounded-xl font-pixel text-[8px] sm:text-[8.5px] flex items-center justify-center gap-1.5 transition-all ${
            activeSource === 'spotify'
              ? 'bg-emerald-500 text-white shadow-md font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-slate-800'
          }`}
        >
          <Music2 className="w-3.5 h-3.5" />
          <span>Spotify Player</span>
        </button>
      </div>

      {/* Render Active Music Player */}
      <AnimatePresence mode="wait">
        {activeSource === 'youtube' ? (
          <motion.div
            key="youtube"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <YouTubePlayer />
          </motion.div>
        ) : (
          <motion.div
            key="spotify"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <SpotifyPlayer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
