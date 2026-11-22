/**
 * Ingest curtain photos into Supabase Storage and seed the catalogue with them.
 *
 *   pnpm assets:ingest                 # scrape the fanpage, upload, seed missing rows
 *   pnpm assets:ingest --dry-run       # show what would happen, change nothing
 *   pnpm assets:ingest --force         # also overwrite rows this script seeded before
 *   pnpm assets:ingest --skip-facebook # stock photos only
 *   pnpm assets:ingest --page <url>    # another Facebook page
 *
 * What it does:
 *  1. Downloads the public photos of the Facebook fanpage (no login, no API key). Facebook sometimes answers with
 *     its login wall or rate limits; that is not an error here, the script just continues with what it got.
 *  2. Downloads curated, free-to-use stock photos (Unsplash licence) for the product types the fanpage has no
 *     photo of, and as a fallback when the fanpage could not be read.
 *  3. Normalises every image (EXIF rotation, longest edge 2000 px, JPEG) and uploads it to the bucket named by
 *     NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET with the service role key. Object names are deterministic, so running
 *     the script again replaces the same objects instead of piling up copies.
 *  4. Seeds `products`, `lookbooks` and `blog_posts` with the public URLs. Rows that already exist are left alone
 *     (only an empty image is filled in) unless `--force` is passed, so edits made in the admin are not lost.
 *
 * Each row gets its own copy of an image: deleting a photo from one product in the admin never breaks another row.
 */
import { readFileSync } from 'node:fs';

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);

const DRY_RUN = flag('dry-run');
const FORCE = flag('force');
const SKIP_FACEBOOK = flag('skip-facebook');
const FACEBOOK_PAGE = (option('page') ?? 'https://www.facebook.com/ManRemThuyHuongcaocap').replace(/\/$/, '');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !BUCKET) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET (see .env.example).'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MAX_EDGE = 2000;
/** Smaller than this on its short side is an avatar, a thumbnail or a banner, not an installation photo. */
const MIN_SHORT_EDGE = 600;
/** Below this many fanpage photos, the lookbook is topped up with stock interiors. */
const MIN_LOOKBOOK_PHOTOS = 6;
const REQUEST_TIMEOUT_MS = 30_000;

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

const log = (message: string) => console.log(message);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* -------------------------------------------------------------------------- */
/*                               Seed catalogue                               */
/* -------------------------------------------------------------------------- */

/**
 * Image sources. `fb:<key>` is a fanpage photo, identified by the stable part of its file name (the signed URL
 * around it changes on every request). `stock:<id>` is an Unsplash photo id. A source that cannot be downloaded is
 * skipped; a row left without any image falls back to the stock photos of its category.
 */
type Source = `fb:${string}` | `stock:${string}`;

const FB = {
  twoLayerWide: 'fb:901504590_122127808617305859_3432364305606185824',
  twoLayerWithZebra: 'fb:901680792_122127808785305859_5899842018466017425',
  twoLayerCorner: 'fb:902158660_122127808701305859_519763955874931158',
  waveLivingRoom: 'fb:899530998_122127808743305859_1538663333097955733',
  waveWall: 'fb:901214716_122127808575305859_8538982787345008524',
  woodenBlind: 'fb:903058596_122127808659305859_5960260325936075451',
  woodenHouseDoor: 'fb:736188357_122111911041305859_4391016787106912064',
  woodenHouseLiving: 'fb:736396823_122111910975305859_6622636048790344853',
  woodenHouseDivider: 'fb:736235907_122111910939305859_5845608900424503001',
} as const satisfies Record<string, Source>;

/** Unsplash photos (https://unsplash.com/license: free for commercial use, no attribution required). */
const STOCK = {
  linenWindow: 'stock:1697896254034-393521f6fd6f',
  linenDrape: 'stock:1578500467296-441a11d5d55a',
  linenPlant: 'stock:1689155627959-03a8e553ef33',
  sheerRoom: 'stock:1528822855841-e8bf3134cdc9',
  sheerSofa: 'stock:1753791913941-efa7de4e1b5c',
  sheerWindow: 'stock:1574197635162-68e4b468e4e9',
  rollerBay: 'stock:1535126320463-c5c1b26b3e66',
  rollerShade: 'stock:1763334698952-61377030722e',
  zebraWindow: 'stock:1773101883549-b38539e8badb',
  zebraKitchen: 'stock:1659949294512-95abb6aebf6c',
  zebraClose: 'stock:1788804277068-1281069a25af',
  woodenPlant: 'stock:1609534117141-ff9f20450902',
  woodenSlats: 'stock:1641481001093-592dd889b1af',
  woodenWarm: 'stock:1622605058034-5cbf25d135de',
  tapeMeasure: 'stock:1716698288217-2a2b6c042a2c',
  fabricStack: 'stock:1524404794194-16bae22718c0',
  livingRoom: 'stock:1667584523543-d1d9cc828a15',
} as const satisfies Record<string, Source>;

type CategorySlug = 'rem-vai' | 'rem-cuon' | 'rem-cau-vong' | 'rem-go';

const CATEGORY_FALLBACK: Record<CategorySlug, Source[]> = {
  'rem-vai': [STOCK.linenWindow, STOCK.linenDrape],
  'rem-cuon': [STOCK.rollerBay, STOCK.rollerShade],
  'rem-cau-vong': [STOCK.zebraWindow, STOCK.zebraKitchen],
  'rem-go': [STOCK.woodenPlant, STOCK.woodenSlats],
};

const PLEATS = [
  { id: 'song', label: 'Định hình sóng', multiplier: 1 },
  { id: 'ly-chup', label: 'Ly chụp', multiplier: 1.1 },
  { id: 'khoen-ore', label: 'Khoen ore', multiplier: 0.95 },
];
const TRACK_MOTORS = [
  { id: 'ray-tieu-chuan', label: 'Động cơ ray tiêu chuẩn', price: 3_200_000 },
  { id: 'ray-thong-minh', label: 'Động cơ ray thông minh (app, giọng nói)', price: 4_900_000 },
];
const TUBE_MOTORS = [{ id: 'ong-cuon', label: 'Động cơ ống cuốn + điều khiển', price: 1_900_000 }];

interface ISeedProduct {
  slug: string;
  title: string;
  category: CategorySlug;
  description: string;
  base_price: number;
  pricing_type: 'linear_meter' | 'square_meter';
  pleat_options: { id: string; label: string; multiplier: number }[];
  fabric_options: { id: string; label: string; color: string; price_delta: number }[];
  motor_options: { id: string; label: string; price: number }[];
  images: Source[];
}

/** Listed newest first: the first product is the first card on the home page. Prices are starting points to edit. */
const PRODUCTS: ISeedProduct[] = [
  {
    slug: 'rem-vai-hai-lop-chong-nang-voan',
    title: 'Rèm vải hai lớp chống nắng & voan',
    category: 'rem-vai',
    description:
      'Bộ rèm hai lớp cho cửa kính lớn: lớp vải dày cản nắng, giữ riêng tư vào buổi tối và lớp voan trắng lấy sáng dịu vào ban ngày.\n\nMay đo theo kích thước từng ô cửa, kèm thanh ray đôi và dây buộc. Phù hợp phòng khách, phòng ngủ hướng nắng.',
    base_price: 520_000,
    pricing_type: 'linear_meter',
    pleat_options: PLEATS,
    fabric_options: [
      { id: 'be-kem', label: 'Be kem', color: '#cdb892', price_delta: 0 },
      { id: 'nau-taupe', label: 'Nâu taupe', color: '#8b7b6b', price_delta: 0 },
      { id: 'xam-ghi', label: 'Xám ghi', color: '#9a9a98', price_delta: 30_000 },
    ],
    motor_options: TRACK_MOTORS,
    images: [FB.twoLayerWide, FB.twoLayerWithZebra, FB.twoLayerCorner],
  },
  {
    slug: 'rem-vai-chong-nang-dinh-hinh-song',
    title: 'Rèm vải chống nắng định hình sóng',
    category: 'rem-vai',
    description:
      'Rèm một lớp định hình sóng đều từ trần xuống sàn, cản sáng tốt và che kín cả mảng tường kính.\n\nVải dày, đứng form, ít bám bụi. Ray âm trần hoặc ray nổi tùy hiện trạng.',
    base_price: 450_000,
    pricing_type: 'linear_meter',
    pleat_options: PLEATS,
    fabric_options: [
      { id: 'nau-taupe', label: 'Nâu taupe', color: '#8b7b6b', price_delta: 0 },
      { id: 'be-cat', label: 'Be cát', color: '#c8b08a', price_delta: 0 },
      { id: 'xam-dam', label: 'Xám đậm', color: '#5f6368', price_delta: 40_000 },
    ],
    motor_options: TRACK_MOTORS,
    images: [FB.waveWall, FB.waveLivingRoom],
  },
  {
    slug: 'rem-vai-linen-tu-nhien',
    title: 'Rèm vải linen tự nhiên',
    category: 'rem-vai',
    description:
      'Chất linen mộc, bề mặt sợi tự nhiên, lọc sáng nhẹ và thoáng khí. Hợp với không gian tối giản, nhiều ánh sáng.\n\nCó thể may thêm lớp lót cản sáng khi cần.',
    base_price: 580_000,
    pricing_type: 'linear_meter',
    pleat_options: PLEATS,
    fabric_options: [
      { id: 'trang-nga', label: 'Trắng ngà', color: '#efe9dc', price_delta: 0 },
      { id: 'be-moc', label: 'Be mộc', color: '#d9cbb0', price_delta: 0 },
      { id: 'xam-khoi', label: 'Xám khói', color: '#a8a8a3', price_delta: 50_000 },
    ],
    motor_options: TRACK_MOTORS,
    images: [STOCK.linenWindow, STOCK.linenDrape, STOCK.linenPlant],
  },
  {
    slug: 'rem-voan-trang-lay-sang',
    title: 'Rèm voan trắng lấy sáng',
    category: 'rem-vai',
    description:
      'Lớp voan mỏng giữ ánh sáng tự nhiên, che bớt tầm nhìn từ bên ngoài. Dùng riêng hoặc kết hợp với lớp rèm chống nắng.',
    base_price: 320_000,
    pricing_type: 'linear_meter',
    pleat_options: PLEATS,
    fabric_options: [
      { id: 'trang', label: 'Trắng tinh', color: '#fbfbf9', price_delta: 0 },
      { id: 'kem', label: 'Trắng kem', color: '#f3ecdc', price_delta: 0 },
    ],
    motor_options: TRACK_MOTORS,
    images: [STOCK.sheerRoom, STOCK.sheerSofa, STOCK.sheerWindow],
  },
  {
    slug: 'rem-cuon-chong-nang',
    title: 'Rèm cuốn chống nắng',
    category: 'rem-cuon',
    description:
      'Rèm cuốn gọn, dễ lau chùi, phù hợp văn phòng, bếp và phòng làm việc. Có loại cản sáng hoàn toàn và loại lưới lọc sáng.',
    base_price: 380_000,
    pricing_type: 'square_meter',
    pleat_options: [],
    fabric_options: [
      { id: 'trang-sua', label: 'Trắng sữa', color: '#f4f1ea', price_delta: 0 },
      { id: 'xam-nhat', label: 'Xám nhạt', color: '#c9c9c6', price_delta: 0 },
      { id: 'can-sang', label: 'Be, cản sáng 100%', color: '#d6c7ab', price_delta: 60_000 },
    ],
    motor_options: TUBE_MOTORS,
    images: [STOCK.rollerBay, STOCK.rollerShade],
  },
  {
    slug: 'rem-cau-vong-han-quoc',
    title: 'Rèm cầu vồng Hàn Quốc',
    category: 'rem-cau-vong',
    description:
      'Hai lớp vải sọc xen kẽ, kéo lệch để chỉnh lượng sáng mà không cần cuốn hết rèm lên. Gọn cho cửa sổ phòng ngủ, phòng làm việc.',
    base_price: 520_000,
    pricing_type: 'square_meter',
    pleat_options: [],
    fabric_options: [
      { id: 'trang', label: 'Trắng', color: '#f5f5f2', price_delta: 0 },
      { id: 'be', label: 'Be', color: '#d8c9ae', price_delta: 0 },
      { id: 'nau-go', label: 'Nâu vân gỗ', color: '#8a6d4f', price_delta: 80_000 },
    ],
    motor_options: TUBE_MOTORS,
    images: [STOCK.zebraWindow, STOCK.zebraKitchen, STOCK.zebraClose],
  },
  {
    slug: 'rem-go-tu-nhien',
    title: 'Rèm gỗ tự nhiên',
    category: 'rem-go',
    description:
      'Lá gỗ tự nhiên xoay được để chỉnh hướng sáng, bền và ấm. Hợp cửa sổ phòng khách, phòng làm việc, nhà có nội thất gỗ.',
    base_price: 850_000,
    pricing_type: 'square_meter',
    pleat_options: [],
    fabric_options: [
      { id: 'nau-oc-cho', label: 'Nâu óc chó', color: '#6b4a32', price_delta: 0 },
      { id: 'vang-soi', label: 'Vàng sồi', color: '#b88a55', price_delta: 0 },
      { id: 'trang', label: 'Sơn trắng', color: '#f2efe8', price_delta: 50_000 },
    ],
    motor_options: TUBE_MOTORS,
    images: [FB.woodenBlind, STOCK.woodenPlant, STOCK.woodenSlats, STOCK.woodenWarm],
  },
];

interface ISeedLookbook {
  title: string;
  description: string;
  /** Gallery filter. Photos without one are listed under "Other". */
  category?: CategorySlug;
  /** Slugs of the products shown in the photo. */
  products: string[];
}

/** Captions for the fanpage photos known today. Newer photos get a generic caption (see `GENERIC_LOOKBOOK`). */
const LOOKBOOKS: Record<string, ISeedLookbook> = {
  [FB.twoLayerWide]: {
    title: 'Rèm hai lớp cho cửa kính phòng khách',
    description: 'Lớp vải chống nắng màu be kết hợp voan trắng, buộc dây hai bên. Thi công tại Đà Nẵng.',
    category: 'rem-vai',
    products: ['rem-vai-hai-lop-chong-nang-voan', 'rem-voan-trang-lay-sang'],
  },
  [FB.waveLivingRoom]: {
    title: 'Rèm định hình sóng cho phòng khách',
    description: 'Rèm chống nắng màu nâu taupe chạy kín mảng tường, ray âm trần.',
    category: 'rem-vai',
    products: ['rem-vai-chong-nang-dinh-hinh-song'],
  },
  [FB.woodenBlind]: {
    title: 'Rèm gỗ cho cửa sổ, rèm vải cho cửa lớn',
    description: 'Cùng một phòng khách: rèm gỗ ở cửa sổ và rèm vải định hình sóng ở cửa kính lớn.',
    category: 'rem-go',
    products: ['rem-go-tu-nhien', 'rem-vai-chong-nang-dinh-hinh-song'],
  },
  [FB.twoLayerWithZebra]: {
    title: 'Phối rèm vải hai lớp với rèm cầu vồng',
    description: 'Cửa lớn dùng rèm vải hai lớp, cửa sổ nhỏ dùng rèm cầu vồng cùng tông màu.',
    category: 'rem-cau-vong',
    products: ['rem-vai-hai-lop-chong-nang-voan', 'rem-cau-vong-han-quoc'],
  },
  [FB.waveWall]: {
    title: 'Rèm sóng phủ kín mảng tường',
    description: 'Vải dày đứng form, sóng đều từ trần xuống sàn.',
    category: 'rem-vai',
    products: ['rem-vai-chong-nang-dinh-hinh-song'],
  },
  [FB.twoLayerCorner]: {
    title: 'Rèm hai lớp cho cửa sổ góc phòng',
    description: 'Rèm vải và voan may đo cho ô cửa hẹp cạnh cột.',
    category: 'rem-vai',
    products: ['rem-vai-hai-lop-chong-nang-voan'],
  },
  [FB.woodenHouseLiving]: {
    title: 'Rèm cửa cho phòng khách nhà gỗ',
    description: 'Rèm kẻ sọc lấy sáng cho gian phòng khách nội thất gỗ truyền thống.',
    category: 'rem-vai',
    products: [],
  },
  [FB.woodenHouseDoor]: {
    title: 'Rèm cửa đi cho nhà gỗ truyền thống',
    description: 'Rèm vén hai bên cho lối đi giữa các gian.',
    category: 'rem-vai',
    products: [],
  },
  [FB.woodenHouseDivider]: {
    title: 'Rèm ngăn phòng cho nhà gỗ',
    description: 'Rèm kẻ sọc vén hai bên, ngăn giữa phòng khách và gian sau.',
    category: 'rem-vai',
    products: [],
  },
};

const FANPAGE_DESCRIPTION = 'Hình ảnh thi công thực tế của Màn Rèm Thùy Hương.';

/**
 * Title and category of the other fanpage photos, keyed by Facebook media key (`fanpage-lookbooks.json`). They were
 * captioned by looking at each photo; the ones without a category show something other than the four curtain types.
 */
const FANPAGE_CAPTIONS = JSON.parse(readFileSync(new URL('./fanpage-lookbooks.json', import.meta.url), 'utf8')) as {
  key: string;
  title: string;
  category?: CategorySlug;
}[];

for (const { key, title, category } of FANPAGE_CAPTIONS) {
  LOOKBOOKS[`fb:${key}`] ??= { title, description: FANPAGE_DESCRIPTION, category, products: [] };
}

/** Fanpage images that are not installation photos: the page banner, a duplicate upload and a parcel. */
const SKIPPED_FANPAGE_PHOTOS = new Set([
  '718119615_122108377827305859_6631583372224670952',
  '736053937_122111909289305859_5985560865712800217',
  '738188534_122111908941305859_955907129113069687',
]);

const GENERIC_LOOKBOOK = (index: number): ISeedLookbook => ({
  title: `Công trình thực tế ${index}`,
  description: FANPAGE_DESCRIPTION,
  products: [],
});

/** Used only when the fanpage gave fewer than `MIN_LOOKBOOK_PHOTOS` photos. Captioned as illustrations. */
const STOCK_LOOKBOOKS: { source: Source; entry: ISeedLookbook }[] = [
  { source: STOCK.livingRoom, entry: { title: 'Rèm vải cho phòng khách (ảnh minh họa)', description: 'Ảnh minh họa.', products: ['rem-vai-chong-nang-dinh-hinh-song'] } },
  { source: STOCK.sheerSofa, entry: { title: 'Rèm voan lấy sáng (ảnh minh họa)', description: 'Ảnh minh họa.', products: ['rem-voan-trang-lay-sang'] } },
  { source: STOCK.rollerBay, entry: { title: 'Rèm cuốn cho cửa sổ lồi (ảnh minh họa)', description: 'Ảnh minh họa.', products: ['rem-cuon-chong-nang'] } },
  { source: STOCK.zebraWindow, entry: { title: 'Rèm cầu vồng cho cửa sổ (ảnh minh họa)', description: 'Ảnh minh họa.', products: ['rem-cau-vong-han-quoc'] } },
  { source: STOCK.woodenPlant, entry: { title: 'Rèm gỗ cho cửa sổ (ảnh minh họa)', description: 'Ảnh minh họa.', products: ['rem-go-tu-nhien'] } },
  { source: STOCK.linenWindow, entry: { title: 'Rèm linen tự nhiên (ảnh minh họa)', description: 'Ảnh minh họa.', products: ['rem-vai-linen-tu-nhien'] } },
];

interface ISeedPost {
  slug: string;
  title: string;
  thumbnail: Source;
  content_markdown: string;
}

const POSTS: ISeedPost[] = [
  {
    slug: 'cach-do-kich-thuoc-cua-de-may-rem',
    title: 'Cách đo kích thước cửa để may rèm',
    thumbnail: STOCK.tapeMeasure,
    content_markdown: `Đo đúng ngay từ đầu giúp giá tạm tính trên website sát với giá thực tế. Bạn chỉ cần một thước dây kim loại và vài phút.

## Đo chiều rộng

- **Rèm vải:** đo chiều rộng ô cửa rồi cộng thêm 15 đến 20 cm mỗi bên, để rèm phủ kín và không hở sáng ở mép.
- **Rèm cuốn, rèm cầu vồng, rèm gỗ lắp lọt lòng:** đo lọt lòng khung cửa ở ba vị trí (trên, giữa, dưới) và lấy số nhỏ nhất.
- **Lắp phủ ngoài khung:** cộng thêm 5 đến 10 cm mỗi bên.

## Đo chiều cao

- **Rèm vải chấm sàn:** đo từ vị trí lắp ray (thường là sát trần) xuống sàn, trừ 1 đến 2 cm để rèm không quét sàn.
- **Rèm cửa sổ:** đo từ mép trên khung đến dưới bệ cửa 10 đến 15 cm.

## Lưu ý

1. Luôn đo bằng centimet và ghi theo thứ tự rộng x cao.
2. Kiểm tra vị trí máy lạnh, hộp rèm, ổ điện có vướng ray hay không.
3. Nếu chưa chắc, cứ nhập số đo gần đúng để xem giá, rồi gửi yêu cầu khảo sát. Thợ sẽ đo lại miễn phí trước khi may.`,
  },
  {
    slug: 'do-chun-rem-2-0x-hay-2-3x',
    title: 'Độ chun rèm: chọn 2.0x hay 2.3x?',
    thumbnail: STOCK.fabricStack,
    content_markdown: `Độ chun là tỉ lệ giữa chiều rộng vải và chiều rộng ray. Rèm có độ chun 2.0x nghĩa là 1 mét ray dùng 2 mét vải.

## 2.0x: tiêu chuẩn

Sóng rèm đều, gọn, đủ đẹp cho hầu hết phòng ngủ và phòng làm việc. Đây là mức giá gốc hiển thị trên website.

## 2.3x: sang trọng

Sóng dày và sâu hơn, rèm rủ đầy đặn kể cả khi kéo kín. Hợp với phòng khách, cửa kính lớn và trần cao. Vì dùng nhiều vải hơn 15% nên giá tăng tương ứng 15%.

## Nên chọn mức nào?

| Không gian | Gợi ý |
| --- | --- |
| Phòng ngủ, cửa sổ nhỏ | 2.0x |
| Phòng khách, cửa kính lớn | 2.3x |
| Rèm voan lớp trong | 2.3x để voan không bị thưa |

Bạn có thể đổi qua lại hai mức trong phần tùy chọn của từng sản phẩm để so sánh giá ngay.`,
  },
  {
    slug: 'rem-vai-rem-cuon-hay-rem-cau-vong',
    title: 'Rèm vải, rèm cuốn hay rèm cầu vồng: loại nào hợp với nhà bạn?',
    thumbnail: STOCK.livingRoom,
    content_markdown: `Mỗi loại rèm hợp với một kiểu cửa và nhu cầu khác nhau. Dưới đây là cách chọn nhanh.

## Rèm vải

Mềm mại, cách nhiệt và cản sáng tốt nhất, hợp cửa kính lớn từ trần xuống sàn. Giá tính theo **mét ngang**.

## Rèm cuốn

Gọn, dễ vệ sinh, hợp văn phòng, bếp, ban công. Giá tính theo **mét vuông**, tối thiểu 1 m mỗi chiều.

## Rèm cầu vồng

Chỉnh sáng linh hoạt bằng cách kéo lệch hai lớp vải sọc. Hợp cửa sổ phòng ngủ và phòng làm việc.

## Rèm gỗ

Ấm, bền, xoay lá để chỉnh hướng sáng. Hợp nhà có nội thất gỗ.

> Một căn phòng có thể dùng nhiều loại: rèm vải cho cửa lớn và rèm cầu vồng hoặc rèm gỗ cho cửa sổ nhỏ.

Xem thêm các công trình thực tế trong mục [Công trình](/lookbook) để hình dung rõ hơn.`,
  },
];

/* -------------------------------------------------------------------------- */
/*                                  Download                                  */
/* -------------------------------------------------------------------------- */

const fetchWithRetry = async (url: string, init: RequestInit, attempts = 3): Promise<Response | null> => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { ...init, redirect: 'follow', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

      if (response.ok) return response;
      // 4xx other than rate limiting will not get better by retrying.
      if (response.status < 500 && response.status !== 429) return null;
    } catch {
      // Network error or timeout: retry.
    }

    if (attempt < attempts) await sleep(1500 * attempt);
  }

  return null;
};

/** `{ key: largest uncropped URL }` for every post photo found in a Facebook HTML page. */
const extractFacebookPhotos = (html: string): Map<string, string> => {
  const best = new Map<string, { url: string; area: number }>();

  for (const [raw] of html.matchAll(/https:\\\/\\\/scontent[^"]*?\.(?:jpg|jpeg|png|webp)\?[^"]*/g)) {
    let url: string;

    try {
      url = JSON.parse(`"${raw}"`);
    } catch {
      continue;
    }

    // `t39.30808-6` are post photos; `-1` are avatars. The file name is the stable identity of a photo.
    const key = url.match(/\/t39\.30808-6\/(\d+_\d+_\d+)_n\./)?.[1];

    if (!key) continue;

    const size = url.match(/ctp=[sp](\d+)x(\d+)/);
    // `stp=c...` is a centre-cropped thumbnail: only use it when nothing else exists.
    const area = (size ? Number(size[1]) * Number(size[2]) : 1) / (/[?&]stp=c\d/.test(url) ? 1000 : 1);

    if ((best.get(key)?.area ?? 0) < area) best.set(key, { url, area });
  }

  return new Map([...best].map(([key, value]) => [key, value.url]));
};

/** Public fanpage photos. Never throws: an auth wall, a rate limit or a layout change just yields fewer photos. */
const scrapeFacebook = async (): Promise<Map<string, string>> => {
  const photos = new Map<string, string>();

  if (SKIP_FACEBOOK) return photos;

  for (const path of ['/photos', '', '/photos_by']) {
    const response = await fetchWithRetry(`${FACEBOOK_PAGE}${path}`, { headers: BROWSER_HEADERS });

    if (!response) {
      log(`  facebook${path || '/'}: no answer (blocked or rate limited)`);
      continue;
    }

    if (/\/login|checkpoint/.test(new URL(response.url).pathname)) {
      log(`  facebook${path || '/'}: redirected to the login wall`);
      continue;
    }

    const found = extractFacebookPhotos(await response.text());

    log(`  facebook${path || '/'}: ${found.size} photos`);
    for (const [key, url] of found) if (!photos.has(key)) photos.set(key, url);
    await sleep(800);
  }

  return photos;
};

const stockUrl = (id: string) => `https://images.unsplash.com/photo-${id}?w=${MAX_EDGE}&q=85&fm=jpg&fit=max`;

const normalised = new Map<string, Buffer | null>();

/** Download a source once and return it as a normalised JPEG, or `null` when it is missing or too small. */
const loadImage = async (source: Source, facebook: Map<string, string>): Promise<Buffer | null> => {
  if (normalised.has(source)) return normalised.get(source) ?? null;

  const [kind, id] = [source.slice(0, source.indexOf(':')), source.slice(source.indexOf(':') + 1)];
  const url = kind === 'fb' ? facebook.get(id) : stockUrl(id);
  let result: Buffer | null = null;

  if (url) {
    const response = await fetchWithRetry(url, { headers: { 'User-Agent': BROWSER_HEADERS['User-Agent'] } });

    try {
      if (!response) throw new Error('download failed');

      const input = Buffer.from(await response.arrayBuffer());
      const { width = 0, height = 0 } = await sharp(input).metadata();

      if (Math.min(width, height) < MIN_SHORT_EDGE) throw new Error(`too small (${width}x${height})`);

      result = await sharp(input)
        .rotate()
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 84, mozjpeg: true })
        .toBuffer();
    } catch (error) {
      log(`  skipped ${source}: ${error instanceof Error ? error.message : error}`);
    }
  } else if (kind === 'fb' && !SKIP_FACEBOOK) {
    log(`  skipped ${source}: not on the fanpage any more`);
  }

  normalised.set(source, result);

  return result;
};

/* -------------------------------------------------------------------------- */
/*                                   Upload                                   */
/* -------------------------------------------------------------------------- */

const publicUrl = (path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

let uploadCount = 0;

/** Upload under a deterministic name (re-runs replace the object) and return its public URL. */
const upload = async (path: string, image: Buffer): Promise<string> => {
  if (!DRY_RUN) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, image, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: true });

    if (error) throw new Error(`Upload of ${path} failed: ${error.message}`);
  }

  uploadCount += 1;

  return publicUrl(path);
};

const sourceId = (source: Source) => source.slice(source.indexOf(':') + 1).split('_')[0];

/** Upload every available source of a row; missing sources are skipped. */
const uploadAll = async (folder: string, name: string, sources: Source[], facebook: Map<string, string>) => {
  const urls: string[] = [];

  for (const source of sources) {
    const image = await loadImage(source, facebook);

    if (image) urls.push(await upload(`${folder}/seed/${name}-${sourceId(source)}.jpg`, image));
  }

  return urls;
};

/* -------------------------------------------------------------------------- */
/*                                    Seed                                    */
/* -------------------------------------------------------------------------- */

const must = <T>({ data, error }: { data: T | null; error: { message: string } | null }, what: string): T => {
  if (error) throw new Error(`${what}: ${error.message}`);

  return data as T;
};

/** Spread `created_at` so "newest first" lists keep the order of the arrays above. */
const timestamp = (index: number) => new Date(Date.now() - index * 60_000).toISOString();

const seedProducts = async (facebook: Map<string, string>): Promise<Map<string, string>> => {
  const categories = must(await supabase.from('categories').select('id, slug'), 'Reading categories') as {
    id: string;
    slug: string;
  }[];
  const categoryId = new Map(categories.map((category) => [category.slug, category.id]));
  const existing = must(await supabase.from('products').select('id, slug, images'), 'Reading products') as {
    id: string;
    slug: string;
    images: string[] | null;
  }[];
  const bySlug = new Map(existing.map((product) => [product.slug, product]));
  const ids = new Map(existing.map((product) => [product.slug, product.id]));

  for (const [index, product] of PRODUCTS.entries()) {
    const current = bySlug.get(product.slug);
    const hasImages = Boolean(current?.images?.length);

    if (current && hasImages && !FORCE) {
      log(`  product ${product.slug}: exists, left untouched`);
      continue;
    }

    let images = await uploadAll('products', product.slug, product.images, facebook);

    if (!images.length) images = await uploadAll('products', product.slug, CATEGORY_FALLBACK[product.category], facebook);
    if (!images.length) log(`  product ${product.slug}: no image could be downloaded`);

    const { category, images: _sources, ...fields } = product;
    const row = { ...fields, category_id: categoryId.get(category) ?? null, images, is_active: true };

    if (DRY_RUN) {
      log(`  product ${product.slug}: would ${current ? 'update' : 'insert'} with ${images.length} images`);
      continue;
    }

    if (current) {
      // Without --force only the missing images are filled in; everything else may have been edited in the admin.
      must(await supabase.from('products').update(FORCE ? row : { images }).eq('id', current.id), `Updating ${product.slug}`);
    } else {
      const inserted = must(
        await supabase.from('products').insert({ ...row, created_at: timestamp(index) }).select('id').single(),
        `Inserting ${product.slug}`
      ) as { id: string };

      ids.set(product.slug, inserted.id);
    }

    log(`  product ${product.slug}: ${current ? 'updated' : 'inserted'} with ${images.length} images`);
  }

  return ids;
};

const seedLookbooks = async (facebook: Map<string, string>, productIds: Map<string, string>) => {
  const entries: { source: Source; entry: ISeedLookbook }[] = [];
  const known = Object.keys(LOOKBOOKS) as Source[];
  // Captioned photos first, in the order above; then anything new on the fanpage.
  const fanpage = [
    ...known.filter((source) => facebook.has(source.slice(3))),
    ...[...facebook.keys()]
      .filter((key) => !SKIPPED_FANPAGE_PHOTOS.has(key))
      .map((key) => `fb:${key}` as Source)
      .filter((source) => !known.includes(source)),
  ];
  // Object names are the first segment of the media key; the rare photo that shares it gets the second one too.
  const names = new Map<Source, string>();
  const taken = new Set<string>();

  for (const source of [...known, ...fanpage]) {
    if (names.has(source)) continue;

    const [first, second] = source.slice(source.indexOf(':') + 1).split('_');
    const name = taken.has(first) && second ? `${first}-${second}` : first;

    taken.add(name);
    names.set(source, name);
  }

  let generic = 0;

  for (const source of fanpage) {
    if (await loadImage(source, facebook)) entries.push({ source, entry: LOOKBOOKS[source] ?? GENERIC_LOOKBOOK(++generic) });
  }

  log(`  ${entries.length} fanpage photos usable for the lookbook`);

  if (entries.length < MIN_LOOKBOOK_PHOTOS) {
    const missing = MIN_LOOKBOOK_PHOTOS - entries.length;

    log(`  fewer than ${MIN_LOOKBOOK_PHOTOS}: adding ${missing} stock photos as a fallback`);
    entries.push(...STOCK_LOOKBOOKS.slice(0, missing));
  }

  const existing = must(await supabase.from('lookbooks').select('id, image_url'), 'Reading lookbooks') as {
    id: string;
    image_url: string;
  }[];
  const categories = must(await supabase.from('categories').select('id, slug'), 'Reading categories') as {
    id: string;
    slug: string;
  }[];
  const categoryId = new Map(categories.map((category) => [category.slug, category.id]));

  for (const [index, { source, entry }] of entries.entries()) {
    const path = `lookbooks/seed/${names.get(source) ?? sourceId(source)}.jpg`;
    const current = existing.find((lookbook) => lookbook.image_url === publicUrl(path));

    if (current && !FORCE) {
      log(`  lookbook "${entry.title}": exists, left untouched`);
      continue;
    }

    const image = await loadImage(source, facebook);

    if (!image) continue;

    const row = {
      title: entry.title,
      category_id: (entry.category && categoryId.get(entry.category)) ?? null,
      description: entry.description,
      image_url: await upload(path, image),
      tagged_product_ids: entry.products.flatMap((slug) => productIds.get(slug) ?? []),
    };

    if (DRY_RUN) {
      log(`  lookbook "${entry.title}": would ${current ? 'update' : 'insert'}`);
      continue;
    }

    must(
      current
        ? await supabase.from('lookbooks').update(row).eq('id', current.id)
        : await supabase.from('lookbooks').insert({ ...row, created_at: timestamp(index) }),
      `Saving lookbook "${entry.title}"`
    );
    log(`  lookbook "${entry.title}": ${current ? 'updated' : 'inserted'}`);
  }
};

const seedPosts = async (facebook: Map<string, string>) => {
  const existing = must(await supabase.from('blog_posts').select('id, slug, thumbnail_url'), 'Reading posts') as {
    id: string;
    slug: string;
    thumbnail_url: string | null;
  }[];

  for (const [index, post] of POSTS.entries()) {
    const current = existing.find((item) => item.slug === post.slug);

    if (current?.thumbnail_url && !FORCE) {
      log(`  post ${post.slug}: exists, left untouched`);
      continue;
    }

    const [thumbnail_url = null] = await uploadAll('posts', post.slug, [post.thumbnail], facebook);

    if (DRY_RUN) {
      log(`  post ${post.slug}: would ${current ? 'update' : 'insert'}`);
      continue;
    }

    const { thumbnail: _source, ...fields } = post;

    must(
      current
        ? await supabase.from('blog_posts').update(FORCE ? { ...fields, thumbnail_url } : { thumbnail_url }).eq('id', current.id)
        : await supabase.from('blog_posts').insert({ ...fields, thumbnail_url, published_at: timestamp(index) }),
      `Saving post ${post.slug}`
    );
    log(`  post ${post.slug}: ${current ? 'updated' : 'inserted'}`);
  }
};

/* -------------------------------------------------------------------------- */
/*                                    Main                                    */
/* -------------------------------------------------------------------------- */

log(`Bucket: ${BUCKET}${DRY_RUN ? ' (dry run: nothing is written)' : ''}`);

const { data: bucket, error: bucketError } = await supabase.storage.getBucket(BUCKET);

if (bucketError || !bucket) {
  console.error(`Bucket "${BUCKET}" is not reachable: ${bucketError?.message ?? 'not found'}`);
  process.exit(1);
}

if (!bucket.public) log('Warning: the bucket is not public, so the storefront cannot show its images.');

log(`\n1/4 Fanpage: ${SKIP_FACEBOOK ? 'skipped' : FACEBOOK_PAGE}`);

const facebook = await scrapeFacebook();

log(
  facebook.size
    ? `  ${facebook.size} photo candidates`
    : '  no fanpage photos available: continuing with stock photos only'
);

log('\n2/4 Products');

const productIds = await seedProducts(facebook);

log('\n3/4 Lookbook');
await seedLookbooks(facebook, productIds);

log('\n4/4 Guides');
await seedPosts(facebook);

log(`\nDone: ${uploadCount} images ${DRY_RUN ? 'would be ' : ''}uploaded to "${BUCKET}".`);
