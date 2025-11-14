# 🗄️ Growing - Database Schemas

## Documentación Detallada de MongoDB

---

## 📊 Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                         PORTFOLIO                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ _id: ObjectId                                       │    │
│  │ name: "Mi Cartera Crypto"                          │    │
│  │ cashBalance: 5000.00                               │    │
│  │ currency: "USD"                                     │    │
│  │ totalInvested: 15000.00                            │    │
│  │ currentValue: 18500.00                             │    │
│  │ profitLoss: +3500.00 (23.33%)                      │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          │ portfolioId (1:N)                │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │                      ASSET                          │    │
│  │ ┌────────────────────────────────────────────────┐ │    │
│  │ │ _id: ObjectId                                  │ │    │
│  │ │ name: "Bitcoin"                                │ │    │
│  │ │ symbol: "BTC"                                  │ │    │
│  │ │ type: "crypto"                                 │ │    │
│  │ │ portfolioId: ObjectId (ref Portfolio)         │ │    │
│  │ │ totalInvested: 10000.00                        │ │    │
│  │ │ quantity: 0.25                                 │ │    │
│  │ │ currentPrice: 45000.00                         │ │    │
│  │ │ currentValue: 11250.00                         │ │    │
│  │ │ profitLoss: +1250.00 (12.5%)                   │ │    │
│  │ └────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          │ assetId (1:N)                    │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │                  CONTRIBUTION                       │    │
│  │ ┌────────────────────────────────────────────────┐ │    │
│  │ │ _id: ObjectId                                  │ │    │
│  │ │ assetId: ObjectId (ref Asset)                 │ │    │
│  │ │ date: 2024-01-15                               │ │    │
│  │ │ type: "buy"                                    │ │    │
│  │ │ quantity: 0.1                                  │ │    │
│  │ │ pricePerUnit: 40000.00                         │ │    │
│  │ │ totalAmount: 4000.00                           │ │    │
│  │ │ fees: 20.00                                    │ │    │
│  │ └────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        SETTINGS (Singleton)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ _id: ObjectId                                       │    │
│  │ defaultCurrency: "USD"                              │    │
│  │ theme: "dark"                                       │    │
│  │ priceUpdateInterval: 15 (minutos)                  │    │
│  │ apiKeys: { ... }                                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. 📦 Collection: `assets`

### Descripción
Almacena información de cada activo financiero individual (crypto, acciones, ETFs, fondos).

### Schema

```javascript
const AssetSchema = new mongoose.Schema({
  // Identificación básica
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxlength: 20,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['crypto', 'stock', 'etf', 'fund', 'other'],
    index: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    default: 'USD',
    maxlength: 3
  },

  // Datos financieros
  totalInvested: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currentValue: {
    type: Number,
    default: 0,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  averagePrice: {
    type: Number,
    default: 0,
    min: 0
  },
  currentPrice: {
    type: Number,
    default: 0,
    min: 0
  },

  // Métricas calculadas
  profitLoss: {
    type: Number,
    default: 0
  },
  profitLossPercentage: {
    type: Number,
    default: 0
  },

  // Relación con Portfolio
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    default: null,
    index: true
  },

  // Metadata
  notes: {
    type: String,
    maxlength: 500
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  icon: {
    type: String,
    maxlength: 200
  },

  // Timestamps
  lastPriceUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices compuestos
AssetSchema.index({ portfolioId: 1, type: 1 });
AssetSchema.index({ createdAt: -1 });

// Virtual para contribuciones
AssetSchema.virtual('contributions', {
  ref: 'Contribution',
  localField: '_id',
  foreignField: 'assetId'
});

// Middleware pre-save: calcular métricas
AssetSchema.pre('save', function(next) {
  // Calcular precio promedio
  if (this.quantity > 0) {
    this.averagePrice = this.totalInvested / this.quantity;
  } else {
    this.averagePrice = 0;
  }

  // Calcular valor actual
  this.currentValue = this.quantity * this.currentPrice;

  // Calcular ganancia/pérdida
  this.profitLoss = this.currentValue - this.totalInvested;

  // Calcular porcentaje
  if (this.totalInvested > 0) {
    this.profitLossPercentage = (this.profitLoss / this.totalInvested) * 100;
  } else {
    this.profitLossPercentage = 0;
  }

  next();
});
```

### Ejemplo de Documento

```json
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
  "notes": "Inversión a largo plazo",
  "color": "#F7931A",
  "icon": "btc-icon.svg",
  "lastPriceUpdate": "2024-01-20T10:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

---

## 2. 💰 Collection: `contributions`

### Descripción
Historial completo de todas las transacciones (compras/ventas) de cada activo.

### Schema

```javascript
const ContributionSchema = new mongoose.Schema({
  // Relación con Asset
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
    index: true
  },

  // Datos de transacción
  date: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['buy', 'sell', 'transfer'],
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.000001 // Permite fracciones muy pequeñas (crypto)
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  // Costos adicionales
  fees: {
    type: Number,
    default: 0,
    min: 0
  },

  // Metadata
  notes: {
    type: String,
    maxlength: 500
  },
  source: {
    type: String,
    maxlength: 100 // Exchange o broker
  }
}, {
  timestamps: true
});

// Índices compuestos
ContributionSchema.index({ assetId: 1, date: -1 });
ContributionSchema.index({ date: -1 });

// Middleware pre-save: calcular totalAmount si no está definido
ContributionSchema.pre('save', function(next) {
  if (!this.totalAmount && this.quantity && this.pricePerUnit) {
    this.totalAmount = this.quantity * this.pricePerUnit + (this.fees || 0);
  }
  next();
});

// Método estático: obtener total invertido en un asset
ContributionSchema.statics.getTotalInvested = async function(assetId) {
  const result = await this.aggregate([
    { $match: { assetId: mongoose.Types.ObjectId(assetId) } },
    {
      $group: {
        _id: null,
        totalBought: {
          $sum: {
            $cond: [{ $eq: ['$type', 'buy'] }, '$totalAmount', 0]
          }
        },
        totalSold: {
          $sum: {
            $cond: [{ $eq: ['$type', 'sell'] }, '$totalAmount', 0]
          }
        },
        totalQuantity: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'buy'] },
              '$quantity',
              { $multiply: ['$quantity', -1] }
            ]
          }
        }
      }
    }
  ]);

  return result[0] || { totalBought: 0, totalSold: 0, totalQuantity: 0 };
};
```

### Ejemplo de Documento

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "assetId": "507f1f77bcf86cd799439011",
  "date": "2024-01-15T14:30:00.000Z",
  "type": "buy",
  "quantity": 0.1,
  "pricePerUnit": 40000.00,
  "totalAmount": 4020.00,
  "fees": 20.00,
  "notes": "Primera compra de Bitcoin",
  "source": "Binance",
  "createdAt": "2024-01-15T14:35:00.000Z",
  "updatedAt": "2024-01-15T14:35:00.000Z"
}
```

---

## 3. 🎯 Collection: `portfolios`

### Descripción
Contenedores que agrupan múltiples activos con un balance de efectivo distribuible.

### Schema

```javascript
const PortfolioSchema = new mongoose.Schema({
  // Identificación
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },

  // Información financiera
  cashBalance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    default: 'USD',
    maxlength: 3
  },
  totalInvested: {
    type: Number,
    default: 0,
    min: 0
  },
  currentValue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalValue: {
    type: Number,
    default: 0,
    min: 0
  },

  // Métricas
  profitLoss: {
    type: Number,
    default: 0
  },
  profitLossPercentage: {
    type: Number,
    default: 0
  },

  // Configuración de distribución objetivo (opcional)
  targetAllocation: [{
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset'
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    }
  }],

  // Visual
  color: {
    type: String,
    default: '#10B981',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  icon: {
    type: String,
    maxlength: 200
  },

  // Estado
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  // Fechas
  lastRebalanceDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
PortfolioSchema.index({ isActive: 1 });
PortfolioSchema.index({ createdAt: -1 });

// Virtual: obtener assets del portfolio
PortfolioSchema.virtual('assets', {
  ref: 'Asset',
  localField: '_id',
  foreignField: 'portfolioId'
});

// Virtual: contar assets
PortfolioSchema.virtual('assetCount', {
  ref: 'Asset',
  localField: '_id',
  foreignField: 'portfolioId',
  count: true
});

// Middleware pre-save: calcular métricas
PortfolioSchema.pre('save', function(next) {
  // Calcular valor total (efectivo + valor de activos)
  this.totalValue = this.cashBalance + this.currentValue;

  // Calcular ganancia/pérdida
  this.profitLoss = this.currentValue - this.totalInvested;

  // Calcular porcentaje
  if (this.totalInvested > 0) {
    this.profitLossPercentage = (this.profitLoss / this.totalInvested) * 100;
  } else {
    this.profitLossPercentage = 0;
  }

  next();
});

// Método de instancia: validar distribución objetivo
PortfolioSchema.methods.validateTargetAllocation = function() {
  if (!this.targetAllocation || this.targetAllocation.length === 0) {
    return true;
  }

  const totalPercentage = this.targetAllocation.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  return totalPercentage === 100;
};

// Método estático: recalcular métricas desde assets
PortfolioSchema.statics.recalculateMetrics = async function(portfolioId) {
  const Asset = mongoose.model('Asset');

  const assets = await Asset.find({ portfolioId });

  const totalInvested = assets.reduce((sum, a) => sum + a.totalInvested, 0);
  const currentValue = assets.reduce((sum, a) => sum + a.currentValue, 0);

  return { totalInvested, currentValue };
};
```

### Ejemplo de Documento

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Cartera Crypto",
  "description": "Inversión en criptomonedas de largo plazo",
  "cashBalance": 5000.00,
  "currency": "USD",
  "totalInvested": 15000.00,
  "currentValue": 18500.00,
  "totalValue": 23500.00,
  "profitLoss": 3500.00,
  "profitLossPercentage": 23.33,
  "targetAllocation": [
    {
      "assetId": "507f1f77bcf86cd799439011",
      "percentage": 50
    },
    {
      "assetId": "507f1f77bcf86cd799439014",
      "percentage": 30
    },
    {
      "assetId": "507f1f77bcf86cd799439015",
      "percentage": 20
    }
  ],
  "color": "#8B5CF6",
  "icon": "crypto-portfolio.svg",
  "isActive": true,
  "lastRebalanceDate": "2024-01-10T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

---

## 4. ⚙️ Collection: `settings`

### Descripción
Configuración global de la aplicación (singleton - un único documento).

### Schema

```javascript
const SettingsSchema = new mongoose.Schema({
  // Preferencias de usuario
  defaultCurrency: {
    type: String,
    uppercase: true,
    default: 'USD',
    maxlength: 3
  },
  language: {
    type: String,
    lowercase: true,
    enum: ['es', 'en', 'pt'],
    default: 'es'
  },

  // Visualización
  theme: {
    type: String,
    lowercase: true,
    enum: ['light', 'dark', 'auto'],
    default: 'auto'
  },
  chartType: {
    type: String,
    lowercase: true,
    enum: ['line', 'area', 'candlestick'],
    default: 'line'
  },

  // Actualización de precios
  priceUpdateInterval: {
    type: Number,
    default: 15, // minutos
    min: 5,
    max: 1440 // máximo 24 horas
  },
  priceApiProvider: {
    type: String,
    lowercase: true,
    enum: ['coingecko', 'alphavantage', 'manual'],
    default: 'manual'
  },
  apiKeys: {
    coingecko: String,
    alphavantage: String,
    yahoofinance: String
  },

  // Notificaciones (para futuro)
  notifications: {
    priceAlerts: {
      type: Boolean,
      default: false
    },
    portfolioRebalance: {
      type: Boolean,
      default: false
    },
    profitLossThreshold: {
      type: Number,
      default: 10 // porcentaje
    }
  }
}, {
  timestamps: true
});

// Asegurar que solo exista un documento de settings
SettingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};
```

### Ejemplo de Documento

```json
{
  "_id": "507f1f77bcf86cd799439016",
  "defaultCurrency": "USD",
  "language": "es",
  "theme": "dark",
  "chartType": "line",
  "priceUpdateInterval": 15,
  "priceApiProvider": "manual",
  "apiKeys": {
    "coingecko": "",
    "alphavantage": "",
    "yahoofinance": ""
  },
  "notifications": {
    "priceAlerts": false,
    "portfolioRebalance": false,
    "profitLossThreshold": 10
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

---

## 🔗 Relaciones entre Colecciones

### 1. Portfolio → Assets (1:N)
- Un Portfolio puede tener múltiples Assets
- Un Asset puede pertenecer a un Portfolio o ser independiente
- Campo: `Asset.portfolioId` → `Portfolio._id`

### 2. Asset → Contributions (1:N)
- Un Asset tiene múltiples Contributions (historial)
- Una Contribution pertenece a un único Asset
- Campo: `Contribution.assetId` → `Asset._id`

### 3. Portfolio → Target Allocation → Assets (M:N)
- Un Portfolio define distribución objetivo para varios Assets
- Array embebido: `Portfolio.targetAllocation[].assetId`

---

## 📊 Agregaciones Útiles

### Total invertido por tipo de activo

```javascript
db.assets.aggregate([
  {
    $group: {
      _id: '$type',
      totalInvested: { $sum: '$totalInvested' },
      totalValue: { $sum: '$currentValue' },
      count: { $sum: 1 }
    }
  },
  {
    $project: {
      type: '$_id',
      totalInvested: 1,
      totalValue: 1,
      count: 1,
      profitLoss: { $subtract: ['$totalValue', '$totalInvested'] }
    }
  }
]);
```

### Rendimiento histórico de un portfolio

```javascript
db.contributions.aggregate([
  {
    $lookup: {
      from: 'assets',
      localField: 'assetId',
      foreignField: '_id',
      as: 'asset'
    }
  },
  { $unwind: '$asset' },
  { $match: { 'asset.portfolioId': ObjectId('...') } },
  {
    $group: {
      _id: {
        year: { $year: '$date' },
        month: { $month: '$date' }
      },
      totalInvested: { $sum: '$totalAmount' }
    }
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } }
]);
```

---

## 🚨 Consideraciones Importantes

### 1. Consistencia de Datos
- Al crear una Contribution, actualizar el Asset correspondiente
- Al eliminar un Asset, eliminar sus Contributions
- Al eliminar un Portfolio, actualizar Assets (`portfolioId = null`)

### 2. Validaciones
- `totalAmount` en Contribution = `quantity * pricePerUnit + fees`
- `targetAllocation` en Portfolio debe sumar 100%
- `cashBalance` nunca debe ser negativo

### 3. Índices para Performance
- Queries frecuentes: buscar assets por portfolio
- Ordenamiento: contributions por fecha descendente
- Filtrado: assets por tipo

### 4. Backups
- MongoDB Atlas realiza backups automáticos
- Considerar exports periódicos para migraciones

---

**Última actualización**: 2025-11-14
