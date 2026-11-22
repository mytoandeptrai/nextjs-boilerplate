import 'server-only';

import { serverEnv } from '@/constants/env.server';
import { siteConfig } from '@/config/site';
import { formatVnd, toOrderCode } from '@/lib/format';
import type { IQuoteRequest } from '@/types/catalog';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

const renderQuoteEmail = (quote: Omit<IQuoteRequest, 'status' | 'created_at'>): string => {
  const rows = quote.cart_items
    .map((line) => {
      const specs = [
        `Rộng ${line.width_cm}cm x Cao ${line.height_cm}cm`,
        line.pleat?.label,
        line.fullness ? `Độ chun ${line.fullness}x` : null,
        line.fabric?.label,
        line.motor?.label,
      ]
        .filter(Boolean)
        .join(' | ');

      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(line.title)} x${line.quantity}<br><small style="color:#64748b">${escapeHtml(specs)}</small></td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap">${formatVnd(line.line_total)}</td>
      </tr>`;
    })
    .join('');

  return `<div style="font-family:Arial,sans-serif;color:#1e293b;max-width:600px">
    <h2 style="margin:0 0 4px">Yêu cầu khảo sát tại nhà ${toOrderCode(quote.id)}</h2>
    <p style="margin:0 0 16px;color:#64748b">${escapeHtml(siteConfig.name)}</p>
    <p><b>Khách:</b> ${escapeHtml(quote.customer_name)}<br>
    <b>Điện thoại:</b> ${escapeHtml(quote.customer_phone)}<br>
    <b>Địa chỉ:</b> ${escapeHtml(quote.customer_address || '-')}<br>
    <b>Ghi chú:</b> ${escapeHtml(quote.notes || '-')}</p>
    <table style="width:100%;border-collapse:collapse">${rows}
      <tr><td style="padding:8px"><b>Tổng tạm tính</b></td><td style="padding:8px;text-align:right"><b>${formatVnd(quote.total_estimate)}</b></td></tr>
    </table>
    <p style="margin-top:16px"><a href="${siteConfig.appUrl}/admin/quotes">Mở hộp thư báo giá</a></p>
  </div>`;
};

/**
 * Email alert for a home-survey request, sent through the Resend HTTP API.
 * Never throws: a lead must not be lost because the mail provider is down. Returns whether the mail was accepted.
 */
export const sendQuoteAlert = async (
  to: string,
  quote: Omit<IQuoteRequest, 'status' | 'created_at'>
): Promise<boolean> => {
  if (!serverEnv.RESEND_API_KEY || !to) return false;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `${siteConfig.name} <${serverEnv.QUOTE_EMAIL_FROM}>`,
        to: [to],
        subject: `[${toOrderCode(quote.id)}] Yêu cầu khảo sát: ${quote.customer_name} - ${quote.customer_phone}`,
        html: renderQuoteEmail(quote),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) console.error('[quote-email] Resend rejected the alert', response.status, await response.text());

    return response.ok;
  } catch (error) {
    console.error('[quote-email] Failed to send the alert', error);

    return false;
  }
};
