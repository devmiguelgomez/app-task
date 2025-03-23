import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaCalendarAlt, FaExclamationCircle, FaCheck, FaClock, FaTrash, FaEdit, FaSignOutAlt, FaBell, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Task components
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';

// Import API service
import { tasksAPI } from '../../services/api';

// Import notification service
import notificationService from '../../services/notificationService';

// Import CSS
import './dashboard.css';

// Import ThemeToggle component
import ThemeToggle from '../common/ThemeToggle';

const Dashboard = () => {
  const navigate = useNavigate();
  // State for tasks and modal
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Logout function
  const handleLogout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/login');
  };

  // Definir la función a nivel de componente, no solo dentro del useEffect
  const requestPermissions = async () => {
    try {
      const result = await notificationService.requestNotificationPermission();
      setNotificationsEnabled(result.granted);
      setNotificationStatus(result.status);
      setNotificationMessage(result.message);
      return result;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      setError('Error al solicitar permisos de notificación');
    }
  };

  // useEffect que llama a la función al cargar el componente
  useEffect(() => {
    requestPermissions();
  }, []);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        setLoading(true);
        const response = await tasksAPI.getTasks();
        const fetchedTasks = response.tasks || [];
        setTasks(fetchedTasks);
        setError('');
        
        // Check for upcoming tasks and send notifications
        if (notificationsEnabled) {
          notificationService.checkUpcomingTasks(fetchedTasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error.message);
        setError('Error al cargar las tareas. Por favor, intenta de nuevo.');
        
        // If unauthorized, redirect to login
        if (error.message.includes('No autorizado') || error.message.includes('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
    
    // Set up interval to check for upcoming tasks every 5 minutes
    const notificationInterval = setInterval(() => {
      if (notificationsEnabled && tasks.length > 0) {
        notificationService.checkUpcomingTasks(tasks);
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(notificationInterval);
  }, [navigate, notificationsEnabled]);

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'completed') return task.completed;
    if (currentFilter === 'pending') return !task.completed;
    if (currentFilter === 'high') return task.priority === 'high' && !task.completed;
    if (currentFilter === 'upcoming') {
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0 && !task.completed;
    }
    return true;
  });

  // Add new task
  const addTask = async (task) => {
    try {
      setLoading(true);
      const response = await tasksAPI.createTask(task);
      
      // Add the new task to the state
      const newTask = response.task;
      setTasks([...tasks, newTask]);
      setIsModalOpen(false);
      setError('');
      
      // Send notification for new task
      if (notificationsEnabled) {
        notificationService.sendBrowserNotification(newTask, 'created');
      }
    } catch (error) {
      console.error('Error creating task:', error.message);
      setError('Error al crear la tarea. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle task completion
  const toggleComplete = async (id) => {
    try {
      // Find the task to toggle
      const taskToToggle = tasks.find(task => task._id === id || task.id === id);
      if (!taskToToggle) return;
      
      // Optimistically update UI
      const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };
      setTasks(tasks.map(task => 
        (task._id === id || task.id === id) ? updatedTask : task
      ));
      
      // Update in backend
      await tasksAPI.updateTask(id, updatedTask);
      setError('');
      
      // Send notification if task was completed
      if (updatedTask.completed && notificationsEnabled) {
        notificationService.sendBrowserNotification(updatedTask, 'completed');
      }
    } catch (error) {
      console.error('Error toggling task completion:', error.message);
      setError('Error al actualizar la tarea. Por favor, intenta de nuevo.');
      
      // Revert the optimistic update if there was an error
      setTasks(tasks);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      // Optimistically update UI
      setTasks(tasks.filter(task => task._id !== id && task.id !== id));
      
      // Delete from backend
      await tasksAPI.deleteTask(id);
      setError('');
    } catch (error) {
      console.error('Error deleting task:', error.message);
      setError('Error al eliminar la tarea. Por favor, intenta de nuevo.');
      
      // Fetch tasks again to restore state if there was an error
      const response = await tasksAPI.getTasks();
      setTasks(response.tasks || []);
    }
  };

  // Edit task
  const handleEditTask = (task) => {
    setEditTask(task);
    setIsModalOpen(true);
  };

  // Update task
  const updateTask = async (updatedTask) => {
    try {
      setLoading(true);
      
      // Optimistically update UI
      setTasks(tasks.map(task => 
        (task._id === updatedTask._id || task.id === updatedTask.id) ? updatedTask : task
      ));
      
      // Update in backend
      const taskId = updatedTask._id || updatedTask.id;
      await tasksAPI.updateTask(taskId, updatedTask);
      
      setIsModalOpen(false);
      setEditTask(null);
      setError('');
    } catch (error) {
      console.error('Error updating task:', error.message);
      setError('Error al actualizar la tarea. Por favor, intenta de nuevo.');
      
      // Fetch tasks again to restore state if there was an error
      const response = await tasksAPI.getTasks();
      setTasks(response.tasks || []);
    } finally {
      setLoading(false);
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-default';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high': return (
        <motion.div whileHover={{ scale: 1.2 }} className="task-metadata-icon priority-high">
          <FaExclamationCircle />
        </motion.div>
      );
      case 'medium': return (
        <motion.div whileHover={{ scale: 1.2 }} className="task-metadata-icon priority-medium">
          <FaExclamationCircle />
        </motion.div>
      );
      case 'low': return (
        <motion.div whileHover={{ scale: 1.2 }} className="task-metadata-icon priority-low">
          <FaExclamationCircle />
        </motion.div>
      );
      default: return (
        <motion.div whileHover={{ scale: 1.2 }} className="task-metadata-icon priority-default">
          <FaExclamationCircle />
        </motion.div>
      );
    }
  };

  // Subscribe to email notifications
  const handleSubscribeToEmailNotifications = async () => {
    try {
      await notificationService.subscribeToEmailNotifications({
        taskReminders: true,
        dueDateAlerts: true,
        weeklyDigest: false // Cambiado de completionNotifications a weeklyDigest para coincidir con el modelo
      });
      toast.success('Te has suscrito a las notificaciones por email correctamente.');
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast.error('Error al suscribirse a las notificaciones por email.');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Mi Panel de Tareas</h1>
            <p className="dashboard-subtitle">Organiza tus actividades y mejora tu productividad</p>
            {error && <p className="dashboard-error">{error}</p>}
            
            {/* Mensaje de estado de notificaciones */}
            {notificationStatus === 'blocked' && (
              <div className="notification-alert">
                <p>
                  <FaBell style={{ marginRight: '8px' }} />
                  {notificationMessage}
                </p>
              </div>
            )}
          </div>
          
          <div className="dashboard-actions">
            <ThemeToggle />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="profile-button"
            >
              <FaUser /> Perfil
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="logout-button"
            >
              <FaSignOutAlt /> Salir
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubscribeToEmailNotifications}
              className="notification-button"
              title="Suscribirse a notificaciones por email"
            >
              <FaBell className="mr-2" /> Notificaciones
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditTask(null);
                setIsModalOpen(true);
              }}
              className="new-task-button"
            >
              <FaPlus className="mr-2" /> Nueva Tarea
            </motion.button>
            {/* Botón para activar notificaciones */}
            <button 
              onClick={requestPermissions} 
              className="notification-btn"
              disabled={notificationStatus === 'blocked' || notificationsEnabled}
            >
              {notificationsEnabled ? 'Notificaciones activas' : 'Activar notificaciones'}
            </button>
          </div>
        </div>

        {/* Navigation Panel with Filters */}
        <nav className="nav-panel">
          <div className="nav-header">
            <div className="nav-dots">
              <div className="nav-dot nav-dot-red"></div>
              <div className="nav-dot nav-dot-yellow"></div>
              <div className="nav-dot nav-dot-green"></div>
            </div>
            <div className="nav-title">Panel de Navegación</div>
          </div>
          <div className="nav-filters">
            <div className="filter-buttons">
              <button 
                onClick={() => setCurrentFilter('all')}
                className={`filter-button ${currentFilter === 'all' ? 'filter-button-active' : ''}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setCurrentFilter('pending')}
                className={`filter-button ${currentFilter === 'pending' ? 'filter-button-active' : ''}`}
              >
                Pendientes
              </button>
              <button 
                onClick={() => setCurrentFilter('completed')}
                className={`filter-button ${currentFilter === 'completed' ? 'filter-button-active' : ''}`}
              >
                Completadas
              </button>
              <button 
                onClick={() => setCurrentFilter('high')}
                className={`filter-button ${currentFilter === 'high' ? 'filter-button-active' : ''}`}
              >
                Alta Prioridad
              </button>
              <button 
                onClick={() => setCurrentFilter('upcoming')}
                className={`filter-button ${currentFilter === 'upcoming' ? 'filter-button-active' : ''}`}
              >
                Próximas a vencer
              </button>
            </div>
          </div>
        </nav>

        {/* Tasks Grid */}
        <div className="tasks-grid">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskItem 
                key={task.id}
                task={task}
                toggleComplete={toggleComplete}
                deleteTask={deleteTask}
                editTask={handleEditTask}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))
          ) : (
            <div className="empty-state">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 2 
                }}
                className="empty-icon"
              >
                <FaCalendarAlt />
              </motion.div>
              <h3 className="empty-title">No hay tareas disponibles</h3>
              <p className="empty-subtitle">Crea una nueva tarea para comenzar</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content"
          >
            <h2 className="modal-title">
              {editTask ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
            <TaskForm 
              onSubmit={editTask ? updateTask : addTask} 
              onCancel={() => {
                setIsModalOpen(false);
                setEditTask(null);
              }}
              initialData={editTask}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;