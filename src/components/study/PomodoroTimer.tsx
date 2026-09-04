import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, FastForward, Clock, Settings, Sparkles } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { PomodoroMode } from '../../types';

export const PomodoroTimer: React.FC = () => {
  const { roomState, updatePomodoro } = useSocket();
  const { pomodoro } = roomState;
  const [showSettings, setShowSettings] = useState(false);
  const [customFocus, setCustomFocus] = useState(pomodoro.focusDuration);
  const [customBreak, setCustomBreak] = useState(pomodoro.shortBreakDuration);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTogglePlay = () => {
    updatePomodoro({ isRunning: !pomodoro.isRunning });
  };

  const handleReset = () => {
    const duration =
      pomodoro.mode === 'focus'
        ? pomodoro.focusDuration
        : pomodoro.mode === 'shortBreak'
        ? pomodoro.shortBreakDuration
        : pomodoro.longBreakDuration;

    updatePomodoro({
      timeLeft: duration * 60,
      isRunning: false,
    });
  };

  const handleSwitchMode = (mode: PomodoroMode) => {
    const duration =
      mode === 'focus'
        ? pomodoro.focusDuration
        : mode === 'shortBreak'
        ? pomodoro.shortBreakDuration
        : pomodoro.longBreakDuration;

    updatePomodoro({
      mode,
      timeLeft: duration * 60,
      isRunning: false,
    });
  };

  const handleSkip = () => {
    const nextMode: PomodoroMode = pomodoro.mode === 'focus' ? 'shortBreak' : 'focus';
    handleSwitchMode(nextMode);
  };

  const handleSaveSettings = () => {
    const focus = Math.max(1, customFocus);
    const sBreak = Math.max(1, customBreak);
    const currentDuration = pomodoro.mode === 'focus' ? focus : sBreak;

    updatePomodoro({
      focusDuration: focus,
      shortBreakDuration: sBreak,
      timeLeft: currentDuration * 60,
      isRunning: false,
    });
    setShowSettings(false);
  };

  // Calculate progress percentage
  const totalSeconds =
    (pomodoro.mode === 'focus'
      ? pomodoro.focusDuration
      : pomodoro.mode === 'shortBreak'
      ? pomodoro.shortBreakDuration
      : pomodoro.longBreakDuration) * 60;
  const progressPercent = ((totalSeconds - pomodoro.timeLeft) / totalSeconds) * 100;

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border-3 border-pink-400 dark:border-cyan-400 p-4 shadow-pixel-kawaii dark:shadow-pixel-cyber w-full max-w-sm">
      {/* Header with Mode Badges */}
      <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-1.5 font-pixel text-xs text-pink-600 dark:text-cyan-400">
          <Clock className="w-4 h-4 text-pink-500 dark:text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>POMODORO</span>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 rounded-lg bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-cyan-400 hover:scale-110 transition-transform"
          title="Timer Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-pink-100/60 dark:bg-slate-800/80 rounded-xl mb-4 border border-pink-200 dark:border-slate-700">
        <button
          onClick={() => handleSwitchMode('focus')}
          className={`py-1.5 px-2 rounded-lg font-pixel text-[8px] transition-all ${
            pomodoro.mode === 'focus'
              ? 'bg-pink-500 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700'
          }`}
        >
          Focus 🎯
        </button>
        <button
          onClick={() => handleSwitchMode('shortBreak')}
          className={`py-1.5 px-2 rounded-lg font-pixel text-[8px] transition-all ${
            pomodoro.mode === 'shortBreak'
              ? 'bg-emerald-500 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700'
          }`}
        >
          Short ☕
        </button>
        <button
          onClick={() => handleSwitchMode('longBreak')}
          className={`py-1.5 px-2 rounded-lg font-pixel text-[8px] transition-all ${
            pomodoro.mode === 'longBreak'
              ? 'bg-purple-500 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700'
          }`}
        >
          Long 🌴
        </button>
      </div>

      {/* Settings Modal Drawer */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-pink-50 dark:bg-slate-800 p-3 rounded-xl border border-pink-300 dark:border-cyan-500 mb-3 space-y-2 text-xs"
        >
          <div className="font-pixel text-[9px] text-pink-600 dark:text-cyan-400">Custom Durations:</div>
          <div className="flex items-center justify-between">
            <span className="font-body text-slate-700 dark:text-slate-300">Focus Time (min):</span>
            <input
              type="number"
              min="1"
              max="90"
              value={customFocus}
              onChange={(e) => setCustomFocus(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border rounded font-pixel text-xs text-center"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-slate-700 dark:text-slate-300">Break Time (min):</span>
            <input
              type="number"
              min="1"
              max="30"
              value={customBreak}
              onChange={(e) => setCustomBreak(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border rounded font-pixel text-xs text-center"
            />
          </div>
          <button
            onClick={handleSaveSettings}
            className="w-full py-1 rounded bg-pink-500 text-white font-pixel text-[8px] hover:bg-pink-600"
          >
            Apply Timers
          </button>
        </motion.div>
      )}

      {/* Retro Digital Clock Display with Circular Progress Background */}
      <div className="relative flex flex-col items-center justify-center py-5 bg-gradient-to-b from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-950 rounded-xl border-2 border-pink-300 dark:border-cyan-500/50 mb-4 overflow-hidden">
        {/* Progress Bar Top Fill */}
        <div
          className="absolute top-0 left-0 bottom-0 bg-pink-300/30 dark:bg-cyan-500/15 transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />

        <span className="font-pixel text-3xl sm:text-4xl text-slate-800 dark:text-cyan-300 pixel-shadow-pink dark:pixel-shadow-cyan tracking-wider z-10">
          {formatTime(pomodoro.timeLeft)}
        </span>

        <span className="text-xs font-pixel text-pink-600 dark:text-fuchsia-400 mt-2 z-10 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {pomodoro.mode === 'focus' ? 'Focus Session Active' : 'Rest & Refresh'}
        </span>
      </div>

      {/* Timer Controls (Play, Pause, Reset, Skip) */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <button
          onClick={handleReset}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:scale-105 active:scale-95 transition-transform"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={handleTogglePlay}
          className={`px-6 py-2.5 rounded-xl font-pixel text-xs text-white shadow-md flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 ${
            pomodoro.isRunning
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'bg-gradient-to-r from-pink-500 to-rose-500 dark:from-cyan-500 dark:to-blue-600'
          }`}
        >
          {pomodoro.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{pomodoro.isRunning ? 'PAUSE' : 'START'}</span>
        </button>

        <button
          onClick={handleSkip}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:scale-105 active:scale-95 transition-transform"
          title="Skip to next phase"
        >
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      {/* Completed Intervals Count */}
      <div className="text-center text-[10px] font-pixel text-slate-500 dark:text-slate-400">
        Completed Sessions: <span className="text-pink-600 dark:text-cyan-400 font-bold">{pomodoro.totalSessionsCompleted} 🍅</span>
      </div>
    </div>
  );
};
