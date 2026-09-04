import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Video,
  Radio,
  Sparkles,
  Tv,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { audioSynth } from '../../services/audioSynthesizer';

const CURATED_PLAYLISTS = [
  {
    id: 'jfKfPfyJRdk',
    title: 'Lofi Girl - Relaxing Beats to Study/Chill to ☕',
    tag: 'Lo-Fi Chill',
    category: 'lofi',
  },
  {
    id: '5qap5aO4i9A',
    title: 'Lofi Hip Hop Radio - Beats to Sleep/Study to 🌙',
    tag: 'Sleepy Beats',
    category: 'lofi',
  },
  {
    id: 'DWcJFNfaw9c',
    title: 'Peaceful Piano Studio Ghibli Chill 🍃',
    tag: 'Ghibli Piano',
    category: 'piano',
  },
  {
    id: '4xDzrJKXOOY',
    title: 'Synthwave Radio - Chill Synth / Retro Beats ⚡',
    tag: 'Cyber Synth',
    category: 'synth',
  },
  {
    id: 'lTRiuFIWV54',
    title: 'Cozy Coffee Shop Ambience with Soft Jazz 🎷',
    tag: 'Cafe Jazz',
    category: 'jazz',
  },
  {
    id: 'W6YI3ZFOL0A',
    title: 'Tokyo Rain & Aesthetic Lofi Chill Beats 🌧️',
    tag: 'Rainy Lofi',
    category: 'ambient',
  },
  {
    id: 'Dx5qFachd3A',
    title: 'Minecraft Relaxing Chill & Lofi Study Beats 🌿',
    tag: 'Gaming Chill',
    category: 'gaming',
  },
];

export const YouTubePlayer: React.FC = () => {
  const { roomState, updateYouTube } = useSocket();
  const { youtube } = roomState;

  const [inputUrl, setInputUrl] = useState('');
  const [displayMode, setDisplayMode] = useState<'video' | 'audio'>(() => {
    return (youtube.displayMode as 'video' | 'audio') || 'video';
  });
  const [isFloating, setIsFloating] = useState(false);

  const extractVideoId = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    // Raw 11-char ID
    if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) {
      return trimmed;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);
    return match && match[2].length === 11 ? match[2] : trimmed;
  };

  const handleSetCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(inputUrl);
    if (id) {
      updateYouTube({
        videoId: id,
        videoTitle: 'Custom Study Stream 🎵',
        isPlaying: true,
        currentTime: 0,
        lastSyncTimestamp: Date.now(),
        displayMode,
      });
      setInputUrl('');
      audioSynth.playVictoryFanfare();
    }
  };

  const handleSelectCurated = (track: (typeof CURATED_PLAYLISTS)[0]) => {
    updateYouTube({
      videoId: track.id,
      videoTitle: track.title,
      isPlaying: true,
      currentTime: 0,
      lastSyncTimestamp: Date.now(),
      displayMode,
    });
    audioSynth.playClick();
  };

  const handleTogglePlay = () => {
    audioSynth.playClick();
    updateYouTube({
      isPlaying: !youtube.isPlaying,
      lastSyncTimestamp: Date.now(),
    });
  };

  const handleToggleDisplayMode = (mode: 'video' | 'audio') => {
    setDisplayMode(mode);
    updateYouTube({ displayMode: mode });
    audioSynth.playClick();
  };

  const activeVideoId = youtube.videoId || 'jfKfPfyJRdk';

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border-3 border-pink-400 dark:border-cyan-400 p-3.5 sm:p-4 shadow-pixel-kawaii dark:shadow-pixel-cyber w-full max-w-sm flex flex-col">
      {/* Header with Mode Toggles */}
      <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-1.5 font-pixel text-xs text-pink-600 dark:text-cyan-400">
          <Tv className="w-4 h-4 text-pink-500 dark:text-cyan-400 animate-bounce-soft" />
          <span>YOUTUBE LO-FI</span>
        </div>

        {/* View Mode Toggle Switcher: Mini Video Player vs Audio Only */}
        <div className="flex items-center gap-1 bg-pink-100/70 dark:bg-slate-800 p-1 rounded-xl border border-pink-200 dark:border-slate-700">
          <button
            onClick={() => handleToggleDisplayMode('video')}
            className={`px-2 py-1 rounded-lg font-pixel text-[7.5px] sm:text-[8px] flex items-center gap-1 transition-all ${
              displayMode === 'video'
                ? 'bg-pink-500 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-pink-600'
            }`}
            title="Show visible 16:9 responsive video player"
          >
            <Video className="w-3 h-3" />
            <span>Video</span>
          </button>
          <button
            onClick={() => handleToggleDisplayMode('audio')}
            className={`px-2 py-1 rounded-lg font-pixel text-[7.5px] sm:text-[8px] flex items-center gap-1 transition-all ${
              displayMode === 'audio'
                ? 'bg-pink-500 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-pink-600'
            }`}
            title="Compact audio only / background mode"
          >
            <Radio className="w-3 h-3" />
            <span>Audio</span>
          </button>
        </div>
      </div>

      {/* 16:9 Responsive Video Window (Visible in Video Mode) */}
      <AnimatePresence>
        {displayMode === 'video' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-xl border-2 border-pink-300 dark:border-cyan-500/60 mb-3 bg-black shadow-md relative group"
          >
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              <iframe
                key={activeVideoId}
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=${
                  youtube.isPlaying ? '1' : '0'
                }&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&rel=0&modestbranding=1`}
                title="StudyVerse YouTube Live Stream"
                width="100%"
                height="100%"
                className="w-full h-full border-0 absolute inset-0 object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Audio Stream Frame when in Audio Only Mode */}
      {displayMode === 'audio' && (
        <div className="hidden" aria-hidden="true">
          <iframe
            key={activeVideoId + '_audio'}
            src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=${
              youtube.isPlaying ? '1' : '0'
            }&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
            title="Background Audio Stream"
            width="1"
            height="1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          />
        </div>
      )}

      {/* Now Playing Bar & Media Controls */}
      <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-950 rounded-xl border border-pink-200 dark:border-slate-700 mb-3 shadow-sm">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-pink-400 dark:bg-cyan-500 flex items-center justify-center text-white shrink-0 shadow-sm relative">
            <Radio className="w-4 h-4" />
            {youtube.isPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="font-pixel text-[8.5px] sm:text-[9px] text-slate-800 dark:text-cyan-300 truncate font-semibold">
              {youtube.videoTitle || 'Lo-Fi Study Beats'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Synced Room
              </span>
              {youtube.isPlaying && (
                <div className="flex items-center gap-0.5 h-2.5">
                  <span className="w-0.5 h-full bg-pink-500 dark:bg-cyan-400 rounded-full animate-pulse" />
                  <span
                    className="w-0.5 h-2/3 bg-pink-500 dark:bg-cyan-400 rounded-full animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="w-0.5 h-full bg-pink-500 dark:bg-cyan-400 rounded-full animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleTogglePlay}
          className="p-2 rounded-xl bg-pink-500 dark:bg-cyan-500 text-white hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-sm"
          title={youtube.isPlaying ? 'Pause Study Stream' : 'Play Study Stream'}
        >
          {youtube.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
        </button>
      </div>

      {/* Curated Study Radio Stations */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[7.5px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Curated Study Stations:
          </span>
          <span className="font-pixel text-[7px] text-pink-600 dark:text-cyan-400">
            {CURATED_PLAYLISTS.length} channels
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
          {CURATED_PLAYLISTS.map((pl) => (
            <button
              key={pl.id}
              onClick={() => handleSelectCurated(pl)}
              className={`p-1.5 rounded-xl border text-left font-body text-xs font-semibold truncate transition-all ${
                activeVideoId === pl.id
                  ? 'bg-pink-200 dark:bg-cyan-950 border-pink-500 dark:border-cyan-400 text-pink-950 dark:text-cyan-100 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-pink-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="font-pixel text-[7.5px] text-pink-600 dark:text-cyan-400 truncate flex items-center gap-1">
                <span>{pl.tag}</span>
                {activeVideoId === pl.id && <span className="text-[9px]">🎧</span>}
              </div>
              <div className="truncate text-[10px] opacity-80">{pl.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom YouTube URL / Search Input */}
      <form onSubmit={handleSetCustomVideo} className="flex gap-1.5 pt-1 border-t border-pink-100 dark:border-slate-800">
        <input
          type="text"
          placeholder="Paste YouTube Link or Video ID..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-pink-200 dark:border-slate-700 rounded-xl text-xs font-body focus:outline-none focus:border-pink-500 dark:focus:border-cyan-400"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-pink-500 dark:bg-cyan-500 text-white rounded-xl font-pixel text-[8px] hover:scale-105 active:scale-95 transition-transform shrink-0"
        >
          Load
        </button>
      </form>
    </div>
  );
};
