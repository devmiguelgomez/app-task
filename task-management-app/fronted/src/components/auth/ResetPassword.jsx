import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Import API service
import { authAPI } from '../../services/api';

// Import CSS
import './resetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const { password, confirmPassword } = formData;

  useEffect(() => {
    // Verificar si el token es válido (opcional)
    const verifyToken = async () => {
      try {
        // Si tienes un endpoint para verificar tokens, úsalo aquí
        // await authAPI.verifyResetToken(token);
      } catch (error) {
        setTokenValid(false);
        setError('El enlace de restablecimiento no es válido o ha expirado.');
      }
    };
    
    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
      setError('No se proporcionó un token de restablecimiento válido.');
    }
  }, [token]);

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
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authAPI.resetPassword({
        token,
        password
      });
      
      console.log('Password reset successful:', response);
      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Error al restablecer la contraseña. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-icon-container error-icon">
            <FaShieldAlt className="auth-icon" />
          </div>
          <h1 className="auth-title">Enlace Inválido</h1>
          <p className="error-message">{error}</p>
          <Link to="/forgot-password" className="btn btn-primary">
            Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

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
          <FaLock className="auth-icon" />
        </motion.div>

        <h1 className="auth-title">Restablecer Contraseña</h1>
        <p className="auth-subtitle">
          Crea una nueva contraseña para tu cuenta
        </p>

        {success ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="success-message"
          >
            <p>¡Tu contraseña ha sido restablecida con éxito!</p>
            <p>Serás redirigido a la página de inicio de sesión...</p>
            <Link to="/login" className="btn btn-primary">
              Ir a Iniciar Sesión
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <FaLock className="form-icon" />
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Nueva contraseña"
                className="form-input"
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <FaLock className="form-icon" />
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar contraseña"
                className="form-input"
                required
                minLength="6"
              />
            </div>
            
            {error && <p className="form-error">{error}</p>}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Restablecer Contraseña'}
            </motion.button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login" className="auth-link">
            Volver a Iniciar Sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;