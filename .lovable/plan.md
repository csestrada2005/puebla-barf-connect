
# Plan: Conectar Pedidos y Suscripciones a Google Sheets

## Objetivo
Enviar automáticamente cada pedido nuevo y cada suscripción nueva a un Google Sheet para tener un registro centralizado y fácil de consultar.

---

## Solución Propuesta: Webhook con Zapier

Esta es la opción más sencilla y no requiere configurar APIs de Google.

### Flujo de Datos

```text
Usuario hace pedido/suscripción
           ↓
    Checkout.tsx guarda en DB
           ↓
    Edge Function "sync-to-sheets"
           ↓
    Webhook de Zapier
           ↓
    Google Sheets (automático)
```

---

## Pasos de Implementación

### 1. Crear Edge Function `sync-to-sheets`

Una función backend que recibe los datos del pedido y los envía al webhook de Zapier.

**Datos que se enviarán:**
- Número de orden
- Fecha y hora
- Nombre del cliente
- Teléfono
- Dirección
- Productos (listado)
- Subtotal
- Envío
- Total
- Método de pago
- Tipo (Pedido único o Suscripción)
- Info de la mascota (si existe)

### 2. Modificar `Checkout.tsx`

Después de guardar el pedido en la base de datos, llamar a la Edge Function para sincronizar con Sheets.

### 3. Modificar flujo de Suscripción

Cuando se cree una suscripción, también llamar a la Edge Function.

### 4. Configuración en Zapier (la haces tú)

1. Crear un Zap nuevo
2. Trigger: **Webhooks by Zapier** → **Catch Hook**
3. Action: **Google Sheets** → **Create Spreadsheet Row**
4. Copiar la URL del webhook y pegarla en la app

---

## Cambios Técnicos

### Archivos a Crear
| Archivo | Descripción |
|---------|-------------|
| `supabase/functions/sync-to-sheets/index.ts` | Edge Function que recibe datos y llama al webhook |

### Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `src/pages/Checkout.tsx` | Llamar a `sync-to-sheets` después de crear el pedido |
| `src/pages/Suscripcion.tsx` | Llamar a `sync-to-sheets` cuando se agregue suscripción al carrito |
| `supabase/config.toml` | Agregar configuración de la nueva función |

### UI para Webhook URL

Agregaré un campo en el panel de Admin para que puedas pegar la URL del webhook de Zapier sin tocar código.

---

## Estructura del Google Sheet Resultante

| Columna | Ejemplo |
|---------|---------|
| Fecha | 2026-02-05 14:30 |
| Orden # | RP-ABC123-XYZ |
| Tipo | Pedido / Suscripción |
| Cliente | Juan Pérez |
| Teléfono | 221 360 6464 |
| Dirección | Calle Principal #123, Angelópolis |
| Productos | BARF Res 1kg x2 |
| Subtotal | $580 |
| Envío | $50 |
| Total | $630 |
| Pago | Efectivo |
| Mascota | Golden Retriever - 25kg |

---

## Alternativa: Sin Zapier (Google Sheets API directa)

Si prefieres no usar Zapier, puedo configurar la integración directa con Google Sheets API, pero requiere:
1. Crear un proyecto en Google Cloud Console
2. Habilitar la API de Google Sheets
3. Crear credenciales de servicio
4. Compartir el Sheet con la cuenta de servicio

Esta opción es más compleja pero no tiene límites de uso.

---

## Recomendación

Empezar con **Zapier** por simplicidad. Es gratis hasta cierto número de tareas mensuales y muy fácil de configurar.

¿Apruebas el plan para implementar la integración con Zapier?
