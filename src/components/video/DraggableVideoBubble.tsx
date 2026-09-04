import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';
import { RoomParticipant } from '../../types';
import { AvatarFrameOverlay } from '../props/AvatarFrames';
import { CharacterFaceSvg, GUESS_CHARACTERS } from '../props/GuessWhoCharacters';

interface DraggableVideoBubbleProps {
  participant: RoomParticipant;
  isSelf: boolean;
  stream: MediaStream | null;
  onToggleMic?: () => void;
  onToggleCam?: () => void;
  initialX?: number;
  initialY?: number;
}

export const DraggableVideoBubble: React.FC<DraggableVideoBubbleProps> = ({
  participant,
  isSelf,
  stream,
  onToggleMic,
  onToggleCam,
  initialX = 80,
  initialY = 120,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Find character for fallback face avatar if camera is off
  const character = GUESS_CHARACTERS.find((c) => c.id === participant.avatarId) || GUESS_CHARACTERS[0];

  return (
    <motion.div
      drag
      dragConstraints={{ left: 20, right: window.innerWidth - 180, top: 70, bottom: window.innerHeight - 180 }}
      dragElastic={0.1}
      initial={{ x: initialX, y: initialY, scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.1, cursor: 'grabbing', zIndex: 100 }}
      className="absolute z-30 cursor-grab select-none touch-none"
    >
      <div className="relative group">
        {/* Animated Speaking Pulse Ring */}
        {participant.isSpeaking && (
          <div className="absolute -inset-2 rounded-full border-4 border-cyan-400 dark:border-pink-500 animate-ping opacity-75" />
        )}

        {/* Circular Avatar Container */}
        <div
          className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 shadow-xl transition-all duration-200 bg-slate-900 ${
            participant.isSpeaking
              ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.8)]'
              : 'border-pink-400 dark:border-purple-500'
          }`}
        >
          {/* Video Stream */}
          {!participant.isVideoOff && stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isSelf} // Mute own video to avoid audio loopback
              className="w-full h-full object-cover mirror-mode"
            />
          ) : (
            /* Fallback Character Face */
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-pink-200 to-purple-300 dark:from-slate-800 dark:to-slate-900">
              <CharacterFaceSvg character={character} className="w-20 h-20" />
            </div>
          )}

          {/* Avatar Decorative Frame Overlay */}
          <AvatarFrameOverlay frameId={participant.frameId} />

          {/* Quick controls on Hover for Self */}
          {isSelf && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMic?.();
                }}
                className={`p-2 rounded-full text-white shadow-md ${
                  participant.isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
                title={participant.isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {participant.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCam?.();
                }}
                className={`p-2 rounded-full text-white shadow-md ${
                  participant.isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
                title={participant.isVideoOff ? 'Turn Cam On' : 'Turn Cam Off'}
              >
                {participant.isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Status Badges & Name Tag */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <div className="bg-white/95 dark:bg-slate-900/95 border-2 border-pink-400 dark:border-cyan-400 px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
            {participant.isHost && <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
            <span className="font-pixel text-[9px] text-slate-800 dark:text-cyan-300">
              {participant.name} {isSelf && '(You)'}
            </span>
            {participant.isMuted ? (
              <MicOff className="w-3 h-3 text-red-500" />
            ) : (
              <Mic className="w-3 h-3 text-emerald-500" />
            )}
          </div>
          <span className="text-[10px] text-pink-700 dark:text-purple-300 font-bold drop-shadow">
            {participant.badge}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
