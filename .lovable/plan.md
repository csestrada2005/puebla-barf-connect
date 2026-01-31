

# Performance Overhaul: Feasibility Analysis & Implementation Plan

## Executive Summary

Your 3-step plan is **largely feasible** with a few modifications needed for optimal results.

---

## Step 1: BrandImage Smart Component

**Verdict: Fully Feasible**

### What Will Work

| Feature | Feasibility | Notes |
|---------|-------------|-------|
| `priority` prop for eager/lazy loading | YES | Native browser attributes work well |
| `loading="eager/lazy"` | YES | Widely supported |
| `decoding="sync/async"` | YES | Good for perceived performance |
| `fetchPriority="high/low"` | YES | Chromium-based browsers, graceful fallback |
| Blur-up placeholder effect | YES | Via CSS `filter: blur()` + transition |

### Implementation Details

```text
src/components/ui/BrandImage.tsx
├── Props: src, alt, className, priority (default: false)
├── Eager mode: loading="eager", decoding="sync", fetchPriority="high"  
├── Lazy mode: loading="lazy", decoding="async"
└── Blur effect: CSS-based transition from blurred placeholder to sharp
```

### Files to Update

| File | Changes | Priority Images |
|------|---------|-----------------|
| `src/pages/Home.tsx` | 13 images total | `heroBorderCollie`, `logoTaglineBlack` = priority |
| `src/components/layout/Header.tsx` | 2 images | `logoChoco` = priority |
| `src/components/layout/Layout.tsx` | 1 image | `dogtorAvatar` = priority (FAB always visible) |
| `src/pages/Nosotros.tsx` | 1 image | `nosotrosBrownDog` = priority (hero) |
| `src/components/home/BenefitsSection.tsx` | 1 image | `benefitsDog` = lazy (below fold) |
| Other pages | Various | All lazy (not initial route) |

---

## Step 2: Vite Build Optimization

**Verdict: Partially Feasible - Needs Modification**

### What Works

```text
manualChunks: {
  'vendor': ['react', 'react-dom', 'framer-motion']
}
```

This is valid and will create a separate vendor bundle for better caching.

### What Doesn't Work

```text
'ui': ['./src/components/ui']      // INVALID - not a module path
'brand': ['./src/assets/brand']    // INVALID - images are not JS modules
```

**Problem:** Rollup's `manualChunks` only works with JavaScript/TypeScript modules, not directories or static assets.

### Corrected Approach

```text
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom', 'react-router-dom'],
        'motion': ['framer-motion'],
        'query': ['@tanstack/react-query'],
        'supabase': ['@supabase/supabase-js']
      }
    }
  }
}
```

### Image Optimization Options

| Option | Effort | Effect |
|--------|--------|--------|
| `vite-plugin-imagemin` | Medium | Auto-compress at build time |
| Manual WebP conversion | Low | Pre-convert `.png` to `.webp` |
| Use `<picture>` element | Low | Serve WebP with PNG fallback |

**Recommendation:** For simplest implementation, I'll add basic chunk splitting. Image optimization plugins add complexity and can be done later.

---

## Step 3: Route-Based Lazy Loading

**Verdict: Fully Feasible**

### Current State (All Eager)

```typescript
import Home from "./pages/Home";
import Tienda from "./pages/Tienda";
import Admin from "./pages/Admin";
// ... all 15+ pages loaded immediately
```

### Proposed State (Smart Lazy)

```text
Eager (instant load):
├── Home (initial route)
└── Shared: AuthProvider, Layout, Header

Lazy (loaded on demand):
├── Tienda
├── Producto  
├── Cobertura
├── AIRecomendador
├── Carrito
├── Checkout
├── Suscripcion
├── FAQ
├── Login / Registro
├── MiCuenta
├── Admin
├── Terminos / Privacidad
├── GuiasBarf
├── Nosotros
└── NotFound
```

### Loading Fallback Component

```text
src/components/ui/PageLoader.tsx
├── Centered spinner
├── Brand-consistent styling
└── Smooth fade-in animation
```

---

## Implementation Summary

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ui/BrandImage.tsx` | Smart image component with priority loading |
| `src/components/ui/PageLoader.tsx` | Loading spinner for lazy routes |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add lazy imports + Suspense wrapper |
| `src/pages/Home.tsx` | Replace 13 `<img>` tags with `<BrandImage>` |
| `src/components/layout/Header.tsx` | Replace 2 `<img>` tags with `<BrandImage>` |
| `src/components/layout/Layout.tsx` | Replace 1 `<img>` tag with `<BrandImage>` |
| `src/components/home/BenefitsSection.tsx` | Replace 1 `<img>` tag with `<BrandImage>` |
| `vite.config.ts` | Add build chunk optimization |

### Priority Mapping

| Image | Location | Priority |
|-------|----------|----------|
| `heroBorderCollie` | Home hero | HIGH |
| `logoTaglineBlack` | Home hero | HIGH |
| `logoChoco` | Header | HIGH |
| `dogtorAvatar` | FAB (Layout) | HIGH |
| All decorative icons | Home sections | LOW |
| `benefitsDog` | BenefitsSection | LOW |
| Route-specific dogs | Other pages | LOW (lazy loaded anyway) |

---

## Technical Notes

### BrandImage Component Logic

```text
if (priority):
  - loading="eager"
  - decoding="sync" 
  - fetchPriority="high"
else:
  - loading="lazy"
  - decoding="async"

Blur effect:
  - Initial state: filter blur(10px), opacity 0.8
  - On load: transition to filter blur(0), opacity 1
  - Uses onLoad event to detect when image is ready
```

### Lazy Loading Pattern

```text
const Tienda = lazy(() => import('./pages/Tienda'));

<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/" element={<Home />} />  {/* NOT lazy */}
    <Route path="/tienda" element={<Tienda />} />  {/* Lazy */}
  </Routes>
</Suspense>
```

---

## Expected Performance Gains

| Metric | Before | After (Expected) |
|--------|--------|------------------|
| Initial JS bundle | ~800KB+ | ~300KB (Home only) |
| Image blocking | All images compete | Priority images first |
| Route change | Already loaded (wasted) | Load on demand |
| LCP (Largest Contentful Paint) | Delayed by non-critical | Improved via priority |
| CLS (Cumulative Layout Shift) | Possible shifts | Reduced via blur placeholder |

---

## Order of Implementation

1. Create `BrandImage.tsx` component
2. Create `PageLoader.tsx` component  
3. Update `vite.config.ts` with chunk splitting
4. Convert `App.tsx` to lazy loading pattern
5. Replace `<img>` tags in Home.tsx (13 images)
6. Replace `<img>` tags in Header.tsx (2 images)
7. Replace `<img>` tags in Layout.tsx (1 image)
8. Replace `<img>` tags in BenefitsSection.tsx (1 image)

