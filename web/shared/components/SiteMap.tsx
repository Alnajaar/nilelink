"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Home, ExternalLink, Search, Filter } from 'lucide-react';

interface SiteMapItem {
    title: string;
    href: string;
    description?: string;
    children?: SiteMapItem[];
    arabicTitle?: string;
    arabicDescription?: string;
    external?: boolean;
    category?: string;
}

const siteMapData: SiteMapItem[] = [
    {
        title: "Home",
        arabicTitle: "الرئيسية",
        href: "/",
        description: "Main landing page with overview",
        arabicDescription: "الصفحة الرئيسية مع نظرة عامة",
        category: "main"
    },
    {
        title: "Products",
        arabicTitle: "المنتجات",
        href: "/products",
        description: "Product offerings and solutions",
        arabicDescription: "عروض المنتجات والحلول",
        category: "main",
        children: [
            {
                title: "POS Terminal",
                arabicTitle: "نقطة البيع",
                href: "/pos",
                description: "Point of sale system",
                arabicDescription: "نظام نقطة البيع"
            },
            {
                title: "Delivery Network",
                arabicTitle: "شبكة التوصيل",
                href: "/delivery",
                description: "Delivery management system",
                arabicDescription: "نظام إدارة التوصيل"
            },
            {
                title: "Supplier Hub",
                arabicTitle: "مركز الموردين",
                href: "/supplier",
                description: "Supplier management platform",
                arabicDescription: "منصة إدارة الموردين"
            },
            {
                title: "Marketplace",
                arabicTitle: "السوق",
                href: "/marketplace",
                description: "Digital marketplace",
                arabicDescription: "السوق الرقمي"
            }
        ]
    },
    {
        title: "Solutions",
        arabicTitle: "الحلول",
        href: "/solutions",
        description: "Industry-specific solutions",
        arabicDescription: "حلول متخصصة حسب الصناعة",
        category: "main",
        children: [
            {
                title: "Retail",
                arabicTitle: "البيع بالتجزئة",
                href: "/solutions/retail",
                description: "Retail store solutions",
                arabicDescription: "حلول متاجر البيع بالتجزئة"
            },
            {
                title: "Restaurant",
                arabicTitle: "المطاعم",
                href: "/solutions/restaurant",
                description: "Restaurant management",
                arabicDescription: "إدارة المطاعم"
            },
            {
                title: "E-commerce",
                arabicTitle: "التجارة الإلكترونية",
                href: "/solutions/ecommerce",
                description: "Online store integration",
                arabicDescription: "تكامل المتاجر الإلكترونية"
            }
        ]
    },
    {
        title: "Pricing",
        arabicTitle: "التسعير",
        href: "/pricing",
        description: "Subscription plans and pricing",
        arabicDescription: "خطط الاشتراك والتسعير",
        category: "main"
    },
    {
        title: "Company",
        arabicTitle: "الشركة",
        href: "/company",
        description: "About NileLink",
        arabicDescription: "عن نايل لينك",
        category: "company",
        children: [
            {
                title: "About Us",
                arabicTitle: "من نحن",
                href: "/about",
                description: "Company information",
                arabicDescription: "معلومات الشركة"
            },
            {
                title: "Careers",
                arabicTitle: "الوظائف",
                href: "/careers",
                description: "Join our team",
                arabicDescription: "انضم إلى فريقنا"
            },
            {
                title: "Press",
                arabicTitle: "الصحافة",
                href: "/press",
                description: "Press releases and media",
                arabicDescription: "البيانات الصحفية والإعلام"
            },
            {
                title: "Blog",
                arabicTitle: "المدونة",
                href: "/blog",
                description: "Latest news and insights",
                arabicDescription: "آخر الأخبار والرؤى"
            }
        ]
    },
    {
        title: "Support",
        arabicTitle: "الدعم",
        href: "/support",
        description: "Help and support resources",
        arabicDescription: "موارد المساعدة والدعم",
        category: "support",
        children: [
            {
                title: "Help Center",
                arabicTitle: "مركز المساعدة",
                href: "/help",
                description: "FAQs and guides",
                arabicDescription: "الأسئلة الشائعة والدليل"
            },
            {
                title: "Documentation",
                arabicTitle: "الوثائق",
                href: "/docs",
                description: "Technical documentation",
                arabicDescription: "الوثائق التقنية"
            },
            {
                title: "API Reference",
                arabicTitle: "مرجع API",
                href: "/docs/api",
                description: "API documentation",
                arabicDescription: "وثائق API"
            },
            {
                title: "Status Page",
                arabicTitle: "صفحة الحالة",
                href: "/status",
                description: "System status",
                arabicDescription: "حالة النظام"
            },
            {
                title: "Community",
                arabicTitle: "المجتمع",
                href: "/community",
                description: "User community",
                arabicDescription: "مجتمع المستخدمين"
            }
        ]
    },
    {
        title: "Legal",
        arabicTitle: "قانوني",
        href: "/legal",
        description: "Legal information and policies",
        arabicDescription: "المعلومات القانونية والسياسات",
        category: "legal",
        children: [
            {
                title: "Privacy Policy",
                arabicTitle: "سياسة الخصوصية",
                href: "/privacy",
                description: "How we handle your data",
                arabicDescription: "كيف نتعامل مع بياناتك"
            },
            {
                title: "Terms of Service",
                arabicTitle: "شروط الخدمة",
                href: "/terms",
                description: "Terms and conditions",
                arabicDescription: "الشروط والأحكام"
            },
            {
                title: "Cookie Policy",
                arabicTitle: "سياسة ملفات تعريف الارتباط",
                href: "/cookies",
                description: "Cookie usage policy",
                arabicDescription: "سياسة استخدام ملفات تعريف الارتباط"
            },
            {
                title: "GDPR",
                arabicTitle: "GDPR",
                href: "/gdpr",
                description: "GDPR compliance",
                arabicDescription: "الامتثال لـ GDPR"
            }
        ]
    },
    {
        title: "Contact",
        arabicTitle: "اتصل بنا",
        href: "/contact",
        description: "Get in touch with us",
        arabicDescription: "تواصل معنا",
        category: "main"
    }
];

const categories = [
    { key: 'main', label: 'Main Pages', arabicLabel: 'الصفحات الرئيسية' },
    { key: 'company', label: 'Company', arabicLabel: 'الشركة' },
    { key: 'support', label: 'Support', arabicLabel: 'الدعم' },
    { key: 'legal', label: 'Legal', arabicLabel: 'قانوني' }
];

interface SiteMapProps {
    className?: string;
}

export const SiteMap: React.FC<SiteMapProps> = ({ className = '' }) => {
    const [isRTL, setIsRTL] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        const checkRTL = () => {
            const rtl = document.documentElement.dir === 'rtl' ||
                       navigator.language.startsWith('ar') ||
                       localStorage.getItem('nilelink_rtl') === 'true';
            setIsRTL(rtl);
        };

        checkRTL();
        window.addEventListener('languagechange', checkRTL);
        return () => window.removeEventListener('languagechange', checkRTL);
    }, []);

    const toggleExpanded = (href: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(href)) {
            newExpanded.delete(href);
        } else {
            newExpanded.add(href);
        }
        setExpandedItems(newExpanded);
    };

    const filteredData = siteMapData.filter(item => {
        const matchesSearch = !searchTerm ||
            (isRTL ? item.arabicTitle || item.title : item.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (isRTL ? item.arabicDescription || item.description : item.description)?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const renderSiteMapItem = (item: SiteMapItem, level: number = 0): React.ReactNode => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.href);
        const title = isRTL ? item.arabicTitle || item.title : item.title;
        const description = isRTL ? item.arabicDescription || item.description : item.description;

        return (
            <div key={item.href} className={`${level > 0 ? `${isRTL ? 'mr-6 border-r border-gray-200 pr-4' : 'ml-6 border-l border-gray-200 pl-4'}` : ''}`}>
                <div className="flex items-center gap-3 py-3">
                    {hasChildren && (
                        <button
                            onClick={() => toggleExpanded(item.href)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors touch-manipulation ${
                                isExpanded ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 active:bg-gray-200'
                            }`}
                            aria-expanded={isExpanded}
                            aria-label={isRTL ? 'توسيع' : 'Expand'}
                        >
                            <ChevronRight
                                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            />
                        </button>
                    )}
                    {!hasChildren && <div className="w-8 h-8" />}

                    <Link
                        href={item.href}
                        className="flex-1 flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors group py-2 px-1 rounded-md hover:bg-gray-50 active:bg-gray-100 touch-manipulation min-h-[44px]"
                    >
                        <span className="font-medium text-base leading-relaxed">{title}</span>
                        {item.external && (
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                        )}
                    </Link>
                </div>

                {description && (
                    <p className={`text-sm text-gray-600 mb-3 ${level > 0 ? `${isRTL ? 'mr-11' : 'ml-11'}` : `${isRTL ? 'mr-11' : 'ml-11'}`} leading-relaxed`}>
                        {description}
                    </p>
                )}

                {hasChildren && isExpanded && (
                    <div className="mt-3 space-y-1">
                        {item.children!.map(child => renderSiteMapItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`max-w-4xl mx-auto px-4 py-8 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="mb-8">
                <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Link href="/" className="hover:text-blue-600 transition-colors">
                        <Home className="w-4 h-4" />
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span>{isRTL ? 'خريطة الموقع' : 'Site Map'}</span>
                </nav>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {isRTL ? 'خريطة الموقع' : 'Site Map'}
                </h1>
                <p className="text-gray-600">
                    {isRTL
                        ? 'استكشف جميع صفحات وأقسام موقعنا للعثور على ما تبحث عنه.'
                        : 'Explore all pages and sections of our website to find what you\'re looking for.'
                    }
                </p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
                <div className="flex flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className={`w-5 h-5 absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                        <input
                            type="text"
                            placeholder={isRTL ? 'البحث في خريطة الموقع...' : 'Search site map...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="w-full sm:w-64 sm:mx-auto">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-base"
                        >
                            <option value="all">{isRTL ? 'جميع الفئات' : 'All Categories'}</option>
                            {categories.map(category => (
                                <option key={category.key} value={category.key}>
                                    {isRTL ? category.arabicLabel : category.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Site Map Content */}
            <div className="space-y-8">
                {filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {isRTL ? 'لم يتم العثور على نتائج' : 'No results found'}
                        </h3>
                        <p className="text-gray-600">
                            {isRTL
                                ? 'جرب تعديل معايير البحث أو الفئة المحددة.'
                                : 'Try adjusting your search terms or selected category.'
                            }
                        </p>
                    </div>
                ) : (
                    filteredData.map(item => (
                        <div key={item.href} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {isRTL ? item.arabicTitle || item.title : item.title}
                                    </h2>
                                    {item.category && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                            {categories.find(cat => cat.key === item.category)?.label || item.category}
                                        </span>
                                    )}
                                </div>
                                {item.description && (
                                    <p className="text-gray-600 mt-2">
                                        {isRTL ? item.arabicDescription || item.description : item.description}
                                    </p>
                                )}
                            </div>
                            <div className="p-6">
                                {renderSiteMapItem(item)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
                <p className="text-sm text-gray-600">
                    {isRTL ? 'آخر تحديث:' : 'Last updated:'} {new Date().toLocaleDateString(isRTL ? 'ar' : 'en-US')}
                </p>
                <div className="mt-4 flex justify-center gap-4">
                    <Link
                        href="/help"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {isRTL ? 'تحتاج مساعدة؟' : 'Need help?'}
                    </Link>
                    <span className="text-gray-400">•</span>
                    <Link
                        href="/contact"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {isRTL ? 'اتصل بنا' : 'Contact us'}
                    </Link>
                </div>
            </div>
        </div>
    );
};