import { digitsOnly, formatVnd } from '@/lib/format';
import type { IQuoteLine } from '@/types/catalog';

/** The encoded link is kept under this length; longer orders collapse their trailing lines. */
export const ZALO_URL_MAX_LENGTH = 1800;

/** Labels come from the translations, so the message follows the customer's language. */
export interface IZaloLabels {
  heading: string;
  code: string;
  customer: string;
  address: string;
  width: string;
  height: string;
  fullness: string;
  subtotal: string;
  total: string;
  notes: string;
  /** Receives the number of hidden lines. */
  more: (count: number) => string;
}

export interface IZaloOrder {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  notes?: string;
  lines: IQuoteLine[];
  total: number;
}

const lineSpecs = (line: IQuoteLine, labels: IZaloLabels): string =>
  [
    `${labels.width} ${line.width_cm}cm x ${labels.height} ${line.height_cm}cm`,
    line.pleat?.label,
    line.fullness ? `${labels.fullness} ${line.fullness}x` : null,
    line.fabric?.label,
    line.motor?.label,
  ]
    .filter(Boolean)
    .join(' | ');

const buildMessage = (order: IZaloOrder, labels: IZaloLabels, visible: number): string => {
  const hidden = order.lines.length - visible;
  const items = order.lines
    .slice(0, visible)
    .flatMap((line, index) => [
      `${index + 1}. ${line.title} x${line.quantity}`,
      `   ${lineSpecs(line, labels)}`,
      `   ${labels.subtotal}: ${formatVnd(line.line_total)}`,
    ]);

  return [
    labels.heading,
    `${labels.code}: ${order.orderCode}`,
    `${labels.customer}: ${order.customerName} - ${order.customerPhone}`,
    order.customerAddress ? `${labels.address}: ${order.customerAddress}` : null,
    '---',
    ...items,
    hidden > 0 ? labels.more(hidden) : null,
    '---',
    `${labels.total}: ${formatVnd(order.total)}`,
    order.notes ? `${labels.notes}: ${order.notes}` : null,
  ]
    .filter((row): row is string => row !== null)
    .join('\n');
};

/** `https://zalo.me/{HOTLINE}?text={ENCODED_MESSAGE}`; `null` when the hotline has no digits. */
export const buildZaloUrl = (hotline: string, message?: string): string | null => {
  const phone = digitsOnly(hotline);

  if (!phone) return null;

  return message ? `https://zalo.me/${phone}?text=${encodeURIComponent(message)}` : `https://zalo.me/${phone}`;
};

/**
 * Plain-text order plus its deep link. Lines are dropped from the end (replaced by "... and N more") until the
 * encoded link fits; staff open the full quote in the inbox with the order code.
 */
export const buildZaloOrder = (
  hotline: string,
  order: IZaloOrder,
  labels: IZaloLabels
): { message: string; url: string | null } => {
  let visible = order.lines.length;
  let message = buildMessage(order, labels, visible);
  let url = buildZaloUrl(hotline, message);

  while (url && url.length > ZALO_URL_MAX_LENGTH && visible > 0) {
    visible -= 1;
    message = buildMessage(order, labels, visible);
    url = buildZaloUrl(hotline, message);
  }

  return { message, url };
};
