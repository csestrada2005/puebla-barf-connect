import { Resend } from "resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectTo } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate recovery link using admin API
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: redirectTo || "https://rawpaw.store/restablecer-contrasena",
      },
    });

    if (error) {
      console.error("Error generating link:", error);
      // Don't reveal if user exists or not
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recoveryLink = data?.properties?.action_link;
    if (!recoveryLink) {
      console.error("No action_link in response");
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send branded email via Resend
    const emailResponse = await resend.emails.send({
      from: "Raw Paw <hola@rawpaw.mx>",
      to: [email],
      subject: "Restablece tu contraseña 🔑 | Raw Paw",
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
                        Restablece tu contraseña 🔑
                      </h2>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en Raw Paw. 
                        Si no realizaste esta solicitud, puedes ignorar este correo.
                      </p>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Haz clic en el siguiente botón para crear una nueva contraseña:
                      </p>
                      
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${recoveryLink}" 
                           style="display: inline-block; background-color: #5a7c65; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                          Restablecer contraseña
                        </a>
                      </div>
                      
                      <div style="background-color: #f0f5f1; border-radius: 12px; padding: 20px; margin: 24px 0;">
                        <p style="color: #718096; font-size: 13px; line-height: 1.6; margin: 0;">
                          ⏰ Este enlace expirará en <strong>1 hora</strong>. Si no puedes hacer clic en el botón, 
                          copia y pega el siguiente enlace en tu navegador:
                        </p>
                        <p style="color: #5a7c65; font-size: 12px; word-break: break-all; margin: 10px 0 0 0;">
                          ${recoveryLink}
                        </p>
                      </div>
                      
                      <p style="color: #a0aec0; font-size: 13px; line-height: 1.6; margin: 20px 0 0 0;">
                        Si no solicitaste restablecer tu contraseña, simplemente ignora este correo. 
                        Tu cuenta permanecerá segura.
                      </p>
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

    console.log("Recovery email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending recovery email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
