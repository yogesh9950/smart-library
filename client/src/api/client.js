import axios from 'axios';

const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.host;
    const orchidsPreview = host.match(/^5173-(.+)\.orchids\.cloud$/);

    if (orchidsPreview) {
      return `https://5000-${orchidsPreview[1]}.orchids.cloud/api`;
    }
  }

  return '/api';
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
});

api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('smart-library-auth');
  if (authData) {
    const parsed = JSON.parse(authData);
    if (parsed?.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  }
  return config;
});

export default api;
