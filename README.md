# TechNest - Full Stack Authentication App

A complete Node.js web application with secure user authentication, profile management, and Oracle database integration.

## 🎯 Features

- ✅ **User Registration & Login** - Secure authentication with password hashing
- ✅ **JWT Token Authentication** - Secure session management
- ✅ **User Dashboard** - Manage profile and activity logs
- ✅ **Oracle Database** - PL/SQL database with automatic table creation
- ✅ **Responsive Design** - Works on all devices
- ✅ **Password Security** - Bcrypt hashing, strong password requirements
- ✅ **Activity Logging** - Track all user actions
- ✅ **Session Management** - Remember me functionality

## 🏗️ Technology Stack

**Backend:**
- Node.js + Express.js
- Oracle Database (oracledb)
- JWT for authentication
- Bcrypt for password hashing

**Frontend:**
- HTML5
- CSS3 with responsive design
- Vanilla JavaScript (no frameworks)

## 📋 Project Structure

```
tech-auth-app/
├── server.js              # Main Express server
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── config/
│   └── database.js        # Oracle database configuration
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── routes/
│   ├── auth.js           # Register, login, logout endpoints
│   └── user.js           # Profile and user management
├── public/
│   ├── index.html        # Home page
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── dashboard.html    # User dashboard
│   ├── css/
│   │   ├── style.css     # Main styles
│   │   ├── auth.css      # Auth page styles
│   │   └── dashboard.css # Dashboard styles
│   └── js/
│       ├── script.js     # Main JavaScript
│       ├── login.js      # Login form handler
│       ├── register.js   # Register form handler
│       └── auth.js       # Auth utilities (if needed)
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Oracle Database (XE or Enterprise)
- npm or yarn

### Installation

1. **Extract and install dependencies:**
```bash
npm install
```

2. **Create .env file:**
```bash
cp .env.example .env
```

3. **Edit .env with your Oracle credentials:**
```env
NODE_ENV=development
PORT=3000
DB_USER=technest_user
DB_PASSWORD=TechNest@123
DB_CONNECTION_STRING=localhost:1521/xe
JWT_SECRET=your-super-secret-key
SESSION_SECRET=your-session-secret
```

4. **Oracle Database Setup:**
```sql
-- Run as SYSDBA
CREATE USER technest_user IDENTIFIED BY TechNest@123;
GRANT CREATE SESSION TO technest_user;
GRANT CREATE TABLE TO technest_user;
GRANT CREATE SEQUENCE TO technest_user;
GRANT UNLIMITED TABLESPACE TO technest_user;
```

5. **Start the server:**
```bash
npm start
```

6. **Open in browser:**
```
http://localhost:3000
```

## 📝 API Endpoints

### Authentication

**POST /api/auth/register**
- Register new user
- Body: { username, email, password, firstName, lastName }

**POST /api/auth/login**
- Login user
- Body: { email, password, rememberMe }
- Returns: JWT token

**POST /api/auth/logout**
- Logout user (requires authentication)

**GET /api/auth/verify**
- Verify token validity (requires authentication)

### User Management

**GET /api/user/profile**
- Get user profile (requires authentication)

**PUT /api/user/profile**
- Update user profile (requires authentication)

**POST /api/user/change-password**
- Change password (requires authentication)

**GET /api/user/activity-log**
- Get activity log (requires authentication)

## 🔐 Security Features

- **Password Hashing:** Bcrypt with salt rounds
- **JWT Tokens:** Secure token-based authentication
- **HTTPS:** Secure cookies in production
- **CORS:** Cross-origin request protection
- **Helmet:** Security headers
- **Validation:** Input validation on all endpoints
- **Activity Logging:** All user actions tracked

## 📱 Pages

1. **Home** (`/`) - Landing page
2. **Login** (`/login`) - User login
3. **Register** (`/register`) - User registration
4. **Dashboard** (`/dashboard`) - User profile and settings

## 🗄️ Database Schema

### users table
- user_id (PK)
- username (UNIQUE)
- email (UNIQUE)
- password
- first_name
- last_name
- phone
- address
- city
- state
- postal_code
- country
- is_active
- created_at
- updated_at

### user_sessions table
- session_id (PK)
- user_id (FK)
- ip_address
- user_agent
- created_at
- expires_at
- is_active

### activity_logs table
- log_id (PK)
- user_id (FK)
- action
- ip_address
- details
- created_at

## 🧪 Testing

### Test Register
1. Go to `/register`
2. Fill in form with test data
3. Submit and verify redirect to dashboard

### Test Login
1. Go to `/login`
2. Enter credentials
3. Verify token in localStorage
4. Check dashboard loads

### Test Profile Update
1. Go to dashboard
2. Click "Edit Profile"
3. Update information
4. Verify changes saved

## 📚 Environment Variables

```env
NODE_ENV              # development/production
PORT                  # Server port (default: 3000)
DB_USER              # Oracle username
DB_PASSWORD          # Oracle password
DB_CONNECTION_STRING # Oracle connection string
JWT_SECRET           # JWT signing secret
SESSION_SECRET       # Session secret
CORS_ORIGIN          # CORS allowed origin
```

## 🐛 Troubleshooting

**Database connection error:**
- Check DB_CONNECTION_STRING format
- Verify Oracle service is running
- Confirm username/password

**Port already in use:**
- Change PORT in .env
- Or kill process: `lsof -ti:3000 | xargs kill -9`

**CORS errors:**
- Update CORS_ORIGIN in .env
- Ensure frontend and backend on same origin

**Password validation fails:**
- Password must be 8+ chars
- Must contain uppercase, lowercase, number, special char

## 📖 Development

**Run with nodemon (auto-reload):**
```bash
npm run dev
```

**API testing with curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Password123!"}'
```

## 🚀 Deployment

### Prepare for production:

1. Update all secrets in .env
2. Set NODE_ENV=production
3. Enable HTTPS (use reverse proxy like Nginx)
4. Set secure cookie flags
5. Configure firewall/security groups
6. Set up database backups

### Deploy to Heroku:
```bash
heroku create your-app-name
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

## 📄 License

MIT License - Free for personal and commercial use

## 🤝 Support

For issues or questions, check the included documentation or search online for specific Node.js/Oracle topics.

## 📞 Contact

Email: support@technest.com

---

**Happy coding! 🚀**
