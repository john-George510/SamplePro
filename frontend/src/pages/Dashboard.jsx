// src/pages/Dashboard.jsx

import React, { useEffect, useState, useContext, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import throttle from 'lodash/throttle';
import BookingForm from '../components/Booking/BookingForm';
import BookingList from '../components/Booking/BookingList';
import FleetManagement from '../components/Admin/FleetManagement';
import TrackModal from '../components/Booking/TrackModal';
import {
  fetchUserBookings,
  fetchNearbyBookings,
} from '../redux/slices/bookingSlice';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom'; // Added import for navigate
import { setOnlineStatus } from '../redux/slices/userSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const userRole = useSelector((state) => state.user.role);
  const bookings = useSelector((state) => state.bookings.bookings);
  const user = useSelector((state) => state.user);
  const isOnline = useSelector((state) => state.user.isOnline);

  const [driverLocation, setDriverLocation] = useState(null);
  const [trackingBookingId, setTrackingBookingId] = useState(null);
  const [isTracking, setIsTracking] = useState(false); // To toggle tracking
  const lastLocation = useRef(null); // Store the last known location

  const navigate = useNavigate(); // Initialize navigate

  let decodedToken = null;
  let userId = null;
  if (user.token) {
    try {
      decodedToken = jwtDecode(user.token); // Corrected usage
      userId = decodedToken.userId || decodedToken.id;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  const joinedRooms = useRef(new Set());

  const handleLogout = () => {
    sessionStorage.removeItem('token'); // Remove token from local storage
    navigate('/login'); // Redirect to login page
  };

  // Throttle function to send location updates at intervals
  const emitThrottledLocation = throttle((bookingId, latitude, longitude) => {
    socket.emit('driverLocationUpdate', {
      bookingId,
      driverId: userId,
      coordinates: { latitude, longitude },
    });
    lastLocation.current = { latitude, longitude };
  }, 15000);

  useEffect(() => {
    if (userRole === 'driver' && socket && socket.connected) {
      bookings.forEach((booking) => {
        if (
          booking.status === 'Assigned' &&
          booking.driver &&
          booking.driver.toString() === userId &&
          !joinedRooms.current.has(booking._id)
        ) {
          socket.emit('joinBookingRoom', { bookingId: booking._id });
          joinedRooms.current.add(booking._id);
        }
      });
    }
  }, [userRole, bookings, socket, userId]);

  // Fetch bookings based on user role
  useEffect(() => {
    if (userRole === 'user') {
      dispatch(fetchUserBookings());
    } else if (userRole === 'driver') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setDriverLocation({ latitude, longitude });
            dispatch(fetchNearbyBookings({ latitude, longitude }));
          },
          (error) => console.error('Geolocation error:', error),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    }
  }, [userRole, dispatch, userId]);

  // Emit location updates only when tracking is active
  useEffect(() => {
    let watchId;

    if (userRole === 'driver' && socket) {
      // Watch the driver's location continuously
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setDriverLocation({ latitude, longitude });

          // Emit location update to the assigned booking room
          bookings.forEach((booking) => {
            if (
              booking.status === 'Assigned' &&
              booking.driver &&
              booking.driver.toString() === userId
            ) {
              socket.emit('driverLocationUpdate', {
                bookingId: booking._id,
                driverId: userId,
                coordinates: { latitude, longitude },
              });
            }
          });
        },
        (error) => console.error('Error watching driver position:', error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [userRole, bookings, socket, userId]);

  const handleTrack = (bookingId) => {
    setTrackingBookingId(bookingId);
    setIsTracking(true); // Enable tracking

    if (socket && socket.connected) {
      socket.emit('joinBookingRoom', { bookingId });
    } else {
      console.error('Socket not connected. Cannot join room.');
    }
  };

  const handleCloseTrack = () => {
    setIsTracking(false); // Disable tracking
    if (trackingBookingId) {
      socket.emit('leaveBookingRoom', { bookingId: trackingBookingId });
      setTrackingBookingId(null);
    }
  };

  const handleOnlineStatusToggle = () => {
    dispatch(setOnlineStatus(!isOnline));
  };

  if (userRole === 'user') {
    return (
      <div className="dashboard-container" style={{
        paddingTop: 'var(--navbar-height)',
        backgroundColor: 'var(--background)',
        minHeight: '100vh'
      }}>
        {/* <div className="dashboard-header" style={{
          background: 'white',
          padding: '24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600' }}>User Dashboard</h2>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Logout
          </button>
        </div> */}
        <div className="p-4">
          {/* Booking Form Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <BookingForm />
          </div>

          {/* Bookings Categories */}
          <div className="space-y-6">
            {/* Pending Requests */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
              <div className="space-y-4">
                {bookings.filter(b => b.status === 'Pending').length > 0 ? (
                  <BookingList 
                    bookings={bookings.filter(b => b.status === 'Pending')} 
                    onTrack={handleTrack} 
                  />
                ) : (
                  <div className="text-center text-gray-500">No pending requests</div>
                )}
              </div>
            </div>

            {/* Assigned Bookings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Assigned Bookings</h3>
              <div className="space-y-4">
                {bookings.filter(b => ['Assigned', 'On the way'].includes(b.status)).length > 0 ? (
                  <BookingList 
                    bookings={bookings.filter(b => ['Assigned', 'On the way'].includes(b.status))} 
                    onTrack={handleTrack} 
                  />
                ) : (
                  <div className="text-center text-gray-500">No assigned bookings</div>
                )}
              </div>
            </div>

            {/* Completed Bookings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Completed Bookings</h3>
              <div className="space-y-4">
                {bookings.filter(b => b.status === 'Completed').length > 0 ? (
                  <BookingList 
                    bookings={bookings.filter(b => b.status === 'Completed')} 
                    onTrack={handleTrack} 
                  />
                ) : (
                  <div className="text-center text-gray-500">No completed bookings</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {trackingBookingId && (
          <TrackModal
            bookingId={trackingBookingId}
            onClose={handleCloseTrack}
          />
        )}
      </div>
    );
  } else if (userRole === 'admin') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        <FleetManagement />
      </div>
    );
  } else if (userRole === 'driver') {
    return (
      <div className="dashboard-container" style={{
        paddingTop: 'var(--navbar-height)',
        backgroundColor: 'var(--background)',
        minHeight: '100vh'
      }}>
        {/* Header Section */}
        <div className="dashboard-header" style={{
          background: 'white',
          padding: '24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Driver Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {driverLocation ? 
                `Current Location: ${driverLocation.latitude.toFixed(4)}, ${driverLocation.longitude.toFixed(4)}` : 
                'Fetching location...'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleOnlineStatusToggle}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                flex items-center gap-2
                ${isOnline 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'}
              `}
            >
              <div className={`
                w-2 h-2 rounded-full
                ${isOnline ? 'bg-white animate-pulse' : 'bg-white'}
              `}></div>
              {isOnline ? 'Online' : 'Offline'}
            </button>
            
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm font-medium">Available Jobs</h3>
              <p className="text-2xl font-semibold mt-2">
                {bookings.filter(b => b.status === 'Pending').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm font-medium">Active Jobs</h3>
              <p className="text-2xl font-semibold mt-2">
                {bookings.filter(b => ['Assigned', 'On the way'].includes(b.status)).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm font-medium">Completed Today</h3>
              <p className="text-2xl font-semibold mt-2">
                {bookings.filter(b => 
                  b.status === 'Completed' && 
                  new Date(b.updatedAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
              <p className="text-2xl font-semibold mt-2">
                ₹{bookings
                  .filter(b => b.status === 'Completed')
                  .reduce((total, b) => total + parseFloat(b.price), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-white rounded-xl shadow-sm">
            {driverLocation ? (
              <BookingList 
                bookings={bookings} 
                driverLocation={driverLocation}
                onTrack={handleTrack}
                isOnline={isOnline}
              />
            ) : (
              <div className="p-8 text-center text-gray-500">
                Fetching your location...
              </div>
            )}
          </div>
        </div>

        {/* Track Modal */}
        {isTracking && trackingBookingId && (
          <TrackModal
            bookingId={trackingBookingId}
            onClose={handleCloseTrack}
          />
        )}
      </div>
    );
  } else {
    return <h2>Unknown Role</h2>;
  }
};

export default Dashboard;
