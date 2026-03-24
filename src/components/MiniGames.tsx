import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Trophy, X, Gamepad2, Heart, Coins } from 'lucide-react';
import MemoryGame from './games/MemoryGame';
import FetchGame from './games/FetchGame';
import CoinCatcher from './games/CoinCatcher';

type GameType = 'memory' | 'fetch' | 'catcher' | null;

export default function MiniGames() {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [isOpen, setIsOpen] = useState(false);

  const games = [
    { 
      id: 'memory', 
      name: 'Memory Match', 
      desc: 'Match the cards to boost Intelligence!', 
      icon: Brain, 
      color: 'bg-indigo-500',
      reward: 'Intelligence +10, XP +50'
    },
    { 
      id: 'fetch', 
      name: 'Pet Fetch', 
      desc: 'Catch the ball to boost Happiness!', 
      icon: Heart, 
      color: 'bg-pink-500',
      reward: 'Happiness +15, XP +30'
    },
    { 
      id: 'catcher', 
      name: 'Coin Catcher', 
      desc: 'Collect falling coins for currency!', 
      icon: Coins, 
      color: 'bg-amber-500',
      reward: 'Coins +50, Energy +5'
    }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all flex items-center gap-2 z-50 group"
      >
        <Gamepad2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="font-bold text-sm pr-2">Play Games</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Gamepad2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Arcade</h2>
                </div>
                <button 
                  onClick={() => { setIsOpen(false); setActiveGame(null); }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {!activeGame ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {games.map((game) => (
                      <motion.button
                        key={game.id}
                        whileHover={{ y: -5 }}
                        onClick={() => setActiveGame(game.id as GameType)}
                        className="bg-white border-2 border-gray-100 rounded-3xl p-6 text-left hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 group"
                      >
                        <div className={`w-14 h-14 ${game.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                          <game.icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{game.name}</h3>
                        <p className="text-gray-500 text-sm mb-4 leading-relaxed">{game.desc}</p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full w-fit">
                          <Trophy className="w-3 h-3" />
                          {game.reward}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <button 
                      onClick={() => setActiveGame(null)}
                      className="mb-6 text-sm font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                    >
                      ← Back to Arcade
                    </button>
                    <div className="flex-1 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 relative overflow-hidden">
                      {activeGame === 'memory' && <MemoryGame onComplete={() => setActiveGame(null)} />}
                      {activeGame === 'fetch' && <FetchGame onComplete={() => setActiveGame(null)} />}
                      {activeGame === 'catcher' && <CoinCatcher onComplete={() => setActiveGame(null)} />}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
