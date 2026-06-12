# NexaOps AI Services

NexaOps AI Services es una aplicación web full-stack desarrollada para presentar, consultar y administrar un catálogo de servicios digitales enfocados en automatización, inteligencia artificial, analítica predictiva y transformación digital.

El proyecto cuenta con una interfaz web responsiva, consumo de API REST, autenticación con JWT, manejo de roles y persistencia de datos mediante SQLite.

---

## Características principales

* Landing page responsiva para presentar la propuesta de valor del proyecto.
* Catálogo de servicios digitales consumido desde una API REST.
* Filtrado de servicios por categoría.
* Inicio de sesión con correo y contraseña.
* Autenticación mediante JWT.
* Manejo de roles: `admin` y `user`.
* Panel administrativo para crear, editar y eliminar servicios.
* Validación básica de formularios en frontend y backend.
* Base de datos SQLite inicializable con datos de demostración.

---

## Tecnologías utilizadas

### Frontend

* React
* Vite
* JavaScript
* CSS
* React Icons
* LocalStorage

### Backend

* Node.js
* Express
* SQLite
* sqlite3
* bcryptjs
* jsonwebtoken
* dotenv
* cors
* nodemon

---

## Estructura del proyecto

```text
nexaops-ai-services/
├── backend/
│   ├── server.js
│   ├── init-db.js
│   ├── package.json
│   └── src/
│       ├── config/
│       ├── middlewares/
│       └── routes/
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── main.jsx
│       ├── assets/
│       └── services/
│
├── package.json
└── README.md
```



## Requisitos previos

Antes de ejecutar el proyecto, es necesario tener instalado:

* Node.js en versión LTS o superior.
* npm.
* Git.
* Visual Studio Code o cualquier editor de código.

Para verificar la instalación:

```bash
node -v
npm -v
git --version
```

---

## Configuración del entorno

Dentro de la carpeta `backend`, crear un archivo `.env` con las variables necesarias para la autenticación:

```env
JWT_SECRET=change_this_secret_key
JWT_EXPIRES_IN=2h
```



## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd nexaops-ai-services
```

### 2. Ejecutar el backend

```bash
cd backend
npm install
npm run init-db
npm run dev
```

El backend estará disponible en:

```text
http://localhost:4000
```

Para verificar que la API funciona correctamente, abrir:

```text
http://localhost:4000/
```

Respuesta esperada:

```json
{
  "message": "API NexaOps AI Services funcionando correctamente",
  "version": "1.0.0"
}
```

### 3. Ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en:

```text
http://localhost:5173
```

---



## Scripts disponibles

### Backend

Ejecutar dentro de `backend/`:

| Comando           | Descripción                                       |
| ----------------- | ------------------------------------------------- |
| `npm install`     | Instala las dependencias del backend              |
| `npm run dev`     | Ejecuta el servidor en modo desarrollo            |
| `npm start`       | Ejecuta el servidor con Node.js                   |
| `npm run init-db` | Inicializa la base de datos SQLite con datos demo |

### Frontend

Ejecutar dentro de `frontend/`:

| Comando           | Descripción                              |
| ----------------- | ---------------------------------------- |
| `npm install`     | Instala las dependencias del frontend    |
| `npm run dev`     | Ejecuta la aplicación en modo desarrollo |
| `npm run build`   | Genera la versión de producción          |
| `npm run preview` | Previsualiza el build generado           |

---



## Diseño de base de datos

El proyecto utiliza SQLite como base de datos local. La estructura se inicializa desde el archivo:

```text
backend/init-db.js
```

### Tablas principales

| Tabla                | Descripción                                             |
| -------------------- | ------------------------------------------------------- |
| `users`              | Almacena usuarios, contraseñas encriptadas y roles      |
| `service_categories` | Contiene las categorías del catálogo                    |
| `services`           | Almacena los servicios ofrecidos por la plataforma      |
| `business_requests`  | Guarda solicitudes de información asociadas a servicios |


## Autor

Proyecto desarrollado como prueba técnica para demostrar habilidades en desarrollo frontend, backend, consumo de API REST, autenticación, manejo de base de datos y documentación técnica.
