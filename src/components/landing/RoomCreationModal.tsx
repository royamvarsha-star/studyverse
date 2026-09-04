import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, DoorOpen, Plus, Hash } from 'lucide-react';
import { BackdropId, ThemeMode } from '../../types';
import { BACKDROP_CONFIGS } from '../../context/ThemeContext';
import { audioSynth } from '../../services/audioSynthesizer';

interface RoomCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string, roomName?: string) => void;
}

export const RoomCreationModal: React.FC<RoomCreationModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomName, setRoomName] = useState('Lo-Fi Chill Sanctuary');
  const [themeMode, setThemeMode] = useState<ThemeMode>('kawaii');
  const [backdrop, setBackdrop] = useState<BackdropId>('anime_bedroom');
  const [joinCode, setJoinCode] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoomId = 'room_' + Math.random().toString(36).substring(2, 8);
    audioSynth.playVictoryFanfare();
    onJoinRoom(newRoomId, roomName);
    onClose();
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    audioSynth.playClick();
    onJoinRoom(joinCode.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border-4 border-pink-400 dark:border-cyan-400 rounded-3xl p-6 shadow-2xl max-w-lg w-full"
      >
        <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-pink-500 dark:text-cyan-400" />
            <h3 className="font-pixel text-sm text-pink-600 dark:text-cyan-400 font-bold">
              STUDYVERSE PORTAL
            </h3>
          </div>
          <button onClick={onClose} className="font-pixel text-xs text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setTab('create')}
            className={`py-2 rounded-xl font-pixel text-[10px] flex items-center justify-center gap-1.5 border transition-all ${
              tab === 'create'
                ? 'bg-pink-500 text-white border-pink-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Create Room
          </button>
          <button
            onClick={() => setTab('join')}
            className={`py-2 rounded-xl font-pixel text-[10px] flex items-center justify-center gap-1.5 border transition-all ${
              tab === 'join'
                ? 'bg-pink-500 text-white border-pink-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Hash className="w-3.5 h-3.5" /> Enter Code
          </button>
        </div>

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block font-pixel text-[9px] text-pink-600 dark:text-cyan-400 mb-1">
                ROOM SANCTUARY TITLE:
              </label>
              <input
                type="text"
                required
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Midnight Code Nook"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border-2 border-pink-200 dark:border-slate-700 rounded-xl font-body text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-pink-500 dark:focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block font-pixel text-[9px] text-pink-600 dark:text-cyan-400 mb-1.5">
                STARTING AESTHETIC THEME:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setThemeMode('kawaii')}
                  className={`p-2.5 rounded-xl border-2 text-center font-pixel text-[9px] flex items-center justify-center gap-1.5 ${
                    themeMode === 'kawaii'
                      ? 'bg-pink-200 border-pink-500 text-pink-900 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🌸 Kawaii Pastel
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('cyber')}
                  className={`p-2.5 rounded-xl border-2 text-center font-pixel text-[9px] flex items-center justify-center gap-1.5 ${
                    themeMode === 'cyber'
                      ? 'bg-slate-950 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Cyber Lofi
                </button>
              </div>
            </div>

            <div>
              <label className="block font-pixel text-[9px] text-pink-600 dark:text-cyan-400 mb-1.5">
                CHOOSE BACKDROP:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(BACKDROP_CONFIGS) as BackdropId[])
                  .filter((b) => b !== 'custom')
                  .map((b) => {
                    const cfg = BACKDROP_CONFIGS[b];
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBackdrop(b)}
                        className={`p-2 rounded-xl border-2 text-center text-xs flex flex-col items-center gap-1 ${
                          backdrop === b
                            ? 'bg-pink-100 dark:bg-cyan-950 border-pink-500 dark:border-cyan-400'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="text-xl">{cfg.icon}</span>
                        <span className="font-pixel text-[7px] truncate w-full text-slate-800 dark:text-slate-200">
                          {cfg.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 dark:from-cyan-500 dark:to-blue-600 text-white font-pixel text-xs shadow-pixel-kawaii dark:shadow-pixel-cyber hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Launch Cozy Room 🚀
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block font-pixel text-[9px] text-pink-600 dark:text-cyan-400 mb-1">
                ENTER ROOM CODE OR URL:
              </label>
              <input
                type="text"
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="e.g. room_abc123"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border-2 border-pink-200 dark:border-slate-700 rounded-xl font-mono-retro text-base font-bold text-slate-800 dark:text-white focus:outline-none focus:border-pink-500 dark:focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 dark:from-cyan-500 dark:to-blue-600 text-white font-pixel text-xs shadow-pixel-kawaii dark:shadow-pixel-cyber hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Enter Study Room 🚪
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
