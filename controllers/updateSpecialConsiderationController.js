const { sql, poolPromise } = require('../config/db');

// Controller for updating a special consideration by OwnerID
const updateSpecialConsideration = async (req, res) => {
    const { ownerID, propertyID, considerationType, description} = req.body;

    // Validate required fields
    if (!ownerID) {
        return res.status(400).json({
            success: false,
            message: 'OwnerID is required for updating special consideration.',
        });
    }

    try {
        // Get database connection pool
        const pool = await poolPromise;

        // Perform the update query
        const result = await pool.request()
            .input('ownerID', sql.Int, ownerID)
            .input('propertyID', sql.Int, propertyID || null)
            .input('considerationType', sql.NVarChar, considerationType || null)
            .input('description', sql.NVarChar, description || null)
             .query(`
                UPDATE SpecialConsideration
                SET 
                    ConsiderationType = ISNULL(@considerationType, ConsiderationType),
                    Description = ISNULL(@description, Description)
                WHERE OwnerID = @ownerID
            `);

        // Check if rows were affected
        if (result.rowsAffected[0] > 0) {
            res.status(200).json({
                success: true,
                message: 'Special consideration updated successfully for the given OwnerID.',
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No special consideration found for the given OwnerID.',
            });
        }
    } catch (err) {
        console.error('Error updating special consideration:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: err.message,
        });
    }
};

module.exports = {
    updateSpecialConsideration,
};
