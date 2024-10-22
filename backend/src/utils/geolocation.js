exports.calculateDistance = (pickup, dropoff) => {
    const dx = dropoff.latitude - pickup.latitude;
    const dy = dropoff.longitude - pickup.longitude;
    return Math.sqrt(dx * dx + dy * dy) * 111; // Approximate conversion to kilometers
  };
  