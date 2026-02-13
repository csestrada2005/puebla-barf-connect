import { Resend } from "resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logoUrl = "https://gdnnxuxirkqsogcqmrps.supabase.co/storage/v1/object/public/email-assets/logo-rawpaw.png";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, petName, familyName, planType, protein, frequency, weeklyKg } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const displayPet = petName || "tu peludo";
    const displayFamily = familyName || "";
    const displayPlan = planType === "anual" ? "Anual (15% descuento)" : "Mensual";
    const displayProtein = protein || "Mixta";
    const displayFrequency = frequency || "Quincenal";
    const displayKg = weeklyKg ? `${weeklyKg} kg/semana` : "";

    const emailResponse = await resend.emails.send({
      from: "Raw Paw <hola@rawpaw.store>",
      to: [email],
      subject: `¡Suscripción activada para ${displayPet}! 🎉 | Raw Paw`,
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
                  
                  <tr>
                    <td style="background-color: #3F342B; padding: 32px 30px; text-align: center;">
                      <img src="${logoUrl}" alt="Raw Paw" width="180" style="display: block; margin: 0 auto;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="background: linear-gradient(90deg, #677755, #CAD8A3); height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 48px 40px 32px 40px;">
                      <h2 style="color: #3F342B; margin: 0 0 8px 0; font-size: 26px; font-weight: 700;">
                        ¡Suscripción activada! 🎉
                      </h2>
                      <h3 style="color: #677755; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">
                        ${displayPet} ya tiene su plan Raw Paw
                      </h3>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                        Hola${displayFamily ? ` familia ${displayFamily}` : ""}, 👋
                      </p>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
                        ¡Excelente decisión! A partir de ahora, <strong style="color: #677755;">${displayPet}</strong> recibirá la mejor alimentación natural BARF directamente en tu puerta. 🚪🐾
                      </p>
                      
                      <!-- Plan details box -->
                      <div style="background-color: #f4f6f0; border-radius: 16px; padding: 24px; margin: 28px 0; border-left: 4px solid #CAD8A3;">
                        <h3 style="color: #677755; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">📋 Detalles de tu plan</h3>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color: #718096; font-size: 14px; padding: 6px 0;">Plan:</td>
                            <td style="color: #3F342B; font-size: 14px; padding: 6px 0; font-weight: 600; text-align: right;">${displayPlan}</td>
                          </tr>
                          <tr>
                            <td style="color: #718096; font-size: 14px; padding: 6px 0;">Proteína:</td>
                            <td style="color: #3F342B; font-size: 14px; padding: 6px 0; font-weight: 600; text-align: right;">${displayProtein}</td>
                          </tr>
                          <tr>
                            <td style="color: #718096; font-size: 14px; padding: 6px 0;">Frecuencia:</td>
                            <td style="color: #3F342B; font-size: 14px; padding: 6px 0; font-weight: 600; text-align: right;">${displayFrequency}</td>
                          </tr>
                          ${displayKg ? `<tr>
                            <td style="color: #718096; font-size: 14px; padding: 6px 0;">Cantidad:</td>
                            <td style="color: #3F342B; font-size: 14px; padding: 6px 0; font-weight: 600; text-align: right;">${displayKg}</td>
                          </tr>` : ""}
                          <tr>
                            <td style="color: #718096; font-size: 14px; padding: 6px 0;">Para:</td>
                            <td style="color: #3F342B; font-size: 14px; padding: 6px 0; font-weight: 600; text-align: right;">🐕 ${displayPet}</td>
                          </tr>
                        </table>
                      </div>

                      <div style="background-color: #faf5f0; border-radius: 16px; padding: 20px 24px; margin: 28px 0; border: 2px solid #e8ddd3;">
                        <p style="color: #3F342B; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">
                          📦 ¿Qué sigue?
                        </p>
                        <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0;">
                          Prepararemos tu primer pedido y te contactaremos para coordinar la entrega. 
                          ¡${displayPet} va a amar cada bocado!
                        </p>
                      </div>
                      
                      <div style="text-align: center; margin: 36px 0;">
                        <a href="https://rawpaw.store/mi-cuenta" 
                           style="display: inline-block; background-color: #677755; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">
                          Ver mi suscripción 📋
                        </a>
                      </div>
                      
                      <p style="color: #a0aec0; font-size: 13px; line-height: 1.6; margin: 24px 0 0 0;">
                        ¿Tienes dudas? Escríbenos por WhatsApp al +52 221 360 6464. 
                        Estamos para servirte. 💚
                      </p>
                    </td>
                  </tr>
                  
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

    console.log("Subscription confirmation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending subscription email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
