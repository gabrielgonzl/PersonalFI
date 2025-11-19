# 🏗️ Growing - Arquitectura de la Aplicación

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Schemas de Base de Datos](#schemas-de-base-de-datos)
6. [API Endpoints](#api-endpoints)
7. [Flujo de Datos](#flujo-de-datos)
8. [Navegación y Componentes](#navegación-y-componentes)
9. [Consideraciones Técnicas](#consideraciones-técnicas)

---

## 🎯 Visión General

**Growing** es una aplicación web de tracking de inversiones personales que permite gestionar múltiples tipos de activos financieros (criptomonedas, acciones, ETFs, fondos) organizados en carteras.

### Características Principales
- Dashboard financiero con visualizaciones interactivas
- Gestión de activos múltiples con diferentes tipos
- Sistema de "Carteras" (contenedores con efectivo distribuible)
- Registro histórico de aportaciones
- Cálculo automático de rendimientos y distribución
- Interfaz responsive (móvil y desktop)
- Uso personal (sin autenticación inicial)

### Concepto "Cartera"
Una **Cartera** es un contenedor especial que:
- Agrupa múltiples activos relacionados
- Mantiene un balance de efectivo disponible
- Permite distribuir efectivo entre sus activos
- Calcula rendimiento consolidado
- Puede representar una estrategia de inversión específica

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 18+
- **Routing**: React Router v6
- **State Management**: Context API + Hooks (React Query para server state)
- **UI Components**: Material-UI (MUI) o TailwindCSS + Shadcn/ui
- **Charts**: Recharts o Chart.js
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Form Management**: React Hook Form
- **Validation**: Zod

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Validation**: Express Validator o Zod
- **CORS**: cors middleware
- **Logging**: Winston o Pino
- **Date Handling**: date-fns

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm o pnpm
- **Environment Variables**: dotenv
- **Code Quality**: ESLint + Prettier
- **Testing**: Vitest (frontend) + Jest (backend)

---

## 🏛️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐ │
│  │Dashboard │  │  Assets   │  │Portfolios│  │ Settings  │ │
│  │  View    │  │Management │  │  View    │  │   View    │ │
│  └──────────┘  └───────────┘  └──────────┘  └───────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React Query (Server State Cache)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Axios HTTP Client                       │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ REST API (JSON)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Assets  │  │Contributions│Portfolio │  │Analytics │  │
│  │  Routes  │  │   Routes   │  Routes  │  │  Routes  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Controllers & Business Logic              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Mongoose Models                      │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Mongoose ODM
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    MongoDB Atlas                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  assets  │  │contributions portfolio │  │settings  │  │
│  │collection│  │ collection │collection│  │collection│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
PersonalFI/
│
├── docs/                           # Documentación del proyecto
│   ├── ARCHITECTURE.md            # Este archivo
│   ├── API_ENDPOINTS.md           # Documentación de endpoints
│   ├── DATABASE_SCHEMAS.md        # Schemas detallados
│   └── COMPONENT_FLOW.md          # Flujos de componentes
│
├── frontend/                       # Aplicación React
│   ├── public/                    # Archivos públicos estáticos
│   │   ├── favicon.ico
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── assets/                # Imágenes, iconos, fonts
│   │   │   ├── icons/
│   │   │   └── images/
│   │   │
│   │   ├── components/            # Componentes reutilizables
│   │   │   ├── common/           # Componentes UI genéricos
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   └── Loader/
│   │   │   │
│   │   │   ├── charts/           # Componentes de gráficos
│   │   │   │   ├── LineChart/
│   │   │   │   ├── PieChart/
│   │   │   │   ├── BarChart/
│   │   │   │   └── PortfolioChart/
│   │   │   │
│   │   │   ├── layout/           # Componentes de layout
│   │   │   │   ├── Header/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── Footer/
│   │   │   │   └── MainLayout/
│   │   │   │
│   │   │   └── features/         # Componentes por feature
│   │   │       ├── AssetCard/
│   │   │       ├── AssetForm/
│   │   │       ├── ContributionForm/
│   │   │       ├── PortfolioCard/
│   │   │       └── StatsWidget/
│   │   │
│   │   ├── pages/                 # Páginas/vistas principales
│   │   │   ├── Dashboard/
│   │   │   │   ├── index.jsx
│   │   │   │   └── Dashboard.module.css
│   │   │   │
│   │   │   ├── Assets/
│   │   │   │   ├── AssetsList.jsx
│   │   │   │   ├── AssetDetail.jsx
│   │   │   │   └── CreateAsset.jsx
│   │   │   │
│   │   │   ├── Portfolios/
│   │   │   │   ├── PortfoliosList.jsx
│   │   │   │   ├── PortfolioDetail.jsx
│   │   │   │   └── CreatePortfolio.jsx
│   │   │   │
│   │   │   ├── Analytics/
│   │   │   │   └── index.jsx
│   │   │   │
│   │   │   └── Settings/
│   │   │       └── index.jsx
│   │   │
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAssets.js
│   │   │   ├── usePortfolios.js
│   │   │   ├── useContributions.js
│   │   │   ├── useAnalytics.js
│   │   │   └── useLocalStorage.js
│   │   │
│   │   ├── services/              # Servicios API
│   │   │   ├── api.js            # Configuración Axios
│   │   │   ├── assetService.js
│   │   │   ├── portfolioService.js
│   │   │   ├── contributionService.js
│   │   │   └── analyticsService.js
│   │   │
│   │   ├── context/               # Context API providers
│   │   │   ├── AppContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── utils/                 # Utilidades y helpers
│   │   │   ├── formatters.js     # Formato de números, fechas
│   │   │   ├── calculations.js   # Cálculos financieros
│   │   │   ├── validators.js     # Validaciones
│   │   │   └── constants.js      # Constantes globales
│   │   │
│   │   ├── styles/                # Estilos globales
│   │   │   ├── global.css
│   │   │   ├── variables.css
│   │   │   └── theme.js
│   │   │
│   │   ├── App.jsx                # Componente raíz
│   │   ├── main.jsx              # Entry point
│   │   └── router.jsx            # Configuración de rutas
│   │
│   ├── .env.example              # Variables de entorno ejemplo
│   ├── .eslintrc.json            # Configuración ESLint
│   ├── .prettierrc               # Configuración Prettier
│   ├── package.json
│   ├── vite.config.js            # Configuración Vite
│   └── index.html
│
├── backend/                        # API Node.js/Express
│   ├── src/
│   │   ├── config/                # Configuraciones
│   │   │   ├── database.js       # Conexión MongoDB
│   │   │   ├── constants.js      # Constantes del servidor
│   │   │   └── logger.js         # Configuración de logging
│   │   │
│   │   ├── models/                # Modelos Mongoose
│   │   │   ├── Asset.js
│   │   │   ├── Contribution.js
│   │   │   ├── Portfolio.js
│   │   │   └── Settings.js
│   │   │
│   │   ├── controllers/           # Controladores
│   │   │   ├── assetController.js
│   │   │   ├── contributionController.js
│   │   │   ├── portfolioController.js
│   │   │   └── analyticsController.js
│   │   │
│   │   ├── routes/                # Definición de rutas
│   │   │   ├── index.js
│   │   │   ├── assets.js
│   │   │   ├── contributions.js
│   │   │   ├── portfolios.js
│   │   │   └── analytics.js
│   │   │
│   │   ├── middleware/            # Middlewares personalizados
│   │   │   ├── errorHandler.js
│   │   │   ├── validator.js
│   │   │   └── logger.js
│   │   │
│   │   ├── services/              # Lógica de negocio
│   │   │   ├── assetService.js
│   │   │   ├── portfolioService.js
│   │   │   ├── calculationService.js
│   │   │   └── analyticsService.js
│   │   │
│   │   ├── utils/                 # Utilidades
│   │   │   ├── calculations.js   # Fórmulas financieras
│   │   │   ├── validators.js     # Validadores
│   │   │   └── helpers.js        # Funciones auxiliares
│   │   │
│   │   ├── app.js                 # Configuración Express
│   │   └── server.js             # Entry point del servidor
│   │
│   ├── tests/                     # Tests
│   │   ├── unit/
│   │   │   ├── models/
│   │   │   ├── controllers/
│   │   │   └── services/
│   │   │
│   │   └── integration/
│   │       └── api/
│   │
│   ├── .env.example              # Variables de entorno ejemplo
│   ├── .eslintrc.json
│   ├── package.json
│   └── jest.config.js
│
├── .gitignore                     # Archivos ignorados por Git
├── README.md                      # Documentación principal
└── package.json                   # Scripts del proyecto raíz

```

---

## 🗄️ Schemas de Base de Datos

**Colecciones MongoDB**: 6 colecciones principales
- `assets` - Activos financieros individuales
- `contributions` - Historial de transacciones
- `portfolios` - Carteras de inversión
- `settings` - Configuración global
- `pricehistories` - Historial de precios OHLCV
- `benchmarks` - Índices de referencia

### 1. Asset (Activo Individual)

Un activo representa una inversión específica (crypto, acción, ETF, fondo).

```javascript
{
  _id: ObjectId,
  name: String,                    // Nombre del activo (ej: "Bitcoin", "Apple")
  symbol: String,                  // Símbolo (ej: "BTC", "AAPL")
  type: String,                    // Enum: ['crypto', 'stock', 'etf', 'fund', 'other']
  currency: String,                // Moneda del activo (ej: "USD", "EUR")

  // Información financiera
  totalInvested: Number,           // Total aportado (suma de contributions)
  currentValue: Number,            // Valor actual (calculado)
  quantity: Number,                // Cantidad total de unidades
  averagePrice: Number,            // Precio promedio de compra
  currentPrice: Number,            // Precio actual por unidad

  // Métricas
  profitLoss: Number,              // Ganancia/Pérdida absoluta
  profitLossPercentage: Number,    // Ganancia/Pérdida porcentual

  // Relaciones
  portfolioId: ObjectId,           // Referencia a Portfolio (null si independiente)

  // Metadata
  notes: String,                   // Notas del usuario
  color: String,                   // Color para visualización (#hex)
  icon: String,                    // URL o nombre de icono

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastPriceUpdate: Date           // Última actualización de precio
}
```

**Índices:**
- `{ type: 1 }` - Búsqueda por tipo
- `{ portfolioId: 1 }` - Búsqueda por portfolio
- `{ symbol: 1 }` - Búsqueda por símbolo
- `{ createdAt: -1 }` - Ordenamiento temporal

---

### 2. Contribution (Aportación)

Registro histórico de compras/ventas de un activo.

```javascript
{
  _id: ObjectId,
  assetId: ObjectId,               // Referencia al Asset

  // Datos de la transacción
  date: Date,                      // Fecha de la transacción
  type: String,                    // Enum: ['buy', 'sell', 'transfer']
  quantity: Number,                // Cantidad de unidades
  pricePerUnit: Number,            // Precio por unidad
  totalAmount: Number,             // Monto total (quantity * pricePerUnit)

  // Costos adicionales
  fees: Number,                    // Comisiones pagadas

  // Metadata
  notes: String,                   // Notas de la transacción
  source: String,                  // Exchange/broker (ej: "Binance", "Interactive Brokers")

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `{ assetId: 1, date: -1 }` - Histórico por asset
- `{ date: -1 }` - Ordenamiento por fecha
- `{ type: 1 }` - Filtrado por tipo

---

### 3. Portfolio (Cartera)

Contenedor de múltiples activos con efectivo disponible.

```javascript
{
  _id: ObjectId,
  name: String,                    // Nombre de la cartera (ej: "Cartera Crypto")
  description: String,             // Descripción de la estrategia

  // Información financiera
  cashBalance: Number,             // Efectivo disponible en la cartera
  currency: String,                // Moneda de la cartera (ej: "USD")

  totalInvested: Number,           // Total invertido (suma de assets)
  currentValue: Number,            // Valor actual (calculado)
  totalValue: Number,              // Valor total (currentValue + cashBalance)

  // Métricas consolidadas
  profitLoss: Number,              // Ganancia/Pérdida total
  profitLossPercentage: Number,    // Porcentaje de rendimiento

  // Configuración
  targetAllocation: [{             // Distribución objetivo (opcional)
    assetId: ObjectId,
    percentage: Number             // Porcentaje objetivo (0-100)
  }],

  // Visual
  color: String,                   // Color para identificación
  icon: String,                    // Icono representativo

  // Metadata
  isActive: Boolean,               // Si la cartera está activa

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastRebalanceDate: Date         // Última vez que se rebalanceó
}
```

**Índices:**
- `{ isActive: 1 }` - Carteras activas
- `{ createdAt: -1 }` - Ordenamiento temporal

**Virtuals (campos calculados):**
- `assets` - Población de todos los assets con `portfolioId === _id`
- `assetCount` - Número de activos en la cartera

---

### 4. Settings (Configuración Global)

Configuración de la aplicación (colección singleton).

```javascript
{
  _id: ObjectId,

  // Preferencias de usuario
  defaultCurrency: String,         // Moneda predeterminada (ej: "USD")
  language: String,                // Idioma (ej: "es", "en")

  // Configuración de visualización
  theme: String,                   // Enum: ['light', 'dark', 'auto']
  chartType: String,               // Tipo de gráfico preferido

  // Configuración de actualización de precios
  priceUpdateInterval: Number,     // Minutos entre actualizaciones
  priceApiProvider: String,        // API de precios (ej: "coingecko", "alphavantage")
  apiKeys: {
    coingecko: String,
    alphavantage: String,
    // Más APIs según necesidad
  },

  // Notificaciones (futuro)
  notifications: {
    priceAlerts: Boolean,
    portfolioRebalance: Boolean,
    profitLossThreshold: Number
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

### 5. PriceHistory (Historial de Precios)

Almacena historial de precios OHLCV para análisis técnico.

```javascript
{
  _id: ObjectId,
  assetId: ObjectId,               // Referencia al Asset
  date: Date,                      // Fecha del registro

  // Datos OHLCV
  open: Number,                    // Precio de apertura
  high: Number,                    // Precio máximo
  low: Number,                     // Precio mínimo
  close: Number,                   // Precio de cierre
  volume: Number,                  // Volumen de trading

  // Metadata
  source: String,                  // Enum: ['manual', 'yahoo', 'coingecko',
                                   //        'alphavantage', 'rapidapi', 'steadyapi']
  currency: String,                // Moneda (ej: "USD", "EUR")

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `{ assetId: 1, date: -1 }` - Historial por activo
- `{ date: -1 }` - Ordenamiento temporal

**Métodos estáticos:**
- `getPriceAtDate(assetId, date)` - Obtener precio en fecha específica
- `getPriceRange(assetId, startDate, endDate)` - Rango de precios
- `getLatestPrice(assetId)` - Último precio conocido
- `aggregateByGranularity(assetId, start, end, granularity)` - Agregar por día/semana/mes
- `calculateReturns(assetId, start, end)` - Calcular retornos diarios
- `bulkInsertPrices(pricesArray)` - Inserción masiva optimizada

---

### 6. Benchmark (Índice de Referencia)

Índices de mercado para comparación (S&P 500, EUROSTOXX 50, etc.).

```javascript
{
  _id: ObjectId,
  name: String,                    // Nombre completo (ej: "S&P 500")
  symbol: String,                  // Símbolo único (ej: "SPX", "^GSPC")
  description: String,             // Descripción del índice

  // Clasificación
  category: String,                // Enum: ['stocks', 'bonds', 'crypto',
                                   //        'commodities', 'mixed', 'other']
  region: String,                  // Enum: ['us', 'europe', 'asia',
                                   //        'global', 'emerging', 'other']
  currency: String,                // Moneda del índice

  // Estado
  isActive: Boolean,               // Si está activo para uso

  // API externa
  externalId: String,              // ID en sistema externo
  dataSource: String,              // Enum: ['yahoo', 'alphavantage', 'manual']

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `{ symbol: 1 }` - Búsqueda por símbolo (único)
- `{ category: 1, isActive: 1 }` - Filtrado por categoría
- `{ region: 1 }` - Filtrado por región

**Métodos estáticos:**
- `getActive()` - Obtener benchmarks activos
- `getBySymbol(symbol)` - Buscar por símbolo
- `getByCategory(category)` - Filtrar por categoría

**Nota**: Los precios históricos de benchmarks se almacenan en `PriceHistory` vinculados por `assetId` (el benchmark se trata como un asset especial para el historial de precios).

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### 1. Assets Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/assets` | Obtener todos los activos |
| GET | `/assets/:id` | Obtener un activo específico |
| POST | `/assets` | Crear nuevo activo |
| PUT | `/assets/:id` | Actualizar activo |
| DELETE | `/assets/:id` | Eliminar activo |
| GET | `/assets/:id/contributions` | Obtener aportaciones de un activo |
| GET | `/assets/:id/performance` | Obtener métricas de rendimiento |
| POST | `/assets/:id/update-price` | Actualizar precio actual |

### 2. Contributions Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/contributions` | Obtener todas las aportaciones |
| GET | `/contributions/:id` | Obtener una aportación específica |
| POST | `/contributions` | Registrar nueva aportación |
| PUT | `/contributions/:id` | Actualizar aportación |
| DELETE | `/contributions/:id` | Eliminar aportación |
| GET | `/contributions/date-range` | Filtrar por rango de fechas |

### 3. Portfolios Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/portfolios` | Obtener todas las carteras |
| GET | `/portfolios/:id` | Obtener cartera específica con assets |
| POST | `/portfolios` | Crear nueva cartera |
| PUT | `/portfolios/:id` | Actualizar cartera |
| DELETE | `/portfolios/:id` | Eliminar cartera |
| POST | `/portfolios/:id/add-cash` | Agregar efectivo a la cartera |
| POST | `/portfolios/:id/distribute-cash` | Distribuir efectivo entre assets |
| GET | `/portfolios/:id/allocation` | Obtener distribución de la cartera |
| POST | `/portfolios/:id/rebalance` | Rebalancear según target allocation |

### 4. Prices Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/prices/:assetId` | Obtener historial de precios de un asset |
| POST | `/prices/:assetId` | Agregar precio manual |
| GET | `/prices/:assetId/latest` | Obtener último precio conocido |
| POST | `/prices/fetch` | Actualizar precios desde API externa |
| DELETE | `/prices/:id` | Eliminar registro de precio |

### 5. Analytics Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/analytics/overview` | Dashboard global (totales, métricas) |
| GET | `/analytics/performance` | Rendimiento histórico |
| GET | `/analytics/distribution` | Distribución por tipo/cartera |
| GET | `/analytics/timeline` | Línea de tiempo de inversiones |
| GET | `/analytics/top-performers` | Mejores activos por rendimiento |

### 6. Settings Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/settings` | Obtener configuración actual |
| PUT | `/settings` | Actualizar configuración |

---

## 🔄 Flujo de Datos

### 1. Flujo de Creación de Activo

```
Usuario → AssetForm Component
           ↓
  Validación (React Hook Form + Zod)
           ↓
  assetService.createAsset()
           ↓
  POST /api/v1/assets
           ↓
  Backend Controller
           ↓
  Asset.create() (Mongoose)
           ↓
  MongoDB Atlas
           ↓
  Response → React Query Cache
           ↓
  UI Update (Optimistic UI)
```

### 2. Flujo de Registro de Aportación

```
Usuario → ContributionForm
           ↓
  Validación de datos
           ↓
  POST /api/v1/contributions
           ↓
  Backend:
    1. Crear Contribution
    2. Actualizar Asset.totalInvested
    3. Actualizar Asset.quantity
    4. Recalcular Asset.averagePrice
    5. Si hay Portfolio, actualizar Portfolio.totalInvested
           ↓
  Response → Actualizar múltiples queries
           ↓
  UI Update: Asset detail + Portfolio summary
```

### 3. Flujo de Distribución de Efectivo en Cartera

```
Usuario → PortfolioDetail → "Distribuir Efectivo"
           ↓
  Modal con lista de assets en la cartera
           ↓
  Usuario asigna montos a cada asset
           ↓
  POST /api/v1/portfolios/:id/distribute-cash
           ↓
  Backend:
    1. Validar que suma no exceda cashBalance
    2. Crear Contributions para cada asset
    3. Actualizar Assets (quantity, totalInvested)
    4. Reducir Portfolio.cashBalance
    5. Recalcular métricas
           ↓
  Response → Invalidar queries relacionadas
           ↓
  UI Update: Portfolio + Assets afectados
```

### 4. Flujo de Actualización de Dashboard

```
Usuario accede a Dashboard
           ↓
  React Query ejecuta queries en paralelo:
    - GET /api/v1/analytics/overview
    - GET /api/v1/portfolios
    - GET /api/v1/assets
    - GET /api/v1/analytics/performance
           ↓
  Backend calcula métricas en tiempo real
           ↓
  Responses → Cache de React Query
           ↓
  Renderizado de componentes:
    - StatsWidget (totales)
    - PortfolioChart (distribución)
    - LineChart (rendimiento histórico)
    - AssetsList (tabla de activos)
```

---

## 🗺️ Navegación y Componentes

### Estructura de Rutas

```
/                                   → Dashboard (página principal)
/assets                             → Lista de todos los activos
/assets/create                      → Crear nuevo activo
/assets/:id                         → Detalle de activo individual
/assets/:id/edit                    → Editar activo

/portfolios                         → Lista de carteras
/portfolios/create                  → Crear nueva cartera
/portfolios/:id                     → Detalle de cartera con assets
/portfolios/:id/edit                → Editar cartera

/analytics                          → Vista de análisis avanzado
/settings                           → Configuración de la app
```

### Jerarquía de Componentes (Dashboard)

```
<App>
  <MainLayout>
    <Header>
      - Logo
      - Navigation Menu
      - Settings Icon
    </Header>

    <Sidebar>
      - NavLinks
      - Active Portfolio Selector
    </Sidebar>

    <main>
      <Dashboard>
        <StatsGrid>
          <StatCard title="Valor Total" />
          <StatCard title="Ganancia/Pérdida" />
          <StatCard title="Rendimiento %" />
          <StatCard title="Número de Activos" />
        </StatsGrid>

        <ChartsSection>
          <PortfolioPieChart />          // Distribución por activo
          <PerformanceLineChart />       // Evolución temporal
        </ChartsSection>

        <PortfoliosOverview>
          {portfolios.map(p => (
            <PortfolioCard
              key={p.id}
              portfolio={p}
              onDistributeCash={handleDistribute}
            />
          ))}
        </PortfoliosOverview>

        <AssetsTable
          assets={assets}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Dashboard>
    </main>
  </MainLayout>
</App>
```

### Estados de la Aplicación

#### 1. Context Global (AppContext)
```javascript
{
  portfolios: [],
  assets: [],
  settings: {},
  totalValue: 0,
  totalInvested: 0,
  profitLoss: 0
}
```

#### 2. React Query Keys
```javascript
// Assets
['assets']                          // Lista de todos
['assets', assetId]                 // Asset individual
['assets', assetId, 'contributions'] // Aportaciones

// Portfolios
['portfolios']                      // Lista de todos
['portfolios', portfolioId]         // Portfolio individual

// Analytics
['analytics', 'overview']
['analytics', 'performance', dateRange]
```

---

## ⚙️ Consideraciones Técnicas

### 1. Cálculos Financieros

#### Precio Promedio (Average Price)
```
averagePrice = totalInvested / quantity
```

#### Ganancia/Pérdida
```
profitLoss = currentValue - totalInvested
currentValue = quantity * currentPrice
```

#### Rendimiento Porcentual
```
profitLossPercentage = (profitLoss / totalInvested) * 100
```

#### Valor de Portfolio
```
totalValue = cashBalance + Σ(asset.currentValue)
```

### 2. Actualización de Precios

**Estrategias:**
1. **Manual**: Usuario actualiza precio desde UI
2. **API Externa** (futuro):
   - Crypto: CoinGecko API / CoinMarketCap
   - Stocks: Alpha Vantage / Yahoo Finance
   - Polling cada X minutos (configurable)

### 3. Validaciones Críticas

#### Backend
- Total de distribución ≤ cashBalance
- Quantity > 0 en compras
- pricePerUnit > 0
- No eliminar Portfolio si tiene Assets asociados
- No eliminar Asset si tiene Contributions

#### Frontend
- Validar números positivos
- Validar fechas (no futuras)
- Confirmar eliminaciones
- Validar distribución antes de enviar

### 4. Optimizaciones

#### Performance
- **Índices MongoDB**: Según queries frecuentes
- **Paginación**: En listas de contributions (pueden ser muchas)
- **Agregaciones**: Cálculos de analytics en MongoDB
- **React Query**: Cache y stale time configurados
- **Lazy Loading**: Componentes de rutas con React.lazy()

#### SEO (futuro)
- React Helmet para metadata
- Server-side rendering con Next.js (migración futura)

### 5. Seguridad

**Actual (sin auth):**
- CORS configurado para frontend específico
- Validación de inputs (prevenir injection)
- Rate limiting en API
- Helmet.js para headers HTTP

**Futuro (con auth):**
- JWT authentication
- Role-based access control (RBAC)
- Encriptación de API keys en Settings

### 6. Testing

#### Frontend
- **Unit**: Componentes con Vitest + React Testing Library
- **Integration**: Flujos completos (ej: crear activo + aportación)
- **E2E**: Cypress para flows críticos

#### Backend
- **Unit**: Services y utils
- **Integration**: Endpoints con Supertest
- **Database**: MongoDB Memory Server para tests

### 7. Deployment (futuro)

#### Frontend
- **Hosting**: Vercel / Netlify
- **Build**: `npm run build`
- **Env vars**: Configuradas en plataforma

#### Backend
- **Hosting**: Railway / Render / Fly.io
- **Database**: MongoDB Atlas (cloud)
- **Env vars**: .env en servidor

#### CI/CD
- GitHub Actions
- Tests automáticos en PRs
- Deploy automático en merge a main

---

## 🚀 Próximos Pasos

### Fase 1: Setup Inicial
1. Inicializar proyecto monorepo
2. Configurar frontend (Vite + React)
3. Configurar backend (Express + MongoDB)
4. Establecer conexión DB

### Fase 2: Core Features
1. Implementar modelos de datos
2. Crear API endpoints básicos (Assets, Contributions)
3. Desarrollar componentes UI principales
4. Integrar frontend con backend

### Fase 3: Portfolio System
1. Implementar modelo Portfolio
2. Sistema de distribución de efectivo
3. Cálculos de métricas consolidadas
4. UI de gestión de carteras

### Fase 4: Analytics & Charts
1. Endpoints de analytics
2. Componentes de visualización
3. Dashboard completo
4. Reportes de rendimiento

### Fase 5: Polish & Features
1. Actualización automática de precios
2. Sistema de notificaciones
3. Export/Import de datos
4. Responsive design refinement

---

## 📚 Referencias

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [React Query](https://tanstack.com/query/latest)
- [Vite Guide](https://vitejs.dev/)

---

**Documento creado por**: Claude (AI Project Manager & Software Architect)
**Fecha**: 2025-11-19
**Versión**: 1.1.0
