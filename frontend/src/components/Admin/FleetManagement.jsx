import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllVehicles } from '../../redux/slices/fleetSlice';

const FleetManagement = () => {
  const dispatch = useDispatch();
  const vehicles = useSelector((state) => state.fleet.vehicles);
  const status = useSelector((state) => state.fleet.status);
  const error = useSelector((state) => state.fleet.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAllVehicles());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <p>Loading vehicles...</p>;
  if (status === 'failed') return <p>Error: {error}</p>;

  return (
    <div>
      <h3>Fleet Management</h3>
      <ul>
        {vehicles.map((vehicle) => (
          <li key={vehicle._id}>
            Type: {vehicle.type} - License Plate: {vehicle.licensePlate} -
            Capacity: {vehicle.capacity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FleetManagement;
