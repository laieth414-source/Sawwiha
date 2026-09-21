export interface StudioItemData {
  id: string;
  slug: string;
  title: string;
  price: string;
  category: string;
  categorySlug: 'food' | 'drinks';
  image: string;
  desc: string;
  ingredients: string[];
  nutrition: {
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
  };
  prepTime: string;
  badge: string;
  rating: string;
  reviewsCount: number;
}

export interface StudioSection {
  id: string;
  label: string;
  path: string;
  category?: 'section' | 'dish';
  slug?: string;
  price?: string;
}

export const AUTHENTIC_DISH_CATALOG: StudioItemData[] = [
  {
    id: 'kabab',
    slug: 'kabab',
    title: 'كباب لحم عراقي أصيل',
    price: '14,000 د.ع',
    category: 'المأكولات والأطباق',
    categorySlug: 'food',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80',
    desc: 'أسياخ كباب لحم غنم مفروم يومياً ومتبل بالخلطة البغدادية الأصيلة، يُشوى على نار الفحم الهادئة ليحتفظ بعصارته وطراوته الفائقة، يُقدم مع الخبز الحار وسلطة البيواز وصوص العمبة العراقي.',
    ingredients: ['لحم غنم بلدي مفروم', 'لية خروف طازجة', 'بصل ناعم مصفى', 'بهار كباب عراقي أصيل', 'سماق تركي', 'خبز صمون حار'],
    nutrition: { calories: '520 سعرة', protein: '34 جم', fat: '22 جم', carbs: '8 جم' },
    prepTime: '15-20 دقيقة',
    badge: 'خلطة الشيف الخاصة',
    rating: '4.9',
    reviewsCount: 240
  },
  {
    id: 'mashawi',
    slug: 'mashawi',
    title: 'صينية مشاوي مشكلة ملكية',
    price: '22,000 د.ع',
    category: 'المأكولات والأطباق',
    categorySlug: 'food',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80',
    desc: 'تشكيلة فاخرة تضم كباب لحم غنم بلدي، تكة لحم طرية، وشيش طاووق متبل بالزعفران، مشوية على الجمر الطبيعي وتقدم مع الخبز العراقي الحار، الطماطم المشوية، البصل بالسماق وسلطة البيواز.',
    ingredients: ['لحم غنم بلدي طازج', 'صدور دجاج متبلة', 'توابل بغدادية سرية', 'بصل وسماق تركي', 'خبز تنور حار', 'طماطم وفلفل مشوي'],
    nutrition: { calories: '680 سعرة', protein: '48 جم', fat: '24 جم', carbs: '14 جم' },
    prepTime: '20-25 دقيقة',
    badge: 'الأكثر طلباً',
    rating: '4.9',
    reviewsCount: 185
  },
  {
    id: 'appetizers',
    slug: 'appetizers',
    title: 'تشكيلة مقبلات شرقية فاخرة',
    price: '6,000 د.ع',
    category: 'المأكولات والأطباق',
    categorySlug: 'food',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80',
    desc: 'تشكيلة استثنائية من أشهى المقبلات الطازجة المحضرة يومياً: حمص ناعم بالطحينة وزيت الزيتون البكر، متبل باذنجان مدخن، تبولة خضراء طازجة، وبابا غنوج مع دبس الرمان.',
    ingredients: ['حمص بطحينة ممتاز', 'باذنجان مشوي مدخن', 'بقدونس وطماطم طازجة', 'زيت زيتون بكر ممتاز', 'دبس رمان طبيعي'],
    nutrition: { calories: '280 سعرة', protein: '8 جم', fat: '12 جم', carbs: '28 جم' },
    prepTime: '10 دقائق',
    badge: 'نباتي وصحي',
    rating: '4.8',
    reviewsCount: 95
  },
  {
    id: 'shish-tawook',
    slug: 'shish-tawook',
    title: 'شيش طاووق متبل بالزعفران والليمون',
    price: '13,000 د.ع',
    category: 'المأكولات والأطباق',
    categorySlug: 'food',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=900&auto=format&fit=crop&q=80',
    desc: 'مكعبات صدر دجاج طرية منقوعة في تتبيلة اللبن الزبادي والزعفران والثوم والليمون لمدة 24 ساعة، مشوية بعناية وتقدم مع البطاطا المقرمشة وصلصة الثومية الشهيرة.',
    ingredients: ['صدور دجاج طازجة', 'لبن زبادي وثوم مهروس', 'زعفران طبيعي وعصير ليمون', 'صوص ثومية غني', 'بطاطا مقلية ذهبية'],
    nutrition: { calories: '440 سعرة', protein: '42 جم', fat: '12 جم', carbs: '10 جم' },
    prepTime: '15-20 دقيقة',
    badge: 'طري وغني بالنكهة',
    rating: '4.9',
    reviewsCount: 110
  },
  {
    id: 'quzi',
    slug: 'quzi',
    title: 'قوزي لحم غنم على التمن البغدادي',
    price: '24,000 د.ع',
    category: 'المأكولات والأطباق',
    categorySlug: 'food',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80',
    desc: 'كتف لحم غنم مطهو ببطء على نار هادئة لساعات طويلة حتى يذوب تماماً، يقدم فوق أرز البسمتي المتبل بالمكسرات المحمصة والزعفران مع مرق الفاصوليا.',
    ingredients: ['لحم غنم بلدي فاخر', 'أرز بسمتي فاخر', 'لوز وكاجو محمص', 'هيل وزعفران ودارسين', 'مرق فاصوليا عراقي'],
    nutrition: { calories: '740 سعرة', protein: '52 جم', fat: '28 جم', carbs: '65 جم' },
    prepTime: '20 دقيقة',
    badge: 'ضيافة ملكية',
    rating: '5.0',
    reviewsCount: 310
  },
  {
    id: 'biryani',
    slug: 'biryani',
    title: 'برياني دجاج بغدادي أصيل بالمكسرات',
    price: '12,000 د.ع',
    category: 'المأكولات والأطباق',
    categorySlug: 'food',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900&auto=format&fit=crop&q=80',
    desc: 'أرز برياني معطر بتوابل الشرق الفاخرة مع قطع الدجاج المتبلة، والشعرية المحمرة، والبازلاء واللوز والكشمش مع مرقة الدجاج الغنية.',
    ingredients: ['دجاج محلي طازج', 'أرز برياني هندي طويل الحبة', 'شعرية محمرة ومكسرات', 'كشمش وبازلاء', 'خلطة بهارات البرياني الخاصة'],
    nutrition: { calories: '590 سعرة', protein: '38 جم', fat: '16 جم', carbs: '72 جم' },
    prepTime: '15 دقيقة',
    badge: 'نكهة أصيلة',
    rating: '4.8',
    reviewsCount: 142
  },
  {
    id: 'tea',
    slug: 'tea',
    title: 'شاي عراقي مهيّل على الفحم',
    price: '2,000 د.ع',
    category: 'المشروبات والعصائر',
    categorySlug: 'drinks',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=900&auto=format&fit=crop&q=80',
    desc: 'شاي سيلاني أسود مخمر على جمر الفحم الطبيعي، معطر بحبات الهيل البغدادي الأصيل، يقدم في استكانة شاي كلاسيكية ساخنة.',
    ingredients: ['شاي سيلاني أسود خشن فاخر', 'حبوب هيل أخضر مطحونة طازجة', 'ماء نقي مغلي على الحطب'],
    nutrition: { calories: '25 سعرة', protein: '0 جم', fat: '0 جم', carbs: '6 جم' },
    prepTime: '5 دقائق',
    badge: 'تخديرة جمر',
    rating: '5.0',
    reviewsCount: 290
  },
  {
    id: 'orange-juice',
    slug: 'orange-juice',
    title: 'عصير برتقال وجزر طازج 100%',
    price: '3,500 د.ع',
    category: 'المشروبات والعصائر',
    categorySlug: 'drinks',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=900&auto=format&fit=crop&q=80',
    desc: 'عصير طبيعي 100% معصور على البارد فور طلبك بدون إضافة سكر أو مواد حافظة، غني بفيتامين C ومضادات الأكسدة.',
    ingredients: ['برتقال بلدي طازج', 'جزر سكري معصور على البارد'],
    nutrition: { calories: '110 سعرة', protein: '2 جم', fat: '0 جم', carbs: '26 جم' },
    prepTime: '3 دقائق',
    badge: 'طبيعي 100%',
    rating: '4.8',
    reviewsCount: 64
  },
  {
    id: 'v60',
    slug: 'v60',
    title: 'قهوة مختصة V60 إثيوبية',
    price: '4,500 د.ع',
    category: 'المشروبات والعصائر',
    categorySlug: 'drinks',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=900&auto=format&fit=crop&q=80',
    desc: 'محصول إثيوبي فاخر مقطر يدوياً بأداة V60 باحترافية عالية، يتميز بإيحاءات الفواكه والتوت مع حموضة متوازنة وقوام مخملي رائع.',
    ingredients: ['بن إثيوبي أرابيكا 100% محمص طازجاً', 'ماء نقي مقطر بدرجة حرارة 92°C'],
    nutrition: { calories: '2 سعرة', protein: '0 جم', fat: '0 جم', carbs: '0.5 جم' },
    prepTime: '5 دقائق',
    badge: 'تقطير يدوي',
    rating: '4.9',
    reviewsCount: 88
  }
];

export const STUDIO_MAIN_SECTIONS: StudioSection[] = [
  { id: 'home', label: 'الرئيسية', path: '/', category: 'section' },
  { id: 'menu', label: 'قائمة الطعام', path: '/menu', category: 'section' },
  { id: 'food', label: 'المأكولات', path: '/menu/food', category: 'section' },
  { id: 'drinks', label: 'المشروبات', path: '/menu/drinks', category: 'section' },
  { id: 'about', label: 'من نحن', path: '/about', category: 'section' },
  { id: 'contact', label: 'الحجز والتواصل', path: '/contact', category: 'section' },
];

export const STUDIO_FEATURED_DISHES: StudioSection[] = [
  { id: 'dish-kabab', slug: 'kabab', label: 'كباب عراقي أصيل', path: '/menu/item/kabab', category: 'dish', price: '14,000 د.ع' },
  { id: 'dish-mashawi', slug: 'mashawi', label: 'صينية مشاوي مشكلة', path: '/menu/item/mashawi', category: 'dish', price: '22,000 د.ع' },
  { id: 'dish-appetizers', slug: 'appetizers', label: 'تشكيلة مقبلات', path: '/menu/item/appetizers', category: 'dish', price: '6,000 د.ع' },
  { id: 'dish-tea', slug: 'tea', label: 'شاي عراقي بالهيل', path: '/menu/item/tea', category: 'dish', price: '2,000 د.ع' },
];

function hashStringToNum(str: string): number {
  let hash = 0;
  if (!str) return 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function isUuid(str: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
}

/**
 * Resolves any item ID, slug, or arbitrary UUID to an authentic dish data object.
 * Under NO circumstances does this return or display a raw UUID or generic placeholder.
 */
export function resolveDishOrProduct(routeOrRawId: string): StudioItemData | null {
  if (!routeOrRawId) return null;
  const clean = routeOrRawId.split('?')[0].replace(/^#/, '');

  const isItemPath = clean.includes('/item/') ||
                     clean.includes('/dish/') ||
                     clean.includes('/product/') ||
                     isUuid(clean.replace(/^\//, ''));

  // Check if clean is directly a known slug
  const directSlugMatch = AUTHENTIC_DISH_CATALOG.find(d => d.slug === clean || d.id === clean);
  if (directSlugMatch) return directSlugMatch;

  if (!isItemPath) return null;

  const rawId = clean.split('/').pop() || '';
  const cleanId = rawId.toLowerCase().trim();

  // 1. Direct match on slug or id
  const match = AUTHENTIC_DISH_CATALOG.find(d => d.slug.toLowerCase() === cleanId || d.id.toLowerCase() === cleanId);
  if (match) return match;

  // 2. Partial match
  const partial = AUTHENTIC_DISH_CATALOG.find(d => cleanId.includes(d.slug) || cleanId.includes(d.id));
  if (partial) return partial;

  // 3. UUID or arbitrary ID deterministic mapper: NEVER display the UUID!
  const num = hashStringToNum(cleanId);
  return AUTHENTIC_DISH_CATALOG[num % AUTHENTIC_DISH_CATALOG.length];
}

/**
 * Cleans the route to prevent displaying raw UUIDs in the studio URL bar.
 */
export function getCleanDisplayRoute(route: string, activeDish: StudioItemData | null): string {
  if (!route || route === '/') return '/';
  if (activeDish) {
    return `/menu/item/${activeDish.slug}`;
  }
  const clean = route.split('?')[0];
  if (isUuid(clean.replace(/^\//, ''))) {
    const resolved = resolveDishOrProduct(clean);
    return resolved ? `/menu/item/${resolved.slug}` : '/menu';
  }
  return clean;
}
