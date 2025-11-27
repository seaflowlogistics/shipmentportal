# Shipment Portal - Backend API

Backend API for the Shipment Portal application built with Node.js, Express, TypeScript, and PostgreSQL.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb shipmentportal_dev
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations:**
   ```bash
   npm run migrate
   ```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Default Admin Credentials

After running migrations, use these credentials to log in:
- **Username:** `admin`
- **Password:** `Admin@123`

⚠️ **Important:** Change the password immediately after first login!

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/me` - Get current user info

### User Management (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset-password` - Reset user password

## Production Build

```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for all available configuration options.
