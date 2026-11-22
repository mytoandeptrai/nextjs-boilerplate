/** `11888000` -> `11.888.000đ` (the format Vietnamese shoppers and the Zalo message use). */
export const formatVnd = (value: number): string => `${Math.round(value).toLocaleString('vi-VN')}đ`;

/** `Rèm vải Linen Đà Nẵng` -> `rem-vai-linen-da-nang`. */
export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

/** Order code shown to the customer and sent to Zalo: the first 8 characters of the quote id. */
export const toOrderCode = (quoteId: string): string => `#${quoteId.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

/** Vietnamese mobile number: `0xxxxxxxxx` or `+84xxxxxxxxx`. */
export const VN_PHONE_REGEX = /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/;

export const normalizePhone = (value: string): string => value.replace(/[\s.\-()]/g, '');
