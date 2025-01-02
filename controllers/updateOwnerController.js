const { sql, poolPromise } = require('../config/db');

const updateOwner = async (req, res) => {
    console.log(req.body);
    const { ownerDetails } = req.body;

    if (!ownerDetails || !ownerDetails.OwnerID) {
        return res.status(400).json({ success: false, message: 'OwnerID is required to update owner details' });
    }

    try {
        const pool = await poolPromise;

        // Update owner in PropertyOwner table
        const updateResult = await pool.request()
            .input('ownerID', sql.Int, ownerDetails.OwnerID)
            .input('firstName', sql.NVarChar, ownerDetails.firstName)
            .input('middleName', sql.NVarChar, ownerDetails.middleName)
            .input('lastName', sql.NVarChar, ownerDetails.lastName)
            .input('mobileNumber', sql.VarChar, ownerDetails.mobileNumber)
            .input('occupation', sql.NVarChar, ownerDetails.occupation)
            .input('age', sql.NVarChar, ownerDetails.age)
            .input('gender', sql.Char, ownerDetails.gender)
            .input('income', sql.NVarChar, ownerDetails.income)
            .input('religion', sql.NVarChar, ownerDetails.religion)
            .input('category', sql.NVarChar, ownerDetails.category)
            .input('modifiedBy', sql.NVarChar, ownerDetails.modifiedBy)
            .input('Email', sql.NVarChar, ownerDetails.Email)
            .input('PanNumber', sql.NVarChar, ownerDetails.PanNumber)
            .input('AdharNumber', sql.NVarChar, ownerDetails.AdharNumber)
            .input('NumberOfMembers', sql.Int, ownerDetails.NumberOfMembers)
            .input('Cast', sql.NVarChar, ownerDetails.Cast)
            .query(`
                UPDATE PropertyOwner
                SET FirstName = @firstName,
                    MiddleName = @middleName,
                    LastName = @lastName,
                    MobileNumber = @mobileNumber,
                    Occupation = @occupation,
                    Age = @age,
                    Gender = @gender,
                    Income = @income,
                    Religion = @religion,
                    Category = @category,
                    ModifiedBy = @modifiedBy,
                    Email = @Email,
                    PanNumber = @PanNumber,
                    AdharNumber = @AdharNumber,
                    NumberOfMembers = @NumberOfMembers,
                    Cast = @Cast
                WHERE OwnerID = @ownerID
            `);

        if (updateResult.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Owner not found or no changes made' });
        }

        res.status(200).json({
            success: true,
            message: 'Owner details updated successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    updateOwner
};
