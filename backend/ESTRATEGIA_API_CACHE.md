# Estrategia de Caché y Optimización de Llamadas API

## 🎯 Objetivo

**Minimizar las llamadas a SteadyAPI** almacenando los datos históricos en MongoDB y reutilizándolos.

---

## 📊 Fuentes de Datos

### 1. **Precios Actuales** → Yahoo Finance 15 API (RapidAPI)
- **Endpoint**: `/api/v1/markets/quotes?ticker=SPY`
- **Uso**: Obtener precio actual en tiempo real
- **Costo**: Bajo (1 llamada por actualización)
- **Función**: `fetchCurrentPrice()` en `priceService.js`

### 2. **Datos Históricos** → SteadyAPI
- **Endpoint**: `https://api.steadyapi.com/v2/markets/stock/historical`
- **Uso**: Obtener históricos de precios (últimos 10 años)
- **Costo**: Alto (evitar llamadas innecesarias)
- **Función**: `fetchHistoricalPrices()` en `priceService.js`

---

## 🔄 Estrategia de Caché en 3 Pasos

### **PASO 1: Verificar MongoDB**
Antes de llamar a la API, verificamos si ya tenemos los datos:

```javascript
const existingPricesCount = await PriceHistory.countDocuments({
  assetId,
  date: { $gte: firstDate, $lte: lastDate },
  source: { $in: ['steadyapi', 'yahoo_finance', 'api'] }, // Solo datos reales
});

const coveragePercentage = (existingPricesCount / expectedDays) * 100;

if (coveragePercentage > 80) {
  console.log('✅ Ya tenemos datos en MongoDB - Usando caché');
  return existingPrices; // ← NO llamar a la API
}
```

**Resultado**: Si tenemos >80% de cobertura, **NO llamamos a la API**.

---

### **PASO 2: Llamar a SteadyAPI (solo si es necesario)**
Solo si NO tenemos datos suficientes en MongoDB:

```javascript
const apiPrices = await priceService.fetchHistoricalPrices(
  asset.symbol,
  firstDate,
  lastDate,
  'STOCKS' // o 'ETF', 'MUTUALFUNDS'
);

if (apiPrices && apiPrices.length > 0) {
  console.log(`✅ Obtenidos ${apiPrices.length} precios de SteadyAPI`);
  
  // Guardar en MongoDB para reutilizar
  await PriceHistory.bulkInsertPrices(prices);
  
  return prices;
}
```

**Resultado**: Datos guardados en MongoDB con `source: 'steadyapi'`.

---

### **PASO 3: Fallback a Datos Sintéticos**
Solo si la API falla o no está configurada:

```javascript
console.log('📊 Generando datos sintéticos (API no disponible)');
// Generar datos basados en contribuciones + volatilidad
```

**Resultado**: Datos guardados en MongoDB con `source: 'synthetic'`.

---

## 💾 Estructura de Datos en MongoDB

### Colección: `pricehistories`

```javascript
{
  _id: ObjectId("..."),
  assetId: ObjectId("..."), // Referencia a Asset o Benchmark
  date: ISODate("2024-01-15T00:00:00.000Z"),
  open: 450.25,
  high: 455.80,
  low: 448.90,
  close: 453.40,
  volume: 98234567,
  source: "steadyapi", // ← CLAVE: Indica origen de datos
  currency: "USD",
  createdAt: ISODate("2025-11-17T18:00:00.000Z"),
  updatedAt: ISODate("2025-11-17T18:00:00.000Z")
}
```

### Valores de `source`:

| Valor | Descripción | Prioridad | Confiabilidad |
|-------|-------------|-----------|---------------|
| `steadyapi` | Datos reales de SteadyAPI | ⭐⭐⭐⭐⭐ | 100% |
| `yahoo_finance` | Datos reales de Yahoo Finance | ⭐⭐⭐⭐⭐ | 100% |
| `api` | Datos reales de cualquier API | ⭐⭐⭐⭐⭐ | 100% |
| `manual` | Datos ingresados manualmente | ⭐⭐⭐⭐ | 90% |
| `synthetic` | Datos generados algorítmicamente | ⭐⭐ | 50% |

---

## 🚀 Flujo Completo

### Caso 1: **Primera vez (sin datos en MongoDB)**

```
Usuario ejecuta seeder
    ↓
priceHistoryService.generateSyntheticPriceHistory()
    ↓
Verificar MongoDB → 0 registros (0% cobertura)
    ↓
🔍 Llamar a SteadyAPI
    ↓
✅ Obtener 756 precios reales
    ↓
💾 Guardar en MongoDB (source: 'steadyapi')
    ↓
✅ Listo - Datos disponibles
```

**Llamadas a API**: 1 por asset

---

### Caso 2: **Segunda vez (datos ya existen)**

```
Usuario ejecuta seeder nuevamente
    ↓
priceHistoryService.generateSyntheticPriceHistory()
    ↓
Verificar MongoDB → 756 registros (98% cobertura)
    ↓
✅ Datos ya existen en MongoDB
    ↓
⏭️  SALTAR llamada a API
    ↓
Retornar datos existentes
    ↓
✅ Listo - 0 llamadas a API
```

**Llamadas a API**: **0** (usa caché)

---

### Caso 3: **Actualización incremental**

```
Pasa tiempo, necesitamos datos más recientes
    ↓
priceHistoryService.generateSyntheticPriceHistory()
    ↓
Verificar MongoDB → 756 registros antiguos (65% cobertura)
    ↓
🔍 Llamar a SteadyAPI (solo fechas faltantes)
    ↓
✅ Obtener 30 precios nuevos
    ↓
💾 Agregar a MongoDB
    ↓
✅ Listo - 786 precios totales
```

**Llamadas a API**: 1 (solo para actualizar)

---

## 📈 Beneficios

### **Ahorro de Llamadas**
- **Primera ejecución**: 5 assets = 5 llamadas
- **Segunda ejecución**: 5 assets = **0 llamadas** ✅
- **Ahorro**: 100% en ejecuciones subsecuentes

### **Velocidad**
- **Con API**: ~3-5 segundos por asset
- **Con caché**: ~100ms por asset
- **Mejora**: **30-50x más rápido** ⚡

### **Costos**
- Evita consumir cuota de API innecesariamente
- Datos históricos permanecen estables (no cambian)
- Solo se actualiza el día actual

---

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Precios actuales (Yahoo Finance 15)
RAPIDAPI_KEY=ce78ed8c6bmshaddfdc4d775937bp1e4a87jsnffa5db8695a5
RAPIDAPI_HOST=yahoo-finance15.p.rapidapi.com

# Datos históricos (SteadyAPI)
STEADYAPI_KEY=1076|ze1KVqL96f846ZAv1P6gvZFAZg4003rsfjTFnBmC
STEADYAPI_BASE_URL=https://api.steadyapi.com

# Modo de actualización
PRICE_UPDATE_MODE=auto
```

---

## 🧪 Verificación

### Ver datos en MongoDB

```javascript
// Contar precios reales vs sintéticos
db.pricehistories.aggregate([
  { $group: { _id: '$source', count: { $sum: 1 } } }
])

// Resultado esperado:
[
  { _id: 'steadyapi', count: 3780 },  // ← Datos reales
  { _id: 'synthetic', count: 0 }      // ← Ninguno sintético
]
```

### Ver cobertura de un asset

```javascript
db.pricehistories.countDocuments({
  assetId: ObjectId("..."),
  source: { $in: ['steadyapi', 'api', 'yahoo_finance'] }
})
```

---

## 📝 Logs Esperados

### Primera ejecución (con llamadas a API):

```
🔍 Obteniendo datos REALES de SteadyAPI para SPY...
✅ Obtenidos 756 precios REALES de SteadyAPI para SPY
💾 Guardando en MongoDB para reutilizar...
```

### Segunda ejecución (usando caché):

```
✅ Ya existen 756 precios REALES en MongoDB para SPY (98% cobertura)
⏭️  Saltando llamada a API (usando datos existentes)
```

---

## 🎯 Resumen

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Llamadas por ejecución** | 5 assets × N veces | 5 assets × 1 vez |
| **Tiempo de ejecución** | ~20 segundos | ~500ms |
| **Uso de API** | 100% | 5% |
| **Datos en MongoDB** | 0 | Miles de registros |
| **Confiabilidad** | Depende de API | Datos persistentes |

**Conclusión**: Los datos históricos se obtienen **una sola vez** de SteadyAPI y se almacenan en MongoDB. Las ejecuciones subsecuentes usan los datos almacenados, minimizando costos y mejorando velocidad.
