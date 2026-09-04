import React from 'react';

export interface StickerItem {
  id: string;
  name: string;
  category: 'decor' | 'food' | 'tech' | 'plants';
  svg: React.ReactNode;
}

export const STICKER_CATALOG: StickerItem[] = [
  {
    id: 'fairy_lights',
    name: 'Fairy Lights ✨',
    category: 'decor',
    svg: (
      <svg viewBox="0 0 48 24" className="w-full h-full">
        <path d="M 2 4 Q 12 14 24 6 Q 36 14 46 4" stroke="#e2e8f0" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="11" r="3" fill="#fde047" className="animate-pulse" />
        <circle cx="24" cy="6" r="3" fill="#f472b6" className="animate-pulse" />
        <circle cx="36" cy="11" r="3" fill="#38bdf8" className="animate-pulse" />
      </svg>
    ),
  },
  {
    id: 'succulent_plant',
    name: 'Desk Plant 🌿',
    category: 'plants',
    svg: (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect x="8" y="18" width="16" height="12" fill="#d97706" rx="2" />
        <rect x="6" y="16" width="20" height="3" fill="#b45309" rx="1" />
        {/* Leaves */}
        <circle cx="16" cy="12" r="5" fill="#22c55e" />
        <circle cx="11" cy="14" r="4" fill="#16a34a" />
        <circle cx="21" cy="14" r="4" fill="#16a34a" />
        <circle cx="16" cy="9" r="3" fill="#86efac" />
      </svg>
    ),
  },
  {
    id: 'coffee_mug',
    name: 'Warm Coffee ☕',
    category: 'food',
    svg: (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect x="6" y="10" width="16" height="16" fill="#f43f5e" rx="3" />
        <rect x="8" y="11" width="12" height="3" fill="#78350f" />
        {/* Handle */}
        <path d="M 22 13 Q 28 13 28 18 Q 28 23 22 23" stroke="#f43f5e" strokeWidth="3" fill="none" />
        {/* Steam */}
        <path d="M 10 7 Q 12 4 10 2" stroke="#fda4af" strokeWidth="1.5" fill="none" className="animate-bounce" />
        <path d="M 15 7 Q 17 4 15 2" stroke="#fda4af" strokeWidth="1.5" fill="none" className="animate-bounce" />
      </svg>
    ),
  },
  {
    id: 'ramen_bowl',
    name: 'Ramen Bowl 🍜',
    category: 'food',
    svg: (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <ellipse cx="16" cy="14" rx="12" ry="5" fill="#f87171" />
        <path d="M 4 14 Q 4 28 16 28 Q 28 28 28 14 Z" fill="#ef4444" />
        <ellipse cx="16" cy="14" rx="10" ry="3.5" fill="#fef08a" />
        {/* Egg & Narutomaki */}
        <circle cx="13" cy="14" r="2.5" fill="#ffffff" />
        <circle cx="13" cy="14" r="1.5" fill="#f59e0b" />
        {/* Chopsticks */}
        <line x1="2" y1="8" x2="26" y2="18" stroke="#78350f" strokeWidth="2" />
        <line x1="2" y1="11" x2="26" y2="20" stroke="#78350f" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'lofi_radio',
    name: 'Retro Boombox 📻',
    category: 'tech',
    svg: (
      <svg viewBox="0 0 36 28" className="w-full h-full">
        <rect x="4" y="8" width="28" height="18" fill="#ec4899" rx="3" />
        <rect x="8" y="4" width="20" height="4" fill="#be185d" />
        {/* Speaker circles */}
        <circle cx="11" cy="17" r="4.5" fill="#1e1b4b" />
        <circle cx="11" cy="17" r="2" fill="#f43f5e" />
        <circle cx="25" cy="17" r="4.5" fill="#1e1b4b" />
        <circle cx="25" cy="17" r="2" fill="#f43f5e" />
        {/* Cassette slot */}
        <rect x="16.5" y="13" width="7" height="8" fill="#fbcfe8" rx="1" />
      </svg>
    ),
  },
  {
    id: 'lava_lamp',
    name: 'Cyber Lava Lamp 🧪',
    category: 'decor',
    svg: (
      <svg viewBox="0 0 24 36" className="w-full h-full">
        <polygon points="8,2 16,2 14,8 10,8" fill="#475569" />
        <polygon points="6,34 18,34 16,26 8,26" fill="#475569" />
        <rect x="8" y="8" width="8" height="18" fill="#00f0ff" opacity="0.3" rx="2" />
        {/* Lava blobs */}
        <circle cx="12" cy="12" r="3" fill="#ff007f" className="animate-bounce" />
        <circle cx="11" cy="20" r="3.5" fill="#ff007f" className="animate-pulse" />
      </svg>
    ),
  },
  {
    id: 'neon_sign_heart',
    name: 'Neon Heart Sign 💖',
    category: 'decor',
    svg: (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <path
          d="M 16 26 C 6 18 2 12 6 6 C 10 2 14 5 16 9 C 18 5 22 2 26 6 C 30 12 26 18 16 26 Z"
          fill="none"
          stroke="#ff007f"
          strokeWidth="3"
          className="drop-shadow-[0_0_8px_#ff007f]"
        />
      </svg>
    ),
  },
  {
    id: 'polaroid_photo',
    name: 'Cozy Polaroid 📷',
    category: 'decor',
    svg: (
      <svg viewBox="0 0 30 36" className="w-full h-full">
        <rect x="2" y="2" width="26" height="32" fill="#fffdfa" rx="2" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="4" y="4" width="22" height="20" fill="#38bdf8" />
        <circle cx="15" cy="12" r="4" fill="#fde047" />
        <polygon points="4,22 12,14 18,20 22,17 26,24 4,24" fill="#22c55e" />
      </svg>
    ),
  },
  {
    id: 'sleeping_cat',
    name: 'Sleeping Kitty 🐈',
    category: 'plants',
    svg: (
      <svg viewBox="0 0 36 24" className="w-full h-full">
        <ellipse cx="18" cy="14" rx="12" ry="7" fill="#fb923c" />
        <circle cx="10" cy="12" r="5" fill="#fb923c" />
        <polygon points="7,8 10,5 11,9" fill="#ea580c" />
        <polygon points="12,8 14,5 15,9" fill="#ea580c" />
        {/* Closed Eyes */}
        <line x1="8" y1="12" x2="11" y2="12" stroke="#7c2d12" strokeWidth="1" />
        <path d="M 28 14 Q 32 10 30 6" stroke="#fb923c" strokeWidth="2.5" fill="none" />
      </svg>
    ),
  },
  {
    id: 'pixel_gameboy',
    name: 'Pixel Console 🎮',
    category: 'tech',
    svg: (
      <svg viewBox="0 0 28 40" className="w-full h-full">
        <rect x="3" y="2" width="22" height="36" fill="#a855f7" rx="3" />
        <rect x="6" y="5" width="16" height="13" fill="#84cc16" rx="1" />
        {/* D-pad */}
        <rect x="6" y="23" width="7" height="3" fill="#1e1b4b" />
        <rect x="8" y="21" width="3" height="7" fill="#1e1b4b" />
        {/* Buttons */}
        <circle cx="19" cy="23" r="2" fill="#ef4444" />
        <circle cx="21" cy="27" r="2" fill="#ef4444" />
      </svg>
    ),
  },
];
