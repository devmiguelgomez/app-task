// Crear este archivo de utilidades para fechas si no existe

/**
 * Formatea una fecha teniendo en cuenta la zona horaria de la tarea
 * @param {string} dateString - Fecha en formato ISO
 * @param {number} timezoneOffset - Offset de zona horaria en minutos
 * @returns {string} - Fecha formateada
 */
// Ajustar el formato de fecha para pantallas pequeñas
export const formatTaskDate = (dateString, timezoneOffset) => {
  try {
    const utcDate = new Date(dateString);
    
    // Detectar si es un dispositivo móvil con pantalla pequeña
    const isMobileDevice = window.innerWidth < 640;
    
    // Opciones de formato diferentes para móvil y escritorio
    const options = {
      year: 'numeric',
      month: isMobileDevice ? 'numeric' : 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    // Si hay offset de zona horaria, aplicarlo
    if (timezoneOffset !== undefined) {
      const serverOffset = new Date().getTimezoneOffset();
      const userOffset = timezoneOffset;
      const offsetDiff = serverOffset - userOffset;
      
      const adjustedDate = new Date(utcDate.getTime() + offsetDiff * 60000);
      return adjustedDate.toLocaleString('es-ES', options);
    }
    
    // Sin offset, usar zona horaria local
    return utcDate.toLocaleString('es-ES', options);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
};

/**
 * Calcula cuántos días faltan para el vencimiento de la tarea
 * @param {string} dueDate - Fecha de vencimiento
 * @param {number} timezoneOffset - Offset de zona horaria en minutos
 * @returns {string} - Texto descriptivo ("Hoy", "Mañana", "3 días", etc.)
 */
export const getDaysRemaining = (dueDate, timezoneOffset) => {
  try {
    const now = new Date();
    const taskDueDate = new Date(dueDate);
    
    // Aplicar ajuste de zona horaria si está disponible
    if (timezoneOffset !== undefined) {
      const serverOffset = now.getTimezoneOffset();
      const userOffset = timezoneOffset;
      const offsetDiff = serverOffset - userOffset;
      
      // Ajustar la fecha de vencimiento
      const adjustedDueDate = new Date(taskDueDate.getTime() + offsetDiff * 60000);
      
      // Normalizar fechas (quitar la parte de hora)
      const todayNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueDateNormalized = new Date(
        adjustedDueDate.getFullYear(), 
        adjustedDueDate.getMonth(), 
        adjustedDueDate.getDate()
      );
      
      // Comparaciones
      const isTaskToday = dueDateNormalized.getTime() === todayNormalized.getTime();
      
      const tomorrowNormalized = new Date(todayNormalized);
      tomorrowNormalized.setDate(tomorrowNormalized.getDate() + 1);
      const isTaskTomorrow = dueDateNormalized.getTime() === tomorrowNormalized.getTime();
      
      // Para "vencida", comparar las fechas completas (con hora)
      const isOverdue = adjustedDueDate < now;
      
      // Calcular diferencia en días
      const diffTime = dueDateNormalized - todayNormalized;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (isOverdue) return 'Vencida';
      if (isTaskToday) return 'Hoy';
      if (isTaskTomorrow) return 'Mañana';
      return `${diffDays} días`;
    }
    
    // Sin offset, usar lógica estándar
    const todayNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDateNormalized = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
    
    const isTaskToday = dueDateNormalized.getTime() === todayNormalized.getTime();
    
    const tomorrowNormalized = new Date(todayNormalized);
    tomorrowNormalized.setDate(tomorrowNormalized.getDate() + 1);
    const isTaskTomorrow = dueDateNormalized.getTime() === tomorrowNormalized.getTime();
    
    const isOverdue = taskDueDate < now;
    
    const diffTime = dueDateNormalized - todayNormalized;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (isOverdue) return 'Vencida';
    if (isTaskToday) return 'Hoy';
    if (isTaskTomorrow) return 'Mañana';
    return `${diffDays} días`;
  } catch (error) {
    console.error('Error calculando días restantes:', error);
    return "Fecha no disponible";
  }
};