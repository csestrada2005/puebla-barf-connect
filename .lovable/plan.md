
# Plan: Conectar Pedidos y Suscripciones a Google Sheets

## Estado: ✅ IMPLEMENTADO

---

## Lo que se implementó

### 1. Edge Function `sync-to-sheets`
- Recibe datos del pedido/suscripción
- Lee la URL del webhook desde `app_config`
- Envía los datos formateados a Zapier

### 2. Integración en Checkout
- Después de guardar cada pedido, se llama automáticamente a `sync-to-sheets`
- Funciona para pedidos únicos y suscripciones

### 3. Panel de Admin → Configuración
- Nueva sección "Configuración" en el menú lateral
- Campo para pegar la URL del webhook de Zapier
- Instrucciones paso a paso para configurar Zapier

---

## Próximos pasos (los haces tú)

1. **Crea tu cuenta en Zapier**: [zapier.com](https://zapier.com)
2. **Crea un nuevo Zap**:
   - Trigger: **Webhooks by Zapier** → **Catch Hook**
   - Action: **Google Sheets** → **Create Spreadsheet Row**
3. **Copia la URL del webhook** que te da Zapier
4. **Pégala en Admin → Configuración**
5. **Mapea los campos** en Zapier a tu hoja de cálculo

---

## Datos que se envían al webhook

| Campo | Descripción |
|-------|-------------|
| `fecha` | Fecha y hora del pedido |
| `orden` | Número de orden (RP-XXX-YYY) |
| `tipo` | "Pedido" o "Suscripción" |
| `cliente` | Nombre del cliente |
| `telefono` | Teléfono de contacto |
| `direccion` | Dirección de entrega |
| `productos` | Lista de productos |
| `subtotal` | Subtotal en pesos |
| `envio` | Costo de envío |
| `total` | Total a cobrar |
| `pago` | Método de pago |
| `mascota` | Info de la mascota (si existe) |
| `notas` | Notas de entrega |
