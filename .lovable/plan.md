
# Plan: Conexión Directa a Google Sheets

## Resumen

Vamos a reemplazar la integración actual con Zapier por una conexión directa a Google Sheets usando la API de Google. Esto elimina la dependencia de Zapier y permite sincronizar pedidos automáticamente a tu hoja de cálculo.

---

## Lo que necesitas preparar

Antes de implementar, necesitarás crear una **Service Account** en Google Cloud:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o usa uno existente
3. Habilita la **Google Sheets API**
4. Crea una **Service Account** (Cuenta de Servicio)
5. Descarga las credenciales JSON de la Service Account
6. Comparte tu hoja de Google Sheets con el email de la Service Account (ej: `mi-cuenta@proyecto.iam.gserviceaccount.com`)

---

## Cambios a realizar

### 1. Agregar secretos necesarios

Se solicitarán dos secretos:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - El email de la Service Account
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` - La clave privada de la Service Account

### 2. Actualizar la Edge Function `sync-to-sheets`

La función actual que envía a Zapier será reemplazada por una que:
- Se autentica directamente con Google usando JWT
- Obtiene el ID del spreadsheet desde `app_config` (en lugar del webhook URL)
- Agrega filas directamente a Google Sheets usando la API

### 3. Actualizar la página de Admin

En la sección de Configuración:
- Cambiar el campo "Zapier Webhook URL" por "Google Sheets ID"
- El ID es la parte de la URL de tu sheet: `https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit`

### 4. Actualizar la tabla `app_config`

- Renombrar/reemplazar la clave `zapier_webhook_url` por `google_sheets_id`

---

## Flujo técnico

```text
Pedido completado
      |
      v
Edge Function "sync-to-sheets"
      |
      v
Autenticación JWT con Google
      |
      v
Google Sheets API (append row)
      |
      v
Nueva fila en tu spreadsheet
```

---

## Columnas en Google Sheets

La hoja debe tener estas columnas (en orden):
1. Fecha
2. Orden
3. Tipo
4. Cliente
5. Teléfono
6. Dirección
7. Productos
8. Subtotal
9. Envío
10. Total
11. Pago
12. Mascota
13. Notas

---

## Sección técnica

### Edge Function - Autenticación Google

Se implementará autenticación JWT para Google APIs:

```typescript
// Crear JWT token para Google API
const createJWT = async (email: string, privateKey: string) => {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  // Sign with RSA-SHA256
  // ...
};
```

### API Call a Google Sheets

```typescript
// Append row to sheet
await fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:M:append?valueInputOption=USER_ENTERED`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [[fecha, orden, tipo, cliente, telefono, direccion, productos, subtotal, envio, total, pago, mascota, notas]],
    }),
  }
);
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/sync-to-sheets/index.ts` | Reescribir para usar Google Sheets API directamente |
| `src/pages/Admin.tsx` | Actualizar UI de configuración (Google Sheets ID en lugar de Zapier) |

---

## Beneficios vs Zapier

- **Sin costo extra** - No necesitas plan de Zapier
- **Más rápido** - Conexión directa sin intermediario
- **Más control** - Puedes personalizar exactamente qué datos enviar
- **Más confiable** - Menos puntos de falla

