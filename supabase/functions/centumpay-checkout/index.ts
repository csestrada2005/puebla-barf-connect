const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Base32 decode ────────────────────────────────────────────────────
function base32Decode(input: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = input.replace(/[=\s]/g, "").toUpperCase();
  let bits = "";
  for (const c of cleaned) {
    const val = alphabet.indexOf(c);
    if (val === -1) throw new Error(`Invalid base32 char: ${c}`);
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return bytes;
}

// Check if string looks like Base32
function isBase32(s: string): boolean {
  return /^[A-Z2-7=\s]+$/i.test(s) && s.length >= 8;
}

// ── TOTP (RFC 6238) ──────────────────────────────────────────────────
async function generateTOTP(secret: string): Promise<string> {
  const epoch = Math.floor(Date.now() / 1000);
  const T = Math.floor(epoch / 30);

  // T as 8-byte big-endian buffer
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(4, T, false);

  // Decode secret: Base32 if applicable, otherwise raw bytes
  let keyBytes: Uint8Array;
  if (isBase32(secret)) {
    keyBytes = base32Decode(secret);
    console.log("TOTP: Using Base32-decoded secret");
  } else {
    keyBytes = new TextEncoder().encode(secret);
    console.log("TOTP: Using raw string secret");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );

  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, buf));

  // Dynamic truncation
  const offset = sig[sig.length - 1] & 0x0f;
  const code =
    ((sig[offset] & 0x7f) << 24) |
    ((sig[offset + 1] & 0xff) << 16) |
    ((sig[offset + 2] & 0xff) << 8) |
    (sig[offset + 3] & 0xff);

  const otp = String(code % 1_000_000).padStart(6, "0");
  console.log("Generated TOTP (first 2 chars):", otp.substring(0, 2) + "****");
  return otp;
}

// ── HMAC-SHA256 token ────────────────────────────────────────────────
async function generateAuthToken(
  apiKey: string,
  totp: string,
  apiSecret: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const message = apiKey + totp;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(message)),
  );

  return Array.from(sig)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Handler ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("CENTUMPAY_API_KEY")!;
    const apiSecret = Deno.env.get("CENTUMPAY_API_SECRET")!;
    const totpSecret = Deno.env.get("CENTUMPAY_TOTP_SECRET")!;
    const apiHash = Deno.env.get("CENTUMPAY_API_HASH")!;
    const env = Deno.env.get("CENTUMPAY_ENV") || "test";
    const webSite = Deno.env.get("CENTUMPAY_WEBSITE_URL")!;

    const ecommBase =
      env === "prod"
        ? "https://ecommapi-centumpay.centum.mx/ecommerce"
        : "https://test-ecommapi-centumpay.centum.mx/ecommerce";

    const checkoutBase =
      env === "prod"
        ? "https://api-centumpay.centum.mx/CheckOut"
        : "https://test-api-centumpay.centum.mx/CheckOut";

    const {
      items,
      total,
      subtotal,
      discount = 0,
      orderNumber,
      customerEmail,
      customerName,
    } = await req.json();

    // Build concept array from cart items
    const concept = items.map((item: any) => ({
      item: item.name,
      cant: item.quantity,
      price: Math.round(item.price * item.quantity),
    }));

    // Generate auth token
    const totp = await generateTOTP(totpSecret);
    const token = await generateAuthToken(apiKey, totp, apiSecret);

    const payload = {
      group: "wmx_api",
      method: "get_token",
      token,
      api_key: apiKey,
      data: {
        web_site: webSite,
        order_details: {
          wl_name: "wl_centumpay",
          my_id: {
            order_id: orderNumber,
            customer_email: customerEmail,
            customer_name: customerName,
          },
        },
        tx_info: {
          cart: {
            description: "Pedido Raw Paw",
            concept,
            discount: Math.round(discount),
            subtotal: Math.round(subtotal),
            total: Math.round(total),
          },
        },
      },
    };

    console.log("CentumPay request to:", ecommBase);

    const response = await fetch(ecommBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("CentumPay response:", JSON.stringify(result));

    if (result?.status?.code !== "0" && result?.status?.code !== 0) {
      const desc =
        result?.status?.description ||
        result?.message ||
        "Error desconocido de CentumPay";
      return new Response(
        JSON.stringify({ error: desc }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const saleToken = result?.payload?.token || result?.payload?.[0]?.token;
    if (!saleToken) {
      return new Response(
        JSON.stringify({ error: "No se recibió token de venta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const checkoutUrl = `${checkoutBase}?ApiKey=${encodeURIComponent(apiKey)}&Token=${encodeURIComponent(saleToken)}&Hash=${encodeURIComponent(apiHash)}`;

    return new Response(
      JSON.stringify({ checkoutUrl, saleToken }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("centumpay-checkout error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno al procesar pago" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
