/**
 * Universal Isolated Client-Side Router Script for Sawwiha Generated Sites
 *
 * Guarantees:
 * 1. 100% isolation from Sawwiha platform and Google AI Studio routing.
 * 2. Intercepts all internal link clicks (e.g. /menu, /menu/food, /menu/drinks, /about, /contact)
 *    so they never trigger parent page reload or navigate away to host '/'.
 * 3. Supports explicit page views (.page-view), deep section anchors, category sub-filters,
 *    and automated dynamic sub-page rendering.
 * 4. Full Browser Back / Forward support (popstate + hashchange).
 * 5. Direct URL opening and browser Refresh without 404 or redirect to Sawwiha.
 * 6. Base Path awareness for /preview/:slug, /s/:slug, and standalone custom domains.
 */
export function getUniversalRouterScript(options?: {
  basePath?: string;
  defaultRoute?: string;
  siteTitle?: string;
}): string {
  const initialBase = options?.basePath || '';
  const initialRoute = options?.defaultRoute || '/';
  const siteTitle = options?.siteTitle || 'الموقع';

  return `
  <!-- Sawwiha Universal Isolated Router -->
  <script>
    (function() {
      if (window.__SAWWIHA_ROUTER_INITIALIZED__) return;
      window.__SAWWIHA_ROUTER_INITIALIZED__ = true;

      // 1. Detect Base Path
      function detectBasePath() {
        var metaBase = document.querySelector('meta[name="sawwiha-base-path"]');
        if (metaBase && metaBase.getAttribute('content')) {
          return metaBase.getAttribute('content').trim();
        }
        var htmlBase = document.documentElement.getAttribute('data-base-path');
        if (htmlBase) return htmlBase.trim();

        // Detect from location pathname (e.g. /preview/slug or /s/slug or /sites/slug)
        try {
          var match = window.location.pathname.match(/^\\/(preview|s|sites|site)\\/([^\\/]+)/);
          if (match) {
            return '/' + match[1] + '/' + match[2];
          }
        } catch (e) {}

        return '${initialBase}';
      }

      var basePath = detectBasePath();

      // 2. Normalize and clean paths
      function cleanPath(raw) {
        if (!raw) return '/';
        var p = raw.trim();

        // Strip hash symbol
        if (p.startsWith('#')) p = p.substring(1);

        // Strip origin if full URL
        try {
          if (p.startsWith('http://') || p.startsWith('https://')) {
            var url = new URL(p);
            p = url.pathname;
          }
        } catch (e) {}

        // Strip base path prefix if present
        if (basePath && p.startsWith(basePath)) {
          p = p.substring(basePath.length);
        }

        // Generic prefix stripper for /preview/:slug or /s/:slug
        var prefixMatch = p.match(/^\\/(preview|s|sites|site)\\/[^\\/]+(.*)$/);
        if (prefixMatch) {
          p = prefixMatch[2] || '/';
        }

        // Clean query strings or internal hashes
        p = p.split('?')[0].split('#')[0];

        // Ensure leading slash
        if (!p.startsWith('/')) p = '/' + p;

        // Remove trailing slash unless root
        if (p.length > 1 && p.endsWith('/')) {
          p = p.substring(0, p.length - 1);
        }

        return p || '/';
      }

      // 3. Router state
      var routerState = {
        basePath: basePath,
        currentRoute: '/',
        historyStack: [],
      };

      // 4. Dynamic Page Generator (for routes like /menu/food, /menu/drinks, /about, /contact)
      function getDynamicPageContent(route) {
        var norm = cleanPath(route);
        var title = document.title.split(' - ')[0] || '${siteTitle}';

        if (norm === '/menu' || norm === '/menu/food' || norm === '/menu/drinks' || norm.startsWith('/menu')) {
          var isDrinks = norm.includes('drinks') || norm.includes('beverage');
          var isFood = norm.includes('food') || (!isDrinks);
          var subTitle = isDrinks ? 'قائمة المشروبات والعصائر المنعشة' : 'قائمة المأكولات والأطباق الخاصة';
          var breadcrumb = isDrinks ? 'المشروبات' : (isFood ? 'المأكولات' : 'القائمة');

          var itemsHtml = '';
          if (isDrinks) {
            itemsHtml = \`
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div class="aspect-4/3 rounded-xl overflow-hidden mb-4 bg-slate-100">
                    <img src="https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80" alt="قهوة مختصة" class="w-full h-full object-cover">
                  </div>
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-black text-slate-900 text-base">قهوة مختصة V60</h4>
                    <span class="font-black text-emerald-600 text-sm">4,500 د.ع</span>
                  </div>
                  <p class="text-xs text-slate-500 mb-4 leading-relaxed">محصول إثيوبي طازج مع إيحاءات التوت والفواكه المجففة.</p>
                  <button onclick="showToast('تمت إضافة قهوة V60 إلى طلبك'); if (typeof addToCart==='function') addToCart('قهوة V60', '4,500 د.ع');" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer">أضف للطلب</button>
                </div>
                <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div class="aspect-4/3 rounded-xl overflow-hidden mb-4 bg-slate-100">
                    <img src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80" alt="عصير برتقال طبيعي" class="w-full h-full object-cover">
                  </div>
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-black text-slate-900 text-base">عصير برتقال وجزر طازج</h4>
                    <span class="font-black text-emerald-600 text-sm">3,500 د.ع</span>
                  </div>
                  <p class="text-xs text-slate-500 mb-4 leading-relaxed">عصير طبيعي 100% معصور على البارد بدون سكر مضاف.</p>
                  <button onclick="showToast('تمت إضافة العصير الطبيعي إلى طلبك'); if (typeof addToCart==='function') addToCart('عصير برتقال وجزر', '3,500 د.ع');" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer">أضف للطلب</button>
                </div>
                <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div class="aspect-4/3 rounded-xl overflow-hidden mb-4 bg-slate-100">
                    <img src="https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80" alt="شاي مهيل أصيل" class="w-full h-full object-cover">
                  </div>
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-black text-slate-900 text-base">شاي عراقي مهيّل على الفحم</h4>
                    <span class="font-black text-emerald-600 text-sm">2,000 د.ع</span>
                  </div>
                  <p class="text-xs text-slate-500 mb-4 leading-relaxed">شاي سيلاني فاخر مخمّر على الجمر برائحة الهيل البغدادي الأصيل.</p>
                  <button onclick="showToast('تمت إضافة الشاي المهيل إلى طلبك'); if (typeof addToCart==='function') addToCart('شاي عراقي مهيل', '2,000 د.ع');" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer">أضف للطلب</button>
                </div>
              </div>\`;
          } else {
            itemsHtml = \`
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div class="aspect-4/3 rounded-xl overflow-hidden mb-4 bg-slate-100">
                    <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80" alt="مشاوي مشكلة فاخرة" class="w-full h-full object-cover">
                  </div>
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-black text-slate-900 text-base">صينية مشاوي مشكلة ملكية</h4>
                    <span class="font-black text-emerald-600 text-sm">22,000 د.ع</span>
                  </div>
                  <p class="text-xs text-slate-500 mb-4 leading-relaxed">كباب غنم بلدي، تكة لحم، شيش طاووق مع الخبز الحار والمقبلات.</p>
                  <button onclick="showToast('تمت إضافة صينية المشاوي إلى طلبك'); if (typeof addToCart==='function') addToCart('صينية مشاوي مشكلة', '22,000 د.ع');" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer">أضف للطلب</button>
                </div>
                <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div class="aspect-4/3 rounded-xl overflow-hidden mb-4 bg-slate-100">
                    <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80" alt="وجبة كباب عراقي" class="w-full h-full object-cover">
                  </div>
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-black text-slate-900 text-base">كباب لحم عراقي أصيل</h4>
                    <span class="font-black text-emerald-600 text-sm">14,000 د.ع</span>
                  </div>
                  <p class="text-xs text-slate-500 mb-4 leading-relaxed">أسياخ كباب متبلة بالبهارات الخاصة ومشوية على الجمر الطبيعي.</p>
                  <button onclick="showToast('تمت إضافة الكباب إلى طلبك'); if (typeof addToCart==='function') addToCart('كباب لحم عراقي', '14,000 د.ع');" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer">أضف للطلب</button>
                </div>
                <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div class="aspect-4/3 rounded-xl overflow-hidden mb-4 bg-slate-100">
                    <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80" alt="مقبلات وسلطات" class="w-full h-full object-cover">
                  </div>
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-black text-slate-900 text-base">تشكيلة مقبلات شرقية فاخرة</h4>
                    <span class="font-black text-emerald-600 text-sm">6,000 د.ع</span>
                  </div>
                  <p class="text-xs text-slate-500 mb-4 leading-relaxed">حمص بطحينة، متبل باذنجان، تبولة لبنانية، بابا غنوج وزيت زيتون بكر.</p>
                  <button onclick="showToast('تمت إضافة المقبلات إلى طلبك'); if (typeof addToCart==='function') addToCart('تشكيلة مقبلات شرقية', '6,000 د.ع');" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer">أضف للطلب</button>
                </div>
              </div>\`;
          }

          return \`
            <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
              <!-- Breadcrumbs -->
              <nav class="flex items-center gap-2 text-xs font-bold text-slate-500">
                <a href="/" class="hover:text-slate-900 transition-colors">الرئيسية</a>
                <span>/</span>
                <a href="/menu" class="hover:text-slate-900 transition-colors">قائمة الطعام</a>
                <span>/</span>
                <span class="text-emerald-600">\${breadcrumb}</span>
              </nav>

              <!-- Header banner -->
              <div class="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div class="space-y-3 text-center md:text-right">
                  <span class="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">تصنيف معتمد</span>
                  <h1 class="text-2xl sm:text-4xl font-black tracking-tight">\${subTitle}</h1>
                  <p class="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">نختار أجود المكونات الطازجة يومياً لنقدم لكم تجربة ضيافة استثنائية لا تُنسى.</p>
                </div>
                <!-- Sub tabs -->
                <div class="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
                  <a href="/menu/food" class="px-5 py-2.5 rounded-xl text-xs font-bold transition-all \${isFood ? 'bg-white text-slate-900 shadow-md' : 'text-white hover:bg-white/10'}">المأكولات</a>
                  <a href="/menu/drinks" class="px-5 py-2.5 rounded-xl text-xs font-bold transition-all \${isDrinks ? 'bg-white text-slate-900 shadow-md' : 'text-white hover:bg-white/10'}">المشروبات</a>
                </div>
              </div>

              <!-- Items list -->
              \${itemsHtml}

              <!-- Bottom CTA -->
              <div class="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-right">
                  <h4 class="font-bold text-slate-900 text-sm">هل تود حجز طاولة خاصة أو مناسبة عائلية؟</h4>
                  <p class="text-xs text-slate-600">يمكنك حجز طاولتك مسبقاً مع اختيار الجلسة والخدمات الإضافية.</p>
                </div>
                <div class="flex items-center gap-3">
                  <a href="/contact" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer">احجز طاولة الآن</a>
                  <a href="/" class="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer">العودة للرئيسية</a>
                </div>
              </div>
            </div>\`;
        }

        if (norm === '/about') {
          return \`
            <div class="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
              <nav class="flex items-center gap-2 text-xs font-bold text-slate-500">
                <a href="/" class="hover:text-slate-900 transition-colors">الرئيسية</a>
                <span>/</span>
                <span class="text-emerald-600">من نحن</span>
              </nav>

              <div class="text-center space-y-4 max-w-3xl mx-auto">
                <span class="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">قصتنا وعراقة هويتنا</span>
                <h1 class="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">شغف بالتميز وعطاء لا ينقطع في خدمة مجتمعنا</h1>
                <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
                  انطلقنا برؤية طموحة لتقديم أعلى معايير الجودة والمذاق الأصيل، واضعين رضا عملائنا وتجربتهم الفريدة في صميم كل تفصيل نقدمه.
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-right space-y-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">01</div>
                  <h3 class="font-bold text-slate-900 text-base">الجودة والمصدر</h3>
                  <p class="text-xs text-slate-500 leading-relaxed">اعتماد حصري على خامات طازجة ومعايير نظافة وتحضير صارمة تحت إشراف طهاة وخبراء معتمدين.</p>
                </div>
                <div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-right space-y-3">
                  <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">02</div>
                  <h3 class="font-bold text-slate-900 text-base">كرم الضيافة</h3>
                  <p class="text-xs text-slate-500 leading-relaxed">نعتبر كل ضيف فرداً من عائلتنا الكبيرة، ونحرص على توفير أجواء دافئة ومريحة لكل زيارة.</p>
                </div>
                <div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-right space-y-3">
                  <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">03</div>
                  <h3 class="font-bold text-slate-900 text-base">التطوير المستمر</h3>
                  <p class="text-xs text-slate-500 leading-relaxed">نبتكر في تقديم خدماتنا ونطور قوائمنا باستمرار لنواكب تطلعات عملائنا ونفوق توقعاتهم.</p>
                </div>
              </div>

              <div class="text-center pt-8">
                <a href="/" class="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-md cursor-pointer">العودة للصفحة الرئيسية</a>
              </div>
            </div>\`;
        }

        if (norm === '/contact') {
          return \`
            <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
              <nav class="flex items-center gap-2 text-xs font-bold text-slate-500">
                <a href="/" class="hover:text-slate-900 transition-colors">الرئيسية</a>
                <span>/</span>
                <span class="text-emerald-600">تواصل معنا</span>
              </nav>

              <div class="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-8 text-right">
                <div class="space-y-3">
                  <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">خدمة العملاء والحجوزات</span>
                  <h1 class="text-2xl sm:text-4xl font-black text-slate-900">يسعدنا تواصلكم واستقبال طلباتكم</h1>
                  <p class="text-xs sm:text-sm text-slate-500">فريقنا متواجد على مدار الساعة للرد على استفساراتكم وترتيب حجوزاتكم الخاصة.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span class="text-xs font-bold text-slate-500">الاتصال المباشر والواتساب</span>
                    <p class="font-black text-slate-900 text-base" dir="ltr">+964 770 123 4567</p>
                    <p class="text-[11px] text-emerald-600 font-bold">متاح يومياً من 10:00 ص إلى 12:00 م</p>
                  </div>
                  <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span class="text-xs font-bold text-slate-500">العنوان والموقع</span>
                    <p class="font-black text-slate-900 text-base">الفرع الرئيسي - شارع الكرادة، بغداد</p>
                    <p class="text-[11px] text-slate-500">تتوفر مواقف سيارات خاصة ومجانية لضيوفنا</p>
                  </div>
                </div>

                <form onsubmit="handleUniversalForm(event)" class="space-y-4 pt-4 border-t border-slate-100">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل</label>
                      <input id="contact-name" type="text" required placeholder="مثال: أحمد علي" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف</label>
                      <input type="tel" required placeholder="07XXXXXXXXX" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" dir="ltr">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">نوع الطلب أو رسالتك</label>
                    <textarea rows="3" required placeholder="أدخل تفاصيل الحجز أو استفسارك هنا..." class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
                  </div>
                  <button type="submit" class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer">إرسال الطلب الآن</button>
                </form>

                <div class="text-center pt-2">
                  <a href="/" class="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">← العودة للصفحة الرئيسية</a>
                </div>
              </div>
            </div>\`;
        }

        // Generic dynamic fallback
        var cleanTitle = norm.replace(/^\\//, '').replace(/\\//g, ' / ');
        return \`
          <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center space-y-6">
            <nav class="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
              <a href="/" class="hover:text-slate-900 transition-colors">الرئيسية</a>
              <span>/</span>
              <span class="text-emerald-600">\${cleanTitle}</span>
            </nav>
            <h1 class="text-3xl font-black text-slate-900">\${cleanTitle}</h1>
            <p class="text-slate-600 text-sm max-w-lg mx-auto">أهلاً بك في قسم \${cleanTitle}. يمكنك استعراض كافة التفاصيل ومتابعة التحديثات الحية مباشرة.</p>
            <div>
              <a href="/" class="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer">العودة للرئيسية</a>
            </div>
          </div>\`;
      }

      // 5. Main Route Renderer
      function renderRoute(targetPath) {
        var path = cleanPath(targetPath);
        routerState.currentRoute = path;

        // Ensure dynamic container exists in DOM
        var dynamicContainer = document.getElementById('sawwiha-dynamic-page-view');
        if (!dynamicContainer) {
          dynamicContainer = document.createElement('div');
          dynamicContainer.id = 'sawwiha-dynamic-page-view';
          dynamicContainer.className = 'w-full min-h-[60vh] hidden transition-all duration-200';
          var mainEl = document.querySelector('main') || document.body;
          mainEl.parentNode.insertBefore(dynamicContainer, mainEl);
        }

        var mainContent = document.querySelector('main');
        var pages = document.querySelectorAll('.page-view');
        var matched = false;

        // A. Check for explicit .page-view elements matching route
        if (pages.length > 0) {
          pages.forEach(function(p) {
            var r = cleanPath(p.getAttribute('data-route') || p.getAttribute('data-page') || '/');
            if (r === path) {
              p.classList.remove('hidden');
              matched = true;
            } else {
              p.classList.add('hidden');
            }
          });
          if (matched) {
            if (dynamicContainer) dynamicContainer.classList.add('hidden');
            if (mainContent) mainContent.classList.remove('hidden');
          }
        }

        // B. Handle Root / Home
        if (path === '/') {
          if (dynamicContainer) dynamicContainer.classList.add('hidden');
          if (mainContent) mainContent.classList.remove('hidden');
          if (pages.length > 0 && !matched) {
            pages.forEach(function(p) {
              var r = cleanPath(p.getAttribute('data-route') || '/');
              if (r === '/' || p.id === 'page-home') {
                p.classList.remove('hidden');
              } else {
                p.classList.add('hidden');
              }
            });
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
          updateNavLinks(path);
          notifyParent(path);
          return;
        }

        // C. Check for in-page matching section (e.g. #menu, #contact, #about, #interactive-tool)
        var sectionCandidates = [];
        var cleanSlug = path.replace(/^\\//, '').replace(/\\//g, '-');
        sectionCandidates.push(cleanSlug);
        if (cleanSlug === 'menu' || cleanSlug.startsWith('menu')) {
          sectionCandidates.push('menu-section', 'catalog-section', 'interactive-tool', 'catalog');
        } else if (cleanSlug === 'contact' || cleanSlug.startsWith('contact')) {
          sectionCandidates.push('contact-section', 'booking-section', 'contact');
        } else if (cleanSlug === 'about' || cleanSlug.startsWith('about')) {
          sectionCandidates.push('about-section', 'story-section', 'sections-container', 'about');
        }

        var matchedSection = null;
        for (var i = 0; i < sectionCandidates.length; i++) {
          var el = document.getElementById(sectionCandidates[i]);
          if (el) {
            matchedSection = el;
            break;
          }
        }

        // Also check if route is dynamic category filter like /menu/food or /menu/drinks
        var isDynamicCategory = path === '/menu/food' || path === '/menu/drinks';
        var categoryFilterApplied = false;

        if (isDynamicCategory) {
          var categoryType = path.includes('drinks') ? 'drinks' : 'food';
          // Find tab buttons
          var filterButtons = document.querySelectorAll('button[data-category], .category-filter-btn, [onclick*="filterCategory"]');
          filterButtons.forEach(function(btn) {
            var cat = btn.getAttribute('data-category') || '';
            var text = (btn.textContent || '').trim();
            if (
              (categoryType === 'drinks' && (cat === 'drinks' || text.includes('مشروبات') || text.includes('عصائر'))) ||
              (categoryType === 'food' && (cat === 'food' || text.includes('مأكولات') || text.includes('طعام') || text.includes('وجبات') || text.includes('مشاوي')))
            ) {
              btn.click();
              categoryFilterApplied = true;
            }
          });
        }

        if (matchedSection && !isDynamicCategory) {
          if (dynamicContainer) dynamicContainer.classList.add('hidden');
          if (mainContent) mainContent.classList.remove('hidden');
          matchedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          updateNavLinks(path);
          notifyParent(path);
          return;
        }

        // D. Show Dedicated Dynamic Page View
        if (dynamicContainer) {
          dynamicContainer.innerHTML = getDynamicPageContent(path);
          dynamicContainer.classList.remove('hidden');
          if (mainContent) mainContent.classList.add('hidden');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        updateNavLinks(path);
        notifyParent(path);
      }

      // 6. Update Active Navigation Links
      function updateNavLinks(activePath) {
        var links = document.querySelectorAll('a[href], .nav-link');
        links.forEach(function(link) {
          var href = link.getAttribute('href') || link.getAttribute('data-route');
          if (!href) return;
          var linkClean = cleanPath(href);
          var isActive = (linkClean === activePath) ||
                         (activePath.startsWith(linkClean) && linkClean !== '/');

          if (isActive) {
            link.classList.add('text-emerald-600', 'font-black');
          } else if (link.classList.contains('nav-link')) {
            link.classList.remove('text-emerald-600', 'font-black');
          }
        });
      }

      // 7. PostMessage to Parent Window (Sawwiha Studio URL Bar updater)
      function notifyParent(path) {
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'SAWWIHA_ROUTE_CHANGED',
              route: path,
              path: path,
              title: document.title
            }, '*');
          }
        } catch (e) {}
      }

      // 8. Public navigate method
      window.navigateTo = function(targetPath, e) {
        if (e && e.preventDefault) e.preventDefault();
        var target = cleanPath(targetPath);

        // Update history / URL
        try {
          var targetUrl = target;
          if (basePath) {
            targetUrl = target === '/' ? basePath : (basePath + target);
          }
          if (window.history && window.history.pushState) {
            window.history.pushState({ sawwihaRoute: target }, '', targetUrl);
          }
        } catch (err) {
          // If in restricted sandbox / srcDoc, fall back to hash
          try {
            window.location.hash = '#' + target;
          } catch (hErr) {}
        }

        renderRoute(target);
      };

      // Export router to global namespace
      window.sawwihaRouter = {
        basePath: basePath,
        navigate: window.navigateTo,
        render: renderRoute,
        getCurrentRoute: function() { return routerState.currentRoute; }
      };

      // 9. Strict Global Capture-Phase Click Interceptor
      // Completely isolates the generated site from Sawwiha host routing!
      document.addEventListener('click', function(e) {
        var el = e.target;
        while (el && el !== document && el.tagName !== 'A') {
          el = el.parentElement;
        }
        if (!el || el.tagName !== 'A') return;

        var href = el.getAttribute('href');
        if (!href) return;

        // Skip tel, mailto, javascript, download
        if (
          href.startsWith('tel:') ||
          href.startsWith('mailto:') ||
          href.startsWith('javascript:') ||
          el.hasAttribute('download')
        ) {
          return;
        }

        // External URLs pointing to other domains
        if (href.startsWith('http://') || href.startsWith('https://')) {
          try {
            var url = new URL(href);
            // If it points to the current host origin without basePath, prevent escape to Sawwiha!
            if (url.origin === window.location.origin) {
              e.preventDefault();
              e.stopPropagation();
              var localPath = url.pathname;
              window.navigateTo(localPath);
              return;
            }
          } catch (urlErr) {}

          // Real external URL: force opening in new tab
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
          return;
        }

        // Internal relative or root-relative link (e.g. /menu, /menu/food, /about, /contact, #hero)
        e.preventDefault();
        e.stopPropagation();
        window.navigateTo(href);
      }, true);

      // 10. Form submission protection
      document.addEventListener('submit', function(e) {
        var form = e.target;
        var action = form.getAttribute('action');
        // If action points to host root or internal route, intercept
        if (!action || action === '/' || action.startsWith('/') || !action.startsWith('http')) {
          e.preventDefault();
          if (typeof handleUniversalForm === 'function') {
            handleUniversalForm(e);
          } else {
            showToast('تم استلام طلبك بنجاح! سنتواصل معك خلال دقائق.');
            try { form.reset(); } catch(rErr) {}
          }
        }
      }, true);

      // 11. Browser Back / Forward handler
      window.addEventListener('popstate', function(e) {
        var target = (e.state && e.state.sawwihaRoute) || window.location.hash || window.location.pathname;
        renderRoute(target);
      });

      window.addEventListener('hashchange', function() {
        if (window.location.hash) {
          renderRoute(window.location.hash);
        }
      });

      // 12. Listen to parent messages
      window.addEventListener('message', function(e) {
        if (!e.data) return;
        if ((e.data.type === 'NAVIGATE' || e.data.type === 'SAWWIHA_NAVIGATE_TO') && (e.data.path || e.data.route)) {
          window.navigateTo(e.data.path || e.data.route);
        } else if (e.data.type === 'SAWWIHA_NAVIGATE_HISTORY' && typeof e.data.delta === 'number') {
          try {
            window.history.go(e.data.delta);
          } catch(hErr) {}
        }
      });

      // 13. Toast Notification Helper
      window.showToast = function(message, type) {
        var existing = document.getElementById('sawwiha-toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.id = 'sawwiha-toast';
        var isSuccess = type !== 'error';
        toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-xs sm:text-sm font-bold flex items-center gap-3 transition-all duration-300 transform translate-y-4 opacity-0 ' +
          (isSuccess ? 'bg-emerald-600' : 'bg-rose-600');
        toast.innerHTML = '<span>' + (isSuccess ? '✓' : '✕') + '</span><span>' + message + '</span>';
        document.body.appendChild(toast);

        requestAnimationFrame(function() {
          toast.classList.remove('translate-y-4', 'opacity-0');
        });

        setTimeout(function() {
          toast.classList.add('opacity-0', 'translate-y-4');
          setTimeout(function() { toast.remove(); }, 300);
        }, 3500);
      };

      // 14. Initial route resolution on boot
      function initRoute() {
        var metaInitial = document.querySelector('meta[name="sawwiha-initial-route"]');
        var target = metaInitial ? metaInitial.getAttribute('content') : '';

        if (!target) {
          if (window.location.hash && window.location.hash.length > 1) {
            target = window.location.hash;
          } else {
            var raw = window.location.pathname;
            if (basePath && raw.startsWith(basePath)) {
              target = raw.substring(basePath.length);
            } else {
              target = raw;
            }
          }
        }

        renderRoute(target || '${initialRoute}');
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRoute);
      } else {
        initRoute();
      }
    })();
  </script>
  `;
}
