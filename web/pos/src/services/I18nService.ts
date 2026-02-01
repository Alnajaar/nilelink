/**
 * NileLink POS Lightweight i18n Utility
 * Provides fast translation lookups for English and Arabic.
 * Supports RTL detection and layout switching.
 */

export type Language = 'en' | 'ar';

export interface TranslationSchema {
    [key: string]: {
        en: string;
        ar: string;
    }
}

class I18nService {
    private static instance: I18nService;
    private currentLang: Language = 'en';

    private dictionary: TranslationSchema = {
        'pos.title': { en: 'NileLink POS', ar: 'نايل لينك نقطة بيع' },
        'nav.dashboard': { en: 'Dashboard', ar: 'لوحة القيادة' },
        'nav.orders': { en: 'Orders', ar: 'الطلبات' },
        'nav.products': { en: 'Products', ar: 'المنتجات' },
        'nav.settings': { en: 'Settings', ar: 'الإعدادات' },
        'action.save': { en: 'Save', ar: 'حفظ' },
        'action.cancel': { en: 'Cancel', ar: 'إلغاء' },
        'action.confirm': { en: 'Confirm', ar: 'تأكيد' },
        'status.connected': { en: 'Connected', ar: 'متصل' },
        'status.disconnected': { en: 'Disconnected', ar: 'غير متصل' },
        'terminal.restaurant': { en: 'Restaurant', ar: 'مطعم' },
        'terminal.supermarket': { en: 'Supermarket', ar: 'سوبر ماركت' },
        'terminal.coffee_shop': { en: 'Coffee Shop', ar: 'مقهى' },
        'terminal.adjustment': { en: 'Adjustment', ar: 'تعديل' },
        'auth.login': { en: 'Login', ar: 'تسجيل الدخول' },
        'auth.logout': { en: 'Logout', ar: 'تسجيل الخروج' },
        'search.placeholder': { en: 'Search...', ar: 'بحث...' }
    };

    private constructor() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('nilelink_lang') as Language;
            if (saved) this.setLanguage(saved);
        }
    }

    public static getInstance(): I18nService {
        if (!I18nService.instance) {
            I18nService.instance = new I18nService();
        }
        return I18nService.instance;
    }

    public t(key: string): string {
        const entry = this.dictionary[key];
        if (!entry) return key;
        return entry[this.currentLang];
    }

    public setLanguage(lang: Language) {
        this.currentLang = lang;
        if (typeof window !== 'undefined') {
            localStorage.setItem('nilelink_lang', lang);
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = lang;
        }
    }

    public getLanguage(): Language {
        return this.currentLang;
    }

    public isRTL(): boolean {
        return this.currentLang === 'ar';
    }
}

export const i18n = I18nService.getInstance();
