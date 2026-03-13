import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getTools = async (params?: any) => {
  const response = await api.get('/tools', { params });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getTags = async () => {
  const response = await api.get('/tags');
  return response.data;
};
