import { motion } from 'framer-motion';
import { FaCalendarAlt, FaCheck, FaTrash, FaEdit, FaClock } from 'react-icons/fa';
import { formatTaskDate, getDaysRemaining } from '../../utils/dateUtils';

// Import CSS
import './taskItem.css';

const TaskItem = ({ task, toggleComplete, deleteTask, editTask, getPriorityColor, getPriorityIcon }) => {
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
            {!task.completed && (
              <button 
                onClick={() => toggleComplete(task._id)}
                className="task-action-button complete"
                title="Marcar como completada"
              >
                <FaCheck />
              </button>
            )}
            
            <button 
              onClick={() => editTask(task)}
              className="task-action-button edit"
              title="Editar tarea"
            >
              <FaEdit />
            </button>
            
            <button 
              onClick={() => deleteTask(task._id)}
              className="task-action-button delete"
              title="Eliminar tarea"
            >
              <FaTrash />
            </button>
          </div>
        </div>
        
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        
        <div className="task-metadata">
          <div className="task-metadata-item">
            <FaCalendarAlt className="task-metadata-icon" />
            <span className="task-metadata-text">
              {formatTaskDate(task.dueDate, task.timezoneOffset)}
            </span>
          </div>
          
          {!task.completed && (
            <div className="task-metadata-item">
              <FaClock className="task-metadata-icon deadline" />
              <span className="task-metadata-text deadline">
                {getDaysRemaining(task.dueDate, task.timezoneOffset)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;