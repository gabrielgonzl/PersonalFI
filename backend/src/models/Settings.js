import mongoose from 'mongoose';
import { THEMES, CHART_TYPES, LANGUAGES, PRICE_API_PROVIDERS, LIMITS } from '../config/constants.js';

const SettingsSchema = new mongoose.Schema(
  {
    // Preferencias de usuario
    defaultCurrency: {
      type: String,
      uppercase: true,
      default: 'EUR',
      maxlength: 3,
    },
    language: {
      type: String,
      lowercase: true,
      enum: {
        values: Object.values(LANGUAGES),
        message: '{VALUE} no es un idioma válido',
      },
      default: LANGUAGES.ES,
    },

    // Visualización
    theme: {
      type: String,
      lowercase: true,
      enum: {
        values: Object.values(THEMES),
        message: '{VALUE} no es un tema válido',
      },
      default: THEMES.AUTO,
    },
    chartType: {
      type: String,
      lowercase: true,
      enum: {
        values: Object.values(CHART_TYPES),
        message: '{VALUE} no es un tipo de gráfico válido',
      },
      default: CHART_TYPES.LINE,
    },

    // Actualización de precios
    priceUpdateInterval: {
      type: Number,
      default: LIMITS.DEFAULT_PRICE_UPDATE_INTERVAL,
      min: [LIMITS.MIN_PRICE_UPDATE_INTERVAL, `El intervalo mínimo es ${LIMITS.MIN_PRICE_UPDATE_INTERVAL} minutos`],
      max: [LIMITS.MAX_PRICE_UPDATE_INTERVAL, `El intervalo máximo es ${LIMITS.MAX_PRICE_UPDATE_INTERVAL} minutos`],
    },
    priceApiProvider: {
      type: String,
      lowercase: true,
      enum: {
        values: Object.values(PRICE_API_PROVIDERS),
        message: '{VALUE} no es un proveedor válido',
      },
      default: PRICE_API_PROVIDERS.MANUAL,
    },
    apiKeys: {
      coingecko: {
        type: String,
        default: '',
      },
      alphavantage: {
        type: String,
        default: '',
      },
      yahoofinance: {
        type: String,
        default: '',
      },
    },

    // Notificaciones (para futuro)
    notifications: {
      priceAlerts: {
        type: Boolean,
        default: false,
      },
      portfolioRebalance: {
        type: Boolean,
        default: false,
      },
      profitLossThreshold: {
        type: Number,
        default: 10, // porcentaje
        min: [0, 'El umbral no puede ser negativo'],
        max: [100, 'El umbral no puede exceder 100%'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Asegurar que solo exista un documento de settings (singleton)
SettingsSchema.statics.getInstance = async function () {
  let settings = await this.findOne();

  if (!settings) {
    settings = await this.create({});
  }

  return settings;
};

// Método estático: actualizar settings (siempre el mismo documento)
SettingsSchema.statics.updateSettings = async function (updates) {
  let settings = await this.findOne();

  if (!settings) {
    settings = await this.create(updates);
  } else {
    Object.assign(settings, updates);
    await settings.save();
  }

  return settings;
};

// Método de instancia: validar API key
SettingsSchema.methods.hasApiKey = function (provider) {
  return this.apiKeys && this.apiKeys[provider] && this.apiKeys[provider].length > 0;
};

const Settings = mongoose.model('Settings', SettingsSchema);

export default Settings;
