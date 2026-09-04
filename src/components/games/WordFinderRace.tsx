import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Timer, Sparkles, Send, RefreshCw, Flame, CheckCircle, XCircle } from 'lucide-react';
import { getRandomLetterSet, isValidWord, calculateWordScore } from '../../services/dictionary';
import { useAuth } from '../../context/AuthContext';
import { audioSynth } from '../../services/audioSynthesizer';
import confetti from 'canvas-confetti';

export const WordFinderRace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();

  const [letters, setLetters] = useState<string[]>(() => getRandomLetterSet());
  const [currentWord, setCurrentWord] = useState<string>('');
  const [foundWords, setFoundWords] = useState<{ word: string; score: number }[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const timerRef = useRef<number | null>(null);

  // Timer countdown loop
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            audioSynth.playPomodoroAlarm();
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTileClick = (letter: string) => {
    if (!isActive) return;
    audioSynth.playClick();
    setCurrentWord((prev) => prev + letter);
  };

  const handleBackspace = () => {
    setCurrentWord((prev) => prev.slice(0, -1));
  };

  const handleSubmitWord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isActive || !currentWord.trim()) return;

    const candidate = currentWord.trim().toUpperCase();

    // Check if already found
    if (foundWords.some((w) => w.word === candidate)) {
      setFeedback({ msg: 'Already found this word!', type: 'error' });
      audioSynth.playBuzz();
      setCurrentWord('');
      return;
    }

    // Validate in dictionary
    if (isValidWord(candidate, letters)) {
      const score = calculateWordScore(candidate);
      setFoundWords((prev) => [{ word: candidate, score }, ...prev]);
      setTotalScore((prev) => prev + score);
      setFeedback({ msg: `+${score} PTS! Valid word! ✨`, type: 'success' });
      audioSynth.playVictoryFanfare();
    } else {
      setFeedback({ msg: 'Not in dictionary or invalid letters!', type: 'error' });
      audioSynth.playBuzz();
    }

    setCurrentWord('');
    setTimeout(() => setFeedback(null), 1800);
  };

  const handleRestart = () => {
    setLetters(getRandomLetterSet());
    setCurrentWord('');
    setFoundWords([]);
    setTotalScore(0);
    setTimeLeft(60);
    setIsActive(true);
    setFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border-4 border-pink-400 dark:border-cyan-400 rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-3xl my-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="font-pixel text-sm sm:text-base text-pink-600 dark:text-cyan-400 font-bold">
                WORD FINDER RACE
              </h2>
              <p className="font-body text-xs text-slate-500 dark:text-slate-400">
                Form as many English words (3-7+ letters) before the timer runs out!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-cyan-400 hover:scale-105 transition-transform"
              title="Restart Game"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-pixel text-xs hover:bg-red-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stats Header Bar (Time Left + Score) */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-pink-50 dark:bg-slate-800 border-2 border-pink-300 dark:border-cyan-500 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-pink-500 dark:text-cyan-400" />
              <span className="font-pixel text-xs text-slate-700 dark:text-slate-200">TIME:</span>
            </div>
            <span
              className={`font-pixel text-lg font-bold ${
                timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-pink-600 dark:text-cyan-400'
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          <div className="bg-pink-50 dark:bg-slate-800 border-2 border-pink-300 dark:border-cyan-500 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span className="font-pixel text-xs text-slate-700 dark:text-slate-200">SCORE:</span>
            </div>
            <span className="font-pixel text-lg font-bold text-amber-600 dark:text-amber-400">
              {totalScore} PTS
            </span>
          </div>
        </div>

        {/* Scramble Letter Tiles */}
        <div className="flex justify-center flex-wrap gap-2.5 mb-5">
          {letters.map((letter, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTileClick(letter)}
              className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-gradient-to-b from-amber-100 to-amber-200 dark:from-slate-800 dark:to-slate-900 border-3 border-amber-400 dark:border-cyan-400 shadow-pixel-kawaii dark:shadow-pixel-cyber flex items-center justify-center font-pixel text-xl text-slate-900 dark:text-cyan-300 cursor-pointer"
            >
              {letter}
            </motion.button>
          ))}
        </div>

        {/* Word Input & Submit Form */}
        <form onSubmit={handleSubmitWord} className="flex gap-2 mb-4">
          <input
            type="text"
            value={currentWord}
            onChange={(e) => setCurrentWord(e.target.value.toUpperCase())}
            disabled={!isActive}
            placeholder={isActive ? 'Type or click tiles...' : 'Game Over!'}
            className="flex-1 px-4 py-3 bg-pink-50 dark:bg-slate-950 border-2 border-pink-300 dark:border-cyan-500 rounded-2xl font-pixel text-sm text-center tracking-widest uppercase focus:outline-none focus:border-pink-500 dark:focus:border-cyan-300 disabled:opacity-50"
          />

          <button
            type="button"
            onClick={handleBackspace}
            className="px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-pixel text-xs hover:bg-slate-300 transition-colors"
          >
            DEL
          </button>

          <button
            type="submit"
            disabled={!isActive || !currentWord}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 dark:from-cyan-500 dark:to-blue-600 text-white font-pixel text-xs shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>SUBMIT</span>
          </button>
        </form>

        {/* Feedback Alert */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-2 rounded-xl text-center font-body text-xs font-bold flex items-center justify-center gap-1.5 mb-3 ${
                feedback.type === 'success'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>{feedback.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Found Words List */}
        <div className="flex-1 bg-pink-50/50 dark:bg-slate-950/60 border border-pink-200 dark:border-slate-800 rounded-2xl p-3 overflow-y-auto max-h-48">
          <div className="flex items-center justify-between font-pixel text-[9px] text-pink-600 dark:text-cyan-400 mb-2">
            <span>FOUND WORDS ({foundWords.length})</span>
            <span>TOTAL: {totalScore} PTS</span>
          </div>

          {foundWords.length === 0 ? (
            <p className="text-xs font-body text-slate-400 italic text-center py-4">
              No words submitted yet. Combine the scramble letters above!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {foundWords.map((fw, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 border border-pink-300 dark:border-cyan-500/50 px-2.5 py-1 rounded-xl font-pixel text-[9px] text-slate-800 dark:text-cyan-200 flex items-center gap-1.5 shadow-sm"
                >
                  <span>{fw.word}</span>
                  <span className="text-amber-500 font-bold">+{fw.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game Over Summary Modal */}
        {!isActive && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100 dark:from-slate-800 dark:to-cyan-950 border-2 border-pink-400 dark:border-cyan-400 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-500 mx-auto mb-1 animate-bounce" />
            <h3 className="font-pixel text-sm text-pink-600 dark:text-cyan-300 mb-1">
              TIME'S UP! FINAL SCORE: {totalScore} PTS
            </h3>
            <p className="font-body text-xs text-slate-600 dark:text-slate-300 mb-3">
              You found {foundWords.length} words with the scramble letters!
            </p>
            <button
              onClick={handleRestart}
              className="pixel-button-kawaii dark:pixel-button-cyber text-xs px-6 py-2"
            >
              Play Another Round 🔄
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
