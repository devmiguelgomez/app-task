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
      
      console.log(`Encontradas ${subscriptions.length} suscripciones activas`);
      
      for (const subscription of subscriptions) {
        const user = await User.findById(subscription.user);
        if (!user) continue;
        
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
        
        console.log(`Usuario ${user.name}: ${tasks.length} tareas próximas a vencer`);
        
        // Enviar recordatorio por cada tarea
        for (const task of tasks) {
          await emailService.sendTaskReminder(task, user);
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
  }
};

export default schedulerService;