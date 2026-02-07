
# Plan: Mover el PopUp Promocional de `/` a `/tienda`

## Resumen
El popup de bienvenida con el código de descuento `BIENVENIDO15` actualmente aparece en cualquier página de la web. Se moverá para que solo aparezca cuando el usuario entre a la página `/tienda`.

---

## Cambios a Realizar

### 1. Modificar `src/App.tsx`
**Acción:** Remover el componente `<PromoPopup />` del nivel global

- Eliminar la línea 48: `<PromoPopup />`
- Eliminar la importación del componente (línea 9)

El popup ya no aparecerá automáticamente en todas las páginas.

---

### 2. Modificar `src/pages/Tienda.tsx`
**Acción:** Agregar el `PromoPopup` dentro de la página de tienda

```tsx
import { PromoPopup } from "@/components/PromoPopup";

export default function Tienda() {
  return (
    <Layout>
      <PromoPopup />
      {/* ... resto del contenido */}
    </Layout>
  );
}
```

---

## Comportamiento Final

| Escenario | Antes | Después |
|-----------|-------|---------|
| Usuario entra a `/` | Popup aparece después de 3s | No aparece popup |
| Usuario entra a `/tienda` | Popup aparece después de 3s | Popup aparece después de 3s |
| Usuario ya vio el popup | No vuelve a aparecer (sessionStorage) | Sin cambios |
| Usuario navega de `/` a `/tienda` | Ya se mostró en `/` | Se muestra en `/tienda` |

---

## Detalles Técnicos

- La lógica existente del popup (delay de 3 segundos, sessionStorage para evitar mostrar de nuevo) se mantiene intacta
- Solo cambia la ubicación donde se renderiza el componente
- No se requieren cambios en la base de datos ni edge functions
