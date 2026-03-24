import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Trophy, Play, Zap } from 'lucide-react';
import { useStore } from '../../store';

interface Coin {
  id: number;
  x: number;
  y: number;
  speed: number;
}

export default function CoinCatcher({ onComplete }: { onComplete: () => void }) {
  const { updatePetStats } = useStore();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [basketX, setBasketX] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(0, Math.min(100, x)));
  };

  useEffect(() => {
    let timer: any;
    let coinInterval: any;
    let moveInterval: any;

    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      
      coinInterval = setInterval(() => {
        setCoins(prev => [
          ...prev,
          { id: Date.now(), x: Math.random() * 90 + 5, y: -10, speed: Math.random() * 2 + 1 }
        ]);
      }, 800);

      moveInterval = setInterval(() => {
        setCoins(prev => {
          const next = prev.map(c => ({ ...c, y: c.y + c.speed }));
          const caught = next.filter(c => c.y > 80 && c.y < 95 && Math.abs(c.x - basketX) < 10);
          if (caught.length > 0) setScore(s => s + caught.length);
          return next.filter(c => c.y < 100 && !caught.includes(c));
        });
      }, 16);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      setFinished(true);
      updatePetStats({ energy: 5 }, 20, 50, 'play');
    }

    return () => {
      clearInterval(timer);
      clearInterval(coinInterval);
      clearInterval(moveInterval);
    };
  }, [isPlaying, timeLeft, basketX]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setCoins([]);
    setFinished(false);
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-b from-amber-50 to-white"
    >
      {!isPlaying && !finished ? (
        <div className="text-center z-10">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Coins className="w-10 h-10 text-amber-600" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-2">Coin Catcher</h3>
          <p className="text-gray-500 mb-8 font-medium leading-relaxed">
            Move your mouse to catch the falling coins!<br />
            Earn Coins and Energy.
          </p>
          <button
            onClick={startGame}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg flex items-center gap-2 mx-auto"
          >
            <Play className="w-5 h-5" />
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="absolute top-6 left-6 flex items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-100 shadow-sm z-10">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Coins:</span>
              <span className="text-lg font-black text-amber-600">{score}</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time:</span>
              <span className="text-lg font-black text-gray-900">{timeLeft}s</span>
            </div>
          </div>

          {/* Basket */}
          <div 
            className="absolute bottom-10 w-24 h-12 bg-amber-800 rounded-b-3xl rounded-t-lg shadow-xl flex items-center justify-center text-2xl transition-all duration-75"
            style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}
          >
            🧺
          </div>

          {/* Falling Coins */}
          {coins.map(coin => (
            <div 
              key={coin.id}
              className="absolute text-2xl"
              style={{ left: `${coin.x}%`, top: `${coin.y}%`, transform: 'translateX(-50%)' }}
            >
              💰
            </div>
          ))}
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
            <h4 className="text-3xl font-black text-gray-900 mb-2">Rich Catch!</h4>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You caught {score} coins.<br />
              <span className="font-bold text-amber-600">Energy +5, Coins +50, XP +20</span>
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
