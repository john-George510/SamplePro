const getBasePrice = (vehicleType) => {
    const rates = {
      small: 1.0,
      medium: 1.5,
      large: 2.0,
    };
    return rates[vehicleType] || 1.0;
  };
  
  calculateDistance = (pickup, dropoff) => {
    // Simplified calculation using Euclidean distance
    const r = 6371; // km
    const p = Math.PI / 180;

    const a = 0.5 - Math.cos((dropoff.latitude - pickup.latitude) * p) / 2
                  + Math.cos(pickup.latitude * p) * Math.cos(dropoff.latitude * p) *
                    (1 - Math.cos((dropoff.longitude - pickup.longitude) * p)) / 2;

    return 2 * r * Math.asin(Math.sqrt(a)); // Approximate conversion to kilometers
  };
  
  exports.estimatePrice = async (pickupLocation, dropoffLocation, vehicleType) => {
    const distance = calculateDistance(pickupLocation, dropoffLocation);
    const basePrice = getBasePrice(vehicleType);
    
    const price = basePrice * distance;
    return { price, distance };
  };
  