// Notification service for task management app

/**
 * Service to handle browser and email notifications for tasks
 */
const notificationService = {
  /**
   * Request permission for browser notifications
   * @returns {Promise<boolean>} - Whether permission was granted
   */
  requestNotificationPermission: async () => {
    if (!('Notification' in window)) {
      console.error('Este navegador no soporta notificaciones de escritorio');
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
      return false;
    }
  },
  
  /**
   * Send a browser notification
   * @param {Object} task - The task object
   * @param {string} type - The type of notification (reminder, due, created, etc.)
   */
  sendBrowserNotification: (task, type) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }
    
    let title, body;
    
    switch (type) {
      case 'reminder':
        title = '¡Recordatorio de tarea!';
        body = `No olvides: ${task.title} - Vence pronto`;
        break;
      case 'due':
        title = '¡Tarea por vencer!';
        body = `La tarea "${task.title}" vence hoy`;
        break;
      case 'created':
        title = 'Nueva tarea creada';
        body = `Has creado la tarea: ${task.title}`;
        break;
      case 'completed':
        title = '¡Tarea completada!';
        body = `Has completado la tarea: ${task.title}`;
        break;
      default:
        title = 'Notificación de tarea';
        body = `Tarea: ${task.title}`;
    }
    
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico', // Path to your app's favicon
        badge: '/favicon.ico',
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        // You could add navigation to the specific task here
      };
      
      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
    } catch (error) {
      console.error('Error al mostrar notificación:', error);
    }
  },
  
  /**
   * Check for upcoming tasks and send notifications if needed
   * @param {Array} tasks - Array of task objects
   */
  checkUpcomingTasks: (tasks) => {
    if (!tasks || !tasks.length) return;
    
    const today = new Date();
    
    tasks.forEach(task => {
      if (task.completed) return;
      
      const dueDate = new Date(task.dueDate);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Notify for tasks due today
      if (diffDays === 0) {
        notificationService.sendBrowserNotification(task, 'due');
      }
      // Notify for tasks due in 1 day
      else if (diffDays === 1) {
        notificationService.sendBrowserNotification(task, 'reminder');
      }
    });
  },
  
  /**
   * Subscribe to email notifications for tasks
   * @param {Object} preferences - Notification preferences
   * @returns {Promise} - API response
   */
  subscribeToEmailNotifications: async (preferences) => {
    try {
      // Get user email from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.email) {
        throw new Error('No se encontró información del usuario');
      }
      
      // Add email to preferences
      const notificationPrefs = {
        ...preferences,
        email: user.email
      };
      
      // Use the API service to subscribe
      const { tasksAPI } = await import('./api');
      return tasksAPI.subscribeToNotifications(notificationPrefs);
    } catch (error) {
      console.error('Error al suscribirse a notificaciones por email:', error);
      throw error;
    }
  },
  
  /**
   * Unsubscribe from email notifications
   * @returns {Promise} - API response
   */
  unsubscribeFromEmailNotifications: async () => {
    try {
      const { tasksAPI } = await import('./api');
      return tasksAPI.unsubscribeFromNotifications();
    } catch (error) {
      console.error('Error al cancelar suscripción a notificaciones:', error);
      throw error;
    }
  }
};

export default notificationService;