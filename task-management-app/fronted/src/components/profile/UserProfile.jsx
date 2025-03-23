import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaBell, FaEnvelope, FaUser, FaCalendarAlt, FaMoon, FaSun } from 'react-icons/fa';
import { authAPI, tasksAPI } from '../../services/api';
import notificationService from '../../services/notificationService';
import ThemeToggle from '../common/ThemeToggle';
import { toast } from 'react-toastify';

import './userProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [preferences, setPreferences] = useState({
    taskReminders: true,
    dueDateAlerts: true,
    weeklyDigest: false
  });
  
  const [notificationStatus, setNotificationStatus] = useState({
    browser: false,
    email: false
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Obtener datos del perfil
        const userData = await authAPI.getProfile();
        setUser(userData.user);
        
        // Verificar suscripciones existentes
        try {
          const subscriptionData = await tasksAPI.getNotificationPreferences();
          if (subscriptionData.subscription) {
            setPreferences(subscriptionData.subscription.preferences);
            setNotificationStatus(prev => ({ ...prev, email: subscriptionData.subscription.active }));
          }
        } catch (subError) {
          console.log('No hay suscripciones activas');
        }
        
        // Verificar estado de notificaciones del navegador - LÍNEA CORREGIDA
        const browserNotificationStatus = notificationService.checkNotificationStatus();
        setNotificationStatus(prev => ({ ...prev, browser: browserNotificationStatus.granted }));
        
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
        setError('No se pudieron cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleBrowserNotifications = async () => {
    try {
      const result = await notificationService.requestNotificationPermission();
      setNotificationStatus(prev => ({ ...prev, browser: result.granted }));
      setMessage(result.message);
    } catch (error) {
      setError('Error al configurar notificaciones del navegador');
    }
  };
  
  const handleEmailNotifications = async () => {
    try {
      setSaving(true);
      
      if (notificationStatus.email) {
        // Desactivar notificaciones por correo
        await notificationService.unsubscribeFromEmailNotifications();
        setNotificationStatus(prev => ({ ...prev, email: false }));
        setMessage('Notificaciones por correo desactivadas');
      } else {
        // Activar notificaciones por correo
        await notificationService.subscribeToEmailNotifications(preferences);
        setNotificationStatus(prev => ({ ...prev, email: true }));
        setMessage('Notificaciones por correo activadas');
      }
    } catch (error) {
      console.error('Error al configurar notificaciones por correo:', error);
      setError('Error al configurar notificaciones por correo');
    } finally {
      setSaving(false);
    }
  };
  
  const savePreferences = async () => {
    try {
      setSaving(true);
      
      if (notificationStatus.email) {
        await notificationService.subscribeToEmailNotifications(preferences);
        setMessage('Preferencias guardadas correctamente');
      }
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
      setError('Error al guardar preferencias');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando perfil...</div>;
  }

  return (
    <div className="profile-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="profile-card"
      >
        <div className="profile-header">
          <h2 className="profile-title">Mi Perfil</h2>
          <div className="profile-theme-toggle">
            <ThemeToggle />
          </div>
        </div>
        
        {error && <div className="profile-error">{error}</div>}
        {message && <div className="profile-message">{message}</div>}
        
        <div className="profile-section">
          <h3 className="section-title">
            <FaUser className="section-icon" /> 
            Información Personal
          </h3>
          <div className="user-info">
            <p><strong>Nombre:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Miembro desde:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="profile-section">
          <h3 className="section-title">
            <FaBell className="section-icon" /> 
            Notificaciones
          </h3>
          
          <div className="notification-toggles">
            <div className="notification-option">
              <div>
                <h4>Notificaciones del Navegador</h4>
                <p>Recibe alertas en tiempo real mientras usas la aplicación</p>
              </div>
              <button 
                className={`toggle-button ${notificationStatus.browser ? 'active' : ''}`}
                onClick={handleBrowserNotifications}
                disabled={notificationStatus.browser}
              >
                {notificationStatus.browser ? 'Activadas' : 'Activar'}
              </button>
            </div>
            
            <div className="notification-option">
              <div>
                <h4>Notificaciones por Correo</h4>
                <p>Recibe recordatorios por correo electrónico</p>
              </div>
              <button 
                className={`toggle-button ${notificationStatus.email ? 'active' : ''}`}
                onClick={handleEmailNotifications}
                disabled={saving}
              >
                {saving ? 'Procesando...' : notificationStatus.email ? 'Activadas' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="profile-section">
          <h3 className="section-title">
            <FaEnvelope className="section-icon" /> 
            Preferencias de Correo
          </h3>
          
          <div className="preferences-list">
            <label className="preference-item">
              <input 
                type="checkbox" 
                name="taskReminders" 
                checked={preferences.taskReminders} 
                onChange={handlePreferenceChange}
                disabled={!notificationStatus.email}
              />
              <div>
                <h4>Recordatorios de Tareas</h4>
                <p>Te avisamos cuando una tarea está próxima a vencer</p>
              </div>
            </label>
            
            <label className="preference-item">
              <input 
                type="checkbox" 
                name="dueDateAlerts" 
                checked={preferences.dueDateAlerts} 
                onChange={handlePreferenceChange}
                disabled={!notificationStatus.email}
              />
              <div>
                <h4>Alertas de Vencimiento</h4>
                <p>Recibe un correo el día que vence una tarea</p>
              </div>
            </label>
            
            <label className="preference-item">
              <input 
                type="checkbox" 
                name="weeklyDigest" 
                checked={preferences.weeklyDigest} 
                onChange={handlePreferenceChange}
                disabled={!notificationStatus.email}
              />
              <div>
                <h4>Resumen Semanal</h4>
                <p>Recibe un resumen semanal de tus tareas pendientes</p>
              </div>
            </label>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="save-button"
            onClick={savePreferences}
            disabled={saving || !notificationStatus.email}
          >
            <FaSave /> {saving ? 'Guardando...' : 'Guardar Preferencias'}
          </motion.button>
          <button 
            onClick={async () => {
              try {
                const response = await tasksAPI.sendTestEmail();
                toast.success('Correo de prueba enviado. Revisa tu bandeja de entrada.');
              } catch (error) {
                toast.error('Error al enviar correo de prueba: ' + error.message);
              }
            }}
            className="test-email-button"
          >
            Enviar correo de prueba
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;