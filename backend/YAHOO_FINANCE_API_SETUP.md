# Yahoo Finance API - Guía de Configuración

## Estado Actual de la Integración

✅ **Implementación completada**
- Servicio de precios configurado en `src/utils/priceService.js`
- Reintentos con backoff exponencial implementados (2s, 4s, 8s, 16s)
- Sistema de caché para optimizar llamadas a la API
- Endpoints correctos configurados para yahoo-finance15 API
- Manejo robusto de errores

⚠️ **Acción requerida: Suscripción a la API**

Las pruebas indican que la API key proporcionada recibe errores **403 Access Denied**. Esto significa que necesitas:
1. Verificar que estás suscrito a la API en RapidAPI
2. Confirmar que tu plan incluye los endpoints necesarios
3. Asegurarte de que la API key es válida y no ha expirado

---

## 🔑 Configuración de RapidAPI

### Paso 1: Obtener acceso a Yahoo Finance API

1. **Ir a RapidAPI**
   - Visita: https://rapidapi.com/hub
   - Inicia sesión o crea una cuenta

2. **Buscar y suscribirse a Yahoo Finance15 API**
   - Busca: "Yahoo Finance15" o "yahoo-finance15"
   - URL directa: https://rapidapi.com/search/yahoo-finance
   - Selecciona el plan que necesites (hay planes gratuitos y de pago)

3. **Obtener tu API Key**
   - Una vez suscrito, ve a tu dashboard
   - Copia tu API Key (X-RapidAPI-Key)
   - La API key se ve algo así: `ce78ed8c6bmshaddfdc4d775937bp1e4a87jsnffa5db8695a5`

### Paso 2: Configurar las variables de entorno

1. **Actualizar el archivo `.env`** en la carpeta `backend/`

```env
# API Configuration - Yahoo Finance API
RAPIDAPI_KEY=tu_api_key_aqui
RAPIDAPI_HOST=yahoo-finance15.p.rapidapi.com
PRICE_UPDATE_MODE=auto
```

2. **Modos de operación**
   - `PRICE_UPDATE_MODE=manual` - Los precios deben actualizarse manualmente
   - `PRICE_UPDATE_MODE=auto` - Los precios se actualizan automáticamente desde la API

---

## 📡 Endpoints Disponibles

El servicio utiliza los siguientes endpoints de Yahoo Finance API:

### 1. Cotizaciones en tiempo real
```
GET /api/v1/market/quotes?ticker=AAPL
```
- Obtiene el precio actual y datos del mercado
- Parámetros: `ticker` (símbolo del activo)

### 2. Datos históricos
```
GET /api/v2/stock/history?symbol=MSFT&from=2024-01-01&to=2024-12-31
```
- Obtiene precios históricos para gráficos
- Parámetros: `symbol`, `from`, `to` (fechas en formato YYYY-MM-DD)

### 3. Búsqueda de símbolos
```
GET /api/v1/search?query=Tesla
```
- Busca símbolos por nombre o keyword
- Parámetros: `query` (término de búsqueda)

### 4. Información de mercados
```
GET /api/v2/markets/tickers?page=1&type=STOCKS
```
- Lista de tickers disponibles
- Parámetros: `page`, `type` (STOCKS, ETF, CRYPTO, etc.)

---

## 🧪 Probar la Integración

### Scripts de prueba disponibles:

```bash
# Probar la conexión completa con todos los endpoints
node test-api-connection.js

# Probar endpoints específicos
node test-correct-endpoints.js

# Prueba simple de autenticación
node test-simple-request.js
```

### Ejemplo de salida exitosa:

```
✅ Configuration looks good!
   Mode: auto
   Auto Enabled: true
   API Configured: true

✅ Success!
   Price: $175.23
   Change: +1.45%
   Previous Close: $172.89
```

### Si ves errores 403:

```
❌ Error: 403 - Access denied

Posibles causas:
1. No estás suscrito a yahoo-finance15 en RapidAPI
2. Tu API key ha expirado
3. Tu plan no incluye estos endpoints
4. Has excedido el límite de llamadas
```

**Solución:** Verifica tu suscripción en https://rapidapi.com/

---

## 🚀 Uso del Servicio

### Desde el controlador (API REST)

```javascript
import priceService from '../utils/priceService.js';

// Obtener precio actual
const quote = await priceService.fetchCurrentPrice('AAPL', 'stock');
console.log(`Precio de AAPL: $${quote.price}`);

// Obtener histórico
const historical = await priceService.fetchHistoricalPrices(
  'MSFT',
  new Date('2024-01-01'),
  new Date('2024-12-31'),
  '1d'
);

// Buscar símbolos
const results = await priceService.searchSymbols('Tesla');
```

### Endpoints de la API REST

```bash
# Obtener información del servicio
GET /api/prices/info

# Obtener cotización de un símbolo
GET /api/prices/quote/AAPL

# Obtener histórico
GET /api/prices/historical/MSFT?startDate=2024-01-01&endDate=2024-12-31

# Buscar símbolos
GET /api/prices/search?q=Tesla

# Actualizar todos los precios
POST /api/prices/update-all

# Actualizar precio de un asset específico
POST /api/prices/update/:assetId

# Limpiar caché
DELETE /api/prices/cache
```

---

## ⚙️ Características Implementadas

### 1. **Reintentos con Backoff Exponencial**
- Reintentos automáticos en caso de errores de red
- Delays: 2s → 4s → 8s → 16s
- Máximo 4 reintentos por petición

### 2. **Sistema de Caché**
- TTL de 1 minuto para precios en tiempo real
- Reduce llamadas innecesarias a la API
- Mejora el rendimiento

### 3. **Manejo de Errores**
- Logging detallado de errores
- Respuestas null en lugar de excepciones
- Modo manual como fallback

### 4. **Soporte Multi-Tipo**
- Stocks (acciones)
- Crypto (criptomonedas - añade automáticamente -USD)
- ETFs
- Índices

---

## 🔒 Seguridad

- Las API keys están en `.env` (no en el código)
- `.env` está en `.gitignore` (no se sube al repositorio)
- Usa `.env.example` como plantilla
- No expongas tu API key en logs o respuestas públicas

---

## 📊 Límites y Planes

Los límites dependen de tu plan de RapidAPI:

- **Plan Gratuito:** ~100-500 llamadas/mes
- **Plan Basic:** ~10,000 llamadas/mes
- **Plan Pro:** ~100,000 llamadas/mes

Verifica tu plan actual en: https://rapidapi.com/dashboard

---

## 🐛 Troubleshooting

### Error: "Access denied"
**Causa:** No estás suscrito o la API key es inválida
**Solución:** Suscríbete a yahoo-finance15 en RapidAPI

### Error: "Rate limit exceeded"
**Causa:** Has excedido el límite de llamadas de tu plan
**Solución:** Espera o actualiza tu plan

### Error: "Symbol not found"
**Causa:** El símbolo no existe en Yahoo Finance
**Solución:** Verifica el símbolo correcto (ej: AAPL, BTC-USD)

### Precios no se actualizan
**Causa:** PRICE_UPDATE_MODE está en 'manual'
**Solución:** Cambia a 'auto' en `.env`

---

## 📞 Soporte

- Documentación de RapidAPI: https://rapidapi.com/guides
- Yahoo Finance API docs: https://rapidapi.com/search/yahoo-finance
- Issues del proyecto: [GitHub Issues]

---

## ✅ Checklist de Configuración

- [ ] Cuenta creada en RapidAPI
- [ ] Suscrito a yahoo-finance15 API
- [ ] API Key copiada
- [ ] `.env` configurado con RAPIDAPI_KEY
- [ ] `.env` configurado con PRICE_UPDATE_MODE=auto
- [ ] Ejecutado `npm install` en backend/
- [ ] Ejecutado script de prueba `node test-api-connection.js`
- [ ] Verificado que los endpoints responden correctamente
- [ ] Servidor backend iniciado correctamente

---

*Última actualización: 2025-11-17*
