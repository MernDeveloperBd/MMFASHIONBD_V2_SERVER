// server/utils/email.js
import nodemailer from 'nodemailer';

let cachedTransporter = null;
let usingEthereal = false;

function getBool(val, def = false) {
  if (val === undefined || val === null) return def;
  const s = String(val).toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}

async function buildTransporter() {
  // Priority 1: Explicit SMTP via EMAIL_* (recommended)
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const port = Number(process.env.EMAIL_PORT || 587);
    const secure = getBool(process.env.EMAIL_SECURE, port === 465);
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    usingEthereal = false;
    return transporter;
  }

  // Priority 2: Gmail via NODEMAILER_* (compat with your current env)
  if (process.env.NODEMAILER_EMAIL && process.env.NODEMAILER_PASS) {
    const user = process.env.NODEMAILER_EMAIL;
    const pass = process.env.NODEMAILER_PASS;
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass }
    });
    usingEthereal = false;
    console.log('Email: Using Gmail SMTP via NODEMAILER_EMAIL');
    return transporter;
  }

  // Fallback: Ethereal for dev/test
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
  usingEthereal = true;
  console.log('Email: Using Ethereal test SMTP account');
  console.log('Ethereal user:', testAccount.user);
  console.log('Ethereal pass:', testAccount.pass);
  return transporter;
}

export async function getTransporter() {
  if (!cachedTransporter) cachedTransporter = await buildTransporter();
  return cachedTransporter;
}

export async function verifyEmailTransport() {
  try {
    const t = await getTransporter();
    await t.verify();
    console.log('✅ Email transport is ready', usingEthereal ? '(Ethereal)' : '(SMTP)');
  } catch (err) {
    console.error('❌ Email transport verify failed:', err?.message || err);
  }
}

export async function sendEmail({ to, subject, html, text }) {
  const from =
    process.env.EMAIL_FROM ||
    (process.env.NODEMAILER_EMAIL
      ? `"${process.env.NODEMAILER_USER || 'MM Fashion World'}" <${process.env.NODEMAILER_EMAIL}>`
      : '"MM Fashion World" <no-reply@mmfashion.com>');

  const t = await getTransporter();
  const info = await t.sendMail({ from, to, subject, html, text });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log('✉️  Ethereal preview URL:', previewUrl);

  return { messageId: info.messageId, previewUrl };
}

// ============ Helpers ============
const BRAND = {
  primary: '#0ea5e9', // Sky
  accent: '#f97316',  // Orange
  dark: '#0f172a',    // Slate-900
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  soft: '#f4f6fb',
  white: '#ffffff',
  green: '#16a34a',
  red: '#dc2626'
};

function tk(n) {
  const num = Number(n || 0);
  return `TK ${num.toLocaleString('en-BD')}`;
}
function esc(s) {
  return String(s || '').replace(/[<>]/g, '');
}
function fmtDate(d) {
  try {
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return '-';
  }
}
function statusPill(status) {
  const map = {
    PLACED: { bg: '#dbeafe', color: '#1d4ed8', label: 'Placed' },
    CONFIRMED: { bg: '#dcfce7', color: '#15803d', label: 'Confirmed' },
    SHIPPED: { bg: '#fef9c3', color: '#a16207', label: 'Shipped' },
    DELIVERED: { bg: '#e2e8f0', color: '#334155', label: 'Delivered' },
    CANCELLED: { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' }
  };
  const s = map[status] || map.PLACED;
  return `<span style="display:inline-block;padding:6px 10px;border-radius:999px;background:${s.bg};color:${s.color};font-weight:600;font-size:12px;letter-spacing:.2px">${s.label}</span>`;
}

// ============ Customer Copy (unique, warm) ============
export function orderEmailHtmlCustomer(order) {
  const appName = process.env.APP_NAME || 'MM Fashion World';
  const appUrl = process.env.APP_BASE_URL || 'https://www.mmfashionworld.com/';
  const code = order?.orderCode || order?._id?.toString()?.slice(-6);
  const addr = order?.shippingAddress || {};
  const pr = order?.pricing || {};
  const pay = order?.payment || {};
  const createdAt = order?.createdAt;

  const whatsapp = '01749889595';
  const whatsappIntl = '8801749889595';
  const whatsappLink = `https://wa.me/${whatsappIntl}?text=Hello%20${encodeURIComponent(appName)}%2C%20I%20have%20a%20question%20about%20Order%20${encodeURIComponent(code)}`;
  const facebookLink = 'https://www.facebook.com/mmfashionworldonline';
  const websiteLink = 'https://www.mmfashionworld.com/';

  const itemsHtml = (order.items || [])
    .map(it => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid ${BRAND.border};">${esc(it.productTitle)}</td>
        <td style="padding:12px;border-bottom:1px solid ${BRAND.border};text-align:center;">${Number(it.quantity)}</td>
        <td style="padding:12px;border-bottom:1px solid ${BRAND.border};text-align:right;">${tk(it.price)}</td>
        <td style="padding:12px;border-bottom:1px solid ${BRAND.border};text-align:right;">${tk(it.subTotal)}</td>
      </tr>
    `).join('');

  const paymentHtml = pay.method === 'BKASH'
    ? `
      <div style="margin-top:6px;font-size:13px;line-height:1.6;color:${BRAND.text}">
        <div><b>Payment:</b> bKash (Manual)</div>
        <div>Receiver: <b>${esc(pay.receiverNumber || '—')}</b></div>
        <div>Sender: <b>${esc(pay.bkash?.number || '—')}</b></div>
        <div>TrxID: <b>${esc(pay.bkash?.trxId || '—')}</b></div>
      </div>
    `
    : `<div style="margin-top:6px;font-size:13px;line-height:1.6;color:${BRAND.text}"><b>Payment:</b> Cash on Delivery</div>`;

  const noteBlock = order.customerNote
    ? `<div style="margin-top:10px;padding:10px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;color:${BRAND.text};font-size:13px">
        <b>Note:</b> ${esc(order.customerNote)}
      </div>`
    : '';

  const preheader = `Your order ${code} is placed successfully.`;

  return `
  <div style="display:none;opacity:0;visibility:hidden;height:0;width:0;overflow:hidden">${preheader}</div>
  <div style="background:${BRAND.soft};padding:26px 0;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text}">
    <table role="presentation" width="100%" align="center" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;">
      <!-- Gradient Header -->
      <tr>
        <td style="padding:22px 24px;background:linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent});">
          <table width="100%" style="border-collapse:collapse;color:#fff">
            <tr>
              <td style="font-size:20px;font-weight:700;letter-spacing:.3px">${esc(appName)}</td>
              <td style="text-align:right;font-size:12px;opacity:.9">${fmtDate(createdAt)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:6px;font-size:14px">
                <b>Thank you, ${esc(addr.name || 'Customer')}!</b> Your order is confirmed.
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:10px">
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                  <span style="display:inline-block;padding:7px 12px;background:#ffffff1a;color:#fff;border-radius:8px;font-size:13px">Order No: <b>${esc(code)}</b></span>
                  ${statusPill(order?.status)}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Order Summary -->
      <tr>
        <td style="padding:18px 24px">
          <h3 style="margin:0 0 8px 0;font-size:16px;color:${BRAND.dark}">Order Summary</h3>
          <table width="100%" style="border-collapse:collapse;border:1px solid ${BRAND.border};border-radius:10px;overflow:hidden;">
            <thead>
              <tr style="background:#f9fafb">
                <th align="left" style="padding:10px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted};">Product</th>
                <th align="center" style="padding:10px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted};">Qty</th>
                <th align="right" style="padding:10px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted};">Price</th>
                <th align="right" style="padding:10px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted};">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <!-- Totals Card -->
          <table width="100%" style="border-collapse:collapse;margin-top:12px">
            <tr>
              <td align="right" style="padding:4px 0;color:${BRAND.muted}">Subtotal</td>
              <td align="right" style="padding:4px 0;width:160px;"><b>${tk(pr.subtotal)}</b></td>
            </tr>
            <tr>
              <td align="right" style="padding:4px 0;color:${BRAND.muted}">Discount</td>
              <td align="right" style="padding:4px 0;width:160px;color:${BRAND.green}"><b>- ${tk(pr.discount)}</b></td>
            </tr>
            <tr>
              <td align="right" style="padding:4px 0;color:${BRAND.muted}">Shipping</td>
              <td align="right" style="padding:4px 0;width:160px;"><b>${tk(pr.shipping)}</b></td>
            </tr>
            <tr>
              <td align="right" style="padding:8px 0;border-top:1px dashed ${BRAND.border};font-size:15px">Total</td>
              <td align="right" style="padding:8px 0;border-top:1px dashed ${BRAND.border};font-size:18px;color:${BRAND.dark}"><b>${tk(pr.total)}</b></td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Shipping + Payment -->
      <tr>
        <td style="padding:0 24px 18px 24px">
          <table width="100%" style="border-collapse:collapse">
            <tr>
              <td style="vertical-align:top;padding-right:10px">
                <h3 style="margin:0 0 8px 0;font-size:16px;color:${BRAND.dark}">Shipping Details</h3>
                <div style="font-size:13px;line-height:1.6">
                  <div><b>${esc(addr.name || '-')}</b> — ${esc(addr.phone || '-')}</div>
                  <div>${esc(addr.address || '-')}${addr.apartment ? ', ' + esc(addr.apartment) : ''}</div>
                  <div>${esc(addr.upazila || '-')}, ${esc(addr.districtLabel || '-')}, ${esc(addr.divisionLabel || '-')}${addr.postcode ? ' - ' + esc(addr.postcode) : ''}</div>
                </div>
              </td>
              <td style="vertical-align:top;padding-left:10px">
                <h3 style="margin:0 0 8px 0;font-size:16px;color:${BRAND.dark}">Payment</h3>
                ${paymentHtml}
                ${noteBlock}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA & Contacts -->
      <tr>
        <td style="padding:18px 24px;background:#f9fafb;border-top:1px solid ${BRAND.border}">
          <table width="100%" style="border-collapse:collapse">
            <tr>
              <td>
                <a href="${appUrl}" target="_blank" rel="noopener noreferrer"
                   style="display:inline-block;padding:10px 16px;background:${BRAND.primary};color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:13px">
                  Visit Website
                </a>
              </td>
            </tr>
          </table>

          <div style="margin-top:10px;font-size:13px;color:${BRAND.text}">
            <div>WhatsApp: <a href="${whatsappLink}" style="color:${BRAND.primary};text-decoration:none">${whatsapp}</a></div>
            <div>Facebook: <a href=${facebookLink} style="color:${BRAND.primary};text-decoration:none">mmfashionworldonline</a></div>
            <div>Website: <a href="${websiteLink}" style="color:${BRAND.primary};text-decoration:none">www.mmfashionworld.com</a></div>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:14px 24px;background:${BRAND.dark};color:#cbd5e1;font-size:12px;text-align:center;">
          © ${new Date().getFullYear()} ${esc(appName)} — All rights reserved.
        </td>
      </tr>
    </table>
  </div>`;
}

// ============ Admin Copy (compact, dashboard-style) ============
export function orderEmailHtmlAdmin(order) {
  const appName = process.env.APP_NAME || 'MM Fashion World';
  const appUrl = process.env.APP_BASE_URL || 'https://www.mmfashionworld.com/';
  const code = order?.orderCode || order?._id?.toString()?.slice(-6);
  const addr = order?.shippingAddress || {};
  const pr = order?.pricing || {};
  const pay = order?.payment || {};
  const createdAt = order?.createdAt;

  const itemsHtml = (order.items || [])
    .map(it => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid ${BRAND.border};">${esc(it.productTitle)}</td>
        <td style="padding:10px;border-bottom:1px solid ${BRAND.border};text-align:center;">${Number(it.quantity)}</td>
        <td style="padding:10px;border-bottom:1px solid ${BRAND.border};text-align:right;">${tk(it.price)}</td>
        <td style="padding:10px;border-bottom:1px solid ${BRAND.border};text-align:right;">${tk(it.subTotal)}</td>
      </tr>
    `).join('');

  const paymentBlock = pay.method === 'BKASH'
    ? `
      <div style="font-size:13px;line-height:1.6">
        <div><b>Method:</b> bKash (Manual)</div>
        <div>Receiver: <b>${esc(pay.receiverNumber || '—')}</b></div>
        <div>Sender: <b>${esc(pay.bkash?.number || '—')}</b></div>
        <div>TrxID: <b>${esc(pay.bkash?.trxId || '—')}</b></div>
        <div>Status: ${statusPill(pay.status || 'PENDING')}</div>
      </div>
    `
    : `
      <div style="font-size:13px;line-height:1.6">
        <div><b>Method:</b> Cash on Delivery</div>
        <div>Status: ${statusPill(pay.status || 'COD_PENDING')}</div>
      </div>
    `;

  const noteBlock = order.customerNote
    ? `<div style="margin-top:8px;padding:10px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;color:${BRAND.text};font-size:13px">
        <b>Customer Note:</b> ${esc(order.customerNote)}
      </div>`
    : '';

  const preheader = `New order ${code} received.`;

  return `
  <div style="display:none;opacity:0;visibility:hidden;height:0;width:0;overflow:hidden">${preheader}</div>
  <div style="background:${BRAND.soft};padding:26px 0;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text}">
    <table role="presentation" width="100%" align="center" cellspacing="0" cellpadding="0" style="max-width:780px;margin:0 auto;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;">
      <!-- Header -->
      <tr>
        <td style="padding:18px 24px;background:${BRAND.dark};color:#fff">
          <table width="100%" style="border-collapse:collapse">
            <tr>
              <td style="font-size:18px;font-weight:700;letter-spacing:.3px">${esc(appName)}</td>
              <td style="text-align:right;font-size:12px;opacity:.9">${fmtDate(createdAt)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:6px;font-size:14px">
                New Order — <b>#${esc(code)}</b> &nbsp; ${statusPill(order?.status)}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Quick Info -->
      <tr>
        <td style="padding:18px 24px">
          <table width="100%" style="border-collapse:separate;border-spacing:10px;">
            <tr>
              <td style="vertical-align:top;background:#f9fafb;border:1px solid ${BRAND.border};border-radius:10px;padding:12px;width:50%;">
                <div style="font-weight:700;margin-bottom:6px">Customer</div>
                <div style="font-size:13px;line-height:1.6">
                  <div><b>${esc(addr.name || '-')}</b></div>
                  <div>${esc(addr.phone || '-')} • ${esc(addr.email || '-')}</div>
                  <div>${esc(addr.address || '-')}${addr.apartment ? ', ' + esc(addr.apartment) : ''}</div>
                  <div>${esc(addr.upazila || '-')}, ${esc(addr.districtLabel || '-')}, ${esc(addr.divisionLabel || '-')}${addr.postcode ? ' - ' + esc(addr.postcode) : ''}</div>
                </div>
              </td>

              <td style="vertical-align:top;background:#f9fafb;border:1px solid ${BRAND.border};border-radius:10px;padding:12px;width:50%;">
                <div style="font-weight:700;margin-bottom:6px">Payment</div>
                ${paymentBlock}
                ${noteBlock}
              </td>
            </tr>

            <tr>
              <td style="vertical-align:top;background:#f9fafb;border:1px solid ${BRAND.border};border-radius:10px;padding:12px;">
                <div style="font-weight:700;margin-bottom:6px">Totals</div>
                <table width="100%" style="border-collapse:collapse;font-size:13px">
                  <tr><td>Subtotal</td><td style="text-align:right"><b>${tk(pr.subtotal)}</b></td></tr>
                  <tr><td>Discount</td><td style="text-align:right;color:${BRAND.green}"><b>- ${tk(pr.discount)}</b></td></tr>
                  <tr><td>Shipping</td><td style="text-align:right"><b>${tk(pr.shipping)}</b></td></tr>
                  <tr><td style="padding-top:6px;border-top:1px dashed ${BRAND.border}">Total</td><td style="text-align:right;padding-top:6px;border-top:1px dashed ${BRAND.border};font-size:16px"><b>${tk(pr.total)}</b></td></tr>
                </table>
              </td>

              <td style="vertical-align:top;background:#f9fafb;border:1px solid ${BRAND.border};border-radius:10px;padding:12px;">
                <div style="font-weight:700;margin-bottom:6px">Actions</div>
                <div style="font-size:13px;line-height:1.6;color:${BRAND.text}">
                  <div>Verify payment (if bKash) and move status accordingly.</div>
                  <div>Prepare shipment for courier.</div>
                </div>
                <div style="margin-top:10px">
                  <a href="${appUrl}" target="_blank" rel="noopener noreferrer"
                    style="display:inline-block;padding:8px 14px;background:${BRAND.primary};color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:12px">
                    Open Dashboard
                  </a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Items -->
      <tr>
        <td style="padding:0 24px 18px 24px">
          <h3 style="margin:0 0 8px 0;font-size:16px;color:${BRAND.dark}">Items</h3>
          <table width="100%" style="border-collapse:collapse;border:1px solid ${BRAND.border};border-radius:10px;overflow:hidden;">
            <thead>
              <tr style="background:#f1f5f9">
                <th align="left" style="padding:10px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted}">Product</th>
                <th align="center" style="padding:10px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted}">Qty</th>
                <th align="right" style="padding:10px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted}">Price</th>
                <th align="right" style="padding:10px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted}">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:14px 24px;background:${BRAND.dark};color:#cbd5e1;font-size:12px;text-align:center;">
          ${esc(appName)} • ${fmtDate(createdAt)}
        </td>
      </tr>
    </table>
  </div>`;
}

// ============ Send both copies ============
export async function sendOrderEmails(order) {
  const code = order?.orderCode || order?._id?.toString()?.slice(-6);
  const appName = process.env.APP_NAME || 'MM Fashion World';

  const adminEmail = process.env.ADMIN_EMAIL;
  const customerEmail = order?.shippingAddress?.email;

  if (!adminEmail && !customerEmail) {
    return { sent: false, reason: 'No recipients found' };
  }

  const subjectCustomer = `${appName} — Order ${code} confirmed`;
  const subjectAdmin = `New Order ${code} received`;

  const tasks = [];
  if (customerEmail) {
    tasks.push(
      sendEmail({
        to: customerEmail,
        subject: subjectCustomer,
        html: orderEmailHtmlCustomer(order)
      })
    );
  }
  if (adminEmail) {
    tasks.push(
      sendEmail({
        to: adminEmail,
        subject: subjectAdmin,
        html: orderEmailHtmlAdmin(order)
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  const previews = results
    .map(r => (r.status === 'fulfilled' ? r.value.previewUrl : null))
    .filter(Boolean);
  const anyFailed = results.some(r => r.status === 'rejected');
  if (anyFailed) console.error('Some order emails failed:', results);

  return { sent: !anyFailed, previews };
}