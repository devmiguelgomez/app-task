// API service for making requests to the backend

const API_URL = 'https://app-task-chi.vercel.app/api';

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
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Parse the JSON response
  const data = await response.json();

  // If response is not ok, throw an error
  if (!response.ok) {
    throw new Error(data.error || 'Algo salió mal');
  }

  return data;
};

// Auth API calls
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    return fetchWithAuth(`${API_URL}/users/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
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
  subscribeToNotifications: async (preferences) => {
    return fetchWithAuth(`${API_URL}/tasks/notifications/subscribe`, {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  },
  
  // Unsubscribe from task notifications
  unsubscribeFromNotifications: async () => {
    return fetchWithAuth(`${API_URL}/tasks/notifications/unsubscribe`, {
      method: 'POST',
    });
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