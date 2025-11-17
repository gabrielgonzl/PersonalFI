# Growing - Investment Tracker Frontend

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

## ⚠️ Important: Backend Required

This frontend expects a backend API running at `http://localhost:5000/api/v1`.

If the backend is not running, you'll see:
- Empty dashboards
- "No data" messages
- API connection errors

**To test the UI without backend:**
The app will still render all components, but data will be empty.

## 🎨 Features

- 📊 Dashboard with real-time metrics
- 💼 Asset management (create, edit, view)
- 📁 Portfolio organization
- 📈 Analytics with charts
- ⚙️ Settings page
- 📱 Fully responsive design

## 🛠️ Tech Stack

- React 18 + Vite
- Tailwind CSS 3.4
- React Query
- Recharts
- React Router v6
- Material-UI Icons

## 📁 Project Structure

```
src/
├── components/
│   ├── common/      # Reusable UI components
│   ├── charts/      # Chart components
│   ├── layout/      # Layout components
│   └── features/    # Feature-specific components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── services/        # API services
├── utils/           # Utility functions
├── config/          # Configuration
└── context/         # React Context providers
```

## 🔧 Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Growing
VITE_APP_VERSION=1.0.0
```

## 📝 Notes

- The app uses React Query for data fetching and caching
- All API calls are proxied through Vite dev server
- Tailwind CSS is configured with custom colors and utilities
- Forms use React Hook Form with Zod validation
