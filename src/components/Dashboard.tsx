import { useStore } from '../store';
import PetDisplay from './PetDisplay';
import Stats from './Stats';
import Actions from './Actions';
import Chat from './Chat';
import EventSystem from './EventSystem';
import MiniGames from './MiniGames';
import EvolutionModal from './EvolutionModal';
import LiveAssistant from './LiveAssistant';
import { motion } from 'motion/react';
import { LogOut, Trophy } from 'lucide-react';
import { auth, signOut } from '../firebase';

export default function Dashboard() {
  const { pet, profile } = useStore();

  if (!pet || !profile) return null;

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-indigo-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {profile.level}
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">{profile.email.split('@')[0]}</h1>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${(profile.xp % 1000) / 10}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">XP</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-amber-700 text-sm">{profile.coins}</span>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pet & Stats */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/50 p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-1">{pet.name}</h2>
              <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest">
                Your Personal Assistant {pet.type}
              </p>
            </div>

            <PetDisplay />
            
            <div className="mt-12 w-full">
              <Stats />
            </div>
          </motion.div>

          <Actions />
        </div>

        {/* Right Column: Chat & Activity */}
        <div className="lg:col-span-5 flex flex-col gap-8 h-[600px] lg:h-auto">
          <Chat />
        </div>
      </main>

      <EventSystem />
      <MiniGames />
      <EvolutionModal />
      <LiveAssistant />
    </div>
  );
}

