import { useStore } from '../store';
import { Heart, Utensils, Zap, Brain, Users } from 'lucide-react';

export default function Stats() {
  const { pet } = useStore();

  if (!pet) return null;

  const statItems = [
    { label: 'Happiness', value: pet.stats.happiness, icon: Heart, color: 'bg-pink-500' },
    { label: 'Hunger', value: pet.stats.hunger, icon: Utensils, color: 'bg-orange-500' },
    { label: 'Energy', value: pet.stats.energy, icon: Zap, color: 'bg-amber-500' },
    { label: 'Intelligence', value: pet.stats.intelligence, icon: Brain, color: 'bg-indigo-500' },
    { label: 'Friendship', value: pet.stats.friendship, icon: Users, color: 'bg-blue-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {statItems.map((item) => (
        <div key={item.label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <item.icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
            </div>
            <span className="text-sm font-black text-gray-900">{item.value}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${item.color} transition-all duration-500`}
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
