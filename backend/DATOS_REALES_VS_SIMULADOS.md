# Datos Reales vs Simulados - Resumen de Cambios

## ✅ CAMBIOS REALIZADOS

Se ha modificado el backend para **PRIORIZAR datos reales** de Yahoo Finance API sobre datos simulados.

### Archivos Modificados

#### 1. `/backend/src/services/priceHistoryService.js`
**ANTES**: Generaba precios históricos sintéticos usando `Math.random()`
**AHORA**: 
- ✅ **Prioridad 1**: Intenta obtener datos REALES de Yahoo Finance API usando `fetchHistoricalPrices()`
- ⚠️ **Fallback**: Solo genera datos sintéticos si la API falla o no está disponible
- 📊 Marca la fuente de datos: `source: 'yahoo_finance'` vs `source: 'synthetic'`

```javascript
// NUEVO FLUJO:
1. Intentar fetchHistoricalPrices() de Yahoo Finance API
2. Si obtiene datos reales → usarlos (source: 'yahoo_finance')
3. Si falla → generar sintéticos como fallback (source: 'synthetic')
```

#### 2. `/backend/src/services/benchmarkService.js`
**ANTES**: Generaba precios de benchmarks sintéticos usando `Math.random()`
**AHORA**:
- ✅ **Prioridad 1**: Intenta obtener datos REALES de Yahoo Finance API
- ⚠️ **Fallback**: Solo genera datos sintéticos si la API falla
- 📊 Marca la fuente: `source: 'yahoo_finance'` vs `source: 'synthetic'`

```javascript
// NUEVO FLUJO para benchmarks (SPY, BTC, ETH, etc):
1. Intentar fetchHistoricalPrices() de Yahoo Finance API
2. Si obtiene datos reales → usarlos y guardarlos en BD
3. Si falla → generar sintéticos como fallback
```

---

## 🔧 SERVICIOS QUE YA USABAN DATOS REALES

Estos servicios **NO necesitaron cambios** porque ya estaban bien configurados:

### ✅ `/backend/src/utils/priceService.js`
**Estado**: Correcto desde el principio
- `fetchCurrentPrice()` → Obtiene precios en tiempo real de Yahoo Finance API
- `fetchHistoricalPrices()` → Obtiene datos históricos reales de `/api/v2/stock/history`
- `updateAssetsPrices()` → Actualiza múltiples assets con precios reales
- Todos respetan `PRICE_UPDATE_MODE=auto` vs `manual`

### ✅ `/backend/src/controllers/priceController.js`
**Estado**: Correcto desde el principio
- Usa `priceService.fetchCurrentPrice()` para obtener precios actuales
- Usa `priceService.fetchHistoricalPrices()` para datos históricos
- Usa `priceService.updateAssetsPrices()` para actualizaciones masivas

### ✅ `/backend/src/services/analyticsService.js`
**Estado**: Correcto desde el principio
- Usa `PriceHistory.getPriceAtDate()` que obtiene precios de la BD
- Los precios en BD provienen de Yahoo Finance API (gracias a los cambios)
- Calcula métricas usando datos reales cuando están disponibles

---

## 📊 FLUJO COMPLETO DE DATOS REALES

### 1. **Precios Actuales** (Tiempo Real)
```
Usuario solicita precio actual
    ↓
priceController.getCurrentPrice()
    ↓
priceService.fetchCurrentPrice(symbol)
    ↓
Yahoo Finance API: /api/v1/markets/quotes?ticker=SPY
    ↓
Respuesta con precio REAL
    ↓
Guardar en BD + Retornar al usuario
```

### 2. **Precios Históricos** (Para gráficos)
```
Usuario solicita historial
    ↓
priceController.getHistoricalPrices()
    ↓
priceService.fetchHistoricalPrices(symbol, from, to)
    ↓
Yahoo Finance API: /api/v2/stock/history?symbol=SPY&from=2024-01-01&to=2024-12-31
    ↓
Respuesta con array de precios REALES
    ↓
Guardar en PriceHistory + Retornar
```

### 3. **Generación de Históricos** (Primera vez o faltantes)
```
Sistema necesita históricos para analytics
    ↓
priceHistoryService.generateSyntheticPriceHistory(assetId)
    ↓
🔍 INTENTAR: priceService.fetchHistoricalPrices(symbol, from, to)
    ↓
SI SUCCESS → Guardar datos REALES (source: 'yahoo_finance')
    ↓
SI FAIL → Generar sintéticos (source: 'synthetic')
    ↓
Guardar en PriceHistory
```

### 4. **Benchmarks** (SPY, BTC, etc)
```
Sistema compara con benchmark
    ↓
benchmarkService.generateSyntheticBenchmarkPrices(benchmarkId, from, to)
    ↓
🔍 INTENTAR: priceService.fetchHistoricalPrices(symbol, from, to)
    ↓
SI SUCCESS → Guardar datos REALES del benchmark
    ↓
SI FAIL → Generar sintéticos para benchmark
    ↓
Comparar portfolio vs benchmark real
```

---

## 🎯 VERIFICACIÓN DE FUENTE DE DATOS

Para saber si estás usando datos reales o sintéticos:

```javascript
// Query en MongoDB
db.pricehistories.find({ source: 'yahoo_finance' }).count()  // Datos REALES
db.pricehistories.find({ source: 'synthetic' }).count()      // Datos SIMULADOS

// Ver distribución
db.pricehistories.aggregate([
  { $group: { _id: '$source', count: { $sum: 1 } } }
])
```

**Resultado esperado con API configurada:**
```javascript
[
  { _id: 'yahoo_finance', count: 5240 },  // ← Mayoría datos reales
  { _id: 'synthetic', count: 120 }        // ← Solo fallbacks
]
```

---

## ⚙️ CONFIGURACIÓN REQUERIDA

Para que funcione con datos REALES, verificar `.env`:

```env
# MODO AUTOMÁTICO (usa API real)
PRICE_UPDATE_MODE=auto

# API CREDENTIALS
RAPIDAPI_KEY=ce78ed8c6bmshaddfdc4d775937bp1e4a87jsnffa5db8695a5
RAPIDAPI_HOST=yahoo-finance15.p.rapidapi.com
```

**Si está en modo manual:**
```env
PRICE_UPDATE_MODE=manual  # ← No hace llamadas a API, solo datos manuales
```

---

## 🧪 TESTING

### Verificar que usa datos reales:

```bash
# 1. Obtener precio actual (debe llamar a API)
curl http://localhost:5000/api/prices/current?symbol=SPY&type=stock

# 2. Obtener históricos (debe llamar a API)
curl "http://localhost:5000/api/prices/historical?symbol=SPY&startDate=2024-01-01&endDate=2024-12-31"

# 3. Ver logs del servidor
# Deberías ver:
#   🔍 Intentando obtener datos REALES de Yahoo Finance para SPY...
#   ✅ Obtenidos 252 precios REALES de Yahoo Finance para SPY
```

### Verificar en BD:

```javascript
// En MongoDB Compass o mongosh
db.pricehistories.findOne({ source: 'yahoo_finance' })
// Debería mostrar datos con source: 'yahoo_finance'

// Si ves muchos con source: 'synthetic', significa que la API falló
db.pricehistories.countDocuments({ source: 'synthetic' })
```

---

## 📝 NOTAS IMPORTANTES

1. **Prioridad**: Siempre se intenta obtener datos reales primero
2. **Fallback**: Solo se usan datos sintéticos si la API falla o no está disponible
3. **Marcado**: Los datos tienen campo `source` para saber su origen
4. **Caché**: Los datos reales se cachean 60 segundos para evitar llamadas duplicadas
5. **Rate Limiting**: Delay de 200ms entre peticiones para no saturar la API

---

## ✅ RESUMEN

| Componente | Estado | Fuente de Datos |
|-----------|--------|-----------------|
| `priceService.js` | ✅ Correcto | Yahoo Finance API (datos reales) |
| `priceHistoryService.js` | ✅ Actualizado | Yahoo Finance → Sintéticos (fallback) |
| `benchmarkService.js` | ✅ Actualizado | Yahoo Finance → Sintéticos (fallback) |
| `analyticsService.js` | ✅ Correcto | Lee de BD (datos reales si están disponibles) |
| `priceController.js` | ✅ Correcto | Usa priceService (datos reales) |

**Conclusión**: El backend ahora **prioriza datos reales** de Yahoo Finance API. Solo genera datos sintéticos como fallback cuando la API no está disponible o falla.
