
# Plan: Rediseño de Tienda - Solo Res y Pollo con Presentaciones

## Resumen

Simplificar la tienda para mostrar únicamente 2 productos principales:
- **🥩 Res Premium** - Posicionado como la opción de alta calidad
- **🐔 Pollo Esencial** - Opción económica pero completa

Al hacer click en cada producto, el usuario puede elegir la presentación (500g o 1kg). Esta elección es solo preferencia de almacenamiento, no afecta la nutrición.

---

## Diseño de la Nueva Tienda

```text
┌─────────────────────────────────────────────┐
│         🐾 Alimentación Natural BARF        │
│              Nuestra Tienda                 │
│   Solo 2 productos, infinitas posibilidades │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────┐  ┌─────────────────┐  │
│  │    🥩 RES       │  │   🐔 POLLO      │  │
│  │    PREMIUM      │  │    ESENCIAL     │  │
│  │                 │  │                 │  │
│  │  ✨ Variedad    │  │  💚 Ligero      │  │
│  │  de órganos     │  │  y digestivo    │  │
│  │                 │  │                 │  │
│  │  Desde $349     │  │  Desde $299     │  │
│  │                 │  │                 │  │
│  │  [Ver opciones] │  │  [Ver opciones] │  │
│  └─────────────────┘  └─────────────────┘  │
│                                             │
│  💡 Tip: Para perros grandes (+20kg)       │
│     recomendamos la presentación de 1kg    │
│     para mejor almacenamiento              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Flujo de Usuario

1. Usuario entra a `/tienda`
2. Ve 2 tarjetas grandes: Res Premium y Pollo Esencial
3. Al hacer click → Modal o página de producto con selector de presentación
4. Elige 500g o 1kg → Agrega al carrito

---

## Cambios por Archivo

### 1. `src/pages/Tienda.tsx` - Rediseño Completo

**Eliminar:**
- Filtros de proteína (ya no necesarios con solo 2 productos)
- Query a base de datos (será estática)
- Grid de múltiples productos

**Agregar:**
- 2 tarjetas grandes de producto (Res Premium, Pollo Esencial)
- Descripción atractiva para cada proteína
- Precio "desde $X" (mostrando el menor)
- Botón "Ver opciones" que lleva a la página de producto

**Nuevo diseño:**
```typescript
// Productos hardcoded para control total del diseño
const proteinProducts = [
  {
    protein: "res",
    name: "Res Premium",
    tagline: "Nutrición superior",
    description: "Variedad de órganos y carne de res de primera calidad",
    emoji: "🥩",
    badge: "✨ Premium",
    priceFrom: 349,
    slug: "barf-res-500g",
    benefits: ["Mayor variedad de órganos", "Proteína de alta densidad", "Ideal para perros activos"]
  },
  {
    protein: "pollo",
    name: "Pollo Esencial",
    tagline: "Digestión ligera",
    description: "Fórmula balanceada y suave para el estómago",
    emoji: "🐔",
    badge: "💚 Recomendado",
    priceFrom: 299,
    slug: "barf-pollo-500g",
    benefits: ["Fácil digestión", "Ideal para estómagos sensibles", "Proteína magra"]
  }
];
```

### 2. `src/pages/Producto.tsx` - Mejoras en Selector de Presentación

**Agregar:**
- Tooltip/texto que explique que la presentación es preferencia de almacenamiento
- Recomendación visual: "1kg recomendado para perros grandes"
- Mantener el flujo actual de selección

**Cambio en la sección de presentación:**
```typescript
<div>
  <p className="text-sm font-medium mb-2">
    Presentación <span className="text-muted-foreground">(solo preferencia de almacenamiento)</span>
  </p>
  <div className="flex gap-2">
    {/* 500g y 1kg buttons */}
  </div>
  <p className="text-xs text-muted-foreground mt-2">
    💡 Tip: Para perros grandes, el empaque de 1kg es más práctico
  </p>
</div>
```

---

## Nombres de Producto Propuestos

| Proteína | Nombre Actual | Nombre Nuevo | Justificación |
|----------|---------------|--------------|---------------|
| Res | BARF Res 500g/1kg | **Res Premium** | Suena más exclusivo, la res es naturalmente más cara |
| Pollo | BARF Pollo 500g/1kg | **Pollo Esencial** | Sugiere que es completo pero accesible, no "básico" |

Alternativas consideradas:
- Res: "Res Selecta", "Res Gourmet", "Res Gold"
- Pollo: "Pollo Natural", "Pollo Clásico", "Pollo Balance"

---

## Impacto Visual

**Antes:**
- 4 tarjetas pequeñas (500g y 1kg de cada proteína)
- Filtros de proteína innecesarios
- Confusión sobre qué elegir

**Después:**
- 2 tarjetas grandes y atractivas
- Diseño limpio y enfocado
- Flujo claro: elige proteína → elige tamaño → compra

---

## Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `src/pages/Tienda.tsx` | Reescribir con diseño de 2 productos |
| `src/pages/Producto.tsx` | Agregar texto explicativo en selector de presentación |

---

## Sección Técnica

### Nueva Estructura de Tienda.tsx

```typescript
// Componente de tarjeta de proteína grande
function ProteinCard({ protein, name, tagline, emoji, badge, priceFrom, slug, benefits }) {
  return (
    <Link to={`/producto/${slug}`}>
      <Card className="group hover:shadow-xl transition-all h-full">
        {/* Imagen/Emoji grande */}
        <div className="aspect-video bg-gradient-to-br from-secondary/50 to-muted flex items-center justify-center">
          <span className="text-8xl group-hover:scale-110 transition-transform">
            {emoji}
          </span>
          <Badge className="absolute top-4 left-4">{badge}</Badge>
        </div>
        
        {/* Info */}
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold">{name}</h3>
            <p className="text-muted-foreground">{tagline}</p>
          </div>
          
          <ul className="space-y-2">
            {benefits.map(b => <li key={b}>✓ {b}</li>)}
          </ul>
          
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-primary">
              Desde ${priceFrom}
            </span>
            <Button>Ver opciones →</Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

### Cambio en Producto.tsx (líneas ~217-237)

El selector de presentación se mantiene igual funcionalmente, solo se agrega contexto:

```typescript
<div>
  <div className="flex items-center gap-2 mb-2">
    <p className="text-sm font-medium">Presentación</p>
    <Badge variant="outline" className="text-xs">
      Solo almacenamiento
    </Badge>
  </div>
  <div className="flex gap-2">
    {/* Botones 500g y 1kg existentes */}
  </div>
  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
    <span>💡</span>
    <span>Perros grandes (+20kg): recomendamos 1kg para mejor almacenamiento</span>
  </p>
</div>
```

### No se necesitan cambios en base de datos

Los productos actuales ya tienen la estructura correcta:
- `protein_line`: "res" o "pollo"
- `presentation`: "500g" o "1kg"
- El flujo de variantes en Producto.tsx ya funciona bien
