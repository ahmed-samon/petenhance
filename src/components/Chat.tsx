import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { generatePetResponse, generatePetSpeech } from '../services/geminiService';
import { Send, Loader2, Sparkles, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'pet';
  timestamp: number;
}

export default function Chat() {
  const { pet, profile } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playPCM = (base64Data: string, msgId: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioContext;
      
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Int16Array(len / 2);
      for (let i = 0; i < len; i += 2) {
        // Little-endian conversion
        bytes[i / 2] = (binaryString.charCodeAt(i + 1) << 8) | binaryString.charCodeAt(i);
      }
      
      const float32Data = new Float32Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) {
        float32Data[i] = bytes[i] / 32768;
      }

      const buffer = audioContext.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        setPlayingId(null);
        audioContext.close();
      };
      source.start();
    } catch (error) {
      console.error("Audio playback failed:", error);
      setPlayingId(null);
    }
  };

  const handlePlaySpeech = async (msg: Message) => {
    if (!pet || !profile || playingId) return;
    
    setPlayingId(msg.id);
    try {
      const base64Audio = await generatePetSpeech(msg.text, {
        name: pet.name,
        userName: profile.displayName,
        hasIntroduced: profile.hasIntroduced,
        type: pet.type,
        mood: pet.stats.happiness > 70 ? 'Happy' : pet.stats.hunger < 30 ? 'Hungry' : 'Neutral',
        stats: pet.stats,
        level: pet.level,
        evolutionStage: pet.evolutionStage
      });

      if (base64Audio) {
        playPCM(base64Audio, msg.id);
      } else {
        setPlayingId(null);
      }
    } catch (error) {
      console.error("Speech synthesis failed:", error);
      setPlayingId(null);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !pet || !profile || loading) return;

    const { updateProfile } = useStore.getState();

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await generatePetResponse(input, {
        name: pet.name,
        userName: profile.displayName,
        hasIntroduced: profile.hasIntroduced,
        type: pet.type,
        mood: pet.stats.happiness > 70 ? 'Happy' : pet.stats.hunger < 30 ? 'Hungry' : 'Neutral',
        stats: pet.stats,
        level: pet.level,
        evolutionStage: pet.evolutionStage
      });

      // Handle function calls
      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          if (call.name === 'updateUserName') {
            const { newName } = call.args as { newName: string };
            await updateProfile({ displayName: newName, hasIntroduced: true });
          }
        }
      } else if (!profile.hasIntroduced) {
        // If AI didn't call the function but we just had the first convo, mark as introduced
        // This is a bit of a fallback
        await updateProfile({ hasIntroduced: true });
      }

      const petMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'pet',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, petMsg]);
    } catch (error) {
      console.error("AI Chat failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/50 flex flex-col h-full overflow-hidden border border-indigo-50">
      <div className="p-6 border-b border-indigo-50 flex items-center justify-between bg-indigo-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="font-bold text-gray-900">Pet Chat</h3>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 italic">
              Say hello to {pet?.name}! They love to chat.
            </p>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed relative group ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-100' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
                
                {msg.sender === 'pet' && (
                  <button
                    onClick={() => handlePlaySpeech(msg)}
                    disabled={playingId !== null}
                    className={`absolute -right-10 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                      playingId === msg.id 
                        ? 'bg-indigo-100 text-indigo-600 animate-pulse' 
                        : 'bg-white text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 shadow-sm border border-gray-100'
                    }`}
                  >
                    {playingId === msg.id ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t border-indigo-50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${pet?.name}...`}
            className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:border-indigo-500 focus:ring-0 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

