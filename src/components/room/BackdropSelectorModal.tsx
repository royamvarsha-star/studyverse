import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BackdropId } from '../../types';
import { useTheme, BACKDROP_CONFIGS } from '../../context/ThemeContext';
import { Image, Volume2, Sparkles } from 'lucide-react';

export const BackdropSelectorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { backdrop, setBackdrop, customBackdropUrl, setCustomBackdropUrl, ambientSound, setAmbientSound } = useTheme();
  const [urlInput, setUrlInput] = useState(customBackdropUrl);

  if (!isOpen) return null;

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setCustomBackdropUrl(urlInput.trim());
      setBackdrop('custom');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border-4 border-pink-400 dark:border-cyan-400 rounded-3xl p-6 shadow-2xl max-w-xl w-full"
      >
        <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-pink-500 dark:text-cyan-400" />
            <h3 className="font-pixel text-sm text-pink-600 dark:text-cyan-400 font-bold">
              ROOM BACKDROPS & AMBIENCE
            </h3>
          </div>
          <button onClick={onClose} className="font-pixel text-xs text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        {/* Ambient Sound Generators Selection */}
        <div className="mb-4 bg-pink-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-pink-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 font-pixel text-[9px] text-pink-600 dark:text-cyan-400 mb-2">
            <Volume2 className="w-3.5 h-3.5" />
            <span>AMBIENT SOUNDSCAPE GENERATOR:</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'off', label: 'Mute Off', icon: '🔇' },
              { id: 'rain', label: 'Rain Drizzle', icon: '🌧️' },
              { id: 'cafe', label: 'Cafe Chatter', icon: '☕' },
              { id: 'fire', label: 'Fire Crackle', icon: '🔥' },
              { id: 'lofi', label: 'Vinyl Hiss', icon: '📻' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => setAmbientSound(snd.id as any)}
                className={`p-2 rounded-xl border text-center font-body text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  ambientSound === snd.id
                    ? 'bg-pink-400 text-white border-pink-500 shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-pink-100 dark:border-slate-600 hover:bg-pink-100'
                }`}
              >
                <span className="text-base">{snd.icon}</span>
                <span className="text-[9px] truncate w-full">{snd.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Curated Aesthetic Backdrops */}
        <div className="space-y-2 mb-4">
          <span className="font-pixel text-[9px] text-slate-500 uppercase block">
            Select Room Backdrop:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {(Object.keys(BACKDROP_CONFIGS) as BackdropId[])
              .filter((id) => id !== 'custom')
              .map((id) => {
                const config = BACKDROP_CONFIGS[id];
                const isSelected = backdrop === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setBackdrop(id);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-pink-100 dark:bg-cyan-950 border-pink-500 dark:border-cyan-400 shadow-md scale-105'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-pink-300'
                    }`}
                  >
                    <span className="text-2xl mb-1">{config.icon}</span>
                    <span className="font-pixel text-[9px] text-slate-800 dark:text-slate-200">
                      {config.name}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Custom Image URL Form */}
        <form onSubmit={handleApplyCustomUrl} className="space-y-1.5 pt-2 border-t border-pink-100 dark:border-slate-800">
          <span className="font-pixel text-[8px] text-slate-500 uppercase">
            Or Use Custom Image / GIF URL:
          </span>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/aesthetic-room.gif"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-body focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-pink-500 dark:bg-cyan-500 text-white rounded-xl font-pixel text-[9px] hover:scale-105 transition-transform"
            >
              Apply
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
