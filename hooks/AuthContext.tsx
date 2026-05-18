import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { auth, db } from '../constants/firebase';

type AuthContextType = {
  gebruiker: User | null;
  laden: boolean;
  pakket: 'gratis' | 'premium';
  updatePakket: (p: 'gratis' | 'premium') => void;
};

const AuthContext = createContext<AuthContextType>({
  gebruiker: null,
  laden: true,
  pakket: 'gratis',
  updatePakket: () => {},
});

const ENTITLEMENT_ID = 'ZzpBox Pro';

function isPremium(info: CustomerInfo): boolean {
  return !!info.entitlements.active[ENTITLEMENT_ID];
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

    let active = true;

    async function syncPremium() {
      try {
        await Purchases.logIn(gebruiker!.uid);
      } catch (e) {
        console.error('RevenueCat logIn failed:', e);
      }

      try {
        const info = await Purchases.getCustomerInfo();
        if (active) setPakket(isPremium(info) ? 'premium' : 'gratis');
      } catch {
        // Firebase fallback
        try {
          const snap = await getDoc(doc(db, 'gebruikers', gebruiker!.uid));
          if (active && snap.exists() && snap.data()?.pakket === 'premium') {
            setPakket('premium');
          }
        } catch {
          if (active) setPakket('gratis');
        }
      }
    }

    syncPremium();

    try {
      Purchases.addCustomerInfoUpdateListener((info) => {
        if (active) setPakket(isPremium(info) ? 'premium' : 'gratis');
      });
    } catch (e) {
      console.error('addCustomerInfoUpdateListener failed:', e);
    }

    return () => {
      active = false;
    };
  }, [gebruiker]);

  return (
    <AuthContext.Provider value={{ gebruiker, laden, pakket, updatePakket: setPakket }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
