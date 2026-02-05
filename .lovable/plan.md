# Plan: Integración Zapier → Google Sheets

## Resumen

La integración usa Zapier como intermediario para sincronizar pedidos a Google Sheets. Este enfoque es más simple y no requiere configuración de Google Cloud.

## Flujo

```
Pedido completado → Edge Function "sync-to-sheets" → Zapier Webhook → Google Sheets
```

## Configuración

1. **En Zapier**: Crear un Zap con trigger "Webhooks by Zapier" (Catch Hook)
2. **En Admin**: Pegar la URL del webhook en la sección de Configuración
3. **En Zapier**: Configurar la acción para agregar filas a Google Sheets

## Estado

✅ Edge Function implementada (`sync-to-sheets`)
✅ Configuración en `app_config` (clave: `zapier_webhook_url`)
⏳ Pendiente: Configurar el webhook en /admin
