import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore - IDE/Node linter shim when Deno types are unavailable locally
declare const Deno: any;

// You can swap providers easily. Example uses Resend.
// deno-lint-ignore no-explicit-any
type OrderItem = { name: string; quantity: number; price: number; image_url?: string };
// deno-lint-ignore no-explicit-any
type OrderData = { items: OrderItem[]; total: number } & Record<string, any>;

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Store <orders@example.com>";

async function sendWithResend(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY secret");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email provider error: ${response.status} ${text}`);
  }
}

function renderHtml(orderId: string, order: OrderData) {
  const itemsHtml = (order.items ?? [])
    .map(
      (i) =>
        `<li style="margin:4px 0">${i.name} x ${i.quantity} — $${Number(i.price).toFixed(
          2,
        )}</li>`,
    )
    .join("");

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

Deno.serve(async (req: Request) => {
  try {
    // verify_jwt enforced via supabase.toml; this is an extra guard
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { orderId, to, order } = (await req.json()) as {
      orderId: string;
      to: string;
      order: OrderData;
    };

    if (!orderId || !to || !order) {
      return new Response("Missing fields: orderId, to, order", { status: 400 });
    }

    const subject = `Order Confirmation #${orderId}`;
    const html = renderHtml(orderId, order);

    await sendWithResend(to, subject, html);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});


