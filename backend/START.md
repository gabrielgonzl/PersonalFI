# 🚀 Instrucciones de Inicio - Growing Backend

## ⚠️ IMPORTANTE: MongoDB Requerido

El backend **requiere MongoDB** para funcionar. Tienes dos opciones:

---

## Opción 1: MongoDB Local (Recomendado para desarrollo)

### 1. Instalar MongoDB

**Ubuntu/Debian:**
```bash
# Importar clave pública
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Crear lista de fuentes
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Actualizar e instalar
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**MacOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Descargar e instalar desde: https://www.mongodb.com/try/download/community

### 2. Verificar que MongoDB está corriendo

```bash
# Debería conectarse sin errores
mongosh
```

### 3. Configurar .env

El archivo `.env` ya está configurado para MongoDB local:
```env
MONGODB_URI=mongodb://localhost:27017/growing
```

### 4. Iniciar el servidor

```bash
npm run dev
```

---

## Opción 2: MongoDB Atlas (Cloud - Gratis)

### 1. Crear cuenta en MongoDB Atlas

1. Ve a https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratis
3. Crea un cluster (M0 es gratis)

### 2. Obtener URI de conexión

1. En tu cluster, haz clic en "Connect"
2. Selecciona "Connect your application"
3. Copia la URI de conexión

### 3. Configurar .env

Edita `/backend/.env` y reemplaza la URI:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/growing?retryWrites=true&w=majority
```

**IMPORTANTE**: Reemplaza:
- `username` con tu usuario de MongoDB Atlas
- `password` con tu contraseña
- `cluster0.xxxxx.mongodb.net` con tu URL de cluster

### 4. Configurar IP Whitelist

En MongoDB Atlas:
1. Ve a "Network Access"
2. Agrega tu IP o `0.0.0.0/0` (para permitir todas - solo desarrollo)

### 5. Iniciar el servidor

```bash
npm run dev
```

---

## ✅ Verificar que Funciona

Una vez iniciado, deberías ver:

```
==================================================
🚀 Growing API Server Started
📍 Environment: development
🔗 URL: http://localhost:5000
📊 API Base: http://localhost:5000/api/v1
💚 Health Check: http://localhost:5000/api/v1/health
==================================================
✅ MongoDB Connected: localhost:27017
📊 Database: growing
```

### Probar el Health Endpoint

```bash
curl http://localhost:5000/api/v1/health
```

Deberías recibir:
```json
{
  "success": true,
  "message": "Growing API is running",
  "timestamp": "2025-11-14T12:30:00.000Z",
  "uptime": 10.5
}
```

---

## 🐛 Troubleshooting

### Error: "MongooseServerSelectionError"

**Problema**: No puede conectarse a MongoDB

**Solución**:
1. Verifica que MongoDB esté corriendo: `sudo systemctl status mongod`
2. Si no está corriendo: `sudo systemctl start mongod`
3. Verifica la URI en `.env`

### Error: "Authentication failed"

**Problema**: Credenciales incorrectas (MongoDB Atlas)

**Solución**:
1. Verifica usuario y contraseña en la URI
2. Asegúrate de que el usuario tenga permisos de lectura/escritura

### Error: "IP not whitelisted"

**Problema**: Tu IP no está permitida (MongoDB Atlas)

**Solución**:
1. Ve a "Network Access" en MongoDB Atlas
2. Agrega tu IP actual o `0.0.0.0/0` (solo desarrollo)

### Warning: "Duplicate schema index"

**Problema**: Índices duplicados en modelos

**Solución**: Ya corregido en la última versión

---

## 📝 Scripts Disponibles

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start

# Tests
npm test

# Linting
npm run lint
npm run lint:fix
```

---

## 🔧 Configuración Adicional

### Variables de Entorno

Edita `/backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB (elige una opción)
# Opción 1: Local
MONGODB_URI=mongodb://localhost:27017/growing

# Opción 2: Atlas
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/growing

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🎯 Siguientes Pasos

Una vez que el backend esté corriendo:

1. **Probar endpoints manualmente**:
   ```bash
   # Health check
   curl http://localhost:5000/api/v1/health

   # Crear un asset
   curl -X POST http://localhost:5000/api/v1/assets \
     -H "Content-Type: application/json" \
     -d '{"name":"Bitcoin","symbol":"BTC","type":"crypto","currentPrice":45000}'
   ```

2. **Iniciar el frontend** (en otra terminal):
   ```bash
   cd ../frontend
   npm run dev
   ```

3. **Ver la documentación completa**:
   - API: `/docs/API_ENDPOINTS.md`
   - Guía Frontend: `/docs/BACKEND_FOR_FRONTEND.md`

---

## 📞 Soporte

Si tienes problemas:

1. Verifica los logs del servidor (aparecen en consola)
2. Revisa que MongoDB esté corriendo
3. Verifica las variables de entorno en `.env`
4. Consulta la documentación en `/docs`

---

**Última actualización**: 2025-11-14
