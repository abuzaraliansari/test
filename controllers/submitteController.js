const { sql, poolPromise } = require("../config/db");

// Controller to update IsActive to 1 for all related tables by OwnerID
const UpdateIsActive = async (req, res) => {
  const { OwnerID } = req.body;

  if (!OwnerID) {
    return res.status(400).json({ success: false, message: "OwnerID is required." });
  }

  try {
    const pool = await poolPromise;

    // Update IsActive field in PropertyOwner table
    await pool.request()
      .input("OwnerID", sql.Int, OwnerID)
      .query(`
        UPDATE [dbo].[PropertyOwner]
        SET [IsActive] = 1
        WHERE [OwnerID] = @OwnerID;
      `);

    // Update IsActive field in FamilyMember table
    await pool.request()
      .input("OwnerID", sql.Int, OwnerID)
      .query(`
        UPDATE [dbo].[FamilyMember]
        SET [IsActive] = 1
        WHERE [OwnerID] = @OwnerID;
      `);

    // Update IsActive field in Property table
    await pool.request()
      .input("OwnerID", sql.Int, OwnerID)
      .query(`
        UPDATE [dbo].[Property]
        SET [IsActive] = 1
        WHERE [OwnerID] = @OwnerID;
      `);

    // Update IsActive field in SpecialConsideration table
    await pool.request()
      .input("OwnerID", sql.Int, OwnerID)
      .query(`
        UPDATE [dbo].[SpecialConsideration]
        SET [IsActive] = 1
        WHERE [OwnerID] = @OwnerID;
      `);

    // Update IsActive field in FileMetadata table
    await pool.request()
      .input("OwnerID", sql.Int, OwnerID)
      .query(`
        UPDATE [dbo].[FileMetadata]
        SET [IsActive] = 1
        WHERE [OwnerID] = @OwnerID;
      `);

    res.status(200).json({ success: true, message: "IsActive updated to 1 for all related records." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  UpdateIsActive,
};
