const { sql, poolPromise } = require('../config/db');
const SpecialConsideration = require('../models/SpecialConsideration');

// Controller for adding a special consideration
const addSpecialConsideration = async (req, res) => {
    console.log(req.body); // Debugging log

    // Destructure the incoming data from the request body
    const { ownerID,propertyID , considerationType, description, createdBy, latitude, longitude } = req.body;

    try {

        // Get database connection pool
        const pool = await poolPromise;

        // Insert into the database
        const result = await pool.request()
            .input('ownerID', sql.Int, ownerID)
            .input('PropertyID', sql.Int, propertyID)
            .input('considerationType', sql.NVarChar, considerationType)
            .input('description', sql.NVarChar, description || null)
            .input('createdBy', sql.NVarChar, createdBy)
            .input('geoLocation', sql.NVarChar, String(longitude) + ',' + String(latitude))
            //.input('IsActive', sql.NVarChar, IsActive)
            .query(`
                INSERT INTO SpecialConsideration (
                    OwnerID, PropertyID ,ConsiderationType, Description, CreatedBy, GeoLocation , DateCreated
                )
                OUTPUT INSERTED.ConsiderationID
                VALUES (
                    @ownerID, @propertyID , @considerationType, @description, @createdBy, @geoLocation , GETDATE()
                )
            `);

        // Check if insertion succeeded
        if (!result.recordset || result.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Failed to add special consideration.',
            });
        }

        const considerationID = result.recordset[0].ConsiderationID;

        // Respond with success
        res.status(201).json({
            success: true,
            message: 'Special consideration added successfully.',
            considerationID:  considerationID,
        });

    } catch (err) {
        console.error('Error adding special consideration:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: err.message,
        });
    }
};

module.exports = {
    addSpecialConsideration,
};
