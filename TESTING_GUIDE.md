# Shipment Portal - Testing Guide

This document outlines the testing strategy, test coverage, and manual testing procedures for the Shipment Portal application.

## Table of Contents
1. [Unit Tests](#unit-tests)
2. [Component Tests](#component-tests)
3. [Integration Tests](#integration-tests)
4. [Manual Testing](#manual-testing)
5. [Testing Checklist](#testing-checklist)

---

## Unit Tests

### Overview
Unit tests validate individual functions and utilities in isolation. All utility functions should have >80% code coverage.

### Test Files Location
- `src/utils/__tests__/` - Utility tests

### Tested Utilities

#### 1. dateFormat.ts (`src/utils/__tests__/dateFormat.test.ts`)
**Functionality:** Date formatting utilities for consistent DD-MM-YYYY display

**Test Coverage:**
- `formatDate()` - Converts dates to DD-MM-YYYY format
  - ✓ Handles string dates
  - ✓ Handles Date objects
  - ✓ Handles null/undefined
  - ✓ Handles invalid dates
  - ✓ Handles edge cases (month boundaries, year boundaries)

- `formatDateTime()` - Formats dates with time
  - ✓ Returns DD-MM-YYYY HH:MM:SS format
  - ✓ Handles null/undefined
  - ✓ Handles invalid dates

- `isValidDate()` - Validates date inputs
  - ✓ Returns true for valid dates
  - ✓ Returns false for invalid dates
  - ✓ Handles null/undefined/NaN

- `parseDateString()` - Parses DD-MM-YYYY format
  - ✓ Correctly parses DD-MM-YYYY strings
  - ✓ Returns null for invalid formats
  - ✓ Validates date ranges

**Running Tests:**
```bash
npm test -- dateFormat.test.ts
```

#### 2. dateHelpers.ts (`src/utils/__tests__/dateHelpers.test.ts`)
**Functionality:** Date range calculations and filtering utilities

**Test Coverage:**
- `getDateRange()` - Returns date ranges for common periods
  - ✓ 'today' returns current date as both start and end
  - ✓ 'week' returns Monday-Sunday range
  - ✓ 'month' returns first to last day of current month
  - ✓ 'year' returns January 1 to December 31

- `isValidDateRange()` - Validates date ranges
  - ✓ Returns true for valid ascending ranges
  - ✓ Returns true for same start/end dates
  - ✓ Returns false for descending ranges
  - ✓ Returns false for invalid dates

- `isDateInRange()` - Checks if date falls within range
  - ✓ Returns true for dates within range
  - ✓ Returns true for boundary dates
  - ✓ Returns false for dates outside range
  - ✓ Handles invalid dates

- `getDaysBetween()` - Calculates days between dates
  - ✓ Returns 0 for same date
  - ✓ Calculates correct number of days
  - ✓ Order-independent (absolute value)
  - ✓ Handles month/year boundaries
  - ✓ Returns 0 for invalid dates

**Running Tests:**
```bash
npm test -- dateHelpers.test.ts
```

#### 3. errorHandler.ts (`src/utils/__tests__/errorHandler.test.ts`)
**Functionality:** User-friendly error message mapping

**Test Coverage:**
- `getErrorMessage()` - Maps errors to user-friendly messages
  - ✓ Handles string error codes
  - ✓ Maps to ERROR_MESSAGES dictionary
  - ✓ Handles HTTP error responses (400, 401, 403, 404, 500)
  - ✓ Prioritizes response.data.error over message
  - ✓ Handles null/undefined gracefully
  - ✓ Returns generic message for unknown errors

**Running Tests:**
```bash
npm test -- errorHandler.test.ts
```

---

## Component Tests

### Overview
Component tests verify that React components render correctly and handle user interactions.

### Test Files Location
- `src/components/__tests__/` - Component tests

### Tested Components

#### 1. Skeleton.tsx (`src/components/__tests__/Skeleton.test.tsx`)
**Functionality:** Loading state skeleton components

**Test Coverage:**
- `<Skeleton />` - Basic skeleton loader
  - ✓ Renders without crashing
  - ✓ Has animate-pulse class
  - ✓ Applies custom width/height
  - ✓ Handles circle prop for circular skeletons
  - ✓ Renders multiple instances with count prop
  - ✓ Applies custom className

- `<SkeletonTable />` - Table skeleton
  - ✓ Renders correct number of rows
  - ✓ Renders correct number of columns
  - ✓ Uses sensible defaults
  - ✓ Applies custom styling

- `<SkeletonCard />` - Card skeleton
  - ✓ Has correct card styling
  - ✓ Renders multiple cards with count prop
  - ✓ Contains skeleton elements inside
  - ✓ Applies custom className

**Running Tests:**
```bash
npm test -- Skeleton.test.tsx
```

#### 2. ProgressModal.tsx (`src/components/__tests__/ProgressModal.test.tsx`)
**Functionality:** Modal showing export/operation progress

**Test Coverage:**
- `<ProgressModal />` - Progress indicator modal
  - ✓ Renders without crashing
  - ✓ Displays title
  - ✓ Displays optional message
  - ✓ Shows progress percentage
  - ✓ Handles progress values 0-100
  - ✓ Clamps progress values outside range
  - ✓ Renders loading spinner
  - ✓ Progress bar width corresponds to progress value
  - ✓ Accepts onClose callback

**Running Tests:**
```bash
npm test -- ProgressModal.test.tsx
```

---

## Integration Tests

### Overview
Integration tests verify that multiple components and services work together correctly.

### API Integration Points

#### 1. Shipments API (`shipmentsApi`)
**Endpoints Tested:**
- `GET /shipments` - List shipments with pagination
- `POST /shipments` - Create new shipment
- `GET /shipments/:id` - Get shipment details
- `PUT /shipments/:id` - Update shipment
- `DELETE /shipments/:id` - Delete shipment
- `POST /shipments/:id/approve` - Approve shipment
- `POST /shipments/:id/reject` - Reject shipment
- `POST /shipments/:id/request-changes` - Request changes
- `GET /shipments/statistics` - Get dashboard statistics

**Test Scenarios:**
1. User can list shipments with filters applied
2. User can create a new shipment with all required fields
3. User can update an existing shipment
4. User can delete a shipment (admin only)
5. Accounts manager can approve/reject shipments
6. Date range filtering returns correct results
7. Error responses are handled gracefully

#### 2. User Management API
**Endpoints Tested:**
- `GET /users` - List users
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (admin only)

**Test Scenarios:**
1. Admin can create users with different roles
2. Role-based access control prevents unauthorized actions
3. Users can only edit their own profile
4. Invalid data is rejected with appropriate error messages

#### 3. Authentication
**Endpoints Tested:**
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh token

**Test Scenarios:**
1. Valid credentials allow login
2. Invalid credentials reject login
3. User tokens expire and require refresh
4. Logout clears session data

---

## Manual Testing

### Pre-Testing Checklist
- [ ] All code has been committed and pushed
- [ ] Build compiles without errors (`npm run build`)
- [ ] No console errors or warnings
- [ ] Browser DevTools are open for testing

### Browser Compatibility Testing

#### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

#### Test Procedure
1. Start development server: `npm run dev`
2. Open each browser
3. Navigate to `http://localhost:5173`
4. Run through user flows (see below)
5. Check console for errors
6. Test responsive design (F12 → Device Toolbar)

### User Role Testing

#### Admin Testing (`admin@example.com`)
**Features to Test:**
- [ ] Access Admin Dashboard
- [ ] View all shipments
- [ ] View audit logs
- [ ] Manage users (create, edit, delete)
- [ ] Export dashboard statistics (Excel, PDF)
- [ ] Filter shipments by date range
- [ ] View detailed shipment information
- [ ] Cannot approve/reject (accounts manager only)

**Test Steps:**
1. Log in as admin
2. Navigate to Admin Dashboard
3. Verify stats card displays correctly
4. Test export functionality
   - Click Excel button, verify download
   - Click PDF button, verify download
   - Verify progress modal shows during export
5. Navigate to Shipments page
6. Test filters:
   - Filter by status
   - Filter by mode of transport
   - Search by shipment ID/name
   - Test date range picker
7. Navigate to Users page
8. Create a new user with role='clearance_agent'
9. Edit user details
10. Delete a user

#### Accounts Manager Testing (`accounts@example.com`)
**Features to Test:**
- [ ] Access Accounts Dashboard
- [ ] View pending approval shipments
- [ ] Approve shipments with valid documents
- [ ] Reject shipments with reason
- [ ] Request changes on shipments
- [ ] Export filtered shipments
- [ ] Cannot create/delete shipments
- [ ] Cannot access admin features

**Test Steps:**
1. Log in as accounts manager
2. Navigate to Accounts Dashboard
3. View shipment approval queue
4. Test approve workflow:
   - Select a "created" status shipment
   - Click "Approve" button
   - Verify status changes to "approved"
   - Verify notification email received (check console)
5. Test reject workflow:
   - Select a pending shipment
   - Click "Reject" button
   - Enter rejection reason
   - Verify status changes to "rejected"
6. Test request changes:
   - Select a pending shipment
   - Click "Request Changes"
   - Enter change request message
   - Verify status changes to "changes_requested"
7. Test export:
   - Go to Shipments list
   - Filter by status
   - Click export button
   - Verify progress modal appears
   - Verify file downloads

#### Clearance Agent Testing (`agent@example.com`)
**Features to Test:**
- [ ] Create new shipments
- [ ] Edit own shipments (when not approved)
- [ ] View own shipments
- [ ] Cannot edit approved shipments
- [ ] Cannot approve/reject shipments
- [ ] Cannot access other users' shipments
- [ ] Cannot delete shipments
- [ ] Export own shipments only

**Test Steps:**
1. Log in as clearance agent
2. Navigate to Shipments page
3. Test create workflow:
   - Click "Create Shipment"
   - Fill in all required fields
   - Upload documents (if required)
   - Click "Create"
   - Verify shipment appears in list with "created" status
4. Test edit workflow:
   - Click "Edit" on a created shipment
   - Modify fields
   - Click "Update"
   - Verify changes reflected
   - Verify cannot edit "approved" shipments
5. Test filters:
   - Test all status filters
   - Test mode filters
   - Test search
6. Test export:
   - Click export button
   - Verify only user's shipments are exported

### Loading States Testing

#### Progress Modal
- [ ] Modal appears when export starts
- [ ] Progress bar animates smoothly
- [ ] Percentage updates correctly (0-100%)
- [ ] Modal closes when export completes
- [ ] Buttons are disabled during export

#### Skeleton Loaders
- [ ] Table skeleton appears while loading data
- [ ] Card skeletons appear while loading stats
- [ ] Skeletons have pulsing animation
- [ ] Real content replaces skeleton when loaded

### Date Formatting Testing
- [ ] All dates display as DD-MM-YYYY format
- [ ] Date range picker shows correct format
- [ ] Exports use DD-MM-YYYY format
- [ ] Filter dates work correctly with DD-MM-YYYY

### Error Handling Testing
- [ ] Missing field errors are user-friendly
- [ ] Network errors don't crash app
- [ ] Invalid date errors show helpful message
- [ ] 401/403 errors redirect appropriately
- [ ] 500 errors show generic error message
- [ ] Toast notifications appear for errors

### Responsive Design Testing

#### Mobile (iPhone 12, 375px)
- [ ] Navigation menu is accessible
- [ ] Table scrolls horizontally
- [ ] Forms are single column
- [ ] Buttons are touch-friendly (44px+)
- [ ] Modal fits on screen
- [ ] Date picker is accessible

#### Tablet (iPad, 768px)
- [ ] Grid layouts adapt (2 columns)
- [ ] Table is readable
- [ ] Navigation is clear
- [ ] All features functional

#### Desktop (1920px)
- [ ] Full grid layouts work (6 columns)
- [ ] Spacing is appropriate
- [ ] Tables have good readability
- [ ] No horizontal scrolling

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Dashboard loads in < 2 seconds
- [ ] Filtering is responsive (< 1 second)
- [ ] Export starts immediately (< 500ms)
- [ ] No memory leaks (DevTools → Memory)
- [ ] No excessive re-renders (React DevTools → Profiler)

---

## Testing Checklist

### Pre-Release Testing

#### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] No TypeScript errors
- [ ] ESLint passes all checks
- [ ] Build size acceptable

#### Functionality
- [ ] All user roles tested
- [ ] All workflows completed
- [ ] All filters work correctly
- [ ] All exports generate valid files
- [ ] All date operations work
- [ ] All error messages appear

#### UX/Polish
- [ ] Loading states visible
- [ ] Progress modals work
- [ ] Button states (disabled/loading) work
- [ ] Date formatting consistent
- [ ] Error messages are clear
- [ ] Toast notifications appear

#### Cross-Browser
- [ ] Chrome (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Edge (Latest)

#### Responsive
- [ ] Mobile (375px - iPhone)
- [ ] Tablet (768px - iPad)
- [ ] Desktop (1920px)
- [ ] No horizontal scrolling
- [ ] Touch-friendly controls

#### Performance
- [ ] Page load < 3s
- [ ] Interactions responsive
- [ ] No memory leaks
- [ ] No unnecessary re-renders

### Known Issues
- None currently

### Future Testing Improvements
1. Add E2E tests with Cypress/Playwright
2. Add performance benchmarks
3. Add accessibility (a11y) tests
4. Add visual regression tests
5. Set up continuous integration (CI)
6. Add code coverage reporting
7. Add security scanning
