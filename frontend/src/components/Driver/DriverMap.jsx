// frontend/src/components/Driver/DriverMap.jsx
import React, { useEffect, useState } from "react";
import socket from "../../services/socket";
import api from "../../services/api";

const DriverMap = ({ driverId }) => {
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    // Get initial location
    const fetchInitialLocation = async () => {
      try {
        const response = await api.get(`/drivers/${driverId}/location`);
        setLocation(response.data.location);
      } catch (error) {
        console.error("Error fetching initial location:", error);
      }
    };

    fetchInitialLocation();

    // Listen for location updates
    socket.on("locationUpdate", (newLocation) => {
      setLocation(newLocation);
      // Update map accordingly
    });

    // Cleanup on unmount
    return () => {
      socket.off("locationUpdate");
    };
  }, [driverId]);

  // Function to send location updates periodically
  useEffect(() => {
    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          try {
            await api.post("/tracking", {
              bookingId: currentBookingId, // Define current booking context
              location: { latitude, longitude },
            });
          } catch (error) {
            console.error("Error sending location:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    };

    const intervalId = setInterval(updateLocation, 5000); // Every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      {/* Integrate with a map library like Leaflet or Google Maps */}
      <h3>Your Current Location</h3>
      <p>Latitude: {location.latitude}</p>
      <p>Longitude: {location.longitude}</p>
      {/* Display map */}
    </div>
  );
};

export default DriverMap;
