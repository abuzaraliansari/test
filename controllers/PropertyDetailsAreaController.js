const { sql, poolPromise } = require('../config/db');
const PropertyDetails1 = require('../models/PropertyDetails1');
const { getMaxHouseNumber } = require('./HouseController')

// Controller for adding a property
const addPropertyDetails1 = async (req, res) => {
 
    console.log(req.body);
        const { PropertyDetails } = req.body;
    
    try {
        
         newHouseNumber  =0;
       
        const pool = await poolPromise;
              
        console.log(newHouseNumber);   
               
               
                // Query to get the maximum house number for the selected colony

                // update from ZONe, and all
                const result = await pool.request()
                    .input('Colony', sql.NVarChar, PropertyDetails.colony)
                    .query(`
                        SELECT MAX(HouseNumber) AS TopHouseNumber
                        FROM Property
                        WHERE Colony = @Colony
                    `);
                  console.log('called'); 
                
                const topHouseNumber = result.recordset[0].TopHouseNumber; // Get the highest number
                 newHouseNumber = topHouseNumber + 1; // Increment the house number
     
           
       
        console.log(newHouseNumber);
     
        const propertyResult = await pool.request()
             .input('ownerID', sql.Int, PropertyDetails.ownerID)
            .input('Locality', sql.Int, PropertyDetails.locality)
            .input('galliNumber', sql.NVarChar, PropertyDetails.galliNumber)
            .input('createdBy', sql.NVarChar, PropertyDetails.createdBy)
            .input('ZoneID', sql.Int, PropertyDetails.zone)
            .input('Colony', sql.NVarChar, PropertyDetails.colony)
            .query(`
                INSERT INTO Property (
                    OwnerID, Locality, GalliNumber, CreatedBy, ZoneID, Colony
                    )
                    OUTPUT INSERTED.PropertyID
                VALUES (
                    @ownerID, @Locality, @galliNumber, @createdBy, @ZoneID, @Colony
                )
            `);
console.log(propertyResult.recordset[0].PropertyID);
        res.status(201).json({
            success: true,
            propertyID: propertyResult.recordset[0].PropertyID,
            HouseNumber: newHouseNumber,
            message: 'Propertyzone added successfully',
          // Return the PropertyID if needed
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};


module.exports = {
    addPropertyDetails1
};

