import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Share2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Star,
} from 'lucide-react';
import { ProjectItem } from '../types';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

interface ShowcaseGalleryViewProps {
  onOpenBuilderWithPrompt: (prompt: string) => void;
  onOpenAuthModal?: () => void;
}

const SHOWCASE_CATEGORIES = [
  'الكل',
  'صفحة هبوط',
  'متجر إلكتروني',
  'معرض أعمال وسيرة',
  'مطعم ومقهى',
  'شركة وخدمات',
  'مدونة ومحتوى',
  'فعالية ومؤتمر',
];

export const ShowcaseGalleryView: React.FC<ShowcaseGalleryViewProps> = ({
  onOpenBuilderWithPrompt,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load real approved showcase projects from Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchShowcaseProjects = async () => {
      setLoading(true);
      try {
        // Query projects where isPublished is true AND showcaseStatus is approved
        const q = query(
          collection(db, 'projects'),
          where('isPublished', '==', true),
          where('showcaseStatus', '==', 'approved')
        );

        const snapshot = await getDocs(q);
        const list: ProjectItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as ProjectItem);
        });

        // In-memory sort by featured first, then updatedAt/publishedAt descending
        list.sort((a, b) => {
          if (a.featuredInShowcase && !b.featuredInShowcase) return -1;
          if (!a.featuredInShowcase && b.featuredInShowcase) return 1;
          const timeA = a.publishedAt || a.updatedAt || a.createdAt || '';
          const timeB = b.publishedAt || b.updatedAt || b.createdAt || '';
          return timeB.localeCompare(timeA);
        });

        if (isMounted) {
          setProjects(list);
        }
      } catch (err) {
        console.warn('Showcase projects query warning:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchShowcaseProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const filteredProjects = projects.filter((p) => {
    const category = p.showcaseCategory || p.category || 'صفحة هبوط';
    const matchesCategory =
      selectedCategory === 'الكل' ||
      category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(category.toLowerCase());

    const title = p.seo?.title || p.title || '';
    const desc = p.showcaseDescription || p.seo?.description || p.description || '';
    const matchesSearch =
      !searchQuery.trim() ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans antialiased pb-20 select-none" dir="rtl">
      {/* Hero Showcase Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-16 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_60%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>معرض ومجتمع مواقع «سَوّيها»</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            استكشف مواقع حقيقية مبنية بالذكاء الاصطناعي
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            مجموعة مختارة من المواقع الإلكترونية، صفحات الهبوط، والمتاجر التي صممها وبناها مستخدمو منصة «سَوّيها». استلهم منها أو ابنِ موقعك في دقائق.
          </p>

          {/* Privacy note */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>المواقع المعروضة هنا تمت مشاركتها وموافقة أصحابها صراحة وبشكل اختياري</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Search & Category Filter Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-900/5 border border-slate-200/90 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن اسم موقع، فكرة، أو وصف..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
              />
            </div>

            {/* Results count & CTA */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <span className="text-xs font-bold text-slate-500">
                {filteredProjects.length} موقع معتمد
              </span>

              <button
                type="button"
                onClick={() => onOpenBuilderWithPrompt('')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ابنِ موقعك الآن</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {SHOWCASE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-600">جاري تحميل المواقع المعتمدة من المعرض...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                {searchQuery || selectedCategory !== 'الكل'
                  ? 'لا توجد مواقع تطابق معايير البحث الحالية'
                  : 'معرض المجتمع في انتظار أولى مشاركاتكم!'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {searchQuery || selectedCategory !== 'الكل'
                  ? 'جرّب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً من القائمة أعلاه.'
                  : 'يمكن لأي مستخدم يملك موقعاً منشوراً طلب إدراجه في المعرض عبر إعدادات المشروع وسيظهر هنا بعد مراجعته واعتماده.'}
              </p>
              <button
                type="button"
                onClick={() => onOpenBuilderWithPrompt('')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>إنشاء ونشر موقع جديد</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const cleanSlug = project.slug || project.id;
                const standaloneUrl = project.publishedUrl || `${origin}/s/${cleanSlug}`;
                const title = project.seo?.title || project.title;
                const desc = project.showcaseDescription || project.seo?.description || project.description || 'موقع مميز أُنشئ وطُوّر عبر منصة سَوّيها';
                const cat = project.showcaseCategory || project.category || 'صفحة هبوط';
                const formattedDate = project.publishedAt
                  ? new Date(project.publishedAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '';

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Visual Card Header / Preview Window */}
                    <div className="h-48 bg-slate-950 relative overflow-hidden border-b border-slate-100 flex flex-col justify-between p-4 group">
                      {/* Decorative Background Mesh */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 via-slate-900 to-slate-950 opacity-90" />

                      {/* Mock browser top bar */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          <span className="text-[10px] font-mono text-slate-400 mr-2 truncate max-w-[140px]">
                            {cleanSlug}.sawwiha.app
                          </span>
                        </div>

                        {project.featuredInShowcase && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow-xs">
                            <Star className="w-3 h-3 fill-slate-950" />
                            <span>مميّز</span>
                          </span>
                        )}
                      </div>

                      {/* Center Graphic */}
                      <div className="relative z-10 text-center my-auto">
                        <h4 className="text-white font-black text-lg tracking-tight truncate max-w-[260px] mx-auto drop-shadow-sm">
                          {title}
                        </h4>
                        <span className="text-emerald-300 text-xs font-medium mt-1 inline-block">
                          {cat}
                        </span>
                      </div>

                      {/* Bottom live overlay actions on hover */}
                      <div className="relative z-10 flex items-center justify-between pt-2">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formattedDate || 'منشور حديثاً'}</span>
                        </span>

                        <a
                          href={standaloneUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs transition-all"
                        >
                          <span>معاينة حية</span>
                          <ExternalLink className="w-3 h-3 text-emerald-600" />
                        </a>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-sm tracking-tight truncate">
                            {title}
                          </h3>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                            {cat}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {desc}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(standaloneUrl, project.id)}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="نسخ رابط الموقع"
                        >
                          {copiedId === project.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[11px]">
                            {copiedId === project.id ? 'تم النسخ' : 'مشاركة'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const prompt = `أريد موقعاً مشابهاً لـ «${title}» في مجال ${cat}: ${desc}`;
                            onOpenBuilderWithPrompt(prompt);
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                          title="بناء موقع مشابه لهذا النموذج بالذكاء الاصطناعي"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>ابنِ مماثلاً</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
