# 📡 Growing Backend - Guía para Frontend

## 🎯 Información para el Equipo Frontend

Este documento describe todos los **endpoints disponibles** y el **formato de datos** que el backend proporciona para que puedan integrar correctamente el frontend.

---

## 🔗 Base URL

```
Desarrollo: http://localhost:5000/api/v1
Producción: https://api.growing.app/api/v1
```

---

## 📊 Formato de Respuestas

### Respuesta Exitosa

```json
{
  "success": true,
  "data": { /* datos solicitados */ },
  "message": "Mensaje opcional"
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "statusCode": 400,
    "details": [ /* detalles opcionales */ ]
  }
}
```

---

## 🎨 ENDPOINTS PRINCIPALES

### 1. DASHBOARD / ANALYTICS

#### `GET /analytics/overview`

**Para qué sirve**: Obtener todos los datos del dashboard principal

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalValue": 45000.00,        // Valor total (inversiones + efectivo)
      "totalInvested": 38000.00,     // Total invertido
      "totalCash": 7000.00,          // Efectivo disponible
      "profitLoss": 7000.00,         // Ganancia/Pérdida absoluta
      "profitLossPercentage": 18.42, // Ganancia/Pérdida porcentual
      "assetsCount": 12,             // Número de activos
      "portfoliosCount": 3           // Número de portfolios
    },
    "byType": [
      {
        "type": "crypto",
        "count": 5,
        "totalValue": 25000.00,
        "profitLoss": 5000.00
      }
    ],
    "topPerformers": [
      {
        "name": "Bitcoin",
        "symbol": "BTC",
        "profitLossPercentage": 25.5
      }
    ],
    "worstPerformers": [ /* similar */ ]
  }
}
```

**Uso en Frontend**:
- Mostrar cards con métricas principales (totalValue, profitLoss, etc.)
- Gráfico de distribución por tipo (byType)
- Lista de mejores/peores performers

---

#### `GET /analytics/performance?period=3m&granularity=day`

**Para qué sirve**: Obtener datos para el gráfico de rendimiento histórico

**Parámetros**:
- `period`: `7d`, `1m`, `3m`, `6m`, `1y`, `all` (default: `all`)
- `granularity`: `day`, `week`, `month` (default: `day`)

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "period": "3m",
    "timeline": [
      {
        "date": "2024-01-01",
        "totalInvested": 10000.00,
        "totalValue": 10000.00,
        "profitLoss": 0,
        "profitLossPercentage": 0
      },
      {
        "date": "2024-01-15",
        "totalInvested": 20000.00,
        "totalValue": 21500.00,
        "profitLoss": 1500.00,
        "profitLossPercentage": 7.5
      }
    ],
    "summary": {
      "startValue": 10000.00,
      "endValue": 45000.00,
      "roi": 350.00
    }
  }
}
```

**Uso en Frontend**:
- Gráfico de línea/área con el timeline
- Mostrar ROI del período

---

#### `GET /analytics/distribution`

**Para qué sirve**: Obtener distribución de inversiones para gráficos de pie/donut

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "byType": [
      {
        "type": "crypto",
        "value": 25000.00,
        "percentage": 55.56,
        "count": 5
      }
    ],
    "byPortfolio": [
      {
        "portfolioId": "...",
        "name": "Cartera Crypto",
        "value": 23500.00,
        "percentage": 52.22
      }
    ],
    "independent": {
      "count": 3,
      "value": 8500.00,
      "percentage": 18.89
    }
  }
}
```

**Uso en Frontend**:
- Gráfico pie/donut de distribución por tipo
- Gráfico pie/donut de distribución por portfolio

---

### 2. ASSETS (ACTIVOS)

#### `GET /assets`

**Para qué sirve**: Obtener lista de todos los activos

**Query Params**:
- `type`: filtrar por tipo (`crypto`, `stock`, `etf`, `fund`)
- `portfolioId`: filtrar por portfolio
- `sortBy`: ordenar por (`name`, `currentValue`, `profitLoss`)
- `order`: orden (`asc`, `desc`)

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "count": 12,
    "data": [
      {
        "_id": "...",
        "name": "Bitcoin",
        "symbol": "BTC",
        "type": "crypto",
        "totalInvested": 10000.00,
        "currentValue": 11250.00,
        "quantity": 0.25,
        "averagePrice": 40000.00,
        "currentPrice": 45000.00,
        "profitLoss": 1250.00,
        "profitLossPercentage": 12.5,
        "portfolioId": "...",  // puede ser null
        "color": "#F7931A",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Uso en Frontend**:
- Tabla de activos con todas las columnas
- Tarjetas de activos
- Selector de activos

---

#### `POST /assets`

**Para qué sirve**: Crear un nuevo activo

**Body**:
```json
{
  "name": "Ethereum",
  "symbol": "ETH",
  "type": "crypto",
  "currency": "USD",
  "currentPrice": 2500.00,      // Opcional
  "portfolioId": "...",         // Opcional (null = independiente)
  "color": "#627EEA",           // Opcional
  "notes": "Segunda crypto"     // Opcional
}
```

**Respuesta**: El activo creado

---

#### `POST /assets/:id/update-price`

**Para qué sirve**: Actualizar el precio actual de un activo (MANUAL)

**Body**:
```json
{
  "currentPrice": 47000.00
}
```

**Uso en Frontend**:
- Input para actualizar precio manualmente
- Botón "Actualizar precio"

---

#### `GET /assets/:id/performance`

**Para qué sirve**: Obtener métricas detalladas de rendimiento de un activo

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "assetId": "...",
    "assetName": "Bitcoin",
    "summary": {
      "totalInvested": 10000.00,
      "currentValue": 11250.00,
      "profitLoss": 1250.00,
      "profitLossPercentage": 12.5
    },
    "metrics": {
      "simpleReturn": 12.5,
      "twr": 13.2,          // Time-Weighted Return
      "mwr": 11.8,          // Money-Weighted Return
      "dca": 40000.00,      // Dollar Cost Average
      "annualizedROI": 15.3
    },
    "timeline": [
      {
        "date": "2024-01-01",
        "invested": 4000.00,
        "value": 4000.00,
        "profitLoss": 0
      }
    ],
    "transactions": {
      "buy": 3,
      "sell": 0,
      "totalFees": 60.00
    }
  }
}
```

**Uso en Frontend**:
- Página de detalle del activo
- Mostrar métricas avanzadas
- Gráfico de evolución del activo

---

### 3. CONTRIBUTIONS (APORTACIONES)

#### `POST /contributions`

**Para qué sirve**: Registrar una compra/venta de un activo

**Body**:
```json
{
  "assetId": "...",
  "date": "2024-01-20T10:00:00.000Z",
  "type": "buy",                   // "buy", "sell", "transfer"
  "quantity": 0.05,
  "pricePerUnit": 45000.00,
  "fees": 15.00,                   // Opcional
  "notes": "Compra adicional",     // Opcional
  "source": "Coinbase"             // Opcional
}
```

**Side Effects**:
- Actualiza automáticamente el asset (quantity, totalInvested, averagePrice)
- Si el asset está en un portfolio, reduce el cashBalance

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "contribution": { /* contribución creada */ },
    "assetUpdated": {
      "quantity": 0.3,
      "totalInvested": 12265.00,
      "averagePrice": 40883.33
    }
  }
}
```

**Uso en Frontend**:
- Formulario de registro de compra/venta
- Mostrar confirmación con asset actualizado

---

#### `GET /assets/:id/contributions`

**Para qué sirve**: Obtener historial de transacciones de un activo

**Query Params**:
- `type`: filtrar por tipo
- `startDate`, `endDate`: rango de fechas
- `page`, `limit`: paginación

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "count": 12,
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 12,
      "pages": 1
    },
    "data": [
      {
        "_id": "...",
        "date": "2024-01-15T14:30:00.000Z",
        "type": "buy",
        "quantity": 0.1,
        "pricePerUnit": 40000.00,
        "totalAmount": 4020.00,
        "fees": 20.00,
        "source": "Binance"
      }
    ]
  }
}
```

**Uso en Frontend**:
- Tabla de historial de transacciones
- Filtros por fecha/tipo

---

### 4. PORTFOLIOS (CARTERAS)

#### `GET /portfolios?includeAssets=true`

**Para qué sirve**: Obtener todos los portfolios

**Query Params**:
- `includeAssets`: incluir assets poblados (default: false)

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "count": 3,
    "data": [
      {
        "_id": "...",
        "name": "Cartera Crypto",
        "cashBalance": 5000.00,
        "totalInvested": 15000.00,
        "currentValue": 18500.00,
        "totalValue": 23500.00,    // currentValue + cashBalance
        "profitLoss": 3500.00,
        "profitLossPercentage": 23.33,
        "assetCount": 4,
        "color": "#8B5CF6"
      }
    ]
  }
}
```

---

#### `POST /portfolios`

**Para qué sirve**: Crear un nuevo portfolio

**Body**:
```json
{
  "name": "Cartera Tech Stocks",
  "description": "Acciones tecnológicas USA",
  "cashBalance": 10000.00,        // Opcional, default: 0
  "currency": "USD",              // Opcional, default: "USD"
  "color": "#3B82F6"              // Opcional
}
```

---

#### `POST /portfolios/:id/add-cash`

**Para qué sirve**: Agregar efectivo a un portfolio

**Body**:
```json
{
  "amount": 2000.00,
  "notes": "Aporte mensual"  // Opcional
}
```

---

#### `POST /portfolios/:id/distribute-cash`

**Para qué sirve**: Distribuir efectivo del portfolio entre sus activos

**Body**:
```json
{
  "distributions": [
    {
      "assetId": "...",
      "amount": 2000.00,
      "pricePerUnit": 46000.00
    },
    {
      "assetId": "...",
      "amount": 1500.00,
      "pricePerUnit": 2600.00
    }
  ],
  "notes": "Rebalanceo mensual"  // Opcional
}
```

**Validaciones**:
- Suma de amounts <= cashBalance del portfolio
- Todos los assetId deben pertenecer al portfolio

**Side Effects**:
- Crea Contributions para cada distribución
- Actualiza cada Asset (quantity, totalInvested)
- Reduce Portfolio.cashBalance

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "portfolioId": "...",
    "previousCashBalance": 5000.00,
    "newCashBalance": 1500.00,
    "distributedAmount": 3500.00,
    "contributionsCreated": 2,
    "assetsUpdated": [
      {
        "assetId": "...",
        "assetName": "Bitcoin",
        "newQuantity": 0.2935,
        "newTotalInvested": 12000.00
      }
    ]
  }
}
```

**Uso en Frontend**:
- Modal/página de "Distribuir Efectivo"
- Inputs para cada asset del portfolio
- Mostrar efectivo disponible
- Validar que no exceda el cashBalance

---

#### `GET /portfolios/:id/allocation`

**Para qué sirve**: Obtener distribución actual del portfolio

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "portfolioId": "...",
    "totalValue": 23500.00,
    "allocation": [
      {
        "assetId": "...",
        "assetName": "Bitcoin",
        "symbol": "BTC",
        "value": 11250.00,
        "percentage": 47.87
      },
      {
        "type": "cash",
        "value": 5000.00,
        "percentage": 21.28
      }
    ]
  }
}
```

**Uso en Frontend**:
- Gráfico pie/donut de distribución del portfolio
- Tabla de allocation

---

### 5. SETTINGS

#### `GET /settings`

**Para qué sirve**: Obtener configuración actual

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "defaultCurrency": "USD",
    "language": "es",
    "theme": "dark",
    "chartType": "line",
    "priceUpdateInterval": 15
  }
}
```

---

## 🎨 FLUJOS PRINCIPALES PARA UI

### Flujo 1: Crear Asset y Registrar Compra

```javascript
// 1. Crear asset
POST /assets
{
  "name": "Bitcoin",
  "symbol": "BTC",
  "type": "crypto",
  "currentPrice": 45000
}
// Respuesta: asset con ID

// 2. Registrar primera compra
POST /contributions
{
  "assetId": "<id_del_asset>",
  "date": "2024-01-20",
  "type": "buy",
  "quantity": 0.1,
  "pricePerUnit": 45000,
  "fees": 20
}
// El asset se actualiza automáticamente
```

---

### Flujo 2: Crear Portfolio y Distribuir Efectivo

```javascript
// 1. Crear portfolio con efectivo inicial
POST /portfolios
{
  "name": "Mi Cartera Crypto",
  "cashBalance": 10000
}

// 2. Crear assets dentro del portfolio
POST /assets
{
  "name": "Bitcoin",
  "symbol": "BTC",
  "type": "crypto",
  "portfolioId": "<id_del_portfolio>",
  "currentPrice": 45000
}

// 3. Distribuir efectivo entre assets
POST /portfolios/<id>/distribute-cash
{
  "distributions": [
    {
      "assetId": "<id_asset_1>",
      "amount": 5000,
      "pricePerUnit": 45000
    }
  ]
}
// Automáticamente:
// - Crea contribution
// - Actualiza asset
// - Reduce cashBalance
```

---

### Flujo 3: Actualizar Precio y Ver Rendimiento

```javascript
// 1. Actualizar precio manualmente
POST /assets/<id>/update-price
{
  "currentPrice": 48000
}
// Asset se recalcula automáticamente

// 2. Ver métricas actualizadas
GET /assets/<id>/performance
// Obtener TWR, MWR, DCA, timeline, etc.
```

---

## 🚨 CÓDIGOS DE ERROR COMUNES

| Código HTTP | Error Code | Descripción | Solución |
|-------------|------------|-------------|----------|
| 400 | VALIDATION_ERROR | Datos inválidos | Revisar campos requeridos |
| 404 | RESOURCE_NOT_FOUND | Recurso no encontrado | Verificar ID |
| 409 | CONFLICT | Conflicto (duplicado) | Cambiar datos únicos |
| 422 | INSUFFICIENT_FUNDS | Fondos insuficientes | Reducir monto o agregar cash |
| 500 | INTERNAL_SERVER_ERROR | Error del servidor | Contactar backend |

---

## 🎯 CAMPOS CALCULADOS AUTOMÁTICAMENTE

Estos campos **NO** se envían en POST/PUT, se calculan automáticamente:

### En Asset:
- `currentValue` = quantity × currentPrice
- `averagePrice` = totalInvested / quantity
- `profitLoss` = currentValue - totalInvested
- `profitLossPercentage` = (profitLoss / totalInvested) × 100

### En Portfolio:
- `totalValue` = cashBalance + currentValue
- `currentValue` = suma de currentValue de todos los assets
- `profitLoss` = currentValue - totalInvested
- `profitLossPercentage` = (profitLoss / totalInvested) × 100

### En Contribution:
- `totalAmount` = (quantity × pricePerUnit) + fees

---

## 📝 VALIDACIONES IMPORTANTES

### Al crear Contribution (compra):
- ✅ `date` no puede ser futura
- ✅ `quantity` > 0
- ✅ `pricePerUnit` >= 0
- ✅ Si el asset tiene portfolio, debe haber suficiente `cashBalance`

### Al distribuir efectivo en Portfolio:
- ✅ Suma de amounts <= portfolio.cashBalance
- ✅ Todos los assetId deben pertenecer al portfolio
- ✅ Todos los amounts > 0

---

## 🎨 COLORES SUGERIDOS POR TIPO

```javascript
const ASSET_COLORS = {
  crypto: '#F7931A',    // Naranja Bitcoin
  stock: '#3B82F6',     // Azul
  etf: '#10B981',       // Verde
  fund: '#8B5CF6',      // Púrpura
  other: '#6B7280'      // Gris
};
```

---

## 📞 CONTACTO

Si necesitan algún endpoint adicional o tienen dudas sobre la integración:
- Backend Lead: [Tu nombre]
- Documentación completa: `/docs/API_ENDPOINTS.md`

---

**Última actualización**: 2025-11-14
