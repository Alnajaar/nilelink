# NileLink v1.0.0 Production Deployment - Quick Start Guide

## Current Status

✅ **Infrastructure Ready:**
- Production Dockerfile created (multi-stage build)
- Production docker-compose.yml created (backend services only)
- Environment template created (`.env.production.example`)
- Deployment scripts created
- Cloudflare Pages guide prepared

🔄 **In Progress:**
- Docker production image build (currently in progress ~8 minutes)

---

## Quick Commands

### 1. Start Production Backend (Manual)

```powershell
# Navigate to project
cd "c:\Users\nilel\Projects\Sduan\New folder\nilelink"

# Ensure .env.production exists
if (!(Test-Path .env.production)) {
    Copy-Item .env.production.example .env.production
    Write-Host "⚠ Edit .env.production with your secrets!"
}

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Watch logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Run Database Migrations

```powershell
docker exec nilelink-api-v1 npx prisma migrate deploy
```

### 3. Verify Health

```powershell
# Check all containers
docker ps

# Test API health
curl http://localhost:4000/api/system/health

# Or use PowerShell
Invoke-WebRequest -Uri "http://localhost:4000/api/system/health"
```

---

## Cloudflare Pages Deployment

Each frontend app needs to be deployed as a separate Cloudflare Pages project.

### Prerequisites
1. Cloudflare account
2. Domain `nilelink.app` added to Cloudflare
3. Git repository connected

### Deploy Customer App (Example)

1. Go to Cloudflare Dashboard → Pages → Create a project
2. Configure:
   - **Project name**: `nilelink-customer`
   - **Build command**: `cd web/customer && npm install && npm run build`
   - **Build output**: `web/customer/out`
   - **Environment variables**:
     ```
     NODE_VERSION=18
     NEXT_PUBLIC_API_URL=https://api.nilelink.app/api
     ```
3. Add custom domain: `nilelink.app`

### Repeat for All Apps

| App | Subdomain | Root Dir | Custom Domain |
|-----|-----------|----------|---------------|
| Customer | nilelink.app | web/customer | nilelink.app |
| POS | pos.nilelink.app | web/pos | pos.nilelink.app |
| Delivery | delivery.nilelink.app | web/delivery | delivery.nilelink.app |
| Supplier | supplier.nilelink.app | web/supplier | supplier.nilelink.app |
| Portal | portal.nilelink.app | web/portal | portal.nilelink.app |
| Dashboard | dashboard.nilelink.app | web/dashboard | dashboard.nilelink.app |
| Admin | admin.nilelink.app | web/unified | admin.nilelink.app |

---

## DNS Configuration

### Backend (A Record)
Point `api.nilelink.app` to your server's public IP:

```
A    api.nilelink.app    →  YOUR_SERVER_IP
```

### Frontend (CNAME - Automatic)
Cloudflare Pages automatically creates CNAME records when you add custom domains.

---

## Environment Variables (.env.production)

Required secrets to configure:

```env
# Database
POSTGRES_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your_secure_jwt_secret_min_32_chars

# Email (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_live_your_stripe_key
```

---

## Troubleshooting

### Build Taking Too Long
Docker build can take 10-15 minutes for first build due to:
- Large node_modules
- TypeScript compilation
- Prisma generation

**Speed up future builds:**
- Use cached layers (don't use `--no-cache` after first build)
- Add `.dockerignore` to exclude unnecessary files

### Build Fails
Check logs:
```powershell
docker-compose -f docker-compose.prod.yml logs api
```

Common issues:
- Missing dependencies → Check `package.json`
- Prisma generation failure → Check `prisma/schema.prisma`
- TypeScript errors → Run `npm run build` locally first

### Containers Won't Start
```powershell
# Check status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs

# Restart
docker-compose -f docker-compose.prod.yml restart
```

---

## Next Steps After Backend is Running

1. ✅ Verify backend health: `http://localhost:4000/api/system/health`
2. ✅ Run migrations: `docker exec nilelink-api-v1 npx prisma migrate deploy`
3. ✅ Deploy 7 frontend apps to Cloudflare Pages
4. ✅ Configure DNS (A record for api.nilelink.app)
5. ✅ Test domain-first (no localhost)

---

## Support Files Created

- `backend/Dockerfile` - Production multi-stage build
- `docker-compose.prod.yml` - Production services configuration
- `.env.production.example` - Environment template
- `deploy-reset.ps1` - Automated deployment script
- `verify-deployment.ps1` - Health check script
- `CLOUDFLARE_DEPLOYMENT.md` - Detailed frontend deployment guide

---

**Version**: v1.0.0  
**Status**: Infrastructure Ready, Build In Progress  
**Next**: Start backend → Deploy frontends → Configure DNS → Test
