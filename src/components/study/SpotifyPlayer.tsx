import React, { useState } from 'react';
import { Music2, Sparkles, Radio, Check } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { audioSynth } from '../../services/audioSynthesizer';

const CURATED_SPOTIFY_PRESETS = [
  {
    title: 'Lo-Fi Beats (Official Spotify)',
    type: 'playlist' as const,
    id: '37i9dQZF1DXdLEN7aqioXM',
    tag: 'Lo-Fi Beats',
    icon: '🌸',
    desc: 'Beats to relax, study, and vibe to',
  },
  {
    title: 'Peaceful Piano Chill',
    type: 'playlist' as const,
    id: '37i9dQZF1DX4sWSpwq3LiO',
    tag: 'Peaceful Piano',
    icon: '🎹',
    desc: 'Beautiful, calming piano solos for concentration',
  },
  {
    title: 'Aesthetic Anime Chill & Lo-Fi',
    type: 'playlist' as const,
    id: '37i9dQZF1DX6XceWZP1m6P',
    tag: 'Anime Chill',
    icon: '🎌',
    desc: 'Nostalgic anime & Ghibli study vibes',
  },
  {
    title: 'Coffee Table Jazz',
    type: 'playlist' as const,
    id: '37i9dQZF1DX6fK11ZqL2sY',
    tag: 'Coffee Jazz',
    icon: '☕',
    desc: 'Smooth background jazz for a warm study session',
  },
  {
    title: 'Deep Focus Ambient Atmosphere',
    type: 'playlist' as const,
    id: '37i9dQZF1DWZeKCadgRdKQ',
    tag: 'Deep Focus',
    icon: '🧠',
    desc: 'Atmospheric ambient soundscapes for deep flow state',
  },
  {
    title: 'Chill Synthwave Retrowave',
    type: 'playlist' as const,
    id: '37i9dQZF1DXd9rSDyQguIk',
    tag: 'Cyber Synth',
    icon: '⚡',
    desc: 'Retro futuristic neon vibes for night coding',
  },
];

export const SpotifyPlayer: React.FC = () => {
  const { roomState, updateSpotify } = useSocket();
  const spotify = roomState.spotify || {
    uriOrUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    title: 'Lo-Fi Beats (Official Spotify)',
    embedType: 'playlist',
    embedId: '37i9dQZF1DXdLEN7aqioXM',
    viewMode: 'compact',
    lastSyncTimestamp: Date.now(),
  };

  const [inputUrl, setInputUrl] = useState('');
  const [viewMode, setViewMode] = useState<'compact' | 'full'>(spotify.viewMode || 'compact');

  const parseSpotifyUrl = (input: string): { embedType: 'playlist' | 'track' | 'album'; embedId: string } | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Spotify URI format: spotify:playlist:37i9dQZF1DXdLEN7aqioXM
    if (trimmed.startsWith('spotify:')) {
      const parts = trimmed.split(':');
      if (parts.length >= 3) {
        const type = parts[1] as 'playlist' | 'track' | 'album';
        const id = parts[2];
        return { embedType: type, embedId: id };
      }
    }

    // Standard Spotify Web URLs: https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM?si=...
    try {
      const url = new URL(trimmed);
      const pathname = url.pathname; // e.g. /playlist/37i9dQZF1DXdLEN7aqioXM
      const segments = pathname.split('/').filter(Boolean);

      if (segments.length >= 2) {
        const type = segments[0] as 'playlist' | 'track' | 'album';
        const id = segments[1];
        if (['playlist', 'track', 'album', 'artist', 'episode'].includes(type) && id) {
          return { embedType: (type === 'artist' || type === 'episode' ? 'playlist' : type), embedId: id };
        }
      }
    } catch {
      // If user pasted raw ID
      if (trimmed.length >= 15 && !trimmed.includes('/')) {
        return { embedType: 'playlist', embedId: trimmed };
      }
    }

    return null;
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseSpotifyUrl(inputUrl);
    if (parsed) {
      updateSpotify({
        uriOrUrl: inputUrl.trim(),
        title: 'Custom Spotify Collection 🎧',
        embedType: parsed.embedType,
        embedId: parsed.embedId,
        viewMode,
        lastSyncTimestamp: Date.now(),
      });
      setInputUrl('');
      audioSynth.playVictoryFanfare();
    } else {
      audioSynth.playBuzz();
    }
  };

  const handleSelectPreset = (preset: (typeof CURATED_SPOTIFY_PRESETS)[0]) => {
    updateSpotify({
      uriOrUrl: `https://open.spotify.com/${preset.type}/${preset.id}`,
      title: preset.title,
      embedType: preset.type,
      embedId: preset.id,
      viewMode,
      lastSyncTimestamp: Date.now(),
    });
    audioSynth.playClick();
  };

  const handleToggleViewMode = (mode: 'compact' | 'full') => {
    setViewMode(mode);
    updateSpotify({ viewMode: mode });
    audioSynth.playClick();
  };

  const activeEmbedId = spotify.embedId || '37i9dQZF1DXdLEN7aqioXM';
  const activeEmbedType = spotify.embedType || 'playlist';
  const embedUrl = `https://open.spotify.com/embed/${activeEmbedType}/${activeEmbedId}?utm_source=generator&theme=0`;

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border-3 border-emerald-400 dark:border-emerald-500 p-3.5 sm:p-4 shadow-pixel-kawaii dark:shadow-pixel-cyber w-full max-w-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-emerald-200 dark:border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-1.5 font-pixel text-xs text-emerald-600 dark:text-emerald-400 font-bold">
          <Music2 className="w-4 h-4 text-emerald-500 animate-bounce-soft" />
          <span>SPOTIFY PLAYER</span>
        </div>

        {/* View Mode Switcher: Compact (152px) vs Full (352px) */}
        <div className="flex items-center gap-1 bg-emerald-100/70 dark:bg-slate-800 p-1 rounded-xl border border-emerald-200 dark:border-slate-700">
          <button
            onClick={() => handleToggleViewMode('compact')}
            className={`px-2 py-1 rounded-lg font-pixel text-[7.5px] sm:text-[8px] transition-all ${
              viewMode === 'compact'
                ? 'bg-emerald-500 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
            }`}
            title="Compact mini player (152px)"
          >
            Compact
          </button>
          <button
            onClick={() => handleToggleViewMode('full')}
            className={`px-2 py-1 rounded-lg font-pixel text-[7.5px] sm:text-[8px] transition-all ${
              viewMode === 'full'
                ? 'bg-emerald-500 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
            }`}
            title="Full playlist view (352px)"
          >
            Full List
          </button>
        </div>
      </div>

      {/* Spotify Embedded IFrame Player with Glow Wrapper */}
      <div className="overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-500/80 mb-3 bg-[#121212] shadow-lg relative group">
        <iframe
          key={`${activeEmbedType}_${activeEmbedId}_${viewMode}`}
          src={embedUrl}
          title="StudyVerse Spotify Embedded Player"
          width="100%"
          height={viewMode === 'full' ? '352' : '152'}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="w-full rounded-2xl transition-all duration-300"
        />
      </div>

      {/* Synced Room Status Pill */}
      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-emerald-950/40 rounded-xl border border-emerald-200 dark:border-slate-700 mb-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-emerald-500 text-base">🎧</span>
          <div className="overflow-hidden">
            <span className="font-pixel text-[8px] sm:text-[8.5px] text-emerald-800 dark:text-emerald-300 truncate block font-bold">
              {spotify.title || 'Lo-Fi Beats (Official Spotify)'}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Synced across room members
            </span>
          </div>
        </div>
      </div>

      {/* Curated Spotify Presets List */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[7.5px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Curated Study Playlists:
          </span>
          <span className="font-pixel text-[7px] text-emerald-600 dark:text-emerald-400">
            {CURATED_SPOTIFY_PRESETS.length} presets
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
          {CURATED_SPOTIFY_PRESETS.map((preset) => {
            const isSelected = activeEmbedId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-1.5 rounded-xl border text-left font-body text-xs font-semibold truncate transition-all ${
                  isSelected
                    ? 'bg-emerald-100 dark:bg-emerald-950/90 border-emerald-500 dark:border-emerald-400 text-emerald-950 dark:text-emerald-100 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
                }`}
              >
                <div className="font-pixel text-[7.5px] text-emerald-700 dark:text-emerald-300 truncate flex items-center gap-1">
                  <span>{preset.icon}</span>
                  <span>{preset.tag}</span>
                </div>
                <div className="truncate text-[10px] opacity-80">{preset.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Spotify URL Input Form */}
      <form onSubmit={handleApplyCustomUrl} className="flex gap-1.5 pt-1 border-t border-emerald-100 dark:border-slate-800">
        <input
          type="text"
          placeholder="Paste Spotify Playlist / Track / Album URL..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-emerald-200 dark:border-slate-700 rounded-xl text-xs font-body focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-pixel text-[8px] hover:scale-105 active:scale-95 transition-transform shrink-0"
        >
          Load
        </button>
      </form>
    </div>
  );
};
