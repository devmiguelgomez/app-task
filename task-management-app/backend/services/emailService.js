import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes cambiarlo según tu proveedor
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

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
  }
};

export default emailService;