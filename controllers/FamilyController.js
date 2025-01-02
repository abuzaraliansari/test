const { sql, poolPromise } = require('../config/db');
const familyMember = require('../models/FamilyMember');

// Controller for adding a property
const addfamilyMember = async (req, res) => {
 
    console.log(req.body);
        const { familyMember} = req.body;
    
    try {

;

        const pool = await poolPromise;

      
      

        // Insert family members into FamilyMember table (if any)
    
                await pool.request()
                    .input('ownerID', sql.Int, familyMember.ownerID)
                    .input('Relation', sql.NVarChar, familyMember.Relation)
                    .input('FirstName', sql.NVarChar, familyMember.FirstName)
                    .input('LastName', sql.NVarChar, familyMember.LastName)
                    .input('age', sql.NVarChar, familyMember.age)
                    .input('gender', sql.Char, familyMember.gender)
                    .input('occupation', sql.NVarChar, familyMember.occupation)
                    .input('createdBy', sql.NVarChar, familyMember.createdBy)
                    .input('IsActive', sql.NVarChar, familyMember.IsActive)
                    .query(`
                        INSERT INTO FamilyMember (OwnerID, Relation, FirstName, LastName, Age, Gender, Occupation, CreatedBy, IsActive)
                        VALUES (@ownerID, @Relation, @FirstName, @LastName, @age, @gender, @occupation, @createdBy,@IsActive)
                    `);
          

        
        res.status(201).json({
            success: true,
            message: 'family Member added successfully'//,
           // propertyID: propertyResult.recordset[0].PropertyID // Return the PropertyID if needed
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};


module.exports = {
    addfamilyMember
};

