import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Paintbrush, Eraser, Download, Trash2, Undo2 } from 'lucide-react';
import { WhiteboardStroke } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { audioSynth } from '../../services/audioSynthesizer';

const COLOR_PALETTE = [
  '#f43f5e', // Hot Pink
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#06b6d4', // Neon Cyan
  '#10b981', // Mint Green
  '#f59e0b', // Amber
  '#ffffff', // White
  '#0f172a', // Cyber Onyx
];

const STROKE_SIZES = [3, 6, 12, 24];

export const Whiteboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const { emitGameAction } = useSocket();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState<string>('#f43f5e');
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);

  // Redraw all strokes on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((st) => {
      if (st.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = st.tool === 'eraser' ? '#ffffff' : st.color;
      ctx.lineWidth = st.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(st.points[0].x, st.points[0].y);
      for (let i = 1; i < st.points.length; i++) {
        ctx.lineTo(st.points[i].x, st.points[i].y);
      }
      ctx.stroke();
    });
  }, [strokes]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pt = getCanvasCoords(e);
    currentStrokeRef.current = [pt];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(pt.x, pt.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pt = getCanvasCoords(e);
    currentStrokeRef.current.push(pt);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokeRef.current.length > 0) {
      const newStroke: WhiteboardStroke = {
        id: 'stroke_' + Date.now(),
        userId: user.id,
        tool,
        color,
        width: strokeWidth,
        points: currentStrokeRef.current,
      };

      setStrokes((prev) => [...prev, newStroke]);
      emitGameAction('whiteboard', 'add_stroke', newStroke);
      currentStrokeRef.current = [];
    }
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
    audioSynth.playClick();
  };

  const handleClear = () => {
    setStrokes([]);
    audioSynth.playClick();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `studyverse-doodle-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    audioSynth.playVictoryFanfare();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border-4 border-pink-400 dark:border-cyan-400 rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-4xl my-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <div>
              <h2 className="font-pixel text-sm sm:text-base text-pink-600 dark:text-cyan-400 font-bold">
                COLLABORATIVE WHITEBOARD
              </h2>
              <p className="font-body text-xs text-slate-500 dark:text-slate-400">
                Doodle, take visual study notes, or draw with your co-study peers!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-cyan-400 hover:scale-105 transition-transform"
              title="Download Snapshot"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-pixel text-xs hover:bg-red-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-pink-50/80 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-pink-200 dark:border-slate-700 mb-3">
          {/* Tools (Brush / Eraser) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTool('brush')}
              className={`px-3 py-1.5 rounded-xl font-pixel text-[8px] flex items-center gap-1.5 border ${
                tool === 'brush'
                  ? 'bg-pink-500 text-white border-pink-600'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" /> Brush
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-1.5 rounded-xl font-pixel text-[8px] flex items-center gap-1.5 border ${
                tool === 'eraser'
                  ? 'bg-pink-500 text-white border-pink-600'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" /> Eraser
            </button>
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setTool('brush');
                }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c && tool === 'brush' ? 'scale-125 border-pink-600 dark:border-cyan-400' : 'border-slate-300'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Stroke Widths */}
          <div className="flex items-center gap-1.5">
            {STROKE_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setStrokeWidth(size)}
                className={`w-7 h-7 rounded-xl border flex items-center justify-center font-pixel text-[8px] ${
                  strokeWidth === size
                    ? 'bg-pink-500 text-white border-pink-600'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Action buttons (Undo / Clear) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleUndo}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border hover:bg-slate-100"
              title="Undo Stroke"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border border-rose-300 hover:bg-rose-200"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative flex-1 bg-white rounded-2xl border-2 border-pink-300 dark:border-cyan-500 overflow-hidden shadow-inner flex items-center justify-center touch-none min-h-[380px]">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />
        </div>
      </motion.div>
    </div>
  );
};
