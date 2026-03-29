import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const REVENUECAT_ANDROID_KEY = 'goog_CdpnfPtRwgaAKeOlXCCqtYnoUTP';
const REVENUECAT_IOS_KEY = 'appl_lbtCiNZvnsuxqCYwSGqgeCAvYnO';

export const initializePurchases = () => {
  try {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: REVENUECAT_ANDROID_KEY });
    } else if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
    }
  } catch (e) {
    console.warn('RevenueCat init failed:', e);
  }
};