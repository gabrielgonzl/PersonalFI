# 🔗 Integration & Optimization Guide

Complete documentation of the frontend-backend integration and optimization strategies implemented in Growing.

## 📡 API Integration

### Axios Client Configuration

Located in `frontend/src/config/api.js`

**Features:**
- Base URL configuration from environment variables
- Request/Response interceptors
- Automatic retry logic for failed requests
- Error standardization and handling
- Request ID tracking for debugging
- Performance monitoring (request duration)
- CORS credentials support

**Retry Strategy:**
- Network errors: 2 automatic retries with exponential backoff
- Rate limit (429): Respects `Retry-After` header
- Authentication (401): Token refresh preparation (future)

**Error Handling:**
```javascript
{
  message: "Human-readable error message",
  code: "ERROR_CODE",
  statusCode: 400,
  details: [],
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

### CORS Configuration

**Backend** (`backend/src/app.js`):
```javascript
{
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
}
```

**Frontend** (`frontend/src/config/api.js`):
```javascript
{
  withCredentials: true
}
```

### API Services

All API calls are organized by feature:

- `assetService.js` - Asset management
- `portfolioService.js` - Portfolio operations
- `contributionService.js` - Transaction handling
- `analyticsService.js` - Analytics data
- `settingsService.js` - User preferences

## ⚡ Performance Optimizations

### 1. React Query Configuration

Located in `frontend/src/config/queryClient.js`

**Cache Strategy:**
- **Stale Time**: 5 minutes - Data considered fresh
- **Cache Time**: 10 minutes - Data kept in cache
- **Refetch on Window Focus**: Enabled
- **Refetch on Reconnect**: Enabled
- **Retry**: 2 attempts with exponential backoff

**Query Keys Organization:**
```javascript
QUERY_KEYS = {
  ASSETS: ['assets'],
  ASSET_DETAIL: (id) => ['assets', id],
  PORTFOLIOS: ['portfolios'],
  PORTFOLIO_DETAIL: (id) => ['portfolios', id],
  // ... etc
}
```

**Helper Functions:**
- `prefetchQuery()` - Prefetch data before needed
- `invalidateQueries()` - Refresh specific queries
- `invalidateAssets()` - Refresh all asset queries
- `invalidateAll()` - Global refresh

### 2. Lazy Loading

Located in `frontend/src/App.jsx`

**Implementation:**
```javascript
const Dashboard = lazy(() =>
  import('./pages/Dashboard/Dashboard')
    .then(module => ({ default: module.Dashboard }))
);
```

**Benefits:**
- Smaller initial bundle size
- Faster initial page load
- Code splitting by route
- On-demand component loading

**Fallback:**
```jsx
<Suspense fallback={<LoadingSpinner fullScreen />}>
  <Routes>...</Routes>
</Suspense>
```

### 3. Error Boundary

Located in `frontend/src/components/common/ErrorBoundary.jsx`

**Features:**
- Catches React component errors
- Prevents full app crash
- Shows user-friendly error message
- Detailed error info in development
- Recovery options (retry, go home)

### 4. Memoization

**Use Cases:**
- Expensive calculations in components
- Complex filtering/sorting operations
- Chart data transformations

**Implementation:**
```javascript
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

## 🎯 Custom Hooks

### useDebounce

**Purpose:** Delay value updates for search/filter operations

**Location:** `frontend/src/hooks/useDebounce.js`

**Usage:**
```javascript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  // API call with debouncedSearch
}, [debouncedSearch]);
```

**Benefits:**
- Reduces API calls
- Better user experience
- Performance improvement

### useLocalStorage

**Purpose:** Persist state to localStorage with sync

**Location:** `frontend/src/hooks/useLocalStorage.js`

**Usage:**
```javascript
const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
```

**Features:**
- Automatic JSON serialization
- Cross-tab synchronization
- Error handling
- Initial value support

### useAutoSave

**Purpose:** Automatically save form data after inactivity

**Location:** `frontend/src/hooks/useAutoSave.js`

**Usage:**
```javascript
const { isSaving, lastSaved, error } = useAutoSave(
  formData,
  async (data) => await updateSettings(data),
  { delay: 2000 }
);
```

**Features:**
- Debounced save operations
- Manual save trigger
- Loading and error states
- Last saved timestamp

### useTheme

**Purpose:** Manage theme state with persistence

**Location:** `frontend/src/hooks/useTheme.js`

**Usage:**
```javascript
const { theme, setTheme, toggleTheme, isDark } = useTheme();
```

**Features:**
- Light/Dark/Auto modes
- System preference detection
- localStorage persistence
- DOM class manipulation

### useExportCSV

**Purpose:** Export data to CSV files

**Location:** `frontend/src/hooks/useExportCSV.js`

**Usage:**
```javascript
const exportToCSV = useExportCSV();

exportToCSV({
  data: portfolios,
  filename: 'portfolios',
  headers: ['Name', 'Balance', 'Total Assets'],
  fields: ['name', 'balance', 'totalAssets']
});
```

**Features:**
- Automatic CSV formatting
- Escape special characters
- Timestamp in filename
- Download trigger

## 🎨 Theme System

### ThemeProvider

**Location:** `frontend/src/context/ThemeContext.jsx`

**Features:**
- Context-based theme management
- Automatic DOM updates
- Meta theme-color updates
- System preference listening

**Theme Options:**
- `light` - Light mode
- `dark` - Dark mode
- `auto` - Follows system preference

**Implementation:**
```javascript
// In App.jsx
<ThemeProvider>
  <App />
</ThemeProvider>

// In components
const { theme, isDark, toggleTheme } = useThemeContext();
```

**CSS Classes:**
- Root element gets `light` or `dark` class
- Use Tailwind's `dark:` variant

## 📤 CSV Export Feature

**Implementation:**
```javascript
// In any component
import { useExportCSV } from '@/hooks';

const exportToCSV = useExportCSV();

const handleExport = () => {
  exportToCSV({
    data: portfolios,
    filename: 'my-portfolios',
    headers: ['Portfolio Name', 'Total Value', 'Return %'],
    fields: ['name', 'totalValue', 'returnPercentage']
  });
};
```

**Features:**
- Nested field support (`user.name`)
- Array handling (`[1,2,3]` → `"1; 2; 3"`)
- Special character escaping
- Timestamp in filename

## 🔄 Auto-Save Implementation

**Best Practices:**
```javascript
const [formData, setFormData] = useState(initialData);

const { isSaving, lastSaved, error } = useAutoSave(
  formData,
  async (data) => await updateData(data),
  {
    delay: 2000,  // 2 second delay
    enabled: isDirty  // Only when form is modified
  }
);

// Show status to user
{isSaving && <span>Saving...</span>}
{lastSaved && <span>Saved at {format(lastSaved, 'HH:mm:ss')}</span>}
{error && <span>Error: {error}</span>}
```

## 🧪 Testing Strategy

### Frontend Tests

**Tools:**
- Vitest - Test runner
- React Testing Library - Component testing
- @testing-library/jest-dom - DOM matchers

**Test Types:**

1. **Hook Tests** (`__tests__/`)
   - useDebounce
   - useLocalStorage
   - useAutoSave

2. **Utility Tests** (`utils/__tests__/`)
   - Financial calculations
   - Formatters
   - Validators

3. **Component Tests** (Future)
   - User interactions
   - Rendering
   - Integration

**Running Tests:**
```bash
npm test              # Run all tests
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

### Backend Tests

**Tools:**
- Jest
- Supertest
- MongoDB Memory Server

**Test Coverage:**
- API endpoints
- Business logic
- Database operations
- Error handling

## 📊 Performance Monitoring

### Development Tools

**React Query Devtools:**
```javascript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
```

**Console Logging:**
- Request/Response logging (development only)
- Query error logging
- Mutation error logging
- Performance metrics (request duration)

### Production Monitoring

**Recommendations:**
- Error tracking: Sentry, LogRocket
- Analytics: Google Analytics, Mixpanel
- Performance: Web Vitals, Lighthouse
- API monitoring: Datadog, New Relic

## 🚀 Deployment Checklist

### Frontend

- [ ] Environment variables configured
- [ ] Build optimized (`npm run build`)
- [ ] Assets compressed
- [ ] Source maps available
- [ ] Error tracking enabled
- [ ] Analytics configured

### Backend

- [ ] Environment variables set
- [ ] Database connection secure
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error handling tested
- [ ] Health check endpoint working

### Integration

- [ ] API URLs correct
- [ ] CORS working cross-domain
- [ ] Authentication ready (if applicable)
- [ ] SSL/TLS certificates installed
- [ ] CDN configured (if applicable)

## 🔍 Debugging Tips

### API Issues

**Check Network Tab:**
1. Request URL correct?
2. Request headers sent?
3. Response status code?
4. Response body structure?

**Check Console:**
1. Request/Response logs (dev mode)
2. Error messages
3. Network errors

### Query Issues

**React Query Devtools:**
1. Query key correct?
2. Query status (loading/error/success)?
3. Cache data present?
4. Refetch behavior correct?

### Theme Issues

**Check:**
1. localStorage value
2. Root element class (`light`/`dark`)
3. CSS variables defined
4. Tailwind `dark:` variants

## 📚 Additional Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)

---

**Questions or Issues?** Check the main README or create an issue on GitHub.
