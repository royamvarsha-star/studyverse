import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Bot, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { audioSynth } from '../../services/audioSynthesizer';
import confetti from 'canvas-confetti';

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columns
  [0, 4, 8],
  [2, 4, 6], // Diagonals
];

export const TicTacToe: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'💖' | '⭐'>('💖');
  const [winner, setWinner] = useState<'💖' | '⭐' | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [vsBot, setVsBot] = useState<boolean>(true);
  const [scores, setScores] = useState<{ hearts: number; stars: number; draws: number }>({
    hearts: 0,
    stars: 0,
    draws: 0,
  });

  const checkWinner = (newBoard: (string | null)[]) => {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        return { winner: newBoard[a] as '💖' | '⭐', line: combo };
      }
    }
    if (newBoard.every((cell) => cell !== null)) {
      return { winner: 'draw' as const, line: null };
    }
    return null;
  };

  const makeBotMove = (currentBoard: (string | null)[]) => {
    const emptyIndices = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((v): v is number => v !== null);

    if (emptyIndices.length === 0) return;

    // Check if bot can win or block
    let chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

    // Prioritize center
    if (currentBoard[4] === null) {
      chosenIndex = 4;
    }

    const nextBoard = [...currentBoard];
    nextBoard[chosenIndex] = '⭐';

    setTimeout(() => {
      setBoard(nextBoard);
      audioSynth.playClick();

      const res = checkWinner(nextBoard);
      if (res) {
        setWinner(res.winner);
        setWinningLine(res.line);
        if (res.winner === '⭐') {
          audioSynth.playBuzz();
          setScores((s) => ({ ...s, stars: s.stars + 1 }));
        } else if (res.winner === 'draw') {
          setScores((s) => ({ ...s, draws: s.draws + 1 }));
        }
      } else {
        setTurn('💖');
      }
    }, 400);
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || winner) return;

    const nextBoard = [...board];
    nextBoard[idx] = turn;
    setBoard(nextBoard);
    audioSynth.playClick();

    const res = checkWinner(nextBoard);
    if (res) {
      setWinner(res.winner);
      setWinningLine(res.line);
      if (res.winner === '💖') {
        audioSynth.playVictoryFanfare();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setScores((s) => ({ ...s, hearts: s.hearts + 1 }));
      } else if (res.winner === '⭐') {
        audioSynth.playVictoryFanfare();
        setScores((s) => ({ ...s, stars: s.stars + 1 }));
      } else {
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      }
      return;
    }

    const nextTurn = turn === '💖' ? '⭐' : '💖';
    setTurn(nextTurn);

    if (vsBot && nextTurn === '⭐') {
      makeBotMove(nextBoard);
    }
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setTurn('💖');
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border-4 border-pink-400 dark:border-cyan-400 rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-lg my-auto flex flex-col items-center"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-3 mb-4 w-full">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div>
              <h2 className="font-pixel text-sm sm:text-base text-pink-600 dark:text-cyan-400 font-bold">
                TIC-TAC-TOE
              </h2>
              <p className="font-body text-xs text-slate-500 dark:text-slate-400">
                Cute Retro Heart 💖 vs Star ⭐ showdown!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-cyan-400 hover:scale-105 transition-transform"
              title="Reset Round"
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

        {/* Mode Toggle (Bot vs Local 2P) */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => {
              setVsBot(true);
              handleRestart();
            }}
            className={`px-3 py-1 rounded-xl font-pixel text-[9px] flex items-center gap-1 border ${
              vsBot
                ? 'bg-pink-500 text-white border-pink-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> VS Pixel Bot
          </button>
          <button
            onClick={() => {
              setVsBot(false);
              handleRestart();
            }}
            className={`px-3 py-1 rounded-xl font-pixel text-[9px] flex items-center gap-1 border ${
              !vsBot
                ? 'bg-pink-500 text-white border-pink-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 2-Player Pass
          </button>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-3 gap-2 w-full mb-4 text-center font-pixel text-[10px]">
          <div className="bg-pink-50 dark:bg-slate-800 p-2 rounded-xl border border-pink-300">
            <span className="block text-rose-500">💖 Hearts</span>
            <span className="text-sm font-bold">{scores.hearts}</span>
          </div>
          <div className="bg-purple-50 dark:bg-slate-800 p-2 rounded-xl border border-purple-300">
            <span className="block text-slate-500">Draws</span>
            <span className="text-sm font-bold">{scores.draws}</span>
          </div>
          <div className="bg-amber-50 dark:bg-slate-800 p-2 rounded-xl border border-amber-300">
            <span className="block text-amber-500">⭐ Stars</span>
            <span className="text-sm font-bold">{scores.stars}</span>
          </div>
        </div>

        {/* Turn Status */}
        <div className="font-pixel text-xs text-pink-600 dark:text-cyan-400 mb-3">
          {winner
            ? winner === 'draw'
              ? "IT'S A DRAW! 🤝"
              : `WINNER: ${winner} 🎉`
            : `CURRENT TURN: ${turn}`}
        </div>

        {/* 3x3 Grid Board */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-pink-100/60 dark:bg-slate-950 rounded-3xl border-3 border-pink-400 dark:border-cyan-400 shadow-pixel-kawaii dark:shadow-pixel-cyber mb-4">
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: cell ? 1 : 1.05 }}
                whileTap={{ scale: cell ? 1 : 0.95 }}
                onClick={() => handleCellClick(idx)}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 flex items-center justify-center text-3xl sm:text-4xl select-none transition-colors ${
                  isWinningCell
                    ? 'bg-amber-300 dark:bg-cyan-800 border-amber-500 animate-pulse'
                    : 'bg-white dark:bg-slate-800 border-pink-200 dark:border-slate-700 hover:bg-pink-50'
                }`}
              >
                {cell && (
                  <motion.span
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {cell}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Play Again button on game over */}
        {winner && (
          <button
            onClick={handleRestart}
            className="pixel-button-kawaii dark:pixel-button-cyber text-xs px-6 py-2.5"
          >
            Next Round 🔄
          </button>
        )}
      </motion.div>
    </div>
  );
};
