const { sql, poolPromise } = require('../config/db');

const updatePropertyDetailsHouse = async (req, res) => {
  try {
    // Extract data from the request body
    const {
      ownerID,
      propertyMode,
      propertyAge,
      roomCount,
      floorCount,
      shopCount,
      tenantCount,
      TenantYearlyRent,
      waterHarvesting,
      submersible,
      houseNumber,
      bankAccountNumber,
      consent,
      HouseType,
      OpenArea,
      ConstructedArea,
    } = req.body;

    // Validate required fields
    if (!ownerID) {
      return res.status(400).json({ error: 'OwnerID is required' });
    }

    const pool = await poolPromise;

    // Execute the update query
    const result = await pool.request()
      .input('OwnerID', sql.Int, ownerID)
      .input('PropertyMode', sql.NVarChar, propertyMode)
      .input('PropertyAge', sql.NVarChar, propertyAge)
      .input('RoomCount', sql.Int, roomCount)
      .input('FloorCount', sql.Int, floorCount)
      .input('ShopCount', sql.Int, shopCount)
      .input('TenantCount', sql.Int, tenantCount)
      .input('TenantYearlyRent', sql.Int, TenantYearlyRent)
      .input('WaterHarvesting', sql.Bit, waterHarvesting)
      .input('Submersible', sql.Bit, submersible)
      .input('HouseType', sql.NVarChar, HouseType)
      .input('OpenArea', sql.NVarChar, OpenArea)
      .input('ConstructedArea', sql.NVarChar, ConstructedArea)
      .input('HouseNumber', sql.Int, houseNumber)
      .input('BankAccountNumber', sql.NVarChar, bankAccountNumber)
      .input('Consent', sql.Bit, consent)
      .query(`
        UPDATE Property
        SET 
          PropertyMode = @PropertyMode,
          PropertyAge = @PropertyAge,
          RoomCount = @RoomCount,
          FloorCount = @FloorCount,
          ShopCount = @ShopCount,
          TenantCount = @TenantCount,
          TenantYearlyRent = @TenantYearlyRent,
          WaterHarvesting = @WaterHarvesting,
          Submersible = @Submersible,
          HouseType = @HouseType,
          OpenArea = @OpenArea,
          ConstructedArea = @ConstructedArea,
          HouseNumber = @HouseNumber,
          BankAccountNumber = @BankAccountNumber,
          Consent = @Consent
        WHERE OwnerID = @OwnerID;
      `);

    // Check if the update was successful
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: 'Property details updated successfully' });
    } else {
      res.status(404).json({ error: 'Property not found or no changes made' });
    }
  } catch (error) {
    console.error('Error in updatePropertyDetailsController:', error);
    res.status(500).json({ error: 'An error occurred while updating property details' });
  }
};

module.exports = updatePropertyDetailsHouse;
