import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const formData = await req.formData();
    const token = formData.get("token") as string;
    const file = formData.get("file") as File;

    if (!token || !file) {
      return new Response(
        JSON.stringify({ error: "Token and file are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return new Response(
        JSON.stringify({ error: "Only images are allowed" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File size must be less than 5MB" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create service client to bypass RLS
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate token and get order - use the existing RPC function
    const { data: orderData, error: orderError } = await serviceClient
      .rpc("get_order_by_token", { p_token: token });

    if (orderError || !orderData || orderData.length === 0) {
      console.error("Token validation failed:", orderError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired delivery token" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const order = orderData[0];

    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${order.id}-${Date.now()}.${fileExt}`;
    const filePath = `deliveries/${fileName}`;

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to storage using service client (bypasses RLS)
    const { error: uploadError } = await serviceClient.storage
      .from("delivery-photos")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload photo" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate signed URL (valid for 7 days to match token expiration)
    const { data: signedUrlData, error: signedUrlError } = await serviceClient.storage
      .from("delivery-photos")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", signedUrlError);
      return new Response(
        JSON.stringify({ error: "Failed to generate photo URL" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Delivery photo uploaded successfully for order ${order.order_number}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: signedUrlData.signedUrl,
        path: filePath 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in upload-delivery-photo:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

Deno.serve(handler);
