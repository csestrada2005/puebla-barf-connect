
# Plan: CRM Completo para Raw Paw - Funcionalidad Faltante

## Resumen Ejecutivo

Este plan cubre todo lo necesario para que el CRM sea 100% funcional con el ciclo de vida completo de pedidos y suscripciones.

---

## Estado Actual (Lo que YA funciona)

| Funcionalidad | Estado |
|---------------|--------|
| Panel Admin con Dashboard | ✅ Completo |
| Gestión de pedidos con estados | ✅ Completo |
| Envío de entregas al chofer por WhatsApp | ✅ Completo |
| Link de confirmación para el chofer (`/entrega/:token`) | ✅ Completo |
| Actualización de estado por chofer (Entregado/Pospuesto/Fallido) | ✅ Completo |
| Notas del chofer | ✅ Completo |
| Vista de clientes | ✅ Completo |
| Vista de suscripciones | ✅ Completo |
| Configuración del número del chofer | ✅ Completo |

---

## Lo que FALTA (Ordenado por prioridad)

### PRIORIDAD ALTA

#### 1. Foto de Entrega para el Chofer
**Problema:** El chofer no puede subir foto como prueba de entrega.

**Solución:**
- Crear bucket de storage `delivery-photos`
- Agregar columna `delivery_photo_url` a tabla `orders`
- Modificar `/entrega/:token` para incluir input de cámara/foto
- Guardar foto y asociarla al pedido

```text
Flujo:
┌─────────────────────────────────────────────────┐
│          Chofer abre /entrega/:token            │
├─────────────────────────────────────────────────┤
│  1. Ve info del pedido                          │
│  2. Escribe notas (opcional)                    │
│  3. Sube foto (opcional/requerido)              │
│  4. Selecciona: Entregado / Pospuesto / Fallido │
│  5. Se guarda foto + estado + notas             │
└─────────────────────────────────────────────────┘
```

#### 2. Vista de Pedidos de la Semana
**Problema:** El admin no puede ver qué pedidos tiene para esta semana.

**Solución:**
- Agregar filtro de fechas en `OrdersView`
- Botones rápidos: "Hoy", "Esta semana", "Próxima semana"
- Agrupar pedidos por día de entrega
- Selector de rango de fechas

#### 3. Pagos con Tarjeta (Stripe)
**Problema:** Solo tienen efectivo, planes anuales requieren tarjeta.

**Solución:**
- Integrar Stripe (ya tienen el conector disponible)
- Crear Edge Function para procesar pagos
- Modificar Checkout para tarjeta
- Actualizar `payment_status` al completar pago

---

### PRIORIDAD MEDIA

#### 4. Lógica de Suscripciones Recurrentes
**Problema:** Las suscripciones no generan pedidos automáticamente cada semana.

**Solución:**
- Crear Edge Function `generate-subscription-orders`
- Cron job diario que:
  1. Busca suscripciones activas con `next_delivery_date = hoy`
  2. Crea un nuevo pedido automático
  3. Actualiza `next_delivery_date` según frecuencia
  4. Notifica al admin

```text
Flujo de Suscripción:
┌────────────────────────────────────────────────────────────┐
│ Cliente se suscribe (ej: Mensual, Lunes)                   │
├────────────────────────────────────────────────────────────┤
│ 1. Se crea suscripción con next_delivery_date = Próx Lunes │
│ 2. Cron diario revisa: ¿next_delivery_date == hoy?         │
│ 3. Si sí: genera pedido automático                         │
│ 4. Actualiza next_delivery_date = +7 días (o +14)          │
│ 5. Pedido aparece en OrdersView como "Nuevo"               │
│ 6. Admin confirma y lo manda al chofer                     │
└────────────────────────────────────────────────────────────┘
```

#### 5. Notificación Automática al Chofer
**Problema:** Actualmente el mensaje se genera manual, no se envía automático.

**Solución:**
- Configurar cron job con `pg_cron`
- Cada día a la hora configurada, invoca `notify-driver`
- El edge function ya existe, solo falta el cron

**Limitación:** WhatsApp no permite envío automático sin API Business. El cron solo puede:
- Generar el mensaje
- Opción A: Integrar con API de WhatsApp Business (Twilio, Meta Business API)
- Opción B: Enviar email al admin con el link de WhatsApp listo

---

### PRIORIDAD BAJA

#### 6. Calendario Visual de Entregas
**Problema:** No hay vista de calendario para planificar.

**Solución:**
- Agregar vista calendario en Dashboard
- Mostrar pedidos por día
- Drag & drop para reprogramar (opcional)

---

## Detalles Técnicos

### Base de Datos - Cambios Necesarios

```sql
-- 1. Columna para foto de entrega
ALTER TABLE orders ADD COLUMN delivery_photo_url TEXT;

-- 2. Storage bucket para fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-photos', 'delivery-photos', true);

-- 3. RLS para fotos (público para subir con token)
CREATE POLICY "Anyone can upload delivery photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'delivery-photos');

CREATE POLICY "Anyone can view delivery photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'delivery-photos');
```

### Edge Functions Nuevas

| Función | Propósito |
|---------|-----------|
| `generate-subscription-orders` | Cron diario para crear pedidos de suscripciones |
| `process-payment` | Integración con Stripe para pagos con tarjeta |

### Cron Jobs

```sql
-- Generar pedidos de suscripción cada día a las 6am
SELECT cron.schedule(
  'generate-subscription-orders',
  '0 6 * * *',
  $$ SELECT net.http_post(...) $$
);
```

---

## Plan de Implementación

| Fase | Funcionalidad | Estimado |
|------|---------------|----------|
| **Fase 1** | Foto de entrega para chofer | 1-2 horas |
| **Fase 2** | Filtro de pedidos por semana | 30 min |
| **Fase 3** | Integración Stripe | 2-3 horas |
| **Fase 4** | Generación automática de pedidos de suscripción | 2 horas |
| **Fase 5** | Cron de notificación + WhatsApp Business | Variable |

---

## Flujo Completo (Cómo Debería Quedar)

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO DEL CRM                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  CLIENTE                                                            │
│     │                                                               │
│     ▼                                                               │
│  ┌────────────────┐                                                 │
│  │ Compra única   │──────┐                                          │
│  │ o Suscripción  │      │                                          │
│  └────────────────┘      │                                          │
│                          │                                          │
│  CHECKOUT                ▼                                          │
│     │            ┌──────────────────┐                               │
│     │            │ Efectivo o       │                               │
│     │            │ Tarjeta (Stripe) │                               │
│     │            └──────────────────┘                               │
│     │                    │                                          │
│     ▼                    ▼                                          │
│  ┌──────────────────────────────────┐                               │
│  │ Pedido creado con status: "new" │                               │
│  └──────────────────────────────────┘                               │
│                          │                                          │
│  ADMIN                   ▼                                          │
│     │            ┌────────────────────┐                             │
│     │            │ Admin ve pedido    │                             │
│     │            │ en /admin → Pedidos│                             │
│     │            └────────────────────┘                             │
│     │                    │                                          │
│     │                    ▼                                          │
│     │            ┌────────────────────┐                             │
│     │            │ Admin confirma     │                             │
│     │            │ status → confirmed │                             │
│     │            └────────────────────┘                             │
│     │                    │                                          │
│     │                    ▼                                          │
│     │            ┌────────────────────────────┐                     │
│     │            │ Admin selecciona pedidos   │                     │
│     │            │ del día y envía a chofer   │                     │
│     │            │ via WhatsApp               │                     │
│     │            └────────────────────────────┘                     │
│                          │                                          │
│  CHOFER                  ▼                                          │
│     │            ┌────────────────────────────┐                     │
│     │            │ Chofer recibe mensaje con  │                     │
│     │            │ links /entrega/:token      │                     │
│     │            └────────────────────────────┘                     │
│     │                    │                                          │
│     │                    ▼                                          │
│     │            ┌────────────────────────────┐                     │
│     │            │ Chofer abre link           │                     │
│     │            │ • Ve info del pedido       │                     │
│     │            │ • Sube foto de entrega     │                     │
│     │            │ • Marca: Entregado/Pospue. │                     │
│     │            └────────────────────────────┘                     │
│                          │                                          │
│                          ▼                                          │
│     │            ┌────────────────────────────┐                     │
│     │            │ Status actualizado a       │                     │
│     │            │ "delivered" con foto       │                     │
│     │            └────────────────────────────┘                     │
│                          │                                          │
│  SUSCRIPCIÓN             ▼                                          │
│     │            ┌────────────────────────────┐                     │
│     │            │ Si es suscripción:         │                     │
│     │            │ Cron genera nuevo pedido   │                     │
│     │            │ para próxima semana        │                     │
│     │            └────────────────────────────┘                     │
│                          │                                          │
│                          ▼                                          │
│                   [CICLO SE REPITE]                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Recomendación

Sugiero empezar con **Fase 1 (Foto de entrega)** y **Fase 2 (Filtro semanal)** ya que son las más impactantes para operaciones diarias y no requieren integraciones externas.

¿Quieres que empiece implementando alguna de estas fases?
