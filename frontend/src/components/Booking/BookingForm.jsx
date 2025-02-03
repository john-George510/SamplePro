import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking } from '../../redux/slices/bookingSlice';
import MapPicker from '../common/MapPicker';

const BookingForm = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.user.token);
  const bookingStatus = useSelector((state) => state.bookings.status);
  const bookingError = useSelector((state) => state.bookings.error);

  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [lorryType, setLorryType] = useState('small');
  const [quantity, setQuantity] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [pricePerTonne, setPricePerTonne] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [insuranceSupported, setInsuranceSupported] = useState(false);
  const [expirationHours, setExpirationHours] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPickupLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setPickupLocation({ latitude: 40.7128, longitude: -74.006 });
        }
      );
    } else {
      setPickupLocation({ latitude: 40.7128, longitude: -74.006 });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickupLocation || !dropoffLocation) {
      alert('Please select both pickup and dropoff locations.');
      return;
    }
    if (!token) {
      alert('You must be logged in to create a booking.');
      return;
    }

    const bookingData = {
      source: pickupLocation,
      source_latitude: pickupLocation.latitude,
      source_longitude: pickupLocation.longitude,
      company_name: companyName,
      destination: dropoffLocation,
      destination_latitude: dropoffLocation.latitude,
      destination_longitude: dropoffLocation.longitude,
      lorry_type: lorryType,
      quantity: parseFloat(quantity),
      material_type: materialType,
      price_per_tonne: parseFloat(pricePerTonne) || 70,
      expected_amount: parseFloat(expectedAmount) || 80,
      insurance_supported: insuranceSupported,
      expiration_hours: expirationHours,
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
          {pickupLocation ? (
            <MapPicker
              label="Pickup Location"
              onSelectLocation={setPickupLocation}
              initialLocation={pickupLocation}
            />
          ) : (
            <p>Loading pickup location...</p>
          )}
        </div>
        <div className="form-group">
          <h4>Dropoff Location</h4>
          <MapPicker
            label="Dropoff Location"
            onSelectLocation={setDropoffLocation}
            initialLocation={dropoffLocation}
          />
        </div>
        
        <div className="form-group">
          <label>Company Name</label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Lorry Type:</label>
          <select value={lorryType} onChange={(e) => setLorryType(e.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div className="form-group">
          <label>Quantity (tonnes):</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Material Type:</label>
          <select value={materialType} onChange={(e) => setMaterialType(e.target.value)}>
            <option value="Agricultural products">Agricultural products</option>
            <option value="Rubber products">Rubber products</option>
            <option value="Wood">Wood</option>
            <option value="Machinery new or old">Machinery new or old</option>
            <option value="Cement">Cement</option>
            <option value="Steel">Steel</option>
          </select>
          {/* <input type="text" value={materialType} onChange={(e) => setMaterialType(e.target.value)} /> */}
        </div>
        {/* <div className="form-group">
          <label>Price Per Tonne:</label>
          <input type="number" value={pricePerTonne} onChange={(e) => setPricePerTonne(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Expected Amount:</label>
          <input type="number" value={expectedAmount} onChange={(e) => setExpectedAmount(e.target.value)} />
        </div> */}
        <div className="form-group">
          <label>Insurance Supported:</label>
          <input type="checkbox" checked={insuranceSupported} onChange={(e) => setInsuranceSupported(e.target.checked)} />
        </div>
        <div className="form-group">
          <label>Expiration Hours:</label>
          <input type="text" value={expirationHours} onChange={(e) => setExpirationHours(e.target.value)} />
        </div>
        <button type="submit">Create Booking</button>
        {bookingStatus === 'failed' && <p className="error-message">{bookingError}</p>}
        {bookingStatus === 'succeeded' && <p className="success-message">Booking created successfully!</p>}
      </form>
    </div>
  );
};

export default BookingForm;