# Assumptions

- Database: PostgreSQL is used as the primary database, with connection details provided via environment variables.
- Authentication: JWT-based authentication is implemented with a 24-hour token expiry. No refresh token mechanism is implemented for the MVP as noted as optional in the PRD.
- Email: A stub email adapter is implemented for password reset functionality, which can be replaced with a real email service later.
- Mock Data: All Google Business Profile (GBP) data is mocked in the MVP as specified in the PRD.
- Environment Variables: DATABASE_URL, JWT_SECRET, PORT, and NODE_ENV are required. Optional variables include EMAIL_FROM, EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD for future email integration.
- Security: CORS is enabled for all origins in development but restricted in production. Helmet is used for security headers.