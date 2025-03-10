import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaUserPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Import API service
import { authAPI } from '../../services/api';

// Import CSS
import './register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    
    try {
      // Remove confirmPassword before sending to API
      const userData = {
        name,
        email,
        password
      };
      
      const response = await authAPI.register(userData);
      
      console.log('Registration successful:', response);
      
      // Store the token if returned from registration
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Store user info if available
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Redirect to dashboard or login
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error.message);
      setError(error.message || 'Error al registrarse. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="auth-icon-container"
        >
          <FaUserPlus className="auth-icon" />
        </motion.div>
        
        <h1 className="auth-title">Crear Cuenta</h1>
        <p className="auth-subtitle">Regístrate para gestionar tus tareas</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <FaUser className="form-icon" />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={handleChange}
              className="form-input"
              placeholder="Nombre completo"
            />
          </div>
          
          <div className="form-group">
            <FaEnvelope className="form-icon" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleChange}
              className="form-input"
              placeholder="Correo electrónico"
            />
          </div>
          
          <div className="form-group">
            <FaLock className="form-icon" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={handleChange}
              className="form-input"
              placeholder="Contraseña"
            />
          </div>
          
          <div className="form-group">
            <FaLock className="form-icon" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Confirmar contraseña"
            />
          </div>

          {error && <p className="form-error">{error}</p>}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Registrarse'}
          </motion.button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="auth-link">
            Iniciar Sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;