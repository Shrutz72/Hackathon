/**
 * geoUtils.js - Geo-related utility functions for community reporting platform
 * Handles coordinate validation, distance calculations, and formatting for MongoDB/Mongoose
 */

// Constants for Earth's radius and coordinate validation
const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
const MAX_LATITUDE = 90;
const MIN_LATITUDE = -90;
const MAX_LONGITUDE = 180;
const MIN_LONGITUDE = -180;

/**
 * Validates if the given coordinates are within valid latitude/longitude ranges
 * @param {Number} latitude - Latitude in decimal degrees
 * @param {Number} longitude - Longitude in decimal degrees
 * @returns {Boolean} True if coordinates are valid
 */
const isValidCoordinates = (latitude, longitude) => {
  if (
    !Number.isFinite(latitude) || 
    !Number.isFinite(longitude) ||
    latitude > MAX_LATITUDE || 
    latitude < MIN_LATITUDE || 
    longitude > MAX_LONGITUDE || 
    longitude < MIN_LONGITUDE
  ) {
    return false;
  }
  return true;
};

/**
 * Formats coordinates into GeoJSON Point format for MongoDB storage
 * @param {Number} latitude - Latitude in decimal degrees
 * @param {Number} longitude - Longitude in decimal degrees
 * @returns {Object|null} GeoJSON Point object or null if coordinates are invalid
 */
const createGeoPoint = (latitude, longitude) => {
  if (!isValidCoordinates(latitude, longitude)) {
    return null;
  }
  
  return {
    type: "Point",
    coordinates: [longitude, latitude] // GeoJSON uses [longitude, latitude] order
  };
};

/**
 * Converts degrees to radians
 * @param {Number} degrees - Angle in degrees
 * @returns {Number} Angle in radians
 */
const degreesToRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculates the distance between two points using the Haversine formula
 * @param {Number} lat1 - Latitude of first point in decimal degrees
 * @param {Number} lon1 - Longitude of first point in decimal degrees
 * @param {Number} lat2 - Latitude of second point in decimal degrees
 * @param {Number} lon2 - Longitude of second point in decimal degrees
 * @returns {Number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!isValidCoordinates(lat1, lon1) || !isValidCoordinates(lat2, lon2)) {
    throw new Error("Invalid coordinates provided");
  }

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  
  return distance;
};

/**
 * Creates a MongoDB query for finding locations within a radius
 * @param {Number} latitude - Center latitude in decimal degrees
 * @param {Number} longitude - Center longitude in decimal degrees
 * @param {Number} radiusKm - Radius in kilometers
 * @param {String} locationField - Name of the GeoJSON field in the document
 * @returns {Object} MongoDB query object
 */
const createNearQuery = (latitude, longitude, radiusKm, locationField = 'location') => {
  if (!isValidCoordinates(latitude, longitude)) {
    throw new Error("Invalid coordinates provided");
  }
  
  return {
    [locationField]: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusKm * 1000 // Convert km to meters for MongoDB
      }
    }
  };
};

/**
 * Creates a bounding box query for MongoDB
 * @param {Number} latMin - Minimum latitude
 * @param {Number} lonMin - Minimum longitude
 * @param {Number} latMax - Maximum latitude
 * @param {Number} lonMax - Maximum longitude
 * @param {String} locationField - Name of the GeoJSON field in the document
 * @returns {Object} MongoDB query object
 */
const createBoundingBoxQuery = (latMin, lonMin, latMax, lonMax, locationField = 'location') => {
  if (
    !isValidCoordinates(latMin, lonMin) || 
    !isValidCoordinates(latMax, lonMax)
  ) {
    throw new Error("Invalid coordinates provided");
  }
  
  return {
    [locationField]: {
      $geoWithin: {
        $box: [
          [lonMin, latMin], // Bottom left [longitude, latitude]
          [lonMax, latMax]  // Top right [longitude, latitude]
        ]
      }
    }
  };
};

/**
 * Gets the center point of multiple coordinates
 * @param {Array} points - Array of [latitude, longitude] arrays
 * @returns {Array|null} [latitude, longitude] array or null if invalid input
 */
const getCenterPoint = (points) => {
  if (!Array.isArray(points) || points.length === 0) {
    return null;
  }
  
  let totalLat = 0;
  let totalLon = 0;
  let validPoints = 0;
  
  for (const point of points) {
    if (Array.isArray(point) && point.length === 2) {
      const [lat, lon] = point;
      if (isValidCoordinates(lat, lon)) {
        totalLat += lat;
        totalLon += lon;
        validPoints++;
      }
    }
  }
  
  if (validPoints === 0) {
    return null;
  }
  
  return [totalLat / validPoints, totalLon / validPoints];
};

/**
 * Encodes a geographic bounding box to a geohash
 * Simple implementation for Mongoose integration
 * @param {Number} latitude - Latitude in decimal degrees
 * @param {Number} longitude - Longitude in decimal degrees
 * @param {Number} precision - Geohash precision (1-12)
 * @returns {String} Geohash string
 */
const createGeohash = (latitude, longitude, precision = 9) => {
  if (!isValidCoordinates(latitude, longitude)) {
    throw new Error("Invalid coordinates provided");
  }
  
  // This is a placeholder - in a real implementation you would use
  // a library like 'ngeohash' or 'geohash-js'
  // Example integration:
  // return geohash.encode(latitude, longitude, precision);
  
  // For now, we'll return a dummy value to illustrate the concept
  return `geohash-${latitude.toFixed(4)}-${longitude.toFixed(4)}-${precision}`;
};

module.exports = {
  isValidCoordinates,
  createGeoPoint,
  calculateDistance,
  createNearQuery,
  createBoundingBoxQuery,
  getCenterPoint,
  createGeohash
};