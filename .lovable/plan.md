

# Corregir redireccion de CentumPay despues del pago

## Problema

Despues de pagar en CentumPay, el usuario se queda en la pagina de CentumPay y no regresa a tu tienda. Esto pasa porque la URL de retorno configurada no es correcta.

## Solucion (2 cambios)

### 1. Actualizar el secreto CENTUMPAY_WEBSITE_URL

Cambiar el valor del secreto a: `https://rawpaw.store/checkout/confirmacion`

Esto le indica a CentumPay que despues de procesar el pago, redirija al usuario a esa pagina de tu sitio.

### 2. Respaldo: abrir CentumPay en nueva pestana

Como medida de seguridad en caso de que CentumPay no redirija correctamente, modificar `src/pages/Checkout.tsx` para:

- Abrir CentumPay en **nueva pestana** con `window.open`
- Navegar la ventana actual a `/checkout/confirmacion` inmediatamente
- La pagina de confirmacion ya tiene polling cada 5 segundos que detecta cuando el pago se completa

Asi el usuario **siempre** ve la pagina de confirmacion, ya sea porque CentumPay lo redirige o porque la ventana original ya esta ahi esperando.

## Seccion tecnica

Archivo modificado: `src/pages/Checkout.tsx`

Cambio: reemplazar `window.location.href = cpData.checkoutUrl` por:

```typescript
window.open(cpData.checkoutUrl, "_blank");
navigate("/checkout/confirmacion");
```

Secreto actualizado: `CENTUMPAY_WEBSITE_URL` = `https://rawpaw.store/checkout/confirmacion`

