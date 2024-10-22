const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const redisClient = require('../config/redis');

const monitorDemand = async () => {
  try {
    const activeBookings = await Booking.countDocuments({ status: 'Pending' });
    const availableDrivers = await Driver.countDocuments({ status: 'Available' });

    const demand = activeBookings - availableDrivers;
    const demandFactor = demand > 0 ? 1.5 : 1.0;

    await redisClient.set('demandFactor', demandFactor.toString(), { EX: 60 });

    console.log('Demand Factor:', demandFactor);
  } catch (error) {
    console.error('Demand Monitor Error:', error);
  }
};

module.exports = () => {
  setInterval(monitorDemand, 60000); // Every 60 seconds
};
