// Notification service for task management app

/**
 * Service to handle browser and email notifications for tasks
 */
const notificationService = {
  /**
   * Request permission for browser notifications
   * @returns {Promise<object>} - Status and message about notification permissions
   */
  requestNotificationPermission: async () => {
    if (!('Notification' in window)) {
      return { 
        granted: false, 
        status: 'unsupported',
        message: 'Este navegador no soporta notificaciones de escritorio' 
      };
    }
    
    try {
      // Comprobar primero si los permisos ya están definidos
      if (Notification.permission === 'denied') {
        return { 
          granted: false, 
          status: 'blocked',
          message: 'Las notificaciones han sido bloqueadas. Para habilitarlas, haz clic en el icono de ajustes junto a la URL y modifica los permisos del sitio.' 
        };
      }
      
      if (Notification.permission === 'granted') {
        return { granted: true, status: 'granted', message: 'Notificaciones ya habilitadas' };
      }
      
      const permission = await Notification.requestPermission();
      return { 
        granted: permission === 'granted', 
        status: permission,
        message: permission === 'granted' 
          ? 'Notificaciones habilitadas correctamente' 
          : 'Notificaciones deshabilitadas por el usuario'
      };
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
      return { 
        granted: false, 
        status: 'error',
        message: 'Error al solicitar permisos de notificación' 
      };
    }
  },
  
  /**
   * Check current status of notification permissions
   * @returns {Object} Status object with granted boolean
   */
  checkNotificationStatus: () => {
    if (!('Notification' in window)) {
      return { 
        granted: false, 
        status: 'unsupported',
        message: 'Este navegador no soporta notificaciones de escritorio' 
      };
    }
    
    return { 
      granted: Notification.permission === 'granted', 
      status: Notification.permission,
      message: Notification.permission === 'granted' 
        ? 'Notificaciones ya habilitadas' 
        : Notification.permission === 'denied'
          ? 'Las notificaciones han sido bloqueadas por el usuario'
          : 'Notificaciones pendientes de permiso'
    };
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
      
      // Call the API service to subscribe
      const { tasksAPI } = await import('./api');
      return await tasksAPI.subscribeToNotifications({
        email: user.email,
        preferences: {
          taskReminders: preferences.taskReminders || true,
          dueDateAlerts: preferences.dueDateAlerts || true,
          weeklyDigest: preferences.weeklyDigest || false
        }
      });
    } catch (error) {
      console.error('Error al suscribirse a notificaciones por email:', error);
      throw error;
    }
  },
  
  /**
   * Unsubscribe from email notifications
   * @returns {Promise<object>} - API response
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