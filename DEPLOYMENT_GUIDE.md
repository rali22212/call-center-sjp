# Phase 7.4 & 7.5: Deployment Guide

## Phase 7.4: Deploy Frontend to Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Git installed on your machine

### Step 1: Push to GitHub

```bash
# Navigate to your project root
cd "C:\Users\Ali Raza\.gemini\call-center-sjp"

# Initialize git (if not already done)
git init

# Create .gitignore file
echo "node_modules/
.next/
.env
.env.local
dist/
build/
*.log" > .gitignore

# Add all files
git add .

# Commit
git commit -m "Initial commit - Call Center Management System"

# Create a new repository on GitHub (via web interface)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/call-center-sjp.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Frontend on Vercel

1. **Go to Vercel**: https://vercel.com
2. **Click "New Project"**
3. **Import from GitHub**: Select your repository
4. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `frontend`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   
5. **Environment Variables** (Optional for frontend):
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```

6. **Click Deploy**

### Step 3: Update API URLs in Frontend

After deployment, update all `http://localhost:3000` references to your production backend URL:

**Files to update:**
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/dashboard/page.tsx`
- `app/agent/page.tsx`
- `app/admin/page.tsx`
- All query pages

**Find and replace:**
```typescript
// Replace:
'http://localhost:3000/auth/login'

// With:
`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/login`
```

Or create a config file:
```typescript
// config/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

---

## Phase 7.5: Deploy Backend to Render

### Step 1: Prepare Backend for Production

1. **Update CORS in `backend/src/main.ts`**:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3001',
    'https://your-app.vercel.app', // Add your Vercel URL
  ],
  credentials: true,
});
```

2. **Create `backend/.env.production`** (for reference, don't commit):
```env
DATABASE_URL="your-neon-postgresql-url"
JWT_SECRET="your-production-secret"
PORT=3000
NODE_ENV=production
```

### Step 2: Deploy to Render

1. **Go to Render**: https://render.com
2. **Click "New +" → "Web Service"**
3. **Connect GitHub repository**
4. **Configure Service**:
   - **Name**: `call-center-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`

5. **Environment Variables** (Add these in Render dashboard):
   ```
   DATABASE_URL=your-neon-postgresql-connection-string
   JWT_SECRET=your-secure-random-string
   NODE_ENV=production
   ```

6. **Click "Create Web Service"**

### Step 3: Database Migration on Render

After deployment, run migrations:

1. Go to Render Dashboard → Your Service → **Shell** tab
2. Run:
```bash
npx prisma db push
npx ts-node prisma/seed.ts
```

---

## Post-Deployment Checklist

### ✅ Frontend (Vercel)
- [ ] Deployed successfully
- [ ] Environment variables set
- [ ] API URLs point to production backend
- [ ] Test login functionality
- [ ] Test all pages load correctly

### ✅ Backend (Render)
- [ ] Deployed successfully
- [ ] Database connected
- [ ] Migrations run
- [ ] Seed data created
- [ ] CORS configured for frontend
- [ ] Test API endpoints

### ✅ Testing
- [ ] Register a new user
- [ ] Login as agent
- [ ] Create a query
- [ ] Login as admin
- [ ] View all queries
- [ ] Manage categories
- [ ] All navigation works

---

## Troubleshooting

### Frontend Issues

**Build fails on Vercel:**
```bash
# Check package.json in frontend/ has all dependencies
npm install
# Test build locally first
npm run build
```

**API calls fail:**
- Check CORS settings in backend
- Verify API_URL environment variable
- Check browser console for errors

### Backend Issues

**Build fails on Render:**
- Ensure `package.json` has build script
- Check Node version compatibility
- Verify all dependencies are in package.json

**Database connection fails:**
- Verify DATABASE_URL is correct
- Check Neon database is active
- Ensure IP allowlist includes 0.0.0.0/0 (allow all)

**Prisma errors:**
- Run `npx prisma generate` in build command
- Ensure schema.prisma is correct

---

## Custom Domain (Optional)

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render:
1. Go to Service Settings → Custom Domain
2. Add domain
3. Update DNS records

---

## Monitoring & Logs

### Vercel:
- View logs: Project → Deployments → Click deployment → View Logs
- Runtime logs: Project → Logs tab

### Render:
- View logs: Service → Logs tab
- Real-time streaming available

---

## Environment Variables Reference

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Backend (Render Environment Variables)
```env
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-very-secure-secret-key-here
PORT=3000
NODE_ENV=production
```

---

## Useful Commands

### Deploy updates:
```bash
# Make changes
git add .
git commit -m "Update: description"
git push origin main

# Vercel auto-deploys
# Render auto-deploys
```

### Rollback (Vercel):
- Go to Deployments
- Click previous deployment
- Click "..." → Promote to Production

### Rollback (Render):
- Go to Events
- Click previous deployment
- Redeploy

---

**Deployment Complete!** 🎉
Your Call Center Management System is now live!
