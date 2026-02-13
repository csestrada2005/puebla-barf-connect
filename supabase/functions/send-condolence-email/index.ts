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
    const { email, petName, familyName } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const displayPet = petName || "tu compañero";
    const displayFamily = familyName || "";

    const emailResponse = await resend.emails.send({
      from: "Raw Paw <hola@rawpaw.store>",
      to: [email],
      subject: `${displayPet}, siempre en nuestro corazón 🕊️ | Raw Paw`,
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
                        Sentimos mucho tu pérdida 🕊️
                      </h2>
                      <h3 style="color: #677755; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">
                        ${displayPet} siempre será parte de nuestra familia
                      </h3>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                        Querida familia${displayFamily ? ` ${displayFamily}` : ""},
                      </p>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                        No hay palabras que alcancen para expresar lo que sentimos al saber que <strong style="color: #3F342B;">${displayPet}</strong> ya no está con ustedes. 
                        Sabemos lo difícil que es este momento y queremos que sepan que los acompañamos de corazón.
                      </p>

                      <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                        ${displayPet} fue un miembro especial de la manada Raw Paw, y nos dio mucha alegría saber que sus últimos platitos fueron preparados con todo el amor que se merecía. 💚
                      </p>
                      
                      <div style="background-color: #faf5f0; border-radius: 16px; padding: 28px; margin: 32px 0; border: 2px solid #e8ddd3; text-align: center;">
                        <p style="color: #3F342B; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                          🎁 Queremos mandarte un detalle
                        </p>
                        <p style="color: #4a5568; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
                          Nos gustaría enviarte un pequeño regalo en memoria de ${displayPet}. 
                          Es nuestra forma de decirte: <em>gracias por confiar en nosotros</em>.
                        </p>
                        <p style="color: #677755; font-size: 15px; line-height: 1.7; margin: 0; font-weight: 600;">
                          Escríbenos por WhatsApp y dinos qué día te gustaría recibirlo. 
                          Estaremos ahí. 🤍
                        </p>
                      </div>
                      
                      <div style="text-align: center; margin: 36px 0;">
                        <a href="https://wa.me/522213606464?text=Hola%20Raw%20Paw%2C%20me%20gustaría%20recibir%20el%20detalle%20en%20memoria%20de%20${encodeURIComponent(displayPet)}" 
                           style="display: inline-block; background-color: #677755; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">
                          Escribir por WhatsApp 💬
                        </a>
                      </div>

                      <div style="text-align: center; margin: 24px 0; padding: 20px;">
                        <p style="color: #a0aec0; font-size: 22px; margin: 0 0 8px 0;">🐾</p>
                        <p style="color: #718096; font-size: 14px; font-style: italic; line-height: 1.6; margin: 0;">
                          "No se fueron, solo cruzaron el arcoíris.<br/>
                          Y desde ahí, siguen moviendo la cola por ti."
                        </p>
                      </div>
                      
                      <p style="color: #a0aec0; font-size: 13px; line-height: 1.6; margin: 24px 0 0 0;">
                        Con mucho cariño,<br/>
                        Todo el equipo de Raw Paw 💚
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

    console.log("Condolence email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending condolence email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
