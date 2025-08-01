# 🚀 Vercel Deployment Guide

## Prerequisites
- ✅ MariaDB database running on 103.191.208.228
- ✅ Remote database access enabled
- ✅ All environment variables configured

## Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Environment Variables for Vercel
Add these to your Vercel project settings:

```env
# Database (Your MariaDB Server)
DATABASE_URL=mysql://baleeed5_mediboo:mediboo%40123%23@103.191.208.228:3306/baleeed5_mediboo

# NextAuth (Update for production)
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-production-secret-key-here-minimum-32-characters

# API URLs (Update for production)
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app

# Environment
NODE_ENV=production
```

### 3. Database Migration on Vercel
After deployment, run database migration:
```bash
# In Vercel Functions or locally with production DATABASE_URL
npx prisma db push
npx prisma db seed
```

### 4. Build Configuration
Your `next.config.js` is already configured for Vercel.

### 5. Deployment Commands
```bash
# Option 1: GitHub Integration (Recommended)
# Push to GitHub and connect to Vercel

# Option 2: Direct deployment
vercel --prod
```

### 6. Post-Deployment Checklist
- [ ] Database connection working
- [ ] Authentication working
- [ ] File uploads working
- [ ] All API endpoints responding
- [ ] Patient registration functional

## Important Notes

1. **Database**: Your MariaDB server must accept connections from Vercel's IP ranges
2. **Files**: Uploaded files will be stored temporarily on Vercel (consider external storage)
3. **Cold Starts**: First request may be slow due to serverless nature
4. **Environment**: All sensitive data in environment variables

## Security Recommendations

1. Change NEXTAUTH_SECRET to a strong production value
2. Enable CORS restrictions if needed
3. Consider rate limiting for API endpoints
4. Verify database access permissions

## Troubleshooting

### Common Issues:
- **Database Connection**: Ensure remote access is enabled
- **Environment Variables**: Check all variables are set in Vercel
- **Build Errors**: Check build logs in Vercel dashboard
- **API Timeouts**: Vercel functions have 10s timeout (Hobby) / 60s (Pro)
