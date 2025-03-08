// src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your backend URL

const api = {
  get: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token') || '', // Include JWT token if available
      },
    });
    return response.json();
  },

  post: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token') || '', // Include JWT token if available
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  put: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token') || '', // Include JWT token if available
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token') || '', // Include JWT token if available
      },
    });
    return response.json();
  },
};

export default api;