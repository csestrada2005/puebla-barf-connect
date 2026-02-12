

## Fix: Cart layout for subscription items on mobile

### Root cause analysis

After 5 attempts focusing on container padding (`px-*` classes, `container` class conflicts), the actual problem is **inside the card itself**, not the outer container. The container IS centered correctly.

The real issues are:

1. **Missing `shrink-0` on right controls**: The div containing the trash button and +/- controls (line 141) lacks `shrink-0`, so on narrow mobile screens with long subscription names, the flex layout compresses these controls, making the card look lopsided.

2. **Unnecessary quantity controls for subscriptions**: Subscription items always have quantity 1 (the `addItem` logic replaces existing subscriptions). Showing +/- buttons for subscriptions adds visual clutter and makes the right side heavier, creating an unbalanced layout.

3. **Long subscription names cause truncation issues**: Names like "Suscripcion Mensual - BARF Res 500g" are very long. While `truncate` clips the text, the overall card layout becomes left-heavy because the meaningful content (name + price) is all on the left with empty or compressed space on the right.

### Solution

**File: `src/pages/Carrito.tsx`**

1. Add `shrink-0` to the right controls container (line 141) to prevent it from being compressed
2. Conditionally hide +/- quantity controls for subscription items (they always have qty 1)
3. For subscription items, show only a single trash/remove button on the right side, keeping the card compact and visually balanced

### Technical changes

```text
Before (line 141):
<div className="flex flex-col items-end gap-2">
  <Button ... trash />
  <div ... +/- controls />   <-- shown for ALL items
</div>

After:
<div className="flex flex-col items-end gap-2 shrink-0">
  <Button ... trash />
  {!item.isSubscription && (
    <div ... +/- controls />  <-- hidden for subscriptions
  )}
</div>
```

This is a one-file change with two specific modifications:
- Line 141: add `shrink-0` to the class list
- Lines 150-168: wrap quantity controls in `{!item.isSubscription && (...)}`

