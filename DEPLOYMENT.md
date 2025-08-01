# 🚀 Deployment Guide for MediBoo Platform

This guide will help you deploy your healthcare center app to Vercel with Supabase as the database.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)

## 🗄️ Step 1: Set up Supabase Database

### Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `mediboo-platform`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### Get Database Connection Details

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Find the "Connection parameters" section
3. Copy the **Connection string** (it should look like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## ⚙️ Step 2: Deploy to Vercel

### Connect Your Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Choose the repository with your healthcare app

### Configure Build Settings

Vercel should auto-detect it's a Next.js project. If not:
- **Framework Preset**: Next.js
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Add Environment Variables

In the Vercel deployment setup, add these environment variables:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXTAUTH_SECRET=your-long-random-secret-key-here
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

**Important**: 
- Replace `[PASSWORD]` with your Supabase database password
- Replace `[PROJECT-REF]` with your Supabase project reference
- Replace `your-app-name` with your actual Vercel app name
- Generate a random secret for `NEXTAUTH_SECRET` (32+ characters)

### Deploy

1. Click "Deploy"
2. Wait for the build to complete (5-10 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

## 🏗️ Step 3: Set up Database Schema

### Push Database Schema

After deployment, you need to set up your database schema:

1. In Vercel, go to your project dashboard
2. Go to **Functions** tab
3. Find your app URL and visit: `https://your-app-name.vercel.app/api/admin/initialize-storage`
4. This will create all necessary database tables

### Alternative: Use Prisma Studio

1. Install Prisma CLI locally: `npm install -g prisma`
2. Set your DATABASE_URL environment variable locally
3. Run: `npx prisma db push`

## 👤 Step 4: Access Your Application

### Default Login Credentials

After the database is initialized, you can log in with:
- **Email**: `admin@democlinic.com`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change this password immediately after first login!

### First Steps

1. Log in with default credentials
2. Go to Settings and change the admin password
3. Update clinic information
4. Create additional users as needed
5. Set up your branding (logo, colors, etc.)

## 🔧 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres:pass@db.abc.supabase.co:5432/postgres` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | `your-secret-key-32-chars-minimum` |
| `NEXTAUTH_URL` | Your app's URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_URL` | API base URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | App base URL | `https://your-app.vercel.app` |
| `NODE_ENV` | Environment | `production` |

## 🚨 Troubleshooting

### Build Fails

1. Check the build logs in Vercel
2. Make sure all environment variables are set
3. Verify your DATABASE_URL is correct

### Database Connection Issues

1. Verify your Supabase database is running
2. Check the connection string format
3. Ensure your password doesn't contain special characters that need URL encoding

### App Won't Load

1. Check the Vercel function logs
2. Verify NEXTAUTH_URL matches your domain
3. Make sure database schema is initialized

### Can't Log In

1. Ensure database is initialized with seed data
2. Check if the admin user was created
3. Verify password hashing is working

## 🔄 Updates and Maintenance

### Deploying Updates

1. Push changes to your GitHub repository
2. Vercel will automatically deploy changes
3. Monitor the deployment in Vercel dashboard

### Database Migrations

When you make schema changes:
1. Update your Prisma schema
2. Create a migration: `npx prisma migrate dev`
3. Deploy changes
4. Run: `npx prisma db push` in production

## 📊 Monitoring

### Vercel Analytics

Enable Vercel Analytics in your project settings for:
- Performance monitoring
- User analytics
- Error tracking

### Supabase Monitoring

Use Supabase dashboard to monitor:
- Database performance
- API usage
- Storage usage

## 🆘 Support

If you encounter issues:

1. Check Vercel build logs
2. Check Supabase logs
3. Review this guide
4. Check environment variables

## 🎉 Success!

Your MediBoo platform should now be live and accessible to users worldwide on Vercel's global CDN with a secure Supabase database!

Visit your app at: `https://your-app-name.vercel.app`
