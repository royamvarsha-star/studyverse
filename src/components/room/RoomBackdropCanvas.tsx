import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, BACKDROP_CONFIGS } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { STICKER_CATALOG } from '../props/StickerAssets';
import { Trash2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { PlacedSticker } from '../../types';

export const RoomBackdropCanvas: React.FC<{ isDecoratorMode: boolean; children?: React.ReactNode }> = ({
  isDecoratorMode,
  children,
}) => {
  const { backdrop, customBackdropUrl, theme } = useTheme();
  const { roomState, updateSticker, removeSticker } = useSocket();

  const backdropConfig = BACKDROP_CONFIGS[backdrop];

  const handleRotate = (sticker: PlacedSticker) => {
    updateSticker({
      ...sticker,
      rotation: (sticker.rotation + 15) % 360,
    });
  };

  const handleScale = (sticker: PlacedSticker, delta: number) => {
    const nextScale = Math.max(0.5, Math.min(2.5, sticker.scale + delta));
    updateSticker({
      ...sticker,
      scale: nextScale,
    });
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden select-none">
      {/* Background Layer */}
      {backdrop === 'custom' && customBackdropUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter brightness-90"
          style={{ backgroundImage: `url(${customBackdropUrl})` }}
        />
      ) : (
        <div className={`absolute inset-0 transition-colors duration-700 ${backdropConfig.bgStyle}`} />
      )}

      {/* Retro Grid & Scanline Effect */}
      <div className="absolute inset-0 scanlines-overlay opacity-35 pointer-events-none" />

      {/* Subtle Floating Ambient Particles (Sakura / Cyber stars) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {theme === 'kawaii' ? (
          <>
            <span className="absolute top-1/4 left-10 text-2xl animate-float opacity-40">🌸</span>
            <span className="absolute top-2/3 right-16 text-xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>✨</span>
            <span className="absolute top-1/2 left-1/3 text-lg animate-bounce-soft opacity-30" style={{ animationDelay: '0.8s' }}>🌸</span>
            <span className="absolute top-10 right-1/4 text-2xl animate-float opacity-40" style={{ animationDelay: '2s' }}>💖</span>
          </>
        ) : (
          <>
            <span className="absolute top-1/4 left-12 text-xs font-pixel text-cyan-400 animate-pulse opacity-40">0101</span>
            <span className="absolute top-2/3 right-20 text-xl text-fuchsia-400 animate-pulse opacity-40" style={{ animationDelay: '1.2s' }}>⚡</span>
            <span className="absolute top-16 right-1/3 text-cyan-300 text-sm animate-float opacity-30">✨</span>
          </>
        )}
      </div>

      {/* Placed Sticker Props on Room Canvas */}
      {roomState.placedStickers.map((st) => {
        const item = STICKER_CATALOG.find((c) => c.id === st.stickerId);
        if (!item) return null;

        return (
          <motion.div
            key={st.id}
            drag={isDecoratorMode}
            dragElastic={0.1}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              // Convert drag offset into viewport percentages
              const deltaX = (info.offset.x / window.innerWidth) * 100;
              const deltaY = (info.offset.y / window.innerHeight) * 100;
              updateSticker({
                ...st,
                x: Math.max(5, Math.min(95, st.x + deltaX)),
                y: Math.max(10, Math.min(90, st.y + deltaY)),
              });
            }}
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              transform: `rotate(${st.rotation}deg) scale(${st.scale})`,
            }}
            className="absolute z-10 cursor-grab active:cursor-grabbing group"
          >
            <div className="relative">
              {/* Sticker Graphic */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md pixel-art">
                {item.svg}
              </div>

              {/* Decorator Controls on hover when in Decorator Mode */}
              {isDecoratorMode && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-800/95 border border-pink-300 dark:border-cyan-500 rounded-full px-2 py-0.5 shadow-md flex items-center gap-1.5 opacity-90 group-hover:opacity-100 z-30">
                  <button
                    onClick={() => handleRotate(st)}
                    className="text-slate-600 dark:text-slate-200 hover:text-pink-600"
                    title="Rotate 15°"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleScale(st, 0.15)}
                    className="text-slate-600 dark:text-slate-200 hover:text-pink-600"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleScale(st, -0.15)}
                    className="text-slate-600 dark:text-slate-200 hover:text-pink-600"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeSticker(st.id)}
                    className="text-rose-500 hover:text-rose-700"
                    title="Delete Sticker"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Main Room View Content & Draggable Avatars */}
      {children}
    </div>
  );
};
