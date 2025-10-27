# LocalSEOExpert

A lightweight Local SEO and Google Business Profile (GBP) management MVP that enables SMBs and agencies to monitor and manage GBP locations, reviews, and posts, track local keywords, and view aggregated insights.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Testing**: Vitest, React Testing Library, Supertest

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

Optional:
- `EMAIL_FROM`: Sender email address
- `EMAIL_SERVICE`: Email service provider
- `EMAIL_USER`: Email service username
- `EMAIL_PASSWORD`: Email service password

### Development

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp server/.env.example server/.env
# Edit server/.env with your database credentials
```

4. Run database migrations:
```bash
npm run db:push
```

5. Seed the database (optional):
```bash
npm run db:seed
```

6. Start development servers:
```bash
npm run dev
```

### Testing

Run tests with coverage:
```bash
npm test
```

View coverage report:
```bash
npm run coverage
```

### Production Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

### Docker Development

Start with Docker Compose:
```bash
docker-compose -f docker-compose.dev.yml up
```

## Deployment

The application can be deployed to any platform that supports Node.js applications. For cloud deployment:

1. Set up a PostgreSQL database
2. Configure environment variables
3. Build and deploy the application
4. Run migrations

See `infra/` directory for example infrastructure as code.