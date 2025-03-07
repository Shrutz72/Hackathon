// middleware/geoValidator.js

/**
 * Middleware for validating geographic data in requests
 * Ensures that latitude, longitude, and other geo parameters are valid
 */
const geoValidator = (req, res, next) => {
    try {
      const { latitude, longitude, radius, address } = req.body;
      const errors = {};
      
      // Validate latitude if present
      if (latitude !== undefined) {
        const lat = parseFloat(latitude);
        if (isNaN(lat)) {
          errors.latitude = 'Latitude must be a valid number';
        } else if (lat < -90 || lat > 90) {
          errors.latitude = 'Latitude must be between -90 and 90 degrees';
        } else {
          // Replace with valid float value
          req.body.latitude = lat;
        }
      }
      
      // Validate longitude if present
      if (longitude !== undefined) {
        const lng = parseFloat(longitude);
        if (isNaN(lng)) {
          errors.longitude = 'Longitude must be a valid number';
        } else if (lng < -180 || lng > 180) {
          errors.longitude = 'Longitude must be between -180 and 180 degrees';
        } else {
          // Replace with valid float value
          req.body.longitude = lng;
        }
      }
      
      // Validate radius if present (for proximity searches)
      if (radius !== undefined) {
        const rad = parseFloat(radius);
        if (isNaN(rad)) {
          errors.radius = 'Radius must be a valid number';
        } else if (rad <= 0) {
          errors.radius = 'Radius must be a positive value';
        } else {
          // Replace with valid float value
          req.body.radius = rad;
        }
      }
      
      // Validate address if present
      if (address !== undefined && typeof address !== 'string') {
        errors.address = 'Address must be a valid string';
      }
      
      // Check if geolocation data is missing when required
      if (req.method === 'POST' && req.originalUrl.includes('/issues') && 
          !latitude && !longitude && !address) {
        errors.location = 'Either coordinates (latitude/longitude) or address is required';
      }
      
      // Format GeoJSON point if both latitude and longitude are provided and valid
      if (latitude !== undefined && longitude !== undefined && !errors.latitude && !errors.longitude) {
        req.body.location = {
          type: 'Point',
          coordinates: [req.body.longitude, req.body.latitude]
        };
      }
      
      // Return validation errors if any
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Geographic validation failed',
          errors
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = geoValidator;