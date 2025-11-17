# Loading System Documentation

The application uses a centralized loading state management system for consistent loading indicators across the entire application.

## Components

### 1. LoadingContext (`context/LoadingContext.jsx`)
Provides global loading state management with:
- Global loading overlay (full screen)
- Operation-specific loading states
- Automatic loading management for async operations

### 2. LoadingSpinner (`components/LoadingSpinner.jsx`)
Reusable spinner component with multiple sizes and configurations.

### 3. LoadingOverlay (`components/LoadingOverlay.jsx`)
Overlay component for specific sections or components.

### 4. LoadingButton (`components/LoadingButton.jsx`)
Button component with built-in loading state (already existed, enhanced).

## Usage Examples

### Basic Usage with useLoading Hook

```jsx
import { useLoading } from '../context/LoadingContext';

function MyComponent() {
  const { setLoading, isLoading, withLoading } = useLoading();

  const handleSubmit = async () => {
    // Option 1: Manual loading management
    setLoading(true, 'submit');
    try {
      await apiCall();
    } finally {
      setLoading(false, 'submit');
    }

    // Option 2: Automatic loading management
    await withLoading(async () => {
      await apiCall();
    }, 'submit');
  };

  return (
    <button onClick={handleSubmit} disabled={isLoading('submit')}>
      {isLoading('submit') ? 'Loading...' : 'Submit'}
    </button>
  );
}
```

### Using useAsyncOperation Hook

```jsx
import { useAsyncOperation } from '../hooks/useAsyncOperation';

function MyComponent() {
  const { execute, loading, error } = useAsyncOperation(
    async (data) => {
      return await apiService.create(data);
    },
    {
      operationId: 'create-item',
      showGlobalLoading: false, // Set to true for full screen overlay
      showToastOnError: true,
      showToastOnSuccess: true,
      successMessage: 'Item created successfully!',
    }
  );

  const handleCreate = async () => {
    try {
      const result = await execute(formData);
      // Handle success
    } catch (err) {
      // Error already handled by hook
    }
  };

  return (
    <LoadingButton onClick={handleCreate} loading={loading}>
      Create Item
    </LoadingButton>
  );
}
```

### Using LoadingSpinner Component

```jsx
import LoadingSpinner from '../components/LoadingSpinner';

// Small inline spinner
<LoadingSpinner size="sm" />

// Medium spinner with text
<LoadingSpinner size="md" text="Loading data..." />

// Full screen spinner
<LoadingSpinner fullScreen text="Please wait..." />
```

### Using LoadingOverlay Component

```jsx
import LoadingOverlay from '../components/LoadingOverlay';

function MyComponent() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative">
      <LoadingOverlay isLoading={loading} text="Loading data..." />
      {/* Your content here */}
    </div>
  );
}
```

### Global Loading Overlay

The global loading overlay is automatically shown when:
- `globalLoading` is true
- Any operation-specific loading state is active

```jsx
import { useLoading } from '../context/LoadingContext';

function MyComponent() {
  const { setLoading } = useLoading();

  const handleCriticalOperation = async () => {
    // This will show the global full-screen overlay
    setLoading(true, 'global');
    try {
      await criticalApiCall();
    } finally {
      setLoading(false, 'global');
    }
  };
}
```

## Best Practices

1. **Use operation IDs**: Always provide unique operation IDs for tracking multiple concurrent operations
2. **Use withLoading for automatic cleanup**: Prevents memory leaks and ensures loading state is always cleared
3. **Show global loading for critical operations**: Use global loading for operations that should block the entire UI
4. **Use local loading for non-blocking operations**: Use operation-specific loading for actions that don't need to block the UI
5. **Combine with toast notifications**: Use `useAsyncOperation` hook which automatically handles toast notifications

## Migration Guide

### Before (Old Pattern)
```jsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiCall();
  } finally {
    setLoading(false);
  }
};
```

### After (New Pattern)
```jsx
import { useAsyncOperation } from '../hooks/useAsyncOperation';

const { execute, loading } = useAsyncOperation(apiCall, {
  operationId: 'submit',
  showToastOnError: true,
});

const handleSubmit = () => execute();
```

## API Reference

### useLoading Hook

```typescript
interface LoadingContextValue {
  globalLoading: boolean;
  isLoading: (operationId?: string) => boolean;
  setLoading: (isLoading: boolean, operationId?: string) => void;
  withLoading: <T>(asyncFn: () => Promise<T>, operationId?: string) => Promise<T>;
  clearLoading: () => void;
}
```

### LoadingSpinner Props

```typescript
interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string | null;
  fullScreen?: boolean;
}
```

### LoadingOverlay Props

```typescript
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  className?: string;
  backdrop?: boolean;
}
```

