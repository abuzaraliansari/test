const { response } = require('express');
const { sql, poolPromise } = require('../config/db');
const ownerDetails = require('../models/OwnerDetails');
const e = require('express');


const addOwner = async (req, res) => {

    console.log(req.body);
        const { ownerDetails} = req.body;
    
    try {
      
        //validate(); // Validate the data
        const pool = await poolPromise;
        const stringifiedDetails = {};
        Object.keys(ownerDetails).forEach((key) => {
            stringifiedDetails[key] = String(ownerDetails[key]);
        });

        // Insert owner into PropertyOwner table and get the OwnerID
        const ownerResult = await pool.request()
            .input('firstName', sql.NVarChar, stringifiedDetails.firstName)
            .input('middleName', sql.NVarChar, stringifiedDetails.middleName)
            .input('lastName', sql.NVarChar, stringifiedDetails.lastName)
            .input('FatherName', sql.NVarChar, stringifiedDetails.FatherName)
            .input('mobileNumber', sql.VarChar, stringifiedDetails.mobileNumber)
            .input('occupation', sql.NVarChar, stringifiedDetails.occupation)
            .input('age', sql.NVarChar, stringifiedDetails.age)
            .input('gender', sql.Char, stringifiedDetails.gender)
            .input('income', sql.NVarChar, stringifiedDetails.income)
            .input('religion', sql.NVarChar, stringifiedDetails.religion)
            .input('category', sql.NVarChar, stringifiedDetails.category)
            .input('createdBy', sql.NVarChar, stringifiedDetails.createdBy)
            .input('Email', sql.NVarChar, stringifiedDetails.Email)
            .input('PanNumber', sql.NVarChar, stringifiedDetails.PanNumber)
            .input('AdharNumber', sql.NVarChar, stringifiedDetails.AdharNumber)
            .input('NumberOfMembers',sql.Int, parseInt(stringifiedDetails.NumberOfMembers)) 
            .input('Cast', sql.NVarChar, stringifiedDetails.Cast)
            .input('IsActive', sql.NVarChar, stringifiedDetails.IsActive)
            .query(`
                INSERT INTO PropertyOwner (FirstName, MiddleName, LastName, FatherName, MobileNumber, Occupation, Age, Gender, Income, Religion, Category, CreatedBy, Email, PanNumber, AdharNumber, NumberOfMembers, Cast, IsActive)
                OUTPUT INSERTED.OwnerID
                VALUES (@firstName, @middleName, @lastName, @FatherName, @mobileNumber, @occupation, @age, @gender, @income, @religion, @category, @createdBy, @Email, @PanNumber, @AdharNumber, @NumberOfMembers, @Cast, @IsActive)
            `);

        if (ownerResult.recordset.length === 0) {
            return res.status(400).json({ success: false, message: 'Failed to add owner' });
        }

        const ownerID = ownerResult.recordset[0].OwnerID;
console.log(response.message);
        res.status(201).json({
            success: true,
            message: 'Owner Details added successfully',
            ownerID: ownerID // Return the PropertyID if needed
        });
    }
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, error: err.message });
//     }
// };

catch (error) {
    if (error.message.includes('Violation of UNIQUE KEY constraint')) {
        // Log the specific UNIQUE KEY constraint violation message
        console.error('Database Error:', {
            message: error.message,
            code: error.code,
        });
    } else {
        // Log other errors
        console.error('Error:', error);
    }
    return res.status(450).json({ success: false,error: error.message});
}
};


module.exports = {
    addOwner
};

