import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeliveryOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total: number;
  delivery_notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate the request - only authenticated admin users can notify drivers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - no user ID in token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin using service role client
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - admin access required' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin", userId, "requesting driver notification");

    // Get driver phone from app_config
    const { data: phoneConfig, error: phoneError } = await serviceClient
      .from("app_config")
      .select("value")
      .eq("key", "driver_phone")
      .maybeSingle();

    if (phoneError) {
      console.error("Error fetching driver phone:", phoneError);
      throw new Error("Failed to fetch driver phone configuration");
    }

    const driverPhone = phoneConfig?.value as string | null;

    if (!driverPhone) {
      console.log("No driver phone configured, skipping notification");
      return new Response(
        JSON.stringify({
          success: false,
          message: "No driver phone configured",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Driver phone found:", driverPhone);

    // Get today's date in Mexico timezone
    const today = new Date();
    const mexicoDate = today.toLocaleDateString("es-MX", {
      timeZone: "America/Mexico_City",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Get orders with status "confirmed" for delivery
    const { data: orders, error: ordersError } = await serviceClient
      .from("orders")
      .select("*")
      .eq("status", "confirmed")
      .order("created_at", { ascending: true });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      throw new Error("Failed to fetch orders");
    }

    console.log(`Found ${orders?.length || 0} confirmed orders`);

    if (!orders || orders.length === 0) {
      console.log("No orders to deliver today");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No orders to deliver today",
          orderCount: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format message for WhatsApp
    const formatItems = (items: any[]): string => {
      if (!items || !Array.isArray(items)) return "—";
      return items.map((item: any) => `${item.name} x${item.quantity}`).join(", ");
    };

    let message = `🚚 *ENTREGAS DE HOY*\n`;
    message += `📅 ${mexicoDate}\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;

    orders.forEach((order: DeliveryOrder, index: number) => {
      message += `📦 *Entrega ${index + 1}*\n`;
      message += `🔢 Orden: ${order.order_number}\n`;
      message += `👤 ${order.customer_name}\n`;
      message += `📞 ${order.customer_phone}\n`;
      message += `📍 ${order.customer_address}\n`;
      message += `🛒 ${formatItems(order.items)}\n`;
      message += `💰 Total: $${order.total}\n`;
      if (order.delivery_notes) {
        message += `📝 Notas: ${order.delivery_notes}\n`;
      }
      message += `\n`;
    });

    message += `━━━━━━━━━━━━━━━━\n`;
    message += `📊 Total de entregas: ${orders.length}`;

    console.log("Message prepared, length:", message.length);

    // Create WhatsApp link (using wa.me API)
    const whatsappNumber = `52${driverPhone}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Log the message for debugging
    console.log("WhatsApp message:", message);
    console.log("WhatsApp link generated");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Driver notification prepared",
        orderCount: orders.length,
        driverPhone: `+52${driverPhone}`,
        whatsappLink,
        notificationMessage: message,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in notify-driver:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
