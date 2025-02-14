// utils/distanceCalculator.js
export const calculateDistance = (start, end) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(end.lat - start.lat);
  const dLon = toRad(end.lon - start.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(start.lat)) * Math.cos(toRad(end.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};
