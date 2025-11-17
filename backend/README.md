# 🚀 Growing Backend API

Backend completo para la aplicación Growing - Sistema de tracking de inversiones personales.

## 📋 Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de Datos**: MongoDB Atlas
- **ODM**: Mongoose
- **Validación**: Express Validator
- **Logging**: Winston
- **Seguridad**: Helmet, CORS, Rate Limiting

## 🎯 Características Principales

### Gestión Financiera
- ✅ Gestión de activos múltiples (crypto, stocks, ETFs, fondos)
- ✅ Registro de compras/ventas con historial completo
- ✅ Sistema de "Carteras" con gestión de efectivo
- ✅ Distribución de efectivo entre activos
- ✅ Cálculos financieros avanzados (TWR, MWR, DCA, ROI)
- ✅ Analytics y métricas en tiempo real

### Cálculos Implementados
- **TWR** (Time-Weighted Return): Rendimiento ponderado por tiempo
- **MWR/IRR** (Money-Weighted Return): Tasa interna de retorno
- **DCA** (Dollar Cost Average): Precio promedio de compra
- **ROI Anualizado**: Retorno anualizado de inversión
- **Volatilidad**: Desviación estándar de retornos
- **Sharpe Ratio**: Retorno ajustado por riesgo
- **Allocation**: Distribución porcentual de assets

### Arquitectura
```
backend/
├── src/
│   ├── config/          # Configuración (DB, logger, constants)
│   ├── models/          # Modelos Mongoose
│   ├── controllers/     # Controladores HTTP
│   ├── services/        # Lógica de negocio
│   ├── routes/          # Rutas Express
│   ├── middleware/      # Middleware personalizado
│   ├── utils/           # Utilidades y cálculos
│   ├── app.js           # Configuración Express
│   └── server.js        # Entry point
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crear archivo `.env` basado en `.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/growing
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

### 3. Iniciar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Endpoints Principales

#### Assets
- `GET /assets` - Obtener todos los activos
- `GET /assets/:id` - Obtener un activo
- `POST /assets` - Crear activo
- `PUT /assets/:id` - Actualizar activo
- `DELETE /assets/:id` - Eliminar activo
- `POST /assets/:id/update-price` - Actualizar precio
- `GET /assets/:id/performance` - Métricas de rendimiento

#### Contributions
- `GET /contributions` - Obtener contribuciones
- `POST /contributions` - Registrar compra/venta
- `PUT /contributions/:id` - Actualizar contribución
- `DELETE /contributions/:id` - Eliminar contribución

#### Portfolios
- `GET /portfolios` - Obtener portfolios
- `POST /portfolios` - Crear portfolio
- `POST /portfolios/:id/add-cash` - Agregar efectivo
- `POST /portfolios/:id/distribute-cash` - Distribuir efectivo
- `GET /portfolios/:id/allocation` - Ver distribución

#### Analytics
- `GET /analytics/overview` - Dashboard overview
- `GET /analytics/performance` - Rendimiento histórico
- `GET /analytics/distribution` - Distribución de inversiones
- `GET /analytics/top-performers` - Mejores activos

#### Settings
- `GET /settings` - Obtener configuración
- `PUT /settings` - Actualizar configuración

### Health Check
```bash
curl http://localhost:5000/api/v1/health
```

## 📊 Modelos de Datos

### Asset
Representa un activo financiero individual (crypto, acción, ETF, etc.)

**Campos principales**:
- name, symbol, type
- totalInvested, currentValue, quantity
- averagePrice, currentPrice
- profitLoss, profitLossPercentage
- portfolioId (opcional)

### Contribution
Historial de transacciones (compras/ventas)

**Campos principales**:
- assetId, date, type (buy/sell)
- quantity, pricePerUnit, totalAmount
- fees, notes, source

### Portfolio
Contenedor de activos con efectivo distribuible

**Campos principales**:
- name, description
- cashBalance, totalInvested, currentValue
- profitLoss, targetAllocation

### Settings
Configuración global (singleton)

**Campos principales**:
- defaultCurrency, language, theme
- priceUpdateInterval, priceApiProvider

## 💡 Ejemplos de Uso

### Crear Asset y Registrar Compra

```javascript
// 1. Crear asset
POST /api/v1/assets
{
  "name": "Bitcoin",
  "symbol": "BTC",
  "type": "crypto",
  "currentPrice": 45000
}

// 2. Registrar compra
POST /api/v1/contributions
{
  "assetId": "<asset_id>",
  "date": "2024-01-20",
  "type": "buy",
  "quantity": 0.1,
  "pricePerUnit": 45000,
  "fees": 20
}
```

### Distribuir Efectivo en Portfolio

```javascript
// 1. Crear portfolio con efectivo
POST /api/v1/portfolios
{
  "name": "Mi Cartera",
  "cashBalance": 10000
}

// 2. Distribuir entre assets
POST /api/v1/portfolios/:id/distribute-cash
{
  "distributions": [
    {
      "assetId": "<asset_1>",
      "amount": 5000,
      "pricePerUnit": 45000
    },
    {
      "assetId": "<asset_2>",
      "amount": 3000,
      "pricePerUnit": 2500
    }
  ]
}
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🔒 Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para origen específico
- **Rate Limiting**: 100 requests/minuto por IP
- **Validación**: Validación de inputs con express-validator
- **Error Handling**: Manejo centralizado de errores

## 📝 Linting

```bash
# Verificar código
npm run lint

# Corregir automáticamente
npm run lint:fix
```

## 🌍 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| NODE_ENV | Entorno (development/production) | development |
| PORT | Puerto del servidor | 5000 |
| MONGODB_URI | URI de MongoDB | - |
| CORS_ORIGIN | Origen permitido para CORS | http://localhost:5173 |
| LOG_LEVEL | Nivel de logging | debug |
| RATE_LIMIT_WINDOW_MS | Ventana de rate limiting | 60000 |
| RATE_LIMIT_MAX_REQUESTS | Máximo de requests | 100 |

## 📚 Documentación

- **API Completa**: `/docs/API_ENDPOINTS.md`
- **Schemas de Base de Datos**: `/docs/DATABASE_SCHEMAS.md`
- **Guía para Frontend**: `/docs/BACKEND_FOR_FRONTEND.md`
- **Arquitectura**: `/ARCHITECTURE.md`

## 🐛 Debugging

Los logs se muestran en consola con formato colorizado. Niveles:
- `error`: Errores críticos
- `warn`: Advertencias
- `info`: Información general
- `http`: Requests HTTP
- `debug`: Información de debugging

## 🚀 Deployment

### Preparar para producción

1. Configurar variables de entorno en el servidor
2. Usar MongoDB Atlas (cloud)
3. Configurar CORS_ORIGIN con dominio de producción
4. Establecer NODE_ENV=production

### Railway / Render / Fly.io

```bash
# Build command
npm install

# Start command
npm start
```

## 🤝 Contribuciones

Este proyecto sigue la arquitectura definida en `/ARCHITECTURE.md`.

### Estructura de commits
```
feat: descripción breve

Descripción detallada de los cambios
```

## 📄 Licencia

MIT

## 👨‍💻 Autor

Desarrollado por el equipo de Growing

---

**Status**: ✅ Completamente funcional y listo para integración con Frontend

**Última actualización**: 2025-11-14
