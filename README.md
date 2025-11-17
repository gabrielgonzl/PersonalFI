# 🌱 Growing - Personal Investment Tracker

> Una aplicación web moderna para gestionar y visualizar tus inversiones personales en un solo lugar.

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Demo](#-demo)
- [Arquitectura](#-arquitectura)
- [Prerequisitos](#-prerequisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Desarrollo](#-desarrollo)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### 🎯 Funcionalidades Core

- **Dashboard Financiero**: Vista general de todas tus inversiones con métricas en tiempo real
- **Gestión de Activos**: Administra criptomonedas, acciones, ETFs y fondos desde una sola plataforma
- **Sistema de Carteras**: Agrupa activos relacionados con balance de efectivo distribuible
- **Historial de Aportaciones**: Registro completo de compras y ventas con cálculo automático de métricas
- **Visualizaciones Interactivas**: Gráficos de distribución y rendimiento histórico
- **Análisis de Rendimiento**: Métricas detalladas de ganancia/pérdida y ROI

### 🚀 Características Técnicas

- **Responsive Design**: Funciona perfectamente en móvil, tablet y desktop
- **Modo Oscuro**: Toggle entre temas claro, oscuro o automático con persistencia local
- **Lazy Loading**: Carga diferida de componentes para mejor performance
- **Smart Caching**: React Query con configuración optimizada de caché
- **Auto-Save**: Guardado automático de formularios con debounce
- **Export CSV**: Exporta datos de portafolios y transacciones
- **Retry Logic**: Reintentos automáticos para requests fallidos
- **Error Boundary**: Manejo elegante de errores con recovery
- **Real-time Calculations**: Cálculos financieros automáticos y precisos
- **Modern Stack**: React 18, Node.js/Express, MongoDB Atlas
- **State Management**: React Query para data fetching eficiente
- **Testing**: Vitest para testing unitario y de integración

---

## 🎬 Demo

![Dashboard Screenshot](docs/assets/dashboard-preview.png)
*Dashboard principal mostrando overview de inversiones*

![Asset Detail Screenshot](docs/assets/asset-detail-preview.png)
*Vista detallada de un activo con historial de contribuciones*

> **Nota**: Screenshots pendientes - se agregarán en la fase de implementación

---

## 🏗️ Arquitectura

Growing está construido con una arquitectura cliente-servidor moderna:

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                     │
│  - React Query para data fetching                            │
│  - MUI/TailwindCSS para UI                                   │
│  - Recharts para visualizaciones                             │
└────────────────────┬─────────────────────────────────────────┘
                     │ REST API (JSON)
┌────────────────────▼─────────────────────────────────────────┐
│  Backend (Node.js + Express)                                 │
│  - RESTful API                                               │
│  - Business logic & calculations                             │
│  - Mongoose ODM                                              │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│  Database (MongoDB Atlas)                                    │
│  - Collections: assets, contributions, portfolios, settings  │
│  - Indexed queries para performance                          │
└──────────────────────────────────────────────────────────────┘
```

📚 **Documentación Detallada**:
- [Arquitectura Completa](ARCHITECTURE.md)
- [Schemas de Base de Datos](docs/DATABASE_SCHEMAS.md)
- [API Endpoints](docs/API_ENDPOINTS.md)
- [Flujo de Componentes](docs/COMPONENT_FLOW.md)

---

## 📦 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: v18.0.0 o superior ([Descargar](https://nodejs.org/))
- **npm**: v9.0.0 o superior (incluido con Node.js)
- **MongoDB Atlas**: Cuenta gratuita ([Crear cuenta](https://www.mongodb.com/cloud/atlas/register))
- **Git**: Para clonar el repositorio ([Descargar](https://git-scm.com/))

### Verificar Instalación

```bash
node --version   # Debe mostrar v18.0.0 o superior
npm --version    # Debe mostrar v9.0.0 o superior
git --version    # Cualquier versión reciente
```

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/gabrielgonzl/PersonalFI.git
cd PersonalFI
```

### 2. Instalar Dependencias

#### Backend

```bash
cd backend
npm install
```

**Dependencias principales**:
- `express` - Framework web
- `mongoose` - MongoDB ODM
- `cors` - CORS middleware
- `dotenv` - Variables de entorno
- `express-validator` - Validación de inputs

#### Frontend

```bash
cd ../frontend
npm install
```

**Dependencias principales**:
- `react` - Librería UI
- `react-router-dom` - Routing
- `@tanstack/react-query` - Data fetching
- `axios` - HTTP client
- `recharts` - Gráficos
- `react-hook-form` - Manejo de formularios

---

## ⚙️ Configuración

### 1. MongoDB Atlas Setup

#### Crear Cluster

1. Accede a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un nuevo proyecto (ej: "Growing-App")
3. Crea un cluster gratuito (M0 Sandbox)
4. Espera 3-5 minutos a que se aprovisione

#### Configurar Acceso

1. **Database Access**:
   - Ve a "Database Access" en el sidebar
   - Click "Add New Database User"
   - Username: `growing_user`
   - Password: Genera una contraseña segura (guárdala)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

2. **Network Access**:
   - Ve a "Network Access"
   - Click "Add IP Address"
   - Opción 1: "Allow Access from Anywhere" (0.0.0.0/0) - para desarrollo
   - Opción 2: Agrega tu IP específica - más seguro
   - Click "Confirm"

#### Obtener Connection String

1. Ve a "Database" en el sidebar
2. Click en "Connect" en tu cluster
3. Selecciona "Connect your application"
4. Driver: Node.js, Version: 4.1 or later
5. Copia el connection string:
   ```
   mongodb+srv://growing_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Reemplaza `<password>` con tu contraseña real
7. Opcionalmente, agrega el nombre de la base de datos antes de `?`:
   ```
   mongodb+srv://growing_user:mypassword@cluster0.xxxxx.mongodb.net/growing?retryWrites=true&w=majority
   ```

---

### 2. Variables de Entorno

#### Backend

Crea el archivo `.env` en la carpeta `backend/`:

```bash
cd backend
cp .env.example .env
```

Edita `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://growing_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/growing?retryWrites=true&w=majority

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

**Importante**: Reemplaza `YOUR_PASSWORD` con tu contraseña de MongoDB Atlas.

#### Frontend

Crea el archivo `.env` en la carpeta `frontend/`:

```bash
cd ../frontend
cp .env.example .env
```

Edita `frontend/.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api/v1

# App Configuration
VITE_APP_NAME=Growing
VITE_APP_VERSION=1.0.0
```

---

### 3. Inicializar Base de Datos (Opcional)

Para poblar la base de datos con datos de ejemplo:

```bash
cd backend
npm run seed
```

Esto creará:
- 2 portfolios de ejemplo
- 8 activos de ejemplo (crypto, stocks, ETFs)
- 20 contribuciones históricas
- Configuración inicial

---

## 🎮 Uso

### Modo Desarrollo

Necesitas **dos terminales** abiertas:

#### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
[INFO] MongoDB Connected: cluster0.xxxxx.mongodb.net
[INFO] Server running on http://localhost:5000
[INFO] API available at http://localhost:5000/api/v1
```

#### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Deberías ver:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Acceder a la Aplicación

Abre tu navegador en: **http://localhost:5173**

---

## 📁 Estructura del Proyecto

```
PersonalFI/
├── docs/                           # Documentación
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMAS.md
│   ├── API_ENDPOINTS.md
│   └── COMPONENT_FLOW.md
│
├── frontend/                       # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/            # Componentes reutilizables
│   │   │   ├── charts/            # Visualizaciones
│   │   │   ├── layout/            # Layout components
│   │   │   └── features/          # Feature components
│   │   ├── pages/                 # Páginas/rutas
│   │   ├── hooks/                 # Custom hooks
│   │   ├── services/              # API services
│   │   ├── context/               # Context providers
│   │   ├── utils/                 # Utilidades
│   │   ├── styles/                # Estilos globales
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                        # API Node.js
│   ├── src/
│   │   ├── config/                # Configuraciones
│   │   ├── models/                # Modelos Mongoose
│   │   ├── controllers/           # Controladores
│   │   ├── routes/                # Rutas API
│   │   ├── middleware/            # Middlewares
│   │   ├── services/              # Lógica de negocio
│   │   ├── utils/                 # Utilidades
│   │   └── server.js
│   ├── tests/
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 📜 Scripts Disponibles

### Backend

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start

# Testing
npm test
npm run test:watch

# Linting
npm run lint
npm run lint:fix

# Seed database
npm run seed
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Testing
npm test
npm run test:coverage

# Linting
npm run lint
npm run lint:fix
```

---

## 💻 Desarrollo

### Workflow Recomendado

1. **Crear rama de feature**:
   ```bash
   git checkout -b feature/nombre-feature
   ```

2. **Desarrollar**:
   - Escribe código en pequeños commits
   - Sigue las convenciones de código (ESLint)
   - Agrega tests para nuevas funcionalidades

3. **Testing**:
   ```bash
   # Backend
   cd backend && npm test

   # Frontend
   cd frontend && npm test
   ```

4. **Commit**:
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   ```

   Formato de commits (Conventional Commits):
   - `feat:` - Nueva funcionalidad
   - `fix:` - Bug fix
   - `docs:` - Cambios en documentación
   - `style:` - Formato, no cambia código
   - `refactor:` - Refactorización
   - `test:` - Agregar tests
   - `chore:` - Mantenimiento

5. **Push y Pull Request**:
   ```bash
   git push origin feature/nombre-feature
   ```

### Convenciones de Código

#### JavaScript/React

- **Naming**:
  - Components: PascalCase (`AssetCard.jsx`)
  - Functions: camelCase (`calculateProfit()`)
  - Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

- **Estructura de Componentes**:
  ```javascript
  // Imports
  import React from 'react';

  // Component
  const MyComponent = ({ prop1, prop2 }) => {
    // Hooks
    const [state, setState] = useState();

    // Handlers
    const handleClick = () => {};

    // Render
    return <div>...</div>;
  };

  export default MyComponent;
  ```

#### Backend

- **Controllers**: Un archivo por recurso
- **Routes**: RESTful naming
- **Models**: PascalCase singular (`Asset.js`)
- **Async/Await**: Preferir sobre callbacks

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Todos los tests
npm test

# Con coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Estructura de tests**:
```
backend/tests/
├── unit/
│   ├── models/
│   ├── services/
│   └── utils/
└── integration/
    └── api/
        ├── assets.test.js
        ├── portfolios.test.js
        └── contributions.test.js
```

### Frontend Tests

```bash
cd frontend

# Todos los tests
npm test

# Con coverage
npm run test:coverage

# UI mode (interactivo)
npm run test:ui
```

**Ejemplo de test**:
```javascript
// AssetCard.test.jsx
import { render, screen } from '@testing-library/react';
import AssetCard from './AssetCard';

test('renders asset name', () => {
  const asset = { name: 'Bitcoin', symbol: 'BTC' };
  render(<AssetCard asset={asset} />);
  expect(screen.getByText('Bitcoin')).toBeInTheDocument();
});
```

---

## 🚀 Deployment

### Backend (Railway / Render)

1. **Crear proyecto en Railway/Render**

2. **Configurar variables de entorno**:
   ```
   NODE_ENV=production
   MONGODB_URI=tu_mongodb_uri
   PORT=5000
   CORS_ORIGIN=https://tu-frontend.vercel.app
   ```

3. **Deploy**:
   - Railway: Conecta el repo de GitHub
   - Render: Conecta el repo y selecciona `backend` como root directory

4. **Build Command**: `npm install`
5. **Start Command**: `npm start`

### Frontend (Vercel / Netlify)

1. **Crear proyecto en Vercel/Netlify**

2. **Configurar build**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`

3. **Variables de entorno**:
   ```
   VITE_API_BASE_URL=https://tu-backend.railway.app/api/v1
   ```

4. **Deploy**: Push to main branch (auto-deploy configurado)

### Verificación Post-Deploy

- [ ] Backend responde en `/api/v1/assets`
- [ ] Frontend carga correctamente
- [ ] CORS configurado correctamente
- [ ] Base de datos conectada
- [ ] Variables de entorno aplicadas

---

## 🗺️ Roadmap

### Fase 1: MVP (Actual)
- [x] Arquitectura y documentación
- [ ] CRUD de Assets
- [ ] CRUD de Contributions
- [ ] Sistema de Portfolios
- [ ] Dashboard básico
- [ ] Visualizaciones core

### Fase 2: Mejoras UX (Q2 2025)
- [ ] Autenticación de usuarios (JWT)
- [ ] Actualización automática de precios (APIs externas)
- [ ] Export/Import de datos (CSV, JSON)
- [ ] Dark mode
- [ ] Responsive refinement

### Fase 3: Features Avanzadas (Q3 2025)
- [ ] Sistema de alertas y notificaciones
- [ ] Rebalanceo automático de portfolios
- [ ] Reportes PDF
- [ ] Multi-currency support
- [ ] Comparación con benchmarks (S&P 500, etc.)

### Fase 4: Escalabilidad (Q4 2025)
- [ ] Multi-tenancy (múltiples usuarios)
- [ ] Roles y permisos
- [ ] API pública con rate limiting
- [ ] Caché con Redis
- [ ] Optimizaciones de performance

### Ideas Futuras
- 📱 App móvil (React Native)
- 🤖 Análisis con IA (recomendaciones)
- 🔗 Integración con exchanges (Binance, Coinbase)
- 📊 Backtesting de estrategias
- 👥 Sharing de portfolios (público/privado)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. **Fork** el repositorio
2. **Crea** una rama de feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'feat: add AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Reportar Bugs

Usa [GitHub Issues](https://github.com/gabrielgonzl/PersonalFI/issues) con:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Información del entorno (OS, navegador, versión)

### Solicitar Features

Abre un issue con el tag `enhancement` describiendo:
- Caso de uso
- Beneficio esperado
- Propuesta de implementación (opcional)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Gabriel Gonzalez**
- GitHub: [@gabrielgonzl](https://github.com/gabrielgonzl)
- Email: contact@growing-app.com

---

## 🙏 Agradecimientos

- [React](https://react.dev/) - UI Library
- [Express](https://expressjs.com/) - Web Framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Recharts](https://recharts.org/) - Charting Library
- [React Query](https://tanstack.com/query/latest) - Data Fetching
- [Vite](https://vitejs.dev/) - Build Tool

---

## 📞 Soporte

Si necesitas ayuda:

1. Revisa la [documentación](docs/)
2. Busca en [Issues existentes](https://github.com/gabrielgonzl/PersonalFI/issues)
3. Abre un [nuevo issue](https://github.com/gabrielgonzl/PersonalFI/issues/new)
4. Únete a nuestro [Discord](https://discord.gg/growing-app) (próximamente)

---

<div align="center">

**Hecho con ❤️ por la comunidad Growing**

[⬆️ Volver arriba](#-growing---personal-investment-tracker)

</div>
