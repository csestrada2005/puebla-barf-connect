

# Fix: Make Dog Image Span Across Sections on Nosotros Page

## Problem
The brown dog image on `/nosotros` has its ear cropped because:
1. It's positioned inside the hero section which has `overflow-hidden`
2. The `-top-4` positioning pushes the ear above the section boundary, where it gets clipped

## Solution
Move the dog image **outside** of the hero section so it can visually span across the boundary between the hero and the "Lo que nos mueve" section below, creating a more interactive, immersive effect.

### Changes to `src/pages/Nosotros.tsx`

**Current structure:**
```text
<Layout>
  <section className="... overflow-hidden">
    <motion.div> <!-- Dog lives here, gets clipped -->
      <img ... />
    </motion.div>
    <div className="container"> ... </div>
  </section>
  <section> <!-- Mission/Vision --> </section>
</Layout>
```

**New structure:**
```text
<Layout>
  <div className="relative"> <!-- New wrapper -->
    <motion.div> <!-- Dog now lives here, unrestricted -->
      <img ... />
    </motion.div>
    <section className="... overflow-hidden">
      <div className="container"> ... </div>
    </section>
    <section> <!-- Mission/Vision --> </section>
  </div>
</Layout>
```

### Key Changes

| Aspect | Before | After |
|--------|--------|-------|
| Dog container | Inside `<section>` with `overflow-hidden` | Outside, in a wrapper `<div>` |
| Cropping | Ear clipped by `overflow-hidden` | Fully visible |
| Visual effect | Feels constrained | Dog appears to "bridge" both sections |
| z-index | `z-20` | `z-20` (preserved, sits above both sections) |
| Position | `absolute -top-4 right-0` | `absolute top-8 right-0` (adjusted to align with hero) |

---

## Technical Details

1. **Wrap both sections** (hero + mission/vision) in a `relative` container so the dog can be positioned relative to this larger area
2. **Remove dog from hero section** so it's no longer affected by `overflow-hidden`
3. **Adjust vertical positioning** from `-top-4` to something like `top-8` or `top-12` so the dog aligns nicely with the hero while its ear extends slightly above
4. The dog will now visually "sit" on top of both sections, creating the interactive effect you want

