import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking, resetBookingStatus } from '../../redux/slices/bookingSlice';
import MapPicker from '../common/MapPicker';

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'var(--success)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 style={{ 
          color: 'var(--text)',
          marginBottom: '12px',
          fontSize: '24px'
        }}>Booking Created!</h3>
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          fontSize: '16px'
        }}>Your booking has been successfully created.</p>
        <button
          onClick={onClose}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    return data.address || {};
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {};
  }
};

const getFuelPrice = async (state) => {
  try {
    console.log('Fetching fuel price for state:', state);
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://www.cardekho.com/fuel-price')}`)
    console.log('Response status:', response);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    const html = await response.text();
    // console.log('Fetched HTML:', html);

    // presnt as json of {contents: '...'}
    const jsonResponse = JSON.parse(html);
    const content = jsonResponse.contents;
    // console.log('Parsed HTML content:', content);
    if (!content) throw new Error('No content found in the response');

    const searchText = state.replace(' ','-').toLowerCase();

    console.log('Searching for state:', searchText);
    
    const regex = new RegExp(
        `<a href="https://www.cardekho.com/[^"]*-${searchText}-state"[^>]*>[^<]*</a></td><td>₹ ([0-9.]+)</td>`,
        "i"
    );
    
    const match = content.match(regex);
    
    return match ? `₹ ${match[1]}` : `Price not found for ${state}`;
  } catch (error) {
    console.error('Error fetching fuel price:', error);
    return 'Fuel price data unavailable';
  }
};

const BookingForm = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.user.token);
  const createStatus = useSelector((state) => state.bookings.createStatus);
  const bookingError = useSelector((state) => state.bookings.error);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pickupLocationName, setPickupLocationName] = useState('');
  const [dropoffLocationName, setDropoffLocationName] = useState('');
  const [fuelPrice, setFuelPrice] = useState('Loading fuel price...');
  const [fuelPriceState, setFuelPriceState] = useState('Your state');

  const initialState = {
    pickupLocation: null,
    dropoffLocation: null,
    companyName: '',
    lorryType: 'small',
    quantity: '',
    materialType: '',
    pricePerTonne: '',
    expectedAmount: '',
    refrigerationRequired: false,
    fragile: false,
    insuranceSupported: false,
    expirationTime: '',
  };

  const [formData, setFormData] = useState(initialState);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocationChange = async (type, location) => {
    setFormData(prev => ({
      ...prev,
      [type]: location
    }));

    // Get location name
    try {
      const address = await reverseGeocode(location.latitude, location.longitude);
      const locationName = address.city || address.town || address.village || 
                          address.county || address.state || 'Unknown location';
      
      if (type === 'pickupLocation') {
        setPickupLocationName(locationName);

        // Try to get fuel price if we have state info
        if (address.state) {
          setFuelPriceState(address.state);
          const price = await getFuelPrice(address.state);
          setFuelPrice(price);
        }
      } else {
        setDropoffLocationName(locationName);
      }
    } catch (error) {
      console.error('Error getting location name:', error);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          setFormData((prev) => ({
            ...prev,
            pickupLocation: location,
          }));

          // Get location name for pickup
          try {
            const address = await reverseGeocode(location.latitude, location.longitude);
            const locationName = address.city || address.town || address.village || 
                                address.county || address.state || 'Unknown location';
            setPickupLocationName(locationName);

            if (address.state) {
              setFuelPriceState(address.state);
              const price = await getFuelPrice(address.state);
              setFuelPrice(price);
            }
          } catch (error) {
            console.error('Error getting location name:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          const defaultLocation = { latitude: 40.7128, longitude: -74.006 };
          setFormData((prev) => ({
            ...prev,
            pickupLocation: defaultLocation,
          }));
          setPickupLocationName('New York');
          setFuelPrice('₹ 96.76'); // Default NY fuel price
        }
      );
    }
  }, []);

  useEffect(() => {
    dispatch(resetBookingStatus());
    return () => {
      dispatch(resetBookingStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (createStatus === 'succeeded') {
      setShowSuccessModal(true);
      setFormData(initialState);
      dispatch(resetBookingStatus());
    }
  }, [createStatus, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pickupLocation || !formData.dropoffLocation) {
      alert('Please select both pickup and dropoff locations.');
      return;
    }
    if (!token) {
      alert('You must be logged in to create a booking.');
      return;
    }

    const bookingData = {
      source: pickupLocationName || 'Unknown location',
      source_latitude: formData.pickupLocation.latitude,
      source_longitude: formData.pickupLocation.longitude,
      company_name: formData.companyName,
      destination: dropoffLocationName || 'Unknown location',
      destination_latitude: formData.dropoffLocation.latitude,
      destination_longitude: formData.dropoffLocation.longitude,
      lorry_type: formData.lorryType,
      quantity: parseFloat(formData.quantity),
      material_type: formData.materialType,
      price_per_tonne: parseFloat(formData.pricePerTonne) || 70,
      expected_amount: parseFloat(formData.expectedAmount) || 80,
      refrigeration_required: formData.refrigerationRequired,
      fragile: formData.fragile,
      insurance_supported: formData.insuranceSupported,
      expiration_time: formData.expirationTime,
      created_at: new Date().toISOString(),
    };

    dispatch(createBooking(bookingData));
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    dispatch(resetBookingStatus());
  };

  return (
    <div className="booking-form-container" style={{
      padding: '0 16px',
      width: '100%'
    }}>
      <form onSubmit={handleSubmit} style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        width: '100%'
      }}>
        <h3 
          style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '20px',
            color: 'var(--text)'
          }} 
        >Create a Booking</h3>
        
        <div style={{
          margin: '24px 0',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          borderLeft: '4px solid var(--primary)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          ':hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
          }
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              backgroundColor: 'var(--primary)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <div>
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                marginBottom: '4px'
              }}>
                {`Fuel Price in ${fuelPriceState}`}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {fuelPrice}
                <span style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: 'var(--text-secondary)',
                  marginLeft: '4px'
                }}>
                  (per liter)
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <h4
            style={{
              marginBottom: '10px',
              fontSize: '18px',
              fontWeight: '500',
              color: 'var(--text)'
            }}
          >Pickup Location {pickupLocationName && `(${pickupLocationName})`}</h4>
          {formData.pickupLocation ? (
            <MapPicker
              label=""
              onSelectLocation={(location) => handleLocationChange('pickupLocation', location)}
              initialLocation={formData.pickupLocation}
            />
          ) : (
            <p>Loading pickup location...</p>
          )}
        </div>
        
        <div className="form-group">
          <h4
            style={{
              marginBottom: '10px',
              fontSize: '18px',
              fontWeight: '500',
              color: 'var(--text)'
            }}>Dropoff Location {dropoffLocationName && `(${dropoffLocationName})`}</h4>
          <MapPicker
            label=""
            onSelectLocation={(location) => handleLocationChange('dropoffLocation', location)}
            initialLocation={formData.dropoffLocation}
          />
        </div>
        
        <div className="form-group">
          <label>Company Name</label>
          <input 
            type="text" 
            name="companyName"
            value={formData.companyName} 
            onChange={handleInputChange} 
          />
        </div>

        <div className="form-group">
          <label>Lorry Type:</label>
          <select 
            name="lorryType"
            value={formData.lorryType} 
            onChange={handleInputChange}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="form-group">
          <label>Quantity (tonnes):</label>
          <input 
            type="number" 
            name="quantity"
            value={formData.quantity} 
            onChange={handleInputChange} 
          />
        </div>

        <div className="form-group">
          <label>Material Type:</label>
          <select 
            name="materialType"
            value={formData.materialType} 
            onChange={handleInputChange}
          >
            <option value="">Select Material Type</option>
            <option value="Agricultural products">Agricultural products</option>
            <option value="Rubber products">Rubber products</option>
            <option value="Wood">Wood</option>
            <option value="Machinery new or old">Machinery new or old</option>
            <option value="Cement">Cement</option>
            <option value="Steel">Steel</option>
          </select>
        </div>

        <div className="form-group">
          <label>Insurance Supported:</label>
          <input 
            type="checkbox" 
            name="insuranceSupported"
            checked={formData.insuranceSupported} 
            onChange={handleInputChange} 
          />
        </div>
        
        <div className="form-group">
          <label>Refrigeration Required:</label>
          <input 
            type="checkbox" 
            name="refrigerationRequired"
            checked={formData.refrigerationRequired} 
            onChange={handleInputChange} 
          />
        </div>

        <div className="form-group">
          <label>Fragile Handling:</label>
          <input 
            type="checkbox" 
            name="fragile"
            checked={formData.fragile} 
            onChange={handleInputChange} 
          />
        </div>

        <div className="form-group">
          <label>Expiration Time:</label>
          <input 
            type="datetime-local" 
            name="expirationTime"
            value={formData.expirationTime} 
            onChange={handleInputChange} 
          />
        </div>

        <button type="submit">Create Booking</button>
        {createStatus === 'failed' && <p className="error-message">{bookingError}</p>}
        {createStatus === 'succeeded' && <p className="success-message">Booking created successfully!</p>}
      </form>
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleModalClose} 
      />
    </div>
  );
};

export default BookingForm;