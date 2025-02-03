import api from './api';

const register = (userData) => {
	console.log('api endpint', process.env.REACT_APP_BACKEND_API_URL);
	console.log('api base url', api.defaults.baseURL);
	api.post('/api/auth/register', userData);
}

const login = (credentials) => api.post('/api/auth/login', credentials);

export default { register, login };
