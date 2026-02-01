/**
 * Consent Management System
 * Handles legal consent collection, storage, and enforcement
 * 
 * GDPR-LIKE COMPLIANCE:
 * - Explicit consent required
 * - Consent must be informed
 * - Revocable at any time
 * - Versioned consent documents
 * - Audit trail of all consent actions
 * 
 * SUPPORTED CONSENT TYPES:
 * - TERMS_OF_SERVICE
 * - DATA_PROCESSING
 * - AI_RECOMMENDATIONS
 * - PERFORMANCE_TRACKING
 * - MARKETING
 * - LOYALTY_PROGRAM
 */

import { ConsentType, OnChainConsent, ConsentContent } from '../types/database';
import { ipfsService } from './IPFSService';

// ============================================
// CONSENT TEMPLATES (Bilingual: EN + AR)
// ============================================

export const CONSENT_TEMPLATES: Record<ConsentType, ConsentContent> = {
    TERMS_OF_SERVICE: {
        type: 'TERMS_OF_SERVICE',
        version: '1.0',
        effectiveDate: '2024-01-01',
        textEn: `
# Terms of Service

**Effective Date:** January 1, 2024

By using the NileLink POS Platform ("Service"), you agree to these Terms of Service.

## 1. Acceptance of Terms
You accept these terms by creating an account or using any part of the Service.

## 2. Service Description
NileLink provides a decentralized point-of-sale system using blockchain technology.

## 3. User Responsibilities
- Provide accurate information
- Maintain account security
- Comply with local laws
- Not misuse the platform

## 4. Payment Terms
- Subscription fees are non-refundable
- Prices may change with 30 days notice
- Late payments may result in service suspension

## 5. Data Usage
Your data is stored on blockchain and IPFS. See Data Processing consent for details.

## 6. Limitation of Liability
Service is provided "as is". We are not liable for business losses.

## 7. Termination
We may terminate accounts that violate these terms.

## 8. Governing Law
These terms are governed by the laws of your country of operation.

For questions, contact: support@nilelink.app
    `.trim(),
        textAr: `
# شروط الخدمة

**تاريخ السريان:** 1 يناير 2024

باستخدام منصة NileLink POS ("الخدمة")، فإنك توافق على شروط الخدمة هذه.

## 1. قبول الشروط
أنت تقبل هذه الشروط من خلال إنشاء حساب أو استخدام أي جزء من الخدمة.

## 2. وصف الخدمة
تقدم NileLink نظام نقاط بيع لامركزي باستخدام تقنية البلوكتشين.

## 3. مسؤوليات المستخدم
- تقديم معلومات دقيقة
- الحفاظ على أمان الحساب
- الامتثال للقوانين المحلية
- عدم إساءة استخدام المنصة

## 4. شروط الدفع
- رسوم الاشتراك غير قابلة للاسترداد
- قد تتغير الأسعار بإشعار مدته 30 يومًا
- قد تؤدي المدفوعات المتأخرة إلى تعليق الخدمة

## 5. استخدام البيانات
يتم تخزين بياناتك على البلوكتشين و IPFS. راجع موافقة معالجة البيانات للحصول على التفاصيل.

## 6. تحديد المسؤولية
يتم تقديم الخدمة "كما هي". نحن لسنا مسؤولين عن خسائر الأعمال.

## 7. الإنهاء
قد ننهي الحسابات التي تنتهك هذه الشروط.

## 8. القانون الحاكم
تخضع هذه الشروط لقوانين بلد عملك.

للأسئلة، اتصل بـ: support@nilelink.app
    `.trim(),
    },

    DATA_PROCESSING: {
        type: 'DATA_PROCESSING',
        version: '1.0',
        effectiveDate: '2024-01-01',
        textEn: `
# Data Processing Agreement

**Effective Date:** January 1, 2024

## What Data We Collect
- Account information (email, phone, wallet address)
- Business information (name, location, tax ID)
- Transaction data (sales, inventory, employees)
- Usage data (features used, timestamps)

## How We Store Data
- **Authentication:** Firebase (Google Cloud)
- **Business Data:** Ethereum/Polygon blockchain
- **Files & Images:** IPFS (decentralized storage)
- **Queries:** The Graph (indexing service)

## How We Use Data
- Provide POS services
- Process payments and transactions
- Generate reports and analytics
- Improve AI recommendations
- Comply with legal requirements

## Data Sharing
We DO NOT sell your data. We may share with:
- Payment processors (for transactions)
- Tax authorities (legal requirement)
- Service providers (hosting, support)

## Your Rights
- Access your data at any time
- Export all your data
- Request data deletion (subject to legal retention)
- Withdraw consent (may limit service)

## Data Retention
- Active data: while account is active
- Tax records: 5-7 years (country-dependent)
- Blockchain data: permanent (by design)

## Security
- Encrypted connections (HTTPS, WSS)
- Blockchain immutability
- Access controls and role-based permissions

Contact: privacy@nilelink.app
    `.trim(),
        textAr: `
# اتفاقية معالجة البيانات

**تاريخ السريان:** 1 يناير 2024

## البيانات التي نجمعها
- معلومات الحساب (البريد الإلكتروني، الهاتف، عنوان المحفظة)
- معلومات الأعمال (الاسم، الموقع، الرقم الضريبي)
- بيانات المعاملات (المبيعات، المخزون، الموظفين)
- بيانات الاستخدام (الميزات المستخدمة، الأوقات)

## كيف نخزن البيانات
- **المصادقة:** Firebase (Google Cloud)
- **بيانات الأعمال:** بلوكتشين Ethereum/Polygon
- **الملفات والصور:** IPFS (تخزين لامركزي)
- **الاستعلامات:** The Graph (خدمة الفهرسة)

## كيف نستخدم البيانات
- تقديم خدمات نقاط البيع
- معالجة المدفوعات والمعاملات
- إنشاء التقارير والتحليلات
- تحسين توصيات الذكاء الاصطناعي
- الامتثال للمتطلبات القانونية

## مشاركة البيانات
نحن لا نبيع بياناتك. قد نشارك مع:
- معالجي الدفع (للمعاملات)
- السلطات الضريبية (متطلب قانوني)
- مزودي الخدمة (الاستضافة، الدعم)

## حقوقك
- الوصول إلى بياناتك في أي وقت
- تصدير جميع بياناتك
- طلب حذف البيانات (مع مراعاة الاحتفاظ القانوني)
- سحب الموافقة (قد يحد من الخدمة)

## الاحتفاظ بالبيانات
- البيانات النشطة: أثناء نشاط الحساب
- السجلات الضريبية: 5-7 سنوات (حسب الدولة)
- بيانات البلوكتشين: دائمة (بالتصميم)

## الأمان
- اتصالات مشفرة (HTTPS، WSS)
- ثبات البلوكتشين
- ضوابط الوصول والأذونات القائمة على الأدوار

للتواصل: privacy@nilelink.app
    `.trim(),
    },

    AI_RECOMMENDATIONS: {
        type: 'AI_RECOMMENDATIONS',
        version: '1.0',
        effectiveDate: '2024-01-01',
        textEn: `
# AI Recommendations Consent

**Effective Date:** January 1, 2024

## What AI Does
NileLink uses artificial intelligence to:
- Predict inventory needs
- Suggest optimal pricing
- Recommend staff scheduling
- Identify sales patterns
- Detect anomalies

## How AI Works
AI analyzes:
- Your historical sales data
- Inventory movements
- Customer behavior
- Market trends (anonymized)

## AI Limitations
- AI provides **suggestions only**
- Final decisions are **always yours**
- AI may make mistakes
- AI cannot guarantee results

## Data Used by AI
- Your business data only (not shared between businesses)
- Anonymized market trends
- Historical patterns

## Transparency
- All AI recommendations include explanations
- You can see what data was used
- You can reject any suggestion

## No Autonomous Actions
AI will **NEVER**:
- Make purchases automatically
- Change prices without approval
- Hire or fire staff
- Process refunds
- Change security settings

## Your Control
- Enable/disable AI features anytime
- Provide feedback on recommendations
- Request explanation for any suggestion

Contact: ai@nilelink.app
    `.trim(),
        textAr: `
# موافقة توصيات الذكاء الاصطناعي

**تاريخ السريان:** 1 يناير 2024

## ماذا يفعل الذكاء الاصطناعي
تستخدم NileLink الذكاء الاصطناعي لـ:
- التنبؤ باحتياجات المخزون
- اقتراح التسعير الأمثل
- التوصية بجدولة الموظفين
- تحديد أنماط المبيعات
- كشف الشذوذ

## كيف يعمل الذكاء الاصطناعي
يحلل الذكاء الاصطناعي:
- بيانات مبيعاتك التاريخية
- حركات المخزون
- سلوك العملاء
- اتجاهات السوق (مجهولة المصدر)

## قيود الذكاء الاصطناعي
- يقدم الذكاء الاصطناعي **اقتراحات فقط**
- القرارات النهائية **دائمًا لك**
- قد يخطئ الذكاء الاصطناعي
- لا يمكن للذكاء الاصطناعي ضمان النتائج

## البيانات المستخدمة بواسطة الذكاء الاصطناعي
- بيانات عملك فقط (غير مشتركة بين الشركات)
- اتجاهات السوق المجهولة
- الأنماط التاريخية

## الشفافية
- جميع توصيات الذكاء الاصطناعي تتضمن تفسيرات
- يمكنك رؤية البيانات المستخدمة
- يمكنك رفض أي اقتراح

## لا إجراءات مستقلة
الذكاء الاصطناعي **لن**:
- يقوم بالشراء تلقائيًا
- يغير الأسعار بدون موافقة
- يوظف أو يفصل الموظفين
- يعالج المبالغ المستردة
- يغير إعدادات الأمان

## سيطرتك
- تمكين / تعطيل ميزات الذكاء الاصطناعي في أي وقت
- تقديم الملاحظات على التوصيات
- طلب تفسير لأي اقتراح

للتواصل: ai@nilelink.app
    `.trim(),
    },

    PERFORMANCE_TRACKING: {
        type: 'PERFORMANCE_TRACKING',
        version: '1.0',
        effectiveDate: '2024-01-01',
        textEn: `
# Performance Tracking Consent

**For Employees Only**

## What We Track
- Login/logout times
- Sales processed
- Customer ratings
- Shift adherence
- Cash drawer accuracy

## Purpose
- Calculate fair compensation
- Identify training needs
- Recognize top performers
- Ensure accountability

## How Data is Used
- Performance reviews
- Bonus calculations
- Scheduling optimization
- Training assignments

## Your Rights
- View your own performance data anytime
- Request correction of errors
- Provide context for low ratings
- Appeal disciplinary actions

## Fairness
- All metrics are objective
- AI-assisted but human-reviewed
- No discrimination
- Clear improvement paths

## Privacy
- Only you and authorized managers see your data
- Not shared with other employees
- Not sold or used for other purposes

Contact: hr@nilelink.app
    `.trim(),
        textAr: `
# موافقة تتبع الأداء

**للموظفين فقط**

## ما نتتبعه
- أوقات تسجيل الدخول / الخروج
- المبيعات المعالجة
- تقييمات العملاء
- الالتزام بالمناوبات
- دقة درج النقد

## الغرض
- حساب التعويض العادل
- تحديد احتياجات التدريب
- التعرف على أفضل الأداء
- ضمان المساءلة

## كيف تستخدم البيانات
- مراجعات الأداء
- حسابات المكافآت
- تحسين الجدولة
- مهام التدريب

## حقوقك
- عرض بيانات أدائك الخاصة في أي وقت
- طلب تصحيح الأخطاء
- تقديم سياق للتقييمات المنخفضة
- استئناف الإجراءات التأديبية

## العدالة
- جميع المقاييس موضوعية
- مدعومة بالذكاء الاصطناعي ولكن تمت مراجعتها من قبل البشر
- لا تمييز
- مسارات تحسين واضحة

## الخصوصية
- أنت والمديرون المصرح لهم فقط يرون بياناتك
- غير مشتركة مع الموظفين الآخرين
- غير مباعة أو مستخدمة لأغراض أخرى

للتواصل: hr@nilelink.app
    `.trim(),
    },

    MARKETING: {
        type: 'MARKETING',
        version: '1.0',
        effectiveDate: '2024-01-01',
        textEn: `
# Marketing Communications Consent

## What You'll Receive
- Product updates
- New feature announcements
- Promotional offers
- Educational content
- Event invitations

## Frequency
- Maximum 2 emails per week
- SMS only for critical updates
- No spam

## Your Control
- Unsubscribe anytime
- Choose communication preferences
- Update contact information

## Data Usage
- Email/phone used for marketing only
- Not shared with third parties
- Not used for other purposes without new consent

## Easy Opt-Out
- Click "unsubscribe" in any email
- Reply "STOP" to any SMS
- Update preferences in account settings

Contact: marketing@nilelink.app
    `.trim(),
        textAr: `
# موافقة الاتصالات التسويقية

## ما ستتلقاه
- تحديثات المنتج
- إعلانات الميزات الجديدة
- العروض الترويجية
- المحتوى التعليمي
- دعوات الأحداث

## التكرار
- بحد أقصى بريدين إلكترونيين أسبوعيًا
- رسائل SMS للتحديثات الحرجة فقط
- لا بريد عشوائي

## سيطرتك
- إلغاء الاشتراك في أي وقت
- اختيار تفضيلات الاتصال
- تحديث معلومات الاتصال

## استخدام البيانات
- يستخدم البريد الإلكتروني / الهاتف للتسويق فقط
- غير مشارك مع أطراف ثالثة
- غير مستخدم لأغراض أخرى بدون موافقة جديدة

## إلغاء الاشتراك بسهولة
- انقر فوق "إلغاء الاشتراك" في أي بريد إلكتروني
- رد بـ "STOP" على أي SMS
- تحديث التفضيلات في إعدادات الحساب

للتواصل: marketing@nilelink.app
    `.trim(),
    },

    LOYALTY_PROGRAM: {
        type: 'LOYALTY_PROGRAM',
        version: '1.0',
        effectiveDate: '2024-01-01',
        textEn: `
# Loyalty Program Consent

## Program Benefits
- Earn points on purchases
- Exclusive discounts
- Early access to offers
- Personalized recommendations

## How Points Work
- 1 point per 1 currency unit spent
- Points never expire
- Redeemable for discounts or free items
- Visible in your account

## Data Collection
- Purchase history
- Favorite products
- Visit frequency
- Redemption patterns

## Personalization
- AI suggests rewards based on your preferences
- Targeted offers for your interests
- Birthday/anniversary bonuses

## Your Control
- Opt out anytime (forfeit points)
- View point history
- Control data sharing

## No Obligation
- Participation is voluntary
- No penalty for not participating
- Can rejoin later (new points start)

Contact: loyalty@nilelink.app
    `.trim(),
        textAr: `
# موافقة برنامج الولاء

## فوائد البرنامج
- اكسب نقاطًا على المشتريات
- خصومات حصرية
- الوصول المبكر للعروض
- توصيات مخصصة

## كيف تعمل النقاط
- نقطة واحدة لكل وحدة عملة يتم إنفاقها
- النقاط لا تنتهي صلاحيتها أبدًا
- قابلة للاسترداد للحصول على خصومات أو عناصر مجانية
- مرئية في حسابك

## جمع البيانات
- سجل الشراء
- المنتجات المفضلة
- تكرار الزيارة
- أنماط الاسترداد

## التخصيص
- يقترح الذكاء الاصطناعي المكافآت بناءً على تفضيلاتك
- عروض مستهدفة لاهتماماتك
- مكافآت أعياد الميلاد / الذكرى السنوية

## سيطرتك
- إلغاء الاشتراك في أي وقت (مصادرة النقاط)
- عرض سجل النقاط
- التحكم في مشاركة البيانات

## لا التزام
- المشاركة طوعية
- لا عقوبة لعدم المشاركة
- يمكن إعادة الانضمام لاحقًا (نقاط جديدة تبدأ)

للتواصل: loyalty@nilelink.app
    `.trim(),
    },
};

// ============================================
// CONSENT MANAGER CLASS
// ============================================

export class ConsentManager {
    /**
     * Get required consents for a user role
     */
    getRequiredConsents(userRole: string): ConsentType[] {
        const baseConsents: ConsentType[] = ['TERMS_OF_SERVICE', 'DATA_PROCESSING'];

        switch (userRole) {
            case 'ADMIN':
            case 'SUPER_ADMIN':
            case 'MANAGER':
                return [...baseConsents, 'AI_RECOMMENDATIONS'];

            case 'CASHIER':
            case 'KITCHEN':
            case 'WAITER':
                return [...baseConsents, 'PERFORMANCE_TRACKING'];

            case 'DRIVER':
                return [...baseConsents, 'PERFORMANCE_TRACKING'];

            case 'SUPPLIER':
                return baseConsents;

            case 'USER': // Customer
                return [...baseConsents, 'LOYALTY_PROGRAM']; // LOYALTY optional, handled separately

            default:
                return baseConsents;
        }
    }

    /**
     * Get optional consents
     */
    getOptionalConsents(): ConsentType[] {
        return ['MARKETING', 'LOYALTY_PROGRAM'];
    }

    /**
     * Upload consent document to IPFS
     */
    async uploadConsentToIPFS(consentType: ConsentType): Promise<string> {
        const template = CONSENT_TEMPLATES[consentType];
        return await ipfsService.uploadConsentDocument(template);
    }

    /**
     * Fetch consent document from IPFS
     */
    async fetchConsentFromIPFS(ipfsHash: string): Promise<ConsentContent> {
        return await ipfsService.fetch<ConsentContent>(ipfsHash);
    }

    /**
     * Get consent template
     */
    getTemplate(consentType: ConsentType): ConsentContent {
        return CONSENT_TEMPLATES[consentType];
    }

    /**
     * Check if all required consents are given
     * (This will query smart contract in production)
     */
    async hasAllRequiredConsents(userId: string, userRole: string): Promise<{
        hasAll: boolean;
        missing: ConsentType[];
    }> {
        const required = this.getRequiredConsents(userRole);
        const missing: ConsentType[] = [];

        // TODO: Query smart contract for actual consent records
        // For now, return placeholder
        for (const consentType of required) {
            // Simulate consent check
            const hasConsent = false; // Replace with actual blockchain query
            if (!hasConsent) {
                missing.push(consentType);
            }
        }

        return {
            hasAll: missing.length === 0,
            missing,
        };
    }

    /**
     * Record consent (will write to smart contract)
     */
    async recordConsent(consent: {
        userId: string;
        walletAddress: string;
        consentType: ConsentType;
        version: string;
        accepted: boolean;
        ip?: string;
    }): Promise<{
        success: boolean;
        txHash?: string;
        ipfsHash?: string;
    }> {
        try {
            // 1. Upload consent document to IPFS if not already uploaded
            const template = this.getTemplate(consent.consentType);
            const ipfsHash = await this.uploadConsentToIPFS(consent.consentType);

            // 2. TODO: Write to smart contract
            // const tx = await consentContract.recordConsent({
            //   user: consent.walletAddress,
            //   consentType: consent.consentType,
            //   version: consent.version,
            //   contentHash: ipfsHash,
            //   accepted: consent.accepted,
            //   ipHash: consent.ip ? hashIP(consent.ip) : ''
            // });

            console.log('[Consent Manager] ✅ Consent recorded:', consent.consentType);

            return {
                success: true,
                // txHash: tx.hash,
                ipfsHash,
            };
        } catch (error: any) {
            console.error('[Consent Manager] ❌ Failed to record consent:', error);
            return { success: false };
        }
    }

    /**
     * Revoke/withdraw consent
     */
    async revokeConsent(userId: string, consentType: ConsentType): Promise<{
        success: boolean;
        txHash?: string;
    }> {
        try {
            // TODO: Write to smart contract
            // const tx = await consentContract.revokeConsent(userId, consentType);

            console.log('[Consent Manager] ✅ Consent revoked:', consentType);

            return {
                success: true,
                // txHash: tx.hash,
            };
        } catch (error: any) {
            console.error('[Consent Manager] ❌ Failed to revoke consent:', error);
            return { success: false };
        }
    }

    /**
     * Get consent history for a user
     * (Query from smart contract)
     */
    async getConsentHistory(userId: string): Promise<OnChainConsent[]> {
        // TODO: Query smart contract or The Graph
        // For now, return empty array
        return [];
    }
}

// Singleton instance
export const consentManager = new ConsentManager();

// Convenience functions
export function getRequiredConsents(userRole: string) {
    return consentManager.getRequiredConsents(userRole);
}

export function getConsentTemplate(type: ConsentType) {
    return consentManager.getTemplate(type);
}
