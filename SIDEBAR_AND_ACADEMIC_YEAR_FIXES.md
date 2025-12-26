# Sidebar State Persistence & Academic Year Dropdown Fixes

## Summary
Successfully implemented two key improvements to the admin interface:
1. **Sidebar state persistence** - Active sections remain open on page refresh
2. **Academic year dropdown** - Replaced manual ID input with user-friendly dropdown in admission session form

---

## 1. Sidebar State Persistence

### Problem
When navigating between pages or refreshing the browser, the active sidebar section would collapse, requiring users to manually expand it again.

### Solution
Implemented localStorage-based persistence with intelligent route-based auto-opening.

### Changes Made

**File Modified:** [app/components/admin/Sidebar.vue](app/components/admin/Sidebar.vue)

#### Features Added:

1. **localStorage Persistence**
   - Saves sidebar section state to `localStorage` with key `sidebar_open_sections`
   - Automatically restores saved state on page load
   - Updates localStorage whenever sections are toggled

2. **Route-Based Auto-Opening**
   - Detects current page URL and automatically opens the relevant section
   - Example: `/admin/admissions/sessions` automatically opens "Admissions" section
   - Works even if no saved state exists in localStorage

3. **Route Watching**
   - Watches for route changes during navigation
   - Automatically opens the appropriate section when navigating to a new page
   - Closes other sections for a clean UI

#### Route Mappings:
- **People**: `/admin/students`, `/admin/teachers`, `/admin/parents`
- **Academics**: `/admin/classrooms`, `/admin/subjects`, `/admin/timetable`, `/admin/assessments`
- **Financial**: `/admin/finance/*`
- **Administration**: `/admin/academic-years`, `/admin/terms`, `/admin/events`, `/admin/departments`, `/admin/grade-levels`, `/admin/class-levels`, `/admin/streams`
- **Admissions**: `/admin/admissions/*`
- **Reports**: `/admin/reports/*`

### How It Works:

```typescript
// 1. On page load - restore from localStorage or detect from route
const openSections = reactive<Record<SectionKey, boolean>>(getSavedOpenSections())

// 2. When toggling sections - save to localStorage
const toggleSection = (section: SectionKey) => {
  // Toggle logic...
  saveOpenSections()
}

// 3. Watch route changes - auto-open relevant section
watch(() => route.path, () => {
  const activeSection = getActiveSectionFromRoute()
  if (activeSection && !openSections[activeSection]) {
    openSections[activeSection] = true
    saveOpenSections()
  }
})
```

### User Experience:
- Open "Admissions" section and navigate to Applications page
- Refresh the browser
- "Admissions" section remains open automatically
- Navigate to Students page
- "People" section opens automatically, "Admissions" section closes

---

## 2. Academic Year Dropdown in Admission Sessions

### Problem
When creating admission sessions, users had to manually enter an **Academic Year ID** (a number), which required them to:
1. Navigate to Academic Years page
2. Find the ID of the desired year
3. Return to Admission Sessions page
4. Type the ID manually

This was confusing and error-prone.

### Solution
Replaced the numeric input field with a dropdown that:
- Automatically fetches all academic years from the API
- Displays user-friendly academic year names (e.g., "2024/2025")
- Allows selection from a list
- Handles the ID conversion behind the scenes

### Changes Made

**File Modified:** [app/pages/admin/admissions/sessions/index.vue](app/pages/admin/admissions/sessions/index.vue)

#### Implementation Details:

1. **Added Select Component Imports**
   ```typescript
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
   ```

2. **Added Academic Years Composable**
   ```typescript
   import { useAcademicYears } from '~~/composables/admin/useAcademicYears'
   const { fetchAcademicYears } = useAcademicYears()
   ```

3. **Added Academic Years State**
   ```typescript
   const academicYears = ref<AcademicYear[]>([])
   ```

4. **Added String/Number Conversion Computed Property**
   ```typescript
   const selectedAcademicYearString = computed({
     get: () => sessionForm.value.academic_year ? String(sessionForm.value.academic_year) : '',
     set: (value: string) => {
       sessionForm.value.academic_year = value ? parseInt(value, 10) : 0
     }
   })
   ```

   This handles the conversion between:
   - Select component (requires string values)
   - Backend API (requires numeric IDs)

5. **Added Load Function**
   ```typescript
   const loadAcademicYears = async () => {
     const { data } = await fetchAcademicYears()
     if (data) {
       academicYears.value = data
     }
   }
   ```

6. **Updated Form UI**

   **Before:**
   ```vue
   <Label for="academic_year">Academic Year ID *</Label>
   <Input
     id="academic_year"
     v-model.number="sessionForm.academic_year"
     type="number"
     placeholder="Academic year ID"
     required
   />
   <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
     Enter the ID of the academic year this session belongs to
   </p>
   ```

   **After:**
   ```vue
   <Label for="academic_year">Academic Year *</Label>
   <Select v-model="selectedAcademicYearString" required>
     <SelectTrigger class="w-full">
       <SelectValue placeholder="Select academic year" />
     </SelectTrigger>
     <SelectContent>
       <SelectItem
         v-for="year in academicYears"
         :key="year.id"
         :value="String(year.id)"
       >
         {{ year.name }}
       </SelectItem>
     </SelectContent>
   </Select>
   <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
     Select the academic year this admission session belongs to
   </p>
   ```

7. **Updated onMounted**
   ```typescript
   onMounted(() => {
     loadAcademicYears()  // ← Added
     loadSessions()
   })
   ```

### User Experience:

**Before:**
1. User clicks "Create Session"
2. Sees "Academic Year ID" field
3. Has to manually look up and type ID (e.g., "5")
4. Risk of typos or wrong ID

**After:**
1. User clicks "Create Session"
2. Sees "Academic Year" dropdown
3. Clicks dropdown to see all years (e.g., "2024/2025", "2025/2026")
4. Selects from list with one click
5. Form automatically uses the correct ID behind the scenes

---

## Testing

### Sidebar Persistence Test:
1. Navigate to `/admin/admissions/applications`
2. Verify "Admissions" section is open
3. Refresh the page (Ctrl+R or Cmd+R)
4. Verify "Admissions" section remains open
5. Navigate to `/admin/students`
6. Verify "People" section opens automatically

### Academic Year Dropdown Test:
1. Navigate to `/admin/admissions/sessions`
2. Click "Create Session" button
3. Verify "Academic Year" field shows a dropdown (not a number input)
4. Click the dropdown
5. Verify it displays all academic years by name
6. Select a year and create a session
7. Verify the session is created successfully

---

## Files Modified

1. **[app/components/admin/Sidebar.vue](app/components/admin/Sidebar.vue)**
   - Added localStorage persistence for sidebar state
   - Added route-based auto-opening logic
   - Added route watcher for navigation sync
   - Added `onMounted` hook for initial setup

2. **[app/pages/admin/admissions/sessions/index.vue](app/pages/admin/admissions/sessions/index.vue)**
   - Replaced numeric input with Select dropdown
   - Added academic years fetching logic
   - Added string/number conversion computed property
   - Added Select component imports
   - Updated form label and help text

---

## Technical Details

### Sidebar Implementation:
- **Storage**: `localStorage.getItem('sidebar_open_sections')`
- **Format**: JSON string of section states
- **Fallback**: Route-based detection if no saved state
- **Lifecycle**: Save on toggle, load on mount, watch routes

### Academic Year Dropdown:
- **API Endpoint**: `/administration/academic-years/`
- **Composable**: `useAcademicYears` from `composables/admin/useAcademicYears.ts`
- **Data Type**: `AcademicYear[]` with `id`, `name`, `start_date`, etc.
- **Conversion**: String (Select) ↔ Number (API) via computed property

---

## Benefits

### Sidebar Persistence:
- Improved user experience - no need to re-expand sections
- Faster navigation - relevant sections auto-open
- Remembers user preferences across sessions

### Academic Year Dropdown:
- Eliminates need to manually look up IDs
- Prevents errors from typing wrong IDs
- More intuitive and user-friendly
- Shows meaningful names instead of numbers
- Consistent with other form dropdowns in the app

---

## Notes

Both features work independently and don't interfere with existing functionality. The sidebar state is stored in the browser's localStorage, so it persists across browser sessions but is specific to each browser/device.

The academic year dropdown loads data on component mount, so there's minimal performance impact. If academic years are not available, the dropdown will be empty (though this is unlikely in a properly configured system).
