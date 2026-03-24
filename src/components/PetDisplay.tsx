import { useStore } from '../store';
import { motion } from 'motion/react';
import { Cat, Dog, Flame, Ghost, Circle } from 'lucide-react';

export default function PetDisplay() {
  const { pet } = useStore();

  if (!pet) return null;

  const getIcon = () => {
    switch (pet.type) {
      case 'cat': return <Cat className="w-full h-full" />;
      case 'dog': return <Dog className="w-full h-full" />;
      case 'dragon': return <Flame className="w-full h-full" />;
      case 'alien': return <Ghost className="w-full h-full" />;
      case 'slime': return <Circle className="w-full h-full fill-current" />;
      default: return <Circle className="w-full h-full" />;
    }
  };

  const isHappy = pet.stats.happiness > 70;
  const isHungry = pet.stats.hunger < 30;
  const isTired = pet.stats.energy < 30;

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 blur-3xl rounded-full"
        style={{ backgroundColor: pet.appearance.color }}
      />

      {/* Pet Body */}
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: isHappy ? [0, 5, -5, 0] : [0, 1, -1, 0]
        }}
        transition={{ 
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 0.5, repeat: isHappy ? Infinity : 0 }
        }}
        className="relative w-48 h-48 flex items-center justify-center"
        style={{ color: pet.appearance.color }}
      >
        {getIcon()}
        
        {/* Eyes/Face Overlay (Simple) */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 pointer-events-none">
          <div className="w-4 h-4 bg-white rounded-full shadow-inner flex items-center justify-center">
             <div className="w-2 h-2 bg-black rounded-full" />
          </div>
          <div className="w-4 h-4 bg-white rounded-full shadow-inner flex items-center justify-center">
             <div className="w-2 h-2 bg-black rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Status Indicators */}
      <div className="absolute -top-4 -right-4 flex flex-col gap-2">
        {isHungry && (
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg uppercase"
          >
            Hungry
          </motion.div>
        )}
        {isTired && (
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg uppercase"
          >
            Sleepy
          </motion.div>
        )}
      </div>
    </div>
  );
}
