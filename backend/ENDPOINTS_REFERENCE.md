# Referencia de Endpoints - Yahoo Finance 15 API

## Configuración Base
- **Host**: `yahoo-finance15.p.rapidapi.com`
- **Base URL**: `https://yahoo-finance15.p.rapidapi.com/api`
- **Headers requeridos**:
  - `x-rapidapi-key`: Tu API key
  - `x-rapidapi-host`: yahoo-finance15.p.rapidapi.com

## Endpoints Implementados en el Backend

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

## Endpoints Disponibles (No Implementados Aún)

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

```env
RAPIDAPI_KEY=tu_api_key_aqui
RAPIDAPI_HOST=yahoo-finance15.p.rapidapi.com
PRICE_UPDATE_MODE=auto  # o 'manual'
```

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

Para probar los endpoints sin gastar peticiones de API:
```bash
# Ver los scripts de test disponibles
node test-working-endpoints.js  # Prueba endpoints confirmados
node test-all-endpoints.js      # Prueba todos los endpoints documentados
```
