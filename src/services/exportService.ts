import JSZip from 'jszip';
import { ProjectItem, GitHubRepoInfo, GitHubExportOptions } from '../types';

/**
 * Generate standard clean project files for ZIP & GitHub exports
 */
export function generateProjectExportFiles(project: ProjectItem, htmlCode: string): Record<string, string> {
  const safeSlug = (project.slug || project.title || 'sawwiha-site')
    .toLowerCase()
    .replace(/[^\w-]/g, '-');

  const title = project.title || 'موقع سَوّيها';
  const description = project.description || project.originalPrompt || 'موقع أُنشئ عبر منصة سَوّيها للذكاء الاصطناعي';

  // 1. index.html
  const cleanHtml = htmlCode.trim();

  // 2. README.md
  const readmeMd = `# ${title}

${description}

---

## 🌟 تم الإنشاء بواسطة «سَوّيها» (Sawwiha AI Website Builder)
هذا المشروع تم توليده وتطويره بالذكاء الاصطناعي عبر استوديو **سَوّيها**. 
المشروع مستقل تماماً وخالٍ من أي تعقيدات أو خوادم وسيطة إجبارية.

---

## 🚀 كيفية التشغيل والمعاينة المحلية:

### الطريقة 1: التشغيل المباشر في المتصفح (الأبسط)
افتح ملف \`index.html\` مباشرة بنقرتين في أي متصفح حديث (Chrome, Edge, Safari, Firefox). 
الموقع يحتوي على كافة التنسيقات والأيقونات وسيعمل فوراً دون الحاجة لتثبيت أي برامج!

### الطريقة 2: استخدام خادم محلي خفيف
إذا كان لديك Node.js مثبت على جهازك:
\`\`\`bash
# تشغيل خادم محلي فوري
npx serve .
\`\`\`

### الطريقة 3: وضع التطوير مع Vite
\`\`\`bash
# 1. تثبيت الحزم التنموية الخفيفة
npm install

# 2. بدء الخادم المحلي
npm run dev
\`\`\`

---

## 🌐 النشر المجاني على السحابة:
يمكنك نشر هذا الموقع في ثوانٍ معدودة وبالمجان على أي من الخدمات التالية:
1. **GitHub Pages**: فعّل خاصية Pages في إعدادات مستودعك على GitHub مع اختيار الفرع \`main\`.
2. **Netlify**: اسحب مجلد المشروع وأفلته في [Netlify Drop](https://app.netlify.com/drop).
3. **Vercel**: قم بربط المستودع وسيقوم Vercel بنشره تلقائياً.
4. **Cloudflare Pages**: اربط مستودع GitHub وسيتم النشر في ثوانٍ.

---

## 🛠️ التقنيات والمكتبات المستخدمة:
* **HTML5 دلالي** فائق السرعة والتوافق.
* **Tailwind CSS** للتنسيق العصري والتجاوب مع جميع الشاشات.
* **خط IBM Plex Sans Arabic** لطباعة عربية مريحة وفائقة الوضوح.
* **أيقونات SVG نقية** مدمجة دون أي تبعيات خطوط خارجية.

---
حقوق النشر © ${new Date().getFullYear()} ${title}. صُنع بفخر بواسطة منصة سَوّيها.
`;

  // 3. package.json
  const packageJson = JSON.stringify(
    {
      name: safeSlug,
      private: true,
      version: '1.0.0',
      description: description,
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
        serve: 'npx serve .',
      },
      devDependencies: {
        vite: '^6.0.0',
      },
    },
    null,
    2
  );

  // 4. vite.config.js
  const viteConfigJs = `import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
});
`;

  // 5. .gitignore
  const gitignore = `# Dependencies
node_modules
dist
.DS_Store

# Environment variables
.env
.env.local
`;

  // 6. .env.example (Safe, never secrets)
  const envExample = `# ملف المتغيرات البيئية لموقع ${title}
# هذا الملف آمن ولا يحتوي على أي مفاتيح حساسة
VITE_SITE_TITLE="${title}"
VITE_SITE_ENV="production"
`;

  return {
    'index.html': cleanHtml,
    'README.md': readmeMd,
    'package.json': packageJson,
    'vite.config.js': viteConfigJs,
    '.gitignore': gitignore,
    '.env.example': envExample,
  };
}

/**
 * Phase 4: Generate and trigger download of standalone Project ZIP
 */
export async function downloadProjectZip(
  project: ProjectItem,
  htmlCode: string
): Promise<void> {
  const zip = new JSZip();
  const files = generateProjectExportFiles(project, htmlCode);

  // Add each file to ZIP archive
  for (const [filename, content] of Object.entries(files)) {
    zip.file(filename, content);
  }

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  // Safe file naming
  const safeFilename = `${(project.slug || project.title || 'sawwiha-project').replace(/[^\w-]/g, '-')}.zip`;

  // Trigger client download
  const downloadUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = safeFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke object URL after brief delay
  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 3000);
}

/**
 * Phase 4: Export project to a real GitHub Repository via secure server endpoint
 */
export async function exportProjectToGitHub(
  project: ProjectItem,
  htmlCode: string,
  options: GitHubExportOptions
): Promise<GitHubRepoInfo> {
  const files = generateProjectExportFiles(project, htmlCode);

  const response = await fetch('/api/github/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: options.token,
      repoName: options.repoName,
      description: options.description || project.description || `موقع ${project.title} من سَوّيها`,
      isPrivate: options.isPrivate,
      commitMessage: options.commitMessage || `تحديث ملفات موقع ${project.title} عبر منصة سَوّيها`,
      branch: options.branch || 'main',
      files,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'فشلت عملية التصدير إلى GitHub. يرجى مراجعة الصلاحيات والمحاولة ثانية.');
  }

  return {
    owner: data.owner,
    repoName: data.repoName,
    repoUrl: data.repoUrl,
    isPrivate: Boolean(data.isPrivate),
    lastExportedAt: data.lastExportedAt || new Date().toISOString(),
    defaultBranch: data.defaultBranch || 'main',
  };
}
