const { sql, poolPromise } = require('../config/db');
const PropertyDetails = require('../models/PropertyDetails');

// Controller for adding a property
const addPropertyDetails = async (req, res) => {
 
    console.log(req.body);
        const { PropertyDetails } = req.body;
    
    try {

        const pool = await poolPromise;
        await pool.request()
             .input('ownerID', sql.Int, PropertyDetails.ownerID)
            .input('propertyMode', sql.NVarChar, PropertyDetails.propertyMode)
            .input('propertyAge', sql.NVarChar, PropertyDetails.propertyAge)
            .input('roomCount', sql.Int, PropertyDetails.roomCount)
            .input('floorCount', sql.Int, PropertyDetails.floorCount)
            .input('shopCount', sql.Int, PropertyDetails.shopCount)
            .input('tenantCount', sql.Int, PropertyDetails.tenantCount)
            .input('waterHarvesting', sql.Bit, PropertyDetails.waterHarvesting)
            .input('submersible', sql.Bit, PropertyDetails.submersible)
            .input('geoLocation', sql.NVarChar, PropertyDetails.geoLocation)
            .input('Locality', sql.NVarChar, PropertyDetails.Locality)
            .input('houseNumber', sql.NVarChar, PropertyDetails.houseNumber)
            .input('galliNumber', sql.NVarChar, PropertyDetails.galliNumber)
            .input('bankAccountNumber', sql.VarChar, PropertyDetails.bankAccountNumber)
            .input('consent', sql.Bit, PropertyDetails.consent)
            .input('createdBy', sql.NVarChar, PropertyDetails.createdBy)
            .input('Zone', sql.NVarChar, PropertyDetails.Zone)
            .input('Colony', sql.NVarChar, PropertyDetails.Colony)
            .input('IsActive', sql.NVarChar, PropertyDetails.IsActive)
            .query(`
                INSERT INTO Property (
                    OwnerID, PropertyMode, PropertyAge, RoomCount, FloorCount, 
                    ShopCount, TenantCount, WaterHarvesting, Submersible, 
                    GeoLocation, Locality, HouseNumber, GalliNumber, 
                    BankAccountNumber, Consent, CreatedBy, Zone, Colony, IsActive
                )
                    OUTPUT INSERTED.PropertyID
                VALUES (
                    @ownerID, @propertyMode, @propertyAge, @roomCount, @floorCount,
                    @shopCount, @tenantCount, @waterHarvesting, @submersible,
                    @geoLocation, @Locality, @houseNumber, @galliNumber,
                    @bankAccountNumber, @consent, @createdBy, @Zone, @Colony, @IsActive
                )
            `);

        res.status(201).json({
            success: true,
            message: 'PropertyDetails added successfully',
          // Return the PropertyID if needed
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};


module.exports = {
    addPropertyDetails
};

