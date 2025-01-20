const { sql, poolPromise } = require('../config/db');

// Controller for updating a property by PropertyID
const updatePropertyDetails = async (req, res) => {
  const { PropertyDetails } = req.body;

  // Validate required fields
  if (!PropertyDetails || !PropertyDetails.PropertyID) {
    return res.status(400).json({
      success: false,
      message: 'PropertyID is required in PropertyDetails'
    });
  }

  try {
    const pool = await poolPromise;

    // Perform the update query
    const result = await pool.request()
      .input('PropertyID', sql.Int, PropertyDetails.PropertyID)
      .input('OwnerID', sql.Int, PropertyDetails.OwnerID)
      .input('PropertyMode', sql.NVarChar, PropertyDetails.PropertyMode || null)
      .input('PropertyAge', sql.NVarChar, PropertyDetails.PropertyAge || null)
      .input('RoomCount', sql.Int, PropertyDetails.RoomCount || null)
      .input('FloorCount', sql.Int, PropertyDetails.FloorCount || null)
      .input('ShopCount', sql.Int, PropertyDetails.ShopCount || null)
      .input('ShopArea', sql.NVarChar, PropertyDetails.ShopArea || null)
      .input('TenantCount', sql.Int, PropertyDetails.TenantCount || null)
      .input('TenantYearlyRent', sql.Int, PropertyDetails.TenantYearlyRent || null)
      .input('WaterHarvesting', sql.Bit, PropertyDetails.WaterHarvesting || null)
      .input('Submersible', sql.Bit, PropertyDetails.Submersible || null)
      .input('ZoneID', sql.Int, PropertyDetails.ZoneID || null)
      .input('Locality', sql.Int, PropertyDetails.Locality || null)
      .input('Colony', sql.NVarChar, PropertyDetails.Colony || null)
      .input('GalliNumber', sql.NVarChar, PropertyDetails.GalliNumber || null)
      .input('HouseNumber', sql.Int, PropertyDetails.HouseNumber || null)
      .input('HouseType', sql.NVarChar, PropertyDetails.HouseType || null)
      .input('OpenArea', sql.NVarChar, PropertyDetails.OpenArea || null)
      .input('ConstructedArea', sql.NVarChar, PropertyDetails.ConstructedArea || null)
      .input('BankAccountNumber', sql.NVarChar, PropertyDetails.BankAccountNumber || null)
      .input('Consent', sql.Bit, PropertyDetails.Consent || null)
      .input('ModifiedBy', sql.NVarChar, PropertyDetails.ModifiedBy || null)
      .input('DateModified', sql.DateTime, PropertyDetails.DateModified || null)
      .query(`
        UPDATE Property
        SET 
          OwnerID = ISNULL(@OwnerID, OwnerID),
          PropertyMode = ISNULL(@PropertyMode, PropertyMode),
          PropertyAge = ISNULL(@PropertyAge, PropertyAge),
          RoomCount = ISNULL(@RoomCount, RoomCount),
          FloorCount = ISNULL(@FloorCount, FloorCount),
          ShopCount = ISNULL(@ShopCount, ShopCount),
          ShopArea = ISNULL(@ShopArea, ShopArea),
          TenantCount = ISNULL(@TenantCount, TenantCount),
          TenantYearlyRent = ISNULL(@TenantYearlyRent, TenantYearlyRent),
          WaterHarvesting = ISNULL(@WaterHarvesting, WaterHarvesting),
          Submersible = ISNULL(@Submersible, Submersible),
          ZoneID = ISNULL(@ZoneID, ZoneID),
          Locality = ISNULL(@Locality, Locality),
          Colony = ISNULL(@Colony, Colony),
          GalliNumber = ISNULL(@GalliNumber, GalliNumber),
          HouseNumber = ISNULL(@HouseNumber, HouseNumber),
          HouseType = ISNULL(@HouseType, HouseType),
          OpenArea = ISNULL(@OpenArea, OpenArea),
          ConstructedArea = ISNULL(@ConstructedArea, ConstructedArea),
          BankAccountNumber = ISNULL(@BankAccountNumber, BankAccountNumber),
          Consent = ISNULL(@Consent, Consent),
          ModifiedBy = ISNULL(@ModifiedBy, ModifiedBy),
          DateModified = ISNULL(@DateModified, DateModified)
        WHERE PropertyID = @PropertyID
      `);

    // Check if rows were affected
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({
        success: true,
        message: 'Property details updated successfully for the given PropertyID'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No property found for the given PropertyID'
      });
    }
  } catch (err) {
    console.error('Error updating property details:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating property details',
      error: err.message
    });
  }
};

module.exports = {
  updatePropertyDetails
};