# 🎮 Trivia Game

Proyecto Trivia - Programación en nuevas Tecnologías

Aplicación de trivia con React frontend, .NET backend y SQL Server.

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker y Docker Compose
- Make (opcional, para comandos simplificados)

### Comandos Principales

```bash
# Ver todos los comandos disponibles
make help

# Levantar solo la base de datos (por defecto)
make db

# Levantar la aplicación completa (BD + Backend + Frontend)
make up

# Detener todos los servicios
make down
```

## 📦 Servicios

| Servicio    | Puerto | URL                     | Descripción   |
| ----------- | ------ | ----------------------- | ------------- |
| SQL Server  | 1433   | `localhost:1433`        | Base de datos |
| Backend API | 5000   | `http://localhost:5000` | API .NET      |
| Frontend    | 3000   | `http://localhost:3000` | React App     |

### Credenciales SQL Server
- **Usuario:** `sa`
- **Contraseña:** `TriviaPassword123!`

## 🔧 Comandos de Desarrollo

```bash
# Desarrollo con logs en tiempo real
make dev

# Ver logs de todos los servicios
make logs

# Ver logs en tiempo real
make logs-f

# Ver estado de los servicios
make status

# Reconstruir imágenes desde cero
make rebuild
```

## 🎯 Uso de la Aplicación

1. **Iniciar solo la BD (por defecto):**
   ```bash
   make db
   ```

2. **Iniciar aplicación completa:**
   ```bash
   make up
   ```

3. **Acceder a la aplicación:**
   - Frontend: http://localhost:3000
   - API Backend: http://localhost:5000

## 🧹 Limpieza

```bash
# Limpiar contenedores y volúmenes
make clean

# Limpieza completa (incluye imágenes)
make clean-all
```

## 🛠️ Estructura del Proyecto

```
trivia/
├── docker-compose.yml      # Configuración de servicios
├── Makefile               # Comandos simplificados
├── trivia-backend/        # API .NET
│   ├── Dockerfile
│   └── ...
├── trivia-client/         # Frontend React
│   ├── Dockerfile
│   └── ...
└── README.md
```

## 📝 Notas de Desarrollo

- **Perfiles Docker Compose:** 
  - Por defecto solo se levanta SQL Server
  - Usar `--profile full` para servicios completos
- **Persistencia:** Los datos de SQL Server se guardan en volumen Docker
- **Hot Reload:** Configurado para desarrollo en ambos servicios
