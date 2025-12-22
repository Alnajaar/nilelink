export type Locale = 'ar' | 'en';

export type Translations = Record<string, { ar: string; en: string }>;

export const strings: Translations = {
  newOrder: { ar: 'طلب جديد', en: 'New Order' },
  cart: { ar: 'السلة', en: 'Cart' },
  payNow: { ar: 'ادفع الآن', en: 'Pay now' },
  cash: { ar: 'نقداً', en: 'Cash' },
  blockchain: { ar: 'USDC', en: 'USDC' },
  offline: { ar: 'بدون إنترنت', en: 'Offline' },
  synced: { ar: 'تمت المزامنة', en: 'Synced' }
};

export function t(key: keyof typeof strings, locale: Locale): string {
  return strings[key][locale];
}
