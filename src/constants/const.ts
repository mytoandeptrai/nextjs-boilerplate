/** Prefix of this app's own Route Handlers (the BFF). */
export const INTERNAL_API_PREFIX = '/api';

export const DEFAULT_PAGINATION = {
  pageIndex: 0,
  pageSize: 10,
} as const;

/** Debounce delay (ms) used by search inputs. */
export const SEARCH_DEBOUNCE_MS = 500;

export const STORAGE_KEYS = {
  SESSION: 'session-store',
  CART: 'cart-store',
} as const;

/** httpOnly cookies set by the BFF. The browser never reads them. */
export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const OG_IMAGE_CONTENT_TYPE = 'image/png';

export const IMAGE_TYPE = ['png', 'jpg', 'jpeg', 'webp', 'svg'];
export const VIDEO_TYPE = ['mp4', 'mov', 'webm', 'ogg', 'wmv'];

export const FILE_FORMAT = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/jpg',
  'image/svg',
  'image/gif',
  'image/svg+xml',
];

export const NUMBER_FORMAT_LOOK_UP = [
  { value: 1, symbol: '' },
  { value: 1e3, symbol: 'k' },
  { value: 1e6, symbol: 'M' },
  { value: 1e9, symbol: 'B' },
  { value: 1e12, symbol: 'T' },
  { value: 1e15, symbol: 'P' },
  { value: 1e18, symbol: 'E' },
];

/** Site settings an admin can edit (`site_settings.key`). */
export const SETTING_KEYS = {
  ZALO_HOTLINE: 'zalo_hotline',
  QUOTE_NOTIFICATION_EMAIL: 'quote_notification_email',
} as const;

/** Folders inside the storage bucket. */
export const UPLOAD_FOLDERS = ['products', 'lookbooks', 'posts'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];
export const UPLOAD_MAX_BYTES = 8 * 1024 * 1024;
/** Longest edge of an image after the browser downscales it before upload. */
export const UPLOAD_MAX_EDGE = 2400;

export const FALLBACK_IMAGE = '/images/image_unavailable.webp';

/** Consultation progress of a lead, in order. */
export const QUOTE_STATUSES = ['new', 'contacted', 'surveyed', 'quoted', 'won', 'lost'] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const CONFIGURATOR_LIMITS = {
  width: { min: 30, max: 1200 },
  height: { min: 30, max: 600 },
  quantity: { min: 1, max: 20 },
} as const;

export const FULLNESS_OPTIONS = [2, 2.3] as const;
export type Fullness = (typeof FULLNESS_OPTIONS)[number];
