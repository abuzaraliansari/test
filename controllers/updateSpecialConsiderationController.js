const { sql, poolPromise } = require("../config/db");

// Controller for updating special consideration
const updateSpecialConsideration = async (req, res) => {
  const { ConsiderationID, ConsiderationType, Description, ModifiedBy, DateModified } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("ConsiderationID", sql.Int, ConsiderationID)
      .input("ConsiderationType", sql.NVarChar(50), ConsiderationType)
      .input("Description", sql.NVarChar(255), Description)
      .input("ModifiedBy", sql.NVarChar(50), ModifiedBy)
      .input("DateModified", sql.DateTime, DateModified)
      .query(`
        UPDATE [dbo].[SpecialConsideration]
        SET 
          ConsiderationType = @ConsiderationType,
          Description = @Description,
          ModifiedBy = @ModifiedBy,
          DateModified = @DateModified
        WHERE ConsiderationID = @ConsiderationID
      `);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ success: true, message: "Special consideration updated successfully." });
    } else {
      res.status(404).json({ success: false, message: "Special consideration not found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
    updateSpecialConsideration,
};