# 🚀 Growing - Setup Guide

Complete guide to set up and run the Growing application locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PersonalFI
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your configuration
# - Set MONGODB_URI to your MongoDB connection string
# - Adjust PORT if needed (default: 5000)
nano .env  # or use your preferred editor
```

#### MongoDB Setup Options

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Follow instructions at: https://docs.mongodb.com/manual/installation/

# Start MongoDB service
mongod

# Your MONGODB_URI in .env:
MONGODB_URI=mongodb://localhost:27017/growing
```

**Option B: MongoDB Atlas (Cloud)**
```bash
# 1. Create free account at https://cloud.mongodb.com/
# 2. Create a new cluster
# 3. Get connection string from "Connect" button
# 4. Update .env with your connection string:
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/growing?retryWrites=true&w=majority
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd ../frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env if needed (default values should work)
nano .env
```

## 🎯 Running the Application

### Development Mode

You'll need **two terminal windows** (or tabs):

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will start at `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:5173`

### Verify Installation

1. Open your browser to `http://localhost:5173`
2. You should see the Growing dashboard
3. Check browser console for any errors
4. Check terminal outputs for any issues

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run in watch mode
```

### Frontend Tests
```bash
cd frontend
npm test                   # Run all tests
npm run test:ui           # Run with UI
npm run test:coverage     # Run with coverage report
```

## 🛠️ Build for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build              # Creates optimized production build
npm run preview           # Preview production build locally
```

## 📦 Project Structure

```
PersonalFI/
├── backend/
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helper functions
│   ├── tests/           # Backend tests
│   ├── .env            # Environment variables (create from .env.example)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/      # Static assets
│   │   ├── components/  # React components
│   │   ├── config/      # Configuration
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── styles/      # CSS files
│   │   ├── test/        # Test utilities
│   │   └── utils/       # Helper functions
│   ├── .env            # Environment variables (create from .env.example)
│   └── package.json
│
└── docs/               # Additional documentation
```

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |
| `LOG_LEVEL` | Logging level | `debug` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000/api/v1` |
| `VITE_APP_NAME` | Application name | `Growing` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

## 🐛 Troubleshooting

### Backend won't start

**Error: MongoDB connection failed**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod

# Or check MongoDB Atlas connection string
```

**Error: Port already in use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in backend/.env
```

### Frontend won't start

**Error: Cannot connect to backend**
- Ensure backend is running at `http://localhost:5000`
- Check `VITE_API_BASE_URL` in `frontend/.env`
- Check browser console for CORS errors

**Error: Module not found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear caches
npm cache clean --force

# Remove node_modules in both directories
rm -rf backend/node_modules frontend/node_modules

# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

## 🔐 Security Notes

- Never commit `.env` files to version control
- Use strong passwords for MongoDB
- In production, use environment-specific secrets
- Enable MongoDB authentication in production
- Use HTTPS in production

## 📚 Next Steps

- Read [USER_GUIDE.md](./docs/USER_GUIDE.md) for application usage
- Read [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for API details
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) if you want to contribute

## 💬 Support

If you encounter any issues:

1. Check this guide thoroughly
2. Review error messages in terminal and browser console
3. Check [GitHub Issues](repository-issues-url)
4. Create a new issue with detailed information

---

**Happy Investing! 📈**
