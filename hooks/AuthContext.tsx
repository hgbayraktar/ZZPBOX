import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { auth } from '../constants/firebase';

type AuthContextType = {
  gebruiker: User | null;
  laden: boolean;
  pakket: 'gratis' | 'premium';
  refreshPakket: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  gebruiker: null,
  laden: true,
  pakket: 'gratis',
  refreshPakket: async () => {},
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
        // RevenueCat unavailable — safe default is gratis, never grant premium without verification
        if (active) setPakket('gratis');
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

  async function refreshPakket(): Promise<void> {
    try {
      const info = await Purchases.getCustomerInfo();
      setPakket(isPremium(info) ? 'premium' : 'gratis');
    } catch {
      // Do not downgrade on transient failure — keep current state
    }
  }

  return (
    <AuthContext.Provider value={{ gebruiker, laden, pakket, refreshPakket }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
