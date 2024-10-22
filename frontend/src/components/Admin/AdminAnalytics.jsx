// src/components/Admin/AdminAnalytics.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics } from '../../redux/slices/analyticsSlice';
import { Bar } from 'react-chartjs-2';

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const analytics = useSelector((state) => state.analytics.tripStats);
  const status = useSelector((state) => state.analytics.status);
  const error = useSelector((state) => state.analytics.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAnalytics());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <p>Loading analytics...</p>;
  if (status === 'failed') return <p>Error: {error}</p>;

  const data = {
    labels: analytics.driverPerformance?.map((dp) => dp.driverName) || [],
    datasets: [
      {
        label: 'Trips Completed',
        data: analytics.driverPerformance?.map((dp) => dp.tripsCompleted) || [],
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  return (
    <div>
      <h2>Trip Statistics</h2>
      <p>Total Trips: {analytics.totalTrips}</p>
      <p>
        Average Trip Time:{' '}
        {Math.round((analytics.averageTripTime || 0) / 60000)} minutes
      </p>
      <h3>Driver Performance</h3>
      <Bar data={data} />
    </div>
  );
};

export default AdminAnalytics;
