import React, { createContext, useContext, useState, useEffect } from 'react';
import { BackdropId, ThemeMode } from '../types';
import { audioSynth } from '../services/audioSynthesizer';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  backdrop: BackdropId;
  setBackdrop: (backdrop: BackdropId) => void;
  customBackdropUrl: string;
  setCustomBackdropUrl: (url: string) => void;
  ambientSound: 'rain' | 'cafe' | 'fire' | 'lofi' | 'off';
  setAmbientSound: (sound: 'rain' | 'cafe' | 'fire' | 'lofi' | 'off') => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const BACKDROP_CONFIGS: Record<BackdropId, { name: string; icon: string; previewColor: string; bgStyle: string }> = {
  anime_bedroom: {
    name: 'Cozy Anime Bedroom',
    icon: '🛏️',
    previewColor: '#fbcfe8',
    bgStyle: 'bg-gradient-to-br from-pink-100 via-purple-100 to-rose-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900',
  },
  rainy_cafe: {
    name: 'Rainy Cafe Corner',
    icon: '☕',
    previewColor: '#93c5fd',
    bgStyle: 'bg-gradient-to-br from-blue-100 via-indigo-100 to-slate-200 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900',
  },
  midnight_library: {
    name: 'Midnight Library',
    icon: '📚',
    previewColor: '#c4b5fd',
    bgStyle: 'bg-gradient-to-br from-violet-100 via-indigo-50 to-amber-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950',
  },
  kawaii_bakery: {
    name: 'Kawaii Bakery',
    icon: '🍰',
    previewColor: '#fed7aa',
    bgStyle: 'bg-gradient-to-br from-amber-100 via-pink-100 to-yellow-50 dark:from-amber-950 dark:via-slate-900 dark:to-rose-950',
  },
  cyberpunk_room: {
    name: 'Pixel Cyberpunk Lair',
    icon: '🌃',
    previewColor: '#67e8f9',
    bgStyle: 'bg-gradient-to-br from-cyan-950 via-slate-950 to-fuchsia-950 dark:from-black dark:via-cyan-950 dark:to-fuchsia-950',
  },
  lofi_desk: {
    name: 'Lo-fi Study Desk',
    icon: '🎧',
    previewColor: '#e9d5ff',
    bgStyle: 'bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-950 dark:to-purple-950',
  },
  custom: {
    name: 'Custom Backdrop URL',
    icon: '🖼️',
    previewColor: '#cbd5e1',
    bgStyle: 'bg-slate-900',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('studyverse_theme') as ThemeMode) || 'kawaii';
  });

  const [backdrop, setBackdropState] = useState<BackdropId>(() => {
    return (localStorage.getItem('studyverse_backdrop') as BackdropId) || 'anime_bedroom';
  });

  const [customBackdropUrl, setCustomBackdropUrlState] = useState<string>(() => {
    return localStorage.getItem('studyverse_custom_backdrop') || '';
  });

  const [ambientSound, setAmbientSoundState] = useState<'rain' | 'cafe' | 'fire' | 'lofi' | 'off'>('off');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('studyverse_theme', theme);
    const root = document.documentElement;
    if (theme === 'cyber') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('studyverse_backdrop', backdrop);
  }, [backdrop]);

  useEffect(() => {
    localStorage.setItem('studyverse_custom_backdrop', customBackdropUrl);
  }, [customBackdropUrl]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    audioSynth.playClick();
  };

  const setBackdrop = (newBackdrop: BackdropId) => {
    setBackdropState(newBackdrop);
    audioSynth.playClick();
  };

  const setCustomBackdropUrl = (url: string) => {
    setCustomBackdropUrlState(url);
  };

  const setAmbientSound = (sound: 'rain' | 'cafe' | 'fire' | 'lofi' | 'off') => {
    setAmbientSoundState(sound);
    audioSynth.startAmbientSound(sound);
    audioSynth.playClick();
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioSynth.setMuted(nextMuted);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        backdrop,
        setBackdrop,
        customBackdropUrl,
        setCustomBackdropUrl,
        ambientSound,
        setAmbientSound,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
