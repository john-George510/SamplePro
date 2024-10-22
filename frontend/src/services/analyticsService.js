// src/services/analyticsService.js
import api from './api';

const getTripStatistics = () => {
  return api.get('/admin/analytics/trip-stats');
};

export default { getTripStatistics };
