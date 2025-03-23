// Crear este archivo de utilidades para fechas si no existe

/**
 * Formatea una fecha considerando la zona horaria de la tarea
 * @param {string} dateString - Fecha ISO de la tarea
 * @param {number} timezoneOffset - Offset de zona horaria en minutos
 * @returns {string} - Fecha formateada según la zona horaria
 */
export const formatTaskDate = (dateString, timezoneOffset) => {
  try {
    if (!dateString) return 'Fecha no disponible';
    
    // Crear fecha a partir del string
    const date = new Date(dateString);
    
    // Si tenemos offset de zona horaria, lo aplicamos
    if (timezoneOffset !== undefined) {
      // Error crítico: Estábamos usando signo incorrecto en el ajuste
      // Para América/Bogotá (UTC-5), el offset es 300 (positivo)
      // Pero necesitamos añadir horas (no restar) para convertir de UTC a local
      
      // Realizar un ajuste directo: 
      // - Para una zona UTC-5, necesitamos AÑADIR 5 horas a la fecha UTC
      // - El offset es positivo (300 minutos para UTC-5)
      // - Por lo tanto multiplicamos el offset por 60000 (sin signo negativo)
      const offsetAdjustmentMs = timezoneOffset * 60 * 1000;
      
      // Aplicar el ajuste a la fecha
      const adjustedDate = new Date(date.getTime() + offsetAdjustmentMs);
      
      // Formatear fecha según tamaño de pantalla
      const isMobile = window.innerWidth < 768;
      const options = {
        year: 'numeric',
        month: isMobile ? 'numeric' : 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      
      // Usar la fecha ajustada sin especificar timeZone
      return adjustedDate.toLocaleString('es-ES', options);
    }
    
    // Si no hay offset disponible, usar hora local del navegador
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
};

/**
 * Calcula cuántos días faltan para el vencimiento
 * @param {string} dateString - Fecha ISO de la tarea
 * @param {number} timezoneOffset - Offset de zona horaria en minutos
 * @returns {string} - Texto con días restantes o estado
 */
export const getDaysRemaining = (dateString, timezoneOffset) => {
  try {
    if (!dateString) return 'Sin fecha';
    
    const now = new Date();
    const dueDate = new Date(dateString);
    
    // Ajustar por zona horaria si está disponible
    if (timezoneOffset !== undefined) {
      // Corregir el ajuste: añadir el offset (no restarlo)
      const offsetAdjustmentMs = timezoneOffset * 60 * 1000;
      
      // Ajustar la fecha de vencimiento
      const adjustedDueDate = new Date(dueDate.getTime() + offsetAdjustmentMs);
      
      // Para comparar días, quitar la hora
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      
      const dueDateStart = new Date(adjustedDueDate);
      dueDateStart.setHours(0, 0, 0, 0);
      
      // Comprobar si ha vencido comparando con la hora actual
      if (adjustedDueDate < now) {
        return 'Vencida';
      }
      
      // Comprobar si es hoy o mañana
      if (dueDateStart.getTime() === todayStart.getTime()) {
        return 'Hoy';
      }
      
      if (dueDateStart.getTime() === tomorrowStart.getTime()) {
        return 'Mañana';
      }
      
      // Calcular días de diferencia
      const diffTime = dueDateStart - todayStart;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return `${diffDays} días`;
    }
    
    // Sin offset, cálculo básico
    if (dueDate < now) {
      return 'Vencida';
    }
    
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    
    const dueDateStart = new Date(dueDate);
    dueDateStart.setHours(0, 0, 0, 0);
    
    if (dueDateStart.getTime() === todayStart.getTime()) {
      return 'Hoy';
    }
    
    if (dueDateStart.getTime() === tomorrowStart.getTime()) {
      return 'Mañana';
    }
    
    const diffTime = dueDateStart - todayStart;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} días`;
  } catch (error) {
    console.error('Error calculando días restantes:', error);
    return 'Desconocido';
  }
};