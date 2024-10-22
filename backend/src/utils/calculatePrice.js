// backend/utils/calculatePrice.js

function calculatePrice(distance, vehicleType) {
    const baseRate = 1; // $1 per kilometer
  
    let multiplier = 1;
    switch (vehicleType) {
      case 'small':
        multiplier = 1;
        break;
      case 'medium':
        multiplier = 1.5;
        break;
      case 'large':
        multiplier = 2;
        break;
      default:
        multiplier = 1;
    }
  
    return distance * baseRate * multiplier;
  }
  
  module.exports = calculatePrice;
  