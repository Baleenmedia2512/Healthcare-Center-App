# 🏥 MediBoo Healthcare Platform - Local Development Setup

## 🚀 Quick Start Guide

Follow these steps to run the healthcare center app locally on your machine.

### 📋 Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

### 🛠️ Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema and seed data
   npm run db:push
   npm run db:seed
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   - Visit: http://localhost:3000
   - The app will be running locally!

### 👤 Default Login Credentials

After setup, you can log in with:
- **Email**: `admin@democlinic.com`
- **Password**: `admin123`

**⚠️ Note**: Change this password after first login!

### 📁 Project Structure

```
healthcare-center-app/
├── pages/                 # Next.js pages (routes)
├── src/
│   ├── components/        # React components
│   ├── lib/              # Utility libraries
│   ├── hooks/            # Custom React hooks
│   └── styles/           # CSS styles
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── dev.db           # SQLite database (created after setup)
│   └── seed.js          # Database seed data
├── public/               # Static assets
└── package.json         # Project dependencies
```

### 🗄️ Database Management

**View Database**
```bash
npm run db:studio
```
This opens Prisma Studio at http://localhost:5555 to view/edit data

**Reset Database** (if needed)
```bash
npm run db:reset
```
This will reset the database and re-seed with initial data

**Manual Database Operations**
```bash
# Push schema changes to database
npm run db:push

# Seed database with initial data
npm run db:seed
```

### 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:studio` | Open database viewer |
| `npm run db:push` | Apply schema to database |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:reset` | Reset and re-seed database |

### 🌟 Features Available Locally

- **Multi-tenant SaaS Platform**: Manage multiple clinics
- **User Management**: Different user roles (Super Admin, Clinic Admin, Doctor)
- **Patient Management**: Register and manage patient records
- **Investigation Management**: Handle medical investigations
- **Reports**: Generate and view medical reports
- **Branch Management**: Manage multiple clinic branches
- **Branding**: Customize clinic branding and logos

### 🎯 User Roles & Access

1. **Super Admin**: Full system access across all clinics
2. **Clinic Admin**: Manage specific clinic and its branches
3. **Branch Admin**: Manage specific branch
4. **Doctor**: Access patient records and investigations

### 📊 Sample Data

The seed script creates:
- Demo clinic with sample data
- Admin user for login
- Sample patients and investigations
- Example branch data

### 🔍 Troubleshooting

**Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000
# Then restart
npm run dev
```

**Database Issues**
```bash
# Reset everything
npm run db:reset
```

**Dependencies Issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Prisma Issues**
```bash
# Regenerate Prisma client
npx prisma generate
```

### 🔄 Making Changes

1. **Database Schema Changes**:
   - Edit `prisma/schema.prisma`
   - Run `npm run db:push`

2. **Adding New Pages**:
   - Create files in `pages/` directory
   - Next.js automatically creates routes

3. **Adding Components**:
   - Create files in `src/components/`
   - Import and use in pages

### 🎉 You're Ready!

Your MediBoo healthcare platform is now running locally at:
**http://localhost:3000**

Start exploring the application with the default admin credentials above!

---

For questions or issues, check the troubleshooting section above or review the application logs in your terminal.
