// frontend/src/utils/pricingModel.js
import api from '../services/api';

export const getPriceEstimate = async (pickup, dropoff, vehicleType) => {
  try {
    const response = await api.post('/bookings/estimate', {
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      vehicleType,
    });
    return response.data.estimatedCost;
  } catch (error) {
    console.error('Error estimating price:', error);
    return null;
  }
};
