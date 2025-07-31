const { sql, poolPromise } = require('../config/db');

// Controller for adding a property
const addPropertyDetails = async (req, res) => {
    try {
         console.log("addPropertyDetails API called");
        console.log("Request body:", req.body);
        const { propertyDetails } = req.body; // propertyDetails from UI

        const pool = await poolPromise;
        const result = await pool.request()
            .input('OwnerID', sql.Int, propertyDetails.ownerID)
            .input('PropertyMode', sql.NVarChar(50), propertyDetails.propertyMode)
            .input('PrePropertyNo', sql.NVarChar(100), propertyDetails.prePropertyNo || null)
            .input('PropertyAge', sql.NVarChar(50), propertyDetails.propertyAge)
            .input('RoomCount', sql.Int, propertyDetails.roomCount)
            .input('FloorCount', sql.Int, propertyDetails.floorCount)
            .input('ShopCount', sql.Int, propertyDetails.shopCount)
            .input('ShopArea', sql.NVarChar(50), propertyDetails.ShopArea || null)
            .input('TenantCount', sql.Int, propertyDetails.tenantCount)
            .input('TenantYearlyRent', sql.Int, propertyDetails.TenantYearlyRent)
            .input('WaterHarvesting', sql.Bit, propertyDetails.waterHarvesting)
            .input('Submersible', sql.Bit, propertyDetails.submersible)
            .input('ZoneID', sql.Int, propertyDetails.zone)
            .input('Locality', sql.Int, propertyDetails.locality)
            .input('Colony', sql.NVarChar(100), propertyDetails.colony)
            .input('GalliNumber', sql.NVarChar(20), propertyDetails.galliNumber)
            .input('HouseNumber', sql.Int, propertyDetails.houseNumber)
            .input('RoadSize', sql.NVarChar(100), propertyDetails.RoadSize || null)
            .input('HouseType', sql.NVarChar(40), propertyDetails.HouseType || null)
            .input('OpenArea', sql.NVarChar(40), propertyDetails.OpenArea || null)
            .input('ConstructedArea', sql.NVarChar(20), propertyDetails.ConstructedArea || null)
            .input('BankAccountNumber', sql.VarChar(20), propertyDetails.bankAccountNumber || null)
            .input('Consent', sql.Bit, propertyDetails.consent)
            .input('CreatedBy', sql.NVarChar(50), propertyDetails.CreatedBy)
            .input('IsActive', sql.Bit, propertyDetails.IsActive == null ? 1 : propertyDetails.IsActive)
            .input('GeoLocation', sql.NVarChar(100), propertyDetails.GeoLocation || null) // <-- Add this line
            .query(`
                INSERT INTO Property (
                    OwnerID, PropertyMode, PrePropertyNo, PropertyAge, RoomCount, FloorCount, ShopCount, ShopArea,
                    TenantCount, TenantYearlyRent, WaterHarvesting, Submersible, ZoneID, Locality, Colony, GalliNumber,
                    HouseNumber, RoadSize, HouseType, OpenArea, ConstructedArea, BankAccountNumber, Consent, CreatedBy, IsActive, GeoLocation
                )
                OUTPUT INSERTED.PropertyID
                VALUES (
                    @OwnerID, @PropertyMode, @PrePropertyNo, @PropertyAge, @RoomCount, @FloorCount, @ShopCount, @ShopArea,
                    @TenantCount, @TenantYearlyRent, @WaterHarvesting, @Submersible, @ZoneID, @Locality, @Colony, @GalliNumber,
                    @HouseNumber, @RoadSize, @HouseType, @OpenArea, @ConstructedArea, @BankAccountNumber, @Consent, @CreatedBy, @IsActive, @GeoLocation
                )
            `);

         const insertedPropertyID = result.recordset[0].PropertyID;
        console.log("PropertyDetails added successfully. PropertyID:", insertedPropertyID);

        res.status(201).json({
            success: true,
            message: 'PropertyDetails added successfully',
            propertyID: insertedPropertyID
        });

    } catch (err) {
        console.error("Error in addPropertyDetails:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    addPropertyDetails
};