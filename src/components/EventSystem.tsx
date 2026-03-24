import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { generatePetEvent } from '../services/geminiService';
import { Sparkles, X, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function EventSystem() {
  const { pet, profile, updatePetStats } = useStore();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Trigger event randomly or via button
  const triggerEvent = async () => {
    if (!pet || !profile || loading) return;
    setLoading(true);
    try {
      const newEvent = await generatePetEvent({
        name: pet.name,
        userName: profile.displayName,
        hasIntroduced: profile.hasIntroduced,
        type: pet.type,
        mood: 'Neutral',
        stats: pet.stats,
        level: pet.level,
        evolutionStage: pet.evolutionStage,
        interactionCounts: pet.interactionCounts
      });
      setEvent(newEvent);
    } catch (error) {
      console.error("Failed to generate event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (event) {
      updatePetStats(event.statChanges, event.statChanges.xp || 0, 0, 'assist');
    }
    setEvent(null);
  };

  return (
    <>
      <button
        onClick={triggerEvent}
        disabled={loading}
        className="fixed bottom-8 right-8 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl transition-all flex items-center gap-2 z-50 group"
      >
        <Sparkles className={`w-6 h-6 ${loading ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
        <span className="font-bold text-sm pr-2">Assistant Task</span>
      </button>

      <AnimatePresence>
        {event && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden relative"
            >
              <div className="bg-emerald-500 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
                <Sparkles className="w-12 h-12 mb-4" />
                <h2 className="text-3xl font-black mb-2">{event.title}</h2>
                <p className="text-emerald-100 font-medium leading-relaxed">{event.description}</p>
              </div>

              <div className="p-8">
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Outcome</h4>
                  <p className="text-gray-700 font-medium leading-relaxed">{event.outcome}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {Object.entries(event.statChanges).map(([stat, val]: [string, any]) => (
                    <div key={stat} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat}</span>
                      <div className={`flex items-center gap-1 font-black ${val > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {val > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {val > 0 ? `+${val}` : val}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleClose}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-lg"
                >
                  Awesome!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
