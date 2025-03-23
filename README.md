# Task Management App

Una aplicación moderna de gestión de tareas con autenticación de usuarios, notificaciones y un diseño responsivo.

## ✨ Características

- **Autenticación completa** de usuarios (registro, inicio de sesión, recuperación de contraseña)
- **Gestión de tareas** (crear, editar, eliminar, marcar como completadas)
- **Filtrado de tareas** por estado y prioridad
- **Tema claro/oscuro** adaptado a las preferencias del sistema
- **Diseño responsivo** para todas las pantallas
- **Notificaciones** para tareas pendientes
- **API RESTful** para la comunicación cliente-servidor

## 🛠️ Tecnologías utilizadas

### Frontend
- React.js
- React Router para navegación
- Framer Motion para animaciones
- React Icons para iconografía
- React Toastify para notificaciones
- CSS personalizado para estilos
- Vite como bundler

### Backend
- Node.js con Express
- MongoDB como base de datos
- JWT para autenticación
- Mongoose para ODM
- Bcrypt para cifrado de contraseñas
- Nodemailer para envío de correos
- Node-cron para tareas programadas

### Despliegue
- Vercel para el frontend y backend
- MongoDB Atlas para la base de datos

## 📁 Estructura del Proyecto
app-task/
├── task-management-app/
│   ├── backend/# API   REST con Express
│   │   ├── middleware/# Middleware de autenticación
│   │   ├── models/# Modelos de datos (Mongoose)
│   │   ├── routes/# Rutas de la API
│   │   ├── services/# Servicios (email, scheduler)
│   │   └── server.js# Punto de entrada
│   │
│   └── fronted/# Aplicación React
│       ├── public/# Archivos estáticos
│       └── src/# Código fuente
│           ├── components/# Componentes React
│           ├── services/# Servicios de API
│           ├── styles/# Estilos CSS
│           └── utils/# Utilidades
## 🚀 Instalación y configuración
**Requisitos previos**
-Node.js (v14 o superior)
-MongoDB (local o acceso a MongoDB Atlas)
**Pasos de instalación**
1.Clonar el repositorio:
   -git clone <url-del-repositorio>
   -cd app-task
2.Configurar el Backend:
   -cd task-management-app/backend
   -npm install

Crear un archivo **.env** con las siguientes variables:

-MONGO_URI=mongodb+srv://-usuario:contraseña@cluster.mongodb.net/database
-JWT_SECRET=tu_clave_secreta
-PORT=5000
-NODE_ENV=development
-EMAIL_USER=tu-correo@gmail.com
-EMAIL_PASSWORD=tu-contraseña-de-aplicacion
-FRONTEND_URL=http://localhost:5173

3.Configurar el Frontend:
   -cd ../fronted
   -npm install

4.Iniciar la aplicación:

# En una terminal (Backend)
   -cd task-management-app/backend
   -npm run dev

# En otra terminal (Frontend)
   -cd task-management-app/fronted
   -npm run dev

## 📧 Sistema de Notificaciones por Correo
Se ha implementado un sistema completo de notificaciones por correo electrónico con las siguientes características:

**Recordatorios Automáticos**
 -Programación automática: Utilizando node-cron, el sistema envía recordatorios de tareas pendientes de forma automática.
 -Recordatorios diarios: Envía correos para tareas que vencen en los próximos 2 días.
 -Alertas de vencimiento: Notifica el mismo día que una tarea vence.

**Preferencias de Usuario**
Se ha añadido una sección de preferencias en el perfil del usuario que permite:

 -Activar/desactivar notificaciones por correo
 -Configurar tipos de recordatorios:
   - Recordatorios de tareas próximas a vencer
   - Alertas de vencimiento para el mismo día
   - Resúmenes semanales de tareas pendientes
**Implementación Técnica**
- *Nodemailer*: Configurado para enviar correos a través de proveedores como Gmail.
- *Plantillas HTML*: Correos con diseño atractivo y responsive.
- *Persistencia de preferencias*: Las preferencias se guardan en MongoDB.

**Configuración del Correo**

Para activar el sistema de correos, asegúrate de configurar las siguientes variables de entorno:

-EMAIL_USER=tu-correo@gmail.com
-EMAIL_PASSWORD=tu-contraseña-de-aplicacion
-FRONTEND_URL=https://pp-task-chi.vercel.app

Para Gmail, debes crear una "contraseña de aplicación" específica en la configuración de seguridad de tu cuenta de Google.

**📱 Modelos de Datos**

*Usuario*
-name: String (requerido)
-email: String (requerido, único)
-password: String (requerido, mínimo 6 -caracteres)
-resetPasswordToken: String
-resetPasswordExpire: Date
-createdAt: Date

*Tarea*
-title: String (requerido)
-description: String
-dueDate: Date (requerido)
-priority: String (enum: 'low', 'medium', 'high', default: 'medium')
-completed: Boolean (default: false)
-user: ObjectId (referencia a Usuario)
-createdAt: Date

**🔐 Autenticación**
Para las rutas protegidas, se incluye el token JWT en el header de la solicitud:

-Authorization: Bearer <token>

**🎨 Temas y Diseño**

La aplicación incluye un sistema de temas claro/oscuro que puede cambiarse manualmente o adaptarse automáticamente a las preferencias del sistema operativo. Los estilos están implementados con CSS personalizado y variables para facilitar el cambio de tema.

**⚠️ Solución de problemas comunes**

-*Error de envío de correos*: Verifica que las credenciales de correo sean correctas y que estés usando una "contraseña de aplicación" para Gmail.
-*Problemas de conexión a MongoDB*: Asegúrate de que la URI de conexión sea correcta y que la IP desde donde te conectas esté permitida en MongoDB Atlas.

------------------------------------------
Desarrollado con ❤️ por Miguel Gómez

