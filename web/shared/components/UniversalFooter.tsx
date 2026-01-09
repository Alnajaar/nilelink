"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Github,
    Heart,
    Globe,
    ChevronUp,
    ExternalLink
} from 'lucide-react';

interface FooterLink {
    label: string;
    href: string;
    external?: boolean;
    arabicLabel?: string;
}

interface FooterSection {
    title: string;
    links: FooterLink[];
    arabicTitle?: string;
}

const footerSections: FooterSection[] = [
    {
        title: "Product",
        arabicTitle: "المنتج",
        links: [
            { label: "POS Terminal", href: "/pos", arabicLabel: "نقطة البيع" },
            { label: "Delivery Network", href: "/delivery", arabicLabel: "شبكة التوصيل" },
            { label: "Supplier Hub", href: "/supplier", arabicLabel: "مركز الموردين" },
            { label: "Marketplace", href: "/marketplace", arabicLabel: "السوق" },
            { label: "API Docs", href: "/docs/api", arabicLabel: "وثائق API" },
        ]
    },
    {
        title: "Company",
        arabicTitle: "الشركة",
        links: [
            { label: "About Us", href: "/about", arabicLabel: "من نحن" },
            { label: "Careers", href: "/careers", arabicLabel: "الوظائف" },
            { label: "Press", href: "/press", arabicLabel: "الصحافة" },
            { label: "Blog", href: "/blog", arabicLabel: "المدونة" },
            { label: "Contact", href: "/contact", arabicLabel: "اتصل بنا" },
        ]
    },
    {
        title: "Support",
        arabicTitle: "الدعم",
        links: [
            { label: "Help Center", href: "/help", arabicLabel: "مركز المساعدة" },
            { label: "Documentation", href: "/docs", arabicLabel: "الوثائق" },
            { label: "Status Page", href: "/status", arabicLabel: "صفحة الحالة" },
            { label: "Community", href: "/community", arabicLabel: "المجتمع" },
            { label: "Report Issue", href: "/report-issue", arabicLabel: "الإبلاغ عن مشكلة" },
        ]
    },
    {
        title: "Legal",
        arabicTitle: "قانوني",
        links: [
            { label: "Privacy Policy", href: "/privacy", arabicLabel: "سياسة الخصوصية" },
            { label: "Terms of Service", href: "/terms", arabicLabel: "شروط الخدمة" },
            { label: "Cookie Policy", href: "/cookies", arabicLabel: "سياسة ملفات تعريف الارتباط" },
            { label: "GDPR", href: "/gdpr", arabicLabel: "GDPR" },
            { label: "Security", href: "/security", arabicLabel: "الأمان" },
        ]
    }
];

const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/nilelink", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/nilelink", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/nilelink", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/nilelink", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/nilelink", label: "GitHub" },
];

interface UniversalFooterProps {
    variant?: 'minimal' | 'full';
    showBackToTop?: boolean;
    className?: string;
}

export const UniversalFooter: React.FC<UniversalFooterProps> = ({
    variant = 'full',
    showBackToTop = true,
    className = ''
}) => {
    const [isRTL, setIsRTL] = useState(false);
    const [showBackToTopButton, setShowBackToTopButton] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Detect RTL and scroll position
    useEffect(() => {
        setMounted(true);

        const checkRTL = () => {
            const rtl = document.documentElement.dir === 'rtl' ||
                navigator.language.startsWith('ar') ||
                localStorage.getItem('nilelink_rtl') === 'true';
            setIsRTL(rtl);
        };

        const handleScroll = () => {
            setShowBackToTopButton(window.scrollY > 300);
        };

        checkRTL();
        window.addEventListener('languagechange', checkRTL);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('languagechange', checkRTL);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentYear = new Date().getFullYear();

    if (variant === 'minimal') {
        return (
            <footer className={`bg-gray-900 text-white ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">NL</span>
                            </div>
                            <span className="font-semibold">NileLink</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            © {currentYear} NileLink. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                                {isRTL ? 'الخصوصية' : 'Privacy'}
                            </Link>
                            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                                {isRTL ? 'الشروط' : 'Terms'}
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <>
            <footer
                className={`bg-gray-900 text-white relative ${className}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                role="contentinfo"
            >
                {/* Main Footer Content */}
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                        {/* Brand Section */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-black text-lg">NL</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">NileLink</h3>
                                    <p className="text-sm text-gray-400">
                                        {isRTL ? 'نظام التشغيل الاقتصادي للتجارة الحديثة' : 'Economic OS for Modern Merchants'}
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-400 mb-6 leading-relaxed">
                                {isRTL
                                    ? 'منصة شاملة تجمع بين نقاط البيع والتوصيل والتوريد في نظام موحد يعمل بالذكاء الاصطناعي.'
                                    : 'A comprehensive platform uniting POS, delivery, and supply in an AI-powered unified system.'
                                }
                            </p>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm">hello@nilelink.app</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm" dir="ltr">+971 50 123 4567</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm">
                                        {isRTL ? 'دبي، الإمارات العربية المتحدة' : 'Dubai, UAE'}
                                    </span>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex items-center gap-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors group"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Link Sections */}
                        {footerSections.map((section) => (
                            <div key={section.title}>
                                <h4 className="font-semibold text-white mb-4">
                                    {isRTL ? section.arabicTitle || section.title : section.title}
                                </h4>
                                <ul className="space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className={`text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1 group ${isRTL ? 'flex-row-reverse' : ''}`}
                                            >
                                                {isRTL ? link.arabicLabel || link.label : link.label}
                                                {link.external && (
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>© {currentYear} NileLink. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</span>
                                <span className="hidden md:inline">•</span>
                                <span className="hidden md:inline">
                                    {isRTL ? 'مبني بـ' : 'Built with'} <Heart className="w-4 h-4 inline text-red-500 mx-1" /> {isRTL ? 'في دبي' : 'in Dubai'}
                                </span>
                            </div>

                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => {
                                        const newLang = isRTL ? 'en' : 'ar';
                                        document.documentElement.lang = newLang;
                                        document.documentElement.dir = isRTL ? 'ltr' : 'rtl';
                                        localStorage.setItem('nilelink_rtl', (!isRTL).toString());
                                        setIsRTL(!isRTL);
                                    }}
                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                                    aria-label={isRTL ? 'Switch to English' : 'التبديل إلى العربية'}
                                >
                                    <Globe className="w-4 h-4" />
                                    {isRTL ? 'English' : 'العربية'}
                                </button>

                                <Link
                                    href="/sitemap"
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    {isRTL ? 'خريطة الموقع' : 'Sitemap'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Back to Top Button */}
            {showBackToTop && showBackToTopButton && (
                <button
                    onClick={scrollToTop}
                    className={`fixed ${isRTL ? 'left-6' : 'right-6'} bottom-6 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50`}
                    aria-label={isRTL ? 'العودة إلى الأعلى' : 'Back to top'}
                >
                    <ChevronUp className="w-6 h-6 mx-auto" />
                </button>
            )}
        </>
    );
};
