# Plan: Mini CRM con WhatsApp para el Chofer

## Resumen

Sistema de gestión de pedidos interno con notificaciones automáticas por WhatsApp al chofer.

## Funcionalidades

### ✅ Vista de Pedidos (CRM)
- Lista completa de pedidos con búsqueda y filtros
- Estados: Nuevo → Confirmado → En ruta → Entregado → Cancelado
- Edición de notas de entrega
- Vista expandible con detalles del cliente y productos

### ✅ Configuración del Chofer
- Número de WhatsApp del chofer
- Hora de envío automático del mensaje

### ✅ Notificaciones WhatsApp
- Edge Function `notify-driver` genera el resumen de entregas
- Botón para probar y abrir WhatsApp manualmente
- Mensaje formateado con todos los datos de cada entrega

## Flujo

```
Pedidos confirmados → Botón "Generar mensaje" → WhatsApp al chofer
```

## Próximos pasos (opcionales)
- Configurar cron job para envío automático diario
- Integrar con WhatsApp Business API para envío sin intervención manual
