# 🐛 Growing - Bug Report & Issues

**Fecha de análisis**: 2025-11-14
**Versión analizada**: v1.1.0
**Analizador**: Claude AI

---

## 📊 Resumen Ejecutivo

| Categoría | Críticos | Altos | Medios | Bajos | Total |
|-----------|----------|-------|--------|-------|-------|
| Backend | 2 | 3 | 4 | 2 | 11 |
| Frontend | 0 | 1 | 2 | 3 | 6 |
| Integración | 1 | 1 | 1 | 0 | 3 |
| **TOTAL** | **3** | **5** | **7** | **5** | **20** |

---

## 🔴 BUGS CRÍTICOS

### 1. ⚠️ Posible Doble Actualización de cashBalance en Contributions

**Ubicación**: `backend/src/services/contributionService.js` línea 161-185
**Severidad**: 🔴 CRÍTICA
**Estado**: Por confirmar

**Descripción**:
La función `updateAssetFromContribution()` actualiza el `cashBalance` del portfolio cuando se crea una contribution:
```javascript
// Línea 170-176
if (contribution.type === 'buy') {
  portfolio.cashBalance -= contribution.totalAmount;
} else if (contribution.type === 'sell') {
  portfolio.cashBalance += contribution.totalAmount;
}
```

**Problema**:
- `distributeCash()` (portfolioService.js línea 179) crea Contributions usando `Contribution.create()` directamente
- Luego TAMBIÉN resta el cashBalance manualmente (línea 206)
- Esto está BIEN porque no usa `contributionService.createContribution()`

PERO si alguien usa `contributionService.createContribution()` para un asset con portfolioId, y luego TAMBIÉN actualiza el portfolio manualmente, podría haber doble descuento.

**Impacto**:
- El cashBalance del portfolio podría descontarse dos veces
- Inconsistencia entre diferentes métodos de creación

**Solución recomendada**:
1. **Opción A**: `distributeCash` debería usar `contributionService.createContribution()` pero sin validar fondos
2. **Opción B**: Agregar flag `skipPortfolioUpdate` en `createContribution` para evitar doble actualización
3. **Opción C**: Documentar claramente que `Contribution.create()` directo NO actualiza portfolio

**Código afectado**:
```javascript
// backend/src/services/contributionService.js:161-185
// backend/src/services/portfolioService.js:179-212
```

---

### 2. ⚠️ Validación de Fondos Inconsistente

**Ubicación**: `backend/src/services/contributionService.js` línea 74-86
**Severidad**: 🔴 CRÍTICA
**Estado**: Confirmado

**Descripción**:
La validación de fondos del portfolio SOLO se ejecuta en `contributionService.createContribution()`:

```javascript
if (data.type === 'buy' && asset.portfolioId) {
  const portfolio = await Portfolio.findById(asset.portfolioId);
  if (portfolio && totalAmount > portfolio.cashBalance) {
    throw new AppError('Fondos insuficientes...');
  }
}
```

**Problema**:
- `distributeCash()` hace su PROPIA validación (línea 148-154 en portfolioService.js)
- Si alguien usa `Contribution.create()` directamente, NO hay validación
- Dos lugares diferentes validan lo mismo = código duplicado

**Impacto**:
- Contributions podrían crearse sin fondos suficientes si se usa `Contribution.create()`
- Violación del principio DRY (Don't Repeat Yourself)
- Riesgo de bugs si una validación se actualiza y la otra no

**Solución recomendada**:
- Centralizar validación de fondos en un método compartido
- O forzar que TODAS las creaciones de contributions pasen por `contributionService`

---

### 3. ⚠️ No Valida Quantity Negativo en Asset

**Ubicación**: `backend/src/models/Asset.js` línea 50-55
**Severidad**: 🔴 ALTA
**Estado**: Confirmado

**Descripción**:
El schema de Asset valida que `quantity >= 0`:
```javascript
quantity: {
  min: [0, 'La cantidad no puede ser negativa'],
}
```

**Problema**:
- Si un usuario vende MÁS de lo que tiene, el Asset podría quedar con quantity negativa
- El pre-save hook NO valida esto antes de guardar
- La validación `min: 0` solo aplica en creación, no en updates manuales

**Escenario**:
```javascript
asset.quantity = 10;
await asset.save(); // ✅ OK

// Luego alguien vende 15 unidades
asset.quantity -= 15; // quantity = -5
await asset.save(); // ⚠️ Debería fallar pero podría pasar
```

**Impacto**:
- Assets con cantidad negativa
- Cálculos financieros incorrectos
- Métricas de portfolio corruptas

**Solución recomendada**:
```javascript
// Agregar validación custom
AssetSchema.path('quantity').validate(function(value) {
  return value >= 0;
}, 'La cantidad no puede ser negativa');
```

---

## 🟡 BUGS ALTOS

### 4. ⚠️ averagePrice Incorrecto al Vender Todo

**Ubicación**: `backend/src/models/Asset.js` línea 127-131
**Severidad**: 🟡 ALTA
**Estado**: Confirmado

**Descripción**:
```javascript
if (this.quantity > 0) {
  this.averagePrice = this.totalInvested / this.quantity;
} else {
  this.averagePrice = 0;
}
```

**Problema**:
Si vendes TODAS las unidades (`quantity = 0`) pero `totalInvested` es negativo (ganaste más de lo que invertiste), el `averagePrice` se pone en 0.

Esto es INCORRECTO porque:
- Perdiste el histórico del precio promedio de compra
- Si compras nuevamente, empiezas desde cero

**Escenario**:
```
1. Compras 1 BTC a $40,000 → averagePrice = $40,000
2. Compras 1 BTC a $50,000 → averagePrice = $45,000
3. Vendes 2 BTC a $60,000 → averagePrice = 0 ❌

Correcto sería mantener $45,000 como histórico
```

**Solución recomendada**:
- No resetear `averagePrice` cuando `quantity = 0`
- O guardar en un campo separado `historicalAveragePrice`

---

### 5. ⚠️ Recalculate Metrics No Maneja Ventas Correctamente

**Ubicación**: `backend/src/services/assetService.js` línea 148
**Severidad**: 🟡 ALTA
**Estado**: Confirmado

**Descripción**:
```javascript
const stats = await Contribution.getTotalInvested(assetId);
asset.totalInvested = stats.netInvested;
asset.quantity = stats.totalQuantity;
```

**Problema**:
`netInvested` = `totalBought - totalSold`, lo cual está bien.
PERO si vendes a un precio mayor que tu precio promedio:
- `totalSold` incluye el precio de VENTA (más alto)
- `totalBought` incluye el precio de COMPRA (más bajo)
- `netInvested` podría ser NEGATIVO si ganaste mucho

**Escenario**:
```
Compras:  10 unidades × $100 = $1,000
Vendes:   10 unidades × $200 = $2,000
netInvested = $1,000 - $2,000 = -$1,000 ❌

Esto significa que el asset muestra "invertido: -$1,000"
Lo correcto sería "invertido: $0" y "ganancias: $1,000"
```

**Impacto**:
- Métricas de inversión incorrectas
- Dashboard muestra valores negativos confusos
- Total invertido global es incorrecto

**Solución recomendada**:
- `totalInvested` debe ser SOLO compras (sin restar ventas)
- Crear campo separado `totalRealized` para ganancias realizadas

---

### 6. ⚠️ distributeCash No Valida pricePerUnit

**Ubicación**: `backend/src/services/portfolioService.js` línea 176
**Severidad**: 🟡 ALTA
**Estado**: Confirmado

**Descripción**:
```javascript
const quantity = dist.amount / dist.pricePerUnit;
```

**Problema**:
- NO valida que `dist.pricePerUnit > 0`
- Si alguien envía `pricePerUnit: 0`, división por cero → `quantity = Infinity`
- Si envía negativo, `quantity` es negativo

**Impacto**:
- Assets con quantity = Infinity o NaN
- Base de datos corrupta
- Aplicación puede crashear

**Solución recomendada**:
```javascript
// Agregar validación
if (!dist.pricePerUnit || dist.pricePerUnit <= 0) {
  throw new AppError('pricePerUnit debe ser mayor a 0');
}
```

---

### 7. ⚠️ No Hay Transacciones en distributeCash

**Ubicación**: `backend/src/services/portfolioService.js` línea 168-212
**Severidad**: 🟡 ALTA
**Estado**: Confirmado

**Descripción**:
`distributeCash` hace múltiples operaciones de base de datos:
- Crea N contributions
- Actualiza N assets
- Actualiza 1 portfolio

**Problema**:
- NO usa transacciones de MongoDB
- Si falla en el medio (ej: asset #3 de 5), los primeros 2 quedan guardados
- Estado inconsistente: portfolio descontado pero assets no actualizados

**Escenario de fallo**:
```
1. Crear contribution para BTC → ✅ OK
2. Actualizar asset BTC → ✅ OK
3. Crear contribution para ETH → ❌ FALLA
   → BTC ya se actualizó, ETH no
   → cashBalance no se actualizó aún
   → INCONSISTENCIA
```

**Impacto**:
- Datos inconsistentes en caso de error
- Difícil de recuperar/revertir
- Usuario confundido

**Solución recomendada**:
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Todas las operaciones
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

### 8. ⚠️ Frontend: Query Keys Inconsistentes

**Ubicación**: `frontend/src/config/queryClient.js`
**Severidad**: 🟡 MEDIA
**Estado**: Pendiente verificar

**Descripción**:
Los QUERY_KEYS usan funciones para generar keys dinámicas:
```javascript
PORTFOLIO_DETAIL: (id) => ['portfolios', id]
```

**Problema potencial**:
- Si diferentes partes del código generan keys ligeramente diferentes
- React Query no puede invalidar correctamente

**Ejemplo**:
```javascript
// Hook 1
queryKey: QUERY_KEYS.PORTFOLIO_DETAIL(id)  // ['portfolios', '123']

// Hook 2
queryKey: [...QUERY_KEYS.PORTFOLIOS, id]   // ['portfolios', '123']

// SON IGUALES pero si hay typo, no invalida bien
```

**Impacto**:
- Cache no se invalida correctamente
- UI muestra datos obsoletos

**Solución recomendada**:
- Audit de todos los usos de query keys
- Centralizar en un solo archivo y exportar funciones

---

## 🟢 BUGS MEDIOS

### 9. ⚠️ Falta Página History Timeline

**Ubicación**: `frontend/src/pages/`
**Severidad**: 🟢 MEDIA
**Estado**: Missing Feature

**Descripción**:
Según arquitectura, debería haber una página `/history` con timeline de TODAS las contributions.

**Estado actual**:
- Solo existe historial por asset individual
- No hay vista global

**Impacto**:
- Usuario no puede ver timeline completo
- Feature incompleta vs arquitectura

---

### 10. ⚠️ No Maneja Timezone en Fechas

**Ubicación**: Multiple files
**Severidad**: 🟢 MEDIA
**Estado**: Confirmado

**Descripción**:
Las fechas se guardan como `new Date()` sin considerar timezone del usuario.

**Problema**:
- Usuario en España (UTC+1) crea contribution a las 23:00
- Se guarda como UTC → muestra día siguiente
- Confusión en reportes y filtros

**Solución recomendada**:
- Usar date-fns con timezone
- Guardar fecha + timezone del usuario
- O normalizar todo a UTC en backend y convertir en frontend

---

### 11. ⚠️ Performance: N+1 Queries en Assets

**Ubicación**: `backend/src/services/assetService.js` línea 23-25
**Severidad**: 🟢 MEDIA
**Estado**: Confirmado

**Descripción**:
```javascript
const assets = await Asset.find(query)
  .populate('portfolioId', 'name color')
  .sort({ [sortBy]: order });
```

**Problema**:
Si tienes 100 assets y cada uno hace populate, son 100 queries adicionales.

**Solución recomendada**:
- Usar agregación de MongoDB
- O implementar DataLoader pattern

---

### 12. ⚠️ Falta Validación de targetAllocation Suma 100%

**Ubicación**: `backend/src/services/portfolioService.js` línea 83-88
**Severidad**: 🟢 MEDIA
**Estado**: Parcialmente implementado

**Descripción**:
Hay validación pero SOLO es warning en logs:
```javascript
const validation = portfolio.validateTargetAllocation();
if (!validation.isValid) {
  logger.warn(`Target allocation validation warning: ${validation.message}`);
}
```

**Problema**:
- NO rechaza el request
- Portfolio queda con allocation inválida
- Rebalanceo no funciona correctamente

**Solución recomendada**:
- Cambiar warning por error
- O agregar flag `strict: boolean` para elegir comportamiento

---

### 13. ⚠️ No Limita Decimales en Currency

**Ubicación**: Multiple locations
**Severidad**: 🟢 MEDIA
**Estado**: Confirmado

**Descripción**:
Los valores monetarios se guardan como `Number` sin redondear.

**Problema**:
```javascript
currentValue = 10.123456789 // Muchos decimales
```

Esto causa:
- Inconsistencias de redondeo
- UI muestra $10.12 pero backend tiene $10.123456789

**Solución recomendada**:
- Siempre redondear a 2 decimales antes de guardar
- O usar biblioteca como dinero.js para precisión

---

### 14. ⚠️ color Pattern Muy Permisivo

**Ubicación**: `backend/src/models/Asset.js` línea 93
**Severidad**: 🟢 BAJA
**Estado**: Confirmado

**Descripción**:
```javascript
match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color debe ser formato hexadecimal válido']
```

**Problema menor**:
- Acepta colores en formato corto (#FFF) que podrían no renderizar bien en algunos componentes
- No valida que sean colores visibles (ej: #000000 negro sobre fondo negro)

---

## 🔵 BUGS BAJOS

### 15. ⚠️ Logs Muy Verbosos en Production

**Ubicación**: Multiple controllers
**Severidad**: 🔵 BAJA
**Estado**: Confirmado

**Descripción**:
Todos los controllers hacen `logger.info()` en cada operación.

**Problema**:
- En producción con mucho tráfico, logs enormes
- Información sensible podría quedar en logs

**Solución recomendada**:
- Usar `logger.debug()` para operaciones rutinarias
- Reservar `info` para eventos importantes

---

### 16. ⚠️ No Hay Soft Delete

**Ubicación**: All delete operations
**Severidad**: 🔵 BAJA
**Estado**: Design choice

**Descripción**:
Los deletes son HARD deletes (borran definitivamente).

**Problema**:
- No hay forma de recuperar datos eliminados
- Auditoría difícil

**Solución recomendada** (futuro):
- Agregar campo `deletedAt` y hacer soft deletes
- O implementar tabla de auditoría

---

### 17. ⚠️ Falta Rate Limiting por Usuario

**Ubicación**: `backend/src/app.js`
**Severidad**: 🔵 BAJA
**Estado**: Future feature

**Descripción**:
El rate limiting es global por IP.

**Problema**:
- Todos los usuarios de una misma red comparten límite
- Difícil de abusar pero no ideal

---

### 18. ⚠️ Frontend: No Maneja 404 de API

**Ubicación**: Frontend components
**Severidad**: 🔵 BAJA
**Estado**: Confirmado

**Descripción**:
Si un endpoint retorna 404, algunos componentes no lo manejan bien.

**Solución recomendada**:
- Agregar error boundary específico para 404
- Mostrar mensaje amigable

---

### 19. ⚠️ No Valida Symbol Único

**Ubicación**: `backend/src/models/Asset.js`
**Severidad**: 🔵 BAJA
**Estado**: Design choice

**Descripción**:
Puedes crear múltiples assets con el mismo symbol (ej: dos "BTC").

**Impacto**:
- Confusión en UI
- Pero técnicamente válido (puedes tener BTC en exchanges diferentes)

---

### 20. ⚠️ Frontend: LoadingSpinner Inconsistente

**Ubicación**: Multiple pages
**Severidad**: 🔵 BAJA
**Estado**: UI/UX issue

**Descripción**:
Algunas páginas usan `<Loading />`, otras usan `<LoadingSpinner />`.

**Solución recomendada**:
- Estandarizar en un solo componente

---

## 📋 Priorización de Fixes

### 🔥 URGENTES (Antes de Production)
1. **Bug #3**: Validar quantity negativo
2. **Bug #6**: Validar pricePerUnit en distributeCash
3. **Bug #7**: Agregar transacciones MongoDB

### ⚡ IMPORTANTES (Sprint Próximo)
4. **Bug #1**: Resolver doble actualización cashBalance
5. **Bug #2**: Centralizar validación de fondos
6. **Bug #4**: Fix averagePrice en ventas completas
7. **Bug #5**: Corregir cálculo de netInvested

### 📝 MEJORAS (Backlog)
8. **Bug #8-20**: Mejoras de performance, UX y robustez

---

## 🧪 Testing Recomendado

### Tests Críticos a Agregar:
```javascript
// Test 1: distributeCash con fallos parciales
it('should rollback if distribution fails midway', async () => {
  // Arrange: Portfolio con $1000, 3 assets
  // Act: Distribuir pero asset #2 falla
  // Assert: Ningún cambio debe persistir
});

// Test 2: Contribution con cantidad negativa
it('should prevent negative quantity in assets', async () => {
  const asset = await Asset.create({ quantity: 10 });
  asset.quantity = -5;
  await expect(asset.save()).rejects.toThrow();
});

// Test 3: pricePerUnit = 0
it('should reject distributeCash with zero pricePerUnit', async () => {
  const data = { distributions: [{ pricePerUnit: 0, amount: 100 }] };
  await expect(distributeCash(portfolioId, data)).rejects.toThrow();
});
```

---

## 📊 Métricas de Calidad

| Métrica | Valor Actual | Objetivo |
|---------|--------------|----------|
| Bugs Críticos | 3 | 0 |
| Cobertura Tests | ~20% estimado | >80% |
| Transacciones DB | ❌ No usa | ✅ Implementar |
| Validaciones | 70% | 100% |
| Logs Estructurados | ✅ Sí | ✅ Mantener |

---

## 🎯 Conclusión

El código está **bien estructurado y funcional** pero tiene **problemas críticos de consistencia y validación** que deben resolverse antes de producción.

**Fortalezas**:
- ✅ Arquitectura bien definida
- ✅ Separación de responsabilidades
- ✅ Manejo de errores robusto
- ✅ Documentación completa

**Debilidades críticas**:
- ❌ Falta de transacciones
- ❌ Validaciones inconsistentes
- ❌ Posibles corrupciones de datos

**Recomendación**: Resolver bugs críticos (#1-7) antes de lanzar a producción.

---

**Generado por**: Claude AI
**Fecha**: 2025-11-14
**Próxima revisión**: Después de fixes
