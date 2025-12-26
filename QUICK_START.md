# SCMS Quick Start Guide

## 🚀 What You'll See When Visiting localhost:3000

This guide explains what happens when you visit the application in different scenarios.

## 📋 Prerequisites

1. **Backend running** on `localhost:8000`
2. **Frontend running** on `localhost:3000`
3. **.env file configured** (see below)

## 🔧 Configuration Setup

Create a `.env` file:

```bash
cp .env.example .env
```

**For Multi-Tenant Mode (default):**
```bash
API_BASE_URL=http://localhost:8000/api
TENANT_MODE=multi
```

**For Single-Tenant Mode:**
```bash
API_BASE_URL=http://localhost:8000/api
TENANT_MODE=single
```

## 🎯 Scenarios & Expected Behavior

### Scenario 1: Multi-Tenant - New School (First Visit)

**URL**: `http://newschool.localhost:3000`

**What Happens:**
1. ✅ Middleware checks onboarding status
2. ✅ Backend responds: "No tenant found for this subdomain"
3. ✅ **Auto-redirect to `/onboarding`**

**What You See:**
```
┌──────────────────────────────────────┐
│       Welcome to SCMS                │
│ Let's set up your school             │
│                                      │
│  ① ──── ② ──── ③ ──── ④            │
│ School  Admin  Custom Complete      │
│  Info  Account                       │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ School Information           │   │
│ │                              │   │
│ │ School Name *                │   │
│ │ [___________________]        │   │
│ │                              │   │
│ │ Primary Color Secondary Color│   │
│ │ [🎨 Color] [🎨 Color]       │   │
│ │                              │   │
│ │     [ Continue ]             │   │
│ └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

### Scenario 2: Multi-Tenant - Existing School (Onboarding Incomplete)

**URL**: `http://school1.localhost:3000`

**What Happens:**
1. ✅ Middleware checks onboarding status
2. ✅ Backend responds: `{"needs_onboarding": true, "onboarding_completed": false}`
3. ✅ **Auto-redirect to `/onboarding`**

**What You See:**
- Same onboarding wizard as Scenario 1
- May be on Step 2 or 3 if partially completed

### Scenario 3: Multi-Tenant - Existing School (Onboarding Complete)

**URL**: `http://school1.localhost:3000`

**What Happens:**
1. ✅ Middleware checks onboarding status
2. ✅ Backend responds: `{"needs_onboarding": false, "onboarding_completed": true}`
3. ✅ **Proceed to login page**

**What You See:**
```
┌──────────────────────────────────────┐
│         School Logo                  │
│                                      │
│     Welcome Back!                    │
│                                      │
│ Email                                │
│ [____________________]               │
│                                      │
│ Password                             │
│ [____________________]               │
│                                      │
│     [ Sign In ]                      │
│                                      │
│ Forgot password?                     │
└──────────────────────────────────────┘
```

### Scenario 4: Single-Tenant - First Visit (No Tenant)

**URL**: `http://localhost:3000`

**What Happens:**
1. ✅ Middleware checks onboarding status
2. ✅ Backend responds: 404 (no tenant found)
3. ✅ Middleware detects `TENANT_MODE=single`
4. ✅ **Auto-redirect to `/onboarding`**

**What You See:**
- Onboarding wizard (same as multi-tenant)
- School will be created as the single tenant

### Scenario 5: Single-Tenant - Existing Setup

**URL**: `http://localhost:3000`

**What Happens:**
1. ✅ Middleware checks onboarding status
2. ✅ Backend responds: `{"needs_onboarding": false, "onboarding_completed": true}`
3. ✅ **Proceed to login page**

**What You See:**
- Login page (same as multi-tenant scenario 3)

## 🧪 Testing Checklist

### Multi-Tenant Mode Test

```bash
# 1. Set configuration
echo "TENANT_MODE=multi" > .env

# 2. Start backend
cd ../django-scms
python manage.py runserver

# 3. Start frontend (in new terminal)
cd /home/abu/Projects/scms
npm run dev

# 4. Test URLs
open http://newschool.localhost:3000    # Should redirect to onboarding
open http://school1.localhost:3000      # Depends on tenant status
open http://school2.localhost:3000      # Depends on tenant status
```

**Expected Results:**
- ✅ New subdomains → Onboarding wizard
- ✅ Existing incomplete tenants → Onboarding wizard
- ✅ Existing complete tenants → Login page

### Single-Tenant Mode Test

```bash
# 1. Set configuration
cat > .env << EOF
API_BASE_URL=http://localhost:8000/api
TENANT_MODE=single
EOF

# 2. Start servers (same as above)

# 3. Test main domain
open http://localhost:3000    # Should redirect to onboarding (first time)
```

**Expected Results:**
- ✅ First visit → Onboarding wizard
- ✅ After onboarding → Login page

## 🐛 Common Issues & Solutions

### Issue 1: Blank Page

**Symptoms:**
- White/blank screen
- No content loads

**Possible Causes:**
- Backend not running
- CORS not configured
- Wrong API URL

**Solutions:**
```bash
# Check backend is running
curl http://localhost:8000/api/tenants/onboarding/check/

# Check frontend console (F12)
# Look for CORS or network errors

# Verify .env file exists
cat .env
```

### Issue 2: Subdomain Not Working (Multi-Tenant)

**Symptoms:**
- `school1.localhost` doesn't resolve
- DNS errors

**Solution:**
```bash
# Add to /etc/hosts (Linux/Mac)
sudo nano /etc/hosts

# Add these lines:
127.0.0.1 newschool.localhost
127.0.0.1 school1.localhost
127.0.0.1 school2.localhost

# Or use .localhost which usually works by default
```

### Issue 3: Always Redirects to Onboarding

**Symptoms:**
- Can't reach login page
- Keeps going to onboarding

**Possible Causes:**
- Onboarding not completed in database
- Backend not returning correct status

**Solutions:**
```bash
# Check tenant status in Django
cd ../django-scms
python manage.py shell

# Run:
from tenants.models import Tenant
Tenant.objects.all()  # Check if tenant exists
tenant = Tenant.objects.first()
print(tenant.onboarding_completed)  # Should be True

# If False, complete it:
tenant.onboarding_completed = True
tenant.save()
```

### Issue 4: API Errors (403, 500)

**Symptoms:**
- Onboarding fails at any step
- 403 or 500 errors in console

**Solutions:**
```bash
# Check Django logs
# Check browser DevTools → Network tab

# Verify CORS settings in Django
# settings.py should have:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://*.localhost:3000",
]
```

## 📊 Network Requests You Should See

Open DevTools (F12) → Network tab:

### Initial Page Load
```
GET http://localhost:3000/                           200 OK
GET http://localhost:8000/api/tenants/onboarding/check/
    Response: {"needs_onboarding": true/false}
```

### During Onboarding (if needs_onboarding = true)
```
POST /api/tenants/onboarding/step1/create-tenant/    201 Created
POST /api/tenants/onboarding/step2/create-admin/     201 Created
PATCH /api/tenants/onboarding/step3/configure-settings/  200 OK
POST /api/tenants/onboarding/step4/complete/         200 OK
```

### After Onboarding Complete
```
GET /api/tenants/onboarding/check/
    Response: {"needs_onboarding": false, "onboarding_completed": true}
```

## ✅ Success Indicators

### Onboarding Working:
- ✅ See progress indicator (1-2-3-4 steps)
- ✅ Forms load correctly
- ✅ Can submit each step
- ✅ Redirect to login after completion

### Login Working:
- ✅ Login form appears
- ✅ Can enter credentials
- ✅ Redirect to dashboard after login

### Multi-Tenant Working:
- ✅ Different subdomains show different data
- ✅ Can create multiple schools
- ✅ Each school is isolated

### Single-Tenant Working:
- ✅ Main domain works without subdomain
- ✅ Only one school in system
- ✅ Simpler setup

## 🎓 Next Steps

After onboarding is complete:

1. **Login** with the admin account you created
2. **Explore** the admin dashboard
3. **Add** teachers, students, and parents
4. **Configure** academic years and terms
5. **Start** using the system!

## 📚 Documentation Links

- **Onboarding Implementation**: [ONBOARDING_IMPLEMENTATION_GUIDE.md](ONBOARDING_IMPLEMENTATION_GUIDE.md)
- **Deployment Modes**: [DEPLOYMENT_MODES.md](DEPLOYMENT_MODES.md)
- **Backend Guide**: `../django-scms/ONBOARDING_QUICK_START.md`

---

**Need help?** Check the troubleshooting section above or review the full documentation.
