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
│  │  - Asset, Contribution, Portfolio, Settings,               │ │
│  │    PriceHistory, Benchmark                                 │ │
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
│  │  - pricehistories (historial OHLCV de precios)             │ │
│  │  - benchmarks    (índices de referencia)                   │ │
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
                        └──────┬───────┘
                               │ 1
                               │
                               │ N
                        ┌──────▼───────┐
                        │ PRICEHISTORY │
                        │              │
                        │ - date       │
                        │ - open/close │
                        │ - high/low   │
                        │ - volume     │
                        └──────────────┘

┌──────────────┐
│   SETTINGS   │ (Singleton)
│              │
│ - currency   │
│ - theme      │
│ - apiKeys    │
└──────────────┘

┌──────────────┐
│  BENCHMARK   │ (Independiente)
│              │
│ - name       │
│ - symbol     │
│ - category   │
│ - region     │
└──────────────┘
```

### Relaciones
- **Portfolio → Assets**: 1 a N (un portfolio contiene muchos assets)
- **Asset → Contributions**: 1 a N (un asset tiene muchas contribuciones)
- **Asset → PriceHistories**: 1 a N (un asset tiene múltiples registros de precios)
- **Portfolio ← Asset**: N a 1 (un asset puede pertenecer a un portfolio o ser independiente)
- **Benchmark**: Independiente (usado para comparación)

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

### MVP ✅ Completado (v1.1.0)
- [x] CRUD Assets (create, read, update, delete)
- [x] CRUD Contributions (registrar compras/ventas)
- [x] CRUD Portfolios (crear y gestionar carteras)
- [x] Dashboard con métricas en tiempo real
- [x] Visualización de distribución (pie chart)
- [x] Gráfico de rendimiento histórico
- [x] Distribución de efectivo en portfolios
- [x] Historial de precios OHLCV
- [x] Sistema de benchmarks
- [x] Dark mode con persistencia
- [x] Export CSV
- [x] Auto-save de formularios
- [x] Testing (Vitest + Jest)
- [x] Error boundaries
- [x] Retry logic con backoff exponencial

### V2 (Future Enhancements)
- [ ] Autenticación de usuarios (JWT)
- [ ] Actualización automática de precios (integración completa con APIs)
- [ ] Sistema de alertas y notificaciones
- [ ] Import de datos (CSV, JSON)
- [ ] Multi-currency support
- [ ] Reportes PDF

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

**Last Updated**: 2025-11-19
**Version**: 1.1.0
**Status**: MVP Complete ✅ - Production Ready
