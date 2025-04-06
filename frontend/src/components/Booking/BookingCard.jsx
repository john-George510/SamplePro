// src/components/Booking/BookingCard.jsx

import React, { useState, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { acceptBooking } from '../../redux/slices/bookingSlice';
import { SocketContext } from '../../context/SocketContext';
import TrackModal from './TrackModal';
import debounce from 'lodash/debounce';
import RouteCombinationCard from './RouteCombinationCard';

// Ensure Mapbox CSS is imported
import 'mapbox-gl/dist/mapbox-gl.css';

const BookingCard = ({
  booking,
  showAcceptButton,
  onTrack,
  driverLocation,
  otherBookings = [],
  onCombineRoutes,
}) => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const isOnline = useSelector((state) => state.user.isOnline);
  const role = useSelector((state) => state.user.role);

  const [isTracking, setIsTracking] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [locationAddress, setLocationAddress] = useState([]);
  const [distanceBetweenLocations, setDistanceBetweenLocations] =
    useState(null);
  const [distanceToPickup, setDistanceToPickup] = useState(null);

  const addressCache = useRef({}); // To cache addresses and reduce API calls

  // Function to perform reverse geocoding with caching
  const reverseGeocode = async (longitude, latitude) => {
    const key = `${latitude},${longitude}`;
    if (addressCache.current[key]) {
      return addressCache.current[key];
    }
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${"pk.eyJ1IjoiYWRpdHJhbWRhcyIsImEiOiJjbTJoZTVpa20wN2F3MmpzM3F2a2M3ZWNxIn0.ePD_ugk2QndekxDHx3ryhA"}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        addressCache.current[key] = address; // Cache the result
        return address;
      }
      return 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Unknown location';
    }
  };

  // Fetch addresses when booking is loaded
  useEffect(() => {
    const fetchAddresses = async () => {
      if (booking.pickupLocation && booking.pickupLocation.coordinates) {
        const [pickupLongitude, pickupLatitude] =
          booking.pickupLocation.coordinates;
        const address = await reverseGeocode(pickupLongitude, pickupLatitude);
        setPickupAddress(address);
      }

      if (booking.dropoffLocation && booking.dropoffLocation.coordinates) {
        const [dropoffLongitude, dropoffLatitude] =
          booking.dropoffLocation.coordinates;
        const address = await reverseGeocode(dropoffLongitude, dropoffLatitude);
        setDropoffAddress(address);
      }

      console.log(booking.routeOrder);
      if (booking.routeOrder && booking.routeOrder.length > 0) {
        const addresses = await Promise.all(
          booking.routeOrder.map(async (stop) => {
            if (stop.location) {
              console.log(stop.location.coordinates);
              const [longitude, latitude] = stop.location.coordinates;
              return await reverseGeocode(longitude, latitude);
            }
            return 'Unknown location';
          })
        );
        console.log(addresses);
        setLocationAddress(addresses);
      }

    };

    fetchAddresses();
  }, [booking]);

  // Function to calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2); // Distance in km
  };

  // Debounced distance calculation between Pickup and Dropoff
  const debouncedCalculateDistanceBetween = useRef(
    debounce((lat1, lon1, lat2, lon2) => {
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      setDistanceBetweenLocations(distance);
    }, 500)
  ).current;

  // Debounced distance calculation from Driver to Pickup
  const debouncedCalculateDistanceToPickup = useRef(
    debounce((lat1, lon1, lat2, lon2) => {
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      setDistanceToPickup(distance);
    }, 500)
  ).current;

  // Calculate distance between Pickup and Dropoff
  useEffect(() => {
    if (
      booking.pickupLocation &&
      booking.pickupLocation.coordinates &&
      booking.dropoffLocation &&
      booking.dropoffLocation.coordinates
    ) {
      const [pickupLongitude, pickupLatitude] =
        booking.pickupLocation.coordinates;
      const [dropoffLongitude, dropoffLatitude] =
        booking.dropoffLocation.coordinates;

      // Validate coordinates
      if (
        typeof pickupLatitude !== 'number' ||
        typeof pickupLongitude !== 'number' ||
        typeof dropoffLatitude !== 'number' ||
        typeof dropoffLongitude !== 'number'
      ) {
        console.error('Invalid coordinates for booking');
        setDistanceBetweenLocations('N/A');
        return;
      }

      const distance = calculateDistance(
        pickupLatitude,
        pickupLongitude,
        dropoffLatitude,
        dropoffLongitude
      );
      setDistanceBetweenLocations(distance);
    }
  }, [booking, debouncedCalculateDistanceBetween]);

  // Calculate distance from Driver to Pickup (only for Drivers)
  useEffect(() => {
    if (
      role === 'driver' && // Directly check role
      driverLocation &&
      booking.pickupLocation &&
      booking.pickupLocation.coordinates
    ) {
      const [pickupLongitude, pickupLatitude] =
        booking.pickupLocation.coordinates;

      // Validate coordinates
      if (
        typeof driverLocation.latitude !== 'number' ||
        typeof driverLocation.longitude !== 'number' ||
        typeof pickupLatitude !== 'number' ||
        typeof pickupLongitude !== 'number'
      ) {
        console.error(
          'Invalid driver or pickup coordinates for booking:',
          booking._id
        );
        setDistanceToPickup('N/A');
        return;
      }

      debouncedCalculateDistanceToPickup(
        driverLocation.latitude,
        driverLocation.longitude,
        pickupLatitude,
        pickupLongitude
      );
    }
  }, [role, driverLocation, booking, debouncedCalculateDistanceToPickup]);

  const handleTrack = () => {
    setIsTracking(true);
    // Join the booking room for real-time updates
    socket.emit('joinBookingRoom', { bookingId: booking._id });
  };

  const handleCloseTrack = () => {
    setIsTracking(false);
    // Optionally, leave the booking room
    socket.emit('leaveBookingRoom', { bookingId: booking._id });
  };

  const handleAccept = () => {
    dispatch(acceptBooking(booking._id));
    socket.emit('joinBookingRoom', { bookingId: booking._id });
  };

  const handleStatusUpdate = (status) => {
    // Emit status update via Socket.IO
    socket.emit('driverStatusUpdate', { bookingId: booking._id, status });
  };

  const renderActionButton = () => {
    if (role === 'driver' && showAcceptButton && booking.status === 'Pending') {
      if (!isOnline) {
        return (
          <button
            className="w-full bg-gray-300 text-gray-600 font-semibold px-6 py-2.5 rounded-lg cursor-not-allowed"
            disabled
          >
            Go Online to Accept
          </button>
        );
      }
      return (
        <button
          onClick={handleAccept}
          className="w-full bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg
          transition-all duration-200 ease-in-out
          hover:bg-blue-700 hover:shadow-md
          active:transform active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Accept Booking
        </button>
      );
    }

    if (booking.status === 'Assigned' && role === 'driver') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleStatusUpdate('On the Way')}
            className="bg-yellow-500 text-white font-semibold px-6 py-2.5 rounded-lg
            transition-all duration-200 ease-in-out
            hover:bg-yellow-600 hover:shadow-md
            active:transform active:scale-95
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            On the Way
          </button>
          <button
            onClick={() => handleStatusUpdate('Arrived')}
            className="bg-green-500 text-white font-semibold px-6 py-2.5 rounded-lg
            transition-all duration-200 ease-in-out
            hover:bg-green-600 hover:shadow-md
            active:transform active:scale-95
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Arrived
          </button>
        </div>
      );
    }

    return null;
  };

  // Add validation for showing route combinations
  const shouldShowRouteCombinations = () => {
    return (
      role === 'driver' && 
      otherBookings && 
      otherBookings.length > 0 && 
      booking.status === 'Pending' && // Only show for pending bookings
      !booking.isCombinedRoute // Don't show for already combined routes
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4 w-full border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location Details */}
        <div className="col-span-2 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="absolute top-5 left-1.5 w-0.5 h-8 bg-gray-200"></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">PICKUP</p>
                <p className="text-gray-800 font-medium">{pickupAddress}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-xs text-gray-500 font-medium">DROPOFF</p>
                <p className="text-gray-800 font-medium">{dropoffAddress}</p>
              </div>
            </div>
          </div>
          
          {/* Distance Information */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600 font-medium">
                {distanceBetweenLocations
                  ? `${distanceBetweenLocations} km`
                  : 'Calculating...'}
              </span>
            </div>
            {role === 'driver' && distanceToPickup && (
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                <span className="text-gray-600 font-medium">
                  {distanceToPickup} km to pickup
                </span>
              </div>
            )}
          </div>

          {/* Combined Route Information */}
          {booking.isCombinedRoute && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-blue-700 font-medium mb-2">Combined Route Details</h4>
              <ol className="list-decimal pl-5 space-y-1">
                {locationAddress.map((address, index) => (
                  <li key={index} className="text-blue-600">{address}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex flex-col justify-between border-l border-gray-100 pl-6">
          {/* Price Display */}
          <div className="text-right">
            <div className="inline-block bg-green-50 px-4 py-2 rounded-lg border-2 border-green-100">
              <p className="text-4xl font-bold text-green-600 tracking-tight">
                ₹{booking.isCombinedRoute && booking.combinedPrice 
                   ? booking.combinedPrice.toFixed(2) 
                   : booking.price 
                     ? booking.price.toFixed(2) 
                     : '0.00'}
              </p>
              <p className="text-sm font-medium text-green-700">Total Fare</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mt-4">
            {renderActionButton()}
            {onTrack && booking.driver && (
              <button
                onClick={handleTrack}
                className="w-full bg-indigo-100 text-indigo-700 font-semibold px-6 py-2.5 rounded-lg
                transition-all duration-200 ease-in-out
                hover:bg-indigo-200
                active:transform active:scale-95
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Track Driver
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className={`
          inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
          ${booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20' : ''}
          ${booking.status === 'Assigned' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20' : ''}
          ${booking.status === 'On the Way' ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20' : ''}
          ${booking.status === 'Arrived' ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : ''}
          ${booking.status === 'Completed' ? 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20' : ''}
        `}>
          {booking.status}
        </div>
      </div>

      {/* Track Modal */}
      {isTracking && (
        <TrackModal
          booking={booking}
          driverLocation={driverLocation}
          onClose={handleCloseTrack}
        />
      )}

      {/* Route Combinations - Updated with validation */}
      {shouldShowRouteCombinations() && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="text-lg font-semibold mb-4">Potential Route Combinations</h4>
          <div className="space-y-4">
            {otherBookings.map((otherBooking) => (
              <RouteCombinationCard
                key={otherBooking._id}
                booking1={booking}
                booking2={otherBooking}
                onCombine={onCombineRoutes}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
