const { sql, poolPromise } = require("../config/db");

// Controller for fetching colony details by LocalityID
const GetColony = async (req, res) => {
  console.log(req.body);
  const { LocalityID } = req.body;

  try {
    const pool = await poolPromise;

    // Query to fetch colony details
    const colonyResult = await pool.request()
      .input("LocalityID", sql.Int, LocalityID)
      .query(`
        SELECT [ColonyID], [Colony] 
        FROM [dbo].[Colony]
        WHERE LocalityID = @LocalityID
      `);

    res.status(201).json({
      colony: colonyResult.recordsets[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  GetColony,
};

