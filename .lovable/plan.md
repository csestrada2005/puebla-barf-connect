
# Plan: Aumentar el tamaño del isotipo del perro con bowl

## Identificación

El asset en cuestión es `isotipoBowl` (importado desde `src/assets/brand/isotipo-bowl.png`), ubicado en la línea 143 de `src/pages/Home.tsx`:

```tsx
<BrandImage src={isotipoBowl} alt="Raw Paw" className="h-16 w-auto mx-auto mb-4" />
```

Este es el isotipo del perrito con el bowl de comida que aparece centrado arriba del título "Así de fácil funciona".

## Cambio a Realizar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Home.tsx` | Aumentar el tamaño del isotipoBowl de `h-16` a `h-24 md:h-32` |

## Código Actual vs Nuevo

**Antes:**
```tsx
<BrandImage src={isotipoBowl} alt="Raw Paw" className="h-16 w-auto mx-auto mb-4" />
```

**Después:**
```tsx
<BrandImage src={isotipoBowl} alt="Raw Paw" className="h-24 md:h-32 w-auto mx-auto mb-6" />
```

Esto aumentará la altura de:
- **Móvil**: 64px → 96px (50% más grande)
- **Desktop**: 64px → 128px (100% más grande)

También ajusto el margin-bottom de `mb-4` a `mb-6` para mantener el espaciado proporcional.
