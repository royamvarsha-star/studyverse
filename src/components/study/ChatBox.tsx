import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Smile, Sparkles } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { CharacterFaceSvg, GUESS_CHARACTERS } from '../props/GuessWhoCharacters';

const QUICK_EMOJIS = ['✨', '💖', '☕', '🌸', '🐱', '🎮', '📚', '🔥', '🎉'];

export const ChatBox: React.FC = () => {
  const { roomState, sendChat } = useSocket();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomState.chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChat(inputText);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border-3 border-pink-400 dark:border-cyan-400 p-4 shadow-pixel-kawaii dark:shadow-pixel-cyber w-full max-w-sm flex flex-col h-80">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-pink-200 dark:border-slate-800 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-1.5 font-pixel text-xs text-pink-600 dark:text-cyan-400">
          <MessageSquare className="w-4 h-4 text-pink-500 dark:text-cyan-400" />
          <span>ROOM CHAT</span>
        </div>
        <span className="font-pixel text-[8px] text-slate-500 dark:text-slate-400">
          {Object.keys(roomState.participants).length || 1} online
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2">
        {roomState.chatMessages.map((msg) => {
          const isMe = msg.senderId === user.id;
          const char = GUESS_CHARACTERS.find((c) => c.id === msg.avatarId) || GUESS_CHARACTERS[0];

          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="bg-pink-100/70 dark:bg-cyan-950/40 border border-pink-200 dark:border-cyan-800/50 rounded-xl p-2 text-center"
              >
                <p className="font-body text-xs text-pink-900 dark:text-cyan-200 font-semibold">{msg.text}</p>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-pink-300 dark:border-cyan-500 shrink-0 bg-pink-100 dark:bg-slate-800 flex items-center justify-center">
                <CharacterFaceSvg character={char} className="w-6 h-6" />
              </div>

              <div
                className={`max-w-[78%] rounded-2xl px-3 py-1.5 text-xs font-body shadow-sm ${
                  isMe
                    ? 'bg-pink-500 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-pink-200 dark:border-slate-700 rounded-tl-none'
                }`}
              >
                {!isMe && (
                  <span className="font-pixel text-[8px] text-pink-600 dark:text-cyan-400 block mb-0.5">
                    {msg.senderName}
                  </span>
                )}
                <p className="break-words font-medium">{msg.text}</p>
                <span
                  className={`text-[8px] block text-right mt-0.5 opacity-70 ${
                    isMe ? 'text-pink-100' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="bg-white dark:bg-slate-800 border-2 border-pink-300 dark:border-cyan-500 rounded-xl p-2 shadow-lg mb-2 flex items-center justify-around">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="text-base hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1.5 rounded-lg bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-cyan-400 hover:scale-105"
        >
          <Smile className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder="Send a cute message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-pink-300 dark:border-slate-700 rounded-xl text-xs font-body focus:outline-none focus:border-pink-500 dark:focus:border-cyan-400"
        />

        <button
          type="submit"
          className="p-2 rounded-xl bg-pink-500 dark:bg-cyan-500 text-white shadow-md hover:scale-105 transition-transform"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
