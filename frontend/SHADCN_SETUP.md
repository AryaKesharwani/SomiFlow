# shadcn/ui Setup Complete! 🎉

## What's Been Added

I've set up shadcn/ui in your SomiFlow frontend with a dark theme. Here's what's configured:

### Dependencies Installed
- `class-variance-authority` - For variant-based component styling
- `clsx` - For conditional class merging
- `tailwind-merge` - For Tailwind class merging
- `lucide-react` - Beautiful icon library
- `@radix-ui/react-slot` - Polymorphic component primitive

### Components Created
The following shadcn/ui components are ready to use:

1. **Button** (`@/components/ui/button.tsx`)
   ```tsx
   import { Button } from "@/components/ui/button"
   
   <Button>Click me</Button>
   <Button variant="destructive">Delete</Button>
   <Button variant="outline" size="sm">Small</Button>
   <Button variant="ghost">Ghost Button</Button>
   ```

2. **Card** (`@/components/ui/card.tsx`)
   ```tsx
   import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
   
   <Card>
     <CardHeader>
       <CardTitle>Title</CardTitle>
       <CardDescription>Description text</CardDescription>
     </CardHeader>
     <CardContent>
       Main content here
     </CardContent>
     <CardFooter>
       Footer content
     </CardFooter>
   </Card>
   ```

3. **Badge** (`@/components/ui/badge.tsx`)
   ```tsx
   import { Badge } from "@/components/ui/badge"
   
   <Badge>Default</Badge>
   <Badge variant="success">Success</Badge>
   <Badge variant="destructive">Error</Badge>
   <Badge variant="warning">Warning</Badge>
   <Badge variant="outline">Outline</Badge>
   ```

### Utilities
- **cn** utility (`@/lib/utils.ts`) - For merging Tailwind classes
  ```tsx
  import { cn } from "@/lib/utils"
  
  <div className={cn("base-classes", condition && "conditional-classes")} />
  ```

### Configuration
- Path aliases set up (`@/*` points to `src/*`)
- Dark theme CSS variables in `index.css`
- Vite configured for path resolution

## Examples

### Example 1: Updated WorkflowCreationModal
I've already updated `WorkflowCreationModal.tsx` to use shadcn/ui components with:
- Button component for the close button
- Card components for the AI and Manual options
- Lucide React icons (Zap and Blocks)

### Example 2: Using in AppPage (suggestion)
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Stats card
<Card>
  <CardHeader>
    <CardTitle>Total Workflows</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-4xl font-bold">{workflows.length}</p>
  </CardContent>
</Card>

// Workflow status
<Badge variant={workflow.isActive ? "success" : "default"}>
  {workflow.isActive ? "Active" : "Inactive"}
</Badge>

// Action button
<Button onClick={handleSave} variant="default">
  Save Workflow
</Button>
```

## Next Steps

You can now:
1. Replace traditional buttons with the `Button` component
2. Use `Card` components for all card-based layouts
3. Replace status indicators with `Badge` components
4. Add more shadcn/ui components as needed (Dialog, Input, Select, etc.)

## Adding More Components

To add more shadcn/ui components, you can manually create them following the same pattern, or refer to the shadcn/ui documentation at https://ui.shadcn.com/docs/components

Example components you might want to add:
- Dialog (modals)
- Input (form inputs)
- Select (dropdowns)
- Tabs
- Tooltip
- Toast (notifications)
- Sheet (side panels)

## Dark Theme Customization

The dark theme colors are defined in `index.css` as CSS variables. You can customize them:

```css
:root {
  --background: 0 0% 4%;       /* Main background */
  --foreground: 0 0% 95%;      /* Main text */
  --card: 0 0% 10%;            /* Card background */
  --border: 0 0% 27%;          /* Border colors */
  /* ... and more */
}
```

Happy coding! 🚀
