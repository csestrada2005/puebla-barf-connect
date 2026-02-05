
# Plan B: "¡Ñam!" - Hero Móvil Estilo Pet's Table

## Concepto

Reemplazar el hero móvil actual con un diseño centrado y vertical que incluye:
1. Logo en la parte superior
2. Imagen grande del perro con el `isotipo-bowl` flotando como "speech bubble"
3. Texto simplificado y centrado
4. CTA prominente

## Estructura Visual

```text
┌─────────────────────────────┐
│                             │
│  [Logo Raw Paw centrado]    │
│                             │
│   ┌─────────────────────┐   │
│   │   [isotipo-bowl]    │   │  ← Flotando con animación
│   │       ↓             │   │
│   │   ┌─────────────┐   │   │
│   │   │             │   │   │
│   │   │ hero-dog    │   │   │
│   │   │   .jpeg     │   │   │
│   │   │             │   │   │
│   │   └─────────────┘   │   │
│   └─────────────────────┘   │
│                             │
│  "Donde la Frescura nutre,  │
│   la calidad se siente"     │
│                             │
│  ┌─────────────────────┐    │
│  │  ✨ Crear mi plan   │    │
│  └─────────────────────┘    │
│                             │
│      Ver productos →        │
│                             │
└─────────────────────────────┘
```

## Cambios Técnicos

| Archivo | Cambio |
|---------|--------|
| `src/pages/Home.tsx` | Reemplazar el hero móvil actual (líneas 69-160) con la nueva estructura |

## Implementación Detallada

### 1. Eliminar el hero móvil actual
- Quitar el bloque del "Mobile Hero Card - Polaroid style" (líneas 80-102)

### 2. Crear nuevo hero móvil con estructura separada

**Nuevo código para el hero móvil (md:hidden):**

```tsx
{/* ===== MOBILE HERO - Plan B "¡Ñam!" ===== */}
<section className="md:hidden min-h-[calc(100svh-4rem)] flex flex-col bg-gradient-to-br from-primary via-primary to-primary/90 px-6 pt-6 pb-8">
  {/* Logo centrado */}
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex justify-center mb-6"
  >
    <BrandImage 
      src={logoTaglineBlack} 
      alt="Raw Paw" 
      className="w-40 brightness-0 invert" 
      priority 
    />
  </motion.div>

  {/* Imagen principal con speech bubble */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="relative flex-shrink-0 mx-auto w-full max-w-xs mb-6"
  >
    {/* Speech Bubble - isotipo-bowl flotando */}
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
      <Sticker 
        src={isotipoBowl} 
        alt="" 
        className="w-20 h-20 sticker-float drop-shadow-lg" 
        priority 
      />
    </div>
    
    {/* Imagen del perro */}
    <div className="bg-white/10 backdrop-blur-sm p-2 rounded-3xl">
      <img 
        src={herodog} 
        alt="Perro feliz comiendo" 
        className="w-full h-56 object-cover rounded-2xl shadow-2xl"
      />
    </div>
    
    {/* Ball sticker decorativo */}
    <Sticker 
      src={decoBall}
      alt=""
      className="absolute -bottom-3 -right-3 w-12 h-12 rotate-12"
    />
  </motion.div>

  {/* Texto centrado */}
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    className="text-center mb-6 flex-grow flex flex-col justify-center"
  >
    <p className="text-2xl font-bold text-primary-foreground leading-tight mb-1">
      Donde la <span className="text-secondary">Frescura</span> nutre,
    </p>
    <p className="text-2xl font-bold text-primary-foreground leading-tight mb-1">
      la calidad se siente
    </p>
    <p className="text-2xl font-bold text-primary-foreground leading-tight">
      y la <span className="text-secondary">Nutrición</span> permanece.
    </p>
  </motion.div>

  {/* CTAs */}
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.6 }}
    className="flex flex-col gap-3 items-center"
  >
    <Button asChild size="lg" variant="secondary" className="w-full max-w-xs text-lg px-8 py-6 rounded-2xl btn-bounce shadow-lg">
      <Link to="/ai">
        <Sparkles className="h-5 w-5 mr-2" />
        Crear mi plan
      </Link>
    </Button>
    <Button asChild variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10">
      <Link to="/tienda">
        Ver productos
        <ArrowRight className="h-4 w-4 ml-1" />
      </Link>
    </Button>
  </motion.div>
</section>
```

### 3. Mantener el hero desktop intacto
- La sección actual del hero desktop (hidden md:flex) permanece sin cambios

### 4. Ajustar la lógica de visibilidad
- Hero móvil: `md:hidden`
- Hero desktop: `hidden md:flex`

## Resumen de Cambios

1. **Nueva sección móvil completa** con layout vertical centrado
2. **isotipo-bowl como speech bubble** flotando sobre la imagen con animación `sticker-float`
3. **Imagen del perro (hero-dog.jpeg)** en contenedor con borde semi-transparente
4. **deco-ball** como sticker decorativo en la esquina inferior
5. **Texto simplificado** y centrado
6. **CTAs apilados** con el principal ("Crear mi plan") más prominente
7. **Animaciones escalonadas** con framer-motion para entrada suave
