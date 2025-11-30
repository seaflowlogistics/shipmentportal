# UI Component Library Guide

A comprehensive guide to using the reusable UI components in the Shipment Portal.

## Quick Start

Import components from `src/components`:

```tsx
import {
  Button,
  Input,
  Select,
  Alert,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  Modal,
  ConfirmDialog,
  Loading,
  EmptyState,
} from '@/components';
```

## Components

### Button

Flexible button component with multiple variants and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean (shows spinner, disables button)
- `leftIcon`: React.ReactNode
- `rightIcon`: React.ReactNode
- All standard HTML button attributes

**Examples:**

```tsx
// Primary button
<Button>Click me</Button>

// With loading state
<Button isLoading={loading}>Submitting...</Button>

// Danger button
<Button variant="danger">Delete</Button>

// With icons
import { PlusIcon } from '@heroicons/react/24/outline';
<Button leftIcon={<PlusIcon className="w-5 h-5" />}>
  Create New
</Button>

// Ghost button
<Button variant="ghost">Cancel</Button>

// Size variations
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Input

Text input with labels, validation, and helper text.

**Props:**
- `label`: string
- `error`: string (shows error state and message)
- `helperText`: string
- `leftIcon`: React.ReactNode
- `rightIcon`: React.ReactNode
- All standard HTML input attributes

**Examples:**

```tsx
const [email, setEmail] = useState('');
const [error, setError] = useState('');

<Input
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
  helperText="We'll never share your email"
/>
```

### Select

Dropdown select with labels and validation.

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `options`: Array<{value: string, label: string}>
- `placeholder`: string
- All standard HTML select attributes

**Examples:**

```tsx
const [role, setRole] = useState('');

<Select
  label="User Role"
  value={role}
  onChange={(e) => setRole(e.target.value)}
  options={[
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'user', label: 'User' },
  ]}
  placeholder="Select a role"
/>
```

### Alert

Dismissible alert messages for success, error, warning, and info.

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info'
- `title`: string (optional)
- `message`: string
- `dismissible`: boolean (default: true)
- `onClose`: () => void

**Examples:**

```tsx
const [showAlert, setShowAlert] = useState(true);

{showAlert && (
  <Alert
    type="success"
    title="Success!"
    message="Your changes have been saved."
    onClose={() => setShowAlert(false)}
  />
)}

{showAlert && (
  <Alert
    type="error"
    message="An error occurred. Please try again."
    dismissible={false}
  />
)}
```

### Badge

Small inline element to display status or tags.

**Props:**
- `variant`: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: React.ReactNode
- `children`: React.ReactNode

**Examples:**

```tsx
import { CheckIcon } from '@heroicons/react/24/outline';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Inactive</Badge>
<Badge variant="info" size="lg" icon={<CheckIcon className="w-4 h-4" />}>
  Approved
</Badge>
```

### Card, CardHeader, CardBody, CardFooter

Flexible card layout component.

**Props:**
- `hoverable`: boolean (default: false)
- `children`: React.ReactNode
- `className`: string

**Examples:**

```tsx
<Card hoverable>
  <CardHeader>
    <h3 className="text-lg font-semibold">Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Table Components

Composable table structure.

**Components:**
- `Table` - Wrapper
- `TableHead` - Table header
- `TableBody` - Table body
- `TableRow` - Table row (supports `hoverable` prop)
- `TableHeaderCell` - Header cell (supports `sortable` prop)
- `TableCell` - Data cell

**Examples:**

```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableHeaderCell>Username</TableHeaderCell>
      <TableHeaderCell>Email</TableHeaderCell>
      <TableHeaderCell align="center">Status</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id} hoverable>
        <TableCell>{user.username}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell align="center">
          <Badge variant={user.active ? 'success' : 'danger'}>
            {user.active ? 'Active' : 'Inactive'}
          </Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Modal

Customizable modal dialog.

**Props:**
- `isOpen`: boolean
- `title`: string
- `onClose`: () => void
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `footer`: React.ReactNode
- `children`: React.ReactNode

**Examples:**

```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  title="Create User"
  onClose={() => setIsOpen(false)}
  footer={
    <div className="flex gap-3 justify-end">
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button>Create</Button>
    </div>
  }
>
  <Input label="Username" placeholder="Enter username" />
  <Input type="email" label="Email" placeholder="Enter email" className="mt-4" />
</Modal>
```

### ConfirmDialog

Pre-built confirmation dialog.

**Props:**
- `isOpen`: boolean
- `title`: string
- `message`: string
- `onConfirm`: () => void
- `onCancel`: () => void
- `confirmText`: string (default: 'Confirm')
- `cancelText`: string (default: 'Cancel')
- `isDangerous`: boolean (red button for destructive actions)
- `isLoading`: boolean

**Examples:**

```tsx
const [confirmOpen, setConfirmOpen] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  setIsDeleting(true);
  try {
    await api.delete(id);
    setConfirmOpen(false);
  } finally {
    setIsDeleting(false);
  }
};

<ConfirmDialog
  isOpen={confirmOpen}
  title="Delete User"
  message="Are you sure you want to delete this user? This action cannot be undone."
  isDangerous
  isLoading={isDeleting}
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleDelete}
  onCancel={() => setConfirmOpen(false)}
/>
```

### Loading

Loading spinner component.

**Props:**
- `message`: string
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `fullScreen`: boolean (default: false)

**Examples:**

```tsx
// Inline loading
{isLoading && <Loading message="Loading data..." />}

// Full screen overlay
{isLoading && <Loading fullScreen message="Please wait..." />}
```

### EmptyState

Empty state message with optional action.

**Props:**
- `icon`: React.ReactNode
- `title`: string
- `message`: string
- `action`: { label: string; onClick: () => void } (optional)

**Examples:**

```tsx
import { DocumentMinusIcon } from '@heroicons/react/24/outline';

{items.length === 0 && (
  <EmptyState
    icon={<DocumentMinusIcon className="w-12 h-12 text-gray-400" />}
    title="No items found"
    message="You haven't created any items yet. Start by creating a new one."
    action={{
      label: 'Create Item',
      onClick: () => setShowModal(true),
    }}
  />
)}
```

### Toast (with useToast hook)

Toast notifications system.

**Usage:**

```tsx
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components';

export const MyComponent: React.FC = () => {
  const { toasts, removeToast, success, error, warning, info } = useToast();

  const handleAction = async () => {
    try {
      await doSomething();
      success('Operation completed successfully!');
    } catch (err) {
      error('Operation failed. Please try again.');
    }
  };

  return (
    <>
      <Button onClick={handleAction}>Do Something</Button>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};
```

## Integration with Pages

### Before (with alerts):

```tsx
const handleDelete = () => {
  if (window.confirm('Are you sure?')) {
    deleteUser();
    alert('User deleted successfully!');
  }
};
```

### After (with modern components):

```tsx
const [confirmOpen, setConfirmOpen] = useState(false);
const { toasts, removeToast, success, error } = useToast();

const handleDelete = async () => {
  try {
    await usersApi.delete(userId);
    success('User deleted successfully!');
    setConfirmOpen(false);
  } catch (err) {
    error('Failed to delete user');
  }
};

return (
  <>
    <Button
      variant="danger"
      onClick={() => setConfirmOpen(true)}
    >
      Delete User
    </Button>

    <ConfirmDialog
      isOpen={confirmOpen}
      title="Delete User"
      message="Are you sure you want to delete this user?"
      isDangerous
      confirmText="Delete"
      onConfirm={handleDelete}
      onCancel={() => setConfirmOpen(false)}
    />

    <ToastContainer toasts={toasts} removeToast={removeToast} />
  </>
);
```

## Best Practices

1. **Always use Button component** - Never use HTML `<button>` directly
2. **Use Input/Select components** - Consistent validation and styling
3. **Replace alert() with Toast** - Better UX with notifications
4. **Replace confirm() with ConfirmDialog** - More user-friendly
5. **Use Badge for status** - Visual consistency for states
6. **Use Card for sections** - Better visual hierarchy
7. **Use Alert for error messages** - Instead of inline text
8. **Use EmptyState** - For zero-state screens
9. **Use Loading component** - For async operations
10. **Use Heroicons** - For consistent iconography (already imported in components)

## Icon Guidelines

Always use Heroicons from `@heroicons/react/24/outline`:

```tsx
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

<Button leftIcon={<PlusIcon className="w-5 h-5" />}>
  Add Item
</Button>

<Badge icon={<CheckIcon className="w-4 h-4" />}>
  Completed
</Badge>
```

## Color/Status Mapping

- **Primary (Blue)**: Default actions, primary CTAs
- **Success (Green)**: Completed, active, approved
- **Warning (Yellow)**: Pending, attention needed
- **Danger (Red)**: Delete, error, inactive
- **Info (Cyan)**: Information, notifications
- **Neutral (Gray)**: Disabled, secondary actions
