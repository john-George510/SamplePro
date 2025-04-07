import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkRouteSimilarity, calculateRouteDistance } from '../../utils/routeUtils';
import { combineBooking } from '../../redux/slices/bookingSlice';
// import { combineBookings } from '../../redux/actions/bookingActions';

const RouteCombinationCard = ({ booking1, booking2 }) => {
  const dispatch = useDispatch();
  console.log('booking1', booking1);
  console.log('booking2', booking2);
  // const { combiningBookings, combineError } = useSelector(state => state.booking);
  const [addresses, setAddresses] = useState({
    pickup1: '',
    dropoff1: '',
    pickup2: '',
    dropoff2: ''
  });
  const [routeDetails, setRouteDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainRouteDistance, setMainRouteDistance] = useState(null);
  const addressCache = useRef({});

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
        addressCache.current[key] = address;
        return address;
      }
      return 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Unknown location';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch addresses
        const [pickup1Addr, dropoff1Addr, pickup2Addr, dropoff2Addr] = await Promise.all([
          reverseGeocode(booking1.pickupLocation.coordinates[0], booking1.pickupLocation.coordinates[1]),
          reverseGeocode(booking1.dropoffLocation.coordinates[0], booking1.dropoffLocation.coordinates[1]),
          reverseGeocode(booking2.pickupLocation.coordinates[0], booking2.pickupLocation.coordinates[1]),
          reverseGeocode(booking2.dropoffLocation.coordinates[0], booking2.dropoffLocation.coordinates[1])
        ]);

        setAddresses({
          pickup1: pickup1Addr,
          dropoff1: dropoff1Addr,
          pickup2: pickup2Addr,
          dropoff2: dropoff2Addr
        });

        // Calculate route details
        const mainRoute = {
          pickup: {
            latitude: booking1.pickupLocation.coordinates[1],
            longitude: booking1.pickupLocation.coordinates[0],
            address: pickup1Addr
          },
          dropoff: {
            latitude: booking1.dropoffLocation.coordinates[1],
            longitude: booking1.dropoffLocation.coordinates[0],
            address: dropoff1Addr
          }
        };

        const minorRoute = {
          pickup: {
            latitude: booking2.pickupLocation.coordinates[1],
            longitude: booking2.pickupLocation.coordinates[0],
            address: pickup2Addr
          },
          dropoff: {
            latitude: booking2.dropoffLocation.coordinates[1],
            longitude: booking2.dropoffLocation.coordinates[0],
            address: dropoff2Addr
          }
        };

        const mainRouteDist = await calculateRouteDistance([booking1.pickupLocation.coordinates, booking1.dropoffLocation.coordinates]);
        setMainRouteDistance(mainRouteDist);

        const similarity = await checkRouteSimilarity(mainRoute, minorRoute);
        console.log('similarity', similarity);
        if (similarity.isSimilar) {
          setRouteDetails(similarity.bestCombination)
        }
      } catch (error) {
        console.error('Error calculating routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [booking1, booking2]);

  const handleCombine = () => {
    dispatch(combineBooking({ booking1Id: booking1._id, booking2Id: booking2._id }));
  };

  if (loading) {
    return <div className="route-combination-card loading">Calculating route combinations...</div>;
  }

  if (!routeDetails) {
    return null;
  }

  const { order, distance } = routeDetails;
  console
  console.log('distance', distance);
  console.log('order', order);
  // console.log('description', description);
  const totalPrice = booking1.price + booking2.price;
  const savings = (booking1.price + booking2.price) * 0.1; // 10% discount for combined routes

  const getLocationName = (stop) => {
    const [longitude, latitude] = stop;
    const key = `${latitude},${longitude}`;
    return addressCache.current[key] || 'Unknown Location';
  };

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      margin: '16px 0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      backgroundColor: '#fff'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div>
            <p style={{ margin: '4px 0', fontWeight: '500' }}>Company Name:</p>
            <p style={{ margin: '4px 0' }}>{booking2.company_name}</p>
          </div>
          <div>
            <p style={{ margin: '4px 0', fontWeight: '500' }}>Main Route Distance:</p>
            <p style={{ margin: '4px 0' }}>{mainRouteDistance.toFixed(2)} km</p>
          </div>
          <div>
            <p style={{ margin: '4px 0', fontWeight: '500' }}>Combined Distance:</p>
            <p style={{ margin: '4px 0' }}>{distance.toFixed(2)} km</p>
          </div>
          <div>
            <p style={{ margin: '4px 0', fontWeight: '500' }}>Total Price:</p>
            <p style={{ margin: '4px 0' }}>₹{totalPrice.toFixed(2)}</p>
          </div>
          <div>
            <p style={{ margin: '4px 0', fontWeight: '500' }}>Potential Savings:</p>
            <p style={{ 
              margin: '4px 0', 
              color: savings > 0 ? '#2e7d32' : '#d32f2f',
              fontWeight: '600'
            }}>
              ₹{savings.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div style={{ marginTop: '16px' }}>
          <h5 style={{ 
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Suggested Route Order:
          </h5>
          <ol style={{ 
            margin: '0',
            paddingLeft: '20px',
            listStyleType: 'decimal'
          }}>
            {order?.map((stop, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                {getLocationName(stop)}
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      <button
        style={{
          width: '100%',
          padding: '10px 16px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          marginTop: '12px'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
        onClick={handleCombine}
      >
        Combine Routes
      </button>
    </div>
  );
};

export default RouteCombinationCard; 