import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Check, X, Trophy, Sparkles, RefreshCw, Eye } from 'lucide-react';
import { GUESS_CHARACTERS, CharacterFaceSvg } from '../props/GuessWhoCharacters';
import { GuessPersonCharacter } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { audioSynth } from '../../services/audioSynthesizer';
import confetti from 'canvas-confetti';

export const GuessThePerson: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const { roomState } = useSocket();

  // Selected secret character for this player
  const [secretCharId, setSecretCharId] = useState<string | null>(null);
  // Opponent simulated or real secret character
  const [opponentCharId, setOpponentCharId] = useState<string>(() => {
    return GUESS_CHARACTERS[Math.floor(Math.random() * GUESS_CHARACTERS.length)].id;
  });

  // Eliminated character IDs on player board
  const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set());

  // Question builder state
  const [questionCategory, setQuestionCategory] = useState<'gender' | 'hairColor' | 'eyeColor' | 'accessories' | 'clothingColor'>('hairColor');
  const [questionValue, setQuestionValue] = useState<string>('pink');

  // Game log history
  const [gameLog, setGameLog] = useState<{ question: string; answer: boolean; isPlayer: boolean }[]>([]);
  // Winner state
  const [winner, setWinner] = useState<string | null>(null);
  const [selectedGuessId, setSelectedGuessId] = useState<string | null>(null);

  const opponentChar = GUESS_CHARACTERS.find((c) => c.id === opponentCharId)!;
  const secretChar = GUESS_CHARACTERS.find((c) => c.id === secretCharId);

  // Toggle eliminate card
  const toggleEliminate = (id: string) => {
    audioSynth.playClick();
    setEliminatedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Ask trait question to opponent
  const handleAskQuestion = () => {
    if (!secretCharId) return;

    let questionText = '';
    let answer = false;

    if (questionCategory === 'hairColor') {
      questionText = `Does your person have ${questionValue} hair?`;
      answer = opponentChar.hairColor === questionValue;
    } else if (questionCategory === 'gender') {
      questionText = `Is your person ${questionValue}?`;
      answer = opponentChar.gender === questionValue;
    } else if (questionCategory === 'eyeColor') {
      questionText = `Does your person have ${questionValue} eyes?`;
      answer = opponentChar.eyeColor === questionValue;
    } else if (questionCategory === 'accessories') {
      if (questionValue === 'glasses') {
        questionText = 'Is your person wearing glasses?';
        answer = opponentChar.hasGlasses;
      } else if (questionValue === 'hat') {
        questionText = 'Is your person wearing a hat?';
        answer = opponentChar.hasHat;
      } else if (questionValue === 'earrings') {
        questionText = 'Is your person wearing earrings?';
        answer = opponentChar.hasEarrings;
      } else {
        questionText = 'Does your person have blush?';
        answer = opponentChar.hasBlush;
      }
    } else if (questionCategory === 'clothingColor') {
      questionText = `Is your person wearing a ${questionValue} shirt?`;
      answer = opponentChar.clothingColor === questionValue;
    }

    if (answer) {
      audioSynth.playVictoryFanfare();
    } else {
      audioSynth.playBuzz();
    }

    setGameLog((prev) => [...prev, { question: questionText, answer, isPlayer: true }]);
  };

  // Guess the exact person
  const handleMakeFinalGuess = (guessedChar: GuessPersonCharacter) => {
    if (guessedChar.id === opponentChar.id) {
      setWinner(user.name);
      audioSynth.playVictoryFanfare();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } else {
      audioSynth.playBuzz();
      setGameLog((prev) => [
        ...prev,
        { question: `Guessed identity was ${guessedChar.name}... Incorrect!`, answer: false, isPlayer: true },
      ]);
      setEliminatedIds((prev) => new Set(prev).add(guessedChar.id));
      setSelectedGuessId(null);
    }
  };

  const handleRestart = () => {
    setSecretCharId(null);
    setOpponentCharId(GUESS_CHARACTERS[Math.floor(Math.random() * GUESS_CHARACTERS.length)].id);
    setEliminatedIds(new Set());
    setGameLog([]);
    setWinner(null);
    setSelectedGuessId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border-4 border-pink-400 dark:border-cyan-400 rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-5xl my-auto max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕵️</span>
            <div>
              <h2 className="font-pixel text-sm sm:text-base text-pink-600 dark:text-cyan-400 font-bold">
                GUESS THE PERSON
              </h2>
              <p className="font-body text-xs text-slate-500 dark:text-slate-400">
                Ask trait questions, flip down ruled-out characters, and solve the identity!
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

        {/* Phase 1: Choose your secret character */}
        {!secretCharId ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <h3 className="font-pixel text-sm text-pink-600 dark:text-cyan-300 mb-2">
              👉 Pick Your Secret Character for the Opponent to Guess:
            </h3>
            <p className="font-body text-xs text-slate-500 mb-4">
              Click any character card below to lock in your identity!
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-[60vh] overflow-y-auto p-2">
              {GUESS_CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    setSecretCharId(char.id);
                    audioSynth.playVictoryFanfare();
                  }}
                  className="bg-pink-50 dark:bg-slate-800 border-2 border-pink-300 dark:border-slate-700 hover:border-pink-500 dark:hover:border-cyan-400 rounded-xl p-2 flex flex-col items-center gap-1 hover:scale-105 transition-all shadow-sm"
                >
                  <CharacterFaceSvg character={char} className="w-12 h-12" />
                  <span className="font-pixel text-[8px] text-slate-800 dark:text-slate-200 truncate w-full">
                    {char.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Phase 2: Active Gameplay Board */
          <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
            {/* Left: 24 Character Board Cards with Flip Down State */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-[10px] text-pink-600 dark:text-cyan-400">
                  YOUR ELIMINATION BOARD (Remaining: {GUESS_CHARACTERS.length - eliminatedIds.size}/24)
                </span>
                <span className="text-xs font-body text-slate-500">
                  Click card to flip down / rule out
                </span>
              </div>

              <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 gap-2 overflow-y-auto pr-1 pb-2">
                {GUESS_CHARACTERS.map((char) => {
                  const isEliminated = eliminatedIds.has(char.id);
                  const isSelectedForGuess = selectedGuessId === char.id;

                  return (
                    <div
                      key={char.id}
                      onClick={() => toggleEliminate(char.id)}
                      className={`relative rounded-xl border-2 p-2 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 ${
                        isEliminated
                          ? 'bg-slate-200/50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800 opacity-30 grayscale scale-95'
                          : isSelectedForGuess
                          ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-500 shadow-lg scale-105'
                          : 'bg-gradient-to-b from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border-pink-300 dark:border-slate-700 hover:scale-105 shadow-sm'
                      }`}
                    >
                      <CharacterFaceSvg character={char} className="w-10 h-10 sm:w-12 sm:h-12" />
                      <span className="font-pixel text-[8px] text-slate-800 dark:text-slate-200 mt-1 truncate w-full text-center">
                        {char.name}
                      </span>

                      {/* Quick Guess Button */}
                      {!isEliminated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMakeFinalGuess(char);
                          }}
                          className="mt-1 px-1.5 py-0.5 rounded bg-pink-500 dark:bg-cyan-500 text-white font-pixel text-[7px] hover:scale-110"
                          title="Guess this person!"
                        >
                          Guess!
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Question Builder & Opponent Log */}
            <div className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
              {/* My Secret Identity Card */}
              <div className="bg-pink-100/70 dark:bg-slate-800/80 border-2 border-pink-400 dark:border-cyan-400 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="font-pixel text-[8px] text-pink-600 dark:text-cyan-400 block mb-1">
                    YOUR SECRET IDENTITY:
                  </span>
                  <p className="font-pixel text-xs font-bold text-slate-800 dark:text-white">
                    {secretChar?.name}
                  </p>
                </div>
                {secretChar && <CharacterFaceSvg character={secretChar} className="w-12 h-12" />}
              </div>

              {/* Question Asker Builder */}
              <div className="bg-white dark:bg-slate-800 border-2 border-pink-300 dark:border-slate-700 rounded-2xl p-3 shadow-sm space-y-2">
                <span className="font-pixel text-[9px] text-pink-600 dark:text-cyan-400 font-bold block">
                  ASK A QUESTION:
                </span>

                {/* Trait Category Selector */}
                <div className="grid grid-cols-3 gap-1">
                  {(['hairColor', 'eyeColor', 'accessories', 'gender', 'clothingColor'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setQuestionCategory(cat);
                        if (cat === 'hairColor') setQuestionValue('pink');
                        if (cat === 'eyeColor') setQuestionValue('blue');
                        if (cat === 'accessories') setQuestionValue('glasses');
                        if (cat === 'gender') setQuestionValue('female');
                        if (cat === 'clothingColor') setQuestionValue('pink');
                      }}
                      className={`px-1.5 py-1 rounded font-pixel text-[7px] truncate border ${
                        questionCategory === cat
                          ? 'bg-pink-500 text-white border-pink-600'
                          : 'bg-pink-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-pink-200 dark:border-slate-600'
                      }`}
                    >
                      {cat.replace('Color', '')}
                    </button>
                  ))}
                </div>

                {/* Value Selector */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {questionCategory === 'hairColor' &&
                    ['pink', 'black', 'blonde', 'brown', 'cyan', 'purple'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setQuestionValue(v)}
                        className={`px-2 py-1 rounded-lg text-xs font-body font-semibold border ${
                          questionValue === v
                            ? 'bg-pink-400 text-white border-pink-600'
                            : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {v}
                      </button>
                    ))}

                  {questionCategory === 'eyeColor' &&
                    ['blue', 'brown', 'green', 'pink'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setQuestionValue(v)}
                        className={`px-2 py-1 rounded-lg text-xs font-body font-semibold border ${
                          questionValue === v
                            ? 'bg-pink-400 text-white border-pink-600'
                            : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {v}
                      </button>
                    ))}

                  {questionCategory === 'accessories' &&
                    ['glasses', 'hat', 'earrings', 'blush'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setQuestionValue(v)}
                        className={`px-2 py-1 rounded-lg text-xs font-body font-semibold border ${
                          questionValue === v
                            ? 'bg-pink-400 text-white border-pink-600'
                            : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {v}
                      </button>
                    ))}

                  {questionCategory === 'gender' &&
                    ['female', 'male', 'nonbinary'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setQuestionValue(v)}
                        className={`px-2 py-1 rounded-lg text-xs font-body font-semibold border ${
                          questionValue === v
                            ? 'bg-pink-400 text-white border-pink-600'
                            : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {v}
                      </button>
                    ))}

                  {questionCategory === 'clothingColor' &&
                    ['pink', 'blue', 'purple', 'green', 'yellow', 'black'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setQuestionValue(v)}
                        className={`px-2 py-1 rounded-lg text-xs font-body font-semibold border ${
                          questionValue === v
                            ? 'bg-pink-400 text-white border-pink-600'
                            : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                </div>

                <button
                  onClick={handleAskQuestion}
                  className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 dark:from-cyan-500 dark:to-blue-600 text-white rounded-xl font-pixel text-[9px] shadow-md hover:scale-105 active:scale-95 transition-transform mt-2"
                >
                  Ask Opponent! 💬
                </button>
              </div>

              {/* Question Log History */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-pink-200 dark:border-slate-800 rounded-2xl p-2.5 overflow-y-auto max-h-48 space-y-1.5">
                <span className="font-pixel text-[8px] text-slate-500 uppercase block mb-1">
                  Investigation History:
                </span>
                {gameLog.length === 0 ? (
                  <p className="text-[11px] font-body text-slate-400 italic">No questions asked yet.</p>
                ) : (
                  gameLog.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-1.5 rounded-lg text-xs font-body flex items-center justify-between ${
                        log.answer
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      <span className="font-semibold">{log.question}</span>
                      <span className="font-pixel text-[9px] ml-2 font-bold">
                        {log.answer ? 'YES! ✅' : 'NO ❌'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Win Modal Banner Overlay */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-4 bg-white/95 dark:bg-slate-900/95 border-4 border-pink-500 dark:border-cyan-400 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-2xl z-40"
            >
              <Trophy className="w-16 h-16 text-yellow-400 fill-yellow-400 animate-bounce mb-3" />
              <h2 className="font-pixel text-xl text-pink-600 dark:text-cyan-400 pixel-shadow-pink mb-2">
                🎉 VICTORY! YOU GUESSED IT!
              </h2>
              <p className="font-body text-slate-700 dark:text-slate-300 text-sm mb-4">
                The opponent's secret identity was indeed <span className="font-bold">{opponentChar.name}</span>!
              </p>
              <CharacterFaceSvg character={opponentChar} className="w-20 h-20 mb-4" />
              <button
                onClick={handleRestart}
                className="pixel-button-kawaii dark:pixel-button-cyber text-xs px-6 py-2.5"
              >
                Play Again 🔄
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
