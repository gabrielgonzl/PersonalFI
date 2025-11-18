# Estrategia de Enrutamiento de APIs

## 🎯 Objetivo

Clarificar qué endpoints se manejan a través de **RapidAPI** y cuáles a través de **SteadyAPI** para optimizar costos y rendimiento.

---

## 📊 División de Responsabilidades

### **RapidAPI (Yahoo Finance)** - Datos en Tiempo Real y Endpoints Diversos

**Host**: `yahoo-finance127.p.rapidapi.com` o `yahoo-finance162.p.rapidapi.com` o `yahoo-finance15.p.rapidapi.com`

**Autenticación**:
```javascript
headers: {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST
}
```

#### Market Data
- ✅ `GET /v1/market/tickers` - Lista de tickers del mercado
- ✅ `GET /v1/search` - Búsqueda de símbolos
- ✅ `GET /v1/market/quotes` (real-time) - Cotizaciones en tiempo real
- ✅ `GET /v1/market/quotes` (snapshots) - Snapshots de cotizaciones
- ✅ `GET /v2/stock/history` - Datos históricos (alternativa a SteadyAPI)
- ✅ `GET /v1/stock/history` - Datos históricos (v1)
- ✅ `GET /v1/market/screener` - Screener de mercado
- ✅ `GET /v1/stock/modules` - Módulos de stock
- ✅ `GET /v1/insider-trades` - Operaciones internas
- ✅ `GET /v2/market/news` - Noticias del mercado (v2)
- ✅ `GET /v1/market/news` - Noticias del mercado (v1)

#### Options
- ✅ `GET /v1/options` - Datos de opciones
- ✅ `GET /v1/unusual-options-activity` - Actividad inusual de opciones
- ✅ `GET /v1/most-active` - Opciones más activas

#### Stocks - Información Fundamental
- ✅ `GET /v1/stock/profile` - Perfil de empresa
- ✅ `GET /v1/stock/statistics` - Estadísticas clave
- ✅ `GET /v1/stock/financial-data` - Datos financieros
- ✅ `GET /v1/stock/sec-filings` - Archivos SEC
- ✅ `GET /v1/stock/earnings` - Información de ganancias
- ✅ `GET /v1/stock/calendar-events` - Eventos de calendario
- ✅ `GET /v1/stock/insider-holders` - Tenedores internos
- ✅ `GET /v1/stock/balance-sheet` - Balance sheet
- ✅ `GET /v1/stock/institution-ownership` - Propiedad institucional
- ✅ `GET /v1/stock/insider-transactions` - Transacciones internas
- ✅ `GET /v1/stock/index-trend` - Tendencia de índice
- ✅ `GET /v1/stock/income-statement` - Estado de resultados
- ✅ `GET /v1/stock/cashflow-statement` - Estado de flujo de efectivo
- ✅ `GET /v1/stock/recommendation-trend` - Tendencia de recomendaciones
- ✅ `GET /v1/stock/net-share-purchase-activity` - Actividad de compra neta de acciones
- ✅ `GET /v1/stock/upgrade-downgrade-history` - Historial de upgrades/downgrades

**Uso**: Todos los datos **excepto históricos extensos** (10 años)

---

### **SteadyAPI** - Datos Históricos Extensos (10 años)

**Base URL**: `https://api.steadyapi.com`

**Autenticación**:
```javascript
headers: {
  'Authorization': `Bearer ${STEADYAPI_KEY}`,
  'Accept': 'application/json'
}
```

#### Historical Data
- ✅ `GET /v2/markets/stock/historical` - Datos históricos OHLCV (10 años)
  - **Parámetros**:
    - `ticker`: Símbolo del activo (ej: 'AAPL', 'SPY')
    - `type`: Tipo de activo ('STOCKS', 'ETF', 'MUTUALFUNDS')
    - `from_date`: Fecha inicio (YYYY-MM-DD)
    - `to_date`: Fecha fin (YYYY-MM-DD)
    - `limit`: Máximo de registros (ej: 10000)

**Uso**: **Solo para datos históricos extensos** que se cachean en MongoDB

**Características**:
- Datos históricos de hasta 10 años
- Alta cobertura de datos OHLCV (Open, High, Low, Close, Volume)
- Se cachea en MongoDB para evitar llamadas repetidas
- No afectado por `PRICE_UPDATE_MODE` (manual/auto)

---

## 🔄 Flujo de Trabajo

### **1. Precios en Tiempo Real** → RapidAPI
```javascript
// Endpoint: /v1/market/quotes
const price = await priceService.fetchCurrentPrice('AAPL', 'stock');
```

**Características**:
- Caché de 1 minuto en memoria
- Afectado por `PRICE_UPDATE_MODE`
- Usado para: actualización de precios actuales, dashboards, cotizaciones

---

### **2. Datos Históricos** → SteadyAPI (prioritario) o RapidAPI (fallback)
```javascript
// Endpoint SteadyAPI: /v2/markets/stock/historical
const history = await priceService.fetchHistoricalPrices(
  'SPY',
  new Date('2015-01-01'),
  new Date('2025-01-01'),
  'STOCKS'
);
```

**Estrategia de Caché (3 pasos)**:
1. **Verificar MongoDB** → Si existe 80%+ de datos, usar caché
2. **Llamar SteadyAPI** → Solo si faltan datos
3. **Fallback a sintéticos** → Solo si SteadyAPI falla

**Características**:
- Caché permanente en MongoDB
- **NO** afectado por `PRICE_UPDATE_MODE`
- Usado para: gráficos históricos, análisis, backtesting

---

### **3. Búsqueda y Otros Datos** → RapidAPI
```javascript
// Endpoint: /v1/search
const results = await priceService.searchSymbols('Apple');

// Endpoint: /v1/stock/profile
const profile = await fetchStockProfile('AAPL');
```

**Características**:
- Sin caché (datos cambian frecuentemente)
- Afectado por `PRICE_UPDATE_MODE`
- Usado para: búsqueda, información fundamental, noticias

---

## ⚙️ Configuración

### Variables de Entorno

```env
# RapidAPI (para precios actuales y endpoints diversos)
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=yahoo-finance162.p.rapidapi.com

# SteadyAPI (para datos históricos extensos)
STEADYAPI_KEY=your_steadyapi_key_here
STEADYAPI_BASE_URL=https://api.steadyapi.com

# Modo de actualización (solo afecta precios actuales)
PRICE_UPDATE_MODE=manual  # o 'auto'
```

---

## 📝 Notas Importantes

### 1. **Modo Manual vs Auto**
- **Solo afecta**: Precios actuales (`fetchCurrentPrice`)
- **NO afecta**: Datos históricos (`fetchHistoricalPrices`)
- **Razón**: Los históricos se obtienen una vez y se cachean

### 2. **Caché Inteligente**
- **Memoria** (1 min): Para precios actuales
- **MongoDB** (permanente): Para datos históricos
- **Verificación**: Antes de llamar API, se verifica MongoDB

### 3. **Rate Limiting**
- Delay de 200ms entre peticiones bulk
- Sistema de reintentos con backoff exponencial: 2s → 4s → 8s → 16s
- Máximo 4 reintentos

### 4. **Formato de Datos**

**SteadyAPI Response**:
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

**Transformación Interna**:
```javascript
{
  date: new Date('2024-01-15'),
  open: 450.25,
  high: 455.80,
  low: 448.90,
  close: 453.40,
  volume: 98234567
}
```

---

## 🚀 Testing

### Test SteadyAPI
```bash
node test-steadyapi.js
```

### Test RapidAPI
```bash
node test-working-endpoints.js
```

---

## 📊 Decisión de Enrutamiento

| Dato Solicitado | API Usada | Razón |
|----------------|-----------|-------|
| Precio actual | RapidAPI | Tiempo real, actualización frecuente |
| Histórico (10 años) | SteadyAPI | Datos extensos, se cachean |
| Búsqueda de símbolos | RapidAPI | Datos actualizados |
| Información fundamental | RapidAPI | Muchos endpoints disponibles |
| Noticias | RapidAPI | Contenido en tiempo real |
| Opciones | RapidAPI | Datos de mercado |
| Screener | RapidAPI | Análisis de mercado |

---

## ✅ Checklist de Implementación

- [x] Variables de entorno configuradas
- [x] SteadyAPI independiente del modo manual/auto
- [x] Sistema de caché en MongoDB
- [x] Transformación de datos de SteadyAPI
- [x] Manejo de errores detallado
- [x] Reintentos con backoff exponencial
- [x] Documentación de endpoints
- [ ] Tests de integración
- [ ] Monitoreo de uso de API

---

## 📖 Referencias

- [Documentación RapidAPI](ENDPOINTS_REFERENCE.md)
- [Estrategia de Caché](ESTRATEGIA_API_CACHE.md)
- [Datos Reales vs Simulados](DATOS_REALES_VS_SIMULADOS.md)
