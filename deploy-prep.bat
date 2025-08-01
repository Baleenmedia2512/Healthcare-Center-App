@echo off
REM Deployment Preparation Script for Vercel (Windows)
echo 🚀 Preparing for Vercel deployment...

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
npx prisma generate

REM Build the application
echo 🔨 Building the application...
npm run build

echo ✅ Deployment preparation complete!
echo.
echo 📋 Next steps:
echo 1. Set up Supabase database
echo 2. Configure environment variables in Vercel
echo 3. Deploy to Vercel
pause
