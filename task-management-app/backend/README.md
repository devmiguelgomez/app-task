# Task Management App - Backend API

Este es el backend para la aplicación de gestión de tareas. Proporciona una API RESTful para manejar usuarios y tareas.

## Configuración

1. Instalar dependencias:
   ```
   npm install
   ```

2. Configurar variables de entorno:
   - Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
     ```
     MONGO_URI=mongodb://localhost:27017/taskmanager
     JWT_SECRET=your_jwt_secret
     PORT=5000
     NODE_ENV=development
     ```

3. Iniciar el servidor:
   ```
   npm run dev
   ```

## Endpoints de la API

### Usuarios

- **POST /api/users/register** - Registrar un nuevo usuario
  - Body: `{ name, email, password }`

- **POST /api/users/login** - Iniciar sesión
  - Body: `{ email, password }`

- **POST /api/users/forgot-password** - Solicitar restablecimiento de contraseña
  - Body: `{ email }`

- **PUT /api/users/reset-password** - Restablecer contraseña
  - Body: `{ token, password }`

- **GET /api/users/profile** - Obtener perfil de usuario (requiere autenticación)

- **PUT /api/users/profile** - Actualizar perfil de usuario (requiere autenticación)
  - Body: `{ name, email, password }`

### Tareas

- **GET /api/tasks** - Obtener todas las tareas del usuario (requiere autenticación)

- **POST /api/tasks** - Crear una nueva tarea (requiere autenticación)
  - Body: `{ title, description, dueDate, priority }`

- **GET /api/tasks/:id** - Obtener una tarea por ID (requiere autenticación)

- **PUT /api/tasks/:id** - Actualizar una tarea (requiere autenticación)
  - Body: `{ title, description, dueDate, priority, completed }`

- **DELETE /api/tasks/:id** - Eliminar una tarea (requiere autenticación)

- **GET /api/tasks/filter/:status** - Filtrar tareas por estado (requiere autenticación)
  - status: `completed` o `pending`

- **GET /api/tasks/priority/:level** - Filtrar tareas por prioridad (requiere autenticación)
  - level: `low`, `medium` o `high`

## Autenticación

Para las rutas protegidas, incluir el token JWT en el header de la solicitud:

```
Authorization: Bearer <token>
```

## Modelos de Datos

### Usuario
- name: String (requerido)
- email: String (requerido, único)
- password: String (requerido, mínimo 6 caracteres)
- resetPasswordToken: String
- resetPasswordExpire: Date
- createdAt: Date

### Tarea
- title: String (requerido)
- description: String
- dueDate: Date (requerido)
- priority: String (enum: 'low', 'medium', 'high', default: 'medium')
- completed: Boolean (default: false)
- user: ObjectId (referencia a Usuario)
- createdAt: Date