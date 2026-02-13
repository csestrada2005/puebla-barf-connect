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

function isBase32(s: string): boolean {
  return /^[A-Z2-7=\s]+$/i.test(s) && s.length >= 8;
}

// ── TOTP (RFC 6238) ──────────────────────────────────────────────────
async function generateTOTP(secret: string): Promise<string> {
  const epoch = Math.floor(Date.now() / 1000);
  const T = Math.floor(epoch / 30);
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(4, T, false);

  let keyBytes: Uint8Array;
  if (isBase32(secret)) {
    keyBytes = base32Decode(secret);
  } else {
    keyBytes = new TextEncoder().encode(secret);
  }

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, buf));
  const offset = sig[sig.length - 1] & 0x0f;
  const code =
    ((sig[offset] & 0x7f) << 24) |
    ((sig[offset + 1] & 0xff) << 16) |
    ((sig[offset + 2] & 0xff) << 8) |
    (sig[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, "0");
}

async function generateAuthToken(
  apiKey: string,
  totp: string,
  apiSecret: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(apiKey + totp)),
  );
  return Array.from(sig)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("CENTUMPAY_API_KEY")!;
    const apiSecret = Deno.env.get("CENTUMPAY_API_SECRET")!;
    const totpSecret = Deno.env.get("CENTUMPAY_TOTP_SECRET")!;
    const env = Deno.env.get("CENTUMPAY_ENV") || "test";
    const webSite = Deno.env.get("CENTUMPAY_WEBSITE_URL")!;

    const ecommBase =
      env === "prod"
        ? "https://ecommapi-centumpay.centum.mx/ecommerce"
        : "https://test-ecommapi-centumpay.centum.mx/ecommerce";

    const { saleToken } = await req.json();

    const totp = await generateTOTP(totpSecret);
    const token = await generateAuthToken(apiKey, totp, apiSecret);

    const payload = {
      group: "wmx_api",
      method: "token_status",
      token,
      api_key: apiKey,
      data: {
        web_site: webSite,
        sale_token: saleToken,
      },
    };

    const response = await fetch(ecommBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("CentumPay status response:", JSON.stringify(result));

    const status = result?.payload?.status || result?.payload?.[0]?.status || "unknown";

    return new Response(
      JSON.stringify({ status, raw: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("centumpay-status error:", err);
    return new Response(
      JSON.stringify({ error: "Error consultando estado de pago" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
