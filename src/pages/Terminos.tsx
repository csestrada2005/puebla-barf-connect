import { Layout } from "@/components/layout";

export default function Terminos() {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1>Términos y Condiciones</h1>
          <p className="lead">
            Última actualización: Enero 2026
          </p>

          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar el sitio web de Raw Paw y realizar compras a través de él, 
            aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con 
            alguna parte de estos términos, no debes usar nuestro servicio.
          </p>

          <h2>2. Productos y Servicios</h2>
          <p>
            Raw Paw ofrece alimentos naturales tipo BARF para perros. Nuestros productos son:
          </p>
          <ul>
            <li>Elaborados con ingredientes frescos y naturales</li>
            <li>Diseñados para complementar la dieta de tu mascota</li>
            <li>No sustituyen la consulta veterinaria</li>
          </ul>

          <h2>3. Zona de Cobertura</h2>
          <p>
            Actualmente entregamos exclusivamente en zonas seleccionadas de Puebla, México. 
            Puedes verificar tu cobertura en nuestra sección correspondiente.
          </p>

          <h2>4. Precios y Pagos</h2>
          <p>
            Los precios están expresados en pesos mexicanos (MXN) e incluyen IVA. 
            Aceptamos pago en efectivo contra entrega. Próximamente habilitaremos 
            pagos con tarjeta.
          </p>

          <h2>5. Entregas</h2>
          <p>
            Realizamos entregas en un plazo de 24-48 horas hábiles después de confirmar 
            tu pedido por WhatsApp. Te notificaremos 2 días antes de cada entrega 
            programada en caso de suscripciones.
          </p>

          <h2>6. Suscripciones</h2>
          <h3>Plan Mensual</h3>
          <ul>
            <li>Puedes cambiar de línea de producto cada mes</li>
            <li>Acepta pago en efectivo</li>
            <li>Sin permanencia mínima</li>
          </ul>
          <h3>Plan Anual</h3>
          <ul>
            <li>Línea de producto fija durante el año</li>
            <li>Requiere pago con tarjeta</li>
            <li>Cancelación disponible 2 semanas después del pago</li>
            <li>15% de descuento sobre precio mensual</li>
          </ul>

          <h2>7. Cancelaciones y Devoluciones</h2>
          <p>
            Puedes cancelar tu suscripción en cualquier momento sin penalización 
            (excepto planes anuales según lo indicado). Para productos perecederos, 
            no aceptamos devoluciones una vez entregados, salvo defectos de calidad.
          </p>

          <h2>8. Contacto</h2>
          <p>
            Para cualquier duda o aclaración, contáctanos por WhatsApp al +52 221 360 6464.
          </p>
        </div>
      </div>
    </Layout>
  );
}
