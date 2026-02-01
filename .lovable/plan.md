

# Plan: Corregir Errores de Suscripcion y Agregar Validacion de Usuario

## Resumen

Este plan corrige 3 problemas:
1. El componente Badge esta roto y causa errores en toda la aplicacion
2. El error de base de datos al crear suscripciones (ON CONFLICT)
3. Usuarios no registrados pueden intentar suscribirse sin validacion

---

## Problema 1: Componente Badge Roto

El archivo `src/components/ui/badge.tsx` tiene un error critico - la funcion Badge no retorna ningun JSX:

```typescript
// CODIGO ACTUAL (ROTO):
function Badge({ className, variant, ...props }: BadgeProps) {
  return;  // No retorna nada!
}
```

### Solucion

Restaurar el componente Badge con el JSX correcto:

```typescript
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
```

---

## Problema 2: Error ON CONFLICT en Suscripciones

El codigo actual en `AIRecomendador.tsx` usa:
```typescript
.upsert({ ... }, { onConflict: "user_id" })
```

Pero la tabla `subscriptions` no tiene un constraint UNIQUE en `user_id`. Esto causa el error que ves.

### Solucion

Cambiar la logica de upsert a una verificacion manual:

```typescript
// 1. Verificar si existe suscripcion activa
const { data: existingSub } = await supabase
  .from("subscriptions")
  .select("id")
  .eq("user_id", user.id)
  .eq("status", "active")
  .maybeSingle();

// 2. Actualizar o crear segun corresponda
if (existingSub) {
  const { error } = await supabase
    .from("subscriptions")
    .update(subscriptionData)
    .eq("id", existingSub.id);
} else {
  const { error } = await supabase
    .from("subscriptions")
    .insert(subscriptionData);
}
```

---

## Problema 3: Popup para Usuarios No Registrados

### En AIRecomendador.tsx (ya parcialmente implementado)

La funcion `handleSelectSubscription` ya tiene validacion en lineas 1335-1342, pero muestra un toast Y abre el LoginDialog. Esto ya funciona correctamente.

### En Suscripcion.tsx (FALTA implementar)

La funcion `handleSubscribe` actualmente no verifica si el usuario esta autenticado. Necesitamos:

1. Importar `useAuth` y `LoginDialog`
2. Agregar estado para controlar el popup
3. Verificar autenticacion antes de redirigir a WhatsApp

```typescript
// Importar
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "@/components/ai/LoginDialog";

// Dentro del componente
const { isAuthenticated } = useAuth();
const [showLoginDialog, setShowLoginDialog] = useState(false);

const handleSubscribe = () => {
  // NUEVA VALIDACION
  if (!isAuthenticated) {
    setShowLoginDialog(true);
    return;
  }
  
  // Logica existente de WhatsApp...
};

// En el JSX, agregar el dialog:
<LoginDialog
  open={showLoginDialog}
  onOpenChange={setShowLoginDialog}
  title="Registrate para suscribirte"
  description="Para crear tu suscripcion mensual, primero necesitas una cuenta."
/>
```

---

## Flujo del Usuario No Autenticado

```text
Usuario no registrado
        |
        v
Hace clic en "Suscribirme"
        |
        v
+---------------------------+
|    Popup de Login/Registro |
|                           |
|  Para suscribirte,        |
|  primero crea una cuenta  |
|                           |
|  [Entrar] [Registrarse]   |
+---------------------------+
        |
        v
Si se registra -> Popup se cierra
Usuario puede intentar de nuevo
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ui/badge.tsx` | Restaurar el return con JSX correcto |
| `src/pages/AIRecomendador.tsx` | Reemplazar upsert con logica de verificacion + insert/update |
| `src/pages/Suscripcion.tsx` | Agregar validacion de autenticacion + LoginDialog |

---

## Seccion Tecnica

### Cambio 1: Badge.tsx (linea 18-24)

```tsx
function Badge({
  className,
  variant,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
```

### Cambio 2: AIRecomendador.tsx (lineas 1353-1367)

Reemplazar:
```typescript
const { error } = await supabase.from("subscriptions").upsert({
  user_id: user.id,
  // ...data
}, {
  onConflict: "user_id"
});
```

Con:
```typescript
const subscriptionData = {
  user_id: user.id,
  plan_type: planType,
  status: "active",
  protein_line: result?.recommendedProtein === "chicken" ? "pollo" : result?.recommendedProtein === "beef" ? "res" : "mix",
  presentation: result?.weeklyKg && result.weeklyKg >= 3 ? "1kg" : "500g",
  weekly_amount_kg: result?.weeklyKg || 0,
  frequency: "weekly",
  next_delivery_date: nextDeliveryDate.toISOString().split("T")[0],
  next_billing_date: nextBillingDate.toISOString().split("T")[0],
  price_per_kg: 150,
  discount_percent: planType === "monthly" ? 0 : planType === "semestral" ? 5 : 10,
};

// Verificar si existe suscripcion activa
const { data: existingSub } = await supabase
  .from("subscriptions")
  .select("id")
  .eq("user_id", user.id)
  .eq("status", "active")
  .maybeSingle();

let error;
if (existingSub) {
  const result = await supabase
    .from("subscriptions")
    .update(subscriptionData)
    .eq("id", existingSub.id);
  error = result.error;
} else {
  const result = await supabase
    .from("subscriptions")
    .insert(subscriptionData);
  error = result.error;
}
```

### Cambio 3: Suscripcion.tsx

Agregar imports:
```typescript
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "@/components/ai/LoginDialog";
```

Agregar estado dentro del componente:
```typescript
const { isAuthenticated } = useAuth();
const [showLoginDialog, setShowLoginDialog] = useState(false);
```

Modificar handleSubscribe:
```typescript
const handleSubscribe = () => {
  if (!isAuthenticated) {
    setShowLoginDialog(true);
    return;
  }
  
  // Logica existente de WhatsApp
  const productName = `BARF ${protein === "res" ? "Res" : "Pollo"} ${presentation}`;
  // ... resto del codigo
};
```

Agregar al final del JSX (antes de cerrar `</Layout>`):
```tsx
<LoginDialog
  open={showLoginDialog}
  onOpenChange={setShowLoginDialog}
  title="Registrate para suscribirte"
  description="Para crear tu suscripcion mensual, primero necesitas una cuenta Raw Paw."
/>
```

