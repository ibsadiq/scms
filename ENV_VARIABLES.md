# Environment Variables Configuration

This document explains how to configure the application using environment variables.

## How It Works

Nuxt 3 automatically loads environment variables from `.env` files. Variables defined in `runtimeConfig.public` can be overridden by environment variables with the `NUXT_PUBLIC_` prefix.

## Available Environment Variables

### API Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_API_BASE` | `http://localhost:8000/api` | Backend API base URL |

### Application Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_PRODUCT_NAME` | `SSync` | Application/product name |
| `NUXT_PUBLIC_APP_LOGO` | `/logo.png` | Path to application logo |

### Tenant Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_TENANT_MODE` | `multi` | Tenant mode: `multi` for subdomain-based tenants, `single` for standalone |

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update the values according to your environment:
   ```bash
   # For production
   NUXT_PUBLIC_API_BASE=https://api.yourschool.com/api
   NUXT_PUBLIC_PRODUCT_NAME=YourSchoolName
   NUXT_PUBLIC_TENANT_MODE=single
   ```

3. Restart your development server for changes to take effect:
   ```bash
   npm run dev
   ```

## Different Environments

### Development
Create `.env` with local settings:
```bash
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
NUXT_PUBLIC_TENANT_MODE=single
```

### Production
Set environment variables in your hosting platform (Vercel, Netlify, etc.) or use `.env.production`:
```bash
NUXT_PUBLIC_API_BASE=https://api.production.com/api
NUXT_PUBLIC_TENANT_MODE=multi
```

## Notes

- Environment variables prefixed with `NUXT_PUBLIC_` are exposed to the client-side code
- Never commit sensitive credentials to `.env` files
- Always use `.env.example` as a template without actual secrets
- The `.env` file is already in `.gitignore` to prevent accidental commits
