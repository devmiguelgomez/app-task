import { motion } from 'framer-motion';
import { FaCalendarAlt, FaCheck, FaTrash, FaEdit, FaClock } from 'react-icons/fa';

// Import CSS
import './taskItem.css';

const TaskItem = ({ task, toggleComplete, deleteTask, editTask, getPriorityColor, getPriorityIcon }) => {
  // Función simplificada usando JavaScript nativo
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha no disponible';
    }
  };

  // Simplificar y corregir también getDaysRemaining
  const getDaysRemaining = (dueDate) => {
    try {
      const now = new Date();
      const taskDueDate = new Date(dueDate);
      
      // Normalizar fechas (quitar la parte de hora para comparar solo días)
      const todayNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueDateNormalized = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
      
      // Para determinar "Hoy" o "Mañana", comparamos las fechas normalizadas
      const isTaskToday = dueDateNormalized.getTime() === todayNormalized.getTime();
      
      const tomorrowNormalized = new Date(todayNormalized);
      tomorrowNormalized.setDate(tomorrowNormalized.getDate() + 1);
      const isTaskTomorrow = dueDateNormalized.getTime() === tomorrowNormalized.getTime();
      
      // Para "vencida", comparamos las fechas originales
      const isOverdue = taskDueDate < now;
      
      // Calcular diferencia en días
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`task-item ${task.completed ? 'completed' : ''}`}
    >
      <div className={`task-priority-indicator ${getPriorityColor(task.priority)}`}></div>
      
      <div className="task-content">
        <div className="task-header">
          <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
            {task.title}
          </h3>
          <div className="task-actions">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleComplete(task._id || task.id)}
              className={`task-action-button complete ${task.completed ? 'is-completed' : ''}`}
              title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
            >
              <FaCheck />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => editTask(task)}
              className="task-action-button edit"
              title="Editar tarea"
            >
              <FaEdit />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => deleteTask(task._id || task.id)}
              className="task-action-button delete"
              title="Eliminar tarea"
            >
              <FaTrash />
            </motion.button>
          </div>
        </div>
        
        <p className={`task-description ${task.completed ? 'completed' : ''}`}>
          {task.description}
        </p>
        
        <div className="task-metadata">
          <div className="task-metadata-item priority">
            {getPriorityIcon(task.priority)}
            <span className={`task-metadata-text ${task.completed ? 'completed' : ''}`}>
              Prioridad {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
          </div>
          
          <div className="task-metadata-item date">
            <FaCalendarAlt className={`task-metadata-icon date ${task.completed ? 'completed' : ''}`} />
            <span className={`task-metadata-text ${task.completed ? 'completed' : ''}`}>
              {formatDate(task.dueDate)}
            </span>
          </div>
          
          {!task.completed && (
            <div className="task-metadata-item deadline">
              <FaClock className="task-metadata-icon deadline" />
              <span className="task-metadata-text deadline">
                {getDaysRemaining(task.dueDate)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;