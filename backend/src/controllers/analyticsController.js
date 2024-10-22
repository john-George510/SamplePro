// src/controllers/analyticsController.js
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');

exports.getTripStatistics = async (req, res) => {
  try {
    const totalTrips = await Booking.countDocuments({ status: 'Completed' });

    const avgTripTimeAggregation = await Booking.aggregate([
      { $match: { status: 'Completed' } },
      {
        $project: {
          tripDuration: { $subtract: ['$updatedAt', '$createdAt'] },
        },
      },
      {
        $group: {
          _id: null,
          averageTripTime: { $avg: '$tripDuration' },
        },
      },
    ]);

    const averageTripTime = avgTripTimeAggregation[0]?.averageTripTime || 0;

    const driverPerformance = await Booking.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: '$driverId',
          tripsCompleted: { $sum: 1 },
          totalEarnings: { $sum: '$estimatedCost' },
        },
      },
      {
        $lookup: {
          from: 'drivers',
          localField: '_id',
          foreignField: '_id',
          as: 'driver',
        },
      },
      { $unwind: '$driver' },
      {
        $project: {
          _id: 1,
          tripsCompleted: 1,
          totalEarnings: 1,
          driverName: '$driver.name',
        },
      },
    ]);

    res.status(200).json({ totalTrips, averageTripTime, driverPerformance });
  } catch (error) {
    console.error('Get Trip Statistics Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
