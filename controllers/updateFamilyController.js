const { sql, poolPromise } = require('../config/db');

const updateFamilyMember = async (req, res) => {
  try {
    const {
      FamilyMemberID,
      OwnerID,
      Relation,
      FirstName,
      LastName,
      Age,
      DOB,
      Gender,
      Occupation,
      Income,
      ModifiedBy,
      DateModified,
    } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input('FamilyMemberID', sql.Int, FamilyMemberID)
      .input('OwnerID', sql.Int, OwnerID)
      .input('Relation', sql.NVarChar, Relation)
      .input('FirstName', sql.NVarChar, FirstName)
      .input('LastName', sql.NVarChar, LastName)
      .input('Age', sql.NVarChar, Age)
      .input('DOB', sql.NVarChar, DOB)
      .input('Gender', sql.Char, Gender)
      .input('Occupation', sql.NVarChar, Occupation)
      .input('Income', sql.NVarChar, Income)
      .input('ModifiedBy', sql.NVarChar, ModifiedBy)
      .input('DateModified', sql.DateTime, DateModified)
      .query(`
        UPDATE FamilyMember
        SET
          OwnerID = @OwnerID,
          Relation = @Relation,
          FirstName = @FirstName,
          LastName = @LastName,
          Age = @Age,
          DOB = @DOB,
          Gender = @Gender,
          Occupation = @Occupation,
          Income = @Income,
          ModifiedBy = @ModifiedBy,
          DateModified = @DateModified
        WHERE FamilyMemberID = @FamilyMemberID
      `);

    res.status(200).json({ success: true, message: 'Family member updated successfully.' });
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({ success: false, message: 'Error updating family member.', error: error.message });
  }
};

module.exports = { updateFamilyMember };