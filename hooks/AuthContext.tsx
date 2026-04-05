import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { auth } from '../constants/firebase';

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

function isPremium(info: CustomerInfo): boolean {
  return !!info.entitlements.active['premium'];
}

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
    if (!gebruiker) {
      setPakket('gratis');
      return;
    }

    let actief = true;

    Purchases.getCustomerInfo()
      .then((info) => {
        if (actief) setPakket(isPremium(info) ? 'premium' : 'gratis');
      })
      .catch(() => {
        if (actief) setPakket('gratis');
      });

    let verwijder: (() => void) | undefined;
    try {
      verwijder = Purchases.addCustomerInfoUpdateListener((info) => {
        if (actief) setPakket(isPremium(info) ? 'premium' : 'gratis');
      });
    } catch {
      // RevenueCat not yet initialized
    }

    return () => {
      actief = false;
      verwijder?.();
    };
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
