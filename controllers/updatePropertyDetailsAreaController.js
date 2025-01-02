const { sql, poolPromise } = require('../config/db');

// Controller for updating a property by OwnerID
const updatePropertyDetails = async (req, res) => {
    const { PropertyDetails } = req.body;

    // Validate required fields
    if (!PropertyDetails || !PropertyDetails.ownerID) {
        return res.status(400).json({
            success: false,
            message: 'OwnerID is required in PropertyDetails'
        });
    }

    try {
        const pool = await poolPromise;

        // Perform the update query
        const result = await pool.request()
            .input('ownerID', sql.Int, PropertyDetails.ownerID)
            .input('locality', sql.Int, PropertyDetails.locality || null)
            .input('galliNumber', sql.NVarChar, PropertyDetails.galliNumber || null)
            .input('zoneID', sql.Int, PropertyDetails.zone || null)
            .input('colony', sql.NVarChar, PropertyDetails.colony || null)
            .query(`
                UPDATE Property
                SET 
                    Locality = ISNULL(@locality, Locality),
                    GalliNumber = ISNULL(@galliNumber, GalliNumber),
                    ZoneID = ISNULL(@zoneID, ZoneID),
                    Colony = ISNULL(@colony, Colony)
                WHERE OwnerID = @ownerID
            `);

        // Check if rows were affected
        if (result.rowsAffected[0] > 0) {
            res.status(200).json({
                success: true,
                message: 'Property details updated successfully for the given OwnerID'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No property found for the given OwnerID'
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
