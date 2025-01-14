const { response } = require('express');
const { sql, poolPromise } = require('../config/db');

const updateOwner = async (req, res) => {
  try {
    const {
      OwnerID,
      FirstName,
      MiddleName,
      LastName,
      FatherName,
      MobileNumber,
      Occupation,
      Age,
      DOB,
      Gender,
      Income,
      Religion,
      Category,
      AdharNumber,
      PanNumber,
      Email,
      NumberOfMembers,
      ModifiedBy,
      DateModified,
    } = req.body;

    const pool = await poolPromise;

    console.log('Received owner details:', req.body);

    await pool.request()
      .input('OwnerID', sql.Int, OwnerID)
      .input('FirstName', sql.NVarChar, FirstName)
      .input('MiddleName', sql.NVarChar, MiddleName)
      .input('LastName', sql.NVarChar, LastName)
      .input('FatherName', sql.NVarChar, FatherName)
      .input('MobileNumber', sql.VarChar, MobileNumber)
      .input('Occupation', sql.NVarChar, Occupation)
      .input('Age', sql.NVarChar, Age)
      .input('DOB', sql.NVarChar, DOB)
      .input('Gender', sql.Char, Gender)
      .input('Income', sql.NVarChar, Income)
      .input('Religion', sql.NVarChar, Religion)
      .input('Category', sql.NVarChar, Category)
      .input('AdharNumber', sql.NVarChar, AdharNumber)
      .input('PanNumber', sql.NVarChar, PanNumber)
      .input('Email', sql.NVarChar, Email)
      .input('NumberOfMembers', sql.Int, NumberOfMembers)
      .input('ModifiedBy', sql.NVarChar, ModifiedBy)
      .input('DateModified', sql.DateTime, DateModified)
      .query(`
        UPDATE PropertyOwner
        SET
          FirstName = @FirstName,
          MiddleName = @MiddleName,
          LastName = @LastName,
          FatherName = @FatherName,
          MobileNumber = @MobileNumber,
          Occupation = @Occupation,
          Age = @Age,
          DOB = @DOB,
          Gender = @Gender,
          Income = @Income,
          Religion = @Religion,
          Category = @Category,
          AdharNumber = @AdharNumber,
          PanNumber = @PanNumber,
          Email = @Email,
          NumberOfMembers = @NumberOfMembers,
          ModifiedBy = @ModifiedBy,
          DateModified = @DateModified
        WHERE OwnerID = @OwnerID
      `);
console.log('Owner details updated successfully.', response.message);
    res.status(200).json({ success: true, message: 'Owner details updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating owner details.', error: error.message });
  }
};

module.exports = { updateOwner };