import { motion } from 'framer-motion';
import { FaCalendarAlt, FaCheck, FaTrash, FaEdit, FaClock } from 'react-icons/fa';

// Import CSS
import './taskItem.css';

const TaskItem = ({ task, toggleComplete, deleteTask, editTask, getPriorityColor, getPriorityIcon }) => {
  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const taskDueDate = new Date(dueDate);
    const diffTime = taskDueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Vencida';
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    return `${diffDays} días`;
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