#!/bin/bash

# Deployment Preparation Script for Vercel
echo "🚀 Preparing for Vercel deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Build the application
echo "🔨 Building the application..."
npm run build

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up Supabase database"
echo "2. Configure environment variables in Vercel"
echo "3. Deploy to Vercel"
