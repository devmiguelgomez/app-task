// Corrige la URL base y añade funciones de utilidad para manejar errores

const API_URL = 'https://app-task-backend.vercel.app/api'; // Agrega /api

// Actualiza la función de manejo de respuestas API
const handleApiResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  
  // Para depuración: registra todos los errores de red
  console.log(`API Response: ${response.status} ${response.statusText} for ${response.url}`);
  
  if (response.status === 504) {
    console.error("Error de timeout. El servidor tardó demasiado en responder.");
    throw new Error("El servidor no está respondiendo. Por favor, intenta más tarde.");
  }
  
  if (response.status === 404) {
    console.error("Recurso no encontrado:", response.url);
    throw new Error("El recurso solicitado no está disponible.");
  }
  
  if (response.status >= 500) {
    console.error("Error del servidor:", response.status, response.url);
    throw new Error(`Error del servidor: ${response.status}. Por favor, contacta al administrador.`);
  }
  
  if (!contentType || !contentType.includes("application/json")) {
    console.error("Respuesta no-JSON recibida:", response.status, contentType);
    throw new Error(`Formato de respuesta inesperado: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error("Error en respuesta API:", data);
    throw new Error(data.error || data.message || "Error en la solicitud");
  }
  
  return data;
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
  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Registration error details:', error);
      throw error;
    }
  },

  // Login user
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
      console.error('Error in forgotPassword API call:', error);
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