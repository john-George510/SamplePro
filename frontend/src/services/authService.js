import api from './api';

const register = (userData) => api.post('/auth/register', userData);

const login = (credentials) => api.post('/auth/login', credentials);

export default { register, login };
