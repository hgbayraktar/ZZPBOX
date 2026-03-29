import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../constants/firebase';

type AuthContextType = {
  gebruiker: User | null;
  laden: boolean;
  pakket: 'gratis' | 'premium';
};

const AuthContext = createContext<AuthContextType>({
  gebruiker: null,
  laden: true,
  pakket: 'gratis',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [gebruiker, setGebruiker] = useState<User | null>(null);
  const [laden, setLaden] = useState(true);
  const [pakket, setPakket] = useState<'gratis' | 'premium'>('gratis');

  useEffect(() => {
    const afmelden = onAuthStateChanged(auth, (user) => {
      setGebruiker(user);
      setLaden(false);
    });
    return afmelden;
  }, []);

  useEffect(() => {
    if (!gebruiker) { setPakket('gratis'); return; }
    const afmelden = onSnapshot(doc(db, 'gebruikers', gebruiker.uid), (snap) => {
      if (snap.exists()) setPakket(snap.data().pakket || 'gratis');
      else setPakket('gratis');
    });
    return afmelden;
  }, [gebruiker]);

  return (
    <AuthContext.Provider value={{ gebruiker, laden, pakket }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
