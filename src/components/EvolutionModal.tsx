import { useState, useEffect } from 'react';
import { useStore, Pet } from '../store';
import { generateEvolutionMessage } from '../services/geminiService';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function EvolutionModal() {
  const { pet, profile, evolvePet } = useStore();
  const [show, setShow] = useState(false);
  const [evolving, setEvolving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!pet || !profile) return;

    const shouldEvolve = 
      (pet.evolutionStage === 0 && profile.level >= 10) || 
      (pet.evolutionStage === 1 && profile.level >= 20);

    if (shouldEvolve && !evolving) {
      setShow(true);
    }
  }, [pet, profile]);

  const handleEvolve = async () => {
    if (!pet || !profile) return;
    setEvolving(true);

    // Determine Path
    let path = 'Classic';
    const { happiness, intelligence, friendship } = pet.stats;
    const { train, play, feed, talk } = pet.interactionCounts;

    if (Math.random() < 0.05 && profile.coins > 500) {
      path = 'Celestial';
    } else if (intelligence > 80 || train > Math.max(play, feed, talk)) {
      path = 'Wise';
    } else if (happiness > 80 || play > Math.max(train, feed, talk)) {
      path = 'Joyful';
    } else if (friendship > 80 || talk > Math.max(train, play, feed)) {
      path = 'Loyal';
    }

    const newStage = pet.evolutionStage + 1;
    await evolvePet(newStage, path);

    const aiMsg = await generateEvolutionMessage({
      name: pet.name,
      userName: profile.displayName,
      hasIntroduced: profile.hasIntroduced,
      type: pet.type,
      mood: 'Excited',
      stats: pet.stats,
      level: profile.level,
      evolutionStage: newStage
    });

    setMessage(aiMsg);
    setEvolving(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full p-10 text-center relative overflow-hidden"
          >
            {!message ? (
              <>
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                  <Sparkles className="w-12 h-12 text-indigo-600" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">Evolution Time!</h2>
                <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                  {pet?.name} is ready to take on a new form. Their growth has been shaped by your care and interactions.
                </p>
                <button
                  onClick={handleEvolve}
                  disabled={evolving}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-3xl transition-all shadow-xl flex items-center justify-center gap-3 text-xl"
                >
                  {evolving ? 'Evolving...' : 'Begin Evolution'}
                  <ArrowRight className="w-6 h-6" />
                </button>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Trophy className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">Evolution Complete!</h2>
                <p className="text-indigo-600 font-black uppercase tracking-widest mb-6">
                  {pet?.name} has become a {pet?.evolutionPath} {pet?.type}!
                </p>
                <div className="bg-gray-50 rounded-3xl p-8 mb-10 border border-gray-100 italic text-gray-700 leading-relaxed">
                  "{message}"
                </div>
                <button
                  onClick={() => setShow(false)}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 rounded-3xl transition-all shadow-xl text-xl"
                >
                  Continue Adventure
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
