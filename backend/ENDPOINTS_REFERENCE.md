# Referencia de Endpoints - APIs de Datos Financieros

Este documento describe todos los endpoints disponibles para obtener datos financieros, divididos entre **RapidAPI** (Yahoo Finance) y **SteadyAPI**.

---

## 📊 RapidAPI - Yahoo Finance (Datos en Tiempo Real)

### Configuración Base
- **Host**: `yahoo-finance15.p.rapidapi.com` (o `yahoo-finance127.p.rapidapi.com`, `yahoo-finance162.p.rapidapi.com`)
- **Base URL**: `https://{RAPIDAPI_HOST}/api`
- **Headers requeridos**:
  - `x-rapidapi-key`: Tu API key
  - `x-rapidapi-host`: El host configurado

### Modo de Operación
- Afectado por `PRICE_UPDATE_MODE` (manual/auto)
- Caché en memoria de 1 minuto para precios actuales
- Reintentos con backoff exponencial: 2s → 4s → 8s → 16s

---

## Endpoints RapidAPI Implementados en el Backend

### 1. Cotizaciones en Tiempo Real
**Endpoint**: `/api/v1/markets/quotes`
- **Método**: GET
- **Parámetros**: 
  - `ticker`: Símbolo del activo (ej: SPY, AAPL)
- **Ejemplo**: `/api/v1/markets/quotes?ticker=SPY`
- **Usado en**: `fetchCurrentPrice()` en `priceService.js`

### 2. Datos Históricos
**Endpoint**: `/api/v2/stock/history`
- **Método**: GET
- **Parámetros**:
  - `symbol`: Símbolo del activo
  - `from`: Fecha inicio (YYYY-MM-DD)
  - `to`: Fecha fin (YYYY-MM-DD)
- **Ejemplo**: `/api/v2/stock/history?symbol=SPY&from=2024-01-01&to=2024-12-31`
- **Usado en**: `fetchHistoricalPrices()` en `priceService.js`

### 3. Búsqueda de Símbolos
**Endpoint**: `/api/v1/search`
- **Método**: GET
- **Parámetros**:
  - `query`: Término de búsqueda
- **Ejemplo**: `/api/v1/search?query=Apple`
- **Usado en**: `searchSymbols()` en `priceService.js`

---

## 🌐 SteadyAPI - Datos Históricos Extensos

### Configuración Base
- **Base URL**: `https://api.steadyapi.com`
- **Headers requeridos**:
  - `Authorization`: Bearer {STEADYAPI_KEY}
  - `Accept`: application/json

### Modo de Operación
- **NO** afectado por `PRICE_UPDATE_MODE` (siempre intenta obtener datos si están configurados)
- Caché permanente en MongoDB
- Reintentos con backoff exponencial: 2s → 4s → 8s → 16s
- Timeout: 30 segundos

---

## Endpoints SteadyAPI Implementados

### 1. Datos Históricos (OHLCV)
**Endpoint**: `/v2/markets/stock/historical`
- **Método**: GET
- **Parámetros**:
  - `ticker`: Símbolo del activo (ej: 'AAPL', 'SPY')
  - `type`: Tipo de activo ('STOCKS', 'ETF', 'MUTUALFUNDS')
  - `from_date`: Fecha inicio (YYYY-MM-DD)
  - `to_date`: Fecha fin (YYYY-MM-DD)
  - `limit`: Máximo de registros (ej: 10000)
- **Ejemplo**: `/v2/markets/stock/historical?ticker=SPY&type=STOCKS&from_date=2015-01-01&to_date=2025-01-01&limit=10000`
- **Usado en**: `fetchHistoricalPrices()` en `priceService.js`
- **Respuesta**:
  ```json
  {
    "meta": { "status": 200, "message": "Success" },
    "body": [
      {
        "date": "01/15/2024",
        "open": "450.25",
        "high": "455.80",
        "low": "448.90",
        "close": "453.40",
        "volume": "98,234,567"
      }
    ]
  }
  ```
- **Características**:
  - Formato de fecha: MM/DD/YYYY
  - Números con comas (ej: "98,234,567")
  - Se transforma internamente a formato estándar
  - Se cachea en MongoDB con `source: 'steadyapi'`

---

## Endpoints RapidAPI Disponibles (No Implementados Aún)

### Market Data
- `/api/v2/markets/tickers` - Lista de tickers del mercado
  - Parámetros: `page`, `type` (STOCKS, ETF, etc.)
  
- `/api/v1/markets/insider-trades` - Operaciones internas
  
- `/api/v1/markets/screener` - Screener de mercado
  - Parámetros: `type` (most_actives, gainers, losers, etc.)

### Stock Information
- `/api/v1/stock/profile?ticker={symbol}` - Perfil de empresa
- `/api/v1/stock/statistics?ticker={symbol}` - Estadísticas clave
- `/api/v1/stock/financial-data?ticker={symbol}` - Datos financieros
- `/api/v1/stock/earnings?ticker={symbol}` - Información de ganancias
- `/api/v1/stock/balance-sheet?ticker={symbol}` - Balance sheet
- `/api/v1/stock/income-statement?ticker={symbol}` - Estado de resultados
- `/api/v1/stock/cashflow-statement?ticker={symbol}` - Estado de flujo de efectivo

### Options
- `/api/v1/options?ticker={symbol}` - Datos de opciones
- `/api/v1/unusual-options-activity` - Actividad inusual de opciones
- `/api/v1/most-active` - Opciones más activas

### News
- `/api/v2/markets/news?ticker={symbol}` - Noticias del mercado (v2)
- `/api/v1/markets/news?ticker={symbol}` - Noticias del mercado (v1)

### Calendar
- `/api/calendar/earnings` - Calendario de ganancias
- `/api/calendar/dividends` - Calendario de dividendos
- `/api/calendar/economic_events` - Eventos económicos
- `/api/calendar/ipo` - IPOs próximas
- `/api/calendar/stock-splits` - Stock splits

## Notas Importantes

1. **Pluralización**: Los endpoints de v1 usan `markets` (plural), no `market` (singular).

2. **Parámetros**: La mayoría usa `ticker` o `symbol` para identificar el activo.

3. **Rate Limiting**: El servicio implementa:
   - Caché de 1 minuto para evitar llamadas duplicadas
   - Delay de 200ms entre peticiones en bulk updates
   - Sistema de reintentos con backoff exponencial (2s, 4s, 8s, 16s)

4. **Modo Manual vs Auto**:
   - **Manual** (`PRICE_UPDATE_MODE=manual`): No hace llamadas a la API, retorna null
   - **Auto** (`PRICE_UPDATE_MODE=auto`): Hace llamadas reales a la API

5. **Estructura de Respuestas**: 
   - Generalmente incluyen `{ meta: {...}, body: [...] }`
   - El servicio maneja múltiples variaciones de estructura

## Variables de Entorno Requeridas

### Para RapidAPI (Yahoo Finance)
```env
RAPIDAPI_KEY=tu_api_key_aqui
RAPIDAPI_HOST=yahoo-finance15.p.rapidapi.com
PRICE_UPDATE_MODE=auto  # o 'manual' (solo afecta precios actuales)
```

### Para SteadyAPI (Históricos)
```env
STEADYAPI_KEY=tu_api_key_aqui
STEADYAPI_BASE_URL=https://api.steadyapi.com
```

**Nota**: Las variables de SteadyAPI son independientes del `PRICE_UPDATE_MODE`.

## Ejemplo de Uso en Código

```javascript
import priceService from './utils/priceService.js';

// Obtener precio actual
const price = await priceService.fetchCurrentPrice('AAPL', 'stock');

// Obtener datos históricos
const history = await priceService.fetchHistoricalPrices(
  'SPY',
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

// Buscar símbolos
const results = await priceService.searchSymbols('Apple');

// Info del servicio
const info = priceService.getPriceServiceInfo();
```

## Testing

Para probar los endpoints:

### RapidAPI (Yahoo Finance)
```bash
node test-working-endpoints.js  # Prueba endpoints RapidAPI confirmados
node test-all-endpoints.js      # Prueba todos los endpoints RapidAPI documentados
```

### SteadyAPI (Históricos)
```bash
node test-steadyapi.js          # Prueba la conexión a SteadyAPI
```

**Nota**: Los tests de SteadyAPI consumirán créditos de API. Úsalos solo cuando sea necesario.
