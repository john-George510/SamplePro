// src/services/driverService.js
import api from './api';

const getAssignments = () => {
  return api.get('/drivers/assignments');
};

const acceptAssignment = (assignmentId) => {
  return api.post(`/drivers/assignments/${assignmentId}/accept`);
};

export default { getAssignments, acceptAssignment };
