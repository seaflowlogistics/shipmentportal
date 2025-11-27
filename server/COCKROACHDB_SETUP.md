# CockroachDB Setup Guide

## ✅ You've Already Done
1. Created CockroachDB Cloud cluster
2. Downloaded SSL certificate to `~/.postgresql/root.crt`

## 📝 Next Steps

### 1. Get Your Connection String
From your CockroachDB Cloud dashboard, copy the connection string. It should look like:
```
postgresql://username:password@host-name.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full
```

### 2. Create Backend Environment File
Create `/server/.env` with the following content:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (CockroachDB Cloud)
DATABASE_URL=your-connection-string-here
DATABASE_SSL=true
DATABASE_CA_CERT=/Users/ashwinn/.postgresql/root.crt

# JWT Configuration (generate random secrets)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (SMTP) - Optional for now
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@shipmentportal.com

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=15
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
```

### 4. Run Database Migrations
```bash
cd server
npm run migrate
```

This will create all the necessary tables and a default admin user.

### 5. Start Backend Server
```bash
cd server
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 5000
```

### 6. Test the Connection
Open a new terminal and test the API:
```bash
curl http://localhost:5000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### 7. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

Should return user data and tokens.

## 🔐 Default Admin Credentials
- **Username:** `admin`
- **Password:** `Admin@123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

## 🐛 Troubleshooting

### Connection Error
- Verify your connection string is correct
- Check that SSL certificate path is correct
- Ensure your IP is whitelisted in CockroachDB Cloud

### Migration Fails
- Check database permissions
- Verify the database exists
- Check CockroachDB Cloud console for errors

### Port Already in Use
Change `PORT` in `.env` to a different port (e.g., 5001)

## 📚 Next Steps
Once the backend is running:
1. Install frontend dependencies: `npm install` (in root directory)
2. Start frontend: `npm run dev`
3. Open browser to `http://localhost:5173`
