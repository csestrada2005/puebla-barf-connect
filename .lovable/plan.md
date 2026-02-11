
# Integracion de CentumPay Checkout

## Resumen

Se agregara CentumPay como metodo de pago con tarjeta, reemplazando el placeholder "Proximamente" actual. Todo lo sensible (API Key, Secret, TOTP, Hash) se manejara en una Edge Function del backend. El flujo visual del checkout no cambiara; solo se habilitara el boton de tarjeta y se agregara la logica de redireccion.

## Paso 0: Configurar Secretos

Se solicitaran 5 secretos para almacenar de forma segura en el backend:

- `CENTUMPAY_API_KEY`
- `CENTUMPAY_API_SECRET`
- `CENTUMPAY_TOTP_SECRET`
- `CENTUMPAY_API_HASH`
- `CENTUMPAY_ENV` (valor: `test` o `prod`)
- `CENTUMPAY_WEBSITE_URL` (URL registrada del comercio)

## Paso 1: Edge Function `centumpay-checkout`

Crear `supabase/functions/centumpay-checkout/index.ts` que:

1. Recibe POST con `{ items, total, subtotal, discount, orderNumber, customerEmail, customerName }`
2. Genera TOTP de 6 digitos usando `CENTUMPAY_TOTP_SECRET` (algoritmo TOTP estandar, periodo 30s)
3. Concatena `api_key + totp` y genera HMAC-SHA256 con `CENTUMPAY_API_SECRET` como clave
4. Hace POST al endpoint de CentumPay `ecommerce` con el payload `get_token`:
   - `group: "wmx_api"`, `method: "get_token"`
   - `data` con `web_site`, `order_details` (order_id, email, name), `tx_info` (cart con items individuales, subtotal, discount, total)
5. Extrae `payload[0].token` (sale token)
6. Construye y retorna la URL de checkout: `{BaseCheckout}?ApiKey={api_key}&Token={sale_token}&Hash={api_hash}`
7. Maneja errores: si `code != "0"`, retorna el `status.description` de CentumPay

Configuracion en `supabase/config.toml`:
```toml
[functions.centumpay-checkout]
verify_jwt = false
```

## Paso 2: Edge Function `centumpay-webhook` (opcional recomendado)

Crear `supabase/functions/centumpay-webhook/index.ts` que:

1. Recibe POST de CentumPay con evento de pago
2. Verifica firma HMAC: `msg = APIKEY + event + amount + currency + status + token`, key = `APISECRET`
3. Si `status === "approved"`, actualiza la orden en la base de datos (`payment_status = "paid"`, `status = "confirmed"`)

Configuracion en `supabase/config.toml`:
```toml
[functions.centumpay-webhook]
verify_jwt = false
```

## Paso 3: Edge Function `centumpay-status` (opcional)

Crear `supabase/functions/centumpay-status/index.ts` para consultar `token_status` de una venta. Util para polling desde el frontend despues de que el usuario regrese del checkout.

## Paso 4: Cambios en el Frontend (`src/pages/Checkout.tsx`)

1. **Habilitar el metodo "Tarjeta"**: Remover `comingSoon: true` del metodo de pago "tarjeta" y actualizar su descripcion a "Pago seguro con CentumPay"
2. **Flujo de pago con tarjeta**: Cuando `paymentMethod === "tarjeta"`:
   - Al hacer submit, primero crear la orden en la base de datos (como ya se hace)
   - Luego llamar a la Edge Function `centumpay-checkout` con los datos del pedido
   - Si es exitoso, redirigir al usuario a la URL de checkout de CentumPay (`window.location.href = checkoutUrl`)
   - Si falla, mostrar toast con el error
3. **Flujo de efectivo**: Permanece exactamente igual (WhatsApp)
4. **Texto del boton**: Cambiar dinamicamente segun metodo:
   - Efectivo: "Confirmar por WhatsApp" (actual)
   - Tarjeta: "Pagar con Tarjeta"

## Paso 5: Pagina de retorno post-pago (opcional)

Considerar agregar una ruta `/checkout/confirmacion` donde CentumPay redirija al usuario despues del pago. Esta pagina puede hacer polling con `centumpay-status` para verificar el estado.

---

## Detalles Tecnicos

### Generacion TOTP en Deno (Edge Function)

Se usara una implementacion TOTP compatible con RFC 6238 en Deno. El algoritmo:
1. Calcular `T = floor(timestamp / 30)`
2. Convertir T a buffer de 8 bytes (big-endian)
3. HMAC-SHA1 con la clave secreta TOTP
4. Dynamic truncation para obtener 6 digitos

### Estructura del payload `get_token`

```json
{
  "group": "wmx_api",
  "method": "get_token",
  "token": "{{hmac_token}}",
  "api_key": "{{api_key}}",
  "data": {
    "web_site": "{{website_url}}",
    "order_details": {
      "wl_name": "wl_centumpay",
      "my_id": {
        "order_id": "RP-XXXXX",
        "customer_email": "email@example.com",
        "customer_name": "Familia Lopez"
      }
    },
    "tx_info": {
      "cart": {
        "description": "Pedido Raw Paw",
        "concept": [
          { "item": "Proteina de Res 2kg", "cant": 1, "price": 350 }
        ],
        "discount": 0,
        "subtotal": 350,
        "total": 350
      }
    }
  }
}
```

### Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `supabase/functions/centumpay-checkout/index.ts` | Crear |
| `supabase/functions/centumpay-webhook/index.ts` | Crear |
| `supabase/functions/centumpay-status/index.ts` | Crear |
| `supabase/config.toml` | Agregar 3 funciones |
| `src/pages/Checkout.tsx` | Modificar metodo tarjeta y flujo submit |

### Orden de ejecucion

1. Solicitar y configurar los 6 secretos
2. Crear las 3 Edge Functions
3. Modificar el checkout frontend
4. Probar el flujo completo en ambiente test
