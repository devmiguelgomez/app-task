import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Verifica la configuración del correo electrónico
const transporter = nodemailer.createTransport({
  service: 'gmail', // O el servicio que uses
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Usa una contraseña de aplicación para Gmail
  },
  tls: {
    rejectUnauthorized: false // Añade esto para entornos de desarrollo
  }
});

// Añade una función de prueba para verificar la configuración
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
};

// Asegúrate de llamar a esto cuando inicia el servidor

const emailService = {
  /**
   * Envía un correo electrónico
   * @param {Object} options - Opciones de correo
   * @returns {Promise} - Resultado del envío
   */
  sendEmail: async (options) => {
    try {
      const { to, subject, text, html } = options;
      
      const mailOptions = {
        from: `"Task Management App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html: html || text
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Correo enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error al enviar correo:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Envía un recordatorio de tarea
   * @param {Object} task - Datos de la tarea
   * @param {Object} user - Datos del usuario
   * @param {string} [customSubject=null] - Asunto personalizado
   * @param {string} [customMessage=null] - Mensaje personalizado
   * @returns {Promise} - Resultado del envío
   */
  sendTaskReminder: async (task, user, customSubject = null, customMessage = null) => {
    try {
      const subject = customSubject || 'Recordatorio de tarea pendiente';
      const messageIntro = customMessage || `Tu tarea "${task.title}" está próxima a vencer.`;
      
      // Implementa el envío real del correo
      return emailService.sendEmail({
        to: user.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Recordatorio de Tarea</h2>
            <p style="font-size: 16px; color: #555;">${messageIntro}</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Detalles de la tarea</h3>
              <p><strong>Título:</strong> ${task.title}</p>
              <p><strong>Descripción:</strong> ${task.description || 'Sin descripción'}</p>
              <p><strong>Fecha de vencimiento:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
              <p><strong>Prioridad:</strong> ${
                task.priority === 'high' ? '⚠️ Alta' : 
                task.priority === 'medium' ? '⚡ Media' : '📝 Baja'
              }</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver mi tarea</a>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error('Error al enviar recordatorio de tarea:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Envía un reporte de tareas vencidas
   * @param {Array} tasks - Lista de tareas vencidas
   * @param {Object} user - Datos del usuario
   * @param {Object} groups - Grupos de tareas por tiempo de vencimiento
   * @returns {Promise} - Resultado del envío
   */
  sendOverdueTasksReport: async (tasks, user, groups) => {
    try {
      let tasksHTML = '';
      
      // Tareas vencidas recientemente (menos de 24h)
      if (groups.recentlyOverdue.length > 0) {
        tasksHTML += `
          <h3 style="color: #e67e22; margin-top: 15px;">Vencidas recientemente (últimas 24 horas)</h3>
          <ul style="padding-left: 20px;">
            ${groups.recentlyOverdue.map(task => `
              <li style="margin-bottom: 10px;">
                <strong>${task.title}</strong> - Vencida el ${new Date(task.dueDate).toLocaleString()}
                <br><span style="color: #777;">${task.description || 'Sin descripción'}</span>
              </li>
            `).join('')}
          </ul>
        `;
      }
      
      // Tareas moderadamente vencidas (1-3 días)
      if (groups.moderatelyOverdue.length > 0) {
        tasksHTML += `
          <h3 style="color: #d35400; margin-top: 15px;">Vencidas hace algunos días (1-3 días)</h3>
          <ul style="padding-left: 20px;">
            ${groups.moderatelyOverdue.map(task => `
              <li style="margin-bottom: 10px;">
                <strong>${task.title}</strong> - Vencida el ${new Date(task.dueDate).toLocaleString()}
                <br><span style="color: #777;">${task.description || 'Sin descripción'}</span>
              </li>
            `).join('')}
          </ul>
        `;
      }
      
      // Tareas severamente vencidas (más de 3 días)
      if (groups.severelyOverdue.length > 0) {
        tasksHTML += `
          <h3 style="color: #c0392b; margin-top: 15px;">Vencidas hace más de 3 días</h3>
          <ul style="padding-left: 20px;">
            ${groups.severelyOverdue.map(task => `
              <li style="margin-bottom: 10px;">
                <strong>${task.title}</strong> - Vencida el ${new Date(task.dueDate).toLocaleString()}
                <br><span style="color: #777;">${task.description || 'Sin descripción'}</span>
              </li>
            `).join('')}
          </ul>
        `;
      }
      
      return emailService.sendEmail({
        to: user.email,
        subject: `⚠️ Tienes ${tasks.length} tareas vencidas`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #c0392b; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Reporte de Tareas Vencidas</h2>
            
            <p style="font-size: 16px; color: #555;">Hola ${user.name},</p>
            <p style="font-size: 16px; color: #555;">Tienes <strong>${tasks.length} tareas vencidas</strong> que requieren tu atención.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
              ${tasksHTML}
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver mis tareas</a>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #f0f0f0; padding-top: 10px;">
              Este es un correo automático. Puedes administrar tus preferencias de notificación en tu perfil.
            </p>
          </div>
        `
      });
    } catch (error) {
      console.error('Error al enviar reporte de tareas vencidas:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Envía un resumen semanal de tareas
   * @param {Object} user - Datos del usuario
   * @param {Object} data - Datos para el resumen (tareas, fechas)
   * @returns {Promise} - Resultado del envío
   */
  sendWeeklyDigest: async (user, data) => {
    try {
      const { weekTasks, overdueTasks, completedTasks, startOfWeek, endOfWeek } = data;
      
      // Formatea las fechas para mostrar en el correo
      const startDate = startOfWeek.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
      
      const endDate = endOfWeek.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
      
      // Genera HTML para tareas de la semana agrupadas por día
      let weekTasksHTML = '';
      if (weekTasks.length > 0) {
        // Agrupar tareas por día
        const tasksByDay = {};
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        weekTasks.forEach(task => {
          const taskDate = new Date(task.dueDate);
          const dayIndex = taskDate.getDay();
          const dayName = days[dayIndex];
          
          if (!tasksByDay[dayName]) {
            tasksByDay[dayName] = [];
          }
          
          tasksByDay[dayName].push(task);
        });
        
        // Generar HTML para cada día
        for (const day of days) {
          if (tasksByDay[day] && tasksByDay[day].length > 0) {
            weekTasksHTML += `
              <h3 style="color: #3498db; margin-top: 15px;">${day}</h3>
              <ul style="padding-left: 20px;">
                ${tasksByDay[day].map(task => `
                  <li style="margin-bottom: 10px;">
                    <strong>${task.title}</strong> - ${new Date(task.dueDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    <br><span style="color: #777;">${task.description || 'Sin descripción'}</span>
                    <br><span style="color: #555; font-size: 12px;">Prioridad: ${
                      task.priority === 'high' ? '⚠️ Alta' : 
                      task.priority === 'medium' ? '⚡ Media' : '📝 Baja'
                    }</span>
                  </li>
                `).join('')}
              </ul>
            `;
          }
        }
      } else {
        weekTasksHTML = '<p style="color: #555;">No tienes tareas programadas para esta semana.</p>';
      }
      
      // Genera HTML para tareas vencidas
      let overdueTasksHTML = '';
      if (overdueTasks.length > 0) {
        overdueTasksHTML = `
          <h3 style="color: #c0392b; margin-top: 15px;">Tareas vencidas</h3>
          <ul style="padding-left: 20px;">
            ${overdueTasks.map(task => `
              <li style="margin-bottom: 10px;">
                <strong>${task.title}</strong> - Vencida el ${new Date(task.dueDate).toLocaleString()}
                <br><span style="color: #777;">${task.description || 'Sin descripción'}</span>
              </li>
            `).join('')}
          </ul>
        `;
      }
      
      // Genera HTML para tareas completadas
      let completedTasksHTML = '';
      if (completedTasks.length > 0) {
        completedTasksHTML = `
          <h3 style="color: #27ae60; margin-top: 15px;">Tareas completadas esta semana</h3>
          <ul style="padding-left: 20px;">
            ${completedTasks.map(task => `
              <li style="margin-bottom: 10px;">
                <strong>${task.title}</strong> - Completada el ${new Date(task.updatedAt).toLocaleString()}
              </li>
            `).join('')}
          </ul>
        `;
      }
      
      // Envía el correo
      return emailService.sendEmail({
        to: user.email,
        subject: `📅 Resumen semanal de tareas (${startDate})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #3498db; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Resumen Semanal de Tareas</h2>
            
            <p style="font-size: 16px; color: #555;">Hola ${user.name},</p>
            <p style="font-size: 16px; color: #555;">Aquí tienes tu resumen de tareas para la semana del <strong>${startDate}</strong> al <strong>${endDate}</strong>.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Tareas para esta semana</h3>
              ${weekTasksHTML}
              
              ${overdueTasksHTML}
              
              ${completedTasksHTML}
            </div>
            
            <div style="margin-top: 20px; padding: 15px; border: 1px solid #eaeaea; border-radius: 4px; background-color: #f9f9f9;">
              <h3 style="color: #333; margin-top: 0;">Resumen</h3>
              <ul style="padding-left: 20px;">
                <li>Tareas para esta semana: <strong>${weekTasks.length}</strong></li>
                <li>Tareas vencidas: <strong>${overdueTasks.length}</strong></li>
                <li>Tareas completadas: <strong>${completedTasks.length}</strong></li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver todas mis tareas</a>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #f0f0f0; padding-top: 10px;">
              Este es un correo automático. Recibirás este resumen cada lunes. Puedes administrar tus preferencias de notificación en tu perfil.
            </p>
          </div>
        `
      });
    } catch (error) {
      console.error('Error al enviar resumen semanal:', error);
      return { success: false, error: error.message };
    }
  }
};

export default emailService;