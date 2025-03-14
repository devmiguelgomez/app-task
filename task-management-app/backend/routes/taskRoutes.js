import express from 'express';
import { body, validationResult } from 'express-validator';

import Task from '../models/Task.js';
import { protect } from '../middleware/auth.js';

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
    const { title, description, dueDate, priority } = req.body;

    // Create new task
    const task = new Task({
      title,
      description,
      dueDate,
      priority: priority || 'medium',
      user: req.user.id
    });

    // Save task to database
    const savedTask = await task.save();

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

export default router;