// Corrige la URL base y añade funciones de utilidad para manejar errores

const API_URL = 'https://app-task-backend.vercel.app/api'; // Agrega /api

// Función para manejar respuestas de API de manera consistente
const handleApiResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  
  // Si el servidor devuelve un error 404
  if (response.status === 404) {
    throw new Error("El recurso solicitado no se encuentra disponible. Es posible que el servidor esté en mantenimiento.");
  }
  
  // Si el servidor devuelve un error 504 o similar
  if (response.status >= 500) {
    throw new Error("Error del servidor: " + response.status);
  }
  
  // Si la respuesta no es JSON, es un error
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(`Formato de respuesta inesperado: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
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