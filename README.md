# Cookish - Chef Booking Platform

A modern Next.js platform that connects home chefs with customers looking for personalized dining experiences.

## Features

- **Browse Chefs**: Discover talented chefs in your area
- **Menu Selection**: Explore diverse menus and cuisines
- **Booking System**: Easy booking flow with calendar integration
- **User Dashboard**: Manage bookings, favorites, and reviews
- **Chef Dashboard**: Menu management, availability, bookings, and payouts
- **Admin Panel**: Comprehensive management tools
- **Messaging**: Built-in chat system
- **Reviews & Ratings**: Customer feedback system
- **Dispute Resolution**: Handle conflicts professionally
- **Procurement**: Ingredient ordering and tracking
- **Payment Integration**: Stripe and PayPal support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **File Storage**: MinIO
- **Containerization**: Docker

## Project Structure

```
cookish/
├── app/                    # Next.js app directory
│   ├── (public)/          # Public-facing pages
│   ├── (bookings)/        # Booking flow
│   ├── (dashboard)/       # User, chef, admin dashboards
│   ├── messages/          # Messaging system
│   └── disputes/          # Dispute handling
├── components/            # Reusable components
├── lib/                   # Utility libraries
├── modules/               # Feature modules
├── prisma/                # Database schema & migrations
└── public/                # Static assets
```

## Development Status & Test Data

This is a development project. All data in the database (customer accounts, addresses, payment records, chef profiles, bookings, messages, and reviews) is **fictional test data** created for development and demonstration purposes only. No real user data or payment information is stored.

See [ROADMAP.md](ROADMAP.md) for planned features and development timeline.

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sabiguru/cookish.git
cd cookish
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the database and services with Docker:
```bash
docker-compose up -d postgres minio
```

5. Run Prisma migrations:
```bash
npx prisma migrate dev
```

6. Seed the database:
```bash
npx prisma db seed
```

7. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Docker Deployment

To run the entire stack with Docker:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- MinIO (port 9000, console: 9001)
- Next.js app (port 3000)

## Database Management

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Seed database
npx prisma db seed
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Authentication

The platform uses NextAuth.js with email OTP verification. Configure your email provider in the `.env` file.

## Payment Integration

Supports:
- **Stripe**: Card payments
- **PayPal**: Alternative payment method

Configure API keys in environment variables.

## File Storage

Uses MinIO for object storage (S3-compatible). Access the MinIO console at http://localhost:9001

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by **sabiguru**

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
