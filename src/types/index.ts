export type ThemeMode = 'kawaii' | 'cyber';

export type BackdropId = 
  | 'anime_bedroom' 
  | 'rainy_cafe' 
  | 'midnight_library' 
  | 'kawaii_bakery' 
  | 'cyberpunk_room' 
  | 'lofi_desk' 
  | 'custom';

export type PetSpecies = 'cat' | 'shiba' | 'bunny' | 'dragon' | 'panda';

export interface UserProfile {
  id: string;
  name: string;
  avatarId: string;
  frameId: string;
  badge: string;
  studyMinutes: number;
  pomodorosCompleted: number;
  petsEvolved: number;
}

export interface RoomParticipant {
  id: string;
  name: string;
  avatarId: string;
  frameId: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  isHost: boolean;
  badge: string;
  x?: number;
  y?: number;
}

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  focusDuration: number; // in minutes (default 25)
  shortBreakDuration: number; // in minutes (default 5)
  longBreakDuration: number; // in minutes (default 15)
  totalSessionsCompleted: number;
  lastUpdated: number;
}

export type MusicSource = 'youtube' | 'spotify';

export interface YouTubeState {
  videoId: string;
  videoTitle: string;
  isPlaying: boolean;
  currentTime: number; // in seconds
  lastSyncTimestamp: number;
  displayMode?: 'video' | 'audio'; // 'video' = visible responsive 16:9 player, 'audio' = compact lo-fi bar
}

export interface SpotifyState {
  uriOrUrl: string;
  title: string;
  embedType: 'playlist' | 'track' | 'album';
  embedId: string;
  viewMode: 'compact' | 'full'; // 'compact' = 152px, 'full' = 352px
  lastSyncTimestamp: number;
}

export interface PetState {
  species: PetSpecies;
  name: string;
  stage: 0 | 1 | 2 | 3; // 0: Egg, 1: Baby, 2: Juvenile, 3: Companion
  xp: number;
  maxExp: number;
  happiness: number; // 0 to 100
  hunger: number; // 0 to 100 (100 = full)
  isSleeping: boolean;
  lastInteraction: number;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  x: number; // percent
  y: number; // percent
  scale: number;
  rotation: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatarId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export type MiniGameType = 
  | 'guess_person' 
  | 'word_finder' 
  | 'tic_tac_toe' 
  | 'connect_four' 
  | 'trivia_quiz' 
  | 'whiteboard'
  | null;

// Guess the Person types
export interface GuessPersonCharacter {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'nonbinary';
  hairColor: 'blonde' | 'brown' | 'pink' | 'black' | 'cyan' | 'purple';
  eyeColor: 'blue' | 'brown' | 'green' | 'pink';
  skinTone: 'fair' | 'peach' | 'tan' | 'warm';
  hasGlasses: boolean;
  hasHat: boolean;
  hasEarrings: boolean;
  hasBlush: boolean;
  clothingColor: 'pink' | 'blue' | 'purple' | 'green' | 'yellow' | 'black';
  avatarSvgKey: string;
}

export interface GuessPersonState {
  players: Record<string, {
    secretCharId: string | null;
    eliminatedIds: string[];
    ready: boolean;
  }>;
  currentTurn: string | null;
  history: {
    askerId: string;
    askerName: string;
    question: string;
    answer: boolean;
  }[];
  winner: string | null;
  isGameOver: boolean;
}

// Word Finder types
export interface WordFinderState {
  letters: string[];
  timeLeft: number;
  isActive: boolean;
  roundDuration: number;
  playerScores: Record<string, {
    playerName: string;
    words: string[];
    score: number;
  }>;
  validWordsList?: string[];
  winner: string | null;
}

// Tic Tac Toe types
export interface TicTacToeState {
  board: (string | null)[];
  currentTurn: 'X' | 'O';
  players: {
    X: { id: string; name: string } | null;
    O: { id: string; name: string } | null;
  };
  winner: 'X' | 'O' | 'draw' | null;
  winningLine: number[] | null;
}

// Connect Four types
export interface ConnectFourState {
  board: (string | null)[][]; // 6 rows x 7 cols
  currentTurn: 'red' | 'yellow';
  players: {
    red: { id: string; name: string } | null;
    yellow: { id: string; name: string } | null;
  };
  winner: 'red' | 'yellow' | 'draw' | null;
  winningCells: [number, number][] | null;
}

// Trivia & Study Flashcard types
export interface TriviaQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface TriviaQuizState {
  deckTitle: string;
  questions: TriviaQuestion[];
  currentQuestionIndex: number;
  timeLeft: number;
  isActive: boolean;
  answersRevealed: boolean;
  playerAnswers: Record<string, { choice: number; timeBonus: number }>;
  playerScores: Record<string, { name: string; score: number; streak: number }>;
  isFinished: boolean;
}

// Whiteboard types
export interface WhiteboardStroke {
  id: string;
  userId: string;
  tool: 'brush' | 'eraser';
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export interface RoomState {
  id: string;
  name: string;
  theme: ThemeMode;
  backdropId: BackdropId;
  customBackdropUrl?: string;
  participants: Record<string, RoomParticipant>;
  pomodoro: PomodoroState;
  youtube: YouTubeState;
  spotify: SpotifyState;
  activeMusicSource: MusicSource;
  pet: PetState;
  placedStickers: PlacedSticker[];
  activeGame: MiniGameType;
  chatMessages: ChatMessage[];
  // Active game states
  guessPersonGame?: GuessPersonState;
  wordFinderGame?: WordFinderState;
  ticTacToeGame?: TicTacToeState;
  connectFourGame?: ConnectFourState;
  triviaQuizGame?: TriviaQuizState;
  whiteboardStrokes?: WhiteboardStroke[];
}
