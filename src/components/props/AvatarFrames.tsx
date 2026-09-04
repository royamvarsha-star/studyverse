import React from 'react';

export const AVATAR_FRAMES = [
  { id: 'none', name: 'Default Plain' },
  { id: 'cat_ears', name: 'Cat Ears 🐱' },
  { id: 'angel_halo', name: 'Angel Halo 😇' },
  { id: 'cyber_neon', name: 'Cyber Neon ⚡' },
  { id: 'sakura_crown', name: 'Sakura Crown 🌸' },
  { id: 'devil_horns', name: 'Devil Horns 😈' },
  { id: 'golden_crown', name: 'Pixel Crown 👑' },
  { id: 'bunny_ears', name: 'Bunny Ears 🐰' },
  { id: 'star_sparkle', name: 'Star Aura ✨' },
] as const;

export const AvatarFrameOverlay: React.FC<{ frameId: string; className?: string }> = ({
  frameId,
  className = 'w-full h-full',
}) => {
  if (frameId === 'cat_ears') {
    return (
      <div className={`absolute inset-0 pointer-events-none z-10 ${className}`}>
        {/* Cat ears at top */}
        <div className="absolute -top-3.5 left-2 w-5 h-5 pixel-art drop-shadow-sm">
          <svg viewBox="0 0 16 16" className="w-full h-full">
            <polygon points="1,15 8,1 15,15" fill="#f43f5e" />
            <polygon points="4,13 8,6 12,13" fill="#fed7aa" />
          </svg>
        </div>
        <div className="absolute -top-3.5 right-2 w-5 h-5 pixel-art drop-shadow-sm">
          <svg viewBox="0 0 16 16" className="w-full h-full">
            <polygon points="1,15 8,1 15,15" fill="#f43f5e" />
            <polygon points="4,13 8,6 12,13" fill="#fed7aa" />
          </svg>
        </div>
      </div>
    );
  }

  if (frameId === 'angel_halo') {
    return (
      <div className={`absolute inset-0 pointer-events-none z-10 ${className}`}>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full border-2 border-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.9)] bg-yellow-100/30 animate-pulse" />
      </div>
    );
  }

  if (frameId === 'cyber_neon') {
    return (
      <div className={`absolute -inset-1 rounded-full pointer-events-none z-10 border-2 border-cyan-400 shadow-[0_0_15px_#00f0ff] animate-pulse ${className}`} />
    );
  }

  if (frameId === 'sakura_crown') {
    return (
      <div className={`absolute inset-0 pointer-events-none z-10 flex justify-center -top-3.5 gap-0.5 ${className}`}>
        <span className="text-sm drop-shadow">🌸</span>
        <span className="text-xs drop-shadow">✨</span>
        <span className="text-sm drop-shadow">🌸</span>
      </div>
    );
  }

  if (frameId === 'devil_horns') {
    return (
      <div className={`absolute inset-0 pointer-events-none z-10 ${className}`}>
        <div className="absolute -top-3.5 left-2 w-4 h-4 pixel-art">
          <svg viewBox="0 0 16 16" className="w-full h-full">
            <polygon points="2,15 8,1 14,15" fill="#dc2626" />
          </svg>
        </div>
        <div className="absolute -top-3.5 right-2 w-4 h-4 pixel-art">
          <svg viewBox="0 0 16 16" className="w-full h-full">
            <polygon points="2,15 8,1 14,15" fill="#dc2626" />
          </svg>
        </div>
      </div>
    );
  }

  if (frameId === 'golden_crown') {
    return (
      <div className={`absolute inset-0 pointer-events-none z-10 flex justify-center -top-4 ${className}`}>
        <span className="text-base drop-shadow-md animate-bounce-soft">👑</span>
      </div>
    );
  }

  if (frameId === 'bunny_ears') {
    return (
      <div className={`absolute inset-0 pointer-events-none z-10 ${className}`}>
        <div className="absolute -top-5 left-3 w-4 h-7 bg-pink-100 rounded-t-full border border-pink-300 flex items-center justify-center">
          <div className="w-2 h-4 bg-pink-300 rounded-t-full" />
        </div>
        <div className="absolute -top-5 right-3 w-4 h-7 bg-pink-100 rounded-t-full border border-pink-300 flex items-center justify-center">
          <div className="w-2 h-4 bg-pink-300 rounded-t-full" />
        </div>
      </div>
    );
  }

  if (frameId === 'star_sparkle') {
    return (
      <div className={`absolute inset-0 pointer-events-none z-10 ${className}`}>
        <span className="absolute -top-2 -left-1 text-xs animate-spin" style={{ animationDuration: '4s' }}>✨</span>
        <span className="absolute -bottom-1 -right-1 text-xs animate-spin" style={{ animationDuration: '3s' }}>⭐</span>
        <span className="absolute top-1/2 -right-2 text-xs animate-pulse">✨</span>
      </div>
    );
  }

  return null;
};
