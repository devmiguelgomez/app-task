// Modifica la URL base de la API
const API_URL = 'https://app-task-backend.vercel.app/api';

// Si quieres mantener el soporte para desarrollo local:
// const API_URL = process.env.NODE_ENV === 'production' 
//   ? 'https://app-task-backend.vercel.app/api' 
//   : 'http://localhost:5000/api';

// Función para manejar errores de API de forma más robusta
const handleApiResponse = async (response) => {
  if (!response.ok) {
    // Para errores 404, mostrar un mensaje más amigable
    if (response.status === 404) {
      throw new Error("El recurso solicitado no se encuentra disponible. Es posible que el servidor esté en mantenimiento.");
    }
    
    // Intentar parsear el error como JSON
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error del servidor: ${response.statusText}`);
    } catch (e) {
      // Si no puede parsear JSON, usar el texto del status
      throw new Error(`Error del servidor: ${response.statusText}`);
    }
  }
  
  return response.json();
};

// Helper function to handle fetch requests
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay sesión activa');
  }
  
  const fetchOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    return await handleApiResponse(response);
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.errors?.[0]?.msg || 'Error en el registro');
      }
      
      return data;
    } catch (error) {
      console.error('Registration error details:', error);
      throw error;
    }
  },

  // Login user - Modificar esta función
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Social login methods have been removed

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${API_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    return fetchWithAuth(`${API_URL}/users/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ token, password }),
    });
  },

  // Get user profile
  getProfile: async () => {
    return fetchWithAuth(`${API_URL}/users/profile`);
  },

  // Update user profile
  updateProfile: async (userData) => {
    return fetchWithAuth(`${API_URL}/users/profile`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Tasks API calls
export const tasksAPI = {
  // Get all tasks
  getTasks: async () => {
    return fetchWithAuth(`${API_URL}/tasks`);
  },
  
  // Subscribe to task notifications
  subscribeToNotifications: async (data) => {
    return fetchWithAuth(`${API_URL}/tasks/notifications/subscribe`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Unsubscribe from task notifications
  unsubscribeFromNotifications: async () => {
    return fetchWithAuth(`${API_URL}/tasks/notifications/unsubscribe`, {
      method: 'POST',
    });
  },

  // Get notification preferences
  getNotificationPreferences: async () => {
    return fetchWithAuth(`${API_URL}/tasks/notifications/preferences`);
  },

  // Create a new task
  createTask: async (taskData) => {
    return fetchWithAuth(`${API_URL}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Get a task by ID
  getTaskById: async (taskId) => {
    return fetchWithAuth(`${API_URL}/tasks/${taskId}`);
  },

  // Update a task
  updateTask: async (taskId, taskData) => {
    return fetchWithAuth(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  // Delete a task
  deleteTask: async (taskId) => {
    return fetchWithAuth(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Filter tasks by status
  filterByStatus: async (status) => {
    return fetchWithAuth(`${API_URL}/tasks/filter/${status}`);
  },

  // Filter tasks by priority
  filterByPriority: async (priority) => {
    return fetchWithAuth(`${API_URL}/tasks/priority/${priority}`);
  },

  // Send test email
  sendTestEmail: async () => {
    return fetchWithAuth(`${API_URL}/tasks/send-test-email`, {
      method: 'POST'
    });
  },
};