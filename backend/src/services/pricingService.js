const bookingService = require("../controllers/bookingController");
const Booking = require("../models/Booking");

const getBasePrice = (vehicleType) => {
  const rates = {
    small: 1.0, // Light trucks (<=5T)
    medium: 1.2, // Medium trucks (5T - 15T)
    large: 1.5, // Heavy trucks (>15T)
    tanker: 1.3, // Tankers
  };
  return rates[vehicleType] || 1.1; // Default factor
};

const getMaterialFactor = (materialType) => {
  const materialFactors = {
    "Agricultural products": 1.0,
    "Rubber products": 1.0,
    "Wood": 1.2,
    "Machinery new or old": 1.2,
    "Cement": 1.5,
    "Steel": 1.5,
  };
  return materialFactors[materialType] || 1.0; // Default factor
};

const getUrgencyFactor = (expirationTime) => {
  // Extract hours and minutes using regex
  const match = expirationTime.match(/(\d+)H(\d+)M/);
  
  if (!match) return 1.0; // Default if format is incorrect

  const hours = parseInt(match[1]); // Extract hours
  const minutes = parseInt(match[2]); // Extract minutes
  
  const totalHours = hours + (minutes / 60); // Convert total time to hours

  // Apply urgency pricing logic
  if (totalHours < 1) return 1.5;
  if (totalHours < 6) return 1.3;
  if (totalHours < 24) return 1.2;
  return 1.0; // Default factor
};

const haversineDistance = (coord1, coord2) => {
  const r = 6371; // Radius of Earth in km
  const p = Math.PI / 180;
  
  const a = 0.5 - Math.cos((coord2.latitude - coord1.latitude) * p) / 2
    + Math.cos(coord1.latitude * p) * Math.cos(coord2.latitude * p) *
    (1 - Math.cos((coord2.longitude - coord1.longitude) * p)) / 2;

  return 2 * r * Math.asin(Math.sqrt(a));
};

const getNearbyOrders = async (pickup, dropoff, radius = 5) => {
  const existingOrders = await Booking.find({ status: 'Pending' }).exec();
  // console.log("Existing Orders:", existingOrders);
  // console.log("Pickup Location:", pickup);
  // console.log("Dropoff Location:", dropoff);
  return existingOrders.filter(order => {
    console.log(order);
    const { pickupLocation, dropoffLocation } = order;
    const pickupCoordinates = { latitude: pickupLocation.coordinates[1], longitude: pickupLocation.coordinates[0] };
    const dropoffCoordinates = { latitude: dropoffLocation.coordinates[1], longitude: dropoffLocation.coordinates[0] };
    const pickupDistance = haversineDistance(pickup, pickupCoordinates);
    const dropoffDistance = haversineDistance(dropoff, dropoffCoordinates);
    // console.log("Pickup Distance:", pickupDistance);
    // console.log("Dropoff Distance:", dropoffDistance);
    return pickupDistance <= radius && dropoffDistance <= radius; // Check if within 5 km radius
  });
};

const getDemandFactor = async (pickup, dropoff, database) => {
  const nearbyOrders = await getNearbyOrders(pickup, dropoff, database);
  console.log("Nearby Orders:", nearbyOrders);
  const baseFactor = 1.0;
  const scalingFactor = 0.05; // Increase factor by 5% per existing order
  const demandFactor = baseFactor + (nearbyOrders.length * scalingFactor);


  //Update the existing orders with the demand factor
  for (const order of nearbyOrders) {
    console.log("Existing Order:", order);
    const insuranceCost = order.insurance_supported ? 50 : 0;
    console.log("Previous Price:", order.price);
    const priceWithoutInsurance = order.price - insuranceCost;
    console.log("Price Without Insurance:", priceWithoutInsurance);
    const scaledPrice = priceWithoutInsurance * (baseFactor + scalingFactor);
    console.log("Scaled Price:", scaledPrice);
    order.price = scaledPrice + insuranceCost;
    await order.save();  // Wait for save to complete
    console.log("Updated Order:", order);
  }

  return demandFactor; // Dynamically scaled demand factor
};

const calculateDistance = (pickup, dropoff) => {
  const r = 6371; // Radius of Earth in km
  const p = Math.PI / 180;

  const a = 0.5 - Math.cos((dropoff.latitude - pickup.latitude) * p) / 2
    + Math.cos(pickup.latitude * p) * Math.cos(dropoff.latitude * p) *
    (1 - Math.cos((dropoff.longitude - pickup.longitude) * p)) / 2;

  return 2 * r * Math.asin(Math.sqrt(a)); // Approximate conversion to kilometers
};

exports.estimatePrice = async (pickupLocation, dropoffLocation, vehicleType, materialType, expirationTime, insuranceSupported) => {
  const distance = calculateDistance(pickupLocation, dropoffLocation);
  const basePrice = getBasePrice(vehicleType);
  const materialFactor = getMaterialFactor(materialType);
  const urgencyFactor = getUrgencyFactor(expirationTime);
  const insuranceCost = insuranceSupported ? 50 : 0;
  const demandFactor = await getDemandFactor(pickupLocation, dropoffLocation, 5); // 5 km radius

  // Final price calculation
  const price = (basePrice * distance * materialFactor * urgencyFactor * demandFactor) + insuranceCost;
  
  return { price, distance };
};