import React from 'react';
import { motion } from 'framer-motion';
import { STICKER_CATALOG, StickerItem } from '../props/StickerAssets';
import { useSocket } from '../../context/SocketContext';
import { Sparkles } from 'lucide-react';

export const StickerDecoratorDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { addSticker } = useSocket();

  if (!isOpen) return null;

  const handlePlaceSticker = (sticker: StickerItem) => {
    // Place randomly in center area
    const rx = 30 + Math.random() * 40;
    const ry = 30 + Math.random() * 40;
    addSticker(sticker.id, rx, ry);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 border-3 border-pink-400 dark:border-cyan-400 rounded-3xl p-4 shadow-2xl max-w-2xl w-full mx-auto"
    >
      <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-1.5 font-pixel text-xs text-pink-600 dark:text-cyan-400">
          <Sparkles className="w-4 h-4 text-pink-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>ROOM DECORATOR PROPS:</span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-pixel"
        >
          ✕ CLOSE
        </button>
      </div>

      <p className="font-body text-xs text-slate-500 mb-3">
        Click any prop sticker below to place it in the study room! You can drag it anywhere on the canvas.
      </p>

      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2.5 max-h-44 overflow-y-auto p-1">
        {STICKER_CATALOG.map((st) => (
          <button
            key={st.id}
            onClick={() => handlePlaceSticker(st)}
            className="p-2 bg-pink-50 dark:bg-slate-800 border-2 border-pink-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-cyan-400 rounded-2xl flex flex-col items-center gap-1 hover:scale-110 transition-all shadow-sm group"
            title={`Add ${st.name}`}
          >
            <div className="w-8 h-8 flex items-center justify-center pixel-art">{st.svg}</div>
            <span className="font-pixel text-[6px] text-slate-600 dark:text-slate-300 truncate w-full text-center group-hover:text-pink-600">
              {st.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
