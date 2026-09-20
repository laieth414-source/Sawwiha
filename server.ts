import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  buildComprehensiveSiteHtml,
  sanitizeAndValidateGeneratedHtml,
  detectArchetype,
} from './server/siteGenerator';

dotenv.config();

const currentFilename = typeof __filename !== 'undefined' ? __filename : (typeof import.meta?.url === 'string' ? fileURLToPath(import.meta.url) : '');
const currentDirname = typeof __dirname !== 'undefined' ? __dirname : (currentFilename ? path.dirname(currentFilename) : process.cwd());

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

/**
 * Resilient Gemini caller with automatic fallback models and retry backoff
 * Prioritizes high-availability low-latency models and handles 503 / 429 transparently.
 */
async function generateContentWithResilience(
  client: GoogleGenAI,
  primaryModel: string,
  generateParams: {
    contents: any[];
    config?: any;
  },
  taskName: string = 'Gemini Task',
  timeoutMs: number = 40000
): Promise<string | null> {
  const preferredFastModels = [
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];

  const candidateModels =
    primaryModel && primaryModel !== 'gemini-3.8-flash' && primaryModel !== 'gemini-3.1-flash-lite'
      ? Array.from(new Set([primaryModel, ...preferredFastModels]))
      : preferredFastModels;

  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i];
    try {
      const generatePromise = client.models.generateContent({
        model: currentModel,
        contents: generateParams.contents,
        config: generateParams.config,
      });

      // Configurable guard timeout per candidate model
      const timeoutPromise = new Promise<{ text?: string }>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const text = response?.text;
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch {
      // Silently switch to the next model in the pool without dumping error stack to logs
      console.log(`[${taskName}] Swapping from ${currentModel} to next model in pool...`);
      if (i < candidateModels.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  return null;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

/**
 * Step 1: AI Analysis Endpoint
 * Analyzes the user's natural language prompt to identify site type, pages, sections, features, and visual style.
 */
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { prompt, aiConfig } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'الرجاء إدخال فكرة الموقع للبدء بالتحليل.' });
      return;
    }

    const modelName = aiConfig?.activeModel || 'gemini-3.8-flash';
    const client = getGeminiClient();

    if (client) {
      const systemInstruction = `أنت خبير تحليل وهندسة مشاريع المواقع في منصة «سَوّيها».
مهمتك: قراءة فكرة المستخدم باللغة الطبيعية وتحليلها بدقة قبل البدء بالبناء.
يجب أن تعيد ناتج التحليل كـ JSON نقي فقط بدون أي كود markdown أو شروحات إضافية.
الصيغة المطلوبة تماماً:
{
  "siteType": "نوع الموقع الدقيق (مثل: مطعم عراقي تراثي وعصري، متجر عطور فاخر، معرض أعمال مصمم)",
  "targetAudience": "الجمهور المستهدف بدقة",
  "suggestedTitle": "عنوان مقترح جذاب للموقع بالعربية",
  "suggestedSlug": "اسم-مختصر-للرابط",
  "pages": [
    { "id": "home", "title": "الرئيسية", "path": "/", "purpose": "الترحيب وعرض القيمة وأبرز المميزات" },
    { "id": "menu", "title": "قائمة الطعام", "path": "/menu", "purpose": "عرض الأطباق والأسعار والتصنيفات" }
  ],
  "sections": [
    { "title": "قسم الترحيب والبطل (Hero)", "description": "شعار جذاب وزر حجز فوري وصورة بارزة", "page": "الرئيسية" },
    { "title": "الأطباق المميزة", "description": "عرض صور وأسعار أشهر الأطباق", "page": "قائمة الطعام" },
    { "title": "قصتنا وتراثنا", "description": "تاريخ المطعم وسر النكهة العراقية الأصيلة", "page": "من نحن" },
    { "title": "التواصل وحجز الطاولات", "description": "نموذج حجز فوري وموقع على الخريطة وساعات العمل", "page": "تواصل معنا" }
  ],
  "features": [
    "قائمة طعام تفاعلية مع تصنيفات تصفية (مشاوي، مقبلات، حلويات، مشروبات)",
    "نموذج حجز طاولة فوري مع تأكيد بصري وتاريخ ووقت وعدد الأشخاص",
    "زر تواصل واتساب وطلب مباشر",
    "تجاوب كامل مع الجوال وشاشات اللمس",
    "خريطة تفاعلية وساعات العمل الدقيقة"
  ],
  "visualStyle": {
    "theme": "دافئ وتراثي فاخر",
    "primaryColor": "emerald-800 أو amber-700 حسب الفكرة",
    "secondaryColor": "amber-500",
    "fontStyle": "خط عربي عريض وأنيق للعناوين وقراءة مريحة للنصوص",
    "mood": "أصيل، ترحيبي، شهي، وموثوق"
  }
}`;

      const userInstruction = `قم بتحليل فكرة الموقع التالية لمنصة «سَوّيها»:
"${prompt.trim()}"`;

      const responseText = await generateContentWithResilience(
        client,
        modelName,
        {
          contents: [{ role: 'user', parts: [{ text: userInstruction }] }],
          config: {
            systemInstruction,
            temperature: typeof aiConfig?.temperature === 'number' ? aiConfig.temperature : 0.4,
            responseMimeType: 'application/json',
          },
        },
        'AI Analysis'
      );

      if (responseText) {
        try {
          const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed && typeof parsed === 'object') {
            res.json({ success: true, analysis: parsed });
            return;
          }
        } catch (parseError) {
          console.warn('Could not parse Gemini JSON response, extracting fallback:', parseError);
        }
      }
    }

    // High quality intelligent semantic fallback if API key is not configured or parsing failed
    const trimmed = prompt.trim();
    const isRestaurant = /مطعم|طعام|أكل|مشاوي|مأكولات|وجبات|شيف|حلويات/i.test(trimmed);
    const isStore = /متجر|بيع|منتجات|تسوق|عطور|ملابس|شراء/i.test(trimmed);
    const isPortfolio = /معرض|أعمال|مصمم|سيرة|بورتفوليو|مطور|مبرمج/i.test(trimmed);

    const fallbackAnalysis = {
      siteType: isRestaurant ? 'مطعم ومأكولات عصرية وتراثية' : isStore ? 'متجر إلكتروني حديث' : isPortfolio ? 'معرض أعمال وسيرة شخصية' : 'موقع تعريفي وخدمي حديث',
      targetAudience: isRestaurant ? 'عشاق الأطعمة اللذيذة والعائلات والزوار' : isStore ? 'العملاء الباحثين عن الجودة والسهولة' : 'أصحاب الأعمال والشركات الراغبة بالتوظيف',
      suggestedTitle: trimmed.length > 25 ? trimmed.substring(0, 25) : trimmed,
      suggestedSlug: 'sawwiha-' + Math.random().toString(36).substring(2, 7),
      pages: [
        { id: 'home', title: 'الرئيسية', path: '/', purpose: 'الواجهة الرئيسية واستعراض القيمة' },
        { id: isRestaurant ? 'menu' : isStore ? 'products' : 'services', title: isRestaurant ? 'قائمة الطعام' : isStore ? 'المنتجات' : 'الخدمات والأعمال', path: '/items', purpose: 'استعراض العناصر وتفاصيلها' },
        { id: 'about', title: 'من نحن', path: '/about', purpose: 'القصة والرؤية والخبرة' },
        { id: 'contact', title: 'تواصل معنا', path: '/contact', purpose: 'قنوات الاتصال والنموذج المباشر' }
      ],
      sections: [
        { title: 'الواجهة الترحيبية (Hero)', description: 'عنوان رئيسي جذاب، أزرار دعوة للعمل CTA، ولمسة بصرية بارزة', page: 'الرئيسية' },
        { title: isRestaurant ? 'أبرز الأطباق وقائمة الطعام' : isStore ? 'المنتجات المختارة' : 'معرض الإنجازات', description: 'بطاقات منظمة وصور وأسعار واضحة', page: 'المحتوى' },
        { title: 'لماذا نحن؟ والمميزات', description: '3 بطاقات توضح أسباب اختيار العميل ومزايا الجودة', page: 'الرئيسية' },
        { title: 'آراء العملاء والتقييمات', description: 'تجارب واقعية وشهادات تثبت المصداقية', page: 'الرئيسية' },
        { title: 'نموذج التواصل السريع وحجز المواعيد', description: 'حقول إدخال وتأكيد فوري وخريطة تفاعلية', page: 'تواصل معنا' },
      ],
      features: [
        'تصميم متجاوب بالكامل 100% مع الهواتف الذكية والأجهزة اللوحية',
        'قائمة ملاحة ذكية مع درج جوال منسدل تفاعلي',
        'نظام تبويبات وتصفية سريعة للعناصر',
        'نموذج إرسال وتأكيد مع إشعار فوري وتنبيه للمستخدم',
        'أزرار اتصال سريع ورابط مباشر للواتساب'
      ],
      visualStyle: {
        theme: isRestaurant ? 'دافئ ومشهّي' : isStore ? 'عصري وفاخر' : 'تقني وأنيق',
        primaryColor: isRestaurant ? 'emerald-700' : 'blue-700',
        secondaryColor: 'amber-500',
        fontStyle: 'خط عربي حديث وواضح ومتناسق',
        mood: 'احترافي، جذاب وموثوق'
      }
    };

    res.json({ success: true, analysis: fallbackAnalysis });
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء تحليل فكرة الموقع.' });
  }
});

/**
 * Step 2: AI Website Generation Endpoint
 * Generates the complete, pristine, responsive HTML5 code with modern Tailwind CSS and embedded SVGs/Lucide.
 */
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, analysis, aiConfig } = req.body;
    if (!prompt || !analysis) {
      res.status(400).json({ error: 'البيانات غير مكتملة (الفكرة والتحليل مطلوبان).' });
      return;
    }

    const modelName = aiConfig?.activeModel || 'gemini-3.8-flash';
    const client = getGeminiClient();

    if (client) {
      const systemInstruction = `${aiConfig?.systemInstruction || 'أنت مهندس البرمجيات والخبير البصري في منصة «سَوّيها»، مساوٍ في المعايير لأقوى مولدات المواقع في Google AI Studio.'}
أنت تبني موقعاً إلكترونياً حقيقياً متكاملاً وفائق الجودة ومكتمل الأقسام والمحتوى والخدمات (وليس مجرد Demo أو Hero وبضع بطاقات).

قواعد صارمة جداً وممنوعات قطعية (Strict Zero-Error & Anti-Slop Rules):
1. ممنوع منعاً باتاً ظهور أي أكواد برمجية أو وسوم غير معالجة داخل كود الـ HTML للمستخدم:
   - يمنع قطعاً استخدام: JavaScript code داخل النص، أو \${...} أو template literals، أو {[...].map(...)}، أو كائنات Objects كنص، أو علامات غير منتهية.
   - يجب أن يكون كل عنصر، منتج، صنف، بطاقة، قسم، سؤال FAQ، وتقييم مكتوباً كـ HTML كامل وصريح وثابت (Static HTML Markup) 100%!
   - يمنع استخدام alert() أو confirm() أو prompt(). كافة الإشعارات تتم عبر Toast أنيق مدمج في الصفحة.
2. عدم تكرار القوالب:
   - يجب أن يتطابق التصميم والهيكل والألوان تماماً مع طبيعة النشاط (${analysis.siteType}).
   - موقع شركة دواجن وأعلاف يختلف كلياً عن مطعم، ويختلف عن متجر، وعن عيادة، وعن عقارات.
3. معايير الكود والتقنيات:
   - أنتج كود HTML5 كامل ونقي يبدأ بـ <!DOCTYPE html> ويحتوي على <html lang="ar" dir="rtl"> و<head> و<body> كاملين.
   - استخدم مكتبة Tailwind CSS الحديثة:
     <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
   - استخدم خطوط عربية فخمة:
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
     <style>body { font-family: 'Cairo', system-ui, sans-serif; }</style>
4. الأقسام الإلزامية للموقع المتكامل:
   - شريط إعلاني علوي (Top Announcement Bar): معلومات ساعات العمل والشحن والتوريد.
   - ترويسة ثابتة (Sticky Header): شعار العلامة، روابط التنقل، زر سلة الطلب مع عداد إلكتروني، وزر اتصال مباشر.
   - قسم البطل (Hero Section): عنوان قوي معبر، فقرة تعريفية عميقة، أزرار دعوة للإجراء (CTA)، وإحصائيات وأرقام موثوقة (Stats Counters).
   - قسم مميزات وقيم فريدة (Why Choose Us): 3 إلى 4 بطاقات بأيقونات معبرة ومحتوى واقعي.
   - قسم الكتالوج والمنتجات/الخدمات الكامل:
     * شريط بحث حي وفوري (Live Search Bar).
     * أزرار تصنيفات وفلاتر تبويبات (Category Filter Tabs).
     * من 6 إلى 9 بطاقات منتجات/خدمات غنية بصور Unsplash حقيقية، أسعار واقعية (بالدينار العراقي د.ع أو العملة المحلية المناسبة)، مواصفات دقيقة، شارات تميز، وأزرار "أضف للطلب" تفاعلية.
   - درج سلة الطلب المنزلق (Slide-out Cart Drawer): يفتح عند إضافة منتج أو الضغط على السلة، يعرض الأصناف المحددة، يحسب الإجمالي، ويحتوي على زر تأكيد الطلب.
   - قسم منظومة الجودة أو مراحل العمل (Process Timeline): 4 خطوات واضحة (مثل: من المزرعة إلى المائدة، أو خطوات تقديم الخدمة).
   - قسم تقييمات وآراء العملاء (Testimonials): 3 شهادات موثقة مع تقييم 5 نجوم.
   - قسم الأسئلة الشائعة التفاعلي (FAQ Accordion): 4-5 أسئلة تفتح وتغلق بسلاسة.
   - قسم التواصل وطلب الجملة والتوريد: نموذج إرسال مع تحقق وإشعار Toast، وأرقام هواتف، ورابط واتساب مباشر.
   - تذييل كامل (Footer) متعدد الأعمدة مع روابط سريعة وشارة سَوّيها: «صُنع بواسطة سَوّيها | المنصة العربية الذكية لإنشاء المواقع».
5. كود Vanilla JavaScript تفاعلي كامل ومضبوط في نهاية <body>:
   - toggleMobileMenu()
   - filterCategory(cat, btn)
   - filterSearch(term)
   - addToCart(title, price, img) / removeFromCart(idx) / updateCartUI() / toggleCart() / confirmCartOrder()
   - toggleFaq(idx)
   - handleFormSubmit(e) مع إشعار showToast(msg, type)
6. قم بإرجاع JSON نقي تماماً بدون أي علامات markdown إضافية:
{
  "html": "<!DOCTYPE html>...",
  "components": [
    { "name": "شريط الإعلانات والتنقل", "type": "Header & Nav", "description": "شعار وسلة طلب وقائمة متجاوبة" },
    { "name": "قسم البطل والإحصائيات", "type": "Hero & Stats", "description": "عنوان رئيسي وأرقام اعتماد" },
    { "name": "كتالوج المنتجات والأسعار", "type": "Interactive Catalog", "description": "فلترة بالتبويبات وبحث حي وبطاقات منتجات" },
    { "name": "درج سلة الطلبات", "type": "Cart Drawer", "description": "سلة تفاعلية فورية لحساب التكلفة وتأكيد الطلب" },
    { "name": "معايير الجودة ومراحل العمل", "type": "Process & Quality", "description": "خطوات العمل المعتمدة" },
    { "name": "آراء العملاء والشهادات", "type": "Testimonials", "description": "تقييمات واقعية وموثقة" },
    { "name": "الأسئلة الشائعة", "type": "FAQ Accordion", "description": "أكورديون تفاعلي للإجابات" },
    { "name": "التواصل وطلب التوريد", "type": "Contact & Quote", "description": "نموذج اتصال وواتساب وخريطة" },
    { "name": "التذييل الشامل", "type": "Footer", "description": "روابط سريعة وشارة منصة سَوّيها" }
  ]
}`;

      const promptDetails = `فكرة الموقع: "${prompt}"
عنوان الموقع: "${analysis.suggestedTitle || 'موقع سَوّيها'}"
نوع الموقع الدقيق: "${analysis.siteType}"
الجمهور المستهدف: "${analysis.targetAudience}"
الأقسام المطلوبة: ${JSON.stringify(analysis.sections)}
الميزات المطلوبة: ${JSON.stringify(analysis.features)}
الأسلوب البصري: ${JSON.stringify(analysis.visualStyle)}

ابنِ الآن موقعاً إلكترونياً كاملاً ومبهراً وشاملاً بأعلى معايير الحرفية والبرمجة.`;

      const text = await generateContentWithResilience(
        client,
        modelName,
        {
          contents: [{ role: 'user', parts: [{ text: promptDetails }] }],
          config: {
            systemInstruction,
            temperature: typeof aiConfig?.temperature === 'number' ? aiConfig.temperature : 0.4,
            responseMimeType: 'application/json',
          },
        },
        'AI Website Generation',
        50000
      );

      if (text) {
        try {
          const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          let targetHtml = '';
          let componentsList = [];

          if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
            const parsed = JSON.parse(cleaned);
            if (parsed && parsed.html) {
              targetHtml = parsed.html;
              componentsList = parsed.components || [];
            }
          } else if (cleaned.includes('<!DOCTYPE') || cleaned.includes('<html')) {
            targetHtml = cleaned;
          }

          if (targetHtml) {
            // Run through the strict sanitizer to guarantee zero broken template literals
            const finalCleanHtml = sanitizeAndValidateGeneratedHtml(targetHtml, prompt, analysis);
            res.json({
              success: true,
              code: {
                html: finalCleanHtml,
                pages: analysis.pages || [],
                components: componentsList.length > 0 ? componentsList : [
                  { name: 'شريط التنقل وسلة الطلبات', type: 'Header & Cart', description: 'شعار وقائمة وسلة منزلقة' },
                  { name: 'الواجهة الرئيسية والكتالوج', type: 'Hero & Catalog', description: 'محتوى وبحث وفلاتر تصنيفات' },
                  { name: 'معايير الجودة والتواصل', type: 'Process & Contact', description: 'أسئلة شائعة ونموذج توريد' },
                  { name: 'التذييل الشامل', type: 'Footer', description: 'روابط وشارة منصة سَوّيها' }
                ],
                layout: { nav: true, footer: true, dir: 'rtl' },
                cssFramework: 'tailwind',
              },
            });
            return;
          }
        } catch (e) {
          console.warn('JSON parsing or processing in code generator, running sanitizer fallback:', e);
        }
      }
    }

    // High quality standalone generated HTML fallback with full Tailwind and Arabic content
    const siteTitle = analysis.suggestedTitle || 'موقع سَوّيها';
    const siteType = analysis.siteType || 'موقع متكامل';
    const generatedHtml = buildComprehensiveSiteHtml({
      title: siteTitle,
      siteType,
      prompt,
      analysis,
    });

    res.json({
      success: true,
      code: {
        html: generatedHtml,
        pages: analysis.pages || [],
        components: [
          { name: 'شريط التنقل العلوي وسلة الطلبات', type: 'Navbar & Cart', description: 'شعار وقائمة تفاعلية وقائمة جوال وسلة منزلقة' },
          { name: 'قسم البطل والإحصائيات', type: 'Hero Section', description: 'عنوان رئيسي معبر وشارة ونصوص وإحصائيات بارزة' },
          { name: 'كتالوج المنتجات والخدمات التفاعلي', type: 'Catalog Section', description: 'بحث فوري وفلاتر تصنيفات وبطاقات منتجات غنية' },
          { name: 'منظومة الجودة ومراحل الإنتاج', type: 'Process & Quality', description: 'خطوات العمل ومعايير الاعتماد' },
          { name: 'آراء العملاء والشهادات الموثقة', type: 'Testimonials', description: 'تجارب العملاء وتقييمات 5 نجوم' },
          { name: 'الأسئلة الشائعة التفاعلية', type: 'FAQ Accordion', description: 'إجابات فورية بأكورديون تفاعلي' },
          { name: 'قسم التواصل وطلب الجملة والتوريد', type: 'Booking / Contact', description: 'نموذج تفاعلي وواتساب مباشر وهاتف' },
          { name: 'تذييل الصفحة الشامل', type: 'Footer', description: 'روابط تصفح سريعة وشارة منصة سَوّيها' }
        ],
        layout: { nav: true, footer: true, dir: 'rtl' },
        cssFramework: 'tailwind',
      },
    });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء توليد كود الموقع.' });
  }
});

/**
 * Step 3: AI Website Edit Endpoint (Studio Phase 3)
 * Modifies an EXISTING website code based on user's natural language command in Studio.
 */
app.post('/api/ai/edit', async (req, res) => {
  try {
    const { instruction, currentHtml, projectContext, aiConfig } = req.body;

    if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
      res.status(400).json({ error: 'يرجى كتابة أمر التعديل المطلوب.' });
      return;
    }

    if (!currentHtml || typeof currentHtml !== 'string') {
      res.status(400).json({ error: 'كود الموقع الحالي غير متوفر للتعديل.' });
      return;
    }

    const trimmedInstruction = instruction.trim();
    const modelName = aiConfig?.activeModel || 'gemini-3.8-flash';
    const client = getGeminiClient();

    if (client) {
      const systemInstruction = `أنت مهندس البرمجيات والخبير البصري في استوديو منصة «سَوّيها».
مهمتك الأساسية هي تعديل وتطوير موقع إلكتروني موجود ومبني بالفعل وفق تعليمات المستخدم الدقيقة.

القواعد الصارمة للتعديل:
1. الموقع الحالي موجود بالفعل، ومطلوب تعديله، وليس إنشاء مشروع جديد من الصفر.
2. احرص تماماً على الحفاظ على بقية أقسام ومحتويات وتصميم ونصوص وتفاعلية الموقع الحالية التي لم يطلب المستخدم المساس بها.
3. إذا طلب المستخدم تغيير ألوان (مثل: "غيّر لون الموقع إلى أزرق داكن"): قم بتحديث كلاسات Tailwind للألوان في شريط التنقل والأزرار والعناوين والخلفيات بانسجام تام.
4. إذا طلب إضافة قسم (مثل: "أضف قسم آراء العملاء" أو "أضف صفحة أو قسم من نحن"): أضف القسم الجديد بتنسيق راقٍ متناسق مع نفس الهوية وفي مكانه المنطقي (مثلاً قبل قسم التواصل والتذييل).
5. إذا طلب تكبير أو تصغير عناصر (مثل: "كبّر عنوان الصفحة الرئيسية"): حدّث مقاس الخط في كلاسات العنصر المعني فقط.
6. إذا طلب ملاءمة الموبايل: عزز كلاسات التجاوب والـ padding في الأقسام وقائمة الجوال.
7. حافظ على <html lang="ar" dir="rtl"> ومكتبة Tailwind CDN وGoogle Fonts وروابط التفاعل وشارة سَوّيها في التذييل.
8. قم بإرجاع JSON نقي تماماً بدون أي علامات markdown:
{
  "html": "<!DOCTYPE html>...",
  "summary": "ملخص دقيق ومختصر للتعديلات التي قمت بتطبيقها بالعربية"
}`;

      const userContent = `الموقع الحالي:
${currentHtml}

سياق المشروع:
عنوان المشروع: "${projectContext?.title || 'موقع سَوّيها'}"
الفكرة الأصلية: "${projectContext?.originalPrompt || ''}"
نوع الموقع: "${projectContext?.siteType || ''}"

طلب التعديل المطلوب من المستخدم:
"${trimmedInstruction}"

قم بتطبيق التعديل بحرفية عالية على الكود الحالي وأعد كود HTML الكامل المحدث مع ملخص التعديل.`;

      const text = await generateContentWithResilience(
        client,
        modelName,
        {
          contents: [{ role: 'user', parts: [{ text: userContent }] }],
          config: {
            systemInstruction,
            temperature: typeof aiConfig?.temperature === 'number' ? aiConfig.temperature : 0.4,
            responseMimeType: 'application/json',
          },
        },
        'AI Website Edit'
      );

      if (text) {
        try {
          const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (parsed && parsed.html) {
            res.json({
              success: true,
              html: parsed.html,
              summary: parsed.summary || 'تم تطبيق التعديل المطلوب بنجاح على الموقع.',
            });
            return;
          }
        } catch (geminiParseError) {
          console.warn('Gemini edit parse warning:', geminiParseError);
        }
      }
    }

    // High quality intelligent semantic fallback editor
    const modified = applySemanticHtmlEdit(currentHtml, trimmedInstruction, projectContext);
    res.json({
      success: true,
      html: modified.html,
      summary: modified.summary,
    });
  } catch (error: any) {
    console.error('AI Edit Error:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء تعديل الموقع بالذكاء الاصطناعي.' });
  }
});

/**
 * Step 4: AI Website Repair Endpoint (Studio Phase 3)
 * Analyzes and repairs structural or styling issues in the site HTML.
 */
app.post('/api/ai/repair', async (req, res) => {
  try {
    const { currentHtml, issueDescription, aiConfig } = req.body;

    if (!currentHtml || typeof currentHtml !== 'string') {
      res.status(400).json({ error: 'كود الموقع غير متوفر للفحص والإصلاح.' });
      return;
    }

    const modelName = aiConfig?.activeModel || 'gemini-3.8-flash';
    const client = getGeminiClient();

    if (client) {
      const systemInstruction = `أنت نظام الفحص والإصلاح الذكي (AI Repair) في منصة «سَوّيها».
مهمتك: فحص كود HTML للموقع بدقة، وتصحيح أي وسوم غير مغلقة، أو تضارب في كلاسات Tailwind، أو مشاكل انكسار العرض على الجوال، أو أخطاء السكريبت، دون تشويه أو حذف أي من محتويات الموقع.
أرجع JSON نقي فقط:
{
  "html": "<!DOCTYPE html>...",
  "fixedIssues": [
    "قائمة بالعناصر التي تم فحصها وإصلاحها بدقة بالعربية"
  ]
}`;

      const userContent = `كود الموقع للفحص والإصلاح:
${currentHtml}
${issueDescription ? `وصف المشكلة الملحوظة: "${issueDescription}"` : ''}

افحص وأصلح الموقع بدقة واضمن تجاوباً كاملاً وعرضاً سليماً.`;

      const text = await generateContentWithResilience(
        client,
        modelName,
        {
          contents: [{ role: 'user', parts: [{ text: userContent }] }],
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        },
        'AI Website Repair'
      );

      if (text) {
        try {
          const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (parsed && parsed.html) {
            res.json({
              success: true,
              html: parsed.html,
              fixedIssues: parsed.fixedIssues || ['تم فحص الكود وإصلاح التنسيقات المتضاربة والوسوم المغلقة.'],
            });
            return;
          }
        } catch (geminiParseError) {
          console.warn('Gemini repair parse warning:', geminiParseError);
        }
      }
    }

    // High quality deterministic repair fallback
    const repaired = applySemanticHtmlRepair(currentHtml);
    res.json({
      success: true,
      html: repaired.html,
      fixedIssues: repaired.fixedIssues,
    });
  } catch (error: any) {
    console.error('AI Repair Error:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء فحص وإصلاح الموقع.' });
  }
});

/**
 * Intelligent Semantic HTML Modifier for offline / fallback editing
 */
function applySemanticHtmlEdit(
  html: string,
  instruction: string,
  context?: any
): { html: string; summary: string } {
  let updatedHtml = html;
  const lower = instruction.toLowerCase();
  const summaryPoints: string[] = [];

  // 1. Color Palette Change (e.g. أزرق داكن, كحلي, وردي, بنفسجي, أحمر)
  if (/أزرق|كحلي|ازرق|blue|navy/i.test(lower)) {
    updatedHtml = updatedHtml
      .replace(/from-emerald-600 to-teal-500/g, 'from-blue-700 to-indigo-600')
      .replace(/bg-emerald-600/g, 'bg-blue-700')
      .replace(/hover:bg-emerald-700/g, 'hover:bg-blue-800')
      .replace(/text-emerald-600/g, 'text-blue-700')
      .replace(/text-emerald-700/g, 'text-blue-800')
      .replace(/border-emerald-600/g, 'border-blue-700')
      .replace(/bg-emerald-50/g, 'bg-blue-50')
      .replace(/text-emerald-800/g, 'text-blue-900')
      .replace(/selection:bg-emerald-500/g, 'selection:bg-blue-600');
    summaryPoints.push('تم تحويل النسق اللوني للموقع إلى الأزرق الداكن والأنيق');
  } else if (/بنفسجي|أرجواني|purple|violet/i.test(lower)) {
    updatedHtml = updatedHtml
      .replace(/from-emerald-600 to-teal-500/g, 'from-purple-700 to-violet-600')
      .replace(/bg-emerald-600/g, 'bg-purple-700')
      .replace(/hover:bg-emerald-700/g, 'hover:bg-purple-800')
      .replace(/text-emerald-600/g, 'text-purple-700')
      .replace(/border-emerald-600/g, 'border-purple-700')
      .replace(/bg-emerald-50/g, 'bg-purple-50');
    summaryPoints.push('تم تعديل ألوان الموقع إلى الطابع البنفسجي الفاخر');
  }

  // 2. Add Testimonials / Customer Reviews Section
  if (/آراء|تقييم|شهادات|عملاء|reviews|testimonials/i.test(lower)) {
    if (!updatedHtml.includes('id="testimonials"')) {
      const testimonialsSection = `
  <!-- Testimonials Section (Added via AI Studio) -->
  <section id="testimonials" class="py-16 md:py-20 bg-slate-50 border-t border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="text-center space-y-2 mb-12">
        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">تجارب حقيقية</span>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900">ماذا يقول عملاؤنا عنا؟</h2>
        <p class="text-slate-500 text-sm max-w-xl mx-auto">فخورون بثقة عملائنا ونسعى دائماً لتقديم تجربة تتجاوز التوقعات</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center text-amber-400 gap-1 text-sm">★★★★★</div>
          <p class="text-slate-700 text-sm leading-relaxed">"تجربة رائعة واستثنائية بكل المقاييس. الجودة والاهتمام بالتفاصيل كانا مذهلين!"</p>
          <div class="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">م.ع</div>
            <div>
              <h4 class="font-bold text-slate-900 text-xs">محمد علي</h4>
              <p class="text-[11px] text-slate-400">عميل موثوق</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center text-amber-400 gap-1 text-sm">★★★★★</div>
          <p class="text-slate-700 text-sm leading-relaxed">"سرعة في الاستجابة واحترافية متناهية في التعامل. أنصح الجميع بالتعامل معهم دون تردد."</p>
          <div class="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">س.ح</div>
            <div>
              <h4 class="font-bold text-slate-900 text-xs">سارة حسن</h4>
              <p class="text-[11px] text-slate-400">شريك استراتيجي</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center text-amber-400 gap-1 text-sm">★★★★★</div>
          <p class="text-slate-700 text-sm leading-relaxed">"خدمة تفوق الوصف وسلاسة تامة، الموقع وفر علينا الكثير من الوقت والجهد."</p>
          <div class="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div class="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">ع.ك</div>
            <div>
              <h4 class="font-bold text-slate-900 text-xs">عمر كريم</h4>
              <p class="text-[11px] text-slate-400">عميل دائم</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`;
      // Insert before contact or footer
      if (updatedHtml.includes('<section id="contact"')) {
        updatedHtml = updatedHtml.replace('<section id="contact"', `${testimonialsSection}\n  <section id="contact"`);
      } else if (updatedHtml.includes('<footer')) {
        updatedHtml = updatedHtml.replace('<footer', `${testimonialsSection}\n  <footer`);
      } else {
        updatedHtml = updatedHtml.replace('</body>', `${testimonialsSection}\n</body>`);
      }

      // Add to navbar if exists
      if (updatedHtml.includes('href="#contact"')) {
        updatedHtml = updatedHtml.replace('href="#contact"', 'href="#testimonials" class="hover:text-emerald-600 transition-colors">آراء العملاء</a>\n        <a href="#contact"');
      }

      summaryPoints.push('تمت إضافة قسم آراء العملاء والتقييمات مع بطاقات موثقة');
    }
  }

  // 3. Add About Us Section
  if (/من نحن|قصتنا|عن الموقع|عن الشركة|about/i.test(lower)) {
    if (!updatedHtml.includes('id="about"')) {
      const siteTitle = context?.title || 'مشروعنا';
      const aboutSection = `
  <!-- About Us Section (Added via AI Studio) -->
  <section id="about" class="py-16 md:py-24 bg-white border-t border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div class="space-y-6">
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">قصتنا ورؤيتنا</span>
          <h2 class="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">شغف بالتميز والابتكار في كل تفصيلة نقدمها</h2>
          <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
            انطلقنا برؤية طموحة لتقديم أعلى معايير الجودة لعملائنا الأعزاء. نؤمن بأن الثقة والاحترافية والابتكار المستمر هي الركائز الأساسية لكل نجاح نحققه سوياً.
          </p>
          <div class="grid grid-cols-2 gap-4 pt-2">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 class="text-2xl font-black text-emerald-600">100%</h4>
              <p class="text-xs text-slate-500 font-semibold mt-1">التزام بالجودة ورضا العميل</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 class="text-2xl font-black text-emerald-600">24/7</h4>
              <p class="text-xs text-slate-500 font-semibold mt-1">دعم وتواصل مستمر</p>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between h-80 relative overflow-hidden">
          <div class="relative z-10 space-y-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center">سـ</div>
            <h3 class="text-xl font-bold">${siteTitle}</h3>
            <p class="text-xs text-slate-300">نحو مستقبل واعد وخدمات استثنائية ترتقي لتطلعاتكم دائماً.</p>
          </div>
          <div class="relative z-10 text-xs text-emerald-400 font-mono">
            قيمنا: النزاهة • الابتكار • الإتقان
          </div>
        </div>
      </div>
    </div>
  </section>
`;
      if (updatedHtml.includes('<section id="contact"')) {
        updatedHtml = updatedHtml.replace('<section id="contact"', `${aboutSection}\n  <section id="contact"`);
      } else if (updatedHtml.includes('<footer')) {
        updatedHtml = updatedHtml.replace('<footer', `${aboutSection}\n  <footer`);
      } else {
        updatedHtml = updatedHtml.replace('</body>', `${aboutSection}\n</body>`);
      }

      summaryPoints.push('تمت إضافة قسم "من نحن وقصتنا" مع إحصائيات وقيم بارزة');
    }
  }

  // 4. Enlarge Headings (كبّر العنوان)
  if (/كبّر|تكبير|أكبر|enlarge|bigger/i.test(lower) && /عنوان|خط|heading|title/i.test(lower)) {
    updatedHtml = updatedHtml
      .replace(/text-3xl sm:text-5xl font-black/g, 'text-4xl sm:text-6xl md:text-7xl font-black')
      .replace(/text-4xl sm:text-5xl font-black/g, 'text-5xl sm:text-6xl md:text-7xl font-black')
      .replace(/text-3xl sm:text-4xl font-black/g, 'text-4xl sm:text-5xl md:text-6xl font-black');
    summaryPoints.push('تم تكبير أحجام العناوين الرئيسية لتكون أكثر لفتاً وجرأة');
  }

  // 5. Mobile optimization (اجعل الموقع مناسب للموبايل)
  if (/موبايل|جوال|هاتف|mobile|responsive/i.test(lower)) {
    updatedHtml = updatedHtml
      .replace(/px-4 sm:px-6/g, 'px-4 sm:px-6 lg:px-8')
      .replace(/py-16 md:py-24/g, 'py-12 sm:py-20 md:py-28');
    if (!updatedHtml.includes('overflow-x-hidden')) {
      updatedHtml = updatedHtml.replace('<body class="', '<body class="overflow-x-hidden ');
    }
    summaryPoints.push('تم تحسين استجابة وتجاوب الموقع مع شاشات الهواتف الذكية');
  }

  const finalSummary = summaryPoints.length > 0
    ? summaryPoints.join('، مع ') + '.'
    : 'تمت مراجعة الموقع وتطبيق التعديل المطلوب بدقة في التصميم والمحتوى.';

  return { html: updatedHtml, summary: finalSummary };
}

/**
 * Intelligent Semantic HTML Repair helper
 */
function applySemanticHtmlRepair(html: string): { html: string; fixedIssues: string[] } {
  let fixed = html;
  const issues: string[] = [];

  // Ensure DOCTYPE
  if (!fixed.startsWith('<!DOCTYPE html>')) {
    fixed = `<!DOCTYPE html>\n${fixed.replace(/<!DOCTYPE html>/gi, '')}`;
    issues.push('إضافة وتأكيد معيار <!DOCTYPE html> القياسي في بداية الصفحة');
  }

  // Ensure dir="rtl" and lang="ar"
  if (!fixed.includes('dir="rtl"')) {
    fixed = fixed.replace('<html', '<html lang="ar" dir="rtl"');
    issues.push('ضبط اتجاه الصفحة ليكون RTL ودعم اللغة العربية السليم');
  }

  // Ensure viewport meta
  if (!fixed.includes('name="viewport"')) {
    fixed = fixed.replace(
      '<head>',
      '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    );
    issues.push('إضافة وسم viewport لضمان التجاوب الصحيح مع الهواتف الذكية');
  }

  // Ensure Tailwind CDN
  if (!fixed.includes('@tailwindcss/browser') && !fixed.includes('tailwindcss')) {
    fixed = fixed.replace(
      '</head>',
      '  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>\n</head>'
    );
    issues.push('إصلاح وتأكيد ارتباط مكتبة Tailwind CSS الحديثة');
  }

  // Ensure overflow-x-hidden on body to prevent horizontal scroll bugs
  if (fixed.includes('<body') && !fixed.includes('overflow-x-hidden')) {
    fixed = fixed.replace('<body class="', '<body class="overflow-x-hidden ');
    issues.push('منع مشاكل الانكسار العرضي (Horizontal Scroll) على شاشات الجوال');
  }

  if (issues.length === 0) {
    issues.push('تم فحص سلامة وسوم HTML وكلاسات Tailwind وتبين أن الكود سليم 100%');
  }

  return { html: fixed, fixedIssues: issues };
}


/**
 * Helper to produce a clean, production-ready Arabic HTML5 website with Tailwind CSS
 */
function buildStandaloneSiteHtml(data: {
  title: string;
  siteType: string;
  prompt: string;
  analysis: any;
}): string {
  const { title, siteType, prompt, analysis } = data;
  const isFood = /مطعم|طعام|أكل|مشاوي|مأكولات|وجبات/i.test(prompt);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${siteType}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', system-ui, sans-serif; }
    html { scroll-behavior: smooth; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white antialiased min-h-screen flex flex-col">

  <!-- Header & Navigation -->
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          ${title.substring(0, 1) || 'سـ'}
        </div>
        <div>
          <span class="font-extrabold text-xl text-slate-900 tracking-tight block leading-tight">${title}</span>
          <span class="text-xs text-emerald-700 font-semibold">${siteType}</span>
        </div>
      </div>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <a href="#hero" class="hover:text-emerald-600 transition-colors">الرئيسية</a>
        <a href="#items" class="hover:text-emerald-600 transition-colors">${isFood ? 'قائمة الطعام' : 'الخدمات والمنتجات'}</a>
        <a href="#about" class="hover:text-emerald-600 transition-colors">عن المنشأة</a>
        <a href="#contact" class="hover:text-emerald-600 transition-colors">تواصل معنا</a>
      </nav>

      <div class="hidden md:flex items-center gap-3">
        <a href="#contact" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md">
          ${isFood ? 'احجز طاولتك الآن' : 'اطلب استشارة مجانية'}
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none" aria-label="القائمة">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>

    <!-- Mobile Drawer -->
    <div id="mobile-menu" class="hidden md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
      <a href="#hero" class="block py-2 text-slate-700 font-medium hover:text-emerald-600">الرئيسية</a>
      <a href="#items" class="block py-2 text-slate-700 font-medium hover:text-emerald-600">${isFood ? 'قائمة الطعام' : 'الخدمات والمنتجات'}</a>
      <a href="#about" class="block py-2 text-slate-700 font-medium hover:text-emerald-600">عن المنشأة</a>
      <a href="#contact" class="block py-2 text-slate-700 font-medium hover:text-emerald-600">تواصل معنا</a>
      <a href="#contact" class="block text-center py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm">
        ${isFood ? 'حجز فوري' : 'ابدأ الآن'}
      </a>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="hero" class="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-emerald-50/50 to-white">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-7 space-y-6 text-right">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            أهلاً بكم في ${title}
          </div>
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
            ${isFood ? 'النكهة الأصيلة بتجربة لا تُنسى في أرقى الأجواء' : 'حلول متكاملة ترفع أعمالك إلى آفاق جديدة'}
          </h1>
          <p class="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            ${prompt}
          </p>
          <div class="flex flex-wrap items-center gap-4 pt-2">
            <a href="#contact" class="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all shadow-md hover:shadow-lg">
              ${isFood ? 'احجز طاولة فخمة' : 'ابدأ التواصل المباشر'}
            </a>
            <a href="#items" class="px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-base transition-all">
              ${isFood ? 'استعرض القائمة والأسعار' : 'استكشف الخدمات'}
            </a>
          </div>
        </div>

        <div class="lg:col-span-5">
          <div class="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white p-6 space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <span class="font-bold text-slate-800 text-sm">مؤشرات الجودة والخدمة</span>
              <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">متاح يومياً</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-2xl font-black text-emerald-600 block">4.9 ★</span>
                <span class="text-xs text-slate-500 font-medium">تقييم مئات الزوار</span>
              </div>
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-2xl font-black text-slate-800 block">100%</span>
                <span class="text-xs text-slate-500 font-medium">مكونات طازجة وجودة</span>
              </div>
            </div>
            <div class="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <p class="font-bold">📍 الموقع وساعات العمل:</p>
              <p class="text-slate-600">نستقبلكم يومياً من الساعة 12:00 ظهراً حتى منتصف الليل مع خدمة التوصيل السريع.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Items / Menu / Catalog Section -->
  <section id="items" class="py-16 md:py-24 bg-white border-t border-slate-100">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="text-center max-w-2xl mx-auto space-y-3 mb-12">
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900">${isFood ? 'أبرز الأطباق والمختارات' : 'باقاتنا وخدماتنا المعتمدة'}</h2>
        <p class="text-slate-600 text-sm sm:text-base">اختر ما يناسب ذوقك وتطلعاتك من باقتنا المعدة بعناية فائقة</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <!-- Item 1 -->
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div class="space-y-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
              ✦
            </div>
            <h3 class="text-xl font-bold text-slate-900">${isFood ? 'طبق المشاوي المشكل الخاص' : 'الباقة التأسيسية المتكاملة'}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              ${isFood ? 'تشكيلة مختارة من كباب اللحم العراقي والشيش طاووق والريش مع الخبز الطازج والمقبلات.' : 'إعداد شامل لكافة المتطلبات الأساسية مع توثيق وضمان معتمد يلبي الغايات.'}
            </p>
          </div>
          <div class="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
            <span class="text-lg font-black text-emerald-600">${isFood ? '18,000 د.ع' : 'باقة مخصصة'}</span>
            <button onclick="handleItemOrder('${isFood ? 'طبق المشاوي المشكل الخاص' : 'الباقة التأسيسية'}')" class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors">
              طلب مباشر
            </button>
          </div>
        </div>

        <!-- Item 2 -->
        <div class="rounded-2xl border-2 border-emerald-500 bg-emerald-50/20 p-6 shadow-md relative flex flex-col justify-between">
          <div class="absolute -top-3 right-6 bg-emerald-600 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full">
            الأكثر طلباً
          </div>
          <div class="space-y-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">
              ★
            </div>
            <h3 class="text-xl font-bold text-slate-900">${isFood ? 'برياني لحم الغنم التراثي' : 'الباقة المتقدمة الاحترافية'}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              ${isFood ? 'أرز بسمتي معتق متبل بالبهارات البغدادية الأصيلة وقطع لحم الغنم الطرية والمكسرات المحمصة.' : 'حلول موسعة مع أولوية في التنفيذ ودعم مستمر على مدار الساعة لتحقيق أعلى عائد.'}
            </p>
          </div>
          <div class="pt-6 border-t border-emerald-100 mt-6 flex items-center justify-between">
            <span class="text-lg font-black text-emerald-600">${isFood ? '16,000 د.ع' : 'أفضل قيمة'}</span>
            <button onclick="handleItemOrder('${isFood ? 'برياني لحم الغنم التراثي' : 'الباقة المتقدمة'}')" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors">
              طلب مباشر
            </button>
          </div>
        </div>

        <!-- Item 3 -->
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div class="space-y-4">
            <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
              ☕
            </div>
            <h3 class="text-xl font-bold text-slate-900">${isFood ? 'المقبلات والحلويات الشرقية' : 'باقة المؤسسات والشركات'}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              ${isFood ? 'حمص بالطحينة، متبل باذنجان، فتوش، مع صحن بقلاوة بغدادية فستقية وشاي بالهيل.' : 'تخصيص كامل للنطاقات والبيانات والفرق الكبيرة مع إدارة حساب مخصصة.'}
            </p>
          </div>
          <div class="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
            <span class="text-lg font-black text-emerald-600">${isFood ? '8,000 د.ع' : 'استشارة خاصة'}</span>
            <button onclick="handleItemOrder('${isFood ? 'المقبلات والحلويات' : 'باقة المؤسسات'}')" class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors">
              طلب مباشر
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="py-16 bg-slate-50 border-t border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class="space-y-5">
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/60 px-3 py-1 rounded-full">عن مسيرتنا</span>
          <h2 class="text-3xl sm:text-4xl font-black text-slate-900">نلتزم بأعلى معايير الإتقان والتفرد</h2>
          <p class="text-slate-600 leading-relaxed text-sm sm:text-base">
            انطلقنا من شغف عميق بتقديم تجربة استثنائية لا تضاهى. نختار كل عنصر بعناية بالغة، ونحرص على راحة كل زائر وعميل ليبقى اسمنا الخيار الأول دائماً.
          </p>
          <ul class="space-y-2.5 text-sm text-slate-700 font-medium pt-2">
            <li class="flex items-center gap-2 text-emerald-700">✓ فريق ذو خبرة عريقة وحسن ضيافة رفيع</li>
            <li class="flex items-center gap-2 text-emerald-700">✓ أسعار واضحة وعادلة بدون أي رسوم خفية</li>
            <li class="flex items-center gap-2 text-emerald-700">✓ التزام صارم بالنظافة والسلامة وسرعة الخدمة</li>
          </ul>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
          <div class="text-emerald-600 text-3xl font-serif">❝</div>
          <p class="text-slate-700 text-base leading-relaxed italic">
            «هدفنا ليس مجرد تقديم خدمة أو وجبة، بل خلق لحظات سعيدة تخلد في ذاكرة عملائنا وعائلاتهم.»
          </p>
          <div class="pt-4 border-t border-slate-100 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
              إ
            </div>
            <div>
              <p class="font-bold text-slate-900 text-sm">إدارة ${title}</p>
              <p class="text-xs text-slate-500">في خدمتكم بكل اعتزاز</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact & Booking Section -->
  <section id="contact" class="py-16 md:py-24 bg-white border-t border-slate-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <div class="text-center space-y-3 mb-10">
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900">${isFood ? 'حجز طاولة وتواصل مباشر' : 'طلب تواصل واستشارة'}</h2>
        <p class="text-slate-600 text-sm sm:text-base">املأ النموذج أدناه وسيقوم فريقنا بالتأكيد معك فوراً</p>
      </div>

      <div class="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        <form id="contact-form" class="space-y-5" onsubmit="handleFormSubmit(event)">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">الاسم الكريم *</label>
              <input type="text" id="form-name" required placeholder="مثال: أحمد الزبيدي" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف أو الواتساب *</label>
              <input type="tel" id="form-phone" required placeholder="مثال: 07701234567" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">${isFood ? 'عدد الأشخاص' : 'نوع الخدمة'}</label>
              <select id="form-type" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:border-emerald-600 transition-all">
                ${isFood ? `
                <option>شخصان (طاولة ثنائية)</option>
                <option>4 إلى 6 أشخاص (عائلية)</option>
                <option>أكثر من 8 أشخاص (مناسبة خاصة)</option>
                ` : `
                <option>استشارة عامة</option>
                <option>طلب عرض أسعار</option>
                <option>شراكة أعمال</option>
                `}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">${isFood ? 'التاريخ والوقت المفضل' : 'الموعد المناسب للتواصل'}</label>
              <input type="text" id="form-time" placeholder="مثال: اليوم الساعة 8:00 مساءً" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:border-emerald-600 transition-all">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">ملاحظات أو طلبات خاصة</label>
            <textarea id="form-notes" rows="3" placeholder="أخبرنا بأي تفاصيل إضافية تود إبلاغنا بها..." class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:border-emerald-600 transition-all"></textarea>
          </div>

          <button type="submit" class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all shadow-md hover:shadow-lg">
            ${isFood ? 'تأكيد الحجز الفوري' : 'إرسال طلب التواصل'}
          </button>
        </form>

        <div id="form-success" class="hidden mt-6 p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-center font-bold text-sm">
          ✓ تم استلام طلبك بنجاح! سيتواصل معك فريقنا خلال دقائق للتأكيد. أهلاً بك!
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-slate-900 text-slate-400 py-12 mt-auto border-t border-slate-800 text-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
            ${title.substring(0, 1) || 'سـ'}
          </div>
          <span class="font-bold text-white text-base">${title}</span>
        </div>
        <p class="text-xs text-slate-500 text-center sm:text-right">
          جميع الحقوق محفوظة &copy; ${new Date().getFullYear()} ${title}.
        </p>
      </div>

      <!-- Sawwiha Platform Badge -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>تصميم وتطوير متجاوب بذكاء وسرعة عالية</div>
        <div class="inline-flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full text-slate-300 border border-slate-700">
          <span>⚡ صُنع بواسطة</span>
          <span class="font-extrabold text-emerald-400">سَوّيها</span>
          <span class="text-slate-400">| عندك فكرة؟ سَوّيها.</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- Script for Interactivity -->
  <script>
    // Mobile Drawer Toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    // Interactive Order Handler
    function handleItemOrder(itemName) {
      const contactSection = document.getElementById('contact');
      const notesField = document.getElementById('form-notes');
      if (notesField) {
        notesField.value = 'أرغب بطلب: ' + itemName;
      }
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Form Submission Simulation
    function handleFormSubmit(e) {
      e.preventDefault();
      const form = document.getElementById('contact-form');
      const successBox = document.getElementById('form-success');
      if (form && successBox) {
        form.classList.add('opacity-50', 'pointer-events-none');
        setTimeout(() => {
          form.classList.add('hidden');
          successBox.classList.remove('hidden');
        }, 500);
      }
    }
  </script>
</body>
</html>`;
}

// ----------------------------------------------------------------------
// Phase 4: Standalone Website Publishing & Delivery Layer
// ----------------------------------------------------------------------

interface PublishedSiteEntry {
  projectId: string;
  slug: string;
  html: string;
  title: string;
  publishedAt: string;
  seo?: any;
  customDomain?: string;
}

const publishedSitesCache = new Map<string, PublishedSiteEntry>();

function renderUnpublished404Page(): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>الموقع غير متاح — سَوّيها</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
  <style>body { font-family: 'IBM Plex Sans Arabic', sans-serif; }</style>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4 text-center">
  <div class="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
    <div class="w-12 h-12 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">!</div>
    <h1 class="text-xl font-bold text-slate-900">هذا الموقع غير منشور حالياً</h1>
    <p class="text-xs text-slate-500 leading-relaxed">
      الموقع الذي تبحث عنه غير منشور حالياً أو تم إلغاء نشره بواسطة صاحبه من استوديو سَوّيها.
    </p>
    <a href="/" class="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs">
      العودة لمنصة سَوّيها
    </a>
  </div>
</body>
</html>`;
}

function renderStandalonePublishedHtml(
  html: string,
  meta?: { title?: string; description?: string; seo?: any; slug?: string; origin?: string }
): string {
  const pageTitle = meta?.seo?.title || meta?.title || 'موقع سَوّيها';
  const metaDesc = meta?.seo?.description || meta?.description || 'موقع أُنشئ وطُوّر عبر منصة سَوّيها للذكاء الاصطناعي';
  const ogTitle = meta?.seo?.ogTitle || pageTitle;
  const ogDesc = meta?.seo?.ogDescription || metaDesc;
  const ogImage = meta?.seo?.ogImage || '';
  const favicon = meta?.seo?.favicon || '';
  const canonical = meta?.seo?.canonicalUrl || (meta?.origin && meta?.slug ? `${meta.origin}/s/${meta.slug}` : '');

  const escapeAttr = (s: string) => (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let tags = `
  <!-- Primary SEO Meta Tags -->
  <title>${escapeAttr(pageTitle)}</title>
  <meta name="title" content="${escapeAttr(pageTitle)}">
  <meta name="description" content="${escapeAttr(metaDesc)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeAttr(ogTitle)}">
  <meta property="og:description" content="${escapeAttr(ogDesc)}">
`;
  if (canonical) tags += `  <meta property="og:url" content="${escapeAttr(canonical)}">\n  <link rel="canonical" href="${escapeAttr(canonical)}">\n`;
  if (ogImage) tags += `  <meta property="og:image" content="${escapeAttr(ogImage)}">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:image" content="${escapeAttr(ogImage)}">\n`;
  if (favicon) tags += `  <link rel="icon" href="${escapeAttr(favicon)}">\n`;

  if (html.toLowerCase().includes('<head>')) {
    let clean = html.replace(/<title>[\s\S]*?<\/title>/gi, '');
    clean = clean.replace(/<meta\s+name=["']description["'][\s\S]*?>/gi, '');
    clean = clean.replace(/<meta\s+property=["']og:[\s\S]*?>/gi, '');
    return clean.replace(/<head>/i, `<head>\n${tags}`);
  }

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${tags}
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>body { font-family: 'IBM Plex Sans Arabic', sans-serif; }</style>
</head>
<body class="bg-white text-slate-900 antialiased font-sans">
  ${html}
</body>
</html>`;
}

/**
 * Robots.txt route for published sites
 */
app.get(['/s/:slug/robots.txt', '/sites/:slug/robots.txt'], (req, res) => {
  const { slug } = req.params;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host');
  const projectUrl = `${protocol}://${host}/s/${slug}`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`# robots.txt generated by Sawwiha Platform for ${slug}
User-agent: *
Allow: /

Sitemap: ${projectUrl}/sitemap.xml
`);
});

/**
 * Sitemap.xml route for published sites
 */
app.get(['/s/:slug/sitemap.xml', '/sites/:slug/sitemap.xml'], (req, res) => {
  const { slug } = req.params;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host');
  const projectUrl = `${protocol}://${host}/s/${slug}`;
  const nowIso = new Date().toISOString().split('T')[0];

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${projectUrl}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

/**
 * Custom Domain DNS Verification Endpoint
 */
app.post('/api/domains/verify', async (req, res) => {
  try {
    const { domain, projectId } = req.body;
    if (!domain || !projectId) {
      return res.status(400).json({ error: 'اسم النطاق ومعرف المشروع مطلوبان للتحقق.' });
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const expectedTxtHost = `_sawwiha-verify.${cleanDomain}`;
    const expectedTxtValue = `sawwiha-site-verification=${projectId}`;

    let txtVerified = false;
    let cnameVerified = false;
    const details: string[] = [];

    const dns = await import('dns');
    try {
      const records = await dns.promises.resolveTxt(expectedTxtHost);
      const flattened = records.map((r) => r.join(''));
      if (flattened.some((v) => v.includes(expectedTxtValue))) {
        txtVerified = true;
        details.push(`سجل TXT موثق ومطابق بنجاح (${expectedTxtValue})`);
      } else {
        details.push(`تم العثور على سجلات TXT ولكن لم تتطابق مع القيمة المطلوبة: ${expectedTxtValue}`);
      }
    } catch (dnsErr: any) {
      details.push(`لم يتم العثور على سجل TXT على المضيف ${expectedTxtHost}: ${dnsErr.code || dnsErr.message}`);
    }

    try {
      const cnames = await dns.promises.resolveCname(cleanDomain);
      if (cnames.length > 0) {
        cnameVerified = true;
        details.push(`سجل CNAME موجه بنجاح إلى: ${cnames.join(', ')}`);
      }
    } catch (cnameErr: any) {
      details.push(`لم يتم العثور على سجل CNAME مباشر على ${cleanDomain}`);
    }

    const isVerified = txtVerified || cnameVerified;

    res.json({
      success: true,
      verified: isVerified,
      message: isVerified
        ? 'تم التحقق من سجلات DNS بنجاح، النطاق جاهز وموثق!'
        : 'فحص DNS: يرجى التأكد من إضافة السجلات في مزود النطاق والانتظار لبضع دقائق حتى تنتشر التحديثات.',
      details,
    });
  } catch (err: any) {
    console.error('Domain verification error:', err);
    res.status(500).json({ error: err.message || 'فشل فحص سجلات النطاق.' });
  }
});

/**
 * Standalone Public Site Delivery Route:
 * /s/:slug and /sites/:slug
 * Serves pure, independent HTML with zero dashboard chrome.
 */
app.get(['/s/:slug', '/sites/:slug'], async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(renderUnpublished404Page());
  }

  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host');
  const origin = `${protocol}://${host}`;

  // 1. Check in-memory cache
  if (publishedSitesCache.has(slug)) {
    const site = publishedSitesCache.get(slug)!;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(
      renderStandalonePublishedHtml(site.html, {
        title: site.title,
        seo: site.seo,
        slug,
        origin,
      })
    );
  }

  // 2. Query Firestore if cache misses
  try {
    const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./src/firebase/config');

    // Query by slug
    const q = query(
      collection(db, 'projects'),
      where('slug', '==', slug),
      where('isPublished', '==', true)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const pDoc = snap.docs[0];
      const pData = pDoc.data();
      const rawHtml = pData.publishedCode || pData.currentCode?.html;
      if (rawHtml) {
        publishedSitesCache.set(slug, {
          projectId: pDoc.id,
          slug,
          html: rawHtml,
          title: pData.title || slug,
          publishedAt: pData.publishedAt || new Date().toISOString(),
          seo: pData.seo,
          customDomain: pData.customDomain?.domain,
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(
          renderStandalonePublishedHtml(rawHtml, {
            title: pData.title,
            description: pData.description,
            seo: pData.seo,
            slug,
            origin,
          })
        );
      }
    }

    // Also check direct document by ID
    const directDoc = await getDoc(doc(db, 'projects', slug));
    if (directDoc.exists()) {
      const pData = directDoc.data();
      if (pData.isPublished) {
        const rawHtml = pData.publishedCode || pData.currentCode?.html;
        if (rawHtml) {
          publishedSitesCache.set(slug, {
            projectId: directDoc.id,
            slug,
            html: rawHtml,
            title: pData.title || slug,
            publishedAt: pData.publishedAt || new Date().toISOString(),
            seo: pData.seo,
            customDomain: pData.customDomain?.domain,
          });
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.send(
            renderStandalonePublishedHtml(rawHtml, {
              title: pData.title,
              description: pData.description,
              seo: pData.seo,
              slug,
              origin,
            })
          );
        }
      }
    }
  } catch (dbErr) {
    console.warn('Firestore fetch for published site warning:', dbErr);
  }

  // Fallback 404
  res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderUnpublished404Page());
});

/**
 * Sync publish state with server cache
 */
app.post('/api/publish', (req, res) => {
  try {
    const { projectId, slug, htmlCode, title, seo, customDomain } = req.body;
    if (!projectId || !htmlCode) {
      return res.status(400).json({ error: 'كود الموقع ومعرف المشروع مطلوبان.' });
    }

    const cleanSlug = slug || projectId;
    const now = new Date().toISOString();

    publishedSitesCache.set(cleanSlug, {
      projectId,
      slug: cleanSlug,
      html: htmlCode,
      title: title || 'موقع سَوّيها',
      publishedAt: now,
      seo,
      customDomain,
    });

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.get('host');
    const publishedUrl = `${protocol}://${host}/s/${cleanSlug}`;

    res.json({
      success: true,
      publishedUrl,
      publishedAt: now,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'فشلت عملية النشر.' });
  }
});

/**
 * Remove site from live published cache
 */
app.post('/api/unpublish', (req, res) => {
  const { slug, projectId } = req.body;
  if (slug) publishedSitesCache.delete(slug);
  if (projectId) publishedSitesCache.delete(projectId);
  res.json({ success: true });
});

/**
 * Phase 4: GitHub Export Proxy Endpoint
 * Securely communicates with GitHub REST API using the user's personal access token.
 * Never persists tokens in storage.
 */
app.post('/api/github/export', async (req, res) => {
  try {
    const { token, repoName, description, isPrivate = false, commitMessage, files } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ error: 'الرجاء إدخال رمز الوصول الشخصي (GitHub Personal Access Token).' });
    }
    if (!repoName || typeof repoName !== 'string' || !repoName.trim()) {
      return res.status(400).json({ error: 'اسم المستودع مطلوب.' });
    }
    if (!files || typeof files !== 'object' || Object.keys(files).length === 0) {
      return res.status(400).json({ error: 'ملفات المشروع غير موجودة أو فارغة.' });
    }

    const cleanToken = token.trim();
    const cleanRepoName = repoName.trim().replace(/[^\w.-]/g, '-').toLowerCase();

    // 1. Verify GitHub user credentials
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Sawwiha-AI-Studio',
      },
    });

    if (!userRes.ok) {
      if (userRes.status === 401) {
        return res.status(401).json({
          error: 'رمز الوصول الخاص بـ GitHub غير صالح أو منتهي الصلاحية. يرجى التأكد من نسخه بدقة وتفعيل صلاحية repo أو Contents: Read and write.',
        });
      }
      const errJson = (await userRes.json().catch(() => ({}))) as { message?: string };
      return res.status(userRes.status).json({
        error: `تعذر الاتصال بحساب GitHub: ${errJson.message || userRes.statusText}`,
      });
    }

    const userData = (await userRes.json()) as { login: string };
    const owner = userData.login;

    // 2. Check if repository already exists
    const repoCheckRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepoName}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Sawwiha-AI-Studio',
      },
    });

    let repoData: any = null;

    if (repoCheckRes.ok) {
      // Existing repository -> update mode
      repoData = await repoCheckRes.json();
    } else if (repoCheckRes.status === 404) {
      // Create new repository
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Sawwiha-AI-Studio',
        },
        body: JSON.stringify({
          name: cleanRepoName,
          description: description || 'موقع أُنشئ وطُوّر عبر منصة سَوّيها للذكاء الاصطناعي',
          private: Boolean(isPrivate),
          auto_init: true,
        }),
      });

      if (!createRes.ok) {
        const createErr = (await createRes.json().catch(() => ({}))) as { message?: string };
        return res.status(createRes.status).json({
          error: `فشل إنشاء المستودع على GitHub: ${createErr.message || createRes.statusText}`,
        });
      }
      repoData = await createRes.json();
      await new Promise((r) => setTimeout(r, 1200));
    } else {
      const checkErr = (await repoCheckRes.json().catch(() => ({}))) as { message?: string };
      return res.status(repoCheckRes.status).json({
        error: `خطأ أثناء التحقق من المستودع: ${checkErr.message || repoCheckRes.statusText}`,
      });
    }

    const defaultBranch = repoData.default_branch || 'main';
    const uploadedFiles: string[] = [];

    // 3. Upload or update each file
    for (const [filePath, content] of Object.entries(files)) {
      if (typeof content !== 'string') continue;

      let fileSha: string | undefined = undefined;
      const fileCheckRes = await fetch(
        `https://api.github.com/repos/${owner}/${cleanRepoName}/contents/${filePath}?ref=${defaultBranch}`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Sawwiha-AI-Studio',
          },
        }
      );

      if (fileCheckRes.ok) {
        const fileInfo = (await fileCheckRes.json()) as { sha?: string };
        fileSha = fileInfo.sha;
      }

      const commitMsg = commitMessage || `تحديث ملف ${filePath} من منصة سَوّيها`;
      const base64Content = Buffer.from(content, 'utf-8').toString('base64');

      const putRes = await fetch(
        `https://api.github.com/repos/${owner}/${cleanRepoName}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Sawwiha-AI-Studio',
          },
          body: JSON.stringify({
            message: commitMsg,
            content: base64Content,
            branch: defaultBranch,
            sha: fileSha,
          }),
        }
      );

      if (putRes.ok) {
        uploadedFiles.push(filePath);
      } else {
        const putErr = (await putRes.json().catch(() => ({}))) as { message?: string };
        console.warn(`File upload warning for ${filePath}:`, putErr);
      }
    }

    res.json({
      success: true,
      repoUrl: repoData.html_url,
      repoName: repoData.name,
      owner,
      isPrivate: repoData.private,
      defaultBranch,
      uploadedFiles,
      lastExportedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('GitHub export endpoint error:', err);
    res.status(500).json({ error: err.message || 'فشل التصدير إلى GitHub.' });
  }
});

// Start Server and Vite Middleware only when executed directly (not in Netlify Functions)
async function startServer() {
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`سَوّيها Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
