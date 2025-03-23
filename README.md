# Task Management App

Una aplicación moderna de gestión de tareas con autenticación de usuarios, notificaciones y un diseño responsivo.

![Captura de pantalla de la aplicación]

## 🌟 Características

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
- CSS personalizado para estilos
- React Icons para iconografía
- Vite como bundler

### Backend
- Node.js con Express
- MongoDB como base de datos
- JWT para autenticación
- Mongoose para ODM
- Bcrypt para cifrado de contraseñas
- Nodemailer para envío de correos

### Despliegue
- Vercel para el frontend y backend
- MongoDB Atlas para la base de datos

## 🚀 Instalación y configuración

### Requisitos previos
- Node.js (v14 o superior)
- MongoDB (local o acceso a MongoDB Atlas)

### Pasos de instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <url-de-tu-repositorio>
   cd app-task

## 🔔 Sistema de Notificaciones por Correo

Se ha implementado un sistema completo de notificaciones por correo electrónico con las siguientes características:

### Recordatorios Automáticos

- **Programación automática**: Utilizando `node-cron`, el sistema envía recordatorios de tareas pendientes de forma automática.
- **Recordatorios diarios**: Envía correos para tareas que vencen en los próximos 2 días.
- **Alertas de vencimiento**: Notifica el mismo día que una tarea vence.

### Preferencias de Usuario

Se ha añadido una sección de preferencias en el perfil del usuario que permite:

- Activar/desactivar notificaciones por correo
- Configurar tipos de recordatorios:
  - Recordatorios de tareas próximas a vencer
  - Alertas de vencimiento para el mismo día
  - Resúmenes semanales de tareas pendientes

### Implementación Técnica

- **Nodemailer**: Configurado para enviar correos a través de proveedores como Gmail.
- **Plantillas HTML**: Correos con diseño atractivo y responsive.
- **Persistencia de preferencias**: Las preferencias se guardan en MongoDB.

### Configuración

Para activar el sistema de correos, asegúrate de configurar las siguientes variables de entorno:

```bash
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
FRONTEND_URL=https://pp-task-chi.vercel.app
