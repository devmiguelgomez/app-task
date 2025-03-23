import { motion } from 'framer-motion';
import { FaCalendarAlt, FaCheck, FaTrash, FaEdit, FaClock } from 'react-icons/fa';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

// Import CSS
import './taskItem.css';

const TaskItem = ({ task, toggleComplete, deleteTask, editTask, getPriorityColor, getPriorityIcon }) => {
  // Format date to a more readable format
  const formatDate = (dateString) => {
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      };
      
      // Usar formatInTimeZone para formatear la fecha en la zona horaria del usuario
      return formatInTimeZone(
        new Date(dateString), 
        userTimeZone, 
        'dd MMM yyyy, HH:mm', 
        { locale: es }
      );
    } catch (error) {
      // Fallback por si hay algún error
      return new Date(dateString).toLocaleString('es-ES');
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate) => {
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const today = new Date();
      const taskDueDate = new Date(dueDate);
      
      // Ajustar las fechas a la zona horaria del usuario
      const todayInUserTZ = new Date(formatInTimeZone(today, userTimeZone, 'yyyy-MM-dd HH:mm:ss'));
      const dueDateInUserTZ = new Date(formatInTimeZone(taskDueDate, userTimeZone, 'yyyy-MM-dd HH:mm:ss'));
      
      const diffTime = dueDateInUserTZ - todayInUserTZ;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Vencida';
      if (isToday(dueDateInUserTZ)) return 'Hoy';
      if (isTomorrow(dueDateInUserTZ)) return 'Mañana';
      return `${diffDays} días`;
    } catch (error) {
      // Fallback
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