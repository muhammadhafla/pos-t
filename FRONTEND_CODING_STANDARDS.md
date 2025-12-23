# Frontend Coding Standards

## Table of Contents
1. [Project Structure](#project-structure)
2. [File Naming Conventions](#file-naming-conventions)
3. [Code Organization](#code-organization)
4. [React Component Standards](#react-component-standards)
5. [Styling Guidelines](#styling-guidelines)
6. [TypeScript Guidelines](#typescript-guidelines)
7. [Performance Standards](#performance-standards)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Testing Standards](#testing-standards)
10. [Code Review Checklist](#code-review-checklist)

## Project Structure

### Directory Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── auth/           # Authentication-related components
│   ├── cash/           # Cash management components
│   └── [feature]/      # Feature-specific components
├── contexts/           # React contexts for state management
├── lib/               # Utility functions and configurations
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── styles/            # Global styles and themes
```

### File Naming Conventions

#### Components
- **Components**: PascalCase with descriptive names
  - ✅ `TransactionHistory.jsx`
  - ✅ `PaymentModal.jsx`
  - ❌ `transaction-history.jsx`

- **UI Components**: Use descriptive names ending with component type
  - ✅ `Button.tsx`
  - ✅ `Input.tsx`
  - ✅ `Dialog.tsx`

#### Stylesheets
- **CSS Modules**: kebab-case with component name
  - ✅ `transaction-history.css`
  - ✅ `payment-modal.css`

#### Utilities and Hooks
- **Hooks**: camelCase starting with 'use'
  - ✅ `useLocalStorage.js`
  - ✅ `useDebounce.js`

#### Configuration Files
- **Configuration**: camelCase or kebab-case
  - ✅ `tailwind.config.js`
  - ✅ `vite.config.js`

## Code Organization

### Import Order
```jsx
// 1. React and library imports
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

// 2. UI component imports
import { Button } from './ui/button';
import { Input } from './ui/input';

// 3. Icon imports (MANDATORY: Lucide React only)
import { 
  ShoppingCart, 
  Search, 
  Sparkles,
  Plus,
  Trash2,
  CreditCard,
  Camera,
  BarChart3,
  FileText
} from 'lucide-react';

// 4. Local component imports
import PaymentModal from './PaymentModal';

// 5. CSS imports
import './POSInterface.css';
```

### Component Structure
```jsx
// Component with proper structure
const ComponentName = ({ prop1, prop2, theme }) => {
  // 1. State declarations
  const [state, setState] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  
  // 2. Ref declarations
  const inputRef = useRef(null);
  
  // 3. Effect hooks
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 4. Event handlers
  const handleSubmit = (data) => {
    // Handler logic
  };
  
  // 5. Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };
  
  // 6. Render
  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

## React Component Standards

### Functional Components
- Use functional components with hooks
- Destructure props in parameter list
- Use descriptive prop names

```jsx
// ✅ Good
const ProductCard = ({ product, onAddToCart, isLoading }) => {
  // Component logic
};

// ❌ Bad
const ProductCard = (props) => {
  const { product, onAddToCart, isLoading } = props;
  // Component logic
};
```

### Props Naming
- Use camelCase for prop names
- Use descriptive names that indicate purpose
- Use `on` prefix for event handlers
- Use `is` prefix for boolean props

```jsx
// ✅ Good
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isLoading?: boolean;
  variant?: 'default' | 'compact';
}

// ❌ Bad
interface ProductCardProps {
  prod: Product;
  add: (product: Product) => void;
  loading: boolean;
  type: string;
}
```

### State Management
- Use `useState` for simple state
- Use `useReducer` for complex state logic
- Use `useContext` for shared state
- Keep state as close to where it's used as possible

```jsx
// ✅ Good - Simple state
const [cart, setCart] = useState([]);

// ✅ Good - Complex state
const [state, dispatch] = useReducer(cartReducer, initialState);

// ✅ Good - Shared state
const { user, setUser } = useAuth();
```

### Event Handling
- Use arrow functions for event handlers
- Destructure event properties you need
- Prevent default behavior when necessary

```jsx
// ✅ Good
const handleSubmit = (e) => {
  e.preventDefault();
  // Handle submit
};

const handleInputChange = ({ target: { value } }) => {
  setInputValue(value);
};

// ✅ Good - With type checking
const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // Handle click
};
```

## Styling Guidelines

### MANDATORY: Tailwind CSS + shadcn/ui + Lucide Icons
**All styling MUST use these technologies consistently:**

#### 1. Tailwind CSS (Primary Styling Framework)
- Use Tailwind utility classes for ALL styling
- No custom CSS classes unless absolutely necessary
- Use Tailwind's spacing scale (4px base: 4, 8, 12, 16, 20, 24px)
- Use Tailwind's color system with custom design tokens

#### 2. shadcn/ui Components (UI Components)
- Use shadcn/ui components as the base for all UI elements
- Button, Input, Dialog, Table, etc. from shadcn/ui
- Extend components with custom Tailwind classes when needed

#### 3. Lucide React Icons (ALL Icons)
- Use Lucide React library for ALL icons
- Consistent sizing: w-4 h-4, w-5 h-5, w-6 h-6
- No other icon libraries (Font Awesome, Material Icons, etc.)

#### 4. Consistent Color Scheme
- Use CSS custom properties from the design system
- Primary: Blue (#3b82f6), Secondary: Green (#10b981)
- Semantic colors for states: success, warning, error
- Support both light and dark themes

### MANDATORY Design System Colors
```css
/* Consistent Color Scheme - Use these exact values */
:root {
  --primary: 221.2 83.2% 53.3%;        /* Blue-500 */
  --primary-foreground: 210 40% 98%;   /* White */
  --secondary: 210 40% 96%;            /* Gray-50 */
  --secondary-foreground: 222.2 47.4% 11.2%; /* Gray-900 */
  --accent: 210 40% 96%;               /* Gray-50 */
  --accent-foreground: 222.2 47.4% 11.2%; /* Gray-900 */
  --destructive: 0 84.2% 60.2%;        /* Red-500 */
  --destructive-foreground: 210 40% 98%; /* White */
  --muted: 210 40% 96%;                /* Gray-50 */
  --muted-foreground: 215.4 16.3% 46.9%; /* Gray-500 */
  --background: 0 0% 100%;             /* White */
  --foreground: 222.2 84% 4.9%;        /* Gray-900 */
  --card: 0 0% 100%;                   /* White */
  --card-foreground: 222.2 84% 4.9%;   /* Gray-900 */
  --border: 214.3 31.8% 91.4%;         /* Gray-200 */
  --input: 214.3 31.8% 91.4%;          /* Gray-200 */
  --ring: 221.2 83.2% 53.3%;           /* Blue-500 */
}

.dark {
  --primary: 217.2 91.2% 59.8%;        /* Blue-400 */
  --background: 222.2 84% 4.9%;        /* Gray-900 */
  --foreground: 210 40% 98%;           /* White */
  --card: 222.2 84% 4.9%;              /* Gray-900 */
  --card-foreground: 210 40% 98%;      /* White */
  --border: 217.2 32.6% 17.5%;         /* Gray-800 */
  --input: 217.2 32.6% 17.5%;          /* Gray-800 */
}
```

### Gradient Usage
```jsx
// ✅ Good - Use consistent gradients
<div className="bg-gradient-to-br from-background via-background to-muted/20">
  <div className="bg-gradient-to-r from-primary to-primary/80">
```

### Spacing and Layout
- Use consistent spacing utilities
- Prefer flexbox and grid for layouts
- Use semantic class names

```jsx
// ✅ Good
<div className="flex items-center gap-4 p-6">
  <div className="flex-1 space-y-2">
    {/* Content */}
  </div>
</div>

// ❌ Bad
<div className="display: flex; align-items: center; gap: 16px; padding: 24px;">
```

### Component Styling Patterns

#### Cards (Tailwind CSS Pattern)
```jsx
// ✅ Standard card using Tailwind utilities
<div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-xl">
  {/* Card content */}
</div>

// ✅ Alternative card pattern
<div className="bg-background border border-border rounded-lg p-4 shadow-sm">
  {/* Content */}
</div>

// ❌ Don't create custom CSS classes
<div className="card-container"> {/* Never do this */}
```

#### Buttons (shadcn/ui + Tailwind CSS)
```jsx
// ✅ Primary button using shadcn/ui Button
<Button 
  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
>
  Action
</Button>

// ✅ Outline button using shadcn/ui variant
<Button 
  variant="outline"
  className="border-2 border-primary/50 hover:bg-primary hover:text-white transition-all duration-200"
>
  Secondary Action
</Button>

// ✅ Destructive button
<Button variant="destructive">
  Delete
</Button>

// ✅ Button with icon (Lucide React)
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Add Item
</Button>

// ❌ Don't use custom button classes
<button className="custom-button"> {/* Never do this */}
```

#### Forms (shadcn/ui + Tailwind CSS)
```jsx
// ✅ Input using shadcn/ui Input
<Input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text..."
  className="h-12 px-4 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
/>

// ✅ Form with label and input
<div className="space-y-2">
  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
    Name
  </label>
  <Input placeholder="Enter name" />
</div>

// ❌ Don't use custom input styles
<input className="custom-input" /> {/* Never do this */}
```

### MANDATORY: Tailwind CSS Only
**NO custom CSS classes, CSS modules, or inline styles allowed**

```jsx
// ✅ Use Tailwind utilities ONLY
<div className="bg-primary text-white p-4 rounded-lg">
  Content
</div>

// ✅ Use CSS custom properties for theming
<div className="bg-background text-foreground" style={{ '--custom-color': 'value' }}>
  Content
</div>

// ❌ NEVER do this
<style>
  .custom-class { /* Don't create custom CSS */ }
</style>

// ❌ NEVER do this
<div style={{ backgroundColor: 'red', padding: '20px' }}>

// ❌ NEVER do this
import styles from './Component.module.css';
<div className={styles.container}>
```

## TypeScript Guidelines

### Interface and Type Definitions
- Use interfaces for object shapes
- Use type for unions and primitives
- Export interfaces for reuse

```typescript
// ✅ Interface for objects
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  barcode: string;
}

// ✅ Type for unions
export type PaymentMethod = 'cash' | 'card' | 'mobile';

// ✅ Type for props
export interface ButtonProps {
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}
```

### React Types
- Use `React.FC` for functional components
- Use `React.ReactNode` for children
- Use `React.ChangeEvent` for form events

```typescript
// ✅ Component with TypeScript
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
  children?: React.ReactNode;
}

const Component: React.FC<ComponentProps> = ({ title, onSubmit, children }) => {
  // Component implementation
};
```

### Generic Types
- Use generics for reusable components
- Constrain generics when possible

```typescript
// ✅ Generic hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    // Implementation
  });
  
  return [value, setValue] as const;
}
```

## Performance Standards

### React Performance
- Use `React.memo` for expensive components
- Use `useCallback` for event handlers
- Use `useMemo` for expensive calculations

```jsx
// ✅ Expensive component memoization
const ProductList = React.memo(({ products }) => {
  // Expensive rendering logic
});

// ✅ Memoized calculation
const expensiveValue = useMemo(() => {
  return products.reduce((total, product) => total + product.price, 0);
}, [products]);

// ✅ Memoized event handler
const handleSubmit = useCallback((data) => {
  submitData(data);
}, [submitData]);
```

### Image Optimization
- Use appropriate image formats (WebP, AVIF)
- Implement lazy loading
- Use responsive images

```jsx
// ✅ Lazy loaded image
<img 
  src={imageSrc} 
  alt="Description"
  loading="lazy"
  className="w-full h-auto"
/>
```

### Bundle Optimization
- Use code splitting for large components
- Tree shake unused code
- Optimize dependencies

## Accessibility Requirements

### Semantic HTML
- Use semantic HTML elements
- Provide proper heading hierarchy
- Use meaningful link text

```jsx
// ✅ Semantic HTML
<main role="main">
  <section aria-labelledby="products-heading">
    <h2 id="products-heading">Available Products</h2>
    {/* Content */}
  </section>
</main>

// ❌ Non-semantic
<div>
  <div>Available Products</div>
  {/* Content */}
</div>
```

### ARIA Attributes
- Use ARIA labels for interactive elements
- Provide ARIA descriptions for complex widgets
- Use ARIA roles appropriately

```jsx
// ✅ Proper ARIA usage
<button 
  aria-label="Add product to cart"
  aria-describedby="product-price"
  onClick={handleAddToCart}
>
  Add to Cart
</button>
<div id="product-price">Price: $19.99</div>
```

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Provide focus indicators
- Use logical tab order

```jsx
// ✅ Focus styles
.focus-visible\:outline-none:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

### Color Contrast
- Maintain WCAG AA contrast ratios (4.5:1 for normal text)
- Don't rely solely on color to convey information

## Testing Standards

### Component Testing
- Test component rendering
- Test user interactions
- Test edge cases and error states

```jsx
// ✅ Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import Component from './Component';

test('renders component with title', () => {
  render(<Component title="Test Title" />);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
});

test('handles click events', () => {
  const handleClick = jest.fn();
  render(<Component onClick={handleClick} />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Accessibility Testing
- Use testing-library/jest-dom for accessibility tests
- Test keyboard navigation
- Test screen reader compatibility

```jsx
// ✅ Accessibility test
import { axe } from '@axe-core/react';

test('component is accessible', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Code Review Checklist

### Code Quality
- [ ] Code follows naming conventions
- [ ] Functions are small and focused
- [ ] No duplicate code
- [ ] Proper error handling
- [ ] Code is well-commented where complex

### React Best Practices
- [ ] Components are functional with hooks
- [ ] Props are properly typed
- [ ] State is properly managed
- [ ] Effects have proper dependencies
- [ ] Components are memoized when needed

### Styling
- [ ] Uses consistent design system
- [ ] Responsive design implemented
- [ ] No inline styles (except dynamic values)
- [ ] Accessibility considerations in styling

### Performance
- [ ] No unnecessary re-renders
- [ ] Images are optimized
- [ ] Bundle size is reasonable
- [ ] No memory leaks

### Testing
- [ ] Components are tested
- [ ] User interactions are tested
- [ ] Accessibility requirements are met
- [ ] Edge cases are covered

### Documentation
- [ ] Complex functions are documented
- [ ] PropTypes or TypeScript interfaces are complete
- [ ] README is updated if needed
- [ ] Changelog is updated

## MANDATORY Technology Stack

### 1. Tailwind CSS (Primary Styling)
**All styling MUST use Tailwind utilities**

#### Spacing Scale
```jsx
// ✅ Use Tailwind spacing (4px base)
m-4 p-4 gap-4 space-y-4  // 16px
m-6 p-6 gap-6 space-y-6  // 24px
m-8 p-8 gap-8 space-y-8  // 32px

// ❌ Don't use custom spacing
margin: 20px; padding: 20px;
```

#### Color Usage
```jsx
// ✅ Use Tailwind color system
className="bg-primary text-primary-foreground border-border"
className="bg-secondary text-secondary-foreground"
className="bg-muted text-muted-foreground"

// ❌ Don't use custom colors
className="bg-blue-500 text-white"
```

### 2. shadcn/ui Components (UI Building Blocks)
**Use shadcn/ui components for all UI elements**

#### Button Variants
```jsx
// ✅ All button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// ✅ Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

#### Input Components
```jsx
// ✅ All input types
<Input type="text" />
<Input type="email" />
<Input type="password" />
<Input type="number" />
<Input type="search" />

// ✅ With icons
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
  <Input className="pl-10" placeholder="Search..." />
</div>
```

### 3. Lucide React Icons (MANDATORY)
**ALL icons must use Lucide React**

#### Icon Sizing Standards
```jsx
// ✅ Consistent icon sizes
<Icon className="w-4 h-4" />   {/* Small icons */}
<Icon className="w-5 h-5" />   {/* Medium icons */}
<Icon className="w-6 h-6" />   {/* Large icons */}
<Icon className="w-8 h-8" />   {/* Extra large icons */}
```

#### Common Icons for POS System
```jsx
// ✅ Navigation & Actions
import { Home, Settings, User, LogOut } from 'lucide-react';

// ✅ Product Management
import { Package, Plus, Edit, Trash2, Search } from 'lucide-react';

// ✅ Transaction & Payment
import { ShoppingCart, CreditCard, DollarSign, Receipt } from 'lucide-react';

// ✅ UI Elements
import { Menu, X, Check, AlertCircle, Info } from 'lucide-react';

// ✅ Data & Analytics
import { BarChart3, TrendingUp, Calendar, Filter } from 'lucide-react';
```

#### Icon Usage Patterns
```jsx
// ✅ Button with icon
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Add Product
</Button>

// ✅ Icon-only button
<Button size="icon" variant="outline">
  <Search className="w-4 h-4" />
</Button>

// ✅ Status indicators
<div className="flex items-center gap-2">
  <Check className="w-4 h-4 text-green-500" />
  <span className="text-sm">Success</span>
</div>

// ✅ Navigation icons
<nav className="flex items-center gap-4">
  <Button variant="ghost" size="sm">
    <Home className="w-4 h-4 mr-2" />
    Home
  </Button>
</nav>
```

## Design System Implementation

### Component Variants
- Use consistent variant patterns from shadcn/ui
- Document all available variants
- Ensure variants are accessible

```jsx
// ✅ shadcn/ui button variants (built-in)
const buttonVariants = {
  default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline"
};
```

### Theme Integration
- Support light/dark themes
- Use CSS custom properties for theming
- Ensure sufficient color contrast

```css
/* ✅ Theme-aware styles */
.component {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}

.dark .component {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

## Tools and Configuration

### MANDATORY Tools
- **Tailwind CSS**: Primary styling framework
- **shadcn/ui**: UI component library
- **Lucide React**: Icon library
- **TypeScript**: Type checking
- **ESLint**: Code linting
- **Prettier**: Code formatting

### Package.json Dependencies
Ensure these are always included:
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-slot": "^1.2.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.562.0",
    "tailwind-merge": "^3.4.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### Configuration Files
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react-hooks/recommended"
  ],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### Git Hooks
- Pre-commit: Run linting and tests
- Pre-push: Run full test suite
- Commit message: Validate format

## Version Control

### Branch Naming
- Feature: `feature/component-name`
- Bug fix: `fix/issue-description`
- Hotfix: `hotfix/critical-fix`

### Commit Messages
```
type(scope): description

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process changes

## Implementation Guidelines

### Phase 1: Immediate Actions (WEEK 1)
1. ✅ **Install and configure Tailwind CSS** - Already configured
2. ✅ **Set up shadcn/ui components** - Button, Input, Dialog components available
3. ✅ **Configure Lucide React icons** - Already installed and used
4. **Create component templates** with shadcn/ui patterns
5. **Establish linting rules** for Tailwind class ordering

### Phase 2: Code Migration (WEEKS 2-3)
1. **Refactor existing components** to use shadcn/ui exclusively
2. **Replace custom CSS** with Tailwind utilities
3. **Update all icons** to use Lucide React
4. **Standardize color usage** with design tokens
5. **Add missing TypeScript types**

### Phase 3: Long-term Maintenance (ONGOING)
1. **Code reviews** must check for standards compliance
2. **Automated testing** with accessibility requirements
3. **Performance monitoring** for bundle size and rendering
4. **Documentation updates** as patterns evolve

### Quick Reference: Common Patterns

#### Card Component
```jsx
// ✅ Standard card pattern
<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
  <h3 className="text-lg font-semibold mb-2">Title</h3>
  <p className="text-muted-foreground">Content</p>
</div>
```

#### Form Layout
```jsx
// ✅ Form with proper spacing
<form className="space-y-4">
  <div className="space-y-2">
    <label className="text-sm font-medium">Name</label>
    <Input placeholder="Enter name" />
  </div>
  <Button type="submit">Submit</Button>
</form>
```

#### Navigation
```jsx
// ✅ Navigation with icons
<nav className="flex items-center gap-2">
  <Button variant="ghost" size="sm">
    <Home className="w-4 h-4 mr-2" />
    Dashboard
  </Button>
  <Button variant="ghost" size="sm">
    <Package className="w-4 h-4 mr-2" />
    Products
  </Button>
</nav>
```

#### Status Indicators
```jsx
// ✅ Status with icons
<div className="flex items-center gap-2">
  <Check className="w-4 h-4 text-green-500" />
  <span className="text-sm text-green-700">Active</span>
</div>

<div className="flex items-center gap-2">
  <AlertCircle className="w-4 h-4 text-yellow-500" />
  <span className="text-sm text-yellow-700">Pending</span>
</div>
```

## Conclusion

These standards establish **MANDATORY** guidelines for maintaining consistency across the frontend codebase using:

- ✅ **Tailwind CSS** for all styling
- ✅ **shadcn/ui** for UI components
- ✅ **Lucide React** for all icons
- ✅ **Consistent color scheme** and design tokens

### Key Principles
1. **Consistency**: All components follow the same patterns
2. **Maintainability**: Easy to understand and modify code
3. **Performance**: Optimized React components and bundle size
4. **Accessibility**: WCAG compliant user interface
5. **Quality**: Thorough testing and code review processes

### Enforcement
- Code reviews must check compliance with these standards
- Linting rules will enforce Tailwind CSS usage
- Pre-commit hooks will validate component patterns
- Regular audits will ensure ongoing compliance

For questions or suggestions about these standards, please discuss with the development team and update this document accordingly.

