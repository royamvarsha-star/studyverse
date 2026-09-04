import React from 'react';
import { PetSpecies } from '../../types';

interface PetSpriteProps {
  species: PetSpecies;
  stage: 0 | 1 | 2 | 3;
  isSleeping?: boolean;
  className?: string;
}

export const PixelPetSprite: React.FC<PetSpriteProps> = ({
  species,
  stage,
  isSleeping = false,
  className = 'w-28 h-28',
}) => {
  // Stage 0 is always the cute Pixel Egg (with distinct species color spot)
  if (stage === 0) {
    const eggColors: Record<PetSpecies, { base: string; spot: string; border: string }> = {
      cat: { base: '#fed7aa', spot: '#fb923c', border: '#7c2d12' },
      shiba: { base: '#fef08a', spot: '#ca8a04', border: '#713f12' },
      bunny: { base: '#fbcfe8', spot: '#f472b6', border: '#831843' },
      dragon: { base: '#a7f3d0', spot: '#34d399', border: '#065f46' },
      panda: { base: '#fecdd3', spot: '#e11d48', border: '#881337' },
    };
    const c = eggColors[species];

    return (
      <div className={`relative inline-block pixel-art select-none ${className}`}>
        <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
          {/* Pixel Egg shape */}
          <rect x="10" y="4" width="12" height="3" fill={c.border} />
          <rect x="7" y="7" width="18" height="3" fill={c.border} />
          <rect x="5" y="10" width="22" height="15" fill={c.border} />
          <rect x="7" y="25" width="18" height="3" fill={c.border} />
          <rect x="10" y="28" width="12" height="2" fill={c.border} />

          {/* Inner Fill */}
          <rect x="11" y="5" width="10" height="2" fill={c.base} />
          <rect x="8" y="7" width="16" height="3" fill={c.base} />
          <rect x="6" y="10" width="20" height="14" fill={c.base} />
          <rect x="8" y="24" width="16" height="3" fill={c.base} />
          <rect x="11" y="27" width="10" height="2" fill={c.base} />

          {/* Cute spots */}
          <rect x="9" y="12" width="4" height="4" fill={c.spot} />
          <rect x="18" y="16" width="5" height="5" fill={c.spot} />
          <rect x="12" y="22" width="3" height="3" fill={c.spot} />

          {/* Crackle line */}
          <path d="M 14 10 L 17 13 L 15 16 L 19 20" stroke={c.border} strokeWidth="1" fill="none" />

          {/* Cute shine */}
          <rect x="10" y="8" width="2" height="4" fill="#ffffff" opacity="0.8" />
          <rect x="12" y="8" width="4" height="2" fill="#ffffff" opacity="0.8" />
        </svg>
      </div>
    );
  }

  // Render Species by Stage
  return (
    <div className={`relative inline-block pixel-art select-none ${className}`}>
      {species === 'cat' && <CalicoCatSprite stage={stage} isSleeping={isSleeping} />}
      {species === 'shiba' && <ShibaInuSprite stage={stage} isSleeping={isSleeping} />}
      {species === 'bunny' && <LopBunnySprite stage={stage} isSleeping={isSleeping} />}
      {species === 'dragon' && <BabyDragonSprite stage={stage} isSleeping={isSleeping} />}
      {species === 'panda' && <RedPandaSprite stage={stage} isSleeping={isSleeping} />}

      {/* Floating Zzz for sleeping */}
      {isSleeping && (
        <div className="absolute -top-3 right-0 font-pixel text-xs text-cyan-400 dark:text-cyan-300 animate-bounce">
          Zzz...
        </div>
      )}
    </div>
  );
};

// 1. Calico Cat
const CalicoCatSprite: React.FC<{ stage: number; isSleeping: boolean }> = ({ stage, isSleeping }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-lg">
    {/* Ears */}
    <polygon points="6,6 11,6 9,11 6,11" fill="#ea580c" />
    <polygon points="21,6 26,6 26,11 23,11" fill="#1e293b" />
    {/* Head */}
    <rect x="7" y="10" width="18" height="12" fill="#fffdfa" />
    <rect x="17" y="10" width="8" height="6" fill="#1e293b" />
    <rect x="7" y="12" width="6" height="5" fill="#ea580c" />
    {/* Body */}
    <rect x="8" y="21" width="16" height={stage >= 3 ? 9 : 7} fill="#fffdfa" />
    <rect x="18" y="22" width="6" height={stage >= 3 ? 6 : 4} fill="#ea580c" />
    <rect x="8" y="23" width="5" height="5" fill="#1e293b" />
    {/* Eyes */}
    {isSleeping ? (
      <>
        <line x1="10" y1="15" x2="14" y2="15" stroke="#1e293b" strokeWidth="2" />
        <line x1="18" y1="15" x2="22" y2="15" stroke="#1e293b" strokeWidth="2" />
      </>
    ) : (
      <>
        <rect x="10" y="13" width="3" height="4" fill="#0284c7" />
        <rect x="19" y="13" width="3" height="4" fill="#0284c7" />
        <rect x="11" y="13" width="1" height="2" fill="#ffffff" />
        <rect x="20" y="13" width="1" height="2" fill="#ffffff" />
      </>
    )}
    {/* Nose & Blush */}
    <rect x="15" y="16" width="2" height="2" fill="#f43f5e" />
    <rect x="7" y="16" width="2" height="2" fill="#fca5a5" />
    <rect x="23" y="16" width="2" height="2" fill="#fca5a5" />
    {/* Whiskers */}
    <line x1="4" y1="15" x2="7" y2="16" stroke="#475569" strokeWidth="1" />
    <line x1="4" y1="18" x2="7" y2="17" stroke="#475569" strokeWidth="1" />
    <line x1="25" y1="16" x2="28" y2="15" stroke="#475569" strokeWidth="1" />
    <line x1="25" y1="17" x2="28" y2="18" stroke="#475569" strokeWidth="1" />
    {/* Paws */}
    <rect x="9" y={stage >= 3 ? 29 : 27} width="4" height="2" fill="#ea580c" />
    <rect x="19" y={stage >= 3 ? 29 : 27} width="4" height="2" fill="#fffdfa" />
    {/* Tail */}
    <path d="M 24 24 Q 28 20 27 16" stroke="#ea580c" strokeWidth="3" fill="none" />
    {/* Stage 3 Extra: Cute Bow / Bell */}
    {stage >= 3 && (
      <>
        <circle cx="16" cy="22" r="2" fill="#eab308" />
        <line x1="11" y1="21" x2="21" y2="21" stroke="#dc2626" strokeWidth="1.5" />
      </>
    )}
  </svg>
);

// 2. Shiba Inu
const ShibaInuSprite: React.FC<{ stage: number; isSleeping: boolean }> = ({ stage, isSleeping }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-lg">
    {/* Pointy Ears */}
    <polygon points="6,5 11,5 10,11 6,11" fill="#d97706" />
    <polygon points="21,5 26,5 26,11 22,11" fill="#d97706" />
    {/* Head */}
    <rect x="7" y="9" width="18" height="12" fill="#f59e0b" />
    <rect x="10" y="15" width="12" height="7" fill="#fffbeb" />
    {/* Shiba Eyebrows */}
    <rect x="10" y="11" width="3" height="2" fill="#fffbeb" />
    <rect x="19" y="11" width="3" height="2" fill="#fffbeb" />
    {/* Eyes */}
    {isSleeping ? (
      <>
        <line x1="10" y1="15" x2="14" y2="15" stroke="#451a03" strokeWidth="2" />
        <line x1="18" y1="15" x2="22" y2="15" stroke="#451a03" strokeWidth="2" />
      </>
    ) : (
      <>
        <rect x="11" y="13" width="3" height="3" fill="#451a03" />
        <rect x="18" y="13" width="3" height="3" fill="#451a03" />
        <rect x="12" y="13" width="1" height="1" fill="#ffffff" />
        <rect x="19" y="13" width="1" height="1" fill="#ffffff" />
      </>
    )}
    {/* Muzzle & Nose */}
    <rect x="15" y="16" width="2" height="2" fill="#1e1b4b" />
    <rect x="7" y="16" width="2" height="2" fill="#fca5a5" />
    <rect x="23" y="16" width="2" height="2" fill="#fca5a5" />
    {/* Body */}
    <rect x="9" y="21" width="14" height={stage >= 3 ? 8 : 6} fill="#f59e0b" />
    <rect x="12" y="21" width="8" height={stage >= 3 ? 7 : 5} fill="#fffbeb" />
    {/* Curly Tail */}
    <circle cx="25" cy="20" r="3" fill="#d97706" />
    {/* Bandana on Stage 2 & 3 */}
    {stage >= 2 && (
      <polygon points="12,21 20,21 16,25" fill="#0284c7" />
    )}
  </svg>
);

// 3. Lop-Eared Bunny
const LopBunnySprite: React.FC<{ stage: number; isSleeping: boolean }> = ({ stage, isSleeping }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-lg">
    {/* Droopy Ears */}
    <rect x="4" y="10" width="4" height="13" fill="#f9a8d4" rx="2" />
    <rect x="24" y="10" width="4" height="13" fill="#f9a8d4" rx="2" />
    <rect x="5" y="12" width="2" height="8" fill="#fce7f3" />
    <rect x="25" y="12" width="2" height="8" fill="#fce7f3" />
    {/* Head */}
    <rect x="8" y="8" width="16" height="13" fill="#fdf2f8" rx="3" />
    {/* Big Anime Eyes */}
    {isSleeping ? (
      <>
        <line x1="10" y1="14" x2="13" y2="14" stroke="#831843" strokeWidth="2" />
        <line x1="19" y1="14" x2="22" y2="14" stroke="#831843" strokeWidth="2" />
      </>
    ) : (
      <>
        <rect x="10" y="12" width="4" height="4" fill="#db2777" />
        <rect x="18" y="12" width="4" height="4" fill="#db2777" />
        <rect x="11" y="12" width="2" height="2" fill="#ffffff" />
        <rect x="19" y="12" width="2" height="2" fill="#ffffff" />
      </>
    )}
    {/* Nose & Rosy Cheeks */}
    <polygon points="15,16 17,16 16,18" fill="#f43f5e" />
    <rect x="8" y="15" width="3" height="2" fill="#fda4af" />
    <rect x="21" y="15" width="3" height="2" fill="#fda4af" />
    {/* Body */}
    <rect x="10" y="20" width="12" height={stage >= 3 ? 9 : 7} fill="#fdf2f8" rx="3" />
    <rect x="12" y="22" width="8" height="5" fill="#fce7f3" />
    {/* Stage 3 Flower on Ear */}
    {stage >= 3 && (
      <g transform="translate(6, 8)">
        <circle cx="0" cy="0" r="3" fill="#f43f5e" />
        <circle cx="0" cy="0" r="1.2" fill="#fef08a" />
      </g>
    )}
  </svg>
);

// 4. Baby Dragon
const BabyDragonSprite: React.FC<{ stage: number; isSleeping: boolean }> = ({ stage, isSleeping }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-lg">
    {/* Tiny Horns */}
    <polygon points="8,4 11,4 9,9" fill="#f59e0b" />
    <polygon points="21,4 24,4 23,9" fill="#f59e0b" />
    {/* Wings */}
    <polygon points="4,14 1,18 7,18" fill="#10b981" />
    <polygon points="28,14 31,18 25,18" fill="#10b981" />
    {/* Head */}
    <rect x="7" y="8" width="18" height="13" fill="#34d399" rx="2" />
    {/* Eyes */}
    {isSleeping ? (
      <>
        <line x1="10" y1="14" x2="13" y2="14" stroke="#064e3b" strokeWidth="2" />
        <line x1="19" y1="14" x2="22" y2="14" stroke="#064e3b" strokeWidth="2" />
      </>
    ) : (
      <>
        <rect x="10" y="12" width="4" height="4" fill="#7c3aed" />
        <rect x="18" y="12" width="4" height="4" fill="#7c3aed" />
        <rect x="11" y="12" width="1.5" height="1.5" fill="#ffffff" />
        <rect x="19" y="12" width="1.5" height="1.5" fill="#ffffff" />
      </>
    )}
    {/* Snout & Nostril puffs */}
    <rect x="13" y="16" width="6" height="4" fill="#6ee7b7" />
    <circle cx="15" cy="18" r="0.8" fill="#047857" />
    <circle cx="17" cy="18" r="0.8" fill="#047857" />
    {/* Body & Belly scales */}
    <rect x="9" y="20" width="14" height={stage >= 3 ? 9 : 7} fill="#34d399" />
    <rect x="12" y="21" width="8" height={stage >= 3 ? 7 : 5} fill="#fef08a" />
    {/* Tail with spike */}
    <path d="M 23 25 Q 28 27 27 22" stroke="#34d399" strokeWidth="3" fill="none" />
    <polygon points="27,21 30,22 28,24" fill="#f59e0b" />
    {/* Stage 3 Smoke Sparkle */}
    {stage >= 3 && (
      <circle cx="18" cy="8" r="1.5" fill="#ef4444" opacity="0.8" />
    )}
  </svg>
);

// 5. Red Panda
const RedPandaSprite: React.FC<{ stage: number; isSleeping: boolean }> = ({ stage, isSleeping }) => (
  <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-lg">
    {/* Rounded Ears */}
    <circle cx="8" cy="8" r="4" fill="#c2410c" />
    <circle cx="8" cy="8" r="2.5" fill="#fff7ed" />
    <circle cx="24" cy="8" r="4" fill="#c2410c" />
    <circle cx="24" cy="8" r="2.5" fill="#fff7ed" />
    {/* Head */}
    <rect x="7" y="9" width="18" height="12" fill="#ea580c" />
    {/* White eye markings */}
    <rect x="7" y="11" width="4" height="6" fill="#fff7ed" />
    <rect x="21" y="11" width="4" height="6" fill="#fff7ed" />
    {/* Eyes */}
    {isSleeping ? (
      <>
        <line x1="10" y1="14" x2="13" y2="14" stroke="#431407" strokeWidth="2" />
        <line x1="19" y1="14" x2="22" y2="14" stroke="#431407" strokeWidth="2" />
      </>
    ) : (
      <>
        <rect x="10" y="12" width="3" height="4" fill="#431407" />
        <rect x="19" y="12" width="3" height="4" fill="#431407" />
        <rect x="11" y="12" width="1" height="1" fill="#ffffff" />
        <rect x="20" y="12" width="1" height="1" fill="#ffffff" />
      </>
    )}
    {/* White Muzzle */}
    <rect x="13" y="15" width="6" height="5" fill="#fff7ed" />
    <polygon points="15,16 17,16 16,18" fill="#18181b" />
    {/* Body */}
    <rect x="9" y="20" width="14" height={stage >= 3 ? 9 : 7} fill="#18181b" />
    {/* Ringed Fluffy Tail */}
    <path d="M 23 24 Q 28 22 28 17" stroke="#ea580c" strokeWidth="4" fill="none" />
    <circle cx="26" cy="21" r="1.5" fill="#fff7ed" />
    <circle cx="28" cy="18" r="1.5" fill="#fff7ed" />
  </svg>
);

// Snack Icons for feeding
export const PixelSnackIcon: React.FC<{ type: 'strawberry' | 'boba' | 'donut' | 'fish' | 'cookie'; className?: string }> = ({
  type,
  className = 'w-6 h-6',
}) => {
  return (
    <div className={`inline-block pixel-art ${className}`}>
      {type === 'strawberry' && (
        <svg viewBox="0 0 16 16" className="w-full h-full">
          <polygon points="7,2 9,2 8,5" fill="#22c55e" />
          <rect x="5" y="5" width="6" height="6" fill="#ef4444" rx="2" />
          <polygon points="5,11 11,11 8,14" fill="#ef4444" />
          <circle cx="7" cy="7" r="0.6" fill="#fef08a" />
          <circle cx="9" cy="8" r="0.6" fill="#fef08a" />
          <circle cx="8" cy="10" r="0.6" fill="#fef08a" />
        </svg>
      )}
      {type === 'boba' && (
        <svg viewBox="0 0 16 16" className="w-full h-full">
          <line x1="8" y1="1" x2="8" y2="7" stroke="#ec4899" strokeWidth="1.5" />
          <rect x="4" y="5" width="8" height="9" fill="#fde047" rx="1" />
          <rect x="4" y="4" width="8" height="2" fill="#e2e8f0" />
          {/* Boba pearls */}
          <circle cx="6" cy="12" r="1" fill="#1e293b" />
          <circle cx="8" cy="12" r="1" fill="#1e293b" />
          <circle cx="10" cy="12" r="1" fill="#1e293b" />
          <circle cx="7" cy="10" r="1" fill="#1e293b" />
          <circle cx="9" cy="10" r="1" fill="#1e293b" />
        </svg>
      )}
      {type === 'donut' && (
        <svg viewBox="0 0 16 16" className="w-full h-full">
          <circle cx="8" cy="8" r="6" fill="#d97706" />
          <circle cx="8" cy="8" r="5" fill="#ec4899" />
          <circle cx="8" cy="8" r="2.2" fill="#fffdfa" />
          <rect x="5" y="5" width="1.5" height="1" fill="#67e8f9" />
          <rect x="9" y="4" width="1.5" height="1" fill="#fde047" />
          <rect x="10" y="8" width="1.5" height="1" fill="#ffffff" />
        </svg>
      )}
      {type === 'fish' && (
        <svg viewBox="0 0 16 16" className="w-full h-full">
          <polygon points="3,8 7,5 12,8 7,11" fill="#d97706" />
          <polygon points="12,8 15,5 15,11" fill="#b45309" />
          <circle cx="6" cy="7" r="0.8" fill="#1e293b" />
        </svg>
      )}
      {type === 'cookie' && (
        <svg viewBox="0 0 16 16" className="w-full h-full">
          <circle cx="8" cy="8" r="6" fill="#d97706" />
          <circle cx="6" cy="6" r="1" fill="#451a03" />
          <circle cx="10" cy="6" r="1" fill="#451a03" />
          <circle cx="8" cy="9" r="1" fill="#451a03" />
          <circle cx="6" cy="10" r="1" fill="#451a03" />
          <circle cx="11" cy="10" r="1" fill="#451a03" />
        </svg>
      )}
    </div>
  );
};
