

# Plan: Actualizar Texto del Hero Móvil

## Objetivo
Reemplazar el texto actual del hero móvil con la nueva versión más corta y emotiva: **"Fresco. Real. Para quien amas."**

---

## Cambio Visual

### Antes
```
Donde la Frescura nutre,
la calidad se siente
y la Nutrición permanece.
```

### Después
```
Fresco. Real.
Para quien amas.
```

---

## Cambios Técnicos

### Archivo: `src/pages/Home.tsx`

**Ubicación:** Sección del hero móvil, líneas ~103-113

**Código actual:**
```tsx
<p className="text-2xl font-bold text-white leading-tight mb-1 drop-shadow-md">
  Donde la <span className="text-secondary">Frescura</span> nutre,
</p>
<p className="text-2xl font-bold text-white leading-tight mb-1 drop-shadow-md">
  la calidad se siente
</p>
<p className="text-2xl font-bold text-white leading-tight drop-shadow-md">
  y la <span className="text-secondary">Nutrición</span> permanece.
</p>
```

**Código nuevo:**
```tsx
<p className="text-3xl font-bold text-white leading-tight mb-1 drop-shadow-md">
  <span className="text-secondary">Fresco.</span> Real.
</p>
<p className="text-3xl font-bold text-white leading-tight drop-shadow-md">
  Para quien <span className="text-secondary">amas.</span>
</p>
```

---

## Ajustes de Estilo

| Aspecto | Antes | Después |
|---------|-------|---------|
| Tamaño de texto | `text-2xl` | `text-3xl` (más grande para compensar menos texto) |
| Líneas | 3 líneas | 2 líneas |
| Acentos (secondary) | "Frescura", "Nutrición" | "Fresco.", "amas." |

---

## Resumen

| Archivo | Cambio |
|---------|--------|
| `src/pages/Home.tsx` | Reemplazar texto del hero móvil con versión corta y aumentar tamaño de fuente |

