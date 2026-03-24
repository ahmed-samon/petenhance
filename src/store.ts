import { create } from 'zustand';
import { auth, db, doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, addDoc, serverTimestamp, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export interface Pet {
  id: string;
  userId: string;
  type: 'cat' | 'dog' | 'dragon' | 'alien' | 'slime';
  name: string;
  stats: {
    happiness: number;
    hunger: number;
    energy: number;
    intelligence: number;
    friendship: number;
  };
  evolutionStage: number;
  evolutionPath?: string;
  interactionCounts: {
    feed: number;
    play: number;
    train: number;
    clean: number;
    talk: number;
  };
  level: number;
  appearance: {
    color: string;
    accessory: string;
  };
  lastInteraction: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  hasIntroduced: boolean;
  petId: string | null;
  xp: number;
  level: number;
  coins: number;
  achievements: string[];
}

interface AppState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  pet: Pet | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setPet: (pet: Pet | null) => void;
  init: () => void;
  updatePetStats: (changes: Partial<Pet['stats']>, xpGained?: number, coinsGained?: number, actionType?: keyof Pet['interactionCounts']) => Promise<void>;
  evolvePet: (newStage: number, path: string) => Promise<string>;
  createPet: (name: string, type: Pet['type'], color: string) => Promise<void>;
  updateProfile: (changes: Partial<UserProfile>) => Promise<void>;
}

let userUnsubscribe: (() => void) | null = null;
let petUnsubscribe: (() => void) | null = null;

export const useStore = create<AppState>((set, get) => ({
  user: null,
  profile: null,
  pet: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setPet: (pet) => set({ pet }),

  init: () => {
    if (get().initialized) return;
    set({ initialized: true });

    onAuthStateChanged(auth, async (user) => {
      // Unsubscribe from previous listeners
      if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = null;
      }
      if (petUnsubscribe) {
        petUnsubscribe();
        petUnsubscribe = null;
      }

      set({ user, loading: !!user });

      if (user) {
        // Listen to User Profile
        const userDocRef = doc(db, 'users', user.uid);
        userUnsubscribe = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const profileData: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: 'Friend',
              hasIntroduced: false,
              petId: null,
              xp: 0,
              level: 1,
              coins: 100,
              achievements: [],
              ...data
            };
            set({ profile: profileData });

            // Listen to Pet if exists
            if (profileData.petId) {
              const petDocRef = doc(db, 'pets', profileData.petId);
              
              // Unsubscribe from previous pet listener if petId changed
              if (petUnsubscribe) {
                petUnsubscribe();
              }

              petUnsubscribe = onSnapshot(petDocRef, (petSnap) => {
                if (petSnap.exists()) {
                  set({ pet: { id: petSnap.id, ...petSnap.data() } as Pet, loading: false });
                } else {
                  set({ pet: null, loading: false });
                }
              }, (error) => {
                handleFirestoreError(error, OperationType.GET, `pets/${profileData.petId}`);
              });
            } else {
              set({ pet: null, loading: false });
            }
          } else {
            // Create initial profile
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Friend',
              hasIntroduced: false,
              petId: null,
              xp: 0,
              level: 1,
              coins: 100,
              achievements: []
            };
            try {
              await setDoc(userDocRef, newProfile);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
            }
            set({ profile: newProfile, pet: null, loading: false });
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });
      } else {
        set({ profile: null, pet: null, loading: false });
      }
    });
  },

  updatePetStats: async (changes, xpGained = 0, coinsGained = 0, actionType) => {
    const { pet, profile, user } = get();
    if (!pet || !profile || !user) return;

    const newStats = { ...pet.stats };
    Object.entries(changes).forEach(([key, value]) => {
      const k = key as keyof Pet['stats'];
      newStats[k] = Math.max(0, Math.min(100, newStats[k] + (value || 0)));
    });

    const newInteractionCounts = { ...pet.interactionCounts };
    if (actionType) {
      newInteractionCounts[actionType] = (newInteractionCounts[actionType] || 0) + 1;
    }

    const petRef = doc(db, 'pets', pet.id);
    try {
      await updateDoc(petRef, {
        stats: newStats,
        interactionCounts: newInteractionCounts,
        lastInteraction: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `pets/${pet.id}`);
    }

    if (xpGained > 0 || coinsGained > 0) {
      const userRef = doc(db, 'users', user.uid);
      const newXp = profile.xp + xpGained;
      const newLevel = Math.floor(newXp / 1000) + 1;
      const newCoins = profile.coins + coinsGained;
      try {
        await updateDoc(userRef, {
          xp: newXp,
          level: newLevel,
          coins: newCoins
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    }
  },

  evolvePet: async (newStage, path) => {
    const { pet } = get();
    if (!pet) return "";
    
    const petRef = doc(db, 'pets', pet.id);
    try {
      await updateDoc(petRef, {
        evolutionStage: newStage,
        evolutionPath: path
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `pets/${pet.id}`);
    }
    return path;
  },

  createPet: async (name, type, color) => {
    const { user } = get();
    if (!user) return;

    const newPet: Omit<Pet, 'id'> = {
      userId: user.uid,
      type,
      name,
      stats: {
        happiness: 80,
        hunger: 80,
        energy: 100,
        intelligence: 10,
        friendship: 20
      },
      evolutionStage: 0,
      interactionCounts: {
        feed: 0,
        play: 0,
        train: 0,
        clean: 0,
        talk: 0
      },
      level: 1,
      appearance: {
        color,
        accessory: 'none'
      },
      lastInteraction: serverTimestamp()
    };

    try {
      const petRef = await addDoc(collection(db, 'pets'), newPet);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { petId: petRef.id });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'pets/users');
    }
  },

  updateProfile: async (changes) => {
    const { user } = get();
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, changes);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  }
}));

