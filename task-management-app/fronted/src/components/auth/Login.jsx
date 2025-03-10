import { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Import API service
import { authAPI } from '../../services/api';

// Import CSS
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authAPI.login(formData);
      
      // Store the token in localStorage
      localStorage.setItem('token', response.token);
      
      // Store user info if available
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      console.log('Login successful:', response);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error.message);
      setError(error.message || 'Error al iniciar sesión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Social login functionality has been removed

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="auth-card"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
          className="auth-icon-container"
        >
          <FaSignInAlt className="auth-icon" />
        </motion.div>

        <h1 className="auth-title">Iniciar Sesión</h1>
        <p className="auth-subtitle">
          Accede a tu panel de tareas personal
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <FaUser className="form-icon" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <FaLock className="form-icon" />
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Contraseña"
              className="form-input"
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && <p className="form-error">{error}</p>}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </motion.button>
        </form>



        <p className="auth-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="auth-link">
            Regístrate
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
