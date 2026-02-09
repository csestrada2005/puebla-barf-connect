
## Fix: Collapsible sections closing when typing in Checkout

### Problem
The `CollapsibleSection` component is defined **inside** the `Checkout` component's render body. Every time any state changes (e.g., typing in an input field updates form state), React creates a brand-new component reference. React sees it as a completely different component, so it **unmounts and remounts** the entire section — causing inputs to lose focus and sections to appear to "close."

### Solution
Extract `CollapsibleSection` as a standalone component **outside** of the `Checkout` function. This ensures React maintains a stable component identity across renders, preserving input focus and collapsible state.

### Technical Details

**File: `src/pages/Checkout.tsx`**

1. Move the `CollapsibleSection` component definition **before** the `Checkout` function (or into its own file), making it a top-level component instead of an inline one.

```tsx
// BEFORE the Checkout component
const CollapsibleSection = ({ title, open, onOpenChange, children, icon }: {
  title: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <Collapsible open={open}>
    <Card>
      <div
        role="button"
        tabIndex={0}
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => onOpenChange(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target === e.currentTarget) onOpenChange(!open);
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">{icon}{title}</span>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </CardTitle>
        </CardHeader>
      </div>
      <CollapsibleContent>
        <CardContent className="space-y-4 pt-0" onClick={(e) => e.stopPropagation()}>
          {children}
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>
);
```

That's it -- one move, no logic changes. This fixes the root cause.
