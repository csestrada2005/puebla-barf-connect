
# Fix: Crop Transparent Space Around Pitbull Image

## Problem
The `play-pitbull.png` image has significant transparent padding around the actual dog. When sizing the image element, this empty space is included, making the image container much larger than the visible dog content.

## Solution
Apply CSS cropping techniques to focus on the visible dog and eliminate the impact of transparent areas.

### Changes to `src/pages/Cobertura.tsx`

**Current image styling:**
```jsx
className="w-80 lg:w-96 xl:w-[28rem] object-contain drop-shadow-xl pointer-events-none"
```

**New image styling:**
```jsx
className="w-72 lg:w-80 xl:w-96 h-48 lg:h-56 xl:h-64 object-cover object-top drop-shadow-xl pointer-events-none"
```

**Key changes:**
1. **Add fixed height** (`h-48 lg:h-56 xl:h-64`) - Constrains vertical space taken
2. **Change to `object-cover`** - Allows the image to fill the container and be cropped
3. **Add `object-top`** - Positions the crop to show the dog (top portion) rather than centering
4. **Slightly reduce widths** - Compensate for the cropping behavior

This approach effectively "zooms in" on the dog portion of the image while reducing the overall element footprint on the page.

---

## Technical Details

| Property | Before | After | Purpose |
|----------|--------|-------|---------|
| `width` | `w-80 lg:w-96 xl:w-[28rem]` | `w-72 lg:w-80 xl:w-96` | Slightly smaller container |
| `height` | (auto) | `h-48 lg:h-56 xl:h-64` | Constrain vertical space |
| `object-fit` | `object-contain` | `object-cover` | Allow cropping |
| `object-position` | (default: center) | `object-top` | Focus on the dog |

## Alternative (Long-term)
For the best results, consider editing the `play-pitbull.png` file to crop out the transparent padding. This would allow normal sizing without CSS cropping tricks.
