import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../constants/firebase';

const AuthContext = createContext<{ gebruiker: User | null; laden: boolean }>({
  gebruiker: null,
  laden: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [gebruiker, setGebruiker] = useState<User | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    const afmelden = onAuthStateChanged(auth, (user) => {
      setGebruiker(user);
      setLaden(false);
    });
    return afmelden;
  }, []);

  return (
    <AuthContext.Provider value={{ gebruiker, laden }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
