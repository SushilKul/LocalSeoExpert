# Local SEO Expert

A user-friendly web application for managing local SEO tasks and business locations.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

## Setup Instructions

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Copy `.env.example` to `.env` in the server directory
- Update the following variables:
  ```
  PORT=5000
  DATABASE_URL=postgres://user:password@localhost:5432/yourdb
  JWT_SECRET=your_jwt_secret
  ```

4. Set up the database:
```bash
```bash
# Create a migration file (if not already created)
npm run db:generate

# Apply database migrations
npm run db:migrate
```

> **Note:**  
> If you see an error like `Missing script: "db:migrate"`, ensure your `package.json` includes the following scripts under the `"scripts"` section:

```json
"scripts": {
  "db:generate": "drizzle-kit generate:pg",
  "db:migrate": "drizzle-kit push:pg"
}
```

Replace the commands with your actual migration tool if different.
```

## Development

To run the application in development mode:

```bash
npm run dev
```

This will start:
- Frontend development server on http://localhost:3000
- Backend API server on http://localhost:5000

## Building for Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Project Structure

```
├── client/           # Frontend React application
│   ├── src/          # Source files
│   └── index.html    # HTML entry point
├── server/           # Backend Express server
│   ├── routes.ts     # API routes
│   ├── storage.ts    # Database operations
│   └── vite.ts       # Vite configuration
└── shared/           # Shared types and utilities
```

## Features

- User authentication and authorization
- Business location management
- SEO performance tracking
- Review management
- Analytics dashboard

## Tech Stack

- Frontend: React, Vite, TailwindCSS
- Backend: Express.js, TypeScript
- Database: PostgreSQL with Drizzle ORM
- Authentication: JWT, Passport.js

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT