// import Purchases, { PurchasesOffering } from 'react-native-purchases';
// import { Platform } from 'react-native';

// TODO: Replace with your actual RevenueCat API Keys
const API_KEYS = {
  apple: 'appl_YOUR_APPLE_API_KEY_HERE',
  google: 'goog_YOUR_GOOGLE_API_KEY_HERE',
};

class RevenueCatService {
  static async setup() {
    // DISABLED FOR NOW
    /*
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEYS.apple });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: API_KEYS.google });
    }
    */
  }

  static async getOfferings(): Promise<any | null> {
    // MOCKED OFFERINGS FOR TESTING WITHOUT REAL KEYS
    return {
      availablePackages: [
        { identifier: 'pkg_100', product: { identifier: 'coins_100', priceString: 'R$ 4,90  |  $ 0.99  |  € 0.99' } },
        { identifier: 'pkg_500', product: { identifier: 'coins_500', priceString: 'R$ 14,90  |  $ 2.99  |  € 2.99' } },
        { identifier: 'pkg_1000', product: { identifier: 'coins_1000', priceString: 'R$ 24,90  |  $ 4.99  |  € 4.99' } },
        { identifier: 'pkg_5000', product: { identifier: 'coins_5000', priceString: 'R$ 99,90  |  $ 19.99  |  € 19.99' } }
      ]
    };
  }

  static async purchasePackage(pack: any) {
    // SIMULATE SUCCESSFUL PURCHASE
    return true;
  }
}

export default RevenueCatService;
