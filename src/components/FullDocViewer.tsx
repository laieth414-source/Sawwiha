import React, { useState } from 'react';
import { Search, Copy, Check, Download, BookOpen, ExternalLink } from 'lucide-react';

interface FullDocViewerProps {
  rawMarkdown: string;
  onCopy: () => void;
  copied: boolean;
}

export const FullDocViewer: React.FC<FullDocViewerProps> = ({
  rawMarkdown,
  onCopy,
  copied,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const downloadFile = () => {
    const blob = new Blob([rawMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SAWWIHA_FOUNDATION.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Split markdown into logical sections based on "### " or "## " headers
  const sections = rawMarkdown.split(/(?=^###? )/m).filter(Boolean);

  const filteredSections = searchTerm.trim()
    ? sections.filter((sec) =>
        sec.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sections;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        {/* Document Header & Search Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit mb-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>المرجع التأسيسي المعتمد — SAWWIHA_FOUNDATION.md</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              الوثيقة التأسيسية الشاملة لمنصة «سَوّيها»
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              المرحلة 0: التخطيط والتأسيس • مسار الملف: <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">/SAWWIHA_FOUNDATION.md</code>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="download-doc-md-btn"
              onClick={downloadFile}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل كملف .md</span>
            </button>

            <button
              id="copy-doc-md-btn"
              onClick={onCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تم النسخ للحافظة</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الوثيقة بالكامل</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            id="doc-search-input"
            type="text"
            placeholder="ابحث في بنود الوثيقة التأسيسية (مثال: Firestore، Netlify، الأمان، الخطط، الميزانية الصفرية)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Sections Content */}
        <div className="mt-6 space-y-6">
          {filteredSections.map((section, idx) => {
            const firstLine = section.trim().split('\n')[0].replace(/^###? /, '');
            const body = section.trim().split('\n').slice(1).join('\n');

            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                <h3 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{firstLine}</span>
                </h3>

                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap font-normal space-y-2">
                  {body}
                </div>
              </div>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              لا توجد بنود تطابق بحثك عن "{searchTerm}". جرب كلمة أخرى.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
