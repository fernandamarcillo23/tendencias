# 🚀 Formulario React + PostgreSQL con Docker

Este proyecto implementa una solución completa y autocontenida que cumple con los siguientes requerimientos:
- ⚛️ **Formulario en React** con diseño moderno, validaciones e historial en tiempo real.
- 🐘 **Base de datos PostgreSQL** para el almacenamiento de datos.
- 💾 **Volumen de Docker (`volumen_postgres`)** para garantizar la persistencia de datos ante reinicios o eliminación de contenedores.
- 🌐 **Red interna de Docker (`red_formulario`)** que conecta exclusivamente a los dos contenedores.
- 🐳 **2 Contenedores aislados**:
  1. `react_app`: Frontend React + API en Node.js/Express.
  2. `postgres_db`: Motor de base de datos PostgreSQL 16.

---

## 📁 Estructura del Proyecto

```text
tendencias.fernanda/
├── client/                 # Frontend en React (Vite)
│   ├── src/
│   │   ├── App.jsx         # Formulario y tabla de registros
│   │   ├── index.css       # Estilos modernos y responsivos
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # API Node.js / Express
│   ├── index.js            # Conexión a PostgreSQL y rutas API
│   └── package.json
├── Dockerfile              # Construcción multi-etapa de la aplicación
├── docker-compose.yml      # Orquestación de los 2 contenedores, red y volumen
├── .dockerignore
└── README.md
```

---

## 🛠️ Método 1: Ejecutar con Docker Compose (Recomendado)

### 1. Construir e iniciar los contenedores
Abre tu terminal en la carpeta del proyecto y ejecuta:
```bash
docker compose up --build -d
```

### 2. Verificar que todo está arriba
```bash
docker compose ps
```
Verás los 2 contenedores activos (`react_app` y `postgres_db`).

### 3. Abrir la aplicación
Entra en tu navegador a:
👉 **[http://localhost:3001](http://localhost:3001)**

### 4. Probar la persistencia del volumen
1. Llena el formulario con algunos datos y presiona **Guardar en PostgreSQL**.
2. Detén los contenedores:
   ```bash
   docker compose down
   ```
3. Vuelve a levantarlos:
   ```bash
   docker compose up -d
   ```
4. Abre nuevamente [http://localhost:3000](http://localhost:3000) y verás que **los datos siguen intactos** gracias al volumen `volumen_postgres`.

---

## 💻 Método 2: Ejecutar con Comandos de Docker Puro (CLI)

Si para tu entrega o evaluación necesitas demostrar los comandos de Docker uno a uno:

### Paso 1: Crear la red
```bash
docker network create red_formulario
```

### Paso 2: Crear el volumen
```bash
docker volume create volumen_postgres
```

### Paso 3: Iniciar el contenedor de PostgreSQL
```bash
docker run -d \
  --name postgres_db \
  --network red_formulario \
  -v volumen_postgres:/var/lib/postgresql/data \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=formulariodb \
  postgres:16-alpine
```

### Paso 4: Construir la imagen de la aplicación
```bash
docker build -t mi-react-app .
```

### Paso 5: Iniciar el contenedor de React/App
```bash
docker run -d \
  --name react_app \
  --network red_formulario \
  -p 3000:3000 \
  -e PORT=3000 \
  -e DB_HOST=postgres_db \
  -e DB_PORT=5432 \
  -e DB_USER=admin \
  -e DB_PASSWORD=password123 \
  -e DB_NAME=formulariodb \
  mi-react-app
```

---

## ☁️ ¿Cómo subirlo al Servidor?

Tienes dos formas sencillas de llevarlo a tu servidor:

### Opción A: Mediante Git (La más rápida y limpia)
1. Sube este proyecto a tu repositorio de GitHub o GitLab.
2. Conéctate a tu servidor por SSH:
   ```bash
   ssh usuario@ip_de_tu_servidor
   ```
3. Clona el repositorio en el servidor:
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd <CARPETA_DEL_PROYECTO>
   ```
4. Asegúrate de tener Docker instalado en el servidor y ejecuta:
   ```bash
   docker compose up --build -d
   ```
5. Abre en tu navegador: `http://ip_de_tu_servidor:3000`.

---

### Opción B: Copiando los archivos con SCP
Desde tu computadora (PowerShell o Git Bash):
```bash
scp -r tendencias.fernanda usuario@ip_de_tu_servidor:/home/usuario/
```
Luego en el servidor entras a la carpeta y ejecutas:
```bash
docker compose up --build -d
```
