# App Logo Usage Examples

## Overview
The app logo system allows you to display a customizable application/product logo throughout your application. This is separate from the school logo and represents the product brand (e.g., ScholAfric).

## Implementation Summary

### Files Modified
1. `app/app.html` - Preloads app logo URL (already done)
2. `app/plugins/init-app.client.ts` - Initializes app logo state
3. `composables/useBrand.ts` - Exposes `appLogo()` helper
4. `composables/useSettings.ts` - Applies app logo from settings

### Configuration
The default app logo is configured in `nuxt.config.ts`:
```typescript
runtimeConfig: {
  public: {
    appLogo: '/logo.png'  // Default app logo path
  }
}
```

## Usage Examples

### Basic Usage in Components

```vue
<script setup lang="ts">
const { appLogo } = useBrand()
</script>

<template>
  <!-- Simple image display -->
  <img :src="appLogo()" alt="App Logo" class="h-8" />
</template>
```

### Footer Component Example

```vue
<script setup lang="ts">
const { appLogo, product } = useBrand()
</script>

<template>
  <footer class="bg-neutral-100 dark:bg-neutral-900 py-6">
    <div class="container mx-auto px-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img :src="appLogo()" :alt="product()" class="h-8 w-auto" />
        <span class="text-sm text-neutral-600 dark:text-neutral-400">
          © {{ new Date().getFullYear() }} {{ product() }}
        </span>
      </div>
    </div>
  </footer>
</template>
```

### Email Template Example

```vue
<template>
  <div class="email-template">
    <table width="100%">
      <tr>
        <td align="center" style="padding: 20px;">
          <img
            :src="appLogo()"
            alt="Logo"
            style="height: 60px; width: auto;"
          />
        </td>
      </tr>
      <tr>
        <td>
          <!-- Email content here -->
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
const { appLogo } = useBrand()
</script>
```

### Login/Auth Pages Example

```vue
<script setup lang="ts">
const { appLogo, product, school } = useBrand()
</script>

<template>
  <div class="login-page">
    <!-- App Logo at the top -->
    <div class="text-center mb-6">
      <img
        :src="appLogo()"
        :alt="product()"
        class="h-16 w-auto mx-auto mb-4"
      />
      <h1 class="text-2xl font-bold">{{ product() }}</h1>
      <p class="text-neutral-600">{{ school() }}</p>
    </div>

    <!-- Login form -->
  </div>
</template>
```

### Meta Tags for SEO/Social Sharing

```vue
<script setup lang="ts">
const { appLogo, product } = useBrand()

useHead({
  meta: [
    { property: 'og:image', content: appLogo() },
    { property: 'twitter:image', content: appLogo() },
    { property: 'og:image:alt', content: `${product()} Logo` }
  ]
})
</script>
```

### Dynamic Favicon

```vue
<script setup lang="ts">
const { appLogo } = useBrand()

useHead({
  link: [
    { rel: 'icon', type: 'image/png', href: appLogo() }
  ]
})
</script>
```

### Navigation Bar Example

```vue
<script setup lang="ts">
const { appLogo, preferSchool } = useBrand()
</script>

<template>
  <nav class="bg-white dark:bg-neutral-900 border-b">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">
      <!-- App Logo -->
      <NuxtLink to="/" class="flex items-center gap-3">
        <img :src="appLogo()" alt="Logo" class="h-10 w-auto" />
        <span class="font-semibold text-lg">{{ preferSchool() }}</span>
      </NuxtLink>

      <!-- Navigation items -->
    </div>
  </nav>
</template>
```

## API Integration

### Backend Response Format
Your settings API endpoint should return app logo information:

```json
{
  "school_name": "Example School",
  "school_logo_url": "https://example.com/school-logo.png",
  "app_logo_url": "https://example.com/app-logo.png",
  "product_logo": "https://example.com/fallback-logo.png",
  "primary_color": "#3B82F6",
  "secondary_color": "#10B981"
}
```

### Priority Order
The system uses the following priority order for the app logo:
1. `app_logo_url` from API settings
2. `product_logo` from API settings
3. `config.public.appLogo` from nuxt.config.ts
4. Hardcoded fallback: `/logo.png`

## File Setup

### Default Logo File
Place your default app logo at:
```
/public/logo.png
```

This file will be used when:
- No settings are available
- API doesn't provide `app_logo_url` or `product_logo`
- User is not authenticated and public settings aren't available

### Recommended Logo Specifications
- Format: PNG with transparency (or SVG)
- Dimensions: 200x200px minimum (square ratio recommended)
- File size: Under 50KB for optimal loading
- Background: Transparent to work with light/dark themes

## Difference Between Logos

### School Logo
- **Purpose**: Represents the specific school/institution
- **Usage**: Sidebars, school-specific branding
- **State**: `school_logo_url`
- **Helper**: `useBrand().preferSchool()` for name

### App Logo
- **Purpose**: Represents the product/application (ScholAfric)
- **Usage**: Footers, login pages, emails, meta tags, public pages
- **State**: `app_logo_url`
- **Helper**: `useBrand().appLogo()` for URL

## Advanced Usage

### Conditional Logo Display

```vue
<script setup lang="ts">
const { appLogo } = useBrand()
const { data: settings } = await useFetch('/api/settings/')

// Check if custom logo is available
const hasCustomLogo = computed(() => {
  return settings.value?.app_logo_url || settings.value?.product_logo
})
</script>

<template>
  <div>
    <img
      v-if="hasCustomLogo"
      :src="appLogo()"
      alt="Custom Logo"
      class="h-12"
    />
    <div v-else class="h-12 flex items-center">
      <Icon name="lucide:graduation-cap" size="32" />
    </div>
  </div>
</template>
```

### Responsive Logo Sizing

```vue
<script setup lang="ts">
const { appLogo } = useBrand()
</script>

<template>
  <img
    :src="appLogo()"
    alt="App Logo"
    class="h-8 sm:h-10 md:h-12 lg:h-14 w-auto"
  />
</template>
```

## Testing

### Test with Browser Console
You can test the app logo system in the browser console:

```javascript
// Check if app logo is loaded
console.log(window.__APP_LOGO_URL__)

// Check Vue state (in component context)
const { appLogo } = useBrand()
console.log(appLogo())
```

### Test Flow
1. **Initial Load**: App logo preloaded from `app.html` script
2. **State Init**: `init-app.client.ts` sets up Vue state
3. **Settings Fetch**: API settings override with latest values
4. **Component Render**: Components use `appLogo()` helper

## Troubleshooting

### Logo Not Showing
1. Check `/public/logo.png` exists
2. Verify `nuxt.config.ts` has correct `appLogo` path
3. Check browser console for `[PRELOAD] Stored app logo URL` message
4. Verify API returns `app_logo_url` or `product_logo`

### Logo Not Updating
1. Clear localStorage cache: `localStorage.removeItem('school_settings')`
2. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
3. Check settings API response includes updated logo URL

### TypeScript Errors
If you get TypeScript errors, ensure you're using the helper correctly:
```typescript
// Correct
const { appLogo } = useBrand()
const logoUrl = appLogo() // Call the function

// Incorrect
const logoUrl = appLogo // Missing function call
```

## Summary

The app logo system provides a flexible, reactive way to display your application's branding throughout the entire app. It automatically handles:
- Preloading for zero-flicker display
- Caching for performance
- Fallbacks for reliability
- API synchronization for dynamic updates

Use `useBrand().appLogo()` anywhere you need to display the product/application logo!
