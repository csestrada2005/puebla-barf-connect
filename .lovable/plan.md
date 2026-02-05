
# Plan: Marco con borde primario y patita como overlay

## Resumen
Agregar un borde grueso del color primario (#677755 - Barky) alrededor del video del hero móvil, con una imagen de patita (`deco-paw.png`) como elemento decorativo en la esquina inferior derecha, superpuesto sobre el borde.

## Cambios visuales
- El video tendrá un borde de 4px del color primario
- La patita aparecerá en la esquina inferior derecha, parcialmente fuera del marco
- El efecto será sutil pero distintivo, reforzando la identidad de marca

## Detalles técnicos

### Archivo a modificar
`src/pages/Home.tsx`

### Cambios específicos

1. **Importar el asset de la patita**
   - Agregar import de `deco-paw.png`

2. **Modificar el contenedor del video** (líneas 99-109)
   - Agregar `relative` para posicionar el overlay
   - Agregar `border-4 border-primary` para el borde grueso
   - Ajustar el padding interno para que el video no toque el borde

3. **Agregar el overlay de la patita**
   - Posicionar con `absolute -bottom-3 -right-3`
   - Tamaño de la patita: `w-14 h-14` (56px)
   - Agregar rotación sutil para efecto más natural: `rotate-12`
   - Z-index elevado para asegurar que esté encima

### Estructura del código resultante
```text
┌──────────────────────────────┐
│  ┌────────────────────────┐  │
│  │                        │  │
│  │        VIDEO           │  │
│  │                        │  │
│  └────────────────────────┘  │
│                         🐾   │ ← Patita superpuesta
└──────────────────────────────┘
     ↑ Borde primario (4px)
```

## Resultado esperado
Un marco elegante con el color de marca que hace el video más distintivo, con un toque juguetón y "on-brand" gracias a la patita decorativa en la esquina.
