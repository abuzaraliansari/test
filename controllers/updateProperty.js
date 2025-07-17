const { sql, poolPromise } = require('../config/db');

const updateProperty = async (req, res) => {
  try {
    const {
      PropertyID,
      PropertyMode,
      PropertyAge,
      RoomCount,
      FloorCount,
      ShopCount,
      ShopArea,
      TenantYearlyRent,
      HouseNumber,
      HouseType,
      OpenArea,
      ConstructedArea,
      ModifiedBy,
      DateModified
    } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input('PropertyID', sql.Int, PropertyID)
      .input('PropertyMode', sql.NVarChar, PropertyMode)
      .input('PropertyAge', sql.NVarChar, PropertyAge)
      .input('RoomCount', sql.Int, RoomCount)
      .input('FloorCount', sql.Int, FloorCount)
      .input('ShopCount', sql.Int, ShopCount)
      .input('ShopArea', sql.NVarChar, ShopArea)
      .input('TenantYearlyRent', sql.Int, TenantYearlyRent)
      .input('HouseNumber', sql.Int, HouseNumber)
      .input('HouseType', sql.NVarChar, HouseType)
      .input('OpenArea', sql.NVarChar, OpenArea)
      .input('ConstructedArea', sql.NVarChar, ConstructedArea)
      .input('ModifiedBy', sql.NVarChar, ModifiedBy)
      .input('DateModified', sql.DateTime, DateModified)
      .query(`
        UPDATE Property
        SET
          PropertyMode = @PropertyMode,
          PropertyAge = @PropertyAge,
          RoomCount = @RoomCount,
          FloorCount = @FloorCount,
          ShopCount = @ShopCount,
          ShopArea = @ShopArea,
          TenantYearlyRent = @TenantYearlyRent,
          HouseNumber = @HouseNumber,
          HouseType = @HouseType,
          OpenArea = @OpenArea,
          ConstructedArea = @ConstructedArea,
          ModifiedBy = @ModifiedBy,
          DateModified = @DateModified
        WHERE PropertyID = @PropertyID
      `);

    res.status(200).json({ success: true, message: 'Property updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating property.', error: error.message });
  }
};

module.exports = { updateProperty };