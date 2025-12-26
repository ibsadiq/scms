# Mobile-First Development Guidelines 📱

**Date**: 2025-11-17
**Status**: ✅ Active Standard

---

## 🎯 Philosophy

> **"Mobile-First"** means designing and coding for the smallest screen first, then progressively enhancing for larger screens.

---

## 📏 Core Principles

### 1. **Responsive Spacing**
Always use responsive spacing classes:

```vue
<!-- ❌ BAD: Fixed spacing -->
<div class="p-6 gap-6 space-y-6">

<!-- ✅ GOOD: Responsive spacing -->
<div class="p-4 sm:p-6 gap-3 sm:gap-6 space-y-4 sm:space-y-6">
```

### 2. **Responsive Grids**
Start with 1 column, scale up:

```vue
<!-- ❌ BAD: Desktop-first -->
<div class="grid grid-cols-3 gap-6">

<!-- ✅ GOOD: Mobile-first -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```

### 3. **Responsive Typography**
Scale text sizes for readability:

```vue
<!-- ❌ BAD: Fixed sizes -->
<h1 class="text-3xl">
<p class="text-base">

<!-- ✅ GOOD: Responsive sizes -->
<h1 class="text-2xl sm:text-3xl">
<p class="text-sm sm:text-base">
```

### 4. **Responsive Tables**
Tables must be scrollable on mobile:

```vue
<!-- ✅ GOOD: Scrollable wrapper -->
<div class="overflow-x-auto">
  <table class="min-w-full">
    <!-- Content -->
  </table>
</div>
```

### 5. **Touch Targets**
Minimum 44px × 44px for interactive elements:

```vue
<!-- ❌ BAD: Too small -->
<button class="p-1">

<!-- ✅ GOOD: Touch-friendly -->
<button class="p-2 min-h-[44px] min-w-[44px]">
```

---

## 🎨 Standard Responsive Patterns

### Spacing Scale
```
Mobile (< 640px):   p-3, gap-3, space-y-4
Tablet (640-1024):  p-4, gap-4, space-y-5
Desktop (> 1024px): p-6, gap-6, space-y-6
```

### Typography Scale
```
H1: text-2xl sm:text-3xl lg:text-4xl
H2: text-xl sm:text-2xl lg:text-3xl
H3: text-lg sm:text-xl
Body: text-sm sm:text-base
Small: text-xs sm:text-sm
```

### Grid Columns
```
Mobile:  grid-cols-1
Tablet:  sm:grid-cols-2 md:grid-cols-3
Desktop: lg:grid-cols-4 xl:grid-cols-5
```

---

## 📋 Component Checklist

### Every Component Must Have:

- [ ] **Responsive spacing** (p-*, m-*, gap-*, space-*)
- [ ] **Responsive typography** (text-*)
- [ ] **Responsive layout** (flex-col sm:flex-row, grid-cols-*)
- [ ] **Text truncation** where needed (truncate, line-clamp-*)
- [ ] **Overflow handling** (overflow-x-auto for tables)
- [ ] **Touch-friendly buttons** (min 44px)
- [ ] **Dark mode support** (dark:*)

---

## 🏗️ Page Structure Template

```vue
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold">Title</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
          Description
        </p>
      </div>
      <Button class="w-full sm:w-auto">Action</Button>
    </div>

    <!-- Content -->
    <Card>
      <CardContent class="p-4 sm:p-6">
        <!-- Mobile-first content -->
      </CardContent>
    </Card>
  </div>
</template>
```

---

## 📊 Table Pattern (Mobile-First)

```vue
<template>
  <!-- Mobile: Card List -->
  <div class="block sm:hidden space-y-3">
    <Card v-for="item in items" :key="item.id">
      <CardContent class="p-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold truncate">{{ item.name }}</h3>
            <Badge>{{ item.status }}</Badge>
          </div>
          <p class="text-sm text-neutral-600">{{ item.description }}</p>
          <div class="flex gap-2 pt-2">
            <Button size="sm" variant="outline">Edit</Button>
            <Button size="sm" variant="destructive">Delete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Desktop: Table -->
  <div class="hidden sm:block overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="item in items" :key="item.id">
          <TableCell>{{ item.name }}</TableCell>
          <TableCell><Badge>{{ item.status }}</Badge></TableCell>
          <TableCell>
            <div class="flex gap-2">
              <Button size="sm">Edit</Button>
              <Button size="sm" variant="destructive">Delete</Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
```

---

## 🎯 Form Pattern (Mobile-First)

```vue
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
    <!-- Single column on mobile, 2 columns on desktop -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div>
        <Label>First Name</Label>
        <Input v-model="form.firstName" class="mt-1.5" />
      </div>
      <div>
        <Label>Last Name</Label>
        <Input v-model="form.lastName" class="mt-1.5" />
      </div>
    </div>

    <!-- Full width field -->
    <div>
      <Label>Email</Label>
      <Input type="email" v-model="form.email" class="mt-1.5" />
    </div>

    <!-- Actions: Stack on mobile, inline on desktop -->
    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
      <Button type="button" variant="outline" class="w-full sm:w-auto">
        Cancel
      </Button>
      <Button type="submit" class="w-full sm:w-auto">
        Save
      </Button>
    </div>
  </form>
</template>
```

---

## 🎨 Card Pattern (Mobile-First)

```vue
<template>
  <Card>
    <CardHeader class="p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle class="text-lg sm:text-xl">Title</CardTitle>
          <CardDescription class="text-sm">Description</CardDescription>
        </div>
        <Button size="sm" class="w-full sm:w-auto">Action</Button>
      </div>
    </CardHeader>
    <CardContent class="p-4 sm:p-6">
      <!-- Content -->
    </CardContent>
  </Card>
</template>
```

---

## 🔧 Common Utility Classes

### Layout
```css
/* Stack on mobile, horizontal on desktop */
flex flex-col sm:flex-row

/* Hide on mobile, show on desktop */
hidden sm:block

/* Show on mobile, hide on desktop */
block sm:hidden

/* Full width on mobile, auto on desktop */
w-full sm:w-auto
```

### Spacing
```css
/* Responsive padding */
p-3 sm:p-4 md:p-6 lg:p-8

/* Responsive gaps */
gap-3 sm:gap-4 md:gap-6

/* Responsive spacing */
space-y-3 sm:space-y-4 md:space-y-6
```

### Text
```css
/* Responsive text size */
text-sm sm:text-base lg:text-lg

/* Truncate long text */
truncate

/* Line clamp */
line-clamp-2 sm:line-clamp-3
```

---

## ⚡ Performance Best Practices

### 1. **Use Minimal Breakpoints**
Only use `sm:`, `md:`, `lg:` - avoid `xl:` and `2xl:` unless necessary

### 2. **Optimize Images**
```vue
<!-- ✅ GOOD: Responsive images -->
<img
  src="/image.jpg"
  class="w-full h-auto"
  loading="lazy"
  width="800"
  height="600"
/>
```

### 3. **Lazy Load Off-Screen Content**
```vue
<div v-if="isVisible" class="...">
  <!-- Heavy content -->
</div>
```

### 4. **Minimize Re-renders**
```typescript
// Use computed for derived state
const filteredItems = computed(() =>
  items.value.filter(item => item.active)
)
```

---

## 🧪 Testing Checklist

### For Every Page:

#### Mobile (< 640px)
- [ ] Content fits without horizontal scroll
- [ ] Touch targets are at least 44px
- [ ] Text is readable (not too small)
- [ ] Buttons are full-width or appropriately sized
- [ ] Forms are usable with keyboard
- [ ] Tables show as cards or are scrollable

#### Tablet (640-1024px)
- [ ] Layout transitions smoothly
- [ ] Multi-column grids work well
- [ ] Navigation is accessible
- [ ] Touch targets remain adequate

#### Desktop (> 1024px)
- [ ] Layout uses available space efficiently
- [ ] No unnecessary white space
- [ ] Hover states work
- [ ] Keyboard navigation works

---

## 📱 Mobile-First Development Workflow

### 1. **Design Mobile First**
Start with mobile layout in mind

### 2. **Code Mobile First**
Write base styles for mobile, add `sm:` and up

### 3. **Test Mobile First**
Test on mobile viewport before desktop

### 4. **Review Mobile First**
Check mobile experience in code review

---

## 🎯 Quick Reference

### Most Common Patterns

**Responsive Container:**
```vue
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

**Responsive Grid:**
```vue
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```

**Responsive Flex:**
```vue
<div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
```

**Responsive Card:**
```vue
<Card>
  <CardContent class="p-4 sm:p-6">
```

**Responsive Button Group:**
```vue
<div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
  <Button class="w-full sm:w-auto">
```

---

## 📚 Resources

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Touch Target Sizes](https://web.dev/accessible-tap-targets/)
- [Mobile-First CSS](https://www.browserstack.com/guide/how-to-implement-mobile-first-design)

---

## ✅ Summary

### Golden Rules:
1. **Always start with mobile** (no prefix)
2. **Progressive enhancement** (sm:, md:, lg:)
3. **Touch-friendly** (44px minimum)
4. **Readable text** (responsive sizing)
5. **Scrollable tables** (overflow-x-auto)
6. **Stack first** (flex-col, then sm:flex-row)
7. **Test on mobile** (always)

---

**Standard**: Mobile-First Development
**Effective**: 2025-11-17
**Required**: All new pages and components
