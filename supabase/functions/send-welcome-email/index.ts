import { Resend } from "resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  petName: string;
  familyName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request - only authenticated users can send welcome emails
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing authorization header' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - no user ID in token' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, petName, familyName }: WelcomeEmailRequest = await req.json();

    // Validate required fields
    if (!email || !petName || !familyName) {
      throw new Error("Missing required fields: email, petName, familyName");
    }

    // Additional validation: email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // SECURITY: Verify email matches the authenticated user's profile
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify email ownership' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!profile || profile.email.toLowerCase() !== email.toLowerCase()) {
      console.warn(`Email mismatch: requested ${email}, profile has ${profile?.email}`);
      return new Response(
        JSON.stringify({ error: 'Email does not match user profile' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending welcome email to ${email} for pet ${petName} (verified user ${userId})`);

    const emailResponse = await resend.emails.send({
      from: "Raw Paw <hola@rawpaw.mx>",
      to: [email],
      subject: `¡Bienvenido a Raw Paw, familia ${familyName}! 🐾`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f4f0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f4f0; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #5a7c65 0%, #4a6b55 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🐾 Raw Paw</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">la nueva forma de cuidarlos</p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px;">
                        ¡Hola familia ${familyName}! 👋
                      </h2>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Estamos muy emocionados de que <strong style="color: #5a7c65;">${petName}</strong> se una a la familia Raw Paw. 
                        Has tomado la mejor decisión para la salud de tu mejor amigo.
                      </p>
                      
                      <div style="background-color: #f0f5f1; border-radius: 12px; padding: 24px; margin: 24px 0;">
                        <h3 style="color: #5a7c65; margin: 0 0 16px 0; font-size: 18px;">🥩 ¿Qué sigue?</h3>
                        <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li>Explora nuestra tienda de productos BARF</li>
                          <li>Usa nuestro recomendador con IA para encontrar el plan perfecto para ${petName}</li>
                          <li>¡Recibe entregas frescas directamente en tu puerta!</li>
                        </ul>
                      </div>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        Si tienes alguna duda, no dudes en contactarnos por WhatsApp. 
                        Estamos aquí para ayudarte en cada paso del camino.
                      </p>
                      
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="https://puebla-barf-connect.lovable.app/tienda" 
                           style="display: inline-block; background-color: #5a7c65; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                          Ir a la Tienda 🛒
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f4f0; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #718096; font-size: 14px; margin: 0 0 8px 0;">
                        <strong>Raw Paw</strong> - Alimentación natural para perros
                      </p>
                      <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                        Puebla, México | WhatsApp: +52 221 360 6464
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);
