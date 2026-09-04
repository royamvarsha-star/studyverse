import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GUESS_CHARACTERS, CharacterFaceSvg } from '../props/GuessWhoCharacters';
import { AVATAR_FRAMES, AvatarFrameOverlay } from '../props/AvatarFrames';
import { audioSynth } from '../../services/audioSynthesizer';

const BADGE_OPTIONS = [
  'Study Novice 🌱',
  'Focus Apprentice 📖',
  'Master of Study ✨',
  'Pixel Tamer 🐾',
  'Night Owl 🦉',
  'Coffee Addict ☕',
  'Cyber Wizard ⚡',
  'Trivia Champ 🏆',
];

export const ProfileCustomizerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user.name);
  const [avatarId, setAvatarId] = useState(user.avatarId);
  const [frameId, setFrameId] = useState(user.frameId);
  const [badge, setBadge] = useState(user.badge);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: name.trim() || 'StudyScholar',
      avatarId,
      frameId,
      badge,
    });
    audioSynth.playVictoryFanfare();
    onClose();
  };

  const selectedChar = GUESS_CHARACTERS.find((c) => c.id === avatarId) || GUESS_CHARACTERS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border-4 border-pink-400 dark:border-cyan-400 rounded-3xl p-6 shadow-2xl max-w-xl w-full my-auto"
      >
        <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-pink-500 dark:text-cyan-400" />
            <h3 className="font-pixel text-sm text-pink-600 dark:text-cyan-400 font-bold">
              PROFILE & CALLER CUSTOMIZER
            </h3>
          </div>
          <button onClick={onClose} className="font-pixel text-xs text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Live Avatar Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-950 rounded-2xl border border-pink-200 dark:border-slate-700">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-pink-400 dark:border-cyan-400 bg-pink-100 dark:bg-slate-800 flex items-center justify-center shadow-lg mb-2">
              <CharacterFaceSvg character={selectedChar} className="w-20 h-20" />
              <AvatarFrameOverlay frameId={frameId} />
            </div>
            <span className="font-pixel text-xs text-slate-800 dark:text-cyan-300 font-bold">
              {name || 'PixelScholar'}
            </span>
            <span className="text-xs text-pink-600 dark:text-fuchsia-400 font-semibold">{badge}</span>
          </div>

          {/* Username Input */}
          <div>
            <label className="block font-pixel text-[9px] text-pink-600 dark:text-cyan-400 mb-1">
              CALLSIGN / USERNAME:
            </label>
            <input
              type="text"
              required
              maxLength={18}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border-2 border-pink-200 dark:border-slate-700 rounded-xl font-body text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-pink-500 dark:focus:border-cyan-400"
            />
          </div>

          {/* Avatar Character Selection */}
          <div>
            <label className="block font-pixel text-[9px] text-pink-600 dark:text-cyan-400 mb-1.5">
              CHOOSE PIXEL AVATAR (24 OPTIONS):
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-pink-200 dark:border-slate-800">
              {GUESS_CHARACTERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAvatarId(c.id)}
                  className={`p-1 rounded-xl border-2 transition-all flex items-center justify-center ${
                    avatarId === c.id
                      ? 'bg-pink-300 dark:bg-cyan-800 border-pink-600 scale-110'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:scale-105'
                  }`}
                >
                  <CharacterFaceSvg character={c} className="w-9 h-9" />
                </button>
              ))}
            </div>
          </div>

          {/* Decorative Frame Overlays */}
          <div>
            <label className="block font-pixel text-[9px] text-pink-600 dark:text-cyan-400 mb-1.5">
              AVATAR HEADPIECE / FRAME:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {AVATAR_FRAMES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrameId(f.id)}
                  className={`p-2 rounded-xl border text-xs font-body font-semibold text-center truncate transition-all ${
                    frameId === f.id
                      ? 'bg-pink-400 text-white border-pink-600 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-pink-50'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Study Badge Selection */}
          <div>
            <label className="block font-pixel text-[9px] text-pink-600 dark:text-cyan-400 mb-1.5">
              STUDY BADGE TITLE:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {BADGE_OPTIONS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBadge(b)}
                  className={`p-2 rounded-xl border text-xs font-body font-semibold text-left truncate transition-all ${
                    badge === b
                      ? 'bg-purple-500 text-white border-purple-600 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-purple-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Save Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 dark:from-cyan-500 dark:to-blue-600 text-white font-pixel text-xs shadow-pixel-kawaii dark:shadow-pixel-cyber hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Save Profile Customizations ✨
          </button>
        </form>
      </motion.div>
    </div>
  );
};
