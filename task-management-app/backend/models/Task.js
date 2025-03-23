import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título de la tarea es requerido'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'La fecha de vencimiento es requerida']
  },
  userTimeZone: {
    type: String,
    default: 'UTC'
  },
  timezoneOffset: {
    type: Number,
    default: 0 // Offset en minutos
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster queries
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;