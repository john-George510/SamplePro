import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking } from '../../redux/slices/bookingSlice';
import MapPicker from '../common/MapPicker';

const BookingForm = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.user.token);
  const bookingStatus = useSelector((state) => state.bookings.status);
  const bookingError = useSelector((state) => state.bookings.error);

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
    } else {
      setFormData((prev) => ({
        ...prev,
        pickupLocation: { latitude: 40.7128, longitude: -74.006 },
      }));
    }
  }, []);

  useEffect(() => {
    if (bookingStatus === 'succeeded') {
      setFormData(initialState);
      setFormData((prev) => ({
        ...prev,
        pickupLocation: { latitude: 40.7128, longitude: -74.006 },
        dropoffLocation: null,
      }));
    }
  }, [bookingStatus]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

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
      insurance_supported: formData.insuranceSupported,
      expiration_time: formData.expirationTime,
      created_at: new Date().toISOString(),
    };

    dispatch(createBooking(bookingData));
  };

  return (
    <div className="booking-form-container">
      <form onSubmit={handleSubmit}>
        <h3>Create a Booking</h3>
        <div className="form-group">
          <h4>Pickup Location</h4>
          {formData.pickupLocation ? (
            <MapPicker
              label="Pickup Location"
              onSelectLocation={(loc) =>
                setFormData((prev) => ({ ...prev, pickupLocation: loc }))
              }
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
            onSelectLocation={(loc) =>
              setFormData((prev) => ({ ...prev, dropoffLocation: loc }))
            }
            initialLocation={formData.dropoffLocation}
          />
        </div>

        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Lorry Type:</label>
          <select name="lorryType" value={formData.lorryType} onChange={handleChange}>
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
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Material Type:</label>
          <select name="materialType" value={formData.materialType} onChange={handleChange}>
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
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Refrigeration Required:</label>
          <input
            type="checkbox"
            name="refrigerationRequired"
            checked={formData.refrigerationRequired}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Fragile Handling:</label>
          <input
            type="checkbox"
            name="fragile"
            checked={formData.fragile}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Expiration Time:</label>
          <input
            type="datetime-local"
            name="expirationTime"
            value={formData.expirationTime}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Create Booking</button>
        {bookingStatus === 'failed' && <p className="error-message">{bookingError}</p>}
      </form>
    </div>
  );
};

export default BookingForm;
