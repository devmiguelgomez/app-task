import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaKey } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Import API service
import { authAPI } from '../../services/api';

// Import CSS
import './forgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        console.log('Password reset requested for:', email);
        setIsSubmitted(true);
      } else {
        setError(response.error || 'Error al solicitar el restablecimiento. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(
        error.response?.data?.error || 
        error.message || 
        'No pudimos procesar tu solicitud. Por favor, intenta más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

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
          <FaKey className="auth-icon" />
        </motion.div>

        <h1 className="auth-title">Recuperar Contraseña</h1>
        <p className="auth-subtitle">
          Ingresa tu correo electrónico para recibir instrucciones
        </p>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <FaEnvelope className="form-icon" />
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
            
            {error && <p className="form-error">{error}</p>}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Instrucciones'}
            </motion.button>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="success-message"
          >
            <p>Hemos enviado un correo con instrucciones para restablecer tu contraseña. Por favor revisa tu bandeja de entrada.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-secondary"
              onClick={() => setIsSubmitted(false)}
            >
              Volver a intentar
            </motion.button>
          </motion.div>
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

export default ForgotPassword;