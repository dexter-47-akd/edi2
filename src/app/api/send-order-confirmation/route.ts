import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Using Resend HTTP API directly to avoid extra deps
const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Use Resend's onboarding sender by default so no domain setup is required
const FROM_EMAIL = process.env.FROM_EMAIL || 'Store <onboarding@resend.dev>';

type OrderItem = { name: string; quantity: number; price: number; image_url?: string };
type OrderData = { items: OrderItem[]; total: number } & Record<string, unknown>;

function renderHtml(orderId: string, order: OrderData) {
  const itemsHtml = (order.items ?? [])
    .map(
      (i) =>
        `<li style="margin:4px 0">${i.name} x ${i.quantity} — $${Number(i.price).toFixed(2)}</li>`
    )
    .join('');

  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#111">
      <h2 style="margin-bottom:8px">Thanks for your order!</h2>
      <p style="margin:0 0 12px">Order ID: <b>${orderId}</b></p>
      <p style="margin:0 0 12px">Total: <b>$${Number(order.total).toFixed(2)}</b></p>
      <ul style="padding-left:16px; list-style:disc">${itemsHtml}</ul>
      <p style="margin-top:16px;color:#555">If you have questions, reply to this email.</p>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    if (!RESEND_API_KEY) {
      return NextResponse.json({ ok: false, error: 'Missing RESEND_API_KEY env' }, { status: 500 });
    }

    const { orderId, to, order } = (await req.json()) as {
      orderId: string;
      to: string;
      order: OrderData;
    };

    if (!orderId || !to || !order) {
      return NextResponse.json({ ok: false, error: 'Missing fields: orderId, to, order' }, { status: 400 });
    }

    const subject = `Order Confirmation #${orderId}`;
    const html = renderHtml(orderId, order);

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    if (!resp.ok) {
      const contentType = resp.headers.get('content-type') || '';
      const body = contentType.includes('application/json') ? await resp.json() : await resp.text();
      return NextResponse.json(
        { ok: false, providerStatus: resp.status, providerBody: body },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('send-order-confirmation error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      hasResendKey: Boolean(RESEND_API_KEY),
      fromEmailConfigured: Boolean(FROM_EMAIL),
      runtime: 'nodejs',
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}


