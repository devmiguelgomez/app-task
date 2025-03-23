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
      // Nota: El offset está en minutos y es positivo para zonas horarias detrás de UTC
      // para América/Bogotá (UTC-5), el offset es 300 minutos
      
      // NO aplicar ajuste basado en getTimezoneOffset del navegador
      // Ya que la fecha en el backend ya está en UTC, y queremos mostrarla en la zona del usuario
      
      // Calcular el ajuste neto en milisegundos
      const offsetAdjustmentMs = -timezoneOffset * 60 * 1000;
      
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
      
      // Usar la fecha ajustada pero SIN especificar timeZone en toLocaleString
      // para que muestre la fecha exacta que calculamos
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
      const serverOffset = now.getTimezoneOffset();
      const offsetDiff = serverOffset - timezoneOffset;
      
      // Ajustar la fecha de vencimiento
      const adjustedDueDate = new Date(dueDate.getTime() + offsetDiff * 60000);
      
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