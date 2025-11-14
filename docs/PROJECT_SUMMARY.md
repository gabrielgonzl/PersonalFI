# 📊 Growing - Project Summary

## Quick Reference Guide

---

## 🎯 Project Overview

**Growing** es una aplicación web full-stack para tracking y análisis de inversiones personales.

### Stack Tecnológico

```
Frontend:  React 18 + Vite + Material-UI + React Query
Backend:   Node.js + Express + MongoDB + Mongoose
Database:  MongoDB Atlas (Cloud)
Hosting:   Vercel (Frontend) + Railway/Render (Backend)
```

---

## 📐 Arquitectura Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React App)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Components Layer                                           │ │
│  │  - Dashboard, Assets, Portfolios, Analytics                │ │
│  │  - Charts (Recharts), Forms (React Hook Form)              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │  State Management Layer                                     │ │
│  │  - React Query (Server State)                              │ │
│  │  - Context API (UI State)                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │  Services Layer (Axios HTTP Client)                        │ │
│  │  - assetService, portfolioService, etc.                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP REST API (JSON)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    BACKEND (Express API)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Routes Layer                                               │ │
│  │  /api/v1/assets, /portfolios, /contributions, /analytics   │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │  Controllers Layer                                          │ │
│  │  - Request validation, response formatting                 │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │  Services Layer (Business Logic)                           │ │
│  │  - Financial calculations, data transformations            │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────────┐ │
│  │  Models Layer (Mongoose Schemas)                           │ │
│  │  - Asset, Contribution, Portfolio, Settings                │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Mongoose ODM
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    DATABASE (MongoDB Atlas)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Collections:                                               │ │
│  │  - assets        (activos individuales)                    │ │
│  │  - contributions (historial de transacciones)              │ │
│  │  - portfolios    (carteras de activos)                     │ │
│  │  - settings      (configuración global)                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Model Overview

### Core Entities

```
┌──────────────┐
│  PORTFOLIO   │ 1    N ┌──────────────┐ 1    N ┌──────────────┐
│              ├────────┤    ASSET     ├────────┤ CONTRIBUTION │
│ - name       │        │              │        │              │
│ - cashBalance│        │ - name       │        │ - date       │
│ - totalValue │        │ - type       │        │ - quantity   │
└──────────────┘        │ - quantity   │        │ - price      │
                        │ - value      │        └──────────────┘
                        └──────────────┘

┌──────────────┐
│   SETTINGS   │ (Singleton)
│              │
│ - currency   │
│ - theme      │
│ - apiKeys    │
└──────────────┘
```

### Relaciones
- **Portfolio → Assets**: 1 a N (un portfolio contiene muchos assets)
- **Asset → Contributions**: 1 a N (un asset tiene muchas contribuciones)
- **Portfolio ← Asset**: N a 1 (un asset puede pertenecer a un portfolio o ser independiente)

---

## 🛣️ API Routes

### Assets
- `GET    /api/v1/assets` - Listar todos
- `GET    /api/v1/assets/:id` - Obtener uno
- `POST   /api/v1/assets` - Crear
- `PUT    /api/v1/assets/:id` - Actualizar
- `DELETE /api/v1/assets/:id` - Eliminar

### Contributions
- `GET    /api/v1/contributions` - Listar todos
- `POST   /api/v1/contributions` - Crear
- `PUT    /api/v1/contributions/:id` - Actualizar
- `DELETE /api/v1/contributions/:id` - Eliminar

### Portfolios
- `GET    /api/v1/portfolios` - Listar todos
- `GET    /api/v1/portfolios/:id` - Obtener uno
- `POST   /api/v1/portfolios` - Crear
- `POST   /api/v1/portfolios/:id/add-cash` - Agregar efectivo
- `POST   /api/v1/portfolios/:id/distribute-cash` - Distribuir efectivo

### Analytics
- `GET    /api/v1/analytics/overview` - Dashboard summary
- `GET    /api/v1/analytics/performance` - Rendimiento histórico
- `GET    /api/v1/analytics/distribution` - Distribución por tipo

### Settings
- `GET    /api/v1/settings` - Obtener config
- `PUT    /api/v1/settings` - Actualizar config

---

## 🎨 Frontend Pages

### Main Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Vista principal con stats y charts |
| `/assets` | AssetsList | Lista de todos los activos |
| `/assets/:id` | AssetDetail | Detalle y contribuciones de un activo |
| `/assets/create` | CreateAsset | Formulario de creación |
| `/portfolios` | PortfoliosList | Lista de carteras |
| `/portfolios/:id` | PortfolioDetail | Detalle de cartera con assets |
| `/analytics` | Analytics | Análisis avanzado y reportes |
| `/settings` | Settings | Configuración de la app |

---

## 🔢 Cálculos Financieros Clave

### Asset Metrics

```javascript
// Precio promedio de compra
averagePrice = totalInvested / quantity

// Valor actual
currentValue = quantity * currentPrice

// Ganancia/Pérdida
profitLoss = currentValue - totalInvested

// Rendimiento porcentual (ROI)
profitLossPercentage = (profitLoss / totalInvested) * 100
```

### Portfolio Metrics

```javascript
// Valor total invertido en assets
totalInvested = Σ(asset.totalInvested)

// Valor actual de assets
currentValue = Σ(asset.currentValue)

// Valor total del portfolio (incluye efectivo)
totalValue = currentValue + cashBalance

// Ganancia/Pérdida del portfolio
profitLoss = currentValue - totalInvested
profitLossPercentage = (profitLoss / totalInvested) * 100
```

---

## 📦 Key Dependencies

### Frontend
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "@tanstack/react-query": "^5.15.0",
  "axios": "^1.6.2",
  "recharts": "^2.10.3",
  "@mui/material": "^5.15.0",
  "react-hook-form": "^7.49.2",
  "zod": "^3.22.4"
}
```

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express-validator": "^7.0.1",
  "winston": "^3.11.0"
}
```

---

## 🚀 Quick Start Commands

### Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (nueva terminal)
cd frontend
npm install
npm run dev
```

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend (no build, solo iniciar)
cd backend
NODE_ENV=production npm start
```

---

## 📝 Environment Variables

### Backend (`.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 🗂️ Directory Structure (Simplified)

```
PersonalFI/
├── docs/                   # Documentación completa
├── frontend/               # React app
│   └── src/
│       ├── components/     # UI components
│       ├── pages/          # Route pages
│       ├── services/       # API calls
│       └── hooks/          # Custom hooks
└── backend/                # Express API
    └── src/
        ├── models/         # Mongoose schemas
        ├── controllers/    # Route handlers
        ├── routes/         # API routes
        └── services/       # Business logic
```

---

## 🎯 Core Features Checklist

### MVP (Minimum Viable Product)
- [ ] CRUD Assets (create, read, update, delete)
- [ ] CRUD Contributions (registrar compras/ventas)
- [ ] CRUD Portfolios (crear y gestionar carteras)
- [ ] Dashboard con stats básicos
- [ ] Visualización de distribución (pie chart)
- [ ] Gráfico de rendimiento histórico
- [ ] Distribución de efectivo en portfolios

### V2 (Future Enhancements)
- [ ] Autenticación de usuarios
- [ ] Actualización automática de precios (APIs)
- [ ] Sistema de alertas
- [ ] Export/Import de datos
- [ ] Dark mode
- [ ] Multi-currency

---

## 🔗 Documentation Links

- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Arquitectura completa y detallada
- **[DATABASE_SCHEMAS.md](DATABASE_SCHEMAS.md)** - Schemas de MongoDB con ejemplos
- **[API_ENDPOINTS.md](API_ENDPOINTS.md)** - Documentación completa de API
- **[COMPONENT_FLOW.md](COMPONENT_FLOW.md)** - Flujos de UI y componentes
- **[README.md](../README.md)** - Guía de instalación y uso

---

## 📞 Support & Resources

- **Repositorio**: https://github.com/gabrielgonzl/PersonalFI
- **Issues**: https://github.com/gabrielgonzl/PersonalFI/issues
- **MongoDB Docs**: https://docs.mongodb.com/
- **React Docs**: https://react.dev/
- **Express Docs**: https://expressjs.com/

---

**Last Updated**: 2025-11-14
**Version**: 1.0.0
**Status**: Architecture Phase Complete ✅
