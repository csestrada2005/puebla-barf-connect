
# Plan: Corregir Inconsistencias de Suscripción entre /ai y /suscripcion

## Problemas Identificados

### Problema 1: Error de Constraint en Base de Datos
La tabla `subscriptions` tiene estos constraints:

| Campo | Valores Permitidos | Código Actual |
|-------|-------------------|---------------|
| `frequency` | 'mensual', 'anual' | ❌ 'weekly' |
| `plan_type` | 'basico', 'pro' | ❌ 'monthly', 'semestral', 'annual' |

El código en AIRecomendador.tsx envía valores que violan estos constraints.

### Problema 2: Plan Semestral No Debería Existir
- `/suscripcion` solo ofrece: Mensual y Anual
- `/ai` (SubscriptionTiers.tsx) ofrece: Mensual, **Semestral**, y Anual

Se debe eliminar la opción Semestral del AI.

### Problema 3: Precios Diferentes
- `/suscripcion`: Usa precios de la base de datos ($549 por 1kg pollo, $649 por 1kg res)
- `/ai`: Usa precio fijo hardcodeado de `$150/kg` que no coincide

---

## Solución

### Cambio 1: Corregir Valores de Frequency y Plan Type

Mapear los valores del UI a los valores que acepta la base de datos:

```typescript
// AIRecomendador.tsx línea 1353-1365
const subscriptionData = {
  // CORREGIR plan_type: mapear a valores de DB
  plan_type: planType === "monthly" ? "basico" : "pro",
  
  // CORREGIR frequency: mapear a valores de DB  
  frequency: planType === "annual" ? "anual" : "mensual",
  
  // ... resto igual
};
```

### Cambio 2: Eliminar Plan Semestral del AI

En `SubscriptionTiers.tsx`, eliminar el tier "semestral":

```typescript
const tiers: SubscriptionTier[] = [
  {
    id: "monthly",
    name: "Plan Mensual", 
    // ...
  },
  // ❌ ELIMINAR plan semestral
  {
    id: "annual",
    name: "Plan Anual",
    badge: "Mejor Valor",
    isRecommended: true,
    // ...
  },
];
```

También actualizar el tipo:
```typescript
interface SubscriptionTiersProps {
  onSelectPlan: (planType: "monthly" | "annual") => void; // Quitar "semestral"
}
```

### Cambio 3: Corregir Handler de Suscripción en AIRecomendador

Actualizar la función `handleSelectSubscription` para aceptar solo monthly o annual:

```typescript
const handleSelectSubscription = async (planType: "monthly" | "annual") => {
  // Ya no acepta "semestral"
  // ...
};
```

### Cambio 4: Alinear Lógica de Descuentos

Actualizar el cálculo de descuento para reflejar solo 2 planes:

```typescript
discount_percent: planType === "annual" ? 15 : 0,
```

Esto coincide con `/suscripcion` que ofrece 15% descuento en plan anual.

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ai/SubscriptionTiers.tsx` | Eliminar tier "semestral", actualizar tipos |
| `src/pages/AIRecomendador.tsx` | Corregir valores de frequency/plan_type, quitar semestral |

---

## Sección Técnica

### SubscriptionTiers.tsx

**Cambio de tipos (líneas 8-9, 23):**
```typescript
interface SubscriptionTier {
  id: "monthly" | "annual";  // Quitar "semestral"
  // ...
}

interface SubscriptionTiersProps {
  onSelectPlan: (planType: "monthly" | "annual") => void;  // Quitar "semestral"
}
```

**Eliminar tier semestral (líneas 27-52):**
```typescript
const tiers: SubscriptionTier[] = [
  {
    id: "monthly",
    name: "Plan Mensual",
    description: "Flexibilidad total, pago en efectivo disponible",
    billingWeeks: 4,
    discountPercent: 0,
  },
  {
    id: "annual",
    name: "Plan Anual",
    description: "15% de descuento, solo tarjeta",
    billingWeeks: 52,
    discountPercent: 15,
    badge: "15% OFF",
    isRecommended: true,
  },
];
```

### AIRecomendador.tsx

**Actualizar tipo de función (línea 1334):**
```typescript
const handleSelectSubscription = async (planType: "monthly" | "annual") => {
```

**Corregir subscriptionData (líneas 1353-1365):**
```typescript
const subscriptionData = {
  user_id: user.id,
  // Mapear a valores que acepta la DB
  plan_type: planType === "annual" ? "pro" : "basico",
  status: "active",
  protein_line: result?.recommendedProtein === "chicken" ? "pollo" : "res",
  presentation: result?.weeklyKg && result.weeklyKg >= 3 ? "1kg" : "500g",
  weekly_amount_kg: result?.weeklyKg || 0,
  // Mapear a valores que acepta la DB
  frequency: planType === "annual" ? "anual" : "mensual",
  next_delivery_date: nextDeliveryDate.toISOString().split("T")[0],
  next_billing_date: nextBillingDate.toISOString().split("T")[0],
  price_per_kg: 150,
  // 15% para anual, 0 para mensual
  discount_percent: planType === "annual" ? 15 : 0,
};
```

---

## Resumen de Mapeos

| UI Value | DB frequency | DB plan_type | Descuento |
|----------|--------------|--------------|-----------|
| monthly | mensual | basico | 0% |
| annual | anual | pro | 15% |

Esto alinea el flujo del AI con la página `/suscripcion` y los constraints de la base de datos.
