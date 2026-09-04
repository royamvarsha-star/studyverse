import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Bot, Users } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';
import confetti from 'canvas-confetti';

const ROWS = 6;
const COLS = 7;

type PlayerPiece = '🍓' | '🍋';

export const ConnectFour: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [board, setBoard] = useState<(PlayerPiece | null)[][]>(() =>
    Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null))
  );

  const [currentTurn, setCurrentTurn] = useState<PlayerPiece>('🍓');
  const [winner, setWinner] = useState<PlayerPiece | 'draw' | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][] | null>(null);
  const [vsBot, setVsBot] = useState<boolean>(true);
  const [scores, setScores] = useState({ strawberry: 0, lemon: 0 });

  const checkWin = (grid: (PlayerPiece | null)[][]): { winner: PlayerPiece; cells: [number, number][] } | null => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const p = grid[r][c];
        if (p && p === grid[r][c + 1] && p === grid[r][c + 2] && p === grid[r][c + 3]) {
          return { winner: p, cells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]] };
        }
      }
    }

    // Vertical
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = grid[r][c];
        if (p && p === grid[r + 1][c] && p === grid[r + 2][c] && p === grid[r + 3][c]) {
          return { winner: p, cells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]] };
        }
      }
    }

    // Diagonal down-right
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const p = grid[r][c];
        if (p && p === grid[r + 1][c + 1] && p === grid[r + 2][c + 2] && p === grid[r + 3][c + 3]) {
          return { winner: p, cells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]] };
        }
      }
    }

    // Diagonal up-right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const p = grid[r][c];
        if (p && p === grid[r - 1][c + 1] && p === grid[r - 2][c + 2] && p === grid[r - 3][c + 3]) {
          return { winner: p, cells: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]] };
        }
      }
    }

    return null;
  };

  const isBoardFull = (grid: (PlayerPiece | null)[][]) => {
    return grid.every((row) => row.every((cell) => cell !== null));
  };

  const dropInColumn = (col: number, piece: PlayerPiece, currentGrid: (PlayerPiece | null)[][]) => {
    // Find lowest available row in column
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!currentGrid[r][col]) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return null; // Column is full

    const newGrid = currentGrid.map((row) => [...row]);
    newGrid[targetRow][col] = piece;
    return { newGrid, targetRow, col };
  };

  const handleBotTurn = (grid: (PlayerPiece | null)[][]) => {
    const validCols = [];
    for (let c = 0; c < COLS; c++) {
      if (!grid[0][c]) validCols.push(c);
    }
    if (validCols.length === 0) return;

    const chosenCol = validCols[Math.floor(Math.random() * validCols.length)];
    const result = dropInColumn(chosenCol, '🍋', grid);
    if (!result) return;

    setTimeout(() => {
      setBoard(result.newGrid);
      audioSynth.playClick();

      const winRes = checkWin(result.newGrid);
      if (winRes) {
        setWinner(winRes.winner);
        setWinningCells(winRes.cells);
        setScores((s) => ({ ...s, lemon: s.lemon + 1 }));
        audioSynth.playBuzz();
      } else if (isBoardFull(result.newGrid)) {
        setWinner('draw');
      } else {
        setCurrentTurn('🍓');
      }
    }, 450);
  };

  const handleColumnClick = (col: number) => {
    if (winner) return;

    const result = dropInColumn(col, currentTurn, board);
    if (!result) return;

    setBoard(result.newGrid);
    audioSynth.playClick();

    const winRes = checkWin(result.newGrid);
    if (winRes) {
      setWinner(winRes.winner);
      setWinningCells(winRes.cells);
      if (winRes.winner === '🍓') {
        setScores((s) => ({ ...s, strawberry: s.strawberry + 1 }));
      } else {
        setScores((s) => ({ ...s, lemon: s.lemon + 1 }));
      }
      audioSynth.playVictoryFanfare();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      return;
    }

    if (isBoardFull(result.newGrid)) {
      setWinner('draw');
      return;
    }

    const nextTurn = currentTurn === '🍓' ? '🍋' : '🍓';
    setCurrentTurn(nextTurn);

    if (vsBot && nextTurn === '🍋') {
      handleBotTurn(result.newGrid);
    }
  };

  const handleRestart = () => {
    setBoard(
      Array(ROWS)
        .fill(null)
        .map(() => Array(COLS).fill(null))
    );
    setCurrentTurn('🍓');
    setWinner(null);
    setWinningCells(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border-4 border-pink-400 dark:border-cyan-400 rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-2xl my-auto flex flex-col items-center"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-3 mb-3 w-full">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔴</span>
            <div>
              <h2 className="font-pixel text-sm sm:text-base text-pink-600 dark:text-cyan-400 font-bold">
                CONNECT FOUR
              </h2>
              <p className="font-body text-xs text-slate-500 dark:text-slate-400">
                Drop pieces to align 4 fruits horizontally, vertically, or diagonally!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-cyan-400 hover:scale-105 transition-transform"
              title="Reset Board"
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

        {/* Mode Selector & Scoreboard */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setVsBot(true);
                handleRestart();
              }}
              className={`px-2.5 py-1 rounded-xl font-pixel text-[8px] flex items-center gap-1 border ${
                vsBot ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Bot className="w-3 h-3" /> VS Bot
            </button>
            <button
              onClick={() => {
                setVsBot(false);
                handleRestart();
              }}
              className={`px-2.5 py-1 rounded-xl font-pixel text-[8px] flex items-center gap-1 border ${
                !vsBot ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Users className="w-3 h-3" /> 2-Player
            </button>
          </div>

          <div className="flex items-center gap-3 font-pixel text-[10px]">
            <span className="text-rose-500 font-bold">🍓: {scores.strawberry}</span>
            <span className="text-amber-500 font-bold">🍋: {scores.lemon}</span>
          </div>
        </div>

        {/* Status */}
        <div className="font-pixel text-xs text-pink-600 dark:text-cyan-400 mb-2">
          {winner
            ? winner === 'draw'
              ? "IT'S A DRAW! 🤝"
              : `WINNER: ${winner} 🎉`
            : `CURRENT TURN: ${currentTurn}`}
        </div>

        {/* 7x6 Connect Four Board Grid */}
        <div className="p-3 bg-gradient-to-b from-blue-400 to-indigo-600 dark:from-slate-800 dark:to-cyan-950 rounded-3xl border-4 border-blue-500 dark:border-cyan-400 shadow-2xl">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: COLS }).map((_, c) => (
              <div
                key={c}
                onClick={() => handleColumnClick(c)}
                className="flex flex-col gap-2 cursor-pointer hover:bg-white/10 rounded-2xl p-1 transition-colors"
              >
                {Array.from({ length: ROWS }).map((_, r) => {
                  const piece = board[r][c];
                  const isWinning = winningCells?.some(([wr, wc]) => wr === r && wc === c);

                  return (
                    <div
                      key={r}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-xl sm:text-2xl shadow-inner ${
                        isWinning
                          ? 'bg-amber-300 border-yellow-500 animate-bounce'
                          : piece
                          ? 'bg-white/90 border-white'
                          : 'bg-blue-800/40 dark:bg-slate-900/80 border-blue-900/50'
                      }`}
                    >
                      {piece && (
                        <motion.span
                          initial={{ y: -80, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                        >
                          {piece}
                        </motion.span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Restart button on finish */}
        {winner && (
          <button
            onClick={handleRestart}
            className="pixel-button-kawaii dark:pixel-button-cyber text-xs px-6 py-2.5 mt-4"
          >
            Play Again 🔄
          </button>
        )}
      </motion.div>
    </div>
  );
};
