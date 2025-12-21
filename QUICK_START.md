# Quick Start Guide - Cookish

## Immediate Next Steps

### 1. Start Development Server (Right Now!)
```bash
cd cookish
npm run dev
```

Visit: http://localhost:3000

You'll see the home page with:
- Hero section
- How it works
- Navigation to browse chefs, cuisines, and occasions

### 2. Explore the Structure
The app has 45+ pages already created:

**Public Pages** (No auth required):
- `/` - Home page
- `/chefs` - Browse chefs
- `/chef/[id]` - Chef profile
- `/cuisines` - All cuisines
- `/cuisine/[slug]` - Cuisine details
- `/occasions` - All occasions
- `/menu/[id]` - Menu details
- `/search` - Search page
- `/offers` - Coupons & giftcards
- `/reviews` - All reviews

**Protected Pages** (Auth required):
- `/user/*` - User dashboard (7 pages)
- `/chef/*` - Chef dashboard (8 pages)
- `/admin/*` - Admin panel (9 pages)
- `/book/[chefId]` - Booking flow
- `/bookings/[id]` - Booking details
- `/messages` - Conversations
- `/disputes/[id]` - Disputes

### 3. Database Setup (Optional - for real data)

Start PostgreSQL and MinIO:
```bash
docker-compose up -d postgres minio
```

Copy environment file:
```bash
cp .env.example .env
```

Edit `.env` and update:
```
DATABASE_URL="postgresql://cookish:cookish_password@localhost:5432/cookish?schema=public"
```

Initialize database:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Access MinIO Console: http://localhost:9001
- Username: minioadmin
- Password: minioadmin

### 4. What You Have Now

✅ **Complete folder structure** matching your specification
✅ **All 45+ page files** with basic layouts
✅ **Prisma schema** with 15+ models
✅ **Docker setup** for PostgreSQL, MinIO, and the app
✅ **Navigation** and footer components
✅ **Beautiful home page** with gradient hero
✅ **TypeScript configuration**
✅ **Tailwind CSS** styling
✅ **Development environment** ready to go

### 5. What to Build Next

**Phase 1 - Core Features**:
1. Authentication (NextAuth.js)
2. Chef profile pages with data
3. Menu listing and details
4. Basic search functionality

**Phase 2 - Booking System**:
5. Booking flow
6. Calendar integration
7. Payment processing (Stripe)

**Phase 3 - User Features**:
8. Reviews and ratings
9. Messaging system
10. Favorites

**Phase 4 - Chef Features**:
11. Menu management
12. Availability calendar
13. Booking management
14. Procurement tracking

**Phase 5 - Admin**:
15. Admin dashboard
16. User/Chef management
17. Dispute resolution
18. CMS for content

## File Structure Overview

```
cookish/
├── app/                          # All routes
│   ├── (public)/                # Public pages
│   ├── (bookings)/              # Booking flow
│   ├── (dashboard)/             # Dashboards
│   ├── messages/                # Chat
│   ├── disputes/                # Disputes
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page ✨
│
├── components/                   # React components
│   └── layout/
│       ├── Navbar.tsx           # Navigation ✨
│       └── Footer.tsx           # Footer ✨
│
├── lib/                         # Utilities
│   ├── prisma.ts                # DB client ✨
│   ├── auth.ts                  # Auth setup
│   └── utils.ts                 # Helpers ✨
│
├── prisma/
│   ├── schema.prisma            # Database schema ✨
│   └── seed.ts                  # Seed data ✨
│
├── docker-compose.yml           # Docker services ✨
├── Dockerfile                   # App container ✨
├── .env.example                 # Env template ✨
└── package.json                 # Dependencies ✨

✨ = Ready to use!
```

## Quick Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio GUI
npm run prisma:seed        # Seed database

# Docker
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
```

## Next Dependencies to Install (When Needed)

```bash
# Authentication
npm install next-auth @auth/prisma-adapter

# UI Components
npx shadcn@latest init
npx shadcn@latest add button card input form dialog

# Forms
npm install react-hook-form zod @hookform/resolvers

# Payments
npm install stripe @stripe/stripe-js

# Date/Time
npm install date-fns

# File Upload
npm install minio

# Additional
npm install lucide-react  # Icons
```

## Tips

1. **Start Simple**: The dev server is ready. Visit the pages and see the structure.

2. **Database Later**: You can build UI components without the database first.

3. **shadcn/ui**: Consider using shadcn/ui for beautiful, accessible components.

4. **TypeScript**: All files are TypeScript. Types will help you avoid bugs.

5. **Route Groups**: The `(folder)` syntax groups routes without affecting URLs.

6. **Dynamic Routes**: `[id]` and `[slug]` are dynamic route parameters.

## Support

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Tailwind: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

---

**You're all set! Start with `npm run dev` and begin building!** 🚀
