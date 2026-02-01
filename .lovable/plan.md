
# Plan: Optimización de Performance - Carga Ultrarrápida

## Diagnóstico del Problema

El "blank white screen" ocurre porque:
1. Las rutas son lazy-loaded (correcto para bundle size)
2. El fallback muestra Layout vacío (mejor que spinner, pero aún visible)
3. **No hay prefetching agresivo** - el chunk se descarga solo al hacer click

## Estrategia de Solución

### Fase 1: Eliminar el Skeleton Visible

**Archivo a modificar:** `src/components/ui/RouteSkeleton.tsx`

Cambiar de un contenedor vacío visible a `null` - el contenido simplemente aparece cuando está listo. Esto funciona porque:
- Header/Footer ya están en `<Layout>` de cada página
- El usuario ve la página anterior hasta que la nueva esté lista
- Sin "flash" de contenido vacío

### Fase 2: Prefetching Agresivo en Navegación

**Archivo a modificar:** `src/components/layout/Header.tsx`

El prefetching actual (`onMouseEnter`) es bueno pero reactivo. Agregaremos:
- Prefetch en **viewport** para links visibles (mobile touch)
- Prefetch en **hover** ya implementado
- Chunks de alta prioridad para rutas principales

### Fase 3: Eager Load de Rutas Críticas

**Archivo a modificar:** `src/App.tsx`

Convertir las 3-4 rutas más visitadas de lazy a eager:
- `/` (Home) - Ya es eager
- `/tienda` - Convertir a eager (segunda ruta más visitada)
- `/ai` - Convertir a eager (CTA principal del sitio)

Esto aumenta el bundle inicial pero elimina la latencia en las rutas de conversión.

### Fase 4: Optimización de Vite Chunks

**Archivo a modificar:** `vite.config.ts`

Crear chunks más granulares:
- Separar UI components (radix, shadcn)
- Separar Framer Motion (ya existe)
- Agrupar páginas relacionadas

---

## Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `src/components/ui/RouteSkeleton.tsx` | Cambiar a retorno invisible |
| `src/App.tsx` | Eager load rutas críticas |
| `src/components/layout/Header.tsx` | Mejorar prefetching |
| `vite.config.ts` | Optimizar chunk splitting |

---

## Sección Técnica

### RouteSkeleton - Cambio a Invisible

```typescript
export function RouteSkeleton() {
  return (
    <Layout>
      <div className="min-h-[60vh]" />
    </Layout>
  );
}
```

El Layout ya contiene Header y Footer. Al tener el `min-h-[60vh]` vacío, el usuario:
1. Ve el Header/Footer (bien)
2. Ve un área central blanca (problema)

La solución es mantener la estructura pero sin el contenedor vacío visual - el `<Layout>` mismo puede ser el fallback mínimo sin el div interno.

### App.tsx - Eager Loading Estratégico

```typescript
// Eager load: Rutas de conversión críticas
import Home from "./pages/Home";
import Tienda from "./pages/Tienda";        // NUEVO
import AIRecomendador from "./pages/AIRecomendador"; // NUEVO

// Lazy load: Resto de rutas
const Producto = lazy(() => import("./pages/Producto"));
// ...
```

### Header.tsx - Prefetch Mejorado

Agregar prefetch más agresivo aprovechando el tiempo de hover antes del click:

```typescript
// Importar todas las rutas críticas al inicio de la sesión
useEffect(() => {
  // Prefetch después de que la página principal cargue
  const timer = setTimeout(() => {
    import("@/pages/Tienda");
    import("@/pages/AIRecomendador");
    import("@/pages/Suscripcion");
  }, 1000);
  return () => clearTimeout(timer);
}, []);
```

### vite.config.ts - Chunk Optimization

```typescript
manualChunks: {
  vendor: ["react", "react-dom", "react-router-dom"],
  motion: ["framer-motion"],
  query: ["@tanstack/react-query"],
  supabase: ["@supabase/supabase-js"],
  // Agregar:
  ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", ...],
}
```

---

## Impacto Esperado

| Métrica | Antes | Después |
|---------|-------|---------|
| Transición entre páginas | 200-500ms visible | ~0ms (imperceptible) |
| Bundle inicial | ~150KB | ~200KB (+rutas críticas) |
| Rutas secundarias | Lazy (correcto) | Lazy + prefetched |
| LCP Home | OK | Sin cambio |
| TTI Tienda/AI | ~300ms | ~0ms (pre-cargado) |

El trade-off es un bundle inicial ligeramente más grande a cambio de transiciones instantáneas en las rutas de conversión.
