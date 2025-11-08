import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Admin APIs
export const adminAPI = {
  createCategory: (categoryData) => api.post('/admin/create-category', categoryData),
  addCandidate: (candidateData) => api.post('/admin/add-candidate', candidateData),
  toggleVoting: (data) => api.patch('/admin/toggle-voting', data),
  getAllCategories: () => api.get('/admin/categories'),
  deleteCategory: (categoryId) => api.delete(`/admin/delete-category/${categoryId}`),
};

// Vote APIs
export const voteAPI = {
  getActiveCategories: () => api.get('/vote'),
  castVote: (voteData) => api.post('/vote/cast', voteData),
  getResults: () => api.get('/vote/results'),
};

export default api;