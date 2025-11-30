# UI Components Cheatsheet

## Quick Reference

### Form Components

```tsx
// Button
<Button>Submit</Button>
<Button variant="danger">Delete</Button>
<Button isLoading={loading}>Loading...</Button>

// Input
<Input label="Name" placeholder="John" />
<Input error="This field is required" />

// Select
<Select
  options={[
    {value: 'admin', label: 'Admin'},
    {value: 'user', label: 'User'}
  ]}
/>
```

### Display Components

```tsx
// Badge
<Badge variant="success">Active</Badge>

// Alert
<Alert type="error" message="Something went wrong" />

// Card
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Dialogs & Modals

```tsx
// Modal
<Modal isOpen={true} title="Title" onClose={onClose}>
  Content
</Modal>

// Confirm Dialog
<ConfirmDialog
  isOpen={true}
  title="Confirm"
  message="Are you sure?"
  onConfirm={onConfirm}
  onCancel={onCancel}
/>

// Toast (hook-based)
const { success, error } = useToast();
success('Done!');
error('Failed');
```

### Table

```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableHeaderCell>Name</TableHeaderCell>
      <TableHeaderCell>Email</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>John</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Loading States

```tsx
<Loading />
<Loading fullScreen />
<EmptyState title="No data" message="Create one to get started" />
```

## Replacing Old Patterns

### Remove These

```tsx
// Alert
alert('Done!');

// Confirm
if (window.confirm('Sure?')) { ... }

// Inline errors
<p style={{color: 'red'}}>Error</p>

// Plain button
<button>Click</button>
```

### Use These Instead

```tsx
// Toast
const { success } = useToast();
success('Done!');

// ConfirmDialog
<ConfirmDialog isOpen={open} onConfirm={...} />

// Alert or Input error
<Alert type="error" />
<Input error="Error message" />

// Button component
<Button>Click</Button>
```

## All Component Props

| Component | Key Props | Example |
|-----------|-----------|---------|
| Button | variant, size, isLoading, disabled | `<Button variant="danger">` |
| Input | label, error, helperText, type | `<Input error="Required" />` |
| Select | options, label, error | `<Select options={opts} />` |
| Alert | type, title, message, dismissible | `<Alert type="error" />` |
| Badge | variant, size | `<Badge variant="success" />` |
| Card | hoverable, className | `<Card hoverable />` |
| Modal | isOpen, title, onClose, size | `<Modal isOpen={true} />` |
| ConfirmDialog | isOpen, isDangerous, isLoading | `<ConfirmDialog isDangerous />` |
| Table | - | Standard HTML structure |
| Loading | size, fullScreen, message | `<Loading fullScreen />` |
| EmptyState | icon, title, message, action | `<EmptyState title="..." />` |

## Icon Sizes

```tsx
// Small icons (buttons, badges)
<Icon className="w-4 h-4" />
<Icon className="w-5 h-5" />

// Medium icons (headers, cards)
<Icon className="w-6 h-6" />

// Large icons (empty states)
<Icon className="w-12 h-12" />
```

## Common Patterns

### Form with Validation

```tsx
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

<Input
  value={formData.name}
  onChange={(e) => setFormData({...formData, name: e.target.value})}
  error={errors.name}
/>
```

### Data Table with Actions

```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableHeaderCell>Name</TableHeaderCell>
      <TableHeaderCell align="center">Actions</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell align="center">
          <Button size="sm" variant="ghost">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Success/Error Handling

```tsx
const { success, error } = useToast();

try {
  await api.doSomething();
  success('Operation completed!');
} catch (err) {
  error('Operation failed!');
}
```

### Modal Form

```tsx
<Modal isOpen={open} title="Add Item" onClose={onClose}
  footer={
    <>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button onClick={handleSubmit}>Create</Button>
    </>
  }
>
  <Input label="Name" {...formProps} />
</Modal>
```
