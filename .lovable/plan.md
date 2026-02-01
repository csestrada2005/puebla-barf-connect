
# Plan: Scroll al Inicio, Eliminar Loaders, y Estilizar Chatbot

## Resumen de Cambios

Tres mejoras de UX solicitadas:
1. Scroll automático al inicio al cambiar de página (con excepción para `/ai` cuando hay consulta activa)
2. Eliminar las pantallas de carga visibles (spinners)
3. Agregar borde negro al contenedor del chatbot en `/ai`

---

## Cambio 1: Scroll al Inicio en Navegación

### Problema Actual
Cuando se navega entre páginas, la posición del scroll se mantiene, lo que confunde al usuario.

### Solución
Crear un componente `ScrollToTop` que detecte cambios de ruta y haga scroll al inicio, con lógica especial para `/ai`.

### Archivo a Crear
`src/components/layout/ScrollToTop.tsx`

```text
Lógica:
├── Usa useLocation() de react-router-dom
├── En cada cambio de pathname:
│   ├── Si pathname === "/ai":
│   │   └── Verificar localStorage "ai-recommender-state"
│   │       ├── Si step === "result" → NO hacer scroll (consulta activa)
│   │       └── Si no → SÍ hacer scroll al inicio
│   └── Cualquier otra ruta → SÍ hacer scroll al inicio
└── Ejecutar window.scrollTo(0, 0)
```

### Archivo a Modificar
`src/App.tsx` - Insertar `<ScrollToTop />` dentro del `<BrowserRouter>`

---

## Cambio 2: Eliminar Pantallas de Carga

### Problema Actual
Los `<Suspense fallback={<PageLoader />}>` muestran spinners que resultan "jarring" (bruscos).

### Solución
Reemplazar el fallback con un componente invisible que reserve espacio mínimo sin mostrar spinner.

### Archivos a Modificar

**`src/App.tsx`**
- Cambiar todos los `fallback={<PageLoader />}` a `fallback={null}`
- Esto permite que el lazy loading sea "invisible" - la página simplemente aparece

**`src/components/layout/Layout.tsx`**
- Quitar el `<Suspense fallback={<PageLoader />}>` del children
- Los children ya vienen envueltos en Suspense desde App.tsx

---

## Cambio 3: Borde Negro en Chatbot

### Referencia Visual
La imagen muestra un borde negro delineando el área central del chat, creando una separación visual clara entre el contenido y los perros decorativos.

### Archivo a Modificar
`src/components/ai/ChatContainer.tsx`

### Cambios Específicos

```text
Estructura actual:
<div className="flex flex-col h-[calc(100vh-80px)]...">
  {/* Header Badge */}
  {/* Messages Area */}
  {/* Input Section */}
</div>

Nueva estructura:
<div className="flex flex-col h-[calc(100vh-80px)]...">
  {/* Contenedor central con borde */}
  <div className="max-w-2xl mx-auto w-full flex flex-col h-full 
                  border-2 border-foreground/80 rounded-2xl 
                  bg-background/50 backdrop-blur-sm overflow-hidden">
    {/* Header Badge */}
    {/* Messages Area */}
    {/* Input Section */}
  </div>
</div>
```

### Estilos del Borde
- `border-2 border-foreground/80` - Borde oscuro (negro en modo claro)
- `rounded-2xl` - Esquinas redondeadas consistentes con el design system
- `bg-background/50 backdrop-blur-sm` - Fondo semi-transparente
- `mx-4 md:mx-auto` - Margen en móvil, centrado en desktop

---

## Resumen de Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/layout/ScrollToTop.tsx` | CREAR |
| `src/App.tsx` | MODIFICAR (agregar ScrollToTop, cambiar fallbacks) |
| `src/components/layout/Layout.tsx` | MODIFICAR (quitar Suspense interno) |
| `src/components/ai/ChatContainer.tsx` | MODIFICAR (agregar borde) |

---

## Sección Técnica

### ScrollToTop - Implementación

```typescript
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Excepción para /ai con consulta activa
    if (pathname === "/ai") {
      const savedState = localStorage.getItem("ai-recommender-state");
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed.step === "result") {
            return; // No hacer scroll si hay consulta activa
          }
        } catch {}
      }
    }
    
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
```

### ChatContainer - Nuevo Borde

El contenedor central recibirá un borde visual que separa el área del chat de los elementos decorativos (perros). Esto mejora la legibilidad y crea una jerarquía visual clara.

### Lazy Loading sin Spinner

Al usar `fallback={null}`, el contenido simplemente aparece cuando está listo. La transición es más suave porque:
1. El Header y Footer permanecen visibles (ya están en Layout)
2. El contenido aparece sin parpadeos
3. La experiencia es más fluida que un spinner
