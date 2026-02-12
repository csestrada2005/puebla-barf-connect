

## Fix: Centrar elementos del carrito en movil (suscripciones)

### Problema
En dispositivos moviles, cuando el carrito contiene una suscripcion, los elementos se ven desplazados hacia la izquierda en lugar de estar centrados.

### Causa raiz
El contenedor principal tiene `container` (que ya incluye `padding: 1rem` y `center: true`) combinado con `px-4 sm:px-6 lg:px-8`, lo cual crea un conflicto de padding. Ademas, la indentacion inconsistente del div de la imagen (linea 122 tiene un espacio extra) puede causar problemas de renderizado.

### Solucion

**Archivo: `src/pages/Carrito.tsx`**

1. Simplificar las clases del contenedor exterior: quitar los `px-*` redundantes ya que `container` con `padding: '1rem'` en tailwind.config ya los provee.
2. Agregar `px-2` al wrapper `max-w-3xl mx-auto` para garantizar margenes simetricos en pantallas muy pequenas.
3. Corregir la indentacion del div de imagen (linea 122) para que este alineado correctamente con su contenedor flex.

### Detalles tecnicos

```text
Antes:
<div className="container ... px-4 sm:px-6 lg:px-8">
  <div className="max-w-3xl mx-auto">

Despues:
<div className="container ... relative">
  <div className="max-w-3xl mx-auto px-2 sm:px-4">
```

Tambien se corrige la indentacion del div de imagen dentro del CardContent para asegurar que el layout flex funcione correctamente en todos los dispositivos.

