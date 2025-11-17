# 📋 TODO - Growing Project Fixes

**Fecha**: 2025-11-14
**Estado**: 🔴 CRÍTICO - Requiere atención inmediata

---

## 🚨 PROBLEMAS ACTUALES REPORTADOS

1. ❌ El dashboard es horrible/no se ve bien
2. ❌ Los seeders no funcionan
3. ❌ No puedo crear portfolios ni assets
4. ❌ Necesito EUR y español por defecto
5. ❌ No me deja cambiar la moneda

---

## 🎯 PLAN DE ACCIÓN

### FASE 1: CONFIGURACIÓN BÁSICA (CRÍTICO)

#### ✅ Task 1.1: Crear archivos .env
**Archivos**: `backend/.env`, `frontend/.env`

**Backend (.env)**:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/growing
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env)**:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Growing
VITE_APP_VERSION=1.0.0
```

---

#### ✅ Task 1.2: Cambiar moneda por defecto a EUR

**Archivos a modificar**:
1. `backend/src/models/Asset.js` línea 33
2. `backend/src/models/Portfolio.js` línea 28
3. `backend/src/models/Settings.js` línea 10
4. `frontend/src/config/constants.js` línea 47
5. `frontend/src/context/AppContext.jsx` línea 27

**Cambios**:
```javascript
// ANTES:
default: 'USD',
CURRENCIES = ['USD', 'EUR', ...];

// DESPUÉS:
default: 'EUR',
CURRENCIES = ['EUR', 'USD', ...];
```

---

#### ✅ Task 1.3: Cambiar idioma por defecto a Español

**Archivos a modificar**:
1. `frontend/src/config/constants.js` líneas 117-122
2. `frontend/src/context/AppContext.jsx` línea 22

**Cambios**:
```javascript
// ANTES:
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  // ...
};

return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || LANGUAGES.EN;

// DESPUÉS:
export const LANGUAGES = {
  ES: 'es',
  EN: 'en',
  // ...
};

return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || LANGUAGES.ES;
```

---

### FASE 2: TRADUCCIÓN AL ESPAÑOL (ALTA PRIORIDAD)

#### ✅ Task 2.1: Traducir labels de tipos de activos
**Archivo**: `frontend/src/config/constants.js` líneas 20-29

```javascript
export const ASSET_TYPE_LABELS = {
  [ASSET_TYPES.CRYPTO]: 'Criptomoneda',
  [ASSET_TYPES.STOCK]: 'Acción',
  [ASSET_TYPES.ETF]: 'ETF',
  [ASSET_TYPES.FUND]: 'Fondo',
  [ASSET_TYPES.BOND]: 'Bono',
  [ASSET_TYPES.COMMODITY]: 'Commodity',
  [ASSET_TYPES.REAL_ESTATE]: 'Inmobiliario',
  [ASSET_TYPES.OTHER]: 'Otro',
};
```

---

#### ✅ Task 2.2: Traducir labels de tipos de contribución
**Archivo**: `frontend/src/config/constants.js` líneas 39-44

```javascript
export const CONTRIBUTION_TYPE_LABELS = {
  [CONTRIBUTION_TYPES.BUY]: 'Compra',
  [CONTRIBUTION_TYPES.SELL]: 'Venta',
  [CONTRIBUTION_TYPES.TRANSFER_IN]: 'Transferencia Entrante',
  [CONTRIBUTION_TYPES.TRANSFER_OUT]: 'Transferencia Saliente',
};
```

---

#### ✅ Task 2.3: Traducir labels de rangos de fecha
**Archivo**: `frontend/src/config/constants.js` líneas 60-68

```javascript
export const DATE_RANGE_LABELS = {
  [DATE_RANGES.TODAY]: 'Hoy',
  [DATE_RANGES.WEEK]: '1 Semana',
  [DATE_RANGES.MONTH]: '1 Mes',
  [DATE_RANGES.THREE_MONTHS]: '3 Meses',
  [DATE_RANGES.SIX_MONTHS]: '6 Meses',
  [DATE_RANGES.YEAR]: '1 Año',
  [DATE_RANGES.ALL]: 'Todo el Tiempo',
};
```

---

#### ✅ Task 2.4: Traducir labels de idiomas
**Archivo**: `frontend/src/config/constants.js` líneas 124-129

```javascript
export const LANGUAGE_LABELS = {
  [LANGUAGES.ES]: 'Español',
  [LANGUAGES.EN]: 'Inglés',
  [LANGUAGES.FR]: 'Francés',
  [LANGUAGES.DE]: 'Alemán',
};
```

---

#### ✅ Task 2.5: Traducir Dashboard
**Archivo**: `frontend/src/pages/Dashboard/Dashboard.jsx`

**Textos a traducir**:
```javascript
// Línea 49: "Dashboard" → "Panel de Control"
// Línea 50: "Welcome to your investment tracker" → "Bienvenido a tu rastreador de inversiones"
// Línea 59: "New Portfolio" → "Nueva Cartera"
// Línea 65: "New Asset" → "Nuevo Activo"
// Línea 74: "Total Portfolio Value" → "Valor Total de la Cartera"
// Línea 82: "Total Invested" → "Total Invertido"
// Línea 89: "Total Profit/Loss" → "Ganancia/Pérdida Total"
// Línea 97: "Number of Assets" → "Número de Activos"
// Línea 108: "Portfolio Performance" → "Rendimiento de la Cartera"
// Línea 108: "Last 30 days" → "Últimos 30 días"
// Línea 120: "No performance data" → "Sin datos de rendimiento"
// Línea 121: "Start adding assets..." → "Comienza añadiendo activos para ver el rendimiento de tu cartera"
// Línea 127: "Asset Distribution" → "Distribución de Activos"
// Línea 127: "By type" → "Por tipo"
// Línea 140: "No distribution data" → "Sin datos de distribución"
// Línea 141: "Add assets to see..." → "Añade activos para ver el desglose de distribución"
// Línea 151: "Your Portfolios" → "Tus Carteras"
// Línea 153: "View All" → "Ver Todo"
// Línea 172: "Recent Assets" → "Activos Recientes"
// Línea 194: "Welcome to Growing!" → "¡Bienvenido a Growing!"
// Línea 195: "Start tracking..." → "Comienza a rastrear tus inversiones creando tu primera cartera o añadiendo un activo"
// Línea 203: "Create Portfolio" → "Crear Cartera"
// Línea 208: "Add Asset" → "Añadir Activo"
```

---

#### ✅ Task 2.6: Traducir CreateAsset
**Archivo**: `frontend/src/pages/Assets/CreateAsset.jsx`

**Textos a traducir**:
```javascript
// Línea 49: "Asset created successfully" → "Activo creado exitosamente"
// Línea 52: "Failed to create asset" → "Error al crear el activo"
// Línea 64: "No Portfolio (Independent)" → "Sin Cartera (Independiente)"
// Línea 76: "Create New Asset" → "Crear Nuevo Activo"
// Línea 77: "Add a new investment asset..." → "Añade un nuevo activo de inversión a tu cartera"
// Línea 86: "Asset Name *" → "Nombre del Activo *"
// Línea 89: "e.g., Bitcoin, Apple Inc." → "ej., Bitcoin, Apple Inc."
// Línea 93: "Symbol *" → "Símbolo *"
// Línea 96: "e.g., BTC, AAPL" → "ej., BTC, AAPL"
// Y todos los demás labels del formulario
```

---

#### ✅ Task 2.7: Traducir CreatePortfolio
**Archivo**: `frontend/src/pages/Portfolios/CreatePortfolio.jsx`

**Textos a traducir**:
```javascript
// Línea 42: "Portfolio created successfully" → "Cartera creada exitosamente"
// Línea 45: "Failed to create portfolio" → "Error al crear la cartera"
// Línea 59: "Create New Portfolio" → "Crear Nueva Cartera"
// Línea 60: "Organize your investments..." → "Organiza tus inversiones en una cartera"
// Línea 68: "Portfolio Name *" → "Nombre de la Cartera *"
// Línea 71: "e.g., My Crypto Portfolio..." → "ej., Mi Cartera Crypto, Fondo de Retiro"
// Línea 75: "Description" → "Descripción"
// Línea 78: "Optional description..." → "Descripción opcional para esta cartera"
// Y todos los demás labels
```

---

#### ✅ Task 2.8: Traducir AssetsList
**Archivo**: `frontend/src/pages/Assets/AssetsList.jsx`

#### ✅ Task 2.9: Traducir PortfoliosList
**Archivo**: `frontend/src/pages/Portfolios/PortfoliosList.jsx`

#### ✅ Task 2.10: Traducir Analytics
**Archivo**: `frontend/src/pages/Analytics/Analytics.jsx`

#### ✅ Task 2.11: Traducir Settings
**Archivo**: `frontend/src/pages/Settings/Settings.jsx`

#### ✅ Task 2.12: Traducir Layout y Sidebar
**Archivos**:
- `frontend/src/components/layout/Header.jsx`
- `frontend/src/components/layout/Sidebar.jsx`

#### ✅ Task 2.13: Traducir componentes comunes
**Archivos**:
- `frontend/src/components/common/EmptyState.jsx`
- `frontend/src/components/common/ErrorMessage.jsx`
- `frontend/src/components/common/Loading.jsx`

---

### FASE 3: SEEDER DE DATOS (CRÍTICO)

#### ✅ Task 3.1: Crear archivo seeder
**Archivo**: `backend/src/scripts/seed.js`

**Contenido**:
```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Asset, Portfolio, Contribution, Settings } from '../models/index.js';
import logger from '../config/logger.js';

dotenv.config();

const seedData = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await Promise.all([
      Asset.deleteMany({}),
      Portfolio.deleteMany({}),
      Contribution.deleteMany({}),
      Settings.deleteMany({}),
    ]);
    logger.info('🗑️  Datos anteriores eliminados');

    // Crear Settings
    const settings = await Settings.create({
      defaultCurrency: 'EUR',
      language: 'es',
      theme: 'light',
    });
    logger.info('⚙️  Settings creados');

    // Crear Portfolios
    const cryptoPortfolio = await Portfolio.create({
      name: 'Cartera Crypto',
      description: 'Inversiones en criptomonedas',
      cashBalance: 10000,
      currency: 'EUR',
      color: '#8B5CF6',
    });

    const stocksPortfolio = await Portfolio.create({
      name: 'Cartera Acciones',
      description: 'Inversiones en bolsa',
      cashBalance: 5000,
      currency: 'EUR',
      color: '#0ea5e9',
    });

    logger.info('📁 2 Portfolios creados');

    // Crear Assets
    const bitcoin = await Asset.create({
      name: 'Bitcoin',
      symbol: 'BTC',
      type: 'crypto',
      currency: 'EUR',
      currentPrice: 38000,
      quantity: 0.5,
      totalInvested: 15000,
      portfolioId: cryptoPortfolio._id,
      color: '#F7931A',
    });

    const ethereum = await Asset.create({
      name: 'Ethereum',
      symbol: 'ETH',
      type: 'crypto',
      currency: 'EUR',
      currentPrice: 2200,
      quantity: 5,
      totalInvested: 9000,
      portfolioId: cryptoPortfolio._id,
      color: '#627EEA',
    });

    const apple = await Asset.create({
      name: 'Apple Inc.',
      symbol: 'AAPL',
      type: 'stock',
      currency: 'EUR',
      currentPrice: 160,
      quantity: 50,
      totalInvested: 7500,
      portfolioId: stocksPortfolio._id,
      color: '#A2AAAD',
    });

    const microsoft = await Asset.create({
      name: 'Microsoft',
      symbol: 'MSFT',
      type: 'stock',
      currency: 'EUR',
      currentPrice: 340,
      quantity: 20,
      totalInvested: 6500,
      portfolioId: stocksPortfolio._id,
      color: '#00A4EF',
    });

    const vanguard = await Asset.create({
      name: 'Vanguard S&P 500 ETF',
      symbol: 'VOO',
      type: 'etf',
      currency: 'EUR',
      currentPrice: 380,
      quantity: 15,
      totalInvested: 5400,
      color: '#B41E20',
    });

    logger.info('💰 5 Assets creados');

    // Crear Contributions
    const contributions = await Contribution.insertMany([
      // Bitcoin
      {
        assetId: bitcoin._id,
        date: new Date('2024-01-15'),
        type: 'buy',
        quantity: 0.25,
        pricePerUnit: 35000,
        totalAmount: 8750,
        fees: 50,
      },
      {
        assetId: bitcoin._id,
        date: new Date('2024-06-10'),
        type: 'buy',
        quantity: 0.25,
        pricePerUnit: 25000,
        totalAmount: 6250,
        fees: 0,
      },

      // Ethereum
      {
        assetId: ethereum._id,
        date: new Date('2024-02-01'),
        type: 'buy',
        quantity: 3,
        pricePerUnit: 1800,
        totalAmount: 5400,
        fees: 30,
      },
      {
        assetId: ethereum._id,
        date: new Date('2024-07-20'),
        type: 'buy',
        quantity: 2,
        pricePerUnit: 1800,
        totalAmount: 3600,
        fees: 0,
      },

      // Apple
      {
        assetId: apple._id,
        date: new Date('2024-03-05'),
        type: 'buy',
        quantity: 50,
        pricePerUnit: 150,
        totalAmount: 7500,
        fees: 10,
      },

      // Microsoft
      {
        assetId: microsoft._id,
        date: new Date('2024-04-12'),
        type: 'buy',
        quantity: 20,
        pricePerUnit: 325,
        totalAmount: 6500,
        fees: 10,
      },

      // Vanguard
      {
        assetId: vanguard._id,
        date: new Date('2024-05-18'),
        type: 'buy',
        quantity: 15,
        pricePerUnit: 360,
        totalAmount: 5400,
        fees: 0,
      },
    ]);

    logger.info(`📊 ${contributions.length} Contributions creadas`);

    // Recalcular métricas de portfolios
    await Portfolio.recalculateMetrics(cryptoPortfolio._id);
    await Portfolio.recalculateMetrics(stocksPortfolio._id);

    logger.info('✅ Métricas recalculadas');
    logger.info('🎉 ¡Seeder completado exitosamente!');
    logger.info('\n📈 Resumen:');
    logger.info(`   - 2 Portfolios`);
    logger.info(`   - 5 Assets`);
    logger.info(`   - ${contributions.length} Contributions`);
    logger.info(`   - 1 Settings\n`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error en seeder:', error);
    process.exit(1);
  }
};

seedData();
```

---

#### ✅ Task 3.2: Actualizar package.json script
**Archivo**: `backend/package.json`

**Agregar script**:
```json
{
  "scripts": {
    "seed": "node src/scripts/seed.js"
  }
}
```

---

### FASE 4: MEJORAR DASHBOARD (ALTA PRIORIDAD)

#### ✅ Task 4.1: Mejorar MetricCard component
**Archivo**: `frontend/src/components/features/MetricCard.jsx`

**Mejoras**:
- Hacer cards más grandes y visuales
- Añadir gradientes de color
- Mejorar tipografía (valores más grandes)
- Añadir animaciones sutiles
- Iconos más prominentes
- Indicadores de tendencia más claros

---

#### ✅ Task 4.2: Mejorar paleta de colores
**Archivo**: `frontend/tailwind.config.js` o `frontend/src/styles/index.css`

**Nueva paleta moderna**:
```javascript
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Azul principal
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  success: {
    500: '#10b981',
    600: '#059669',
  },
  danger: {
    500: '#ef4444',
    600: '#dc2626',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  purple: {
    500: '#8b5cf6',
    600: '#7c3aed',
  },
}
```

---

#### ✅ Task 4.3: Mejorar gráficos
**Archivos**:
- `frontend/src/components/charts/LineChart.jsx`
- `frontend/src/components/charts/PieChart.jsx`

**Mejoras**:
- Colores más vibrantes
- Animaciones al cargar
- Tooltips mejorados en español
- Leyendas más claras

---

#### ✅ Task 4.4: Mejorar responsive del Dashboard
**Archivo**: `frontend/src/pages/Dashboard/Dashboard.jsx`

**Mejoras**:
- Grid más adaptativo en mobile
- Cards que se apilen bien
- Botones que no se corten
- Espaciado optimizado

---

### FASE 5: VERIFICAR Y CORREGIR FORMULARIOS (CRÍTICO)

#### ✅ Task 5.1: Verificar validaciones en CreateAsset
**Archivo**: `frontend/src/utils/validators.js`

**Verificar**:
- Schema de Zod esté completo
- Mensajes de error en español
- Validaciones de campos requeridos

---

#### ✅ Task 5.2: Verificar validaciones en CreatePortfolio
**Archivo**: `frontend/src/utils/validators.js`

**Verificar**:
- Schema de Zod para portfolio
- Mensajes de error en español
- Validación de cashBalance

---

#### ✅ Task 5.3: Probar integración con API
**Testing manual**:
1. Crear portfolio desde UI
2. Crear asset desde UI
3. Verificar que se guarden en MongoDB
4. Verificar que aparezcan en Dashboard

---

#### ✅ Task 5.4: Agregar manejo de errores mejorado
**Archivos**:
- `frontend/src/config/api.js`
- `frontend/src/context/AppContext.jsx`

**Mejorar**:
- Mensajes de error más claros en español
- Notificaciones visuales mejoradas
- Retry logic para errores de red

---

### FASE 6: VERIFICAR RUTAS API (CRÍTICO)

#### ✅ Task 6.1: Probar endpoints de Assets
**Endpoints**:
```bash
POST   /api/v1/assets
GET    /api/v1/assets
GET    /api/v1/assets/:id
PUT    /api/v1/assets/:id
DELETE /api/v1/assets/:id
```

---

#### ✅ Task 6.2: Probar endpoints de Portfolios
**Endpoints**:
```bash
POST   /api/v1/portfolios
GET    /api/v1/portfolios
GET    /api/v1/portfolios/:id
PUT    /api/v1/portfolios/:id
DELETE /api/v1/portfolios/:id
POST   /api/v1/portfolios/:id/add-cash
POST   /api/v1/portfolios/:id/distribute-cash
```

---

#### ✅ Task 6.3: Probar endpoints de Contributions
**Endpoints**:
```bash
POST   /api/v1/contributions
GET    /api/v1/contributions
GET    /api/v1/contributions/:id
PUT    /api/v1/contributions/:id
DELETE /api/v1/contributions/:id
```

---

#### ✅ Task 6.4: Probar endpoints de Analytics
**Endpoints**:
```bash
GET /api/v1/analytics/overview
GET /api/v1/analytics/performance
GET /api/v1/analytics/distribution
```

---

### FASE 7: VERIFICAR MODELOS DE MONGODB (MEDIA PRIORIDAD)

#### ✅ Task 7.1: Revisar Asset model
**Archivo**: `backend/src/models/Asset.js`

**Verificar**:
- Índices no duplicados
- Validaciones correctas
- Pre-save hooks funcionando
- Métodos estáticos correctos

---

#### ✅ Task 7.2: Revisar Portfolio model
**Archivo**: `backend/src/models/Portfolio.js`

**Verificar**:
- Índices no duplicados
- Recálculo de métricas correcto
- Métodos de allocation

---

#### ✅ Task 7.3: Revisar Contribution model
**Archivo**: `backend/src/models/Contribution.js`

**Verificar**:
- Cálculos de totalAmount
- Método getTotalInvested
- Índices eficientes

---

#### ✅ Task 7.4: Revisar Settings model
**Archivo**: `backend/src/models/Settings.js`

**Verificar**:
- Singleton pattern funcionando
- Defaults en EUR y ES

---

### FASE 8: MEJORAS ADICIONALES (BAJA PRIORIDAD)

#### ✅ Task 8.1: Agregar loading states mejorados
#### ✅ Task 8.2: Agregar animaciones de transición
#### ✅ Task 8.3: Mejorar accesibilidad (a11y)
#### ✅ Task 8.4: Optimizar performance de queries
#### ✅ Task 8.5: Agregar tests unitarios

---

## 🏁 CHECKLIST DE VERIFICACIÓN

### Backend ✅
- [ ] Archivos .env creados
- [ ] MongoDB conectando correctamente
- [ ] Seeder funcionando
- [ ] Modelos con EUR por defecto
- [ ] Todas las rutas API respondiendo
- [ ] Validaciones correctas
- [ ] Logs en español

### Frontend ✅
- [ ] Archivos .env creados
- [ ] Conexión con API funcionando
- [ ] EUR como moneda por defecto
- [ ] Español como idioma por defecto
- [ ] Todos los textos traducidos
- [ ] Formularios funcionando
- [ ] Dashboard mejorado visualmente
- [ ] Responsive en mobile
- [ ] Cambio de moneda funcionando
- [ ] Notificaciones en español

### Funcionalidad ✅
- [ ] Puedo crear portfolios
- [ ] Puedo crear assets
- [ ] Puedo ver el dashboard con datos
- [ ] Los gráficos muestran información
- [ ] Puedo navegar entre páginas
- [ ] Las métricas se calculan bien

---

## 📝 NOTAS

### Orden recomendado de ejecución:
1. **PRIMERO**: Fase 1 (Configuración básica)
2. **SEGUNDO**: Fase 3 (Seeder)
3. **TERCERO**: Fase 6 (Verificar rutas API)
4. **CUARTO**: Fase 5 (Verificar formularios)
5. **QUINTO**: Fase 2 (Traducción)
6. **SEXTO**: Fase 4 (Mejorar dashboard)
7. **ÚLTIMO**: Fase 7 y 8 (Optimizaciones)

### Prioridad de bugs críticos:
1. 🔴 Crear archivos .env
2. 🔴 Crear seeder funcional
3. 🔴 Cambiar defaults a EUR/ES
4. 🟡 Traducir UI completa
5. 🟡 Mejorar dashboard
6. 🟢 Optimizaciones

---

**Última actualización**: 2025-11-14
