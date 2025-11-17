# Integración con Yahoo Finance API (RapidAPI)

Este documento explica cómo usar la integración con Yahoo Finance para obtener precios en tiempo real e históricos.

## Configuración

### 1. Obtener API Key de RapidAPI

1. Crea una cuenta en [RapidAPI](https://rapidapi.com/)
2. Busca "Yahoo Finance" y suscríbete al plan que necesites
3. Copia tu API Key

### 2. Configurar Variables de Entorno

Edita tu archivo `.env` y agrega:

```bash
# RapidAPI Configuration
RAPIDAPI_KEY=tu_api_key_aqui
RAPIDAPI_HOST=yahoo-finance127.p.rapidapi.com

# Modo de actualización de precios
# 'manual' = precios manuales (default)
# 'auto' = obtener de RapidAPI
PRICE_UPDATE_MODE=auto
```

## Modos de Operación

### Modo Manual (Default)

```bash
PRICE_UPDATE_MODE=manual
```

- Los precios deben actualizarse manualmente
- Los endpoints de precio retornan `null`
- Ideal para desarrollo o cuando no tienes API key

### Modo Automático

```bash
PRICE_UPDATE_MODE=auto
RAPIDAPI_KEY=tu_api_key_real
```

- Los precios se obtienen automáticamente de Yahoo Finance
- Requiere API key válida
- Incluye caché de 1 minuto para evitar exceso de llamadas

## Endpoints Disponibles

### 1. Obtener Información del Servicio

```bash
GET /api/v1/prices/info
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "mode": "auto",
    "autoEnabled": true,
    "apiConfigured": true,
    "cacheSize": 15,
    "cacheTTL": 60000
  }
}
```

### 2. Obtener Cotización Actual

```bash
GET /api/v1/prices/quote/:symbol?type=stock
```

**Ejemplos**:
```bash
# Acción
GET /api/v1/prices/quote/AAPL?type=stock

# Crypto
GET /api/v1/prices/quote/BTC?type=crypto

# ETF
GET /api/v1/prices/quote/SPY?type=etf
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "price": 189.45,
    "previousClose": 187.23,
    "change": 2.22,
    "changePercent": 1.18,
    "dayHigh": 190.12,
    "dayLow": 187.89,
    "volume": 54232100,
    "marketCap": 2987654321000,
    "currency": "USD",
    "timestamp": "2025-11-17T10:30:00.000Z",
    "displayName": "Apple Inc."
  }
}
```

### 3. Obtener Precios Históricos

```bash
GET /api/v1/prices/historical/:symbol?startDate=2024-01-01&endDate=2024-11-17&interval=1d
```

**Parámetros**:
- `startDate`: Fecha de inicio (YYYY-MM-DD) - Default: 30 días atrás
- `endDate`: Fecha de fin (YYYY-MM-DD) - Default: hoy
- `interval`: Intervalo de datos - Opciones: `1d`, `1wk`, `1mo`

**Ejemplo**:
```bash
GET /api/v1/prices/historical/AAPL?startDate=2024-10-01&endDate=2024-11-17&interval=1d
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "interval": "1d",
    "count": 32,
    "data": [
      {
        "date": "2024-10-01T00:00:00.000Z",
        "open": 185.50,
        "high": 187.25,
        "low": 184.90,
        "close": 186.45,
        "volume": 45678900
      },
      ...
    ]
  }
}
```

### 4. Buscar Símbolos

```bash
GET /api/v1/prices/search?q=apple
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "query": "apple",
    "count": 5,
    "results": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "type": "Equity",
        "exchange": "NASDAQ"
      },
      {
        "symbol": "AAPL.MX",
        "name": "Apple Inc.",
        "type": "Equity",
        "exchange": "Mexico"
      }
    ]
  }
}
```

### 5. Actualizar Precio de un Asset

```bash
POST /api/v1/prices/update/:assetId
```

**Ejemplo**:
```bash
POST /api/v1/prices/update/673abc123def456
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "asset": {
      "_id": "673abc123def456",
      "name": "Apple Inc.",
      "symbol": "AAPL",
      "currentPrice": 189.45,
      "lastPriceUpdate": "2025-11-17T10:30:00.000Z",
      ...
    },
    "priceData": {
      "symbol": "AAPL",
      "price": 189.45,
      "change": 2.22,
      "changePercent": 1.18,
      ...
    }
  },
  "message": "Price updated: $189.45"
}
```

### 6. Actualizar Todos los Precios

```bash
POST /api/v1/prices/update-all
```

Actualiza los precios de todos los assets que tienen un `symbol` definido.

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "updated": 15,
    "failed": 2,
    "skipped": 3,
    "details": [
      {
        "asset": "Apple Inc.",
        "symbol": "AAPL",
        "oldPrice": 187.23,
        "newPrice": 189.45,
        "change": 1.18,
        "status": "updated"
      },
      {
        "asset": "Unknown Stock",
        "symbol": "INVALID",
        "status": "failed",
        "reason": "No price data returned"
      }
    ]
  },
  "message": "Updated 15 assets"
}
```

### 7. Limpiar Caché

```bash
DELETE /api/v1/prices/cache
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "cleared": 25
  },
  "message": "Cache cleared successfully"
}
```

## Uso desde Frontend

### Ejemplo con React/JavaScript

```javascript
// Obtener cotización actual
const getQuote = async (symbol) => {
  const response = await fetch(`/api/v1/prices/quote/${symbol}?type=stock`);
  const data = await response.json();
  
  if (data.success && data.data) {
    console.log(`${symbol}: $${data.data.price}`);
    return data.data;
  }
  
  return null;
};

// Obtener históricos para gráfico
const getHistorical = async (symbol) => {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];
  
  const response = await fetch(
    `/api/v1/prices/historical/${symbol}?startDate=${startDate}&endDate=${endDate}&interval=1d`
  );
  const data = await response.json();
  
  if (data.success && data.data) {
    // Usar data.data.data para el gráfico
    return data.data.data;
  }
  
  return [];
};

// Buscar símbolos
const searchSymbols = async (query) => {
  if (query.length < 2) return [];
  
  const response = await fetch(`/api/v1/prices/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  
  return data.success ? data.data.results : [];
};

// Actualizar precio de un asset
const updateAssetPrice = async (assetId) => {
  const response = await fetch(`/api/v1/prices/update/${assetId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const data = await response.json();
  return data;
};
```

## Caché de Precios

El servicio incluye un caché interno de 1 minuto para:
- Reducir llamadas a la API
- Mejorar rendimiento
- Evitar límites de rate limiting

El caché se limpia automáticamente después de 1 minuto, o puedes limpiarlo manualmente con `DELETE /api/v1/prices/cache`.

## Rate Limiting

Para evitar saturar la API de RapidAPI:
- Se recomienda no hacer más de 5 req/segundo
- Hay un delay automático de 200ms entre assets en actualización masiva
- El caché ayuda a reducir llamadas duplicadas

## Manejo de Errores

Todos los endpoints retornan `null` o arrays vacíos cuando:
- El modo es `manual`
- No se encuentra el símbolo
- Hay un error de red
- La API key no es válida

**Ejemplo de respuesta en modo manual**:
```json
{
  "success": true,
  "data": null,
  "message": "Price data not available in manual mode or symbol not found"
}
```

## Símbolos Soportados

### Acciones (Stocks)
- Formato: `AAPL`, `MSFT`, `GOOGL`
- Exchanges: NYSE, NASDAQ, etc.

### ETFs
- Formato: `SPY`, `QQQ`, `VOO`

### Fondos Mutuos
- Formato: `VFIAX`, `FXAIX`

### Cryptocurrencies
- Formato: `BTC-USD`, `ETH-USD`, `ADA-USD`
- Se agrega automáticamente `-USD` si no está presente

### Índices
- Formato: `^GSPC` (S&P 500), `^DJI` (Dow Jones)

## Mejores Prácticas

1. **Usar caché**: No actualices los mismos precios constantemente
2. **Batch updates**: Usa `/prices/update-all` para actualizar múltiples assets
3. **Validar símbolos**: Usa `/prices/quote` para validar antes de guardar
4. **Buscar primero**: Usa `/prices/search` para ayudar al usuario a encontrar el símbolo correcto
5. **Modo manual en desarrollo**: Usa `PRICE_UPDATE_MODE=manual` si no tienes API key

## Troubleshooting

### "Price data not available"
- Verifica que `PRICE_UPDATE_MODE=auto`
- Verifica que `RAPIDAPI_KEY` esté configurada
- Revisa los logs del servidor

### "Symbol not found"
- Usa `/prices/search` para encontrar el símbolo correcto
- Verifica el formato del símbolo
- Para crypto, asegúrate que termine en `-USD`

### "Rate limit exceeded"
- Espera unos minutos antes de continuar
- Reduce la frecuencia de actualización
- Considera un plan superior en RapidAPI

## Costos

RapidAPI tiene diferentes planes:
- **Free**: ~100 requests/mes (desarrollo)
- **Basic**: ~1000 requests/mes
- **Pro**: Ilimitado

Calcula tus necesidades:
- Dashboard con 20 assets, actualizado cada hora = ~14,400 req/mes
- Modo manual para desarrollo, auto para producción
