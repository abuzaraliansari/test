const { sql, poolPromise } = require('../config/db');
const PropertyDetailsModel = require('../models/PropertyDetailsHouse');

const PropertyDetailsHouseController = {
  update: async (req, res) => {
    try {
        console.log('Received request body:', req.body);
      const {
        propertyID,
        propertyMode,
        propertyAge,
        roomCount,
        floorCount,
        shopCount,
        tenantCount,
        waterHarvesting,
        submersible,
        houseNumber,
        bankAccountNumber,
        consent,
        HouseType,
        OpenArea,
        ConstructedArea,
        IsActive,
      } = req.body;

      // Validate required fields
      if (!propertyID || !propertyMode) {
        return res.status(400).json({
          success: false,
          message: 'PropertyID, PropertyMode, and UpdatedBy are required.',
        });
      }

      // Update the property details using the model
      const rowsAffected = await PropertyDetailsModel.updatePropertyDetails({
        propertyID,
        propertyMode,
        propertyAge,
        roomCount,
        floorCount,
        shopCount,
        tenantCount,
        waterHarvesting,
        submersible,
       
        houseNumber,
        bankAccountNumber,
        consent,
        HouseType,
        OpenArea,
        ConstructedArea,
        IsActive,
        
      });
console.log('Rows affected:', rowsAffected);
      // Check if the update was successful
      if (rowsAffected > 0) {
        return res.status(200).json({
          success: true,
          message: 'Property details updated successfully.',
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Property not found or no changes made.',
        });
      }
    } catch (error) {
      console.error('Error updating property details:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  },
};

module.exports = PropertyDetailsHouseController;
