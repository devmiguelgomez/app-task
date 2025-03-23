import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaExclamationCircle } from 'react-icons/fa';

// Import CSS
import './taskForm.css';

const TaskForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If initialData is provided (for editing), populate the form
  useEffect(() => {
    if (initialData) {
      let formattedDate = '';
      if (initialData.dueDate) {
        try {
          // Convertir fecha a formato requerido por input datetime-local
          const date = new Date(initialData.dueDate);
          
          // Formato YYYY-MM-DDThh:mm (sin segundos)
          formattedDate = date.toISOString().substring(0, 16);
        } catch (e) {
          console.error('Error formateando fecha:', e);
          formattedDate = '';
        }
      }
      
      setFormData({
        ...initialData,
        dueDate: formattedDate
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.dueDate) {
      setError('Por favor completa los campos requeridos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Obtener offset de zona horaria para incluirlo explícitamente
      const dateObj = new Date(formData.dueDate);
      const userTimezoneOffset = dateObj.getTimezoneOffset();
      
      const taskData = {
        ...formData,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: userTimezoneOffset
      };
      
      if (initialData && (initialData._id || initialData.id)) {
        const taskId = initialData._id || initialData.id;
        await onSubmit({ ...taskData, _id: taskId, id: taskId });
      } else {
        await onSubmit(taskData);
      }
      
      // Clear form
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium'
      });
      onCancel && onCancel();
    } catch (error) {
      setError(error.message || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Título
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="Título de la tarea"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="form-textarea"
          placeholder="Describe la tarea..."
        ></textarea>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="dueDate" className="form-label">
            <div className="form-label-icon">
              <FaCalendarAlt /> Fecha de vencimiento
            </div>
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority" className="form-label">
            <div className="form-label-icon">
              <FaExclamationCircle /> Prioridad
            </div>
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="form-select"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="btn btn-cancel"
        >
          Cancelar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="btn btn-primary"
        >
          {initialData ? 'Actualizar' : 'Crear'}
        </motion.button>
      </div>
    </form>
  );
};

export default TaskForm;