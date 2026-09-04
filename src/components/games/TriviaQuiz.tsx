import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy, Timer, CheckCircle, XCircle, Sparkles, RefreshCw, PlusCircle } from 'lucide-react';
import { TriviaQuestion } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';
import confetti from 'canvas-confetti';

const BUILTIN_DECKS: Record<string, { title: string; icon: string; questions: TriviaQuestion[] }> = {
  cs_web: {
    title: 'Web Dev & Computer Science',
    icon: '💻',
    questions: [
      {
        id: 'q1',
        category: 'Web Dev',
        question: 'Which HTTP status code signifies "Created" when a resource is successfully added?',
        options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'],
        correctIndex: 1,
        explanation: '201 Created indicates the request succeeded and led to resource creation.',
      },
      {
        id: 'q2',
        category: 'TypeScript',
        question: 'What TypeScript utility type constructs a type with all properties of T set to optional?',
        options: ['Required<T>', 'Readonly<T>', 'Partial<T>', 'Pick<T, K>'],
        correctIndex: 2,
        explanation: 'Partial<T> marks all properties in T as optional (? notation).',
      },
      {
        id: 'q3',
        category: 'Data Structures',
        question: 'What is the worst-case time complexity of searching in a balanced Binary Search Tree (AVL/Red-Black)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 1,
        explanation: 'Balanced BSTs maintain height proportional to log(n), giving O(log n) lookup.',
      },
      {
        id: 'q4',
        category: 'Networking',
        question: 'What protocol does WebSockets upgrade from during its initial handshake?',
        options: ['HTTP/1.1 or HTTP/2', 'FTP', 'SSH', 'SMTP'],
        correctIndex: 0,
        explanation: 'WebSockets initiate via a standard HTTP Upgrade header request.',
      },
    ],
  },
  science: {
    title: 'General Science & Astronomy',
    icon: '🌌',
    questions: [
      {
        id: 's1',
        category: 'Astronomy',
        question: 'Which planet in our solar system has the most moons (as of recent discoveries)?',
        options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
        correctIndex: 1,
        explanation: 'Saturn leads with over 140 confirmed natural satellites.',
      },
      {
        id: 's2',
        category: 'Physics',
        question: 'What is the speed of light in a vacuum approximately in kilometers per second?',
        options: ['150,000 km/s', '300,000 km/s', '1,000,000 km/s', '30,000 km/s'],
        correctIndex: 1,
        explanation: 'The exact value is 299,792 km/s (~300,000 km/s).',
      },
      {
        id: 's3',
        category: 'Biology',
        question: 'What organelle is famously known as the "powerhouse of the cell"?',
        options: ['Ribosome', 'Mitochondria', 'Golgi apparatus', 'Endoplasmic reticulum'],
        correctIndex: 1,
        explanation: 'Mitochondria produce ATP through cellular respiration.',
      },
    ],
  },
  pop_culture: {
    title: 'Anime, Gaming & Lo-Fi Vibes',
    icon: '🎮',
    questions: [
      {
        id: 'p1',
        category: 'Studio Ghibli',
        question: 'Which Studio Ghibli movie features a magical soot sprite called "Susuwatari"?',
        options: ['My Neighbor Totoro / Spirited Away', 'Princess Mononoke', 'Howl\'s Moving Castle', 'Ponyo'],
        correctIndex: 0,
        explanation: 'Soot sprites appear in both Totoro and Spirited Away!',
      },
      {
        id: 'p2',
        category: 'Retro Gaming',
        question: 'In what year was the original Nintendo Game Boy released in Japan?',
        options: ['1985', '1989', '1992', '1995'],
        correctIndex: 1,
        explanation: 'The Game Boy launched in April 1989.',
      },
    ],
  },
};

export const TriviaQuiz: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedDeckKey, setSelectedDeckKey] = useState<string>('cs_web');
  const [questions, setQuestions] = useState<TriviaQuestion[]>(BUILTIN_DECKS['cs_web'].questions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);

  // Custom question creator modal
  const [showCreator, setShowCreator] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState({
    category: 'Custom Study',
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
  });

  const timerRef = useRef<number | null>(null);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (!isAnswerRevealed && !isFinished && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnswerRevealed, isFinished, timeLeft]);

  const handleTimeUp = () => {
    setIsAnswerRevealed(true);
    setStreak(0);
    audioSynth.playBuzz();
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerRevealed || isFinished) return;

    setSelectedOption(idx);
    setIsAnswerRevealed(true);

    if (idx === currentQ.correctIndex) {
      const bonus = timeLeft * 10;
      const pts = 100 + bonus;
      setScore((s) => s + pts);
      setStreak((st) => st + 1);
      audioSynth.playVictoryFanfare();
    } else {
      setStreak(0);
      audioSynth.playBuzz();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setTimeLeft(15);
    } else {
      setIsFinished(true);
      audioSynth.playVictoryFanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleSelectDeck = (key: string) => {
    setSelectedDeckKey(key);
    setQuestions(BUILTIN_DECKS[key].questions);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setIsFinished(false);
    setTimeLeft(15);
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.question.trim() || newQuestion.options.some((o) => !o.trim())) return;

    const created: TriviaQuestion = {
      id: 'custom_' + Date.now(),
      category: newQuestion.category,
      question: newQuestion.question,
      options: newQuestion.options,
      correctIndex: newQuestion.correctIndex,
      explanation: newQuestion.explanation || 'Custom user created question',
    };

    setQuestions((prev) => [...prev, created]);
    setShowCreator(false);
    audioSynth.playVictoryFanfare();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border-4 border-pink-400 dark:border-cyan-400 rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-2xl my-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <div>
              <h2 className="font-pixel text-sm sm:text-base text-pink-600 dark:text-cyan-400 font-bold">
                STUDY FLASHCARD QUIZ
              </h2>
              <p className="font-body text-xs text-slate-500 dark:text-slate-400">
                Answer trivia questions or test your own custom study deck!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreator(true)}
              className="px-2.5 py-1 rounded-xl bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-cyan-400 font-pixel text-[8px] flex items-center gap-1 border border-pink-300 hover:scale-105"
            >
              <PlusCircle className="w-3.5 h-3.5" /> + Deck Card
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-pixel text-xs hover:bg-red-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Deck Picker Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
          {Object.entries(BUILTIN_DECKS).map(([key, deck]) => (
            <button
              key={key}
              onClick={() => handleSelectDeck(key)}
              className={`px-3 py-1.5 rounded-xl font-pixel text-[8px] whitespace-nowrap flex items-center gap-1.5 border transition-all ${
                selectedDeckKey === key
                  ? 'bg-pink-500 text-white border-pink-600 shadow-sm'
                  : 'bg-pink-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-pink-200 dark:border-slate-700 hover:bg-pink-100'
              }`}
            >
              <span>{deck.icon}</span>
              <span>{deck.title}</span>
            </button>
          ))}
        </div>

        {/* Score & Timer Bar */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center font-pixel text-[10px]">
          <div className="bg-pink-50 dark:bg-slate-800 p-2 rounded-xl border border-pink-300">
            <span className="block text-slate-500 text-[8px]">CARD</span>
            <span className="font-bold text-pink-600 dark:text-cyan-400">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          <div className="bg-amber-50 dark:bg-slate-800 p-2 rounded-xl border border-amber-300">
            <span className="block text-slate-500 text-[8px]">SCORE (🔥 {streak})</span>
            <span className="font-bold text-amber-500">{score} PTS</span>
          </div>

          <div className="bg-cyan-50 dark:bg-slate-800 p-2 rounded-xl border border-cyan-300">
            <span className="block text-slate-500 text-[8px]">TIME</span>
            <span className={`font-bold ${timeLeft <= 4 ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Finished Summary or Active Question */}
        {isFinished ? (
          <div className="py-8 text-center flex flex-col items-center justify-center">
            <Trophy className="w-16 h-16 text-yellow-400 fill-yellow-400 animate-bounce mb-2" />
            <h3 className="font-pixel text-base text-pink-600 dark:text-cyan-300 mb-2">
              QUIZ COMPLETED! 🎉
            </h3>
            <p className="font-body text-slate-700 dark:text-slate-200 text-sm mb-4">
              Final Score: <span className="font-bold text-pink-500">{score} Points</span>!
            </p>
            <button
              onClick={() => handleSelectDeck(selectedDeckKey)}
              className="pixel-button-kawaii dark:pixel-button-cyber text-xs px-6 py-2.5"
            >
              Retry Deck 🔄
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Question Card */}
            <div className="bg-gradient-to-b from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-950 p-4 rounded-2xl border-2 border-pink-300 dark:border-cyan-500/50 shadow-sm">
              <span className="font-pixel text-[8px] text-pink-600 dark:text-cyan-400 uppercase tracking-widest block mb-1">
                [{currentQ.category}]
              </span>
              <h3 className="font-body font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* 4 Multiple Choice Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'bg-white dark:bg-slate-800 border-pink-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-pink-50';

                if (isAnswerRevealed) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerRevealed}
                    className={`p-3 rounded-2xl border-2 font-body text-xs sm:text-sm text-left flex items-center justify-between transition-all ${btnStyle} shadow-sm`}
                  >
                    <span>{option}</span>
                    {isAnswerRevealed && (
                      <span>
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : isSelected ? (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Button */}
            {isAnswerRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-50 dark:bg-slate-800 p-3 rounded-2xl border border-purple-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2"
              >
                <div className="text-xs font-body text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-pink-600 dark:text-cyan-400 font-pixel text-[9px] block">
                    EXPLANATION:
                  </span>
                  {currentQ.explanation}
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 dark:from-cyan-500 dark:to-blue-600 text-white font-pixel text-xs hover:scale-105 transition-transform shrink-0"
                >
                  {currentIndex + 1 < questions.length ? 'Next Question ➡️' : 'See Results 🏆'}
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Custom Flashcard Modal Creator */}
        {showCreator && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-3 border-pink-400 dark:border-cyan-400 w-full max-w-md shadow-2xl">
              <h3 className="font-pixel text-xs text-pink-600 dark:text-cyan-400 mb-3">
                Add Custom Study Question:
              </h3>
              <form onSubmit={handleAddCustomQuestion} className="space-y-2 text-xs font-body">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-0.5">Question Text:</label>
                  <input
                    type="text"
                    required
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl bg-slate-50 dark:bg-slate-800"
                    placeholder="What is...?"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-0.5">4 Choices (Select correct):</label>
                  {newQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-1.5 mb-1">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={newQuestion.correctIndex === i}
                        onChange={() => setNewQuestion({ ...newQuestion, correctIndex: i })}
                      />
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...newQuestion.options];
                          nextOpts[i] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: nextOpts });
                        }}
                        className="flex-1 px-2.5 py-1 border rounded-lg bg-slate-50 dark:bg-slate-800 text-xs"
                        placeholder={`Option ${i + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreator(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-pink-500 text-white font-bold"
                  >
                    Add to Deck
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
