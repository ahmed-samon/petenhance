import { useEffect } from 'react';
import { useStore } from '../store';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, Heart, Shield, BookOpen } from 'lucide-react';

export default function EvolutionAnimation() {
  const { evolutionAnimation, setEvolutionAnimation } = useStore();

  useEffect(() => {
    if (!evolutionAnimation) return;

    const { path } = evolutionAnimation;

    // Trigger confetti based on path
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 300 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      if (path === 'Celestial') {
        confetti({
          ...defaults,
          particleCount,
          colors: ['#FFD700', '#4169E1', '#FFFFFF'],
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          colors: ['#FFD700', '#4169E1', '#FFFFFF'],
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      } else if (path === 'Joyful') {
        confetti({
          ...defaults,
          particleCount,
          colors: ['#FF69B4', '#FFD700', '#FF4500'],
          shapes: ['circle'],
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      } else if (path === 'Wise') {
        confetti({
          ...defaults,
          particleCount,
          colors: ['#4B0082', '#8A2BE2', '#9370DB'],
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      } else if (path === 'Loyal') {
        confetti({
          ...defaults,
          particleCount,
          colors: ['#2E8B57', '#3CB371', '#00FA9A'],
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      } else {
        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      }
    }, 250);

    const timer = setTimeout(() => {
      setEvolutionAnimation(null);
    }, duration + 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [evolutionAnimation]);

  return (
    <AnimatePresence>
      {evolutionAnimation && (
        <motion.div
          key="evolution-animation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[250] pointer-events-none flex items-center justify-center bg-gradient-to-br ${getOverlayColor(evolutionAnimation.path)}`}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.5, 1], rotate: 0 }}
            transition={{ duration: 1, times: [0, 0.6, 1] }}
            className="bg-white/90 backdrop-blur-sm p-8 rounded-full shadow-2xl border-4 border-white"
          >
            {getIcon(evolutionAnimation.path)}
          </motion.div>

          {/* Floating elements */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: 0, 
                y: 0, 
                opacity: 0,
                scale: 0 
              }}
              animate={{ 
                x: (Math.random() - 0.5) * 800, 
                y: (Math.random() - 0.5) * 800,
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              className="absolute"
            >
              {getIcon(evolutionAnimation.path)}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const getIcon = (path: string) => {
  switch (path) {
    case 'Celestial': return <Star className="w-12 h-12 text-yellow-400" />;
    case 'Joyful': return <Heart className="w-12 h-12 text-pink-500" />;
    case 'Wise': return <BookOpen className="w-12 h-12 text-purple-600" />;
    case 'Loyal': return <Shield className="w-12 h-12 text-green-600" />;
    default: return <Sparkles className="w-12 h-12 text-indigo-600" />;
  }
};

const getOverlayColor = (path: string) => {
  switch (path) {
    case 'Celestial': return 'from-blue-500/20 to-yellow-500/20';
    case 'Joyful': return 'from-pink-500/20 to-orange-500/20';
    case 'Wise': return 'from-indigo-500/20 to-purple-500/20';
    case 'Loyal': return 'from-green-500/20 to-teal-500/20';
    default: return 'from-indigo-500/10 to-white/10';
  }
};
