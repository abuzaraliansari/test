const { sql, poolPromise } = require('../config/db');

// Controller for updating a family member based on OwnerID
const updateFamilyMember = async (req, res) => {
    const { ownerID, firstName, lastName, age, gender, occupation} = req.body;

    if (!ownerID) {
        return res.status(400).json({
            success: false,
            message: 'OwnerID is required'
        });
    }

    try {
        const pool = await poolPromise;

        // Update the family member directly in the controller
        const result = await pool.request()
            .input('ownerID', sql.Int, ownerID)
            .input('firstName', sql.NVarChar, firstName)
            .input('lastName', sql.NVarChar, lastName)
            .input('age', sql.NVarChar, age)
            .input('gender', sql.Char, gender)
            .input('occupation', sql.NVarChar, occupation)
            .query(`
                UPDATE FamilyMember
                SET 
                    FirstName = @firstName,
                    LastName = @lastName,
                    Age = @age,
                    Gender = @gender,
                    Occupation = @occupation
                WHERE OwnerID = @ownerID
            `);

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({
                success: true,
                message: 'Family Member updated successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No Family Member found with the given OwnerID'
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while updating the Family Member',
            error: err.message 
        });
    }
};

module.exports = {
    updateFamilyMember
};
