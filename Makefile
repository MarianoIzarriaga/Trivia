# Makefile para Trivia Game
# Comandos Docker Compose para manejar la aplicación

.PHONY: help db up down stop restart logs clean build rebuild dev prod status ps

# Configuración
COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = trivia

# Ayuda por defecto
help:
	@echo "🎮 Trivia Game - Docker Commands"
	@echo ""
	@echo "Comandos disponibles:"
	@echo ""
	@echo "📦 Base de Datos (Por defecto):"
	@echo "  make db          - Levantar solo SQL Server"
	@echo "  make db-stop     - Detener SQL Server"
	@echo "  make db-logs     - Ver logs de SQL Server"
	@echo ""
	@echo "🚀 Aplicación Completa:"
	@echo "  make up          - Levantar todos los servicios (BD + Backend + Frontend)"
	@echo "  make down        - Detener y eliminar contenedores"
	@echo "  make stop        - Detener contenedores sin eliminar"
	@echo "  make restart     - Reiniciar todos los servicios"
	@echo ""
	@echo "🔧 Desarrollo:"
	@echo "  make dev         - Levantar en modo desarrollo"
	@echo "  make build       - Construir imágenes"
	@echo "  make rebuild     - Reconstruir imágenes desde cero"
	@echo ""
	@echo "📊 Monitoreo:"
	@echo "  make logs        - Ver logs de todos los servicios"
	@echo "  make logs-f      - Seguir logs en tiempo real"
	@echo "  make status      - Ver estado de los servicios"
	@echo "  make ps          - Listar contenedores"
	@echo ""
	@echo "🧹 Limpieza:"
	@echo "  make clean       - Limpiar contenedores y volúmenes"
	@echo "  make clean-all   - Limpieza completa (incluye imágenes)"
	@echo ""

# ==== COMANDOS DE BASE DE DATOS ====

# Levantar solo SQL Server (comando por defecto)
db:
	@echo "🗄️  Levantando SQL Server..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up -d sqlserver
	@echo "✅ SQL Server está ejecutándose en puerto 1433"
	@echo "💡 Credenciales: sa / TriviaPassword123!"

# Detener solo SQL Server
db-stop:
	@echo "🛑 Deteniendo SQL Server..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) stop sqlserver

# Ver logs de SQL Server
db-logs:
	@echo "📋 Logs de SQL Server:"
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs sqlserver

# ==== COMANDOS DE APLICACIÓN COMPLETA ====

# Levantar todos los servicios
up:
	@echo "🚀 Levantando todos los servicios..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile full up -d
	@echo "✅ Aplicación completa ejecutándose:"
	@echo "   - SQL Server: localhost:1433"
	@echo "   - Backend API: http://localhost:5000"
	@echo "   - Frontend: http://localhost:3000"

# Detener y eliminar contenedores
down:
	@echo "🛑 Deteniendo y eliminando contenedores..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down

# Solo detener contenedores
stop:
	@echo "⏸️  Deteniendo contenedores..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) stop

# Reiniciar todos los servicios
restart:
	@echo "🔄 Reiniciando servicios..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) restart

# ==== COMANDOS DE DESARROLLO ====

# Modo desarrollo con logs
dev:
	@echo "👨‍💻 Iniciando en modo desarrollo..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile full up

# Construir imágenes
build:
	@echo "🔨 Construyendo imágenes..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build

# Reconstruir imágenes desde cero
rebuild:
	@echo "🔨 Reconstruyendo imágenes desde cero..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build --no-cache

# ==== COMANDOS DE MONITOREO ====

# Ver logs de todos los servicios
logs:
	@echo "📋 Logs de todos los servicios:"
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs

# Seguir logs en tiempo real
logs-f:
	@echo "📋 Siguiendo logs en tiempo real (Ctrl+C para salir):"
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs -f

# Ver estado de los servicios
status:
	@echo "📊 Estado de los servicios:"
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) ps

# Alias para status
ps: status

# Ver logs específicos de un servicio
logs-db:
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs sqlserver

logs-backend:
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs backend

logs-frontend:
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs frontend

# ==== COMANDOS DE LIMPIEZA ====

# Limpiar contenedores y volúmenes
clean:
	@echo "🧹 Limpiando contenedores y volúmenes..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down -v
	docker system prune -f

# Limpieza completa
clean-all:
	@echo "🧹 Limpieza completa (contenedores, volúmenes e imágenes)..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down -v --rmi all
	docker system prune -af

# ==== COMANDOS ÚTILES ====

# Entrar al contenedor de SQL Server
db-shell:
	@echo "🐚 Entrando al contenedor SQL Server..."
	docker exec -it trivia-sqlserver /bin/bash

# Conectar a SQL Server con sqlcmd
db-connect:
	@echo "💾 Conectando a SQL Server con sqlcmd..."
	docker exec -it trivia-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P TriviaPassword123!

# Ver información de la red
network:
	@echo "🌐 Información de la red Docker:"
	docker network ls | grep trivia
	docker network inspect trivia_trivia-network

# Verificar health checks
health:
	@echo "🏥 Estado de salud de los servicios:"
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) ps

# Comando por defecto cuando se ejecuta solo 'make'
.DEFAULT_GOAL := db
