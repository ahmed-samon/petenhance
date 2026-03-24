import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Trophy, Play } from 'lucide-react';
import { useStore } from '../../store';

export default function FetchGame({ onComplete }: { onComplete: () => void }) {
  const { updatePetStats } = useStore();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const moveBall = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.random() * (rect.width - 60);
    const y = Math.random() * (rect.height - 60);
    setBallPos({ x, y });
  };

  const handleBallClick = () => {
    if (!isPlaying) return;
    setScore(s => s + 1);
    moveBall();
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      setFinished(true);
      updatePetStats({ happiness: 15 }, 30, 0, 'play');
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setFinished(false);
    moveBall();
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {!isPlaying && !finished ? (
        <div className="text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-pink-600" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-2">Pet Fetch</h3>
          <p className="text-gray-500 mb-8 font-medium leading-relaxed">
            Click the ball as many times as you can in 30 seconds!<br />
            Boosts Happiness and XP.
          </p>
          <button
            onClick={startGame}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg flex items-center gap-2 mx-auto"
          >
            <Play className="w-5 h-5" />
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="absolute top-6 left-6 flex items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-pink-100 shadow-sm z-10">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Score:</span>
              <span className="text-lg font-black text-pink-600">{score}</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time:</span>
              <span className="text-lg font-black text-gray-900">{timeLeft}s</span>
            </div>
          </div>

          <AnimatePresence>
            {isPlaying && (
              <motion.button
                key="ball"
                initial={{ scale: 0 }}
                animate={{ scale: 1, x: ballPos.x, y: ballPos.y }}
                exit={{ scale: 0 }}
                onClick={handleBallClick}
                className="absolute w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full shadow-xl flex items-center justify-center text-3xl z-20"
                style={{ top: 0, left: 0 }}
              >
                🎾
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {finished && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 z-[30]"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="text-3xl font-black text-gray-900 mb-2">Great Catch!</h4>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You caught the ball {score} times.<br />
              <span className="font-bold text-pink-600">Happiness +15, XP +30</span>
            </p>
            <button
              onClick={onComplete}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg"
            >
              Back to Arcade
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
