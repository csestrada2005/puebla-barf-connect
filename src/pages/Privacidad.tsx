import { Layout } from "@/components/layout";

export default function Privacidad() {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1>Aviso de Privacidad</h1>
          <p className="lead">
            Última actualización: Enero 2026
          </p>

          <h2>Responsable del tratamiento</h2>
          <p>
            Raw Paw, con domicilio en Puebla, México, es responsable del tratamiento 
            de tus datos personales conforme a la Ley Federal de Protección de Datos 
            Personales en Posesión de los Particulares.
          </p>

          <h2>Datos que recopilamos</h2>
          <p>Para procesar tus pedidos y brindarte nuestro servicio, recopilamos:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Número de teléfono (WhatsApp)</li>
            <li>Dirección de entrega</li>
            <li>Correo electrónico (opcional)</li>
            <li>Información de tu mascota (nombre, raza, peso)</li>
          </ul>

          <h2>Finalidades del tratamiento</h2>
          <p>Utilizamos tus datos para:</p>
          <ul>
            <li>Procesar y entregar tus pedidos</li>
            <li>Comunicarnos contigo sobre tu pedido o suscripción</li>
            <li>Personalizar recomendaciones de productos</li>
            <li>Enviarte información promocional (con tu consentimiento)</li>
            <li>Mejorar nuestros servicios</li>
          </ul>

          <h2>Compartición de datos</h2>
          <p>
            No vendemos ni compartimos tus datos personales con terceros, excepto 
            cuando sea necesario para completar tu entrega o cumplir con obligaciones legales.
          </p>

          <h2>Derechos ARCO</h2>
          <p>
            Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento 
            de tus datos personales. Para ejercer estos derechos, contáctanos por 
            WhatsApp al +52 221 360 6464.
          </p>

          <h2>Seguridad</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger 
            tus datos personales contra acceso no autorizado, pérdida o alteración.
          </p>

          <h2>Cookies</h2>
          <p>
            Nuestro sitio web utiliza cookies para mejorar tu experiencia de navegación. 
            Puedes configurar tu navegador para rechazar cookies, aunque esto podría 
            afectar algunas funcionalidades.
          </p>

          <h2>Cambios al aviso</h2>
          <p>
            Nos reservamos el derecho de modificar este aviso de privacidad. 
            Cualquier cambio será publicado en esta página con la fecha de actualización.
          </p>

          <h2>Contacto</h2>
          <p>
            Para cualquier duda sobre el tratamiento de tus datos personales, 
            contáctanos por WhatsApp al +52 221 360 6464.
          </p>
        </div>
      </div>
    </Layout>
  );
}
