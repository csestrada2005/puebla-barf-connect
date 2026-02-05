import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderData {
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  order_type: "single" | "subscription";
  pet_info?: string;
  delivery_notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const orderData: OrderData = await req.json();
    console.log("Received order data:", JSON.stringify(orderData, null, 2));

    // Get webhook URL from app_config
    const { data: config, error: configError } = await supabaseClient
      .from("app_config")
      .select("value")
      .eq("key", "zapier_webhook_url")
      .maybeSingle();

    if (configError) {
      console.error("Error fetching config:", configError);
      throw new Error("Failed to fetch webhook configuration");
    }

    const webhookUrl = config?.value as string | null;

    if (!webhookUrl) {
      console.log("No webhook URL configured, skipping sync");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No webhook URL configured, sync skipped" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending to webhook:", webhookUrl);

    // Format items for the sheet
    const itemsList = orderData.items
      .map((item: any) => `${item.name} x${item.quantity}`)
      .join(", ");

    // Prepare payload for Zapier
    const payload = {
      fecha: new Date(orderData.created_at).toLocaleString("es-MX", {
        timeZone: "America/Mexico_City",
      }),
      orden: orderData.order_number,
      tipo: orderData.order_type === "subscription" ? "Suscripción" : "Pedido",
      cliente: orderData.customer_name,
      telefono: orderData.customer_phone,
      direccion: orderData.customer_address,
      productos: itemsList,
      subtotal: orderData.subtotal,
      envio: orderData.delivery_fee,
      total: orderData.total,
      pago: orderData.payment_method === "efectivo" ? "Efectivo" : "Tarjeta",
      mascota: orderData.pet_info || "",
      notas: orderData.delivery_notes || "",
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    // Send to Zapier webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Webhook response status:", webhookResponse.status);

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("Webhook error:", errorText);
      throw new Error(`Webhook failed: ${webhookResponse.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Synced to sheets" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in sync-to-sheets:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
