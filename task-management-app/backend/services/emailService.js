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
   * @returns {Promise} - Resultado del envío
   */
  sendTaskReminder: async (task, user) => {
    const subject = `Recordatorio: "${task.title}" - Próxima a vencer`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #3b82f6;">Recordatorio de Tarea</h2>
        </div>
        
        <p>Hola <strong>${user.name}</strong>,</p>
        
        <p>Te recordamos que tienes una tarea próxima a vencer:</p>
        
        <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">${task.title}</h3>
          <p style="margin-bottom: 10px;">${task.description || 'Sin descripción'}</p>
          <p><strong>Fecha límite:</strong> ${new Date(task.dueDate).toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Prioridad:</strong> ${
            task.priority === 'high' ? '🔴 Alta' : 
            task.priority === 'medium' ? '🟠 Media' : '🟢 Baja'
          }</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Ver mis tareas
          </a>
        </div>
        
        <p style="margin-top: 30px; font-size: 0.9em; color: #6b7280; text-align: center;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `;
    
    return emailService.sendEmail({
      to: user.email,
      subject,
      html
    });
  }
};

export default emailService;