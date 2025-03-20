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
  const expirationDate = new Date(expirationTime);
  const now = new Date();
  
  const diffMs = expirationDate - now;
  if (diffMs <= 0) return 1.5; // If expired, return highest urgency
  
  const diffMinutes = diffMs / (1000 * 60);
  const totalHours = diffMinutes / 60;

  if (totalHours < 1) return 1.5;
  if (totalHours < 6) return 1.3;
  if (totalHours < 24) return 1.2;
  return 1.0;
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

async function getFuelPrice(state) {
  try {
      const response = await fetch("https://www.cardekho.com/fuel-price");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const html = await response.text();
      
      const regex = new RegExp(
          `<a href="https://www.cardekho.com/[^"]*-${state.toLowerCase()}-state"[^>]*>[^<]*</a></td><td>₹ ([0-9.]+)</td>`,
          "i"
      );
      
      const match = html.match(regex);
      
      return match ? `₹ ${match[1]}` : `Price not found for ${state}`;
  } catch (error) {
      console.error("Error fetching fuel price:", error);
  }
}


getFuelPrice("Kerala").then(console.log);


const getDemandFactor = async (pickup, dropoff, database) => {
  const nearbyOrders = await getNearbyOrders(pickup, dropoff, database);
  console.log("Nearby Orders:", nearbyOrders);
  const baseFactor = 1.0;
  const scalingFactor = 0.05; // Increase factor by 5% per existing order
  const demandFactor = baseFactor + (nearbyOrders.length * scalingFactor);


  //Update the existing orders with the demand factor
  for (const order of nearbyOrders) {
    console.log("Existing Order:", order);
    const insuranceCost = order.insurance_supported ? 500 : 0;
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

exports.estimatePrice = async (pickupLocation, dropoffLocation, vehicleType, materialType, expirationTime, insuranceSupported, quantity, refrigerationRequired, fragile) => {
  const distance = calculateDistance(pickupLocation, dropoffLocation);
  const basePrice = getBasePrice(vehicleType);
  const materialFactor = getMaterialFactor(materialType);
  const urgencyFactor = getUrgencyFactor(expirationTime);
  const insuranceCost = insuranceSupported ? 500 : 0;
  const demandFactor = await getDemandFactor(pickupLocation, dropoffLocation, 5); // 5 km radius
  const commission = 1.1; // 10% commission

  const refrigerationFactor = refrigerationRequired ? 1.2 : 1.0; // 20% extra for refrigeration
  const fragileFactor = fragile ? 1.3 : 1.0; // 30% extra for fragile goods

  // Final price calculation
  const price = (basePrice * quantity * distance * materialFactor * urgencyFactor * demandFactor * commission * refrigerationFactor * fragileFactor) + insuranceCost;
  
  return { price, distance };
};