import { auth, googleProvider, signInWithPopup } from '../firebase';
import { LogIn, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-indigo-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AetherPet</h1>
        <p className="text-gray-600 mb-8">Your AI-powered virtual companion awaits. Grow, evolve, and chat with your unique pet.</p>
        
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-indigo-200"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>
        
        <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest font-semibold">
          Powered by Gemini AI
        </p>
      </motion.div>
    </div>
  );
}
