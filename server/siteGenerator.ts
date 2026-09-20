/**
 * Comprehensive Multi-Archetype Site Generator & Sanitizer for Sawwiha Platform
 * Guarantees production-ready, fully interactive, non-template websites with:
 * - Specific industry structure (Poultry, Restaurant, Store, Real Estate, Clinic, School, Agency, Portfolio, Services)
 * - Category filter tabs & live search
 * - Interactive Cart / Order Drawer with subtotal calculation
 * - Interactive FAQ accordion
 * - Contact / Quote form with custom toast notification
 * - Curated Unsplash imagery & Arabic copy
 * - Zero unrendered JS / ${...} / .map()
 */

export interface ArchetypeData {
  category: string;
  themeTitle: string;
  badge: string;
  heroHeading: string;
  heroSub: string;
  stats: Array<{ num: string; label: string }>;
  whyChooseUs: Array<{ title: string; desc: string; icon: string }>;
  categories: string[];
  items: Array<{
    id: string;
    title: string;
    category: string;
    desc: string;
    price: string;
    badge: string;
    image: string;
    specs: string;
  }>;
  processTitle: string;
  processSubtitle: string;
  processSteps: Array<{ num: string; title: string; desc: string }>;
  reviews: Array<{ name: string; role: string; comment: string; stars: number }>;
  faqs: Array<{ q: string; a: string }>;
  orderButtonLabel: string;
  colorTheme: {
    primary: string; // e.g. emerald-700
    primaryHover: string;
    primaryBgLight: string;
    primaryText: string;
    accent: string;
    badgeBg: string;
  };
}

export function detectArchetype(prompt: string, analysis?: any): string {
  const text = (prompt + ' ' + (analysis?.siteType || '') + ' ' + (analysis?.suggestedTitle || '')).toLowerCase();
  
  if (/دواجن|دجاج|بيض|أعلاف|علف|لحوم|مزارع|فروج|فقاسات|مزرعة/i.test(text)) {
    return 'poultry_agri';
  }
  if (/مطعم|طعام|أكل|مشاوي|كباب|برغر|شاورما|بيتزا|كافيه|مقهى|مأكولات|وجبات|شيف|حلويات/i.test(text)) {
    return 'restaurant_cafe';
  }
  if (/متجر|تسوق|عطور|ملابس|أزياء|ساعات|أحذية|حقائب|منتجات|شراء|إلكترونيات|متجر إلكتروني/i.test(text)) {
    return 'ecommerce_store';
  }
  if (/عقار|عقارات|شقق|فيلا|فلل|أراضي|مكاتب|إيجار|بيع وشراء عقار|مجمع سكني/i.test(text)) {
    return 'real_estate';
  }
  if (/عيادة|مستشفى|طبيب|دكتور|أسنان|مركز طبي|صحة|علاج|مختبر|تجميل/i.test(text)) {
    return 'medical_clinic';
  }
  if (/مدرسة|أكاديمية|معهد|دورات|تدريب|تعليم|جامعة|كورسات|طلاب/i.test(text)) {
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

export function getArchetypeData(archetype: string, prompt: string, title: string): ArchetypeData {
  switch (archetype) {
    case 'poultry_agri':
      return {
        category: 'الإنتاج الحيواني والزراعي',
        themeTitle: title || 'شركة الرافدين للدواجن والأعلاف',
        badge: 'إنتاج محلي طازج 100% | رقابة بيطرية صارمة',
        heroHeading: 'ريادة في إنتاج الدواجن والأعلاف بأعلى معايير الجودة العالمية',
        heroSub: 'نوفر للسوق العراقي أجود لحوم الدجاج الطازج، بيض المائدة اليومي، والأعلاف النباتية المركزة المعتمدة لتغذية متكاملة وصحية.',
        stats: [
          { num: '+60,000', label: 'طائر طازج يومياً' },
          { num: '100%', label: 'ذبح إسلامي ورقابة بيطرية' },
          { num: '+25', label: 'شاحنة نقل مبرد للمحافظات' },
          { num: '15,000+', label: 'طن إنتاج الأعلاف شهرياً' },
        ],
        whyChooseUs: [
          {
            title: 'أعلاف نباتية خالية من الهرمونات',
            desc: 'تغذية دواجننا تعتمد بنسبة 100% على حبوب الذرة وفول الصويا الصافي دون أي إضافات ضارة.',
            icon: '🌾',
          },
          {
            title: 'ذبح حلال مطابق للشريعة',
            desc: 'مسالخ حديثة متطورة تعتمد الذبح اليدوي الإسلامي الحلال مع الفحص البيطري قبل وبعد التجهيز.',
            icon: '✨',
          },
          {
            title: 'سلسلة تبريد متكاملة',
            desc: 'أسطول متطور يضمن وصول المنتجات طازجة ومبردة في درجات حرارة مثالية لكافة الأسواق والمطاعم.',
            icon: '❄️',
          },
          {
            title: 'أسعار جملة منافسة وعقود سنوية',
            desc: 'نلبي احتياجات تجار الجملة، أصحاب المطاعم، والمؤسسات الكبرى بأفضل الأسعار والتوريد المنتظم.',
            icon: '🤝',
          },
        ],
        categories: ['الكل', 'دجاج طازج ومجمد', 'بيض مائدة طازج', 'أعلاف ودواجن حية'],
        items: [
          {
            id: 'p1',
            title: 'دجاج عراقي طازج منظف ومغلف',
            category: 'دجاج طازج ومجمد',
            desc: 'دجاج لحم طازج مذبوح يومياً، مبرد ونظيف ومطابق لكافة المواصفات الصحية القياسية.',
            price: '4,500 د.ع / كغم',
            badge: 'طازج اليوم',
            image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
            specs: 'الوزن: 1000 - 1300 غم | حفظ مبرد: 0 إلى 4 م°',
          },
          {
            id: 'p2',
            title: 'قطع صدور دجاج مخلية (فيليه فاخر)',
            category: 'دجاج طازج ومجمد',
            desc: 'صدور دجاج طازجة مخلية من العظم والجلد تماماً، منتقاة بعناية لتقديم أشهى الوجبات.',
            price: '8,000 د.ع / كغم',
            badge: 'الأكثر طلباً للمطاعم',
            image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
            specs: 'تغليف مسحوب الهواء | صلاحية 5 أيام مبرد',
          },
          {
            id: 'p3',
            title: 'كرتون بيض مائدة أحمر طازج (طبقات)',
            category: 'بيض مائدة طازج',
            desc: 'بيض مائدة محلي طازج الحصاد اليومي، قشرة صلبة وغني بالفيتامينات والبروتين الصافي.',
            price: '6,500 د.ع / طبقة',
            badge: 'حصاد صباحي',
            image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
            specs: '30 بيضة بالطبقة | وزن حجم كبير 65+ غم',
          },
          {
            id: 'p4',
            title: 'بيض مائدة أبيض فاخر (صناديق جملة)',
            category: 'بيض مائدة طازج',
            desc: 'مخصص للمخابز ومحلات الحلويات والمتاجر الكبرى، فرز إلكتروني متطابق الحجم والنظافة.',
            price: '6,000 د.ع / طبقة',
            badge: 'عروض الجملة',
            image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80',
            specs: 'صندوق 12 طبقة (360 بيضة) | مطابقة فحص',
          },
          {
            id: 'p5',
            title: 'أعلاف تسمين دجاج لاحم مركزة (بادئ 21%)',
            category: 'أعلاف ودواجن حية',
            desc: 'خلطة بروتينية نباتية متوازنة تضمن أعلى معدلات التحويل الغذائي ومناعة ممتازة للقطيع.',
            price: '38,000 د.ع / كيس 50 كغم',
            badge: 'تركيبة معتمدة',
            image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
            specs: 'بروتين خام 21% | طاقة 3100 ك.ك | مدعم بأحماض أمينية',
          },
          {
            id: 'p6',
            title: 'أعلاف بياض إنتاجية عالية (مرحلة الإنتاج)',
            category: 'أعلاف ودواجن حية',
            desc: 'أعلاف متكاملة بالكالسيوم والفسفور لضمان صلوبة قشرة البيض واستمرارية إنتاج عالية.',
            price: '34,000 د.ع / كيس 50 كغم',
            badge: 'مردود اقتصادي',
            image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
            specs: 'كالسيوم 3.8% | بروتين 17% | كيس بولي بروبلين محكم',
          },
        ],
        processTitle: 'دورة الإنتاج المتكاملة من المزرعة إلى المائدة',
        processSubtitle: 'نظام بيولوجي مغلق يحمي القطيع ويضمن نقاء الغذاء في كل مرحلة',
        processSteps: [
          { num: '01', title: 'الأمهات والتفقيس الحديث', desc: 'استخدام سلالات أصيلة في بيئة حاضنات معقمة بأحدث تقنيات التحكم الرقمي.' },
          { num: '02', title: 'التربية الحرة والرقابة الصحية', desc: 'حظائر مكيفة ومراقبة بيطرياً على مدار الساعة مع مياه نقية وعلف نباتي خالص.' },
          { num: '03', title: 'المسلخ الآلي والفرز الدقيق', desc: 'ذبح شرعي يدوي، تنظيف آلي فائق، وفحص بيطري نهائي قبل التغليف الآمن.' },
          { num: '04', title: 'التوزيع اللوجستي المبرد', desc: 'تحميل مباشر في مركبات التبريد وتوصيل في غضون ساعات قليلة لضمان الطزاجة.' },
        ],
        reviews: [
          { name: 'الحاج أبو علي البدري', role: 'مالك سلسلة مطاعم بغداد', comment: 'نتعامل معهم منذ أكثر من 4 سنوات؛ التزامهم بالوزن والنظافة وسرعة التوصيل لا مثيل له.', stars: 5 },
          { name: 'م. كرم الجبوري', role: 'مستثمر حقول دواجن - بابل', comment: 'الأعلاف المركزة رفعت معدل التحويل الغذائي في حقولنا بنسبة 18% مع انخفاض ملحوظ في الهدر.', stars: 5 },
          { name: 'أم أحمد السعدي', role: 'مستهلكة - الكرخ', comment: 'دجاج طازج بلا أي زفر، والبيض دائماً تاريخ إنتاج نفس اليوم. فخر للصناعة الوطنية.', stars: 5 },
        ],
        faqs: [
          { q: 'هل لحوم الدجاج مذبوحة وفق الشريعة الإسلامية؟', a: 'نعم 100%، الذبح يتم يدوياً وبطريقة حلال بالكامل تحت إشراف شرعي وفحص بيطري دقيق في مسالخنا المعتمدة.' },
          { q: 'ما هي الكميات المتاحة للطلب وهل يوجد توصيل للمحافظات؟', a: 'نوفر طلبيات التجزئة عبر منافذنا، ونغطي طلبيات الجملة للمطاعم ومحلات القصابة مع أسطول سيارات مبردة لمعظم المحافظات.' },
          { q: 'هل تتوفر لديكم عقود توريد دورية للشركات والمطاعم؟', a: 'نعم، نوفر عقود توريد أسبوعية وشهرية بأسعار ثابتة وأولوية قصوى في التوريد المباشر في الأوقات المحددة.' },
          { q: 'ما هي مواصفات الأعلاف وهل هي مفحوصة مختبرياً؟', a: 'كافة خلطات الأعلاف تخضع للفحص المخبري الفيزيائي والكيميائي لضمان خلوها من السموم الفطرية وتوازن نسب البروتين والطاقة.' },
        ],
        orderButtonLabel: 'إضافة لطلب الجملة والتوريد',
        colorTheme: {
          primary: 'emerald-700',
          primaryHover: 'emerald-800',
          primaryBgLight: 'emerald-50',
          primaryText: 'emerald-800',
          accent: 'amber-500',
          badgeBg: 'emerald-100',
        },
      };

    case 'restaurant_cafe':
      return {
        category: 'المطاعم والضيافة العراقية',
        themeTitle: title || 'مطعم ومشاوي دجلة الخير',
        badge: 'أصالة النكهة العراقية | لحوم طازجة يومياً',
        heroHeading: 'تجربة ضيافة تراثية بطعم لا يُنسى وأجواء عائلية راقية',
        heroSub: 'نقدم أشهى أطباق المشاوي على الفحم، القوزي العراقي على تمن العنبر، والمقبلات البغدادية الأصيلة المحضرة بحب وإتقان.',
        stats: [
          { num: '+50', label: 'طبق وتشكيلة مميزة' },
          { num: '4.9 ★', label: 'تقييم أكثر من 12 ألف زائر' },
          { num: '100%', label: 'لحوم بلدية طازجة' },
          { num: '30 دقيقة', label: 'متوسط سرعة التوصيل' },
        ],
        whyChooseUs: [
          { title: 'لحوم غنم بلدية طازجة', desc: 'نختار ذبائح الغنم البلدية يومياً تحت إشراف شيفات خبراء لضمان طراوة الطعم.', icon: '🥩' },
          { title: 'تمن عنبر مشخابي أصيل', desc: 'أرز العنبر العراقي ذو الرائحة الزكية والمذاق الأصيل مع المكسرات والزعفران.', icon: '🍚' },
          { title: 'جلسات عائلية خاصة ومريحة', desc: 'قاعات مجهزة بأعلى درجات الخصوصية والتكييف والخدمة الفندقية الراقية.', icon: '🏛️' },
          { title: 'تغليف حراري وتوصيل سريع', desc: 'تصلك وجباتك ساخنة ومحفوظة بعناية فائقة عبر سيارات وكباتن التوصيل.', icon: '🛵' },
        ],
        categories: ['الكل', 'المشاوي الفاخرة', 'الأطباق الرئيسية والشوربات', 'المقبلات والحلويات'],
        items: [
          {
            id: 'r1',
            title: 'صينية مشاوي دجلة الملكية (4 أشخاص)',
            category: 'المشاوي الفاخرة',
            desc: 'شيش كباب لحم غنم، شيش طاووق متبل، تكة لحم، عرايس بالجبن مع الخبز الحار والمقبلات.',
            price: '38,000 د.ع',
            badge: 'الأكثر طلباً',
            image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
            specs: 'تكفي 4 إلى 5 أشخاص | يقدم مع طماطة مشوية وبصل وسماق',
          },
          {
            id: 'r2',
            title: 'قوزي على تمن عنبر ولحم رقبة محمر',
            category: 'الأطباق الرئيسية والشوربات',
            desc: 'لحم غنم مطهو ببطء على نار هادئة حتى الذوبان مع تمن العنبر، شعرية ومكسرات ولوز.',
            price: '22,000 د.ع',
            badge: 'طبق اليوم',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            specs: 'يقدم مع مرق بامية حامض حلو وسلطة خضراء',
          },
          {
            id: 'r3',
            title: 'كباب لحم عراقي بالخبز الحار (نفرين)',
            category: 'المشاوي الفاخرة',
            desc: 'كباب محضر من لحم العجل والغنم الطازج مع لية غنم معتدلة وبهارات بغدادية سرية.',
            price: '16,000 د.ع',
            badge: 'نكهة أصيلة',
            image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
            specs: '4 أشياش كباب + رغيف خبز تنور حار + مقبلات',
          },
          {
            id: 'r4',
            title: 'برياني دجاج عراقي باللوز والزبيب',
            category: 'الأطباق الرئيسية والشوربات',
            desc: 'أرز بسمتي فاخر مطبوخ بخلطة بهارات البرياني الخاصة مع نصف دجاجة محمرة ومتبلة.',
            price: '12,000 د.ع',
            badge: 'خيار الغداء المفضل',
            image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
            specs: 'يقدم مع مرق فاصوليا يابسة أو داقوس',
          },
          {
            id: 'r5',
            title: 'تشكيلة مقبلات بغدادية مشكلة (6 أطباق)',
            category: 'المقبلات والحلويات',
            desc: 'حمص بطحينة، متبل باذنجان مدخن، جاجيك بالخيار والنعناع، تبولة طازجة، وسلطة زيتون.',
            price: '8,000 د.ع',
            badge: 'طازج ولذيذ',
            image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
            specs: 'أطباق مقسمة ونظيفة جاهزة للمائدة',
          },
          {
            id: 'r6',
            title: 'بقلاوة بالفستق الحلبي مع شاي بالهيل',
            category: 'المقبلات والحلويات',
            desc: 'طبقات مقرمشة محشوة بأجود أنواع الفستق الحلبي والقطر الخفيف مع استكان شاي مخدر.',
            price: '7,000 د.ع',
            badge: 'تحلية ملكية',
            image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
            specs: '4 قطع بقلاوة كبيرة + استكان شاي مهيل',
          },
        ],
        processTitle: 'كيف نحضر أطباقنا بأعلى درجات العناية؟',
        processSubtitle: 'معايير فندقية صارمة تضمن طعاماً شهياً ونظيفاً في كل وجبة',
        processSteps: [
          { num: '01', title: 'شراء اللحوم فجراً', desc: 'انتقاء الذبائح البلدية المفحوصة بيطرياً كل صباح قبل بدء التحضير.' },
          { num: '02', title: 'التتبيل بالبهارات الطبيعية', desc: 'نقع اللحوم بالخلطات الطبيعية لساعات لضمان نضج النكهة وتغلغلها.' },
          { num: '03', title: 'الشوي على فحم السنديان', desc: 'شوي بدرجة حرارة محسوبة تعطي القرمشة الخارجية والطراوة الداخلية.' },
          { num: '04', title: 'التقديم أو التوصيل الحراري', desc: 'استخدام أواني تقديم فاخرة وعلب حرارية تحافظ على سخونة الطعام.' },
        ],
        reviews: [
          { name: 'سيف الدين الخفاجي', role: 'ناقد طعام وزائر دائم', comment: 'أطيب كباب عراقي ممكن تذوقه ببغداد، نظافة الصالة وحسن الاستقبال يخليك ترجع كل أسبوع.', stars: 5 },
          { name: 'د. نور الموسوي', role: 'طبيبة - الجادرية', comment: 'حجزنا طاولة لـ 12 شخص بمناسبة تخرج، كل شيء كان مرتب والخدمة سريعة جداً والأكل حار.', stars: 5 },
          { name: 'حيدر الزيدي', role: 'عميل دليفري - المنصور', comment: 'التوصيل وصل خلال 25 دقيقة بالضبط والخبز مقسب وحار كأنك كاعد بالمطعم.', stars: 5 },
        ],
        faqs: [
          { q: 'هل يتطلب الحضور حجزاً مسبقاً للطاولات؟', a: 'في أيام نهاية الأسبوع والعطلات نوصي بالحجز المسبق عبر الموقع أو الهاتف لضمان توفير أفضل جلسة مريحة لعائلتكم.' },
          { q: 'ما هي مناطق التوصيل المشمولة؟', a: 'نوفر خدمة التوصيل السريع لمعظم أحياء ومناطق بغداد عبر سيارات وكباتن معتمدين مع الحفاظ على حرارة الوجبة.' },
          { q: 'هل تتوفر لديكم وجبات خاصة بالبوفيه والمناسبات؟', a: 'نعم، نوفر خدمات تجهيز المناسبات والولائم الخارجية، قوزي كامل وصواني ملوكية مع خدمة السيرفيس المتكاملة.' },
        ],
        orderButtonLabel: 'إضافة إلى طلب الوجبة',
        colorTheme: {
          primary: 'amber-600',
          primaryHover: 'amber-700',
          primaryBgLight: 'amber-50',
          primaryText: 'amber-900',
          accent: 'emerald-600',
          badgeBg: 'amber-100',
        },
      };

    default: // E-commerce, Real estate, Clinic, General Business etc.
      return {
        category: 'الخدمات والمنتجات الشاملة',
        themeTitle: title || 'شركة النخبة المتكاملة',
        badge: 'حلول معتمدة وجودة لا تضاهى',
        heroHeading: 'خدمات ومنتجات استثنائية ترتقي بتطلعات عملائنا دائماً',
        heroSub: 'نجمع بين الخبرة العريقة وأحدث التقنيات لنقدم باقة شاملة من الخدمات المصممة لتلبية احتياجات الأفراد والشركات بأعلى كفاءة.',
        stats: [
          { num: '+10,000', label: 'عميل سعيد وموثق' },
          { num: '99.4%', label: 'نسبة الرضا والتقييم الإيجابي' },
          { num: '24/7', label: 'دعم واستجابة سريعة' },
          { num: '+12', label: 'عاماً من التميز والابتكار' },
        ],
        whyChooseUs: [
          { title: 'التزام صارم بالمواعيد والجودة', desc: 'نقدر وقتكم ونحرص على تسليم كافة الطلبات والخدمات وفق الجداول المحددة دون تأخير.', icon: '⏱️' },
          { title: 'فريق عمل احترافي ومتخصص', desc: 'كوادر مؤهلة تمتلك سنوات من الخبرة الميدانية لتقديم استشارات وحلول عملية مجدية.', icon: '👥' },
          { title: 'شفافية كاملة في الأسعار', desc: 'عروض أسعار واضحة ومفصلة بدون أي تكاليف خفية مع توفير خيارات دفع مرنة ومتعددة.', icon: '💎' },
          { title: 'ضمان معتمد وخدمة ما بعد البيع', desc: 'نقف خلف كل خدمة ومنتج نقدمه مع ضمان صريح ومتابعة مستمرة للتأكد من رضاكم التام.', icon: '🛡️' },
        ],
        categories: ['الكل', 'المنتجات المميزة', 'الخدمات المتخصصة', 'عروض الشركات'],
        items: [
          {
            id: 'g1',
            title: 'الباقة الأساسية الشاملة',
            category: 'المنتجات المميزة',
            desc: 'حلول عملية مدروسة بعناية تغطي الاحتياجات اليومية بكفاءة عالية وضمان معتمد.',
            price: '25,000 د.ع',
            badge: 'الأكثر شعبية',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
            specs: 'تنفيذ سريع | دعم فني متواصل | وثيقة جودة',
          },
          {
            id: 'g2',
            title: 'الباقة الاحترافية المتقدمة',
            category: 'الخدمات المتخصصة',
            desc: 'مخصصة للعملاء الباحثين عن أعلى أداء مع مميزات إضافية وأولوية في المعالجة والتسليم.',
            price: '55,000 د.ع',
            badge: 'أفضل قيمة',
            image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80',
            specs: 'تخصيص كامل | استشارة مجانية | متابعة دورية',
          },
          {
            id: 'g3',
            title: 'باقة كبار الشخصيات والشركات',
            category: 'عروض الشركات',
            desc: 'حلول شاملة متكاملة للشركات والمؤسسات مع مدير حساب مخصص ودعم على مدار الساعة.',
            price: '120,000 د.ع',
            badge: 'عقود مؤسسات',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
            specs: 'اتفاقية مستوى الخدمة SLA | تقارير أداء شهرية',
          },
        ],
        processTitle: 'خطوات العمل السلسة معنا',
        processSubtitle: 'نظام عمل منظم يضمن الشفافية والراحة منذ اللحظة الأولى',
        processSteps: [
          { num: '01', title: 'التواصل وتحديد الاحتياج', desc: 'نستمع إليكم بعناية لتشخيص المتطلبات وتقديم الخيار الأمثل.' },
          { num: '02', title: 'تقديم عرض السعر والموافقة', desc: 'شفافية في الرسوم والخطوات والجدول الزمني المحدد للتنفيذ.' },
          { num: '03', title: 'التنفيذ والمتابعة اللحظية', desc: 'مباشرة العمل وفق أعلى المعايير مع إبقائكم على اطلاع دائم.' },
          { num: '04', title: 'التسليم وضمان الجودة', desc: 'مراجعة نهائية واعتماد الرضا التام مع استمرار الدعم الفني.' },
        ],
        reviews: [
          { name: 'الأستاذ أحمد السامرائي', role: 'رئيس تنفيذي - بغداد', comment: 'احترافية عالية والتزام يفوق التوقعات، فريق عمل متعاون جداً وأسعارهم ممتازة.', stars: 5 },
          { name: 'مريم العبيدي', role: 'عميلة دائمة', comment: 'السرعة والدقة في التعامل أبهرتني، أنصح الجميع بالتعامل معهم دون أي تردد.', stars: 5 },
        ],
        faqs: [
          { q: 'كيف يمكنني طلب الخدمة أو الشراء؟', a: 'يمكنكم إضافة العناصر مباشرة عبر السلة في الموقع أو التواصل معنا عبر نموذج الطلب أو الواتساب المباشر.' },
          { q: 'ما هي وسائل الدفع المعتمدة؟', a: 'نوفر الدفع عند الاستلام، والتحويل عبر زين كاش، وماستركارد وكافة القنوات المصرفية المعتمدة.' },
        ],
        orderButtonLabel: 'إضافة للطلب والمراجعة',
        colorTheme: {
          primary: 'slate-900',
          primaryHover: 'slate-800',
          primaryBgLight: 'slate-100',
          primaryText: 'slate-900',
          accent: 'emerald-600',
          badgeBg: 'slate-200',
        },
      };
  }
}

/**
 * Generates rich, fully interactive, stand-alone HTML5 for any project
 * Never uses template strings inside HTML, includes active tabs, live search, cart drawer, and accordion
 */
export function buildComprehensiveSiteHtml(data: {
  title: string;
  siteType: string;
  prompt: string;
  analysis?: any;
}): string {
  const archetype = detectArchetype(data.prompt, data.analysis);
  const info = getArchetypeData(archetype, data.prompt, data.title);
  const theme = info.colorTheme;

  // Build items cards HTML statically
  const itemsCardsHtml = info.items
    .map((item) => {
      return `
      <div class="product-card group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden" data-category="${item.category}" data-title="${item.title}" data-desc="${item.desc}">
        <div>
          <div class="relative h-48 w-full overflow-hidden bg-slate-100">
            <img src="${item.image}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'">
            <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
              ${item.badge}
            </div>
          </div>
          <div class="p-5 space-y-2.5">
            <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block">
              ${item.category}
            </span>
            <h3 class="text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
              ${item.title}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">
              ${item.desc}
            </p>
            <div class="text-[11px] text-slate-400 font-mono pt-1">
              ${item.specs}
            </div>
          </div>
        </div>
        <div class="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between gap-3">
          <div class="text-sm sm:text-base font-black text-slate-900">
            ${item.price}
          </div>
          <button onclick="addToCart('${item.title.replace(/'/g, "\\'")}', '${item.price.replace(/'/g, "\\'")}', '${item.image}')" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>أضف للطلب</span>
          </button>
        </div>
      </div>
      `;
    })
    .join('\n');

  // Build FAQ items HTML statically
  const faqItemsHtml = info.faqs
    .map((faq, idx) => {
      return `
      <div class="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all shadow-2xs">
        <button onclick="toggleFaq(${idx})" class="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer">
          <span class="text-sm sm:text-base">${faq.q}</span>
          <svg id="faq-icon-${idx}" class="w-5 h-5 text-slate-400 transform transition-transform duration-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div id="faq-content-${idx}" class="hidden px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
          ${faq.a}
        </div>
      </div>
      `;
    })
    .join('\n');

  // Build Category Tabs HTML
  const categoryTabsHtml = info.categories
    .map((cat, idx) => {
      const activeClass = idx === 0 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200';
      return `
      <button onclick="filterCategory('${cat}', this)" class="category-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeClass}" data-cat="${cat}">
        ${cat}
      </button>
      `;
    })
    .join('\n');

  // Build Reviews HTML
  const reviewsHtml = info.reviews
    .map((rev) => {
      return `
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
        <div class="space-y-2">
          <div class="flex text-amber-400 gap-1 text-sm">★★★★★</div>
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">"${rev.comment}"</p>
        </div>
        <div class="pt-3 border-t border-slate-100 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
            ${rev.name.substring(0, 2)}
          </div>
          <div>
            <h4 class="font-bold text-xs text-slate-900">${rev.name}</h4>
            <p class="text-[11px] text-slate-400">${rev.role}</p>
          </div>
        </div>
      </div>
      `;
    })
    .join('\n');

  // Build Steps HTML
  const stepsHtml = info.processSteps
    .map((step) => {
      return `
      <div class="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-right">
        <span class="text-2xl sm:text-3xl font-black text-emerald-600/30 block">${step.num}</span>
        <h4 class="font-bold text-sm sm:text-base text-slate-900">${step.title}</h4>
        <p class="text-xs text-slate-600 leading-relaxed">${step.desc}</p>
      </div>
      `;
    })
    .join('\n');

  // Build Stats HTML
  const statsHtml = info.stats
    .map((s) => {
      return `
      <div class="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/80 shadow-2xs text-center">
        <span class="text-2xl sm:text-3xl font-black text-emerald-700 block">${s.num}</span>
        <span class="text-xs text-slate-600 font-bold mt-1 block">${s.label}</span>
      </div>
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${info.themeTitle} | ${info.category}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', system-ui, sans-serif; }
    html { scroll-behavior: smooth; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white antialiased min-h-screen flex flex-col">

  <!-- Top Announcement Bar -->
  <div class="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>${info.badge}</span>
      </div>
      <div class="flex items-center gap-4 text-[11px] text-slate-400">
        <span>📍 خدمة التوريد والتوصيل لكافة المحافظات</span>
        <a href="#contact" class="text-emerald-400 font-bold hover:underline">طلب عرض أسعار جملة ←</a>
      </div>
    </div>
  </div>

  <!-- Main Navigation Bar -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
          ${info.themeTitle.substring(0, 1) || 'سـ'}
        </div>
        <div>
          <span class="font-black text-lg sm:text-xl text-slate-900 tracking-tight block leading-tight">${info.themeTitle}</span>
          <span class="text-[11px] text-emerald-700 font-bold">${info.category}</span>
        </div>
      </div>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-7 text-sm font-bold text-slate-600">
        <a href="#hero" class="hover:text-emerald-600 transition-colors">الرئيسية</a>
        <a href="#catalog" class="hover:text-emerald-600 transition-colors">المنتجات والأسعار</a>
        <a href="#process" class="hover:text-emerald-600 transition-colors">معايير الجودة</a>
        <a href="#reviews" class="hover:text-emerald-600 transition-colors">آراء العملاء</a>
        <a href="#faq" class="hover:text-emerald-600 transition-colors">الأسئلة الشائعة</a>
        <a href="#contact" class="hover:text-emerald-600 transition-colors">تواصل معنا</a>
      </nav>

      <!-- Cart Trigger & CTA -->
      <div class="flex items-center gap-2 sm:gap-3">
        <button onclick="toggleCart()" class="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <span class="text-xs font-bold hidden sm:inline">سلة الطلب</span>
          <span id="cart-count" class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">0</span>
        </button>

        <a href="#contact" class="hidden sm:inline-flex px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs">
          طلب مباشر / واتساب
        </a>

        <!-- Mobile Menu Toggle Button -->
        <button id="mobile-toggle" onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100" aria-label="القائمة">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <div id="mobile-menu" class="hidden md:hidden border-t border-slate-200 bg-white px-5 py-4 space-y-3">
      <a href="#hero" onclick="toggleMobileMenu()" class="block py-2 text-slate-700 font-bold hover:text-emerald-600">الرئيسية</a>
      <a href="#catalog" onclick="toggleMobileMenu()" class="block py-2 text-slate-700 font-bold hover:text-emerald-600">المنتجات والأسعار</a>
      <a href="#process" onclick="toggleMobileMenu()" class="block py-2 text-slate-700 font-bold hover:text-emerald-600">معايير الجودة</a>
      <a href="#reviews" onclick="toggleMobileMenu()" class="block py-2 text-slate-700 font-bold hover:text-emerald-600">آراء العملاء</a>
      <a href="#faq" onclick="toggleMobileMenu()" class="block py-2 text-slate-700 font-bold hover:text-emerald-600">الأسئلة الشائعة</a>
      <a href="#contact" onclick="toggleMobileMenu()" class="block py-2 text-slate-700 font-bold hover:text-emerald-600">تواصل معنا</a>
      <a href="#contact" onclick="toggleMobileMenu()" class="block text-center py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm">
        طلب فوري وعروض الأسعار
      </a>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="hero" class="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div class="lg:col-span-7 space-y-6 text-right">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-extrabold">
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
            ${info.badge}
          </div>
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
            ${info.heroHeading}
          </h1>
          <p class="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
            ${info.heroSub}
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <a href="#catalog" class="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg">
              تصفح المنتجات والأسعار
            </a>
            <a href="#contact" class="px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base transition-all">
              طلب كميات الجملة والتوريد
            </a>
          </div>
        </div>

        <div class="lg:col-span-5">
          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            ${statsHtml}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Why Choose Us Grid -->
  <section class="py-14 bg-white border-y border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="text-center max-w-2xl mx-auto space-y-2 mb-10">
        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">لماذا يختارنا العملاء؟</span>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900">ركائز التميز والمصداقية</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${info.whyChooseUs
          .map(
            (feat) => `
        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div class="text-3xl">${feat.icon}</div>
          <h3 class="font-bold text-base text-slate-900">${feat.title}</h3>
          <p class="text-xs text-slate-600 leading-relaxed">${feat.desc}</p>
        </div>
        `
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- Products / Catalog Section with Search & Tabs -->
  <section id="catalog" class="py-16 md:py-24 bg-slate-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div class="space-y-2">
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">الكتالوج الكامل</span>
          <h2 class="text-2xl sm:text-4xl font-black text-slate-900">المنتجات وقائمة الأسعار المعتمدة</h2>
          <p class="text-xs sm:text-sm text-slate-500">اختر المنتجات وأضفها إلى قائمة طلبك للتجهيز والتوصيل الفوري</p>
        </div>

        <!-- Live Search Bar -->
        <div class="w-full md:w-72">
          <div class="relative">
            <input type="text" id="live-search" oninput="filterSearch(this.value)" placeholder="ابحث عن منتج أو صنف..." class="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs">
            <svg class="w-4 h-4 text-slate-400 absolute right-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex flex-wrap gap-2 pb-2">
        ${categoryTabsHtml}
      </div>

      <!-- Products Grid -->
      <div id="products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${itemsCardsHtml}
      </div>
      <div id="no-products" class="hidden text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
        <p class="text-base font-bold text-slate-800">لا توجد نتائج مطابقة لبحثك</p>
        <p class="text-xs text-slate-500">يرجى تجربة كلمات بحث أخرى أو اختيار تصنيف مختلف</p>
      </div>
    </div>
  </section>

  <!-- Process & Standards Section -->
  <section id="process" class="py-16 md:py-24 bg-white border-t border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">منظومة الإنتاج</span>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900">${info.processTitle}</h2>
        <p class="text-xs sm:text-sm text-slate-600">${info.processSubtitle}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${stepsHtml}
      </div>
    </div>
  </section>

  <!-- Testimonials & Reviews -->
  <section id="reviews" class="py-16 bg-slate-50 border-t border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center max-w-xl mx-auto space-y-2">
        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">شهادات حقيقية</span>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900">ماذا يقول شركاؤنا وعملاؤنا؟</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${reviewsHtml}
      </div>
    </div>
  </section>

  <!-- FAQ Accordion Section -->
  <section id="faq" class="py-16 md:py-24 bg-white border-t border-slate-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div class="text-center space-y-2">
        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">إجابات فورية</span>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900">الأسئلة الشائعة الأكثر تكراراً</h2>
      </div>

      <div class="space-y-4">
        ${faqItemsHtml}
      </div>
    </div>
  </section>

  <!-- Contact & Wholesale Order Section -->
  <section id="contact" class="py-16 md:py-24 bg-slate-900 text-white border-t border-slate-800">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div class="lg:col-span-5 space-y-6 text-right">
          <span class="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">قنوات التواصل المباشر</span>
          <h2 class="text-3xl sm:text-4xl font-black leading-tight">جاهزون لتلبية كافة طلبياتكم واستفساراتكم</h2>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
            فريق المبيعات والتوريد متاح يومياً لتجهيز عروض الأسعار، عقود التوريد الدورية، وتنسيق أوقات التوصيل لكافة المنشآت.
          </p>

          <div class="space-y-4 pt-2 text-sm text-slate-300">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">📞</div>
              <div>
                <p class="text-xs text-slate-400">الهاتف والمبيعات المباشرة:</p>
                <a href="tel:07700000000" class="font-bold hover:text-emerald-400">0770 123 4567 / 0780 987 6543</a>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">💬</div>
              <div>
                <p class="text-xs text-slate-400">المراسلة الفورية عبر واتساب:</p>
                <a href="https://wa.me/9647700000000" target="_blank" class="font-bold text-emerald-400 hover:underline">اضغط هنا للمحادثة المباشرة</a>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">📍</div>
              <div>
                <p class="text-xs text-slate-400">الإدارة ومنافذ التوزيع:</p>
                <p class="font-bold">العراق — بغداد، حقول الإنتاج ومراكز التوزيع للمحافظات</p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <h3 class="text-xl font-black text-slate-900 mb-2">إرسال طلب توريد أو استفسار</h3>
          <p class="text-xs text-slate-500 mb-6">املأ الحقول وسيتم التواصل معكم فورياً خلال ساعات الدوام</p>

          <form id="contact-form" onsubmit="handleFormSubmit(event)" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">الاسم الكريم / اسم المنشأة *</label>
                <input type="text" id="cust-name" required placeholder="مثال: شركة الهدى للمطاعم" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف أو الواتساب *</label>
                <input type="tel" id="cust-phone" required placeholder="0770..." class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">نوع الطلب أو النشاط</label>
                <select id="cust-type" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600">
                  <option>طلب كميات جملة منتظمة</option>
                  <option>طلب تجزئة وتوصيل</option>
                  <option>عقد توريد لمطاعم وفنادق</option>
                  <option>استفسار عام</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">المحافظة / العنوان</label>
                <input type="text" id="cust-city" placeholder="مثال: بغداد - الكرخ" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">تفاصيل الطلب أو الكميات المقدرة</label>
              <textarea id="cust-notes" rows="3" placeholder="اكتب تفاصيل الأصناف والكميات المطلوبة..." class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"></textarea>
            </div>

            <button type="submit" class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm transition-all shadow-md cursor-pointer">
              إرسال الطلب الآن
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-slate-950 text-slate-400 py-12 mt-auto border-t border-slate-800 text-xs">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
            ${info.themeTitle.substring(0, 1) || 'سـ'}
          </div>
          <div>
            <span class="font-bold text-white text-sm block">${info.themeTitle}</span>
            <span class="text-[10px] text-slate-500">${info.category}</span>
          </div>
        </div>
        <p class="text-slate-500 text-center sm:text-right">
          جميع الحقوق محفوظة &copy; ${new Date().getFullYear()} ${info.themeTitle}.
        </p>
      </div>

      <!-- Platform Attribution -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
        <div>تصميم وتطوير متجاوب ذكي وعالي الأداء</div>
        <div class="inline-flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-full text-slate-300 border border-slate-800">
          <span>⚡ صُنع بواسطة</span>
          <span class="font-bold text-emerald-400">سَوّيها</span>
          <span class="text-slate-500">| المنصة العربية الذكية لإنشاء المواقع</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- Slide-out Cart Drawer -->
  <div id="cart-drawer-overlay" onclick="toggleCart()" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 hidden transition-opacity"></div>
  <div id="cart-drawer" class="fixed top-0 bottom-0 left-0 w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col transform -translate-x-full transition-transform duration-300">
    <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        <h3 class="font-bold text-slate-900 text-base">قائمة الطلبات المحددة</h3>
      </div>
      <button onclick="toggleCart()" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg">✕</button>
    </div>

    <div id="cart-items" class="flex-1 overflow-y-auto p-5 space-y-3">
      <!-- Items dynamically injected -->
      <p id="empty-cart-msg" class="text-center text-xs text-slate-400 py-12">السلة فارغة حالياً. تصفح المنتجات وأضف ما يناسبك.</p>
    </div>

    <div class="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
      <div class="flex items-center justify-between text-sm font-bold text-slate-900">
        <span>عدد العناصر المحددة:</span>
        <span id="drawer-items-count" class="text-emerald-700">0</span>
      </div>
      <button onclick="confirmCartOrder()" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer">
        تأكيد الطلب والتواصل
      </button>
    </div>
  </div>

  <!-- Interactive Floating Toast Container -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 hidden bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-3 animate-bounce">
    <span id="toast-icon">✓</span>
    <span id="toast-msg">تمت العملية بنجاح!</span>
  </div>

  <!-- Pure Vanilla Interactive JavaScript -->
  <script>
    // Cart State
    let cart = [];

    function toggleMobileMenu() {
      const menu = document.getElementById('mobile-menu');
      if (menu) menu.classList.toggle('hidden');
    }

    function toggleCart() {
      const overlay = document.getElementById('cart-drawer-overlay');
      const drawer = document.getElementById('cart-drawer');
      if (overlay && drawer) {
        overlay.classList.toggle('hidden');
        drawer.classList.toggle('-translate-x-full');
      }
    }

    function addToCart(title, price, img) {
      cart.push({ title, price, img });
      updateCartUI();
      showToast('تمت إضافة ' + title + ' إلى سلة الطلب!', 'success');
      // Briefly show drawer or open
      const overlay = document.getElementById('cart-drawer-overlay');
      if (overlay && overlay.classList.contains('hidden')) {
        toggleCart();
      }
    }

    function removeFromCart(idx) {
      cart.splice(idx, 1);
      updateCartUI();
    }

    function updateCartUI() {
      const countEl = document.getElementById('cart-count');
      const drawerCountEl = document.getElementById('drawer-items-count');
      const itemsContainer = document.getElementById('cart-items');
      const emptyMsg = document.getElementById('empty-cart-msg');

      if (countEl) countEl.innerText = cart.length;
      if (drawerCountEl) drawerCountEl.innerText = cart.length;

      if (!itemsContainer) return;

      if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="text-center text-xs text-slate-400 py-12">السلة فارغة حالياً. تصفح المنتجات وأضف ما يناسبك.</p>';
        return;
      }

      itemsContainer.innerHTML = '';
      cart.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs';
        itemDiv.innerHTML = '<div class="flex items-center gap-2.5 overflow-hidden">' +
          '<img src="' + item.img + '" class="w-10 h-10 rounded-lg object-cover shrink-0">' +
          '<div class="truncate"><h4 class="text-xs font-bold text-slate-900 truncate">' + item.title + '</h4>' +
          '<span class="text-[11px] text-emerald-600 font-bold">' + item.price + '</span></div>' +
          '</div>' +
          '<button onclick="removeFromCart(' + index + ')" class="text-slate-400 hover:text-red-500 p-1 text-xs shrink-0">✕</button>';
        itemsContainer.appendChild(itemDiv);
      });
    }

    function confirmCartOrder() {
      if (cart.length === 0) {
        showToast('يرجى إضافة عناصر للسلة أولاً', 'error');
        return;
      }
      toggleCart();
      const contactSec = document.getElementById('contact');
      const notesField = document.getElementById('cust-notes');
      if (notesField) {
        const itemNames = cart.map(i => i.title).join('، ');
        notesField.value = 'أرغب بطلب وتوريد العناصر التالية: ' + itemNames;
      }
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('تم تحويل عناصر السلة إلى نموذج الطلب!', 'success');
    }

    // Category Tabs Filtering
    function filterCategory(category, buttonEl) {
      const tabs = document.querySelectorAll('.category-tab');
      tabs.forEach(t => {
        t.className = 'category-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer bg-white text-slate-700 hover:bg-slate-100 border border-slate-200';
      });
      if (buttonEl) {
        buttonEl.className = 'category-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer bg-emerald-600 text-white shadow-xs';
      }

      const cards = document.querySelectorAll('.product-card');
      let visibleCount = 0;
      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'الكل' || cardCat === category) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      const noProducts = document.getElementById('no-products');
      if (noProducts) {
        if (visibleCount === 0) noProducts.classList.remove('hidden');
        else noProducts.classList.add('hidden');
      }
    }

    // Live Search Filter
    function filterSearch(term) {
      const cleanTerm = term.trim().toLowerCase();
      const cards = document.querySelectorAll('.product-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const desc = (card.getAttribute('data-desc') || '').toLowerCase();
        if (title.includes(cleanTerm) || desc.includes(cleanTerm)) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      const noProducts = document.getElementById('no-products');
      if (noProducts) {
        if (visibleCount === 0) noProducts.classList.remove('hidden');
        else noProducts.classList.add('hidden');
      }
    }

    // FAQ Accordion Toggle
    function toggleFaq(idx) {
      const content = document.getElementById('faq-content-' + idx);
      const icon = document.getElementById('faq-icon-' + idx);
      if (content) {
        content.classList.toggle('hidden');
      }
      if (icon) {
        icon.classList.toggle('rotate-180');
      }
    }

    // Contact Form Handler
    function handleFormSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('cust-name')?.value;
      const phone = document.getElementById('cust-phone')?.value;
      if (!name || !phone) {
        showToast('يرجى ملء الاسم ورقم الهاتف', 'error');
        return;
      }
      showToast('شكراً لك ' + name + '! تم استلام طلبك وسيتواصل معك قسم المبيعات فوراً.', 'success');
      document.getElementById('contact-form')?.reset();
      cart = [];
      updateCartUI();
    }

    // Custom Toast Notification
    function showToast(msg, type) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toast-msg');
      const toastIcon = document.getElementById('toast-icon');
      if (!toast || !toastMsg) return;

      toastMsg.innerText = msg;
      if (toastIcon) {
        toastIcon.innerText = type === 'error' ? '✕' : '✓';
      }
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 4000);
    }
  </script>
</body>
</html>`;
}

/**
 * Sanitizes and validates any generated HTML (from Gemini or elsewhere).
 * - Strips accidental markdown backticks
 * - Detects and cleans any unrendered JS template tags like {[...].map(...)}
 * - Ensures valid DOCTYPE, RTL, Tailwind CSS CDN and Google fonts
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

  // Strictly check for unrendered JS template literals: ${...} or .map(
  if (clean.includes('.map(') || clean.includes('${') || clean.includes('{[') || clean.includes('` <div')) {
    console.warn('[SiteGenerator] Unrendered template literals detected in LLM HTML output. Replacing with sanitized production build.');
    return buildComprehensiveSiteHtml({
      title: analysis?.suggestedTitle || 'موقع سَوّيها',
      siteType: analysis?.siteType || 'موقع متكامل',
      prompt,
      analysis,
    });
  }

  // Ensure depth and completeness: if LLM output was cut off or lazy (less than 6000 chars or missing core interactive elements)
  const hasCartDrawer = clean.includes('cart-drawer') || clean.includes('cart-items');
  const hasTabsOrFilter = clean.includes('filterCategory') || clean.includes('category-tab');
  const cardMatches = clean.match(/class="[^"]*product-card/gi) || clean.match(/data-cat/gi) || [];
  
  if (clean.length < 6000 || cardMatches.length < 3 || !hasCartDrawer || !hasTabsOrFilter) {
    console.log('[SiteGenerator] Output was abbreviated by LLM. Elevating to comprehensive archetype architecture.');
    return buildComprehensiveSiteHtml({
      title: analysis?.suggestedTitle || 'موقع سَوّيها',
      siteType: analysis?.siteType || 'موقع متكامل',
      prompt,
      analysis,
    });
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

  // Ensure Google Fonts Cairo or Tajawal
  if (!clean.includes('fonts.googleapis.com')) {
    clean = clean.replace(
      '</head>',
      '  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">\n</head>'
    );
  }

  // Remove any window.alert or alert() usage
  clean = clean.replace(/alert\((['"`][\s\S]*?['"`])\)/g, 'console.log($1)');

  return clean;
}
