# Setup Guide - TechNest Authentication App

Complete step-by-step guide to set up and run the application.

## Prerequisites

1. **Node.js** (v14+): https://nodejs.org/
2. **Oracle Database** (XE or Enterprise)
3. **Code Editor** (VS Code recommended)
4. **Git** (optional but recommended)

## Installation Steps

### Step 1: Extract Project

```bash
unzip tech-auth-app.zip
cd tech-auth-app
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- express (web framework)
- oracledb (Oracle driver)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- And other required packages

### Step 3: Oracle Database Setup

#### For Oracle XE:

1. **Create User:**
```sql
-- Connect as SYSDBA
sqlplus / as sysdba

CREATE USER technest_user IDENTIFIED BY TechNest@123;
GRANT CREATE SESSION TO technest_user;
GRANT CREATE TABLE TO technest_user;
GRANT CREATE SEQUENCE TO technest_user;
GRANT UNLIMITED TABLESPACE TO technest_user;
EXIT;
```

2. **Connection String:**
- For local XE: `localhost:1521/xe`
- For Enterprise: `your-host:1521/database-name`

### Step 4: Environment Configuration

1. **Copy template:**
```bash
cp .env.example .env
```

2. **Edit .env file** with your settings:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_USER=technest_user
DB_PASSWORD=TechNest@123
DB_CONNECTION_STRING=localhost:1521/xe

# Security (change these in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-super-secret-session-key

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Step 5: Start Server

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║   TechNest Auth App Started            ║
║   Server: http://localhost:3000        ║
║   Environment: development             ║
╚════════════════════════════════════════╝

✓ Oracle Database Pool Created
✓ Database Tables Verified/Created
```

### Step 6: Access Application

Open browser and go to: `http://localhost:3000`

## Testing the Application

### Create Account

1. Click "Register" or go to `/register`
2. Fill in the form:
   - Email: test@example.com
   - Username: testuser
   - Password: Test123!@# (must have: uppercase, lowercase, number, special char)
   - First Name: Test
   - Last Name: User
3. Click "Create Account"
4. Should redirect to dashboard

### Login

1. Go to `/login`
2. Enter credentials:
   - Email: test@example.com
   - Password: Test123!@#
3. Check "Remember me" (optional)
4. Click "Sign In"
5. Should go to dashboard

### Update Profile

1. On dashboard, click "Edit Profile"
2. Update information (phone, city, country, etc.)
3. Click "Save Changes"
4. Verify update succeeded

### Change Password

1. Go to "Change Password" tab
2. Enter current password
3. Enter new password (must meet requirements)
4. Confirm password
5. Click "Change Password"

### View Activity Log

1. Go to "Activity Log" tab
2. See all your logins, registrations, and profile updates
3. Shows IP address and timestamp

### Logout

1. Click "Logout" button
2. Should return to home page
3. Token cleared from localStorage

## Database Tables

The application automatically creates these tables:

### users
```sql
CREATE TABLE users (
    user_id NUMBER PRIMARY KEY,
    username VARCHAR2(50) UNIQUE,
    email VARCHAR2(100) UNIQUE,
    password VARCHAR2(255),
    first_name VARCHAR2(50),
    last_name VARCHAR2(50),
    phone VARCHAR2(20),
    address VARCHAR2(255),
    city VARCHAR2(50),
    state VARCHAR2(50),
    postal_code VARCHAR2(20),
    country VARCHAR2(50),
    is_active NUMBER(1),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### user_sessions
```sql
CREATE TABLE user_sessions (
    session_id VARCHAR2(255) PRIMARY KEY,
    user_id NUMBER,
    ip_address VARCHAR2(45),
    user_agent VARCHAR2(500),
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active NUMBER(1),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### activity_logs
```sql
CREATE TABLE activity_logs (
    log_id NUMBER PRIMARY KEY,
    user_id NUMBER,
    action VARCHAR2(100),
    ip_address VARCHAR2(45),
    details VARCHAR2(500),
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

## Troubleshooting

### "Port 3000 is already in use"

**Solution 1:** Kill the process
```bash
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows (PowerShell as admin):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Solution 2:** Change port in .env
```env
PORT=3001
```

### "Cannot connect to database"

1. Check Oracle service is running
2. Verify connection string format
3. Check username/password in .env
4. Test connection with SQL*Plus:
```bash
sqlplus technest_user/TechNest@123@localhost:1521/xe
```

### "Password validation fails"

Password must contain:
- ✓ At least 8 characters
- ✓ At least one uppercase letter (A-Z)
- ✓ At least one lowercase letter (a-z)
- ✓ At least one number (0-9)
- ✓ At least one special character (@$!%*?&)

**Example valid password:** `Test123!@#`

### "Token expired" error

- Try logging out and back in
- Increase token expiry in `routes/auth.js` if needed
- Default is 24 hours (or 7 days with "Remember me")

### "CORS error" in browser

Update .env:
```env
CORS_ORIGIN=http://localhost:3000
```

Or if running on different port:
```env
CORS_ORIGIN=http://localhost:3001
```

## Development vs Production

### Development (.env)
```env
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Production (.env)
```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=<long-random-secret>
SESSION_SECRET=<long-random-secret>
```

In production also:
- Use HTTPS only
- Set secure cookies
- Enable CORS properly
- Hide database credentials

## API Testing

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## File Structure Explanation

```
tech-auth-app/
├── server.js                  # Express server setup
├── package.json               # Dependencies
├── .env.example              # Template (copy to .env)
│
├── config/
│   └── database.js           # Oracle DB connection and table creation
│
├── middleware/
│   └── auth.js               # JWT verification middleware
│
├── routes/
│   ├── auth.js               # Login, register, logout
│   └── user.js               # Profile management
│
├── public/                    # Frontend files
│   ├── index.html            # Home page
│   ├── login.html            # Login form
│   ├── register.html         # Registration form
│   ├── dashboard.html        # User dashboard
│   ├── css/
│   │   ├── style.css         # Main CSS
│   │   ├── auth.css          # Auth page CSS
│   │   └── dashboard.css     # Dashboard CSS
│   └── js/
│       ├── script.js         # Global JS
│       ├── login.js          # Login logic
│       └── register.js       # Register logic
│
└── README.md / SETUP.md      # Documentation
```

## Performance Tips

1. **Use Connection Pooling:** Already configured in database.js
2. **Minify CSS/JS:** For production
3. **Enable Compression:** In Express
4. **Use CDN:** For static files
5. **Database Optimization:** Add indexes on frequently searched fields

## Security Checklist

- [ ] Changed JWT_SECRET in .env
- [ ] Changed SESSION_SECRET in .env
- [ ] Set NODE_ENV=production
- [ ] Enabled HTTPS
- [ ] Configured CORS properly
- [ ] Validated all inputs
- [ ] Sanitized outputs
- [ ] Enabled security headers (Helmet)
- [ ] Set secure cookies
- [ ] Regular database backups

## Useful Commands

```bash
# Install dependencies
npm install

# Start server
npm start

# Development (auto-reload)
npm run dev

# Check health
curl http://localhost:3000/api/health

# View logs
tail -f server.log
```

## Next Steps

1. Customize branding in HTML files
2. Add email verification
3. Add password reset functionality
4. Add two-factor authentication
5. Deploy to production server

## Support

- Check README.md for more information
- Review inline code comments
- Test features manually before deployment
- Monitor logs for errors

---

**Setup complete! Happy coding! 🚀**
