# 🔌 Growing - API Endpoints Documentation

## Base URL

```
Development: http://localhost:5000/api/v1
Production: https://api.growing.app/api/v1
```

---

## 📋 Tabla de Contenidos

1. [Assets Endpoints](#assets-endpoints)
2. [Contributions Endpoints](#contributions-endpoints)
3. [Portfolios Endpoints](#portfolios-endpoints)
4. [Analytics Endpoints](#analytics-endpoints)
5. [Settings Endpoints](#settings-endpoints)
6. [Error Responses](#error-responses)

---

## 🎨 Assets Endpoints

### 1. Obtener todos los activos

```http
GET /assets
```

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `type` | string | Filtrar por tipo (`crypto`, `stock`, `etf`, `fund`, `other`) |
| `portfolioId` | string | Filtrar por portfolio (ObjectId) |
| `sortBy` | string | Ordenar por campo (`name`, `currentValue`, `profitLoss`) |
| `order` | string | Orden (`asc`, `desc`) - default: `desc` |

**Response 200:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Bitcoin",
      "symbol": "BTC",
      "type": "crypto",
      "currency": "USD",
      "totalInvested": 10000.00,
      "currentValue": 11250.00,
      "quantity": 0.25,
      "averagePrice": 40000.00,
      "currentPrice": 45000.00,
      "profitLoss": 1250.00,
      "profitLossPercentage": 12.5,
      "portfolioId": "507f1f77bcf86cd799439012",
      "color": "#F7931A",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Obtener un activo específico

```http
GET /assets/:id
```

**URL Parameters:**
- `id` (string, required) - Asset ObjectId

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Bitcoin",
    "symbol": "BTC",
    "type": "crypto",
    "totalInvested": 10000.00,
    "currentValue": 11250.00,
    "quantity": 0.25,
    "profitLoss": 1250.00,
    "profitLossPercentage": 12.5,
    "portfolio": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Cartera Crypto"
    }
  }
}
```

---

### 3. Crear nuevo activo

```http
POST /assets
```

**Request Body:**
```json
{
  "name": "Ethereum",
  "symbol": "ETH",
  "type": "crypto",
  "currency": "USD",
  "currentPrice": 2500.00,
  "portfolioId": "507f1f77bcf86cd799439012",
  "color": "#627EEA",
  "notes": "Segunda crypto más grande"
}
```

**Validaciones:**
- `name`: requerido, max 100 caracteres
- `symbol`: requerido, max 20 caracteres, uppercase
- `type`: requerido, enum
- `currency`: opcional, default "USD"
- `currentPrice`: opcional, number >= 0

**Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Ethereum",
    "symbol": "ETH",
    "type": "crypto",
    "currency": "USD",
    "totalInvested": 0,
    "currentValue": 0,
    "quantity": 0,
    "currentPrice": 2500.00,
    "portfolioId": "507f1f77bcf86cd799439012",
    "color": "#627EEA",
    "createdAt": "2024-01-20T12:00:00.000Z"
  }
}
```

---

### 4. Actualizar activo

```http
PUT /assets/:id
```

**Request Body (campos opcionales):**
```json
{
  "name": "Bitcoin (BTC)",
  "currentPrice": 46000.00,
  "notes": "Actualización de precio",
  "color": "#FF9900"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Bitcoin (BTC)",
    "currentPrice": 46000.00,
    "currentValue": 11500.00,
    "profitLoss": 1500.00,
    "updatedAt": "2024-01-20T13:00:00.000Z"
  }
}
```

---

### 5. Eliminar activo

```http
DELETE /assets/:id
```

**Behavior:**
- Elimina el asset
- Elimina todas sus contributions asociadas
- Si pertenecía a un portfolio, actualiza métricas del portfolio

**Response 200:**
```json
{
  "success": true,
  "message": "Asset y 5 contributions eliminados exitosamente"
}
```

---

### 6. Obtener contribuciones de un activo

```http
GET /assets/:id/contributions
```

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `type` | string | Filtrar por tipo (`buy`, `sell`, `transfer`) |
| `startDate` | date | Fecha inicio (ISO 8601) |
| `endDate` | date | Fecha fin (ISO 8601) |
| `limit` | number | Número de resultados (default: 50) |
| `page` | number | Página (default: 1) |

**Response 200:**
```json
{
  "success": true,
  "count": 12,
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 12
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "assetId": "507f1f77bcf86cd799439011",
      "date": "2024-01-15T14:30:00.000Z",
      "type": "buy",
      "quantity": 0.1,
      "pricePerUnit": 40000.00,
      "totalAmount": 4020.00,
      "fees": 20.00,
      "source": "Binance",
      "createdAt": "2024-01-15T14:35:00.000Z"
    }
  ]
}
```

---

### 7. Obtener métricas de rendimiento

```http
GET /assets/:id/performance
```

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `period` | string | Período (`7d`, `1m`, `3m`, `6m`, `1y`, `all`) - default: `all` |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "assetId": "507f1f77bcf86cd799439011",
    "assetName": "Bitcoin",
    "summary": {
      "totalInvested": 10000.00,
      "currentValue": 11250.00,
      "profitLoss": 1250.00,
      "profitLossPercentage": 12.5,
      "quantity": 0.25,
      "averagePrice": 40000.00
    },
    "timeline": [
      {
        "date": "2024-01-01",
        "invested": 4000.00,
        "value": 4000.00
      },
      {
        "date": "2024-01-15",
        "invested": 10000.00,
        "value": 10500.00
      },
      {
        "date": "2024-01-20",
        "invested": 10000.00,
        "value": 11250.00
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

---

### 8. Actualizar precio actual

```http
POST /assets/:id/update-price
```

**Request Body:**
```json
{
  "currentPrice": 47000.00
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "currentPrice": 47000.00,
    "currentValue": 11750.00,
    "profitLoss": 1750.00,
    "profitLossPercentage": 17.5,
    "lastPriceUpdate": "2024-01-20T15:00:00.000Z"
  }
}
```

---

## 💰 Contributions Endpoints

### 1. Obtener todas las contribuciones

```http
GET /contributions
```

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `assetId` | string | Filtrar por asset |
| `type` | string | Filtrar por tipo |
| `startDate` | date | Fecha inicio |
| `endDate` | date | Fecha fin |
| `limit` | number | Resultados por página (default: 50) |
| `page` | number | Página (default: 1) |

**Response 200:**
```json
{
  "success": true,
  "count": 45,
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 45
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "assetId": "507f1f77bcf86cd799439011",
      "asset": {
        "name": "Bitcoin",
        "symbol": "BTC"
      },
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
```

---

### 2. Obtener una contribución específica

```http
GET /contributions/:id
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "assetId": "507f1f77bcf86cd799439011",
    "asset": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Bitcoin",
      "symbol": "BTC"
    },
    "date": "2024-01-15T14:30:00.000Z",
    "type": "buy",
    "quantity": 0.1,
    "pricePerUnit": 40000.00,
    "totalAmount": 4020.00,
    "fees": 20.00,
    "notes": "Primera compra"
  }
}
```

---

### 3. Registrar nueva contribución

```http
POST /contributions
```

**Request Body:**
```json
{
  "assetId": "507f1f77bcf86cd799439011",
  "date": "2024-01-20T10:00:00.000Z",
  "type": "buy",
  "quantity": 0.05,
  "pricePerUnit": 45000.00,
  "fees": 15.00,
  "notes": "Compra adicional",
  "source": "Coinbase"
}
```

**Validaciones:**
- `assetId`: requerido, debe existir
- `date`: requerido, no puede ser futura
- `type`: requerido, enum
- `quantity`: requerido, > 0
- `pricePerUnit`: requerido, >= 0
- `fees`: opcional, >= 0

**Side Effects:**
- Actualiza `Asset.totalInvested`
- Actualiza `Asset.quantity`
- Recalcula `Asset.averagePrice`
- Si el asset tiene portfolio, actualiza `Portfolio.totalInvested`

**Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "assetId": "507f1f77bcf86cd799439011",
    "date": "2024-01-20T10:00:00.000Z",
    "type": "buy",
    "quantity": 0.05,
    "pricePerUnit": 45000.00,
    "totalAmount": 2265.00,
    "fees": 15.00,
    "createdAt": "2024-01-20T16:00:00.000Z"
  },
  "assetUpdated": {
    "quantity": 0.3,
    "totalInvested": 12265.00,
    "averagePrice": 40883.33
  }
}
```

---

### 4. Actualizar contribución

```http
PUT /contributions/:id
```

**Request Body (campos opcionales):**
```json
{
  "quantity": 0.06,
  "pricePerUnit": 45500.00,
  "notes": "Cantidad corregida"
}
```

**Side Effects:**
- Recalcula métricas del asset asociado

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "quantity": 0.06,
    "pricePerUnit": 45500.00,
    "totalAmount": 2745.00,
    "updatedAt": "2024-01-20T17:00:00.000Z"
  }
}
```

---

### 5. Eliminar contribución

```http
DELETE /contributions/:id
```

**Side Effects:**
- Actualiza `Asset.totalInvested` y `Asset.quantity`
- Recalcula métricas del asset

**Response 200:**
```json
{
  "success": true,
  "message": "Contribution eliminada, asset actualizado"
}
```

---

### 6. Filtrar por rango de fechas

```http
GET /contributions/date-range?startDate=2024-01-01&endDate=2024-01-31
```

**Response 200:**
```json
{
  "success": true,
  "count": 8,
  "dateRange": {
    "start": "2024-01-01T00:00:00.000Z",
    "end": "2024-01-31T23:59:59.999Z"
  },
  "summary": {
    "totalInvested": 25000.00,
    "totalBuys": 6,
    "totalSells": 2,
    "totalFees": 125.00
  },
  "data": []
}
```

---

## 🎯 Portfolios Endpoints

### 1. Obtener todos los portfolios

```http
GET /portfolios
```

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `isActive` | boolean | Filtrar por activos (default: `true`) |
| `includeAssets` | boolean | Incluir assets poblados (default: `false`) |

**Response 200:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Cartera Crypto",
      "description": "Criptomonedas de largo plazo",
      "cashBalance": 5000.00,
      "currency": "USD",
      "totalInvested": 15000.00,
      "currentValue": 18500.00,
      "totalValue": 23500.00,
      "profitLoss": 3500.00,
      "profitLossPercentage": 23.33,
      "assetCount": 4,
      "color": "#8B5CF6",
      "isActive": true
    }
  ]
}
```

---

### 2. Obtener portfolio específico con assets

```http
GET /portfolios/:id?includeAssets=true
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Cartera Crypto",
    "cashBalance": 5000.00,
    "totalInvested": 15000.00,
    "currentValue": 18500.00,
    "totalValue": 23500.00,
    "profitLoss": 3500.00,
    "profitLossPercentage": 23.33,
    "assets": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Bitcoin",
        "symbol": "BTC",
        "currentValue": 11250.00,
        "profitLoss": 1250.00
      },
      {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Ethereum",
        "symbol": "ETH",
        "currentValue": 7250.00,
        "profitLoss": 2250.00
      }
    ],
    "allocation": [
      {
        "assetName": "Bitcoin",
        "percentage": 47.87,
        "value": 11250.00
      },
      {
        "assetName": "Ethereum",
        "percentage": 30.85,
        "value": 7250.00
      },
      {
        "assetName": "Efectivo",
        "percentage": 21.28,
        "value": 5000.00
      }
    ]
  }
}
```

---

### 3. Crear nuevo portfolio

```http
POST /portfolios
```

**Request Body:**
```json
{
  "name": "Cartera Tech Stocks",
  "description": "Acciones tecnológicas USA",
  "cashBalance": 10000.00,
  "currency": "USD",
  "color": "#3B82F6"
}
```

**Validaciones:**
- `name`: requerido, max 100 caracteres
- `cashBalance`: opcional, default 0, >= 0
- `currency`: opcional, default "USD"

**Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "name": "Cartera Tech Stocks",
    "description": "Acciones tecnológicas USA",
    "cashBalance": 10000.00,
    "currency": "USD",
    "totalInvested": 0,
    "currentValue": 0,
    "totalValue": 10000.00,
    "color": "#3B82F6",
    "isActive": true,
    "createdAt": "2024-01-20T18:00:00.000Z"
  }
}
```

---

### 4. Actualizar portfolio

```http
PUT /portfolios/:id
```

**Request Body (campos opcionales):**
```json
{
  "name": "Cartera Crypto 2024",
  "description": "Nueva descripción",
  "cashBalance": 6000.00
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Cartera Crypto 2024",
    "cashBalance": 6000.00,
    "updatedAt": "2024-01-20T19:00:00.000Z"
  }
}
```

---

### 5. Eliminar portfolio

```http
DELETE /portfolios/:id
```

**Behavior:**
- Elimina el portfolio
- Los assets asociados quedan sin portfolio (`portfolioId = null`)
- **NO** elimina los assets

**Response 200:**
```json
{
  "success": true,
  "message": "Portfolio eliminado, 4 assets desvinculados"
}
```

---

### 6. Agregar efectivo al portfolio

```http
POST /portfolios/:id/add-cash
```

**Request Body:**
```json
{
  "amount": 2000.00,
  "notes": "Aporte mensual"
}
```

**Validations:**
- `amount`: requerido, > 0

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "cashBalance": 7000.00,
    "totalValue": 25500.00,
    "updatedAt": "2024-01-20T20:00:00.000Z"
  }
}
```

---

### 7. Distribuir efectivo entre assets

```http
POST /portfolios/:id/distribute-cash
```

**Request Body:**
```json
{
  "distributions": [
    {
      "assetId": "507f1f77bcf86cd799439011",
      "amount": 2000.00,
      "pricePerUnit": 46000.00
    },
    {
      "assetId": "507f1f77bcf86cd799439020",
      "amount": 1500.00,
      "pricePerUnit": 2600.00
    }
  ],
  "notes": "Rebalanceo mensual"
}
```

**Validaciones:**
- Suma de `distributions[].amount` <= `portfolio.cashBalance`
- Todos los `assetId` deben pertenecer al portfolio

**Side Effects:**
- Crea Contributions para cada distribución
- Actualiza cada Asset (quantity, totalInvested)
- Reduce Portfolio.cashBalance
- Recalcula métricas de Portfolio

**Response 200:**
```json
{
  "success": true,
  "message": "Efectivo distribuido exitosamente",
  "data": {
    "portfolioId": "507f1f77bcf86cd799439012",
    "previousCashBalance": 5000.00,
    "newCashBalance": 1500.00,
    "distributedAmount": 3500.00,
    "contributionsCreated": 2,
    "assetsUpdated": [
      {
        "assetId": "507f1f77bcf86cd799439011",
        "newQuantity": 0.2935,
        "newTotalInvested": 12000.00
      },
      {
        "assetId": "507f1f77bcf86cd799439020",
        "newQuantity": 3.5769,
        "newTotalInvested": 8500.00
      }
    ]
  }
}
```

---

### 8. Obtener distribución del portfolio

```http
GET /portfolios/:id/allocation
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "portfolioId": "507f1f77bcf86cd799439012",
    "totalValue": 23500.00,
    "allocation": [
      {
        "assetId": "507f1f77bcf86cd799439011",
        "assetName": "Bitcoin",
        "symbol": "BTC",
        "value": 11250.00,
        "percentage": 47.87
      },
      {
        "assetId": "507f1f77bcf86cd799439020",
        "assetName": "Ethereum",
        "symbol": "ETH",
        "value": 7250.00,
        "percentage": 30.85
      },
      {
        "type": "cash",
        "value": 5000.00,
        "percentage": 21.28
      }
    ],
    "targetAllocation": [
      {
        "assetId": "507f1f77bcf86cd799439011",
        "targetPercentage": 50,
        "currentPercentage": 47.87,
        "difference": -2.13
      }
    ]
  }
}
```

---

### 9. Rebalancear portfolio según target allocation

```http
POST /portfolios/:id/rebalance
```

**Request Body:**
```json
{
  "strategy": "proportional",
  "useCash": true
}
```

**Estrategias:**
- `proportional`: Ajustar todos proporcionalmente
- `minimize_transactions`: Minimizar número de transacciones

**Validaciones:**
- Portfolio debe tener `targetAllocation` definido

**Response 200:**
```json
{
  "success": true,
  "message": "Portfolio rebalanceado exitosamente",
  "data": {
    "portfolioId": "507f1f77bcf86cd799439012",
    "rebalanceDate": "2024-01-20T21:00:00.000Z",
    "adjustments": [
      {
        "assetId": "507f1f77bcf86cd799439011",
        "action": "buy",
        "amount": 500.00,
        "reason": "Below target by 2.13%"
      },
      {
        "assetId": "507f1f77bcf86cd799439020",
        "action": "sell",
        "amount": 300.00,
        "reason": "Above target by 0.85%"
      }
    ],
    "contributionsCreated": 2
  }
}
```

---

## 📊 Analytics Endpoints

### 1. Dashboard Overview

```http
GET /analytics/overview
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalValue": 45000.00,
      "totalInvested": 38000.00,
      "totalCash": 7000.00,
      "profitLoss": 7000.00,
      "profitLossPercentage": 18.42,
      "assetsCount": 12,
      "portfoliosCount": 3
    },
    "byType": [
      {
        "type": "crypto",
        "count": 5,
        "totalValue": 25000.00,
        "profitLoss": 5000.00
      },
      {
        "type": "stock",
        "count": 4,
        "totalValue": 13000.00,
        "profitLoss": 1500.00
      },
      {
        "type": "etf",
        "count": 3,
        "totalValue": 7000.00,
        "profitLoss": 500.00
      }
    ],
    "topPerformers": [
      {
        "assetId": "507f1f77bcf86cd799439011",
        "name": "Bitcoin",
        "profitLossPercentage": 25.5
      },
      {
        "assetId": "507f1f77bcf86cd799439020",
        "name": "Ethereum",
        "profitLossPercentage": 18.3
      }
    ],
    "worstPerformers": [
      {
        "assetId": "507f1f77bcf86cd799439050",
        "name": "Some Stock",
        "profitLossPercentage": -5.2
      }
    ]
  }
}
```

---

### 2. Rendimiento histórico

```http
GET /analytics/performance?period=3m&granularity=day
```

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `period` | string | `7d`, `1m`, `3m`, `6m`, `1y`, `all` (default: `all`) |
| `granularity` | string | `day`, `week`, `month` (default: `day`) |

**Response 200:**
```json
{
  "success": true,
  "period": "3m",
  "granularity": "day",
  "data": {
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
      "roi": 350.00,
      "totalInvestedInPeriod": 28000.00
    }
  }
}
```

---

### 3. Distribución de inversiones

```http
GET /analytics/distribution
```

**Response 200:**
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
      },
      {
        "type": "stock",
        "value": 13000.00,
        "percentage": 28.89,
        "count": 4
      },
      {
        "type": "etf",
        "value": 7000.00,
        "percentage": 15.56,
        "count": 3
      }
    ],
    "byPortfolio": [
      {
        "portfolioId": "507f1f77bcf86cd799439012",
        "name": "Cartera Crypto",
        "value": 23500.00,
        "percentage": 52.22
      },
      {
        "portfolioId": "507f1f77bcf86cd799439040",
        "name": "Cartera Tech Stocks",
        "value": 13000.00,
        "percentage": 28.89
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

---

### 4. Línea de tiempo de inversiones

```http
GET /analytics/timeline
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "date": "2024-01-01",
        "type": "asset_created",
        "description": "Creado activo: Bitcoin"
      },
      {
        "date": "2024-01-05",
        "type": "contribution",
        "description": "Compra de 0.1 BTC por $4,000"
      },
      {
        "date": "2024-01-10",
        "type": "portfolio_created",
        "description": "Creado portfolio: Cartera Crypto"
      }
    ]
  }
}
```

---

### 5. Mejores activos por rendimiento

```http
GET /analytics/top-performers?limit=5&sortBy=percentage
```

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `limit` | number | Número de resultados (default: 10) |
| `sortBy` | string | `percentage` o `absolute` (default: `percentage`) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "assetId": "507f1f77bcf86cd799439011",
      "name": "Bitcoin",
      "symbol": "BTC",
      "totalInvested": 10000.00,
      "currentValue": 12550.00,
      "profitLoss": 2550.00,
      "profitLossPercentage": 25.5,
      "rank": 1
    }
  ]
}
```

---

## ⚙️ Settings Endpoints

### 1. Obtener configuración actual

```http
GET /settings
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "defaultCurrency": "USD",
    "language": "es",
    "theme": "dark",
    "chartType": "line",
    "priceUpdateInterval": 15,
    "priceApiProvider": "manual",
    "notifications": {
      "priceAlerts": false,
      "portfolioRebalance": false,
      "profitLossThreshold": 10
    }
  }
}
```

---

### 2. Actualizar configuración

```http
PUT /settings
```

**Request Body (campos opcionales):**
```json
{
  "theme": "light",
  "defaultCurrency": "EUR",
  "priceUpdateInterval": 30,
  "notifications": {
    "priceAlerts": true,
    "profitLossThreshold": 5
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "theme": "light",
    "defaultCurrency": "EUR",
    "priceUpdateInterval": 30,
    "updatedAt": "2024-01-20T22:00:00.000Z"
  }
}
```

---

## 🚨 Error Responses

### Formato estándar de error

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Asset con ID 507f1f77bcf86cd799439099 no encontrado",
    "statusCode": 404
  }
}
```

### Códigos de error comunes

| Código HTTP | Error Code | Descripción |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Datos de entrada inválidos |
| 404 | `RESOURCE_NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | Conflicto (ej: portfolio con assets no se puede eliminar) |
| 422 | `BUSINESS_LOGIC_ERROR` | Error de lógica de negocio |
| 500 | `INTERNAL_SERVER_ERROR` | Error interno del servidor |

### Ejemplo de error de validación

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación",
    "statusCode": 400,
    "details": [
      {
        "field": "quantity",
        "message": "Quantity debe ser mayor a 0"
      },
      {
        "field": "pricePerUnit",
        "message": "Price per unit es requerido"
      }
    ]
  }
}
```

---

## 🔐 Headers Requeridos

```http
Content-Type: application/json
Accept: application/json
```

---

## 📝 Notas Adicionales

### Rate Limiting
- 100 requests por minuto por IP
- Headers de respuesta incluyen:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1674234000

### Paginación
Endpoints que retornan listas incluyen:
```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "pages": 3
  }
}
```

### CORS
- Configurado para frontend en desarrollo: `http://localhost:5173`
- Producción: dominio específico

---

**Última actualización**: 2025-11-14
