const { sql, poolPromise } = require("../config/db");

const getComplaints = async (req, res) => {
  const { mobileno, createdBy } = req.body; // Get data from the body instead of query parameters

  console.log("Received mobileno:", mobileno);
  console.log("Received createdBy:", createdBy);
  

  if (!mobileno && !createdBy) {
    return res.status(400).json({ success: false, message: "mobileno or createdBy must be provided" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("mobileno", sql.VarChar, mobileno || '')
      .input("createdBy", sql.VarChar, createdBy || '')
      .query(
        `SELECT 
          [CategoryID],
          [Description],
          [AttachmentDOC],
          [UserImage],
          [Location],
          [CreatedBy],
          [CreatedDate],
          [mobileno],
          [EmailID],
          [ComplaintStatus],
          [IPAddress]
        FROM tblComplaints 
        WHERE (@mobileno = '' OR mobileno = @mobileno) 
        OR (@createdBy = '' OR CreatedBy = @createdBy)`
      );

    console.log("Query result:", result.recordset);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching complaints:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch complaints", error: err.message });
  }
};

const getAllComplaintsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: "startDate and endDate must be provided" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("startDate", sql.DateTime, new Date(startDate))
      .input("endDate", sql.DateTime, new Date(endDate))
      .query(
        `SELECT 
          [CategoryID],
          [Description],
          [AttachmentDOC],
          [UserImage],
          [Location],
          [CreatedBy],
          [CreatedDate],
          [mobileno],
          [EmailID],
          [ComplaintStatus],
          [IPAddress]
        FROM tblComplaints 
        WHERE CreatedDate BETWEEN @startDate AND @endDate`
      );

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching complaints:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch complaints", error: err.message });
  }
};

module.exports = {
  getComplaints,
};
