import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { audioSynth } from '../services/audioSynthesizer';

interface AuthContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  addStudyMinutes: (minutes: number) => void;
  incrementPomodoros: () => void;
  incrementPetsEvolved: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'guest_' + Math.random().toString(36).substring(2, 8),
  name: 'PixelScholar',
  avatarId: 'char_1',
  frameId: 'cat_ears',
  badge: 'Study Novice 🌱',
  studyMinutes: 45,
  pomodorosCompleted: 2,
  petsEvolved: 1,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('studyverse_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_USER;
  });

  useEffect(() => {
    localStorage.setItem('studyverse_user', JSON.stringify(user));
  }, [user]);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    audioSynth.playClick();
  };

  const addStudyMinutes = (minutes: number) => {
    setUser((prev) => {
      const newMinutes = prev.studyMinutes + minutes;
      let newBadge = prev.badge;
      if (newMinutes >= 120 && prev.badge === 'Study Novice 🌱') {
        newBadge = 'Focus Apprentice 📖';
        audioSynth.playVictoryFanfare();
      } else if (newMinutes >= 300) {
        newBadge = 'Master of Study ✨';
      }
      return {
        ...prev,
        studyMinutes: newMinutes,
        badge: newBadge,
      };
    });
  };

  const incrementPomodoros = () => {
    setUser((prev) => ({
      ...prev,
      pomodorosCompleted: prev.pomodorosCompleted + 1,
    }));
  };

  const incrementPetsEvolved = () => {
    setUser((prev) => ({
      ...prev,
      petsEvolved: prev.petsEvolved + 1,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUser,
        addStudyMinutes,
        incrementPomodoros,
        incrementPetsEvolved,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
