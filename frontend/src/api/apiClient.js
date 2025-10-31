import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

/**
 * This interceptor adds the Firebase auth token to every
 * request header.
 */
apiClient.interceptors.request.use(
  async (config) => {

    const token = localStorage.getItem('firebaseIdToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;