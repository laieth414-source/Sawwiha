/**
 * Domain Guidance & Architectural Intelligence for Sawwiha Platform
 * Provides domain principles, UX patterns, and conversion drivers as INSPIRATION and RULES for the AI,
 * strictly WITHOUT enforcing rigid templates or static layouts.
 */

export interface DomainGuidance {
  domainKey: string;
  domainName: string;
  keyUXPrinciples: string[];
  recommendedInteractiveFeatures: string[];
  conversionDrivers: string[];
  copywritingTone: string;
  paletteSuggestions: {
    primary: string;
    secondary: string;
    backgroundMood: string;
  }[];
  fontSuggestions: string[];
}

export function getDomainGuidance(archetype: string, prompt: string): DomainGuidance {
  const p = prompt.toLowerCase();

  switch (archetype) {
    case 'education_school': {
      const isCoding = /برمج|كود|مطور|حاسوب|تقنية|web|code|python|javascript/i.test(p);
      const isKids = /أطفال|طفل|ابتدائي|صغار|روضة|ألعاب/i.test(p);
      const isExamPrep = /امتحان|وزاري|توجيهي|سادس|ثانوية|مراجعة|بنك أسئلة/i.test(p);

      if (isCoding) {
        return {
          domainKey: 'education_coding',
          domainName: 'أكاديمية تدريب برمجيات وتطوير ويب',
          keyUXPrinciples: [
            'هيكل تقني داكن وواضح مستوحى من بيئات التطوير الحديثة (Developer Dark / Slate)',
            'استعراض المسارات التعليمية على شكل خريطة طريق تقنية (Roadmap Timeline)',
            'معاينة حية وتفاعلية لكود أو مخرجات المشاريع العملية',
          ],
          recommendedInteractiveFeatures: [
            'نافذة تفاعلية لمعاينة كود أو تشغيل تحدٍ برمجي مصغر',
            'تبويبات لتصفح لغات ومسارات البرمجة (Frontend, Backend, AI)',
            'حاسبة وقت التعلم والراتب المتوقع في سوق العمل',
          ],
          conversionDrivers: ['نسبة توظيف الخريجين', 'مشاريع عملية في السيرة الذاتية', 'ضمان استرداد أو تدريب حتى التوظيف'],
          copywritingTone: 'عملي، مباشر، تقني ملهم ومحفز للإنتاجية',
          paletteSuggestions: [
            { primary: 'violet-600', secondary: 'emerald-400', backgroundMood: 'dark slate-950 with code accents' },
            { primary: 'cyan-500', secondary: 'blue-600', backgroundMood: 'tech dark slate-900' },
          ],
          fontSuggestions: ['IBM Plex Sans Arabic', 'Tajawal', 'Cairo'],
        };
      }

      if (isKids) {
        return {
          domainKey: 'education_kids',
          domainName: 'منصة تعليمية للأطفال والناشئة',
          keyUXPrinciples: [
            'تصميم مشرق، مرح، أزرار كبيرة، وألوان دافئة مبهجة وغير معقدة',
            'عناصر تحفيز وتلعيب (Gamification): شارات، أوسمة، وشخصيات كرتونية محبوبة',
            'بوابات واضحة لأولياء الأمور لمتابعة التقدم والدرجات',
          ],
          recommendedInteractiveFeatures: [
            'لعبة سؤال وجواب تفاعلية بأزرار كبيرة وتغذية راجعة فورية بأصوات وتأثيرات بصرية',
            'خريطة مستويات تفاعلية توضح رحلة البطل من ليفل 1 إلى الاحتراف',
            'شهادة فورية باسم الطفل عند اجتياز التحدي التجريبي',
          ],
          conversionDrivers: ['أمان المحتوى 100%', 'موافقة المناهج المعتمدة', 'تجربة مجانية ممتعة دون بطاقة بنكية'],
          copywritingTone: 'ودود، محبب، مشجع، ملهم للأطفال ومطمئن للآباء',
          paletteSuggestions: [
            { primary: 'amber-500', secondary: 'sky-500', backgroundMood: 'playful warm pastel' },
            { primary: 'emerald-500', secondary: 'orange-400', backgroundMood: 'fresh vibrant energy' },
          ],
          fontSuggestions: ['Readex Pro', 'Tajawal', 'Cairo'],
        };
      }

      // General / Exam Prep Education
      return {
        domainKey: 'education_academic',
        domainName: 'منصة تعليمية وبنك أسئلة واختبارات',
        keyUXPrinciples: [
          'تنظيم أكاديمي هادئ يركز على سهولة القراءة وتصفح المواد والفصول',
          'إبراز نسب النجاح وأسماء الأوائل وبنك الأسئلة الامتحانية',
          'بنية واضحة بين الدروس المجانية والاشتراكات الفصلية',
        ],
        recommendedInteractiveFeatures: [
          'نموذج اختبار ذكي تفاعلي مع تصحيح فوري وحساب النتيجة فوراً',
          'أكورديون للمناهج والمحاضرات مع مؤشرات الدروس المنجزة',
          'حاسبة المعدل التراكمي أو التوقعات الامتحانية',
        ],
        conversionDrivers: ['نماذج امتحانية وزارية محلولة', 'كادر تدريسي معتمد ومشهور', 'متابعة أسبوعية من المشرفين'],
        copywritingTone: 'أكاديمي، واثق، مشجع للتفوق، موثوق وواضح',
        paletteSuggestions: [
          { primary: 'indigo-600', secondary: 'amber-500', backgroundMood: 'clean academic slate-50' },
          { primary: 'blue-700', secondary: 'emerald-500', backgroundMood: 'modern education light' },
        ],
        fontSuggestions: ['Cairo', 'Tajawal', 'Almarai'],
      };
    }

    case 'restaurant_cafe': {
      const isSpecialtyCoffee = /قهوة|كافيه|مقهى|محمصة|بُن|v60|لاتيه/i.test(p);
      const isFastFood = /برغر|شاورما|بيتزا|سريع|وجبات|دليفري/i.test(p);

      if (isSpecialtyCoffee) {
        return {
          domainKey: 'restaurant_coffee',
          domainName: 'مقهى ومحمصة قهوة مختصة',
          keyUXPrinciples: [
            'جمالية بصرية دافئة هادئة بلمسات خشبية وبنية ودرجات الكريم والأرض',
            'إبراز أصول البن وسلالاته ومحاصيل إثيوبيا وكولومبيا وطرق التحضير',
            'أجواء المكان وساعات العمل وقائمة الحبوب والمشروبات',
          ],
          recommendedInteractiveFeatures: [
            'مرشد تفاعلي لاختيار القهوة المناسبة لذوقك (حمضية، كلاسيكية، فاكهية)',
            'قائمة رقمية للمشروبات والمخبوزات مع تفاصيل الإيحاءات وطريقة الاستخلاص',
            'طلب شراء أكياس البن المطحون أو حبوب كاملة أونلاين',
          ],
          conversionDrivers: ['محاصيل طازجة التحميص أسبوعياً', 'جلسات عمل مريحة مع إنترنت سريع', 'تقييمات الذواقة'],
          copywritingTone: 'هادئ، حسي، أنيق، يعبر عن شغف القهوة وأصالة الضيافة',
          paletteSuggestions: [
            { primary: 'amber-800', secondary: 'stone-600', backgroundMood: 'warm coffee cream and stone' },
            { primary: 'stone-900', secondary: 'amber-600', backgroundMood: 'minimal dark specialty vibe' },
          ],
          fontSuggestions: ['Tajawal', 'IBM Plex Sans Arabic', 'Cairo'],
        };
      }

      if (isFastFood) {
        return {
          domainKey: 'restaurant_fastfood',
          domainName: 'مطعم وجبات سريعة وعصرية',
          keyUXPrinciples: [
            'طاقة بصرية عالية وألوان فاتحة للشهية (أحمر، برتقالي، أصفر ناري)',
            'أزرار طلب سريعة وواضحة تركز على التوصيل أو الاستلام الفوري',
            'صور وجبات ضخمة شهية تبرز الصوصات والحجم والجبن السائل',
          ],
          recommendedInteractiveFeatures: [
            'منشئ وجبة كومبو تفاعلي (اختر البرغر + الصوص + البطاطا + المشروب)',
            'زر طلب واتساب فوري يجهز نص الطلب تلقائياً',
            'عداد زمني حي لسرعة التوصيل وعروض الساعات السعيدة',
          ],
          conversionDrivers: ['توصيل حار وسريع خلال 30 دقيقة', 'لحم بلدي طازج 100%', 'عروض التوفير والوجبات العائلية'],
          copywritingTone: 'حماسي، مشوق، جريء، يركز على المذاق والانتعاش الفوري',
          paletteSuggestions: [
            { primary: 'rose-600', secondary: 'amber-500', backgroundMood: 'energetic appetising dark/light' },
            { primary: 'orange-600', secondary: 'yellow-400', backgroundMood: 'vibrant casual street style' },
          ],
          fontSuggestions: ['Changa', 'Cairo', 'Tajawal'],
        };
      }

      return {
        domainKey: 'restaurant_dining',
        domainName: 'مطعم راقٍ وتراثي ومشاوي ومأكولات أصيلة',
        keyUXPrinciples: [
          'جو أصيل يعبر عن كرم الضيافة وعراقة المطبخ العربي/العراقي',
          'عرض تصنيفات القائمة بوضوح مع الأسعار ومكونات التتبيلة الخاصة',
          'محرك حجز طاولات فوري مع تفاصيل المناسبات والجلسات العائلية',
        ],
        recommendedInteractiveFeatures: [
          'نموذج حجز طاولة تفاعلي (عدد الأفراد، التاريخ، الوقت، وتفضيل الجلسة داخلية أو خارجية)',
          'تصفية تفاعلية للأطباق (مشاوي على الفحم، مقبلات حارة وباردة، حلويات شرقية)',
          'معرض صور للجلسات وتجهيز الحفلات والمناسبات الخاصة',
        ],
        conversionDrivers: ['لحوم طازجة يومياً على الفحم', 'جلسات عائلية خاصة ومريحة', 'خدمة وتراث عريق'],
        copywritingTone: 'كريم، ترحيبي، أصيل، يعزف على أوتار النكهة والضيافة',
        paletteSuggestions: [
          { primary: 'amber-700', secondary: 'emerald-700', backgroundMood: 'warm heritage rich amber' },
          { primary: 'emerald-800', secondary: 'amber-500', backgroundMood: 'luxurious traditional green and gold' },
        ],
        fontSuggestions: ['Cairo', 'Amiri', 'Tajawal'],
      };
    }

    case 'real_estate': {
      return {
        domainKey: 'real_estate_modern',
        domainName: 'منصة وساطة وتسويق وتطوير عقاري',
        keyUXPrinciples: [
          'طابع معماري هندسي راقٍ يوحي بالثقة والأمان المالي والاستثماري',
          'بطاقات عقارات ثرية بالبيانات الدقيقة (المساحة م²، الغرف، الموقع، السعر، حالة الصك)',
          'حاسبة مالية مدمجة تساعد العميل على احتساب التمويل والأقساط الشهرية',
        ],
        recommendedInteractiveFeatures: [
          'حاسبة أقساط وتمويل عقاري تفاعلية مع شريط تحكم بالمقدم ومدة السداد',
          'تصفية عقارات فورية بحسب (المدينة، النوع، نطاق السعر، عدد الغرف)',
          'نموذج حجز موعد معاينة ميدانية مع اختيار العقار واليوم المناسب',
        ],
        conversionDrivers: ['طابو وصكوك نظامية معتمدة', 'عائد استثماري مضمون', 'مستشارون عقاريون مرخصون'],
        copywritingTone: 'استثماري، موثوق، راقٍ، مباشر وشفاف',
        paletteSuggestions: [
          { primary: 'sky-700', secondary: 'amber-500', backgroundMood: 'architectural modern navy & sky' },
          { primary: 'slate-900', secondary: 'blue-500', backgroundMood: 'premium luxury real estate' },
        ],
        fontSuggestions: ['IBM Plex Sans Arabic', 'Cairo', 'Almarai'],
      };
    }

    case 'medical_clinic': {
      return {
        domainKey: 'medical_healthcare',
        domainName: 'مجمع طبي تخصصي واستشارات صحية',
        keyUXPrinciples: [
          'أجواء نظيفة ومطمئنة وباعثة على الراحة والأمان النفسي للمريض',
          'إبراز شهادات واعتمادات الكادر الطبي وسنوات الخبرة والشهادات الدولية',
          'سهولة الوصول إلى حجز موعد سريع وأرقام الطوارئ والموقع الجغرافي',
        ],
        recommendedInteractiveFeatures: [
          'نظام حجز كشف طبي فوري باختيار التخصص والطبيب والتوقيت المناسب',
          'دليل استشاري للأطباء مع التخصص الدقيق والشهادات',
          'قسم إرشادات وتحضيرات ما قبل الزيارة أو التحاليل المخبرية',
        ],
        conversionDrivers: ['أحدث التجهيزات الألمانية والأمريكية', 'تعقيم وفق أعلى المعايير العالمية', 'خدمة طوارئ واستقبال متميز'],
        copywritingTone: 'مهني، عطوف، مطمئن، دقيق علمياً وواضح',
        paletteSuggestions: [
          { primary: 'teal-700', secondary: 'cyan-500', backgroundMood: 'clean clinical reassuring teal' },
          { primary: 'blue-700', secondary: 'emerald-500', backgroundMood: 'modern medical trust' },
        ],
        fontSuggestions: ['Tajawal', 'Cairo', 'Almarai'],
      };
    }

    case 'ecommerce_store': {
      return {
        domainKey: 'ecommerce_store',
        domainName: 'متجر تجارة إلكترونية وسلة تسوق ذكية',
        keyUXPrinciples: [
          'تصميم تجاري يركز على وضوح المنتج، الأسعار، وسهولة اتخاذ قرار الشراء',
          'سلة مشتريات فورية وتفاعلية تظهر الإجمالي والشحن دون الانتقال لصفحات معقدة',
          'ضمانات واضحة للاستبدال، الدفع عند الاستلام، وسرعة التوصيل',
        ],
        recommendedInteractiveFeatures: [
          'سلة مشتريات منزلقة مع حساب فوري للمجموع وخصومات التوصيل',
          'تصفية سريعة حسب الفئة، الترتيب بالسعر، أو البحث الفوري',
          'نافذة منبثقة أو تفاصيل سريعة للمنتج (Quick View) قبل الإضافة للسلة',
        ],
        conversionDrivers: ['الدفع عند الاستلام مع المعاينة', 'شحن مجاني للطلبات الكبيرة', 'تقييمات وصور مشترين حقيقيين'],
        copywritingTone: 'جذاب، تسويقي حديث، يعزز قيمة المنتج وسهولة الطلب',
        paletteSuggestions: [
          { primary: 'slate-900', secondary: 'amber-500', backgroundMood: 'luxury minimalist commerce' },
          { primary: 'emerald-700', secondary: 'sky-500', backgroundMood: 'fresh retail modern' },
        ],
        fontSuggestions: ['Readex Pro', 'Cairo', 'Tajawal'],
      };
    }

    default: {
      return {
        domainKey: 'business_services',
        domainName: 'موقع أعمال وخدمات متخصصة',
        keyUXPrinciples: [
          'واجهة احترافية تبرز القيمة الفريدة للعمل والحلول المقدمة',
          'تسلسل منطقي يبدأ بالمشكلة ثم الحل ثم الإثبات (الدليل الاجتماعي) ثم الدعوة للعمل',
          'نماذج تواصل واضحة ومباشرة',
        ],
        recommendedInteractiveFeatures: [
          'حاسبة تكلفة أو مقدر ميزانية الخدمة بناءً على احتياجات العميل',
          'تبويبات تفاعلية لاستعراض مجالات الخدمة وحالات النجاح',
          'نموذج طلب عرض أسعار فوري مع تأكيد لحظي',
        ],
        conversionDrivers: ['خبرة معتمدة وسجل نجاحات موثق', 'سرعة الاستجابة والدعم الفني', 'عقود واضحة وضمان جودة'],
        copywritingTone: 'احترافي، استراتيجي، موثوق، يركز على تحقيق نتائج الأعمال',
        paletteSuggestions: [
          { primary: 'slate-900', secondary: 'blue-600', backgroundMood: 'executive professional dark & light' },
          { primary: 'emerald-800', secondary: 'amber-600', backgroundMood: 'solid established commercial' },
        ],
        fontSuggestions: ['IBM Plex Sans Arabic', 'Cairo', 'Tajawal'],
      };
    }
  }
}
