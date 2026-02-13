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

    const logoUrl = "https://gdnnxuxirkqsogcqmrps.supabase.co/storage/v1/object/public/email-assets/logo-rawpaw.png";

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
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ECEBE6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ECEBE6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px rgba(63, 52, 43, 0.08);">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td style="background-color: #3F342B; padding: 32px 30px; text-align: center;">
                      <img src="${logoUrl}" alt="Raw Paw" width="180" style="display: block; margin: 0 auto;" />
                    </td>
                  </tr>

                  <!-- Green accent bar -->
                  <tr>
                    <td style="background: linear-gradient(90deg, #677755, #CAD8A3); height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 48px 40px 32px 40px;">
                      <h2 style="color: #3F342B; margin: 0 0 8px 0; font-size: 26px; font-weight: 700;">
                        ¡Hola! 🐾
                      </h2>
                      <h3 style="color: #677755; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">
                        Restablece tu contraseña
                      </h3>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color: #3F342B;">Raw Paw</strong>.
                      </p>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 32px 0;">
                        Haz clic en el siguiente botón para crear una nueva contraseña:
                      </p>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 36px 0;">
                        <a href="${recoveryLink}" 
                           style="display: inline-block; background-color: #677755; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">
                          Restablecer contraseña
                        </a>
                      </div>
                      
                      <!-- Info box -->
                      <div style="background-color: #f4f6f0; border-radius: 16px; padding: 20px 24px; margin: 32px 0; border-left: 4px solid #CAD8A3;">
                        <p style="color: #718096; font-size: 13px; line-height: 1.6; margin: 0;">
                          ⏰ Este enlace expirará en <strong>1 hora</strong>. Si no puedes hacer clic en el botón, 
                          copia y pega el siguiente enlace en tu navegador:
                        </p>
                        <p style="color: #677755; font-size: 11px; word-break: break-all; margin: 12px 0 0 0; font-family: monospace;">
                          ${recoveryLink}
                        </p>
                      </div>
                      
                      <p style="color: #a0aec0; font-size: 13px; line-height: 1.6; margin: 24px 0 0 0;">
                        Si no solicitaste restablecer tu contraseña, simplemente ignora este correo. 
                        Tu cuenta permanecerá segura. 🔒
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #3F342B; padding: 28px 30px; text-align: center;">
                      <p style="color: #CAD8A3; font-size: 14px; margin: 0 0 6px 0; font-weight: 600;">
                        Raw Paw — la nueva forma de cuidarlos
                      </p>
                      <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0;">
                        Puebla, México · WhatsApp: +52 221 360 6464
                      </p>
                      <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 12px 0 0 0;">
                        © ${new Date().getFullYear()} Raw Paw. Todos los derechos reservados.
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
