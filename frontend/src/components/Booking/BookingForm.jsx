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

const BookingForm = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.user.token);
  const createStatus = useSelector((state) => state.bookings.createStatus);
  const bookingError = useSelector((state) => state.bookings.error);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleLocationChange = (type, location) => {
    setFormData(prev => ({
      ...prev,
      [type]: location
    }));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            pickupLocation: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setFormData((prev) => ({
            ...prev,
            pickupLocation: { latitude: 40.7128, longitude: -74.006 },
          }));
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
      source: formData.pickupLocation,
      source_latitude: formData.pickupLocation.latitude,
      source_longitude: formData.pickupLocation.longitude,
      company_name: formData.companyName,
      destination: formData.dropoffLocation,
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
        <h3>Create a Booking</h3>
        <div className="form-group">
          <h4>Pickup Location</h4>
          {formData.pickupLocation ? (
            <MapPicker
              label="Pickup Location"
              onSelectLocation={(location) => handleLocationChange('pickupLocation', location)}
              initialLocation={formData.pickupLocation}
            />
          ) : (
            <p>Loading pickup location...</p>
          )}
        </div>
        <div className="form-group">
          <h4>Dropoff Location</h4>
          <MapPicker
            label="Dropoff Location"
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
