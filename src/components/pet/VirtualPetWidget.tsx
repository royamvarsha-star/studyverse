import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Moon, Sun, Sparkles, ChevronRight, Utensils } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { PixelPetSprite, PixelSnackIcon } from '../props/PixelPetSprites';
import { PetSpecies } from '../../types';

const STAGE_NAMES = ['Pixel Egg 🥚', 'Baby Companion 🍼', 'Juvenile Explorer 🎒', 'Full Companion 👑'];

const SPECIES_OPTIONS: { id: PetSpecies; name: string; emoji: string }[] = [
  { id: 'cat', name: 'Calico Cat', emoji: '🐱' },
  { id: 'shiba', name: 'Shiba Inu', emoji: '🐕' },
  { id: 'bunny', name: 'Lop Bunny', emoji: '🐰' },
  { id: 'dragon', name: 'Baby Dragon', emoji: '🐲' },
  { id: 'panda', name: 'Red Panda', emoji: '🦊' },
];

export const VirtualPetWidget: React.FC = () => {
  const { roomState, feedPet, petThePet, togglePetSleep, updatePet } = useSocket();
  const { pet } = roomState;

  const [isFeedingAnim, setIsFeedingAnim] = useState(false);
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
  const [selectedSnack, setSelectedSnack] = useState<'strawberry' | 'boba' | 'donut' | 'fish' | 'cookie'>('strawberry');
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

  const handleFeed = () => {
    setIsFeedingAnim(true);
    // Add floating hearts
    const heartId = Date.now();
    setFloatingHearts((prev) => [...prev, { id: heartId, x: Math.random() * 60 - 30 }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1500);

    feedPet();
    setTimeout(() => setIsFeedingAnim(false), 800);
  };

  const handlePet = () => {
    const heartId = Date.now();
    setFloatingHearts((prev) => [...prev, { id: heartId, x: Math.random() * 60 - 30 }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1500);
    petThePet();
  };

  const handleSelectSpecies = (species: PetSpecies) => {
    updatePet({ species });
    setShowSpeciesPicker(false);
  };

  return (
    <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border-3 border-pink-400 dark:border-cyan-400 p-4 shadow-pixel-kawaii dark:shadow-pixel-cyber w-full max-w-sm">
      {/* Header with Pet Name and Level Stage */}
      <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <div>
            <h3 className="font-pixel text-xs text-pink-600 dark:text-cyan-400 font-bold">
              {pet.name}
            </h3>
            <span className="font-pixel text-[8px] text-slate-500 dark:text-slate-400">
              {STAGE_NAMES[pet.stage]}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowSpeciesPicker(!showSpeciesPicker)}
          className="px-2 py-1 rounded bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-cyan-400 font-pixel text-[8px] border border-pink-300 dark:border-cyan-500 hover:scale-105 transition-transform"
        >
          Species
        </button>
      </div>

      {/* Species Selection Dropdown Modal */}
      <AnimatePresence>
        {showSpeciesPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-4 right-4 bg-pink-50 dark:bg-slate-800 border-2 border-pink-400 dark:border-cyan-400 rounded-xl p-3 shadow-xl z-30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-[9px] text-pink-600 dark:text-cyan-400">
                Choose Pet Species:
              </span>
              <button
                onClick={() => setShowSpeciesPicker(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {SPECIES_OPTIONS.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => handleSelectSpecies(sp.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left font-body text-xs font-semibold transition-all ${
                    pet.species === sp.id
                      ? 'bg-pink-300 dark:bg-cyan-900 border-pink-500 dark:border-cyan-400 text-pink-950 dark:text-cyan-100'
                      : 'bg-white dark:bg-slate-700 border-pink-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-pink-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{sp.emoji}</span>
                    <span>{sp.name}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet Interactive Showcase Display */}
      <div className="relative h-40 flex flex-col items-center justify-center bg-gradient-to-b from-pink-100/60 to-purple-100/60 dark:from-slate-800/80 dark:to-slate-900/80 rounded-xl border border-pink-200 dark:border-slate-800 overflow-hidden my-2">
        {/* Floating Heart Particles */}
        <AnimatePresence>
          {floatingHearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: 0, x: h.x, scale: 0.8 }}
              animate={{ opacity: 0, y: -70, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute pointer-events-none z-20 text-rose-500 font-bold"
            >
              💖
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pet Sprite with Framer Motion Bounce Animation */}
        <motion.div
          animate={
            isFeedingAnim
              ? {
                  scaleY: [1, 0.75, 1.25, 0.9, 1],
                  y: [0, 8, -28, 4, 0],
                }
              : pet.isSleeping
              ? {
                  scale: [1, 0.98, 1],
                }
              : {
                  y: [0, -4, 0],
                  scaleY: [1, 1.02, 1],
                }
          }
          transition={{
            duration: isFeedingAnim ? 0.7 : 2.5,
            repeat: isFeedingAnim ? 0 : Infinity,
            ease: 'easeInOut',
          }}
          className="cursor-pointer"
          onClick={handlePet}
          title="Click to pet!"
        >
          <PixelPetSprite species={pet.species} stage={pet.stage} isSleeping={pet.isSleeping} className="w-32 h-32" />
        </motion.div>

        {/* Sleep Overlay Badge */}
        {pet.isSleeping && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-indigo-900/80 text-cyan-300 text-[10px] font-pixel flex items-center gap-1">
            <Moon className="w-3 h-3" /> Sleeping
          </div>
        )}
      </div>

      {/* Progress & Stats Bar */}
      <div className="space-y-2 mb-3">
        {/* XP Growth Bar */}
        <div>
          <div className="flex justify-between text-[10px] font-pixel text-pink-600 dark:text-cyan-400 mb-1">
            <span>GROWTH XP</span>
            <span>
              {pet.xp} / {pet.maxExp} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-pink-100 dark:bg-slate-800 rounded-full border border-pink-300 dark:border-cyan-500 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-rose-400 dark:from-cyan-400 dark:to-fuchsia-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (pet.xp / pet.maxExp) * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Happiness & Hunger meters */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-pixel">
          <div className="bg-pink-50 dark:bg-slate-800 p-1.5 rounded-lg border border-pink-200 dark:border-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1 text-rose-500">
              <Heart className="w-3 h-3 fill-rose-500" /> Happy
            </span>
            <span className="text-slate-700 dark:text-slate-200">{pet.happiness}%</span>
          </div>
          <div className="bg-pink-50 dark:bg-slate-800 p-1.5 rounded-lg border border-pink-200 dark:border-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1 text-amber-500">
              <Utensils className="w-3 h-3" /> Full
            </span>
            <span className="text-slate-700 dark:text-slate-200">{pet.hunger}%</span>
          </div>
        </div>
      </div>

      {/* Snack Selector & Feed / Pet Action Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-pixel text-slate-500 dark:text-slate-400">Select Treat:</span>
          <div className="flex items-center gap-1.5">
            {(['strawberry', 'boba', 'donut', 'fish', 'cookie'] as const).map((snack) => (
              <button
                key={snack}
                onClick={() => setSelectedSnack(snack)}
                className={`p-1 rounded-lg border transition-all ${
                  selectedSnack === snack
                    ? 'bg-pink-300 dark:bg-cyan-800 border-pink-500 scale-110'
                    : 'bg-white dark:bg-slate-800 border-pink-200 hover:scale-105'
                }`}
                title={`Feed ${snack}`}
              >
                <PixelSnackIcon type={snack} className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleFeed}
            disabled={pet.isSleeping}
            className="pixel-button-kawaii dark:pixel-button-cyber text-[9px] py-2 flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Utensils className="w-3 h-3" /> Feed
          </button>

          <button
            onClick={handlePet}
            disabled={pet.isSleeping}
            className="pixel-button-kawaii dark:pixel-button-cyber text-[9px] py-2 flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Heart className="w-3 h-3" /> Pet
          </button>

          <button
            onClick={togglePetSleep}
            className="pixel-button-kawaii dark:pixel-button-cyber text-[9px] py-2 flex items-center justify-center gap-1"
          >
            {pet.isSleeping ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            {pet.isSleeping ? 'Wake' : 'Nap'}
          </button>
        </div>
      </div>
    </div>
  );
};
