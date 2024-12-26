const { sql, poolPromise } = require("../config/db");

// Controller for adding a property
const GetLocality = async (req, res) => {
  console.log(req.body);
  const { ZoneID } = req.body;

  try {
    const pool = await poolPromise;

    // Insert family members into FamilyMember table (if any)

    const localityResult = await pool.request().input("ZoneID", sql.Int, ZoneID)
      .query(`SELECT [LocalityID]  , [Locality]  FROM [dbo].[Locality]
                        WHERE ZoneID = @ZoneID`);
console.log(localityResult.recordsets[0]);
    res.status(201).json({
      locality: localityResult.recordsets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  GetLocality,
};
