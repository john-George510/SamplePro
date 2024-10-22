// src/components/Driver/DriverAssignments.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAssignments,
  acceptAssignment,
} from '../../redux/slices/driverSlice';
import Button from '../common/Button';

const DriverAssignments = () => {
  const dispatch = useDispatch();
  const assignments = useSelector((state) => state.driver.assignments);
  const status = useSelector((state) => state.driver.status);
  const error = useSelector((state) => state.driver.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAssignments());
    }
  }, [status, dispatch]);

  const handleAccept = (assignmentId) => {
    dispatch(acceptAssignment(assignmentId));
  };

  if (status === 'loading') return <p>Loading assignments...</p>;
  if (status === 'failed') return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Available Assignments</h2>
      {assignments.length === 0 ? (
        <p>No assignments available</p>
      ) : (
        <ul>
          {assignments.map((assignment) => (
            <li key={assignment._id}>
              <p>
                Pickup: {assignment.pickupLocation.latitude},{' '}
                {assignment.pickupLocation.longitude}
              </p>
              <p>
                Drop-off: {assignment.dropoffLocation.latitude},{' '}
                {assignment.dropoffLocation.longitude}
              </p>
              <Button onClick={() => handleAccept(assignment._id)}>
                Accept
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DriverAssignments;
