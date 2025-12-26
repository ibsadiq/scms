# School Settings System - Complete Implementation

## Overview
Successfully implemented a comprehensive settings management system that allows administrators to configure school information, branding, and academic settings from the admin panel.

## Features Implemented

### 1. Settings Page ✅
**Location**: [app/pages/admin/settings/index.vue](app/pages/admin/settings/index.vue)

**Tabs**:
- School Information
- Branding
- Academic Settings

#### School Information Tab
- **School Name** (required)
- **School Address**
- **City**
- **State**
- **Phone Number**
- **Email Address**
- **Website** (optional)

#### Branding Tab
- **School Logo Upload**:
  - Upload image (JPG, PNG, SVG)
  - Maximum size: 2MB
  - Preview before saving
  - Remove logo functionality
  - Default fallback icon if no logo

- **Primary Color Picker**:
  - Color input with live preview
  - Hex color code input
  - Preview showing how color appears on buttons and text
  - Automatically applied to UI when saved

#### Academic Settings Tab
- **Academic Year Start Month**: Dropdown (January - December)
- **Number of Terms**: 2, 3, or 4 terms per year

### 2. Backend API ✅

#### Django Model
**File**: [django-scms/core/models.py](../django-scms/core/models.py)

**SchoolSettings Model** (Singleton):
```python
class SchoolSettings(models.Model):
    # School Information
    school_name = models.CharField(max_length=200)
    school_address = models.CharField(max_length=300, blank=True)
    school_city = models.CharField(max_length=100, blank=True)
    school_state = models.CharField(max_length=100, blank=True)
    school_phone = models.CharField(max_length=20, blank=True)
    school_email = models.EmailField(blank=True)
    school_website = models.URLField(blank=True)

    # Branding
    school_logo = models.ImageField(upload_to='school/', blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#3B82F6')

    # Academic Settings
    academic_year_start_month = models.IntegerField(default=9)
    terms_per_year = models.IntegerField(default=3)
```

**Singleton Pattern**: Only one settings instance exists in the database.

#### API Endpoints
**Base URL**: `/api/settings/`

**Methods**:
- `GET /api/settings/` - Get current settings
- `PATCH /api/settings/1/` - Update settings
- `POST /api/settings/upload_logo/` - Upload school logo
- `POST /api/settings/remove_logo/` - Remove school logo

#### Serializer
**File**: [django-scms/core/serializers.py](../django-scms/core/serializers.py)

Returns:
```json
{
  "id": 1,
  "school_name": "School Name",
  "school_address": "123 Main St",
  "school_city": "Lagos",
  "school_state": "Lagos State",
  "school_phone": "+234 XXX XXX XXXX",
  "school_email": "info@school.com",
  "school_website": "https://www.school.com",
  "school_logo": "/media/school/logo.png",
  "school_logo_url": "http://localhost:8000/media/school/logo.png",
  "primary_color": "#3B82F6",
  "academic_year_start_month": 9,
  "terms_per_year": 3
}
```

### 3. Frontend Composable ✅
**File**: [composables/useSettings.ts](composables/useSettings.ts)

**Methods**:
- `fetchSettings(useCache)` - Fetch school settings (with caching)
- `updateSettings(data)` - Update settings
- `uploadLogo(file)` - Upload school logo
- `removeLogo()` - Remove school logo
- `clearCache()` - Clear settings cache
- `applyPrimaryColor(color)` - Apply primary color to UI

**Caching**:
- Settings are cached in localStorage for 30 minutes
- Automatic cache invalidation
- Reduces API calls for frequently accessed data

### 4. Receipt Integration ✅
**File**: [app/pages/admin/finance/receipts/[id].vue](app/pages/admin/finance/receipts/[id].vue)

**Updates**:
- Loads school settings on page mount
- Displays school logo (or fallback icon)
- Shows school name, address, city, state
- Shows phone and email
- Uses settings in PDF download

**Before**:
```vue
<h1>School Name</h1>
<p>School Address Line 1, City, State</p>
<p>Phone: +234 XXX XXX XXXX | Email: info@school.com</p>
```

**After**:
```vue
<img v-if="settings?.school_logo_url" :src="settings.school_logo_url" />
<h1>{{ settings?.school_name || 'School Name' }}</h1>
<p>{{ settings?.school_address }}{{ settings?.school_city ? `, ${settings.school_city}` : '' }}</p>
<p v-if="settings?.school_phone">Phone: {{ settings.school_phone }}</p>
```

## Database Migration

**Migration Created**: `core/migrations/0001_initial.py`

**Applied Successfully**: `python manage.py migrate core`

## Usage Guide

### Accessing Settings Page
1. Log in as admin
2. Navigate to: **Admin Panel → Settings**
3. Use tabs to switch between sections

### Updating School Information
1. Go to **School Information** tab
2. Fill in/update school details
3. Click **Save Settings**

### Uploading Logo
1. Go to **Branding** tab
2. Click **Upload Logo**
3. Select image file (JPG, PNG, or SVG)
4. Preview shows before saving
5. Click **Save Settings** to apply
6. Click **Remove** to delete logo

### Changing Primary Color
1. Go to **Branding** tab
2. Use color picker or enter hex code
3. See live preview
4. Click **Save Settings**
5. Color is applied throughout the system

### Configuring Academic Settings
1. Go to **Academic** tab
2. Select academic year start month
3. Select number of terms per year
4. Click **Save Settings**

## Technical Implementation

### Singleton Pattern
The SchoolSettings model uses a singleton pattern to ensure only one instance exists:

```python
def save(self, *args, **kwargs):
    if not self.pk and SchoolSettings.objects.exists():
        existing = SchoolSettings.objects.first()
        self.pk = existing.pk
    super().save(*args, **kwargs)

@classmethod
def get_settings(cls):
    settings, created = cls.objects.get_or_create(
        pk=1,
        defaults={...}
    )
    return settings
```

### Caching Strategy
Settings are cached in localStorage with 30-minute expiration:

```typescript
const CACHE_DURATION = 1000 * 60 * 30 // 30 minutes

const getCachedSettings = (): SchoolSettings | null => {
  const cached = localStorage.getItem(SETTINGS_CACHE_KEY)
  if (!cached) return null

  const { data, timestamp } = JSON.parse(cached)
  const isExpired = Date.now() - timestamp > CACHE_DURATION

  return isExpired ? null : data
}
```

### Color Application
Primary color is applied to CSS variables:

```typescript
const applyPrimaryColor = (color: string) => {
  const root = document.documentElement
  root.style.setProperty('--primary', color)
  root.style.setProperty('--primary-rgb', hexToRgb(color))
}
```

### File Upload Validation
Backend validates uploaded files:

```python
# Size validation (2MB)
if logo_file.size > 2 * 1024 * 1024:
    return Response({'error': 'Logo file must be less than 2MB'})

# Type validation
if not logo_file.content_type.startswith('image/'):
    return Response({'error': 'File must be an image'})
```

## File Structure

### Backend Files
```
django-scms/
├── core/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py          # SchoolSettings model
│   ├── serializers.py     # SchoolSettingsSerializer
│   ├── views.py           # SchoolSettingsViewSet
│   ├── urls.py            # API routes
│   └── migrations/
│       └── 0001_initial.py
```

### Frontend Files
```
scms/
├── app/
│   └── pages/
│       └── admin/
│           └── settings/
│               └── index.vue    # Settings page
├── composables/
│   └── useSettings.ts          # Settings composable
```

## API Examples

### Get Settings
```bash
curl -X GET http://localhost:8000/api/settings/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Settings
```bash
curl -X PATCH http://localhost:8000/api/settings/1/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "school_name": "My School",
    "primary_color": "#10B981"
  }'
```

### Upload Logo
```bash
curl -X POST http://localhost:8000/api/settings/upload_logo/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "logo=@/path/to/logo.png"
```

## Benefits

1. **Centralized Configuration**: All school settings in one place
2. **Easy Updates**: Admins can update settings without developer intervention
3. **Consistent Branding**: Logo and colors applied across the system
4. **Caching**: Improved performance with localStorage caching
5. **Validation**: Server-side and client-side validation
6. **User-Friendly**: Intuitive interface with live previews
7. **Flexible**: Easy to extend with new settings

## Future Enhancements (Optional)

1. **Multi-School Support**: Support for multiple school instances
2. **Email Templates**: Customizable email templates
3. **SMS Settings**: Configure SMS provider credentials
4. **Payment Gateway**: Configure payment gateway settings
5. **Certificate Templates**: Customizable certificate designs
6. **Report Headers**: Custom headers for printed reports
7. **Language Settings**: Multi-language support configuration
8. **Timezone Settings**: Configure school timezone
9. **Session Settings**: Configure academic session parameters
10. **Notification Settings**: Configure notification preferences

## Testing

### Backend Testing
```bash
cd /home/abu/Projects/django-scms
.venv/bin/python manage.py runserver
```

Test endpoints at: `http://localhost:8000/api/settings/`

### Frontend Testing
```bash
cd /home/abu/Projects/scms
pnpm dev
```

Access settings at: `http://localhost:3000/admin/settings`

## Summary

The settings system is now **fully functional** with:

✅ Complete settings page with 3 tabs
✅ School information management
✅ Logo upload and management
✅ Primary color picker with live preview
✅ Academic settings configuration
✅ Backend API with singleton pattern
✅ Frontend composable with caching
✅ Receipt page integration
✅ Form validation
✅ Loading and error states
✅ Toast notifications
✅ Responsive design
✅ Dark mode support

The system provides a professional, user-friendly way for administrators to manage all school-wide settings without needing technical knowledge or code changes.
