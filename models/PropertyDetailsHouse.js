const { sql, poolPromise } = require('../config/db');

const PropertyDetailsHouse = {
  updatePropertyDetails: async ({
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
  }) => {
    try {
      const pool = await poolPromise;

      // Execute the update query
      const result = await pool.request()
        .input('PropertyID', sql.Int, propertyID)
        .input('PropertyMode', sql.NVarChar, propertyMode)
        .input('PropertyAge', sql.NVarChar, propertyAge)
        .input('RoomCount', sql.Int, roomCount)
        .input('FloorCount', sql.Int, floorCount)
        .input('ShopCount', sql.Int, shopCount)
        .input('TenantCount', sql.Int, tenantCount)
        .input('WaterHarvesting', sql.Bit, waterHarvesting)
        .input('Submersible', sql.Bit, submersible)
        .input('HouseType', sql.NVarChar, HouseType)
        .input('OpenArea', sql.NVarChar, OpenArea)
        .input('ConstructedArea', sql.NVarChar, ConstructedArea)
        .input('IsActive', sql.Bit, IsActive)
     
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
            WaterHarvesting = @WaterHarvesting,
            Submersible = @Submersible,
        
            HouseNumber = @HouseNumber,
            BankAccountNumber = @BankAccountNumber,
            Consent = @Consent,
            HouseType = @HouseType,
            OpenArea = @OpenArea,
            ConstructedArea = @ConstructedArea,
            IsActive = @IsActive
          WHERE PropertyID = @PropertyID;
        `);

      return result.rowsAffected[0]; // Return the number of rows affected
    } catch (error) {
      console.error('Error in updatePropertyDetails:', error);
      throw error;
    }
  },
};

module.exports = PropertyDetailsHouse;
