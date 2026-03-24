import { useStore, Pet } from '../store';
import { Utensils, Play, Brain, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Actions() {
  const { updatePetStats } = useStore();

  const actions: { id: keyof Pet['interactionCounts'], label: string, icon: any, color: string, hover: string, stats: Partial<Pet['stats']>, xp: number }[] = [
    { 
      id: 'feed', 
      label: 'Feed', 
      icon: Utensils, 
      color: 'bg-orange-100 text-orange-600', 
      hover: 'hover:bg-orange-200',
      stats: { hunger: 20, energy: 5 },
      xp: 15
    },
    { 
      id: 'play', 
      label: 'Play', 
      icon: Play, 
      color: 'bg-pink-100 text-pink-600', 
      hover: 'hover:bg-pink-200',
      stats: { happiness: 20, energy: -15 },
      xp: 25
    },
    { 
      id: 'train', 
      label: 'Train', 
      icon: Brain, 
      color: 'bg-indigo-100 text-indigo-600', 
      hover: 'hover:bg-indigo-200',
      stats: { intelligence: 10, energy: -20, hunger: -10 },
      xp: 50
    },
    { 
      id: 'clean', 
      label: 'Clean', 
      icon: Sparkles, 
      color: 'bg-blue-100 text-blue-600', 
      hover: 'hover:bg-blue-200',
      stats: { energy: 10, happiness: 5 },
      xp: 10
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {actions.map((action) => (
        <motion.button
          key={action.id as string}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => updatePetStats(action.stats, action.xp, 0, action.id)}
          className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all shadow-sm ${action.color} ${action.hover}`}
        >
          <action.icon className="w-8 h-8 mb-2" />
          <span className="font-bold text-sm">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
