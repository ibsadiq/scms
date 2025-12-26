# Deployment Modes Documentation

The SCMS frontend supports two deployment modes to accommodate different use cases:

1. **Multi-Tenant Mode** - Multiple schools on subdomains
2. **Single-Tenant Mode** - One school on standalone deployment

## 📋 Table of Contents

- [Deployment Modes Overview](#deployment-modes-overview)
- [Multi-Tenant Mode](#multi-tenant-mode-default)
- [Single-Tenant Mode](#single-tenant-mode)
- [Configuration](#configuration)
- [URL Examples](#url-examples)
- [Testing Both Modes](#testing-both-modes)

## Deployment Modes Overview

### Multi-Tenant Mode (Default)
**Use Case**: SaaS platform hosting multiple schools

- Each school has its own subdomain
- Tenant detected from subdomain
- Examples: `school1.localhost`, `school2.localhost`
- Backend uses subdomain to identify tenant

### Single-Tenant Mode
**Use Case**: Self-hosted installation for one school

- School accessed on main domain
- No subdomain required
- Examples: `localhost`, `yourdomain.com`
- Backend configured for single tenant

## Multi-Tenant Mode (Default)

### How It Works

```
┌─────────────────────────────────────────────┐
│ User visits: school1.localhost:3000         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Middleware extracts subdomain: "school1"    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Backend API call to:                        │
│ http://school1.localhost:8000/api/          │
│ (tenant detected from Host header)          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Django backend identifies tenant            │
│ Returns tenant-specific data                │
└─────────────────────────────────────────────┘
```

### Configuration

**.env file:**
```bash
API_BASE_URL=http://localhost:8000/api
TENANT_MODE=multi
```

**nuxt.config.ts:**
```typescript
runtimeConfig: {
  public: {
    apiBase: 'http://localhost:8000/api',
    tenantMode: 'multi', // or process.env.TENANT_MODE
  }
}
```

### URL Structure

| School | Frontend URL | Backend API URL |
|--------|--------------|-----------------|
| School A | `school-a.localhost:3000` | `school-a.localhost:8000/api` |
| School B | `school-b.localhost:3000` | `school-b.localhost:8000/api` |
| School C | `school-c.localhost:3000` | `school-c.localhost:8000/api` |

### Onboarding Flow

1. **Visit**: `http://newschool.localhost:3000`
2. **Check**: Middleware calls `/api/tenants/onboarding/check/`
3. **Result**: No tenant found → Redirect to `/onboarding`
4. **Step 1**: Create tenant with subdomain "newschool"
5. **Complete**: School accessible at `newschool.localhost:3000`

### Backend Requirements

- Django Tenant Schema or similar multi-tenancy package
- Tenant detection via subdomain
- CORS configured for all subdomains:
  ```python
  CORS_ALLOWED_ORIGINS = [
      "http://localhost:3000",
      "http://*.localhost:3000",  # Wildcard for subdomains
  ]
  ```

## Single-Tenant Mode

### How It Works

```
┌─────────────────────────────────────────────┐
│ User visits: localhost:3000                 │
│ or yourdomain.com                           │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ No subdomain needed                         │
│ Single tenant assumed                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Backend API call to:                        │
│ http://localhost:8000/api/                  │
│ (single tenant configuration)               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Django backend returns single tenant data   │
└─────────────────────────────────────────────┘
```

### Configuration

**.env file:**
```bash
API_BASE_URL=http://localhost:8000/api
TENANT_MODE=single
```

**nuxt.config.ts:**
```typescript
runtimeConfig: {
  public: {
    apiBase: 'http://localhost:8000/api',
    tenantMode: 'single',
  }
}
```

### URL Structure

| Component | URL |
|-----------|-----|
| Frontend | `http://localhost:3000` or `https://yourdomain.com` |
| Backend API | `http://localhost:8000/api` or `https://api.yourdomain.com` |

### Onboarding Flow

1. **Visit**: `http://localhost:3000`
2. **Check**: Middleware calls `/api/tenants/onboarding/check/`
3. **Result**:
   - If no tenant: Redirect to `/onboarding`
   - If tenant exists but incomplete: Redirect to `/onboarding`
   - If tenant complete: Proceed to login
4. **Complete**: School accessible at `localhost:3000`

### Backend Requirements

- Single tenant Django setup
- Fixed tenant or default tenant configuration
- CORS configured for main domain:
  ```python
  CORS_ALLOWED_ORIGINS = [
      "http://localhost:3000",
      "https://yourdomain.com",
  ]
  ```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Copy from example
cp .env.example .env

# Edit values
nano .env
```

### Runtime Configuration

The `nuxt.config.ts` automatically picks up the environment variables:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8000/api',
      tenantMode: process.env.TENANT_MODE || 'multi',
    }
  }
})
```

## URL Examples

### Multi-Tenant Mode

#### Development
```
Frontend: http://school1.localhost:3000
Backend:  http://school1.localhost:8000/api

Frontend: http://school2.localhost:3000
Backend:  http://school2.localhost:8000/api
```

#### Production
```
Frontend: https://school1.yourplatform.com
Backend:  https://api.yourplatform.com (with tenant detection)

Frontend: https://school2.yourplatform.com
Backend:  https://api.yourplatform.com (with tenant detection)
```

### Single-Tenant Mode

#### Development
```
Frontend: http://localhost:3000
Backend:  http://localhost:8000/api
```

#### Production
```
Frontend: https://myschool.com
Backend:  https://myschool.com/api
```

## Testing Both Modes

### Test Multi-Tenant Mode

1. **Set environment:**
   ```bash
   # .env
   TENANT_MODE=multi
   ```

2. **Start servers:**
   ```bash
   # Backend
   cd django-scms
   python manage.py runserver

   # Frontend
   cd scms
   npm run dev
   ```

3. **Test:**
   ```bash
   # Visit different subdomains
   http://school1.localhost:3000
   http://school2.localhost:3000
   http://newschool.localhost:3000  # Should redirect to onboarding
   ```

### Test Single-Tenant Mode

1. **Set environment:**
   ```bash
   # .env
   TENANT_MODE=single
   API_BASE_URL=http://localhost:8000/api
   ```

2. **Configure backend for single tenant:**
   ```python
   # Django settings
   SINGLE_TENANT_MODE = True
   DEFAULT_TENANT_ID = 1
   ```

3. **Start servers:**
   ```bash
   # Backend
   cd django-scms
   python manage.py runserver

   # Frontend
   cd scms
   npm run dev
   ```

4. **Test:**
   ```bash
   # Visit main domain
   http://localhost:3000
   ```

## Middleware Behavior

### Multi-Tenant Mode
- Checks onboarding status for each subdomain
- Redirects to onboarding if tenant not found
- Allows multiple simultaneous tenants

### Single-Tenant Mode
- Checks onboarding status for single tenant
- If 404 error, assumes no tenant and redirects to onboarding
- Only one tenant in the system

## Production Deployment

### Multi-Tenant Setup

**DNS Configuration:**
```
*.yourplatform.com  →  Your server IP
```

**Nginx/Apache:**
```nginx
server {
    server_name *.yourplatform.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

**Environment:**
```bash
TENANT_MODE=multi
API_BASE_URL=https://api.yourplatform.com
```

### Single-Tenant Setup

**DNS Configuration:**
```
myschool.com  →  Your server IP
```

**Nginx/Apache:**
```nginx
server {
    server_name myschool.com;
    location / {
        proxy_pass http://localhost:3000;
    }
    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

**Environment:**
```bash
TENANT_MODE=single
API_BASE_URL=https://myschool.com/api
```

## Troubleshooting

### Multi-Tenant Issues

**Problem**: Subdomain not working locally
```bash
# Solution: Add to /etc/hosts
127.0.0.1 school1.localhost
127.0.0.1 school2.localhost
```

**Problem**: CORS errors
```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://*.localhost:3000",
]
```

### Single-Tenant Issues

**Problem**: Always redirects to onboarding
```bash
# Check if tenant exists in database
python manage.py shell
>>> from tenants.models import Tenant
>>> Tenant.objects.all()
```

**Problem**: API base URL wrong
```bash
# Verify .env configuration
cat .env
# Should show: TENANT_MODE=single
```

## Migration Between Modes

### From Multi to Single

1. Export one tenant's data
2. Set `TENANT_MODE=single`
3. Configure backend for single tenant
4. Import tenant data as default

### From Single to Multi

1. Set `TENANT_MODE=multi`
2. Configure subdomain routing
3. Migrate existing tenant to subdomain
4. Enable multi-tenant in Django

## Summary

| Feature | Multi-Tenant | Single-Tenant |
|---------|-------------|---------------|
| **URL Structure** | Subdomains | Main domain |
| **Use Case** | SaaS platform | Self-hosted |
| **Tenants** | Multiple | One |
| **Configuration** | `TENANT_MODE=multi` | `TENANT_MODE=single` |
| **Complexity** | Higher | Lower |
| **Scalability** | High | Limited |

---

**Choose the mode that best fits your deployment scenario!**

- 🏢 **Multi-Tenant**: Building a SaaS platform for multiple schools
- 🏫 **Single-Tenant**: Deploying for one specific school

Both modes support the full onboarding flow and all SCMS features.
