import express from 'express';
import { body, validationResult } from 'express-validator';

import Task from '../models/Task.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js'; // Añade esta importación

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for a user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  protect,
  body('title', 'El título es requerido').not().isEmpty(),
  body('dueDate', 'La fecha de vencimiento es requerida').not().isEmpty()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, dueDate: taskDueDate, priority } = req.body;

    // Log para depuración de zona horaria
    console.log('Fecha enviada desde frontend:', taskDueDate);
    console.log('Fecha interpretada por backend:', new Date(taskDueDate));

    // Capturar la zona horaria del usuario
    const userTimeZone = req.body.timeZone || 'UTC';
    console.log('Zona horaria del usuario:', userTimeZone);

    // Create new task
    const task = new Task({
      title,
      description,
      dueDate: taskDueDate,
      userTimeZone: userTimeZone,
      priority: priority || 'medium',
      user: req.user.id
    });

    // Save task to database
    const savedTask = await task.save();

    // Sistema mejorado de notificaciones
    try {
      const taskDueDateObj = new Date(savedTask.dueDate);
      const now = new Date();
      const timeDiff = taskDueDateObj.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      const daysDiff = hoursDiff / 24;
      
      // LOGS DE DEPURACIÓN
      console.log('===== DIAGNÓSTICO DE NOTIFICACIONES =====');
      console.log('Verificando notificaciones para nueva tarea:', savedTask.title);
      console.log('ID de usuario:', req.user.id);
      console.log('Fecha actual:', now);
      console.log('Fecha vencimiento:', taskDueDateObj);
      console.log('Diferencia en horas:', hoursDiff.toFixed(2));
      console.log('Diferencia en días:', daysDiff.toFixed(2));
      
      // Buscar si el usuario tiene suscripción activa
      const NotificationSubscription = (await import('../models/NotificationSubscription.js')).default;
      const subscription = await NotificationSubscription.findOne({
        user: req.user.id,
        active: true,
        'preferences.taskReminders': true
      });
      
      console.log('Suscripción encontrada:', subscription ? 'Sí' : 'No');
      if (!subscription) {
        console.log('Razón sin suscripción: Usuario no ha activado notificaciones o preferencias');
        // Imprime detalles de cualquier suscripción existente para este usuario
        const anySubscription = await NotificationSubscription.findOne({user: req.user.id});
        console.log('¿Existe alguna suscripción?', anySubscription ? 'Sí' : 'No');
        if (anySubscription) {
          console.log('Estado de la suscripción:', {
            active: anySubscription.active, 
            taskReminders: anySubscription.preferences?.taskReminders
          });
        }
      }
      
      if (subscription) {
        const user = await User.findById(req.user.id);
        const emailServiceModule = await import('../services/emailService.js');
        const emailService = emailServiceModule.default;
        
        // Notificación para tareas que vencen en menos de 24 horas (en el futuro)
        if (hoursDiff <= 24 && hoursDiff > 0) {
          const result = await emailService.sendTaskReminder(
            savedTask, 
            user, 
            '¡Atención! Tarea por vencer en menos de 24 horas',
            `Tu tarea "${savedTask.title}" vence muy pronto (menos de 24 horas). Asegúrate de completarla a tiempo.`
          );
          console.log(`Correo enviado - Recordatorio URGENTE: ${savedTask.title}`);
          console.log('Resultado del envío:', result);
        } 
        // Notificación para tareas que vencen entre 1 y 7 días (en el futuro)
        else if (daysDiff <= 7 && hoursDiff > 24) {
          const result = await emailService.sendTaskReminder(
            savedTask, 
            user,
            `Recordatorio: Tarea por vencer en ${Math.floor(daysDiff)} días`,
            `Tu tarea "${savedTask.title}" vence en ${Math.floor(daysDiff)} días. Te recomendamos planificar su realización.`
          );
          console.log(`Correo enviado - Recordatorio semanal: ${savedTask.title}`);
          console.log('Resultado del envío:', result);
        }
        // Tareas recién vencidas (menos de 24 horas)
        else if (hoursDiff >= -24 && hoursDiff <= 0) {
          const result = await emailService.sendTaskReminder(
            savedTask, 
            user,
            `¡ALERTA! Tarea vencida`,
            `Tu tarea "${savedTask.title}" ha vencido hace ${Math.abs(hoursDiff.toFixed(1))} horas. Por favor, complétala lo antes posible.`
          );
          console.log(`Correo enviado - Alerta de vencimiento: ${savedTask.title}`);
          console.log('Resultado del envío:', result);
        }
      }
      console.log('===== FIN DIAGNÓSTICO =====');
    } catch (error) {
      console.error('Error al intentar enviar notificación:', error);
    }

    res.status(201).json({
      success: true,
      task: savedTask
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tarea no encontrada'
      });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Tarea no encontrada'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tarea no encontrada'
      });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    // Update task
    const { title, description, dueDate, priority, completed } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (completed !== undefined) task.completed = completed;

    // Save updated task
    const updatedTask = await task.save();

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Tarea no encontrada'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tarea no encontrada'
      });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    // Remove task
    await task.deleteOne();

    res.json({
      success: true,
      message: 'Tarea eliminada'
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Tarea no encontrada'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   GET /api/tasks/filter/:status
// @desc    Get tasks by status (completed, pending)
// @access  Private
router.get('/filter/:status', protect, async (req, res) => {
  try {
    const { status } = req.params;
    let query = { user: req.user.id };

    if (status === 'completed') {
      query.completed = true;
    } else if (status === 'pending') {
      query.completed = false;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   GET /api/tasks/priority/:level
// @desc    Get tasks by priority level
// @access  Private
router.get('/priority/:level', protect, async (req, res) => {
  try {
    const { level } = req.params;
    
    if (!['low', 'medium', 'high'].includes(level)) {
      return res.status(400).json({
        success: false,
        error: 'Nivel de prioridad inválido'
      });
    }

    const tasks = await Task.find({
      user: req.user.id,
      priority: level
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   POST /api/tasks/notifications/subscribe
// @desc    Subscribe to task notifications
// @access  Private
router.post('/notifications/subscribe', protect, async (req, res) => {
  try {
    const { email, preferences } = req.body;
    
    // Check if user already has a subscription
    let subscription = await import('../models/NotificationSubscription.js')
      .then(module => module.default)
      .then(NotificationSubscription => 
        NotificationSubscription.findOne({ user: req.user.id })
      );
    
    if (subscription) {
      // Update existing subscription
      subscription.email = email;
      subscription.preferences = preferences;
      subscription.active = true;
      
      await subscription.save();
      
      return res.json({
        success: true,
        message: 'Suscripción a notificaciones actualizada',
        subscription
      });
    }
    
    // Create new subscription
    const NotificationSubscription = (await import('../models/NotificationSubscription.js')).default;
    subscription = new NotificationSubscription({
      user: req.user.id,
      email,
      preferences,
      active: true
    });
    
    await subscription.save();
    
    res.status(201).json({
      success: true,
      message: 'Suscripción a notificaciones creada',
      subscription
    });
  } catch (error) {
    console.error('Error subscribing to notifications:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al suscribirse a notificaciones'
    });
  }
});

// @route   POST /api/tasks/notifications/unsubscribe
// @desc    Unsubscribe from task notifications
// @access  Private
router.post('/notifications/unsubscribe', protect, async (req, res) => {
  try {
    // Find user's subscription
    let subscription = await import('../models/NotificationSubscription.js')
      .then(module => module.default)
      .then(NotificationSubscription => 
        NotificationSubscription.findOne({ user: req.user.id })
      );
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró suscripción activa'
      });
    }
    
    // Set subscription to inactive
    subscription.active = false;
    await subscription.save();
    
    res.json({
      success: true,
      message: 'Suscripción a notificaciones cancelada'
    });
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al cancelar suscripción a notificaciones'
    });
  }
});

// @route   POST /api/tasks/notifications/unsubscribe
// @desc    Unsubscribe from email notifications
// @access  Private
router.post('/notifications/unsubscribe', protect, async (req, res) => {
  try {
    const NotificationSubscription = (await import('../models/NotificationSubscription.js')).default;
    
    const result = await NotificationSubscription.updateOne(
      { user: req.user.id, active: true },
      { $set: { active: false } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron suscripciones activas'
      });
    }
    
    res.json({
      success: true,
      message: 'Suscripción cancelada correctamente'
    });
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cancelar suscripción'
    });
  }
});

// @route   GET /api/tasks/notifications/preferences
// @desc    Get user's notification preferences
// @access  Private
router.get('/notifications/preferences', protect, async (req, res) => {
  try {
    const NotificationSubscription = (await import('../models/NotificationSubscription.js')).default;
    
    const subscription = await NotificationSubscription.findOne({
      user: req.user.id,
      active: true
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron preferencias de notificación'
      });
    }
    
    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener preferencias de notificación'
    });
  }
});

// Agregar una ruta de prueba para enviar un correo

// @route   POST /api/tasks/send-test-email
// @desc    Send a test email to the user
// @access  Private
router.post('/send-test-email', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Crear una tarea de prueba
    const testTask = {
      _id: 'test123',
      title: 'Tarea de prueba',
      description: 'Esta es una tarea de prueba para verificar el envío de correos',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      priority: 'high',
      status: 'pending'
    };
    
    // Usar importación dinámica en lugar de require
    const emailServiceModule = await import('../services/emailService.js');
    const emailService = emailServiceModule.default;
    
    const result = await emailService.sendTaskReminder(testTask, user);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Correo de prueba enviado a ${user.email}`,
        details: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al enviar correo de prueba',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al enviar correo de prueba',
      error: error.message
    });
  }
});

export default router;