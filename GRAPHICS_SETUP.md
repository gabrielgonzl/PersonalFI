# 📊 Sistema de Gráficos Financieros - Guía de Configuración

## ✅ Cambios Implementados

### Backend
1. ✅ **Modelo PriceHistory** - Almacena precios históricos OHLCV
2. ✅ **Modelo Benchmark** - Índices de mercado (S&P 500, BTC, etc.)
3. ✅ **Integración con Yahoo Finance** vía RapidAPI (SteadyAPI)
4. ✅ **Benchmark seleccionable por el usuario**
5. ✅ **Métricas de riesgo avanzadas** (Volatility, Sharpe, Max Drawdown, VaR, Beta, Alpha, HHI)
6. ✅ **Corrección de cálculos TWR y MWR** (ahora incluyen fees)
7. ✅ **Corrección de cálculos de ROI** (usan precios históricos reales)
8. ✅ **Granularidad múltiple** (día/semana/mes/año)

### Frontend
1. ✅ **LineChart mejorado** con zoom interactivo y brush
2. ✅ **Selector de granularidad** (diario/semanal/mensual)
3. ✅ **Dashboard de riesgo completo**
4. ✅ **Comparación con benchmarks**
5. ✅ **Nuevos hooks** para métricas de riesgo y benchmarking

---

## 🔧 Configuración Requerida

### 1. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en `backend/` con:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/personalfi

# Yahoo Finance via RapidAPI (SteadyAPI)
# Obtén tu API key en: https://rapidapi.com/steadyapi/api/yahoo-finance162
RAPIDAPI_KEY=tu_api_key_de_rapidapi
RAPIDAPI_HOST=yahoo-finance162.p.rapidapi.com

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Obtener API Key de RapidAPI

1. Ve a https://rapidapi.com/
2. Crea una cuenta (gratis)
3. Suscríbete al API "Yahoo Finance" de SteadyAPI: https://rapidapi.com/steadyapi/api/yahoo-finance162
4. El plan gratuito incluye 500 requests/mes
5. Copia tu `X-RapidAPI-Key` y agrégala al `.env` como `RAPIDAPI_KEY`

### 4. Poblar Datos Históricos

```bash
cd backend
node src/seeders/priceHistorySeeder.js
```

Esto generará:
- ✅ Benchmarks predeterminados (S&P 500, EUROSTOXX, BTC, ETH, MSCI World)
- ✅ Precios históricos sintéticos para tus assets (últimos 3 años)
- ✅ Precios históricos sintéticos para benchmarks

### 5. Iniciar el Backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Server running on port 5000
📊 MongoDB connected
```

### 6. Iniciar el Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📱 Cómo Seleccionar Tu Benchmark Personalizado

### Opción 1: Vía API (Recomendado)

```bash
# Actualizar el benchmark preferido a Bitcoin
curl -X PUT http://localhost:5000/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{"preferredBenchmark": "BTC"}'

# Opciones disponibles:
# - SPY (S&P 500) - Default
# - SX5E (EURO STOXX 50)
# - URTH (MSCI World)
# - BTC (Bitcoin)
# - ETH (Ethereum)
```

### Opción 2: Vía Frontend (Próximamente)

Una interfaz de configuración se agregará en Settings para seleccionar el benchmark visualmente.

---

## 📊 Endpoints Nuevos del Backend

### Analytics - Métricas de Riesgo
```
GET /api/v1/analytics/risk-metrics?period=1y
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "volatility": 15.2,
    "sharpeRatio": 1.45,
    "maxDrawdown": {
      "maxDrawdownPercentage": -12.5,
      "peakValue": 10000,
      "troughValue": 8750
    },
    "var95": { "var": 0.023, "percentile": -2.3 },
    "diversification": {
      "hhi": 0.25,
      "effectiveAssets": 4,
      "diversificationScore": 40
    }
  }
}
```

### Analytics - Benchmarks Disponibles
```
GET /api/v1/analytics/benchmarks
```

### Analytics - Benchmark Recomendado
```
GET /api/v1/analytics/recommended-benchmark
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "symbol": "SPY",
    "name": "S&P 500",
    "reason": "Benchmark seleccionado por el usuario"
  }
}
```

### Analytics - Comparación con Benchmark
```
GET /api/v1/analytics/benchmark/SPY?period=1y
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "benchmark": "S&P 500",
    "symbol": "SPY",
    "metrics": {
      "beta": 1.15,
      "alpha": 2.5,
      "correlation": 0.85,
      "outperformance": 5.2
    },
    "chartData": {
      "portfolio": [...],
      "benchmark": [...]
    }
  }
}
```

### Analytics - Performance con Granularidad
```
GET /api/v1/analytics/performance?period=1y&granularity=week
```

Granularidad disponible: `day`, `week`, `month`, `year`

---

## 🎨 Nuevas Funcionalidades del Frontend

### 1. Zoom Interactivo en Gráficos
- Click y arrastra para hacer zoom en un área específica
- Botón "Reset zoom" para volver a la vista completa

### 2. Brush Selector
- Barra deslizante en la parte inferior del gráfico
- Permite navegar grandes cantidades de datos fácilmente

### 3. Selector de Granularidad
- Cambiar entre vista diaria, semanal o mensual
- Útil para analizar diferentes horizontes temporales

### 4. Dashboard de Riesgo
Métricas visualizadas:
- Volatilidad Anualizada
- Sharpe Ratio
- Maximum Drawdown
- VaR 95%
- Assets Efectivos
- Score de Diversificación

### 5. Comparación con Benchmark
- Gráfico comparativo normalizado (Base 100)
- Métricas: Beta, Alpha, Correlación, Outperformance

---

## 🔍 Solución de Problemas

### Error: "Cannot read properties of null (reading 'symbol')"

**Causa**: Los benchmarks no están inicializados en la base de datos.

**Solución**:
```bash
cd backend
node src/seeders/priceHistorySeeder.js
```

### Error: "No se recibió respuesta del servidor"

**Causa**: El backend no está corriendo o hay error de conexión.

**Solución**:
1. Verifica que el backend esté corriendo: `cd backend && npm run dev`
2. Verifica que MongoDB esté conectado
3. Revisa los logs del backend en la consola

### Gráficos vacíos o sin datos

**Causa**: No hay precios históricos generados.

**Solución**:
```bash
cd backend
node src/seeders/priceHistorySeeder.js
```

### Precios en tiempo real no se actualizan

**Causa**: No has configurado `RAPIDAPI_KEY` en el `.env`.

**Solución**:
1. Obtén una API key de RapidAPI (ver sección "Obtener API Key")
2. Agrégala al archivo `.env` como `RAPIDAPI_KEY=tu_api_key`
3. Reinicia el backend

**Nota**: Sin API key, el sistema funciona en "modo manual" con precios sintéticos.

---

## 📈 Ejemplo de Uso Completo

### Paso 1: Configurar el Sistema
```bash
# Backend
cd backend
npm install
# Crear .env con las variables requeridas
node src/seeders/priceHistorySeeder.js
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

### Paso 2: Acceder a la Aplicación
```
http://localhost:5173
```

### Paso 3: Ver Analytics
1. Navega a la página "Analytics"
2. Selecciona el período (1 semana, 1 mes, 3 meses, etc.)
3. Selecciona la granularidad (diario, semanal, mensual)
4. Haz zoom en el gráfico para explorar períodos específicos

### Paso 4: Configurar Tu Benchmark Preferido
```bash
# Opción 1: API
curl -X PUT http://localhost:5000/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{"preferredBenchmark": "BTC"}'

# Opción 2: MongoDB directamente
use personalfi
db.settings.updateOne({}, {$set: {preferredBenchmark: "BTC"}})
```

### Paso 5: Ver Métricas de Riesgo
- Scroll down en la página Analytics
- Verás el dashboard de riesgo con todas las métricas
- Compara tu portfolio con el benchmark seleccionado

---

## 🎯 Benchmarks Disponibles

| Símbolo | Nombre | Categoría | Descripción |
|---------|--------|-----------|-------------|
| **SPY** | S&P 500 | Stocks USA | Índice de las 500 mayores empresas de EE.UU. |
| **SX5E** | EURO STOXX 50 | Stocks Europa | Índice de las 50 mayores empresas de la Eurozona |
| **URTH** | MSCI World | Stocks Global | Índice global de mercados desarrollados |
| **BTC** | Bitcoin | Crypto | Bitcoin como benchmark crypto |
| **ETH** | Ethereum | Crypto | Ethereum como benchmark crypto |

---

## 📝 Próximos Pasos Sugeridos

1. **Agregar más benchmarks** (Nasdaq, DAX, etc.)
2. **Interfaz de Settings** para seleccionar benchmark visualmente
3. **Integrar API real** de Yahoo Finance (actualmente usa datos sintéticos)
4. **Candlestick charts** para análisis técnico
5. **Exportar reportes** a PDF/Excel

---

## 💡 Consejos

1. **Modo Manual vs API Real**:
   - Sin API key: Usa precios sintéticos (ideal para desarrollo)
   - Con API key: Usa precios reales de Yahoo Finance

2. **Generación de Precios Históricos**:
   - Los precios sintéticos son generados basándose en tus contribuciones
   - Siguen patrones realistas de volatilidad según el tipo de activo
   - Son perfectos para desarrollo y testing

3. **Rate Limiting**:
   - El plan gratuito de RapidAPI tiene 500 requests/mes
   - El sistema implementa rate limiting (200ms entre requests)
   - Suficiente para actualizar ~50 assets/día

4. **Benchmark Recomendado**:
   - Si no seleccionas uno, el sistema lo recomienda automáticamente
   - Se basa en el tipo de activos dominante en tu portfolio
   - Portfolio de crypto → BTC
   - Portfolio de stocks → SPY

---

## 🚀 Conclusión

Ahora tienes un sistema de gráficos financieros profesional con:
- ✅ Precios históricos reales o sintéticos
- ✅ Métricas de riesgo avanzadas
- ✅ Comparación con benchmarks
- ✅ Gráficos interactivos con zoom
- ✅ Benchmark personalizable

**¡Disfruta tu nuevo sistema de analytics!** 📊🎉
