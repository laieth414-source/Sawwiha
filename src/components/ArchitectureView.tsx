import React from 'react';
import { Database, Server, Cpu, Globe, Download, Github, Lock, Sparkles, ArrowDown, ArrowLeft } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Visual System Architecture */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-6 mb-6">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            المخطط المعماري الشامل
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">
            معمارية نظام منصة «سَوّيها» (System Architecture)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            تصميم يجمع بين الحماية الصارمة، العزل التام للكود، واستغلال البنية السحابية المجانية بكفاءة قصوى.
          </p>
        </div>

        {/* Visual Architecture Flow */}
        <div className="space-y-6">
          {/* Layer 1: Client Interfaces */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              1. طبقة واجهات المستخدم والعميل (Client Layer - React SPA)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="font-bold text-slate-900 text-sm">بوابة المنصة العامة</div>
                <div className="text-xs text-slate-500 mt-1">Landing Page + حقل الفكرة السريع + جدول المقارنة والأسعار</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="font-bold text-slate-900 text-sm">استوديو البناء التفاعلي</div>
                <div className="text-xs text-slate-500 mt-1">Sandboxed Iframe + AI Chat Modifier + مبدل الشاشات + Undo/Redo</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="font-bold text-slate-900 text-sm">لوحة تحكم المالك (Admin)</div>
                <div className="text-xs text-slate-500 mt-1">No-Code Hub + إدارة النماذج والأسعار والحدود والمستخدمين</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Layer 2: API Gateway & Security */}
          <div className="border border-emerald-200 rounded-xl p-5 bg-emerald-50/30">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. طبقة الخادم الآمن وحماية المفاتيح (Secure Express Server API)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-lg border border-emerald-100 text-xs">
                <span className="font-bold text-slate-900 block mb-1">التحقق من جلسة المستخدم</span>
                التحقق الصارم من Firebase Auth Token وتحديد الدور (RBAC) قبل أي عملية.
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-100 text-xs">
                <span className="font-bold text-slate-900 block mb-1">حماية الـ Gemini API Key</span>
                مفتاح الذكاء الاصطناعي محفوظ خادمياً بنسبة 100% ولا ينكشف للمتصفح.
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-100 text-xs">
                <span className="font-bold text-slate-900 block mb-1">محدد وتطهير الطلبات</span>
                Rate Limiter + إيقاف الطوارئ + تطهير الكود قبل إرساله للعميل.
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Layer 3: Backend Services & AI Engines */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              3. الخدمات السحابية ومحركات الذكاء الاصطناعي (Cloud Engines & Zero-Budget Stack)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <Database className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-900 text-sm">Firebase Firestore</span>
                </div>
                <div className="text-xs text-slate-600">
                  تخزين المشاريع، النسخ، الخطط، وإعدادات المنظومة مع قواعد أمان دقيقة.
                </div>
                <div className="mt-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded w-fit">
                  باقة Spark المجانية (50k قراءة/يوم)
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-slate-900 text-sm">Gemini AI Models</span>
                </div>
                <div className="text-xs text-slate-600">
                  توليد الكود عبر gemini-2.5-flash للدفق السريع أو gemini-2.5-pro للمهام المعقدة.
                </div>
                <div className="mt-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded w-fit">
                  باقة AI Studio المجانية
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <Globe className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-slate-900 text-sm">Firebase Authentication</span>
                </div>
                <div className="text-xs text-slate-600">
                  دخول آمن عبر Google OAuth والبريد مع إدارة الـ Claims والأدوار.
                </div>
                <div className="mt-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded w-fit">
                  مجاناً حتى 50,000 مستخدم/شهر
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Layer 4: Output & Deployment Engines */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              4. قنوات الإخراج والنشر والتصدير (Delivery & Export Channels)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                <Globe className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <div className="font-bold text-slate-900 text-xs">نشر فوري مجاني</div>
                <div className="text-[11px] text-slate-500 mt-0.5">sawwiha.app/sites/:slug</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                <Github className="w-5 h-5 text-slate-900 mx-auto mb-1" />
                <div className="font-bold text-slate-900 text-xs">تصدير إلى GitHub</div>
                <div className="text-[11px] text-slate-500 mt-0.5">مستودع كامل بضغطة زر</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                <Download className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="font-bold text-slate-900 text-xs">تحميل ملف ZIP</div>
                <div className="text-[11px] text-slate-500 mt-0.5">كود مستقل يعمل محلياً</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                <Sparkles className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                <div className="font-bold text-slate-900 text-xs">نشر سحابي Netlify</div>
                <div className="text-[11px] text-slate-500 mt-0.5">استضافة مجانية عالية الأداء</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zero Budget Strategy Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full w-fit mb-3">
          <span>استراتيجية التكلفة الصفرية (Zero-Budget Architecture)</span>
        </div>
        <h3 className="text-xl font-bold mb-2">
          كيف تعمل «سَوّيها» بدون افتراض أي ميزانية أو واجهات برمجة مدفوعة؟
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          صُممت المعمارية لتعمل على الباقات المجانية السخية للشركات الرائدة دون أن يتكبد صاحب المشروع أي دولار واحد خلال مراحل التأسيس والانطلاق:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <span className="font-bold text-emerald-400 block text-sm mb-1">ذكاء اصطناعي مجاني</span>
            استخدام حصص Google AI Studio المجانية لنماذج Gemini 2.5 Flash السريعة ذات الـ 1M Token Context.
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <span className="font-bold text-emerald-400 block text-sm mb-1">بيانات وتوثيق مجاني</span>
            باقة Firebase Spark التي تمنح 50,000 مستخدم و50 ألف قراءة يومياً دون أي رسوم بطاقة ائتمانية.
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <span className="font-bold text-emerald-400 block text-sm mb-1">ضغط ZIP محلي بالمتصفح</span>
            توليد وتنزيل ملفات الـ ZIP في جهاز العميل مباشرة لتوفير تكلفة وسعة الخوادم السحابية.
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <span className="font-bold text-emerald-400 block text-sm mb-1">استضافات مجانية للمواقع</span>
            استغلال استضافة sawwiha المباشرة مع تكامل Netlify المجاني لتقديم 100GB شهرياً لكل مستخدم.
          </div>
        </div>
      </div>
    </div>
  );
};
