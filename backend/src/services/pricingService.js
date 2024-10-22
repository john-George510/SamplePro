const getBasePrice = (vehicleType) => {
    const rates = {
      small: 1.0,
      medium: 1.5,
      large: 2.0,
    };
    return rates[vehicleType] || 1.0;
  };
  
  const calculateDistance = (pickup, dropoff) => {
    // Simplified calculation using Euclidean distance
    const dx = dropoff.latitude - pickup.latitude;
    const dy = dropoff.longitude - pickup.longitude;
    return Math.sqrt(dx * dx + dy * dy) * 111; // Approximate conversion to kilometers
  };
  
  exports.estimatePrice = async (pickupLocation, dropoffLocation, vehicleType) => {
    const distance = calculateDistance(pickupLocation, dropoffLocation);
    const basePrice = getBasePrice(vehicleType);
  
    const price = basePrice * distance;
    return price;
  };
  