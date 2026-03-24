import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Trophy, RefreshCcw } from 'lucide-react';
import { useStore } from '../../store';

const CARDS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉'];

export default function MemoryGame({ onComplete }: { onComplete: () => void }) {
  const { updatePetStats } = useStore();
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const shuffled = [...CARDS, ...CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, []);

  const handleFlip = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || solved.includes(index)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setSolved([...solved, ...newFlipped]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  useEffect(() => {
    if (solved.length === cards.length && cards.length > 0) {
      setFinished(true);
      updatePetStats({ intelligence: 10 }, 50, 0, 'train');
    }
  }, [solved, cards]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-black text-gray-900 mb-2">Memory Match</h3>
        <p className="text-gray-500 font-medium">Moves: {moves}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 max-w-md w-full">
        {cards.map((card, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFlip(i)}
            className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all shadow-sm ${
              flipped.includes(i) || solved.includes(i) 
                ? 'bg-white border-2 border-indigo-500' 
                : 'bg-indigo-600 text-transparent'
            }`}
          >
            {(flipped.includes(i) || solved.includes(i)) ? card : '?'}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {finished && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 z-10"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="text-3xl font-black text-gray-900 mb-2">Great Memory!</h4>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You matched all cards in {moves} moves.<br />
              <span className="font-bold text-indigo-600">Intelligence +10, XP +50</span>
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
