import cron from 'node-cron';
import mongoose from 'mongoose';
import emailService from './emailService.js';

// Importar modelos
import Task from '../models/Task.js';
import User from '../models/User.js';
import NotificationSubscription from '../models/NotificationSubscription.js';

const schedulerService = {
  /**
   * Inicia los trabajos programados
   */
  init: () => {
    console.log('Iniciando servicios de programación de tareas...');
    
    // Verificar tareas pendientes cada día a las 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Ejecutando trabajo programado: verificación de tareas pendientes');
      await schedulerService.sendDailyReminders();
    });
    
    // Verificar tareas que vencen hoy cada día a las 8:00 AM
    cron.schedule('0 8 * * *', async () => {
      console.log('Ejecutando trabajo programado: verificación de tareas que vencen hoy');
      await schedulerService.sendDueTodayReminders();
    });
    
    // Enviar notificación de tareas vencidas cada día a las 10:00 AM
    cron.schedule('0 10 * * *', async () => {
      console.log('Ejecutando trabajo programado: notificación de tareas vencidas');
      await schedulerService.sendOverdueTasksReminders();
    });
    
    // Enviar resumen semanal cada lunes a las 7:00 AM
    cron.schedule('0 7 * * 1', async () => {
      console.log('Ejecutando trabajo programado: resumen semanal (lunes)');
      await schedulerService.sendWeeklyDigest();
    });
    
    console.log('Servicios de programación iniciados correctamente');
  },
  
  /**
   * Envía recordatorios para tareas pendientes que están próximas a vencer
   */
  sendDailyReminders: async () => {
    try {
      // Buscar todas las suscripciones activas que tengan habilitados los recordatorios
      const subscriptions = await NotificationSubscription.find({
        active: true,
        'preferences.taskReminders': true
      });
      
      console.log(`Encontradas ${subscriptions.length} suscripciones activas para recordatorios`);
      
      for (const subscription of subscriptions) {
        const user = await User.findById(subscription.user);
        if (!user) {
          console.log(`Usuario no encontrado para la suscripción: ${subscription._id}`);
          continue;
        }
        
        // Buscar tareas pendientes que venzan en los próximos 2 días
        const today = new Date();
        const twoDaysLater = new Date(today);
        twoDaysLater.setDate(today.getDate() + 2);
        
        const tasks = await Task.find({
          user: user._id,
          completed: false,
          dueDate: {
            $gte: today,
            $lte: twoDaysLater
          }
        });
        
        console.log(`Usuario ${user.name} (${user.email}): ${tasks.length} tareas próximas a vencer`);
        
        // Enviar recordatorio por cada tarea con ajuste de zona horaria
        for (const task of tasks) {
          // Ajustar la fecha según la zona horaria del usuario para el mensaje
          const dueDate = new Date(task.dueDate);
          const userOffsetMs = (task.timezoneOffset || 0) * 60 * 1000;
          const serverOffsetMs = dueDate.getTimezoneOffset() * 60 * 1000;
          const offsetDiff = serverOffsetMs - userOffsetMs;
          const userAdjustedDate = new Date(dueDate.getTime() + offsetDiff);
          
          console.log(`Enviando recordatorio para tarea: ${task.title} que vence el ${userAdjustedDate.toLocaleString()} (hora local del usuario)`);
          const result = await emailService.sendTaskReminder(task, user);
          console.log(`Resultado del envío: ${result.success ? 'Éxito' : 'Error'}`);
        }
      }
    } catch (error) {
      console.error('Error al enviar recordatorios diarios:', error);
    }
  },
  
  /**
   * Envía recordatorios para tareas que vencen hoy
   */
  sendDueTodayReminders: async () => {
    try {
      // Buscar todas las suscripciones activas que tengan habilitadas las alertas de vencimiento
      const subscriptions = await NotificationSubscription.find({
        active: true,
        'preferences.dueDateAlerts': true
      });
      
      for (const subscription of subscriptions) {
        const user = await User.findById(subscription.user);
        if (!user) continue;
        
        // Buscar tareas que venzan hoy
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        
        const tasks = await Task.find({
          user: user._id,
          completed: false,
          dueDate: {
            $gte: today,
            $lt: tomorrow
          }
        });
        
        if (tasks.length > 0) {
          // Enviar recordatorio para tareas que vencen hoy
          for (const task of tasks) {
            await emailService.sendTaskReminder(task, user);
          }
        }
      }
    } catch (error) {
      console.error('Error al enviar recordatorios de vencimiento:', error);
    }
  },

  /**
   * Envía notificaciones para tareas vencidas que no han sido completadas
   */
  sendOverdueTasksReminders: async () => {
    try {
      // Buscar suscripciones activas con preferencia de alertas de vencimiento
      const subscriptions = await NotificationSubscription.find({
        active: true,
        'preferences.dueDateAlerts': true
      });
      
      console.log(`Buscando tareas vencidas para ${subscriptions.length} usuarios suscritos`);
      
      for (const subscription of subscriptions) {
        const user = await User.findById(subscription.user);
        if (!user) continue;
        
        // Buscar todas las tareas vencidas y no completadas
        const now = new Date();
        const overdueTasks = await Task.find({
          user: user._id,
          completed: false,
          dueDate: { $lt: now }
        }).sort({ dueDate: 1 }); // Ordenar por fecha de vencimiento (las más antiguas primero)
        
        if (overdueTasks.length > 0) {
          console.log(`Usuario ${user.name}: ${overdueTasks.length} tareas vencidas`);
          
          // Agrupar tareas por tiempo de vencimiento
          const recentlyOverdue = []; // Vencidas en las últimas 24 horas
          const moderatelyOverdue = []; // Vencidas entre 1 y 3 días
          const severelyOverdue = []; // Vencidas hace más de 3 días
          
          overdueTasks.forEach(task => {
            const taskDate = new Date(task.dueDate);
            const diffHours = (now - taskDate) / (1000 * 60 * 60);
            
            if (diffHours <= 24) {
              recentlyOverdue.push(task);
            } else if (diffHours <= 72) {
              moderatelyOverdue.push(task);
            } else {
              severelyOverdue.push(task);
            }
          });
          
          // Enviar correo con todas las tareas vencidas
          if (overdueTasks.length > 0) {
            const emailServiceModule = await import('../services/emailService.js');
            const emailService = emailServiceModule.default;
            
            await emailService.sendOverdueTasksReport(overdueTasks, user, {
              recentlyOverdue,
              moderatelyOverdue,
              severelyOverdue
            });
          }
        }
      }
    } catch (error) {
      console.error('Error al enviar recordatorios de tareas vencidas:', error);
    }
  },

  /**
   * Envía un resumen semanal de tareas los lunes
   */
  sendWeeklyDigest: async () => {
    try {
      // Buscar suscripciones activas con resumen semanal habilitado
      const subscriptions = await NotificationSubscription.find({
        active: true,
        'preferences.weeklyDigest': true
      });
      
      console.log(`Enviando resumen semanal a ${subscriptions.length} usuarios suscritos`);
      
      for (const subscription of subscriptions) {
        const user = await User.findById(subscription.user);
        if (!user) continue;
        
        // Obtener fecha actual y calcular inicio/fin de semana
        const now = new Date();
        const startOfWeek = new Date(now);
        const endOfWeek = new Date(now);
        
        // Establecer inicio de semana (lunes)
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Establecer fin de semana (domingo)
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        console.log(`Periodo de resumen: ${startOfWeek.toISOString()} hasta ${endOfWeek.toISOString()}`);
        
        // Buscar tareas para esta semana
        const weekTasks = await Task.find({
          user: user._id,
          dueDate: {
            $gte: startOfWeek,
            $lte: endOfWeek
          }
        }).sort({ dueDate: 1 });
        
        // Buscar tareas vencidas no completadas
        const overdueTasks = await Task.find({
          user: user._id,
          completed: false,
          dueDate: { $lt: startOfWeek }
        }).sort({ dueDate: 1 });
        
        // Buscar tareas completadas esta semana
        const completedTasks = await Task.find({
          user: user._id,
          completed: true,
          updatedAt: {
            $gte: startOfWeek,
            $lte: now
          }
        });
        
        if (weekTasks.length > 0 || overdueTasks.length > 0) {
          console.log(`Usuario ${user.name}: Enviando resumen con ${weekTasks.length} tareas para esta semana y ${overdueTasks.length} vencidas`);
          
          const emailServiceModule = await import('../services/emailService.js');
          const emailService = emailServiceModule.default;
          
          await emailService.sendWeeklyDigest(user, {
            weekTasks,
            overdueTasks,
            completedTasks,
            startOfWeek,
            endOfWeek
          });
        }
      }
    } catch (error) {
      console.error('Error al enviar resumen semanal:', error);
    }
  }
};

export default schedulerService;