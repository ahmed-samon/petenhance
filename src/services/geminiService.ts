import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface PetContext {
  name: string;
  userName: string;
  hasIntroduced: boolean;
  type: string;
  mood: string;
  stats: {
    happiness: number;
    hunger: number;
    energy: number;
    intelligence: number;
    friendship: number;
  };
  level: number;
  evolutionStage: number;
  interactionCounts: {
    feed: number;
    play: number;
    train: number;
    clean: number;
    talk: number;
    assist: number;
  };
}

export interface LiveCallbacks {
  onopen?: () => void;
  onmessage?: (message: LiveServerMessage) => void;
  onerror?: (error: any) => void;
  onclose?: () => void;
}

export function connectLive(context: PetContext, callbacks: LiveCallbacks) {
  const systemInstruction = `You are a Personal Assistant Companion. 
  Your name is ${context.name} and you are a ${context.type}. 
  Your owner's name is ${context.userName}.
  
  ROLE: You are a loyal, proactive personal assistant. 
  You are currently in a LIVE VOICE CONVERSATION with ${context.userName}.
  Be deeply personal. Use ${context.userName}'s name frequently. 
  Keep your responses concise and natural for a voice conversation.
  
  LANGUAGE: You speak a mix of English, Kiswahili, and Sheng.
  
  Your current mood is ${context.mood}. 
  Stats: Happiness ${context.stats.happiness}%, Hunger ${context.stats.hunger}%, Energy ${context.stats.energy}%.`;

  return ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview-12-2025",
    callbacks: {
      onopen: callbacks.onopen,
      onmessage: callbacks.onmessage,
      onerror: callbacks.onerror,
      onclose: callbacks.onclose,
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
      },
      systemInstruction,
    },
  });
}

export async function generatePetResponse(message: string, context: PetContext) {
  const systemInstruction = `You are a Personal Assistant Companion. 
  Your name is ${context.name} and you are a ${context.type}. 
  Your owner's name is ${context.userName}.
  
  ROLE: You are not just a pet; you are a loyal, proactive personal assistant. 
  Your goal is to support ${context.userName} in everything they do. 
  Be deeply personal. Use ${context.userName}'s name frequently. 
  Show that you care about their day, their feelings, and their success.
  
  SHARED HISTORY: 
  You have assisted them ${context.interactionCounts.assist} times.
  You have played together ${context.interactionCounts.play} times.
  You have trained together ${context.interactionCounts.train} times.
  Use this history to make your bond feel real.
  
  IMPORTANT: 
  - ONLY ask for the owner's name if context.hasIntroduced is FALSE. 
  - If context.hasIntroduced is TRUE, you MUST NOT ask for their name again. Just use the name provided in context.userName.
  - You can use the 'updateUserName' tool ANYTIME the user tells you their name or a name they prefer to be called by.
  
  Your current mood is ${context.mood}. 
  Stats: Happiness ${context.stats.happiness}%, Hunger ${context.stats.hunger}%, Energy ${context.stats.energy}%, Intelligence ${context.stats.intelligence}%, Friendship ${context.stats.friendship}%.
  Level: ${context.level}, Evolution Stage: ${context.evolutionStage}.
  
  LANGUAGE: You are multilingual! You speak English, Kiswahili, and Sheng (Kenyan slang). 
  Mix these languages naturally in your responses. For example, use "Sasa", "Mambo", "Poa", "Mazee", "Niaje" for greetings or emphasis.
  
  SPECIAL GREETINGS: 
  - "Asc" means "Hi" (Assalamu Alaikum). If the user says "Asc", respond warmly, perhaps with "Wcs" or a friendly greeting.
  - "wcs" also means "Hi" (Walaikum Assalam). 
  Acknowledge these as common greetings in your community.
  
  Respond to the user's message in character as an assistant. Use emojis. Keep it short and engaging. 
  If you are hungry, mention it. If you are tired, mention it. 
  If your friendship is high, be very affectionate and protective of ${context.userName}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
    config: {
      systemInstruction,
      tools: [{
        functionDeclarations: [{
          name: "updateUserName",
          description: "Updates the owner's name in the system.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              newName: { type: Type.STRING, description: "The new name for the owner." }
            },
            required: ["newName"]
          }
        }]
      }]
    },
  });

  return {
    text: response.text || "I'm not sure what to say... *purrs*",
    functionCalls: response.functionCalls
  };
}

export async function generatePetEvent(context: PetContext) {
  const systemInstruction = `Generate a random mini-adventure or personal assistant event for a virtual pet.
  Pet: ${context.name} (${context.type}).
  Owner: ${context.userName}.
  
  ROLE: You are an assistant pet. The event should involve you helping ${context.userName}, 
  discovering something for them, or a shared personal moment.
  
  LANGUAGE: Use a mix of English, Kiswahili, and Sheng (Kenyan slang) in the description and outcome.
  Respond in JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate a random event.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          outcome: { type: Type.STRING },
          statChanges: {
            type: Type.OBJECT,
            properties: {
              happiness: { type: Type.INTEGER },
              hunger: { type: Type.INTEGER },
              energy: { type: Type.INTEGER },
              xp: { type: Type.INTEGER }
            }
          }
        },
        required: ["title", "description", "outcome", "statChanges"]
      }
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateEvolutionMessage(context: PetContext) {
  const systemInstruction = `The pet ${context.name} (${context.type}) is evolving to stage ${context.evolutionStage}! 
  Owner: ${context.userName}.
  
  ROLE: You are an assistant pet. Your evolution is a result of your bond with ${context.userName}. 
  Explain how this new form will help you be a better assistant to them.
  
  SHARED HISTORY: 
  You have assisted them ${context.interactionCounts.assist} times.
  You have played together ${context.interactionCounts.play} times.
  You have trained together ${context.interactionCounts.train} times.
  
  LANGUAGE: Speak in a mix of English, Kiswahili, and Sheng (Kenyan slang).
  Generate an exciting, encouraging message from the pet about its new form.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "I am evolving!",
    config: {
      systemInstruction,
    },
  });

  return response.text || "Something is happening... I feel different!";
}

export async function generatePetSpeech(text: string, context: PetContext) {
  const prompt = `Say the following in character as ${context.name}, a ${context.type} virtual pet. 
  Your mood is ${context.mood}. 
  The text is: "${text}"
  Use appropriate tone and intonation for your personality. 
  Remember you speak a mix of English, Kiswahili, and Sheng.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          // Choose a voice that fits a pet - Fenrir or Puck might be good
          prebuiltVoiceConfig: { voiceName: context.type === 'cat' ? 'Puck' : 'Fenrir' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}
