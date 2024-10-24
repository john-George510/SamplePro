import api from './api';

const register = (userData) => api.post('/api/auth/register', userData);

const login = (credentials) => api.post('/api/auth/login', credentials);

export default { register, login };
