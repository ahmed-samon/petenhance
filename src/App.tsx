import { useEffect } from 'react';
import { useStore } from './store';
import Auth from './components/Auth';
import PetCreation from './components/PetCreation';
import Dashboard from './components/Dashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, profile, pet, loading, init } = useStore();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-indigo-900 font-medium">Loading your companion...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (profile && !profile.petId) {
    return <PetCreation />;
  }

  if (pet) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-indigo-900 font-medium">Finalizing setup...</p>
      </div>
    </div>
  );
}

