
# Reducir Espacio entre Logo y Texto en Hero

## Problema Identificado
En la sección Hero de la página principal, hay demasiado espacio vacío entre el logo "Raw Paw" en la parte superior y el contenido (badge + tagline + CTAs) en la parte inferior. Esto es especialmente notorio en móviles.

## Causa
El contenedor principal tiene `pt-48 sm:pt-56 md:pt-64` (padding-top de 12rem/14rem/16rem), lo cual crea un espacio excesivo.

## Solución
Reducir el padding-top del contenedor del hero de forma responsiva:
- Móvil: Cambiar de `pt-48` a `pt-32` (de 12rem a 8rem)
- Tablet: Cambiar de `sm:pt-56` a `sm:pt-40` (de 14rem a 10rem)
- Desktop: Mantener similar `md:pt-48` (de 16rem a 12rem)

---

## Detalles Técnicos

### Archivo a modificar
`src/pages/Home.tsx`

### Cambio específico
**Línea 73** - Actualizar las clases del contenedor:

```tsx
// Antes
<div className="container relative z-20 h-full flex flex-col justify-end pb-8 sm:pb-12 md:pb-16 pt-48 sm:pt-56 md:pt-64">

// Después
<div className="container relative z-20 h-full flex flex-col justify-end pb-8 sm:pb-12 md:pb-16 pt-32 sm:pt-40 md:pt-48">
```

Esto reduce el espacio superior en aproximadamente 4rem (64px) en cada breakpoint, acercando el contenido al logo sin perder la estructura visual.
