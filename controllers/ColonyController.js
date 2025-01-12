const { sql, poolPromise } = require("../config/db");

// Controller for adding a property
const GetColony = async (req, res) => {
  console.log(req.body);
  const { LocalityID } = req.body;

  try {
    const pool = await poolPromise;

    // Insert family members into FamilyMember table (if any)

    const localityResult = await pool.request().input("LocalityID", sql.Int, LocalityID)
      .query(`SELECT [ColonyID],[Colony]  FROM [dbo].[Colony]
                        WHERE LocalityID = @LocalityID`);
console.log(localityResult.recordsets[0]);
    res.status(201).json({
      locality: localityResult.recordsets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
  

//Controller for adding a colony
const AddColony = async (req, res) => {
  console.log(req.body);
  const { Colony, LocalityID } = req.body;

  if (!Colony || !LocalityID) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: Colony and LocalityID.",
    });
  }

  try {
    const pool = await poolPromise;

    // Fetch the Locality based on the provided LocalityID
    const localityResult = await pool
      .request()
      .input("LocalityID", sql.Int, LocalityID)
      .query(
        `SELECT [Locality] FROM [dbo].[Locality] WHERE [LocalityID] = @LocalityID`
      );

    if (localityResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "LocalityID not found.",
      });
    }

    const Locality = localityResult.recordset[0].Locality;

    // Insert the new Colony record
    const insertResult = await pool
      .request()
      .input("Colony", sql.NVarChar(255), Colony)
      .input("LocalityID", sql.Int, LocalityID)
      .input("Locality", sql.NVarChar(255), Locality)
      .query(
        `INSERT INTO [dbo].[Colony] ([Colony], [LocalityID], [Locality])
         VALUES (@Colony, @LocalityID, @Locality)`
      );

    res.status(201).json({
      success: true,
      message: "Colony added successfully.",
      rowsAffected: insertResult.rowsAffected,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
    GetColony,
    AddColony,
};