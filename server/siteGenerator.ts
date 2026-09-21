/**
 * Dynamic Creative Site Generator & Architectural Synthesizer for Sawwiha Platform
 * Replaces static templates with a generative, creative architecture engine.
 *
 * Core Directives:
 * - NO fixed templates or frozen layouts.
 * - Archetype detection is used solely for domain guidance and intelligence, NOT for fixed layouts.
 * - Even two requests in the same domain produce distinct layouts, typography, color schemes, sections, and interactions.
 * - Generates complete, production-ready static HTML5 + Tailwind CSS + Google Fonts + Vanilla JS.
 */

import { getDomainGuidance, DomainGuidance } from './domainGuidance';
import { getUniversalRouterScript } from './generators/routerScript';

export interface SiteGenerationInput {
  title: string;
  siteType: string;
  prompt: string;
  analysis?: any;
}

/**
 * Hash string to deterministic integer seed
 */
export function hashPrompt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Detect domain archetype to inform architectural guidelines (never to select a static template)
 */
export function detectArchetype(prompt: string, analysis?: any): string {
  const text = (prompt + ' ' + (analysis?.siteType || '') + ' ' + (analysis?.suggestedTitle || '')).toLowerCase();

  if (/دواجن|دجاج|بيض|أعلاف|علف|لحوم|مزارع|فروج|فقاسات|مزرعة/i.test(text)) {
    return 'poultry_agri';
  }
  if (/مطعم|طعام|أكل|مشاوي|كباب|برغر|شاورما|بيتزا|كافيه|مقهى|مأكولات|وجبات|شيف|حلويات|مطبخ|عصائر/i.test(text)) {
    return 'restaurant_cafe';
  }
  if (/متجر|تسوق|عطور|ملابس|أزياء|ساعات|أحذية|حقائب|منتجات|شراء|إلكترونيات|متجر إلكتروني|أقمشة|رجالي|نسائي/i.test(text)) {
    return 'ecommerce_store';
  }
  if (/عقار|عقارات|شقق|فيلا|فلل|أراضي|مكاتب|إيجار|بيع وشراء عقار|مجمع سكني|وساطة عقارية|سمسار|شقة|مبنى|برج/i.test(text)) {
    return 'real_estate';
  }
  if (/عيادة|مستشفى|طبيب|دكتور|أسنان|مركز طبي|صحة|علاج|مختبر|تجميل|صيدلية|جلدية|باطنية|أشعة|عيادات/i.test(text)) {
    return 'medical_clinic';
  }
  if (/مدرسة|أكاديمية|معهد|دورات|تدريب|تعليم|جامعة|كورسات|طلاب|درسني|تعلم|امتحانات|منصة تعليمية|كورس|محاضرات|منصة تدريب/i.test(text)) {
    return 'education_school';
  }
  if (/برمجيات|تسويق|وكالة|سوشيال|تصميم|حلول رقمية|شركة تقنية|تطوير تطبيقات/i.test(text)) {
    return 'tech_agency';
  }
  if (/معرض أعمال|سيرة ذاتية|مصمم|مطور|مبرمج|شخصي|بورتفوليو|portfolio/i.test(text)) {
    return 'personal_portfolio';
  }
  return 'general_business';
}

/**
 * Curated domain images based on prompt keywords and sub-niche
 */
function getDomainImages(prompt: string, archetype: string): { hero: string; secondary: string; items: string[] } {
  const p = prompt.toLowerCase();

  if (archetype === 'education_school') {
    if (/برمج|كود|تقنية|web|code|python|developer/i.test(p)) {
      return {
        hero: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        secondary: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        items: [
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
        ],
      };
    }
    if (/أطفال|صغار|روضة|حساب ذهني|طفل/i.test(p)) {
      return {
        hero: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
        secondary: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
        items: [
          'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
        ],
      };
    }
    return {
      hero: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      secondary: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80',
      items: [
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      ],
    };
  }

  if (archetype === 'restaurant_cafe') {
    if (/قهوة|كافيه|مقهى|بُن|v60/i.test(p)) {
      return {
        hero: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
        secondary: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        items: [
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
        ],
      };
    }
    if (/برغر|سريع|شاورما|بيتزا/i.test(p)) {
      return {
        hero: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
        secondary: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        items: [
          'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
        ],
      };
    }
    return {
      hero: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      secondary: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      items: [
        'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
      ],
    };
  }

  if (archetype === 'real_estate') {
    return {
      hero: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      secondary: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      items: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      ],
    };
  }

  if (archetype === 'medical_clinic') {
    return {
      hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
      secondary: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      items: [
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
      ],
    };
  }

  if (archetype === 'ecommerce_store') {
    if (/عطور|بخور|عود/i.test(p)) {
      return {
        hero: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
        secondary: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
        items: [
          'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
        ],
      };
    }
    return {
      hero: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      secondary: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
      items: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
      ],
    };
  }

  // General business / Services
  return {
    hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    secondary: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    items: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    ],
  };
}

/**
 * Creative Generative Architectural Engine:
 * Synthesizes a completely bespoke website based on prompt, analysis, domain intelligence, and prompt hash.
 */
export function buildComprehensiveSiteHtml(data: SiteGenerationInput): string {
  const prompt = data.prompt || '';
  const seed = hashPrompt(prompt);
  const archetype = detectArchetype(prompt, data.analysis);
  const guidance = getDomainGuidance(archetype, prompt);

  // 1. Determine Title & Tagline from analysis or prompt
  const siteTitle = data.analysis?.suggestedTitle || (prompt.length > 25 ? prompt.substring(0, 25) : prompt) || 'منصة سَوّيها';
  const siteType = data.analysis?.siteType || guidance.domainName;

  // 2. Determine Typography & Google Fonts
  const fontStyle = data.analysis?.visualStyle?.fontStyle || guidance.fontSuggestions[seed % guidance.fontSuggestions.length] || 'Cairo';
  const fontLink = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontStyle)}:wght@400;500;600;700;800;900&family=Cairo:wght@400;700;900&display=swap`;

  // 3. Determine Color Scheme
  const primaryColor = data.analysis?.visualStyle?.primaryColor || guidance.paletteSuggestions[seed % guidance.paletteSuggestions.length]?.primary || 'indigo-600';
  const secondaryColor = data.analysis?.visualStyle?.secondaryColor || guidance.paletteSuggestions[seed % guidance.paletteSuggestions.length]?.secondary || 'amber-500';

  // 4. Determine Layout Archetype
  // 0: Split-Hero with interactive widget
  // 1: Bento-Grid Portal with live cards
  // 2: Editorial Showcase with central typography & tabs
  const layoutVariation = data.analysis?.layoutArchetype
    ? (data.analysis.layoutArchetype.includes('bento') ? 1 : data.analysis.layoutArchetype.includes('editorial') ? 2 : 0)
    : (seed % 3);

  // 5. Determine Navigation Style
  // 0: Floating Pill Nav (Modern SaaS / Creative)
  // 1: Clean Sticky Header with Brand Monogram
  // 2: Multi-Page Tabbed Bar
  const navStyle = seed % 3;

  const images = getDomainImages(prompt, archetype);

  // Extract custom sections if provided in analysis
  const customSections = Array.isArray(data.analysis?.sections) && data.analysis.sections.length > 0
    ? data.analysis.sections
    : [
        { title: 'أبرز المزايا والحلول', description: 'منظومة مبتكرة صُممت خصيصاً لتلبية احتياجاتك بأعلى معايير الجودة.' },
        { title: 'كيف نعمل والمنهجية', description: 'خطوات عمل دقيقة وموثوقة تضمن النتائج والتفوق.' },
        { title: 'آراء وشهادات موثقة', description: 'تجارب واقعية وقصص نجاح من مجتمعنا وعملائنا.' },
      ];

  // Build Interactive Widget HTML based on Domain & Seed
  const interactiveWidget = buildDomainInteractiveWidget(archetype, prompt, siteTitle, seed);

  // Build Navigation HTML
  const navHtml = buildDynamicNav(navStyle, siteTitle, primaryColor, archetype);

  // Build Hero Section HTML based on layout variation
  const heroHtml = buildDynamicHero(layoutVariation, siteTitle, siteType, prompt, guidance, images.hero, primaryColor, secondaryColor, archetype);

  // Build Dynamic Sections HTML
  const sectionsHtml = buildDynamicSections(customSections, images.items, primaryColor);

  // For restaurant sites, build prominent Chef's Featured Dishes section
  const restaurantDishesHtml = archetype === 'restaurant_cafe' ? `
    <section id="featured-dishes" class="py-16 sm:py-20 bg-white border-y border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div class="flex items-end justify-between flex-wrap gap-4">
          <div class="space-y-2">
            <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">مختارات الشيف اليومية</span>
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900">أبرز الأطباق والمأكولات الأكثر طلباً</h2>
            <p class="text-xs sm:text-sm text-slate-500">نكهات بغدادية وشرقية أصيلة محضرة على أيدي أمهر الطهاة يومياً</p>
          </div>
          <div class="flex items-center gap-2">
            <a href="/menu/food" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all">
              استعراض المأكولات ←
            </a>
            <a href="/menu" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all">
              القائمة الكاملة
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-slate-50 rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div>
              <a href="/menu/item/mashawi" class="block aspect-4/3 rounded-2xl overflow-hidden mb-4 bg-slate-200 relative cursor-pointer">
                <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80" alt="صينية مشاوي مشكلة ملكية" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-md">الأكثر طلباً</span>
              </a>
              <div class="flex items-center justify-between mb-2">
                <a href="/menu/item/mashawi" class="font-black text-slate-900 text-base sm:text-lg hover:text-emerald-600 transition-colors cursor-pointer">صينية مشاوي مشكلة ملكية</a>
                <span class="font-black text-emerald-600 text-sm sm:text-base">22,000 د.ع</span>
              </div>
              <p class="text-xs text-slate-500 mb-4 leading-relaxed">كباب غنم بلدي، تكة لحم، شيش طاووق مع الخبز الحار والمقبلات والبيواز.</p>
            </div>
            <div class="pt-3 border-t border-slate-200/80 flex items-center gap-2">
              <a href="/menu/item/mashawi" class="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs text-center border border-slate-200 transition-all cursor-pointer">
                عرض التفاصيل والمكونات ←
              </a>
              <button onclick="showToast('تمت إضافة صينية المشاوي إلى طلبك'); if(typeof addToCart==='function') addToCart('صينية مشاوي مشكلة', '22,000 د.ع');" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer">
                أضف للطلب
              </button>
            </div>
          </div>

          <div class="bg-slate-50 rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div>
              <a href="/menu/item/kabab" class="block aspect-4/3 rounded-2xl overflow-hidden mb-4 bg-slate-200 relative cursor-pointer">
                <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80" alt="كباب لحم عراقي أصيل" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-600 text-white text-[10px] font-black shadow-md">خلطة الشيف</span>
              </a>
              <div class="flex items-center justify-between mb-2">
                <a href="/menu/item/kabab" class="font-black text-slate-900 text-base sm:text-lg hover:text-emerald-600 transition-colors cursor-pointer">كباب لحم عراقي أصيل</a>
                <span class="font-black text-emerald-600 text-sm sm:text-base">14,000 د.ع</span>
              </div>
              <p class="text-xs text-slate-500 mb-4 leading-relaxed">أسياخ كباب متبلة بالبهارات الخاصة ومشوية على الجمر الطبيعي مع الصمون الحار.</p>
            </div>
            <div class="pt-3 border-t border-slate-200/80 flex items-center gap-2">
              <a href="/menu/item/kabab" class="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs text-center border border-slate-200 transition-all cursor-pointer">
                عرض التفاصيل والمكونات ←
              </a>
              <button onclick="showToast('تمت إضافة الكباب العراقي إلى طلبك'); if(typeof addToCart==='function') addToCart('كباب لحم عراقي', '14,000 د.ع');" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer">
                أضف للطلب
              </button>
            </div>
          </div>

          <div class="bg-slate-50 rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div>
              <a href="/menu/item/appetizers" class="block aspect-4/3 rounded-2xl overflow-hidden mb-4 bg-slate-200 relative cursor-pointer">
                <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80" alt="تشكيلة مقبلات شرقية فاخرة" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-black shadow-md">طازج يومياً</span>
              </a>
              <div class="flex items-center justify-between mb-2">
                <a href="/menu/item/appetizers" class="font-black text-slate-900 text-base sm:text-lg hover:text-emerald-600 transition-colors cursor-pointer">تشكيلة مقبلات شرقية فاخرة</a>
                <span class="font-black text-emerald-600 text-sm sm:text-base">6,000 د.ع</span>
              </div>
              <p class="text-xs text-slate-500 mb-4 leading-relaxed">حمص بطحينة، متبل باذنجان مدخن، تبولة طازجة وبابا غنوج بدبس الرمان.</p>
            </div>
            <div class="pt-3 border-t border-slate-200/80 flex items-center gap-2">
              <a href="/menu/item/appetizers" class="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs text-center border border-slate-200 transition-all cursor-pointer">
                عرض التفاصيل والمكونات ←
              </a>
              <button onclick="showToast('تمت إضافة المقبلات إلى طلبك'); if(typeof addToCart==='function') addToCart('تشكيلة مقبلات شرقية', '6,000 د.ع');" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer">
                أضف للطلب
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>` : '';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteTitle} | ${siteType}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontLink}" rel="stylesheet">
  <style>
    body { font-family: '${fontStyle}', 'Cairo', system-ui, -apple-system, sans-serif; }
    .toast-animate { animation: toastIn 0.3s ease-out forwards; }
    @keyframes toastIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-slate-900 selection:text-white">

  ${navHtml}

  <main class="flex-1">
    ${heroHtml}

    ${restaurantDishesHtml}

    ${interactiveWidget.markup}

    ${sectionsHtml}

    <!-- Contact & Action Block -->
    <section id="contact-section" class="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div class="max-w-4xl mx-auto px-4 sm:px-6">
        <div class="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-xl">
          <div class="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-slate-800/60 blur-3xl pointer-events-none"></div>
          
          <div class="relative z-10 space-y-6 text-center">
            <span class="inline-block text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/10 text-white/90">
              ابدأ الآن مع ${siteTitle}
            </span>
            <h2 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              جاهز لتحويل الفكرة إلى واقع ملموس؟
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              تواصل معنا مباشرة عبر النموذج أو الواتساب، وسيقوم فريقنا بالرد عليك ومساعدتك في خطواتك القادمة.
            </p>

            <form onsubmit="handleUniversalForm(event)" class="max-w-md mx-auto space-y-3 pt-2 text-right">
              <div>
                <input type="text" id="contact-name" required placeholder="اسمك الكريم" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-white focus:bg-white/15 transition-all">
              </div>
              <div>
                <input type="text" id="contact-phone" required placeholder="رقم الهاتف أو الواتساب" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-white focus:bg-white/15 transition-all">
              </div>
              <div>
                <textarea id="contact-msg" rows="3" placeholder="ملاحظات أو استفسار إضافي..." class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-white focus:bg-white/15 transition-all resize-none"></textarea>
              </div>
              <button type="submit" class="w-full py-3.5 px-6 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer shadow-md">
                إرسال الطلب فوراً ←
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Universal Footer -->
  <footer class="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
      <div class="flex items-center gap-3">
        <span class="font-black text-white text-base">${siteTitle}</span>
        <span class="text-slate-600">|</span>
        <span>${siteType}</span>
      </div>
      <div class="flex items-center gap-4 text-slate-500">
        <a href="/" class="hover:text-slate-300 transition-colors">الرئيسية</a>
        <a href="/menu" class="hover:text-slate-300 transition-colors">القائمة والخدمات</a>
        <a href="/about" class="hover:text-slate-300 transition-colors">من نحن</a>
        <a href="/contact" class="hover:text-slate-300 transition-colors">تواصل معنا</a>
      </div>
      <div class="flex items-center gap-2 text-slate-500">
        <span>صُنع عبر</span>
        <span class="text-white font-bold">سَوّيها</span>
        <span>| منصة الذكاء الاصطناعي الإبداعي لبناء المواقع</span>
      </div>
    </div>
  </footer>

  <!-- Universal Interactive Toast Notification Container -->
  <div id="universal-toast" class="fixed bottom-6 left-6 z-50 hidden max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-center gap-3">
    <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-sm font-bold">✓</div>
    <div class="flex-1 text-xs">
      <p id="universal-toast-msg" class="font-semibold text-slate-100"></p>
    </div>
  </div>

  <script>
    function showToast(msg) {
      var toast = document.getElementById('universal-toast');
      var toastMsg = document.getElementById('universal-toast-msg');
      if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.classList.remove('hidden');
        toast.classList.add('toast-animate');
        setTimeout(function() {
          toast.classList.add('hidden');
        }, 4000);
      }
    }

    function handleUniversalForm(e) {
      e.preventDefault();
      var name = document.getElementById('contact-name')?.value || 'عميلنا العزيز';
      showToast('شكراً لك يا ' + name + '! تم استلام رسالتك وسنتواصل معك خلال دقائق.');
      e.target.reset();
    }

    function toggleMobileMenu() {
      var menu = document.getElementById('mobile-nav-menu');
      if (menu) {
        menu.classList.toggle('hidden');
      }
    }

    ${interactiveWidget.script}
  </script>

  ${getUniversalRouterScript({ siteTitle, defaultRoute: '/' })}
</body>
</html>`;
}

/**
 * Builds dynamic navigation based on chosen style
 */
function buildDynamicNav(style: number, siteTitle: string, primaryColor: string, archetype?: string): string {
  const isRestaurant = archetype === 'restaurant_cafe';
  const isEducation = archetype === 'education_school';

  let navLinks = `
    <a href="/" class="nav-link hover:text-slate-900 transition-colors" data-route="/">الرئيسية</a>
    <a href="/services" class="nav-link hover:text-slate-900 transition-colors" data-route="/services">المميزات والخدمات</a>
    <a href="/interactive-tool" class="nav-link hover:text-slate-900 transition-colors" data-route="/interactive-tool">الأداة التفاعلية</a>
    <a href="/about" class="nav-link hover:text-slate-900 transition-colors" data-route="/about">من نحن</a>
    <a href="/contact" class="nav-link hover:text-slate-900 transition-colors" data-route="/contact">تواصل معنا</a>
  `;
  let mobileLinks = `
    <a href="/" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100">الرئيسية</a>
    <a href="/services" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100">المميزات والخدمات</a>
    <a href="/interactive-tool" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100">الأداة التفاعلية</a>
    <a href="/about" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100">من نحن</a>
    <a href="/contact" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100">تواصل معنا</a>
  `;

  if (isRestaurant) {
    navLinks = `
      <a href="/" class="nav-link hover:text-slate-900 transition-colors" data-route="/">الرئيسية</a>
      <a href="/menu" class="nav-link hover:text-slate-900 transition-colors" data-route="/menu">قائمة الطعام</a>
      <a href="/menu/food" class="nav-link hover:text-slate-900 transition-colors" data-route="/menu/food">المأكولات</a>
      <a href="/menu/drinks" class="nav-link hover:text-slate-900 transition-colors" data-route="/menu/drinks">المشروبات</a>
      <a href="/about" class="nav-link hover:text-slate-900 transition-colors" data-route="/about">من نحن</a>
      <a href="/contact" class="nav-link hover:text-slate-900 transition-colors" data-route="/contact">تواصل وحجز</a>
    `;
    mobileLinks = `
      <a href="/" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold">الرئيسية</a>
      <a href="/menu" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold">قائمة الطعام</a>
      <a href="/menu/food" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold">المأكولات والأطباق</a>
      <a href="/menu/drinks" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold">المشروبات والعصائر</a>
      <a href="/about" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold">من نحن</a>
      <a href="/contact" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold">تواصل وحجز طاولة</a>
    `;
  } else if (isEducation) {
    navLinks = `
      <a href="/" class="nav-link hover:text-slate-900 transition-colors" data-route="/">الرئيسية</a>
      <a href="/courses" class="nav-link hover:text-slate-900 transition-colors" data-route="/courses">المسارات التعليمية</a>
      <a href="/interactive-tool" class="nav-link hover:text-slate-900 transition-colors" data-route="/interactive-tool">المختبر التفاعلي</a>
      <a href="/about" class="nav-link hover:text-slate-900 transition-colors" data-route="/about">عن الأكاديمية</a>
      <a href="/contact" class="nav-link hover:text-slate-900 transition-colors" data-route="/contact">التسجيل</a>
    `;
    mobileLinks = `
      <a href="/" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold">الرئيسية</a>
      <a href="/courses" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold">المسارات التعليمية</a>
      <a href="/interactive-tool" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold">المختبر التفاعلي</a>
      <a href="/about" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold">عن الأكاديمية</a>
      <a href="/contact" onclick="toggleMobileMenu()" class="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold">التسجيل والاستفسار</a>
    `;
  }

  if (style === 0) {
    // Floating Pill Nav
    return `
    <header class="fixed top-4 inset-x-0 z-40 px-4">
      <div class="max-w-5xl mx-auto bg-white/90 backdrop-blur-md rounded-full px-6 py-3 border border-slate-200/80 shadow-lg flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-${primaryColor} text-white flex items-center justify-center font-black text-sm">
            ${siteTitle.charAt(0)}
          </div>
          <span class="font-black text-sm sm:text-base text-slate-900">${siteTitle}</span>
        </div>

        <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          ${navLinks}
        </nav>

        <div class="flex items-center gap-2">
          <a href="/contact" class="text-xs font-bold px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer">
            ${isRestaurant ? 'احجز طاولة' : 'ابدأ معنا'}
          </a>
          <button onclick="toggleMobileMenu()" class="md:hidden p-2 text-slate-700 hover:text-slate-950">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </div>

      <!-- Mobile dropdown -->
      <div id="mobile-nav-menu" class="hidden md:hidden max-w-5xl mx-auto mt-2 bg-white rounded-2xl p-4 border border-slate-200 shadow-xl space-y-2 text-xs font-semibold">
        ${mobileLinks}
      </div>
    </header>
    <div class="h-20"></div>`;
  }

  // Sticky Standard / Executive Header
  return `
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-${primaryColor} text-white flex items-center justify-center font-black text-lg shadow-sm">
          ${siteTitle.charAt(0)}
        </div>
        <div>
          <span class="font-black text-base sm:text-lg text-slate-900 block leading-tight">${siteTitle}</span>
          <span class="text-[11px] text-slate-500 font-medium">منصة رقمية متكاملة</span>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
        ${navLinks}
      </nav>

      <div class="flex items-center gap-3">
        <a href="/contact" class="text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl bg-${primaryColor} text-white hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer">
          ${isRestaurant ? 'حجز طاولة' : 'طلب تواصل فوري'}
        </a>
        <button onclick="toggleMobileMenu()" class="md:hidden p-2 text-slate-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>
    </div>

    <!-- Mobile Dropdown -->
    <div id="mobile-nav-menu" class="hidden md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 text-sm font-medium">
      ${mobileLinks}
    </div>
  </header>`;
}

/**
 * Builds dynamic Hero Section based on layout variation
 */
function buildDynamicHero(
  layout: number,
  title: string,
  siteType: string,
  prompt: string,
  guidance: DomainGuidance,
  heroImage: string,
  primaryColor: string,
  secondaryColor: string,
  archetype?: string
): string {
  const shortDesc = prompt.length > 30 ? prompt : `${guidance.copywritingTone} - حل متكامل مصمم خصيصاً لتحقيق أعلى مستويات الرضا والتميز.`;
  const isRestaurant = archetype === 'restaurant_cafe';

  let heroCtas = `
    <a href="/services" class="px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer">
      استكشف خدماتنا ←
    </a>
    <a href="/contact" class="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all cursor-pointer">
      تواصل معنا الآن
    </a>
  `;
  if (isRestaurant) {
    heroCtas = `
      <a href="/menu" class="px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer">
        تصفح القائمة الكاملة ←
      </a>
      <a href="/menu/food" class="px-5 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all cursor-pointer">
        أشهى المأكولات
      </a>
      <a href="/contact" class="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all cursor-pointer">
        حجز طاولة
      </a>
    `;
  }

  if (layout === 1) {
    // Bento-Grid Layout
    return `
    <section id="hero" class="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Main Bento Card (Span 2) -->
        <div class="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div class="space-y-4 max-w-lg z-10">
            <span class="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-white/10 text-white/90">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ${siteType}
            </span>
            <h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              ${title}
            </h1>
            <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
              ${shortDesc}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-4 pt-8 z-10">
            ${heroCtas}
          </div>

          <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-${primaryColor}/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <!-- Secondary Bento Card (Visual) -->
        <div class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col">
          <div class="h-48 overflow-hidden bg-slate-100">
            <img src="${heroImage}" alt="${title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
          </div>
          <div class="p-6 space-y-3 flex-1 flex flex-col justify-between">
            <div class="space-y-1">
              <span class="text-xs font-bold text-emerald-600">مميزات حصرية</span>
              <h3 class="font-black text-slate-900 text-base">${guidance.conversionDrivers[0] || 'خدمة متميزة ومعتمدة'}</h3>
              <p class="text-xs text-slate-500 leading-relaxed">${guidance.keyUXPrinciples[0] || 'تجربة مستخدم مصممة وفق أرقى المعايير العالمية.'}</p>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>تقييم المراجعين</span>
              <span class="text-amber-500 font-bold">★ 4.9 / 5</span>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  if (layout === 2) {
    // Editorial Showcase Layout
    let editorialCtas = `
      <a href="/services" class="px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm sm:text-base hover:bg-slate-800 shadow-md hover:shadow-lg transition-all cursor-pointer">
        استكشف المزايا والخدمات
      </a>
      <a href="/contact" class="px-8 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-sm sm:text-base hover:bg-slate-50 transition-all cursor-pointer">
        تواصل معنا مباشرة
      </a>
    `;
    if (isRestaurant) {
      editorialCtas = `
        <a href="/menu" class="px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm sm:text-base hover:bg-slate-800 shadow-md hover:shadow-lg transition-all cursor-pointer">
          تصفح قائمة الطعام ←
        </a>
        <a href="/menu/food" class="px-6 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-sm sm:text-base hover:bg-slate-50 transition-all cursor-pointer">
          أشهى المأكولات
        </a>
        <a href="/contact" class="px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm sm:text-base hover:bg-emerald-700 transition-all cursor-pointer">
          حجز طاولة
        </a>
      `;
    }

    return `
    <section id="hero" class="py-16 sm:py-28 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-8">
      <div class="space-y-4">
        <span class="inline-block text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200/60">
          ${siteType}
        </span>
        <h1 class="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          ${title}
        </h1>
        <p class="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          ${shortDesc}
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-4">
        ${editorialCtas}
      </div>

      <div class="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 mt-8 aspect-video max-h-[420px] w-full">
        <img src="${heroImage}" alt="${title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
      </div>
    </section>`;
  }

  // Split-Hero Layout (Default 0)
  let splitCtas = `
    <a href="/services" class="px-6 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer">
      استكشف الخدمات ←
    </a>
    <a href="/contact" class="px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer">
      حجز واستفسار
    </a>
  `;
  if (isRestaurant) {
    splitCtas = `
      <a href="/menu" class="px-6 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer">
        تصفح القائمة الكاملة ←
      </a>
      <a href="/menu/food" class="px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer">
        أشهى المأكولات
      </a>
      <a href="/contact" class="px-5 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all cursor-pointer">
        حجز طاولة
      </a>
    `;
  }

  return `
  <section id="hero" class="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      <div class="lg:col-span-7 space-y-6 text-right">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>${siteType}</span>
        </div>

        <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          ${title}
        </h1>

        <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
          ${shortDesc}
        </p>

        <div class="flex flex-wrap items-center gap-4 pt-2">
          ${splitCtas}
        </div>

        <!-- Trust badges -->
        <div class="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900">✓</span>
            <span>${guidance.conversionDrivers[0] || 'جودة واعتماد موثق'}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900">✓</span>
            <span>${guidance.conversionDrivers[1] || 'دعم ومتابعة مستمرة'}</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5">
        <div class="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 aspect-4/3 sm:aspect-square bg-slate-100">
          <img src="${heroImage}" alt="${title}" class="w-full h-full object-cover">
          <div class="absolute bottom-4 inset-x-4 bg-white/95 backdrop-blur-xs p-4 rounded-2xl shadow-lg border border-slate-200/60">
            <div class="flex items-center justify-between text-xs">
              <span class="font-black text-slate-900">${title}</span>
              <span class="font-bold text-emerald-600">خدمة معتمدة 100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

/**
 * Builds tailored interactive widget depending on domain & prompt nuances
 */
function buildDomainInteractiveWidget(
  archetype: string,
  prompt: string,
  siteTitle: string,
  seed: number
): { markup: string; script: string } {
  const p = prompt.toLowerCase();

  // 1. Education: Quiz or Code Runner
  if (archetype === 'education_school') {
    if (/برمج|كود|تقنية|web|code|python|developer/i.test(p)) {
      return {
        markup: `
        <section id="interactive-tool" class="py-16 bg-slate-900 text-white">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <div class="text-center space-y-2">
              <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">مختبر البرمجة التجريبي</span>
              <h2 class="text-2xl sm:text-3xl font-black">جرب كتابة الكود وشاهد النتيجة حياً</h2>
              <p class="text-xs sm:text-sm text-slate-400">تحدي مصغر لاختبار مهاراتك البرمجية فوراً داخل المنصة</p>
            </div>

            <div class="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 font-mono text-xs sm:text-sm">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-xs">
                <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> solution.js</span>
                <span class="text-emerald-400">✓ JavaScript Sandbox</span>
              </div>
              <div class="text-slate-300">
                <p class="text-slate-500">// قم بتعديل القيمة لاختبار المحرك:</p>
                <p><span class="text-indigo-400">const</span> learner = <span class="text-amber-300">"طالب سَوّيها الذكي"</span>;</p>
                <p><span class="text-indigo-400">function</span> testProgress() {</p>
                <p class="pr-4"><span class="text-indigo-400">return</span> <span class="text-amber-300">"مرحباً بك في "</span> + <span class="text-indigo-400">"${siteTitle}"</span>;</p>
                <p>}</p>
              </div>
              <div id="code-output" class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-emerald-400 text-xs font-mono hidden">
                > تم تشغيل الكود بنجاح! النتيجة: مرحباً بك في ${siteTitle}
              </div>
              <div class="pt-2 flex justify-end">
                <button onclick="runCodeChallenge()" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs font-sans transition-all cursor-pointer">
                  تشغيل الكود الآن ▶
                </button>
              </div>
            </div>
          </div>
        </section>`,
        script: `
        function runCodeChallenge() {
          var out = document.getElementById('code-output');
          if (out) {
            out.classList.remove('hidden');
            showToast('رائع! كودك يعمل بنجاح بنسبة 100%!');
          }
        }`,
      };
    }

    // Diagnostic Quiz (Children or Academic)
    return {
      markup: `
      <section id="interactive-tool" class="py-16 bg-white border-y border-slate-200">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div class="text-center space-y-2">
            <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider">الاختبار التجريبي الفوري</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900">اختبر مستواك في دقيقة واحدة</h2>
            <p class="text-xs sm:text-sm text-slate-500">سؤال سريع لقياس فهمك والحصول على تقييم فوري</p>
          </div>

          <div class="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6">
            <div class="space-y-2">
              <span class="text-xs font-bold text-indigo-600">السؤال الأول من 1:</span>
              <h3 class="text-base sm:text-lg font-bold text-slate-900">
                ما هي أفضل استراتيجية لتحقيق أعلى الدرجات في المناهج والامتحانات؟
              </h3>
            </div>

            <div class="space-y-3">
              <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 cursor-pointer transition-all">
                <input type="radio" name="quiz-opt" value="1" class="text-indigo-600">
                <span class="text-xs sm:text-sm text-slate-700">الفهم العميق وحل بنوك الأسئلة الامتحانية مع المتابعة المستمرة</span>
              </label>
              <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 cursor-pointer transition-all">
                <input type="radio" name="quiz-opt" value="2" class="text-indigo-600">
                <span class="text-xs sm:text-sm text-slate-700">الحفظ السريع ليلة الامتحان فقط دون مراجعة</span>
              </label>
            </div>

            <div class="flex items-center justify-between pt-2">
              <span id="quiz-result-text" class="text-xs font-bold text-emerald-600 hidden">✓ إجابة ممتازة وصحيحة 100%!</span>
              <button onclick="submitQuizAnswer()" class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer">
                تأكيد الإجابة
              </button>
            </div>
          </div>
        </div>
      </section>`,
      script: `
      function submitQuizAnswer() {
        var selected = document.querySelector('input[name="quiz-opt"]:checked');
        if (!selected) {
          showToast('يرجى اختيار إجابة أولاً.');
          return;
        }
        var resText = document.getElementById('quiz-result-text');
        if (selected.value === '1') {
          if (resText) {
            resText.textContent = '✓ إجابة صحيحة ومثالية! تهانينا، أنت جاهز للتفوق!';
            resText.classList.remove('hidden');
          }
          showToast('أحسنت! إجابة صحيحة 100%');
        } else {
          if (resText) {
            resText.textContent = 'إجابة غير دقيقة، الحل الأمثل هو الفهم وحل بنك الأسئلة.';
            resText.classList.remove('hidden');
          }
          showToast('جرّب مراجعة المفهوم مرة أخرى!');
        }
      }`,
    };
  }

  // 2. Dining: Table Reservation or Food Customizer
  if (archetype === 'restaurant_cafe') {
    return {
      markup: `
      <section id="interactive-tool" class="py-16 bg-white border-y border-slate-200">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <div class="text-center space-y-2">
            <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">حجز فوري ومؤكد</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900">احجز طاولتك أو موعدك الآن</h2>
            <p class="text-xs sm:text-sm text-slate-500">اختر عدد الأفراد والتاريخ المناسب لتأكيد طاولتك في ثوانٍ</p>
          </div>

          <form onsubmit="handleTableBooking(event)" class="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">عدد الضيوف</label>
                <select id="guest-count" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800">
                  <option value="2">شخصان (طاولة ثنائية)</option>
                  <option value="4">4 أشخاص (طاولة عائلية)</option>
                  <option value="6">6 أشخاص فما فوق (جلسة VIP)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">التاريخ المفضل</label>
                <input type="date" id="booking-date" required class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">الفترة المفضلة</label>
                <select id="booking-time" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800">
                  <option value="lunch">غداء (1:00 م - 4:00 م)</option>
                  <option value="dinner">عشاء (7:00 م - 11:00 م)</option>
                </select>
              </div>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm">
              تأكيد حجز الطاولة الفوري ←
            </button>
          </form>
        </div>
      </section>`,
      script: `
      function handleTableBooking(e) {
        e.preventDefault();
        var guests = document.getElementById('guest-count')?.value || '2';
        showToast('تم تأكيد حجزك لطاولة لـ ' + guests + ' أشخاص! ننتظر تشريفكم.');
      }`,
    };
  }

  // 3. Real Estate: Mortgage & Installment Calculator
  if (archetype === 'real_estate') {
    return {
      markup: `
      <section id="interactive-tool" class="py-16 bg-white border-y border-slate-200">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <div class="text-center space-y-2">
            <span class="text-xs font-bold text-sky-700 uppercase tracking-wider">حاسبة التمويل والأقساط</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900">احسب قسطك العقاري الشهري التقديري</h2>
            <p class="text-xs sm:text-sm text-slate-500">حرك المؤشرات لمعرفة القسط المتوقع وسنوات السداد</p>
          </div>

          <div class="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-5">
            <div>
              <div class="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>سعر العقار التقديري:</span>
                <span id="prop-price-label" class="text-sky-700">120,000 $</span>
              </div>
              <input type="range" id="prop-price" min="40000" max="500000" step="10000" value="120000" oninput="calcMortgage()" class="w-full accent-sky-700">
            </div>

            <div>
              <div class="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>الدفعة الأولى المقدمة:</span>
                <span id="down-payment-label" class="text-sky-700">20%</span>
              </div>
              <input type="range" id="down-payment" min="10" max="50" step="5" value="20" oninput="calcMortgage()" class="w-full accent-sky-700">
            </div>

            <div class="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
              <span class="text-xs font-bold text-sky-950">القسط الشهري التقديري (15 سنة):</span>
              <span id="monthly-installment" class="text-base font-black text-sky-900">750 $ / شهرياً</span>
            </div>
          </div>
        </div>
      </section>`,
      script: `
      function calcMortgage() {
        var price = parseInt(document.getElementById('prop-price')?.value || '120000');
        var downPct = parseInt(document.getElementById('down-payment')?.value || '20');
        document.getElementById('prop-price-label').textContent = price.toLocaleString() + ' $';
        document.getElementById('down-payment-label').textContent = downPct + '%';
        var loan = price * (1 - (downPct / 100));
        var monthly = Math.round(loan / (15 * 12));
        document.getElementById('monthly-installment').textContent = monthly.toLocaleString() + ' $ / شهرياً';
      }`,
    };
  }

  // 4. Medical Clinic: Appointment Scheduler
  if (archetype === 'medical_clinic') {
    return {
      markup: `
      <section id="interactive-tool" class="py-16 bg-white border-y border-slate-200">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <div class="text-center space-y-2">
            <span class="text-xs font-bold text-teal-700 uppercase tracking-wider">حجز موعد كشف واستشارة</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900">احجز موعدك الطبي بسهولة</h2>
            <p class="text-xs sm:text-sm text-slate-500">اختر العيادة التخصصية والطبيب للحصول على حجز فوري مؤكد</p>
          </div>

          <form onsubmit="handleMedicalBooking(event)" class="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">العيادة التخصصية</label>
                <select id="clinic-dept" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800">
                  <option value="general">الاستشارة العامة والفحص الدوري</option>
                  <option value="specialist">العيادة التخصصية المتقدمة</option>
                  <option value="lab">التحاليل والفحوصات المخبرية</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">تاريخ المراجعة</label>
                <input type="date" id="clinic-date" required class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800">
              </div>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-all cursor-pointer shadow-sm">
              تأكيد الموعد الطبي والحصول على رقم الحجز ←
            </button>
          </form>
        </div>
      </section>`,
      script: `
      function handleMedicalBooking(e) {
        e.preventDefault();
        var code = 'MED-' + Math.floor(1000 + Math.random() * 9000);
        showToast('تم تأكيد حجزك الطبي بنجاح! رقم المراجعة: ' + code);
      }`,
    };
  }

  // 5. Default / Business Services: Quote Estimator
  return {
    markup: `
    <section id="interactive-tool" class="py-16 bg-white border-y border-slate-200">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div class="text-center space-y-2">
          <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">مقدر التكلفة الذكي</span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900">احسب التكلفة التقديرية لمشروعك فوراً</h2>
          <p class="text-xs sm:text-sm text-slate-500">حدد نطاق العمل للحصول على تقدير استثماري أولي</p>
        </div>

        <div class="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-4">
          <div class="space-y-3">
            <label class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 cursor-pointer">
              <span class="text-xs sm:text-sm text-slate-800 font-semibold">حزمة الخدمات الأساسية والتشغيل الأولي</span>
              <input type="checkbox" checked onchange="calcEstimate()" id="opt-base" class="w-4 h-4 accent-slate-900">
            </label>
            <label class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 cursor-pointer">
              <span class="text-xs sm:text-sm text-slate-800 font-semibold">ميزات متقدمة وحلول مخصصة (Custom Solutions)</span>
              <input type="checkbox" onchange="calcEstimate()" id="opt-adv" class="w-4 h-4 accent-slate-900">
            </label>
            <label class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 cursor-pointer">
              <span class="text-xs sm:text-sm text-slate-800 font-semibold">دعم فني واستشاري مخصص على مدار الساعة</span>
              <input type="checkbox" onchange="calcEstimate()" id="opt-sup" class="w-4 h-4 accent-slate-900">
            </label>
          </div>

          <div class="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300">التقدير الاستثماري التقريبي:</span>
            <span id="estimate-val" class="text-base font-black text-emerald-400">يبدأ من 500 $</span>
          </div>
        </div>
      </div>
    </section>`,
    script: `
    function calcEstimate() {
      var total = 500;
      if (document.getElementById('opt-adv')?.checked) total += 600;
      if (document.getElementById('opt-sup')?.checked) total += 300;
      document.getElementById('estimate-val').textContent = 'يبدأ من ' + total + ' $';
    }`,
  };
}

/**
 * Builds Dynamic Sections from Custom Analysis or Tailored Archetype
 */
function buildDynamicSections(
  sections: Array<{ title: string; description: string; page?: string }>,
  itemImages: string[],
  primaryColor: string
): string {
  const cardsHtml = sections.map((sec, idx) => {
    const img = itemImages[idx % itemImages.length];
    return `
    <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-lg transition-all duration-300 space-y-4 flex flex-col justify-between">
      <div class="space-y-3">
        <div class="h-36 rounded-xl overflow-hidden bg-slate-100">
          <img src="${img}" alt="${sec.title}" loading="lazy" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
        </div>
        <h3 class="text-base sm:text-lg font-black text-slate-900">${sec.title}</h3>
        <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">${sec.description}</p>
      </div>
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span class="font-bold text-slate-700">استكشف المزيد</span>
        <span class="text-${primaryColor} font-bold">←</span>
      </div>
    </div>`;
  }).join('\n');

  return `
  <section id="sections-container" class="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
    <div class="text-center space-y-2 max-w-2xl mx-auto">
      <span class="text-xs font-bold uppercase tracking-wider text-slate-400">نظرة شاملة</span>
      <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
        كل ما تحتاجه في تجربة واحدة متكاملة
      </h2>
      <p class="text-slate-500 text-sm">
        أقسام مصممة لتغطية كافة جوانب وتطلعات الزائر والعميل
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${cardsHtml}
    </div>
  </section>`;
}

/**
 * Sanitizes and validates LLM-generated HTML.
 * Retains creative AI outputs as long as they represent valid HTML structure.
 * Only falls back if the output was empty, completely broken, or lacks basic HTML markup.
 */
export function sanitizeAndValidateGeneratedHtml(
  rawHtml: string,
  prompt: string,
  analysis?: any
): string {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return buildComprehensiveSiteHtml({
      title: analysis?.suggestedTitle || 'موقع سَوّيها',
      siteType: analysis?.siteType || 'موقع متكامل',
      prompt,
      analysis,
    });
  }

  let clean = rawHtml.replace(/```html/gi, '').replace(/```json/gi, '').replace(/```/g, '').trim();

  // If Gemini returned a JSON object string like {"html": "<!DOCTYPE..."}
  if (clean.startsWith('{') && clean.endsWith('}')) {
    try {
      const parsed = JSON.parse(clean);
      if (parsed?.html) {
        clean = parsed.html.trim();
      }
    } catch {
      // ignore
    }
  }

  // If output is too short or doesn't have basic HTML tags, synthesize fresh
  if (clean.length < 800 || (!clean.includes('<html') && !clean.includes('<!DOCTYPE'))) {
    console.log('[SiteGenerator] LLM output was insufficient, synthesizing tailored architectural site.');
    return buildComprehensiveSiteHtml({
      title: analysis?.suggestedTitle || 'موقع سَوّيها',
      siteType: analysis?.siteType || 'موقع متكامل',
      prompt,
      analysis,
    });
  }

  // Remove leaking template literal artifacts if any
  if (clean.includes('${') && !clean.includes('<script')) {
    clean = clean.replace(/\$\{[^}]*\}/g, '');
  }

  // Ensure DOCTYPE
  if (!clean.startsWith('<!DOCTYPE html>')) {
    clean = `<!DOCTYPE html>\n${clean}`;
  }

  // Ensure dir="rtl"
  if (!clean.includes('dir="rtl"')) {
    clean = clean.replace('<html', '<html lang="ar" dir="rtl"');
  }

  // Ensure Tailwind CDN
  if (!clean.includes('@tailwindcss/browser') && !clean.includes('tailwindcss')) {
    clean = clean.replace(
      '</head>',
      '  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>\n</head>'
    );
  }

  // Ensure Universal Isolated Router is injected
  if (!clean.includes('sawwihaRouter') && !clean.includes('SAWWIHA_ROUTER_INITIALIZED')) {
    const routerScript = getUniversalRouterScript({ siteTitle: analysis?.suggestedTitle || 'الموقع' });
    if (clean.includes('</body>')) {
      clean = clean.replace('</body>', `${routerScript}\n</body>`);
    } else if (clean.includes('</html>')) {
      clean = clean.replace('</html>', `${routerScript}\n</html>`);
    } else {
      clean += routerScript;
    }
  }

  return clean;
}

/**
 * Metadata provider for project initialization and UI badges
 */
export function getArchetypeMetadata(archetype: string): {
  pages: Array<{ id: string; title: string; path: string; purpose: string }>;
  components: Array<{ name: string; type: string; description: string }>;
} {
  if (archetype === 'restaurant_cafe') {
    return {
      pages: [
        { id: 'home', title: 'الرئيسية', path: '/', purpose: 'الواجهة وأبرز الأطباق وقائمة اليوم والعروض' },
        { id: 'menu', title: 'قائمة الطعام', path: '/menu', purpose: 'القائمة الكاملة مقسمة حسب الفئات والأسعار' },
        { id: 'food', title: 'المأكولات والأطباق', path: '/menu/food', purpose: 'استعراض الأطباق الرئيسية والمقبلات' },
        { id: 'drinks', title: 'المشروبات والعصائر', path: '/menu/drinks', purpose: 'المشروبات الساخنة والباردة والعصائر' },
        { id: 'about', title: 'من نحن وقصتنا', path: '/about', purpose: 'تاريخ المطعم والشيف والجودة' },
        { id: 'contact', title: 'تواصل وحجز طاولة', path: '/contact', purpose: 'نموذج حجز الطاولات والموقع وأرقام التواصل' },
      ],
      components: [
        { name: 'شريط التنقل وقائمة الروابط', type: 'Header & Nav', description: 'شعار وقائمة طعام متجاوبة مع روابط معزولة' },
        { name: 'قسم الترحيب والعروض الحية', type: 'Hero Section', description: 'أزرار تصفح القائمة وحجز طاولة فوري' },
        { name: 'نظام حجز الطاولات الذكي', type: 'Booking Widget', description: 'اختيار عدد الضيوف والفترة وتأكيد فوري' },
        { name: 'أطباق وقائمة مختارة', type: 'Menu Showcase', description: 'بطاقات الأطباق التفاعلية مع صور عالية الجودة' },
        { name: 'التذييل وتفاصيل الموقع', type: 'Footer', description: 'أوقات العمل وأرقام التواصل وشارة سَوّيها' },
      ],
    };
  }

  if (archetype === 'education_school') {
    return {
      pages: [
        { id: 'home', title: 'الرئيسية', path: '/', purpose: 'الواجهة والمسارات والبرامج التدريبية' },
        { id: 'courses', title: 'المسارات التعليمية', path: '/courses', purpose: 'الدورات والشهادات والمناهج التفاعلية' },
        { id: 'interactive-tool', title: 'المختبر التفاعلي', path: '/interactive-tool', purpose: 'أداة التدريب واختبار المستوى الفوري' },
        { id: 'about', title: 'عن المنصة', path: '/about', purpose: 'رؤية المنصة وهيئة التدريس والاعتمادات' },
        { id: 'contact', title: 'التسجيل والتواصل', path: '/contact', purpose: 'نموذج طلب التسجيل والاستفسارات' },
      ],
      components: [
        { name: 'شريط التنقل الأكاديمي', type: 'Header & Nav', description: 'روابط المسارات والمختبر التفاعلي والتسجيل' },
        { name: 'واجهة البطل الاستكشافية', type: 'Hero Section', description: 'دعوة للتسجيل وتجربة الاختبار' },
        { name: 'المختبر واختبار المستوى', type: 'Quiz / Lab', description: 'اختبار فوري لقياس المعارف' },
        { name: 'بطاقات الدورات والمجالات', type: 'Course Grid', description: 'استعراض المسارات والمناهج' },
        { name: 'نموذج التسجيل السريع', type: 'Registration', description: 'حجز المقعد الأكاديمي' },
      ],
    };
  }

  return {
    pages: [
      { id: 'home', title: 'الرئيسية', path: '/', purpose: 'الواجهة والتعريف بالنشاط وأبرز المزايا' },
      { id: 'services', title: 'المميزات والخدمات', path: '/services', purpose: 'استعراض الخدمات وقائمة المميزات' },
      { id: 'interactive-tool', title: 'الأداة التفاعلية', path: '/interactive-tool', purpose: 'أداة تفاعلية مخصصة وحاسبة ذكية' },
      { id: 'about', title: 'من نحن', path: '/about', purpose: 'الرؤية وفريق العمل والاعتمادات' },
      { id: 'contact', title: 'تواصل معنا', path: '/contact', purpose: 'نموذج الطلب والواتساب المباشر' },
    ],
    components: [
      { name: 'شريط التنقل الذكي', type: 'Header & Nav', description: 'شعار وقائمة متجاوبة مع روابط معزولة' },
      { name: 'قسم البطل التفاعلي', type: 'Hero Section', description: 'عنوان رئيسي وأزرار دعوة للعمل' },
      { name: 'الأداة التفاعلية الذكية', type: 'Interactive Tool', description: 'أداة تفاعلية بحسب فكرة المشروع' },
      { name: 'بطاقات الخدمات والمزايا', type: 'Feature Grid', description: 'استعراض ثري للخدمات مع صور' },
      { name: 'نموذج التواصل السريع', type: 'Contact Block', description: 'نموذج إرسال فوري مع إشعار Toast' },
      { name: 'التذييل الشامل', type: 'Footer', description: 'روابط سريعة وشارة منصة سَوّيها' },
    ],
  };
}
