import api from './api';

const getAllVehicles = () => api.get('/admin/vehicles');

export default { getAllVehicles };
