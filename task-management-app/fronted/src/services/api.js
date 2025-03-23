// API service for making requests to the backend

// Modificar la constante API_URL

// Cambia esto:
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://pp-task-chi.vercel.app/api'
  : 'http://localhost:5000/api';

// Helper function to handle fetch requests
const fetchWithAuth = async (url, options = {}) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Set headers with authorization if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Remove credentials: 'include' as it might be causing issues with CORS
    });

    // Handle OPTIONS preflight response
    if (response.status === 204) {
      return { success: true };
    }

    // Handle timeout or server errors
    if (response.status === 504) {
      throw new Error('La solicitud ha excedido el tiempo de espera. Por favor, intenta de nuevo más tarde.');
    }

    // Try to parse JSON, but handle non-JSON responses gracefully
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        throw new Error('Error en el formato de respuesta del servidor');
      }
    } else {
      // Handle non-JSON response
      const text = await response.text();
      throw new Error(`Error del servidor: ${text.substring(0, 100)}`);
    }

    // If response is not ok, throw an error
    if (!response.ok) {
      throw new Error(data.error || 'Algo salió mal');
    }

    return data;
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

  // Login user
  login: async (credentials) => {
    return fetchWithAuth(`${API_URL}/users/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  // Social login methods have been removed


  // Forgot password
  forgotPassword: async (email) => {
    return fetchWithAuth(`${API_URL}/users/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
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
};