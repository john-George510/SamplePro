import * as turf from "@turf/turf";

const isPointOnRoute = async (point, route, tolerance = 50000) => {
  const line = turf.lineString(route);
  const pt = turf.point(point);
  const distance = turf.pointToLineDistance(pt, line, { units: "meters" });
  return distance <= tolerance;
};

// Reverse geocoding to get the address of a point
export const reverseGeocode = async (longitude, latitude) => {
  const key = `${latitude},${longitude}`;
  // if (addressCache.current[key]) {
  //   return addressCache.current[key];
  // }
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${"pk.eyJ1IjoiYWRpdHJhbWRhcyIsImEiOiJjbTJoZTVpa20wN2F3MmpzM3F2a2M3ZWNxIn0.ePD_ugk2QndekxDHx3ryhA"}`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const address = data.features[0].place_name;
      // addressCache.current[key] = address;
      return address;
    }
    return 'Unknown location';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Unknown location';
  }
};

// Calculate distance between two points using Mapbox Directions API
export const calculateRouteDistance = async (coordinates) => {
  try {
    const coordinatesString = coordinates
      .map(coord => `${coord[0]},${coord[1]}`)
      .join(';');
    console.log('Coordinates string:', coordinatesString);
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?geometries=geojson&access_token=${"pk.eyJ1IjoiYWRpdHJhbWRhcyIsImEiOiJjbTJoZTVpa20wN2F3MmpzM3F2a2M3ZWNxIn0.ePD_ugk2QndekxDHx3ryhA"}`;
    // console.log('Requesting URL:', url);
    
    const response = await fetch(url);
    // console.log('Response status:', response.status);
    // console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // console.log('Response data:', data);
    
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].distance / 1000; // Convert meters to kilometers
    }
    throw new Error('No routes found in response');
  } catch (error) {
    console.error('Error calculating route distance:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return null;
  }
};

// Check if a point is within a certain distance of a line segment
const isPointNearLine = (point, lineStart, lineEnd, maxDistance) => {
  const [px, py] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  // Calculate the distance from point to line segment
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= maxDistance;
};

// Check if two routes are similar or overlapping
export const checkRouteSimilarity = async (mainRoute, minorRoute, maxDeviation = 50) => {
  const { pickup: mainPickup, dropoff: mainDropoff } = mainRoute;
  const { pickup: minorPickup, dropoff: minorDropoff } = minorRoute;

  const p1 = [mainPickup.longitude, mainPickup.latitude];
  const d1 = [mainDropoff.longitude, mainDropoff.latitude];
  const p2 = [minorPickup.longitude, minorPickup.latitude];
  const d2 = [minorDropoff.longitude, minorDropoff.latitude];

  const mainRouteDistance = await calculateRouteDistance([p1, d1]);
  const minorRouteDistance = await calculateRouteDistance([p2, d2]);

  // Check if minor pickup & dropoff are on the main route
  // const isPickupOnRoute = await isPointOnRoute(p2, [p1, d1], 100000); // 50km tolerance
  // const isDropoffOnRoute = await isPointOnRoute(d2, [p1, d1], 200000); // 50km tolerance

  // if (isPickupOnRoute && isDropoffOnRoute) {
  //   console.log(`Minor route is fully contained within the main route.`);
  //   return { isSimilar: true, bestCombination: { order: [p1, p2, d2, d1], distance: mainRouteDistance } };
  // }

  // Compute additional distance if minor route is included
  const distanceWithMinor = await calculateRouteDistance([p1, p2, d2, d1]);
  const extraDistance = distanceWithMinor - mainRouteDistance;

  console.log(`Extra distance added: ${extraDistance} km`);

  return {
    isSimilar: extraDistance <= maxDeviation,
    bestCombination: extraDistance <= maxDeviation ? { order: [p1, p2, d2, d1], distance: distanceWithMinor } : null
  };
};

// Calculate combined route details
export const calculateCombinedRoute = async (mainRoute, minorRoute) => {
  const { pickup: mainPickup, dropoff: mainDropoff } = mainRoute;
  const { pickup: minorPickup, dropoff: minorDropoff } = minorRoute;

  // Convert coordinates to [longitude, latitude] format
  const p1 = [mainPickup.longitude, mainPickup.latitude];
  const d1 = [mainDropoff.longitude, mainDropoff.latitude];
  const p2 = [minorPickup.longitude, minorPickup.latitude];
  const d2 = [minorDropoff.longitude, minorDropoff.latitude];

  // Find the optimal order of stops
  const combinations = [
    {
      order: [p1, d1, p2, d2],
      description: 'Main route then minor route'
    },
    {
      order: [p1, p2, d1, d2],
      description: 'Main pickup, minor pickup, main dropoff, minor dropoff'
    },
    {
      order: [p1, p2, d2, d1],
      description: 'Main pickup, minor route, main dropoff'
    }
  ];

  let bestRoute = null;
  let shortestDistance = Infinity;

  for (const combo of combinations) {
    const distance = await calculateRouteDistance(combo.order);
    if (distance && distance <= 200 && distance < shortestDistance) {
      shortestDistance = distance;
      bestRoute = {
        ...combo,
        distance
      };
    }
  }

  return bestRoute;
}; 