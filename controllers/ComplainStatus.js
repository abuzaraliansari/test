const { sql, poolPromise } = require("../config/db");


const getComplaints = async (req, res) => {
  const { mobileNumber, createdBy, isAdmin, startDate, endDate, complaintType, complaintStatus } = req.body;

  console.log("Received mobileno:", mobileNumber);
  console.log("Received createdBy:", createdBy);
  console.log("Received isAdmin:", isAdmin);
  console.log("Received startDate:", startDate);
  console.log("Received endDate:", endDate);
  console.log("Received complaintType:", complaintType);
  console.log("Received complaintStatus:", complaintStatus);

  if (!isAdmin && (!mobileNumber || !createdBy)) {
    return res.status(400).json({ success: false, message: "mobileno or createdBy must be provided for non-admin users" });
  }

  try {
    const pool = await poolPromise;
    let query = `SELECT * FROM Complaints
                WHERE CreatedDate BETWEEN @startDate AND @endDate`;

    if (!isAdmin) {
      query += ` AND MobileNo = @mobileNumber AND CreatedBy = @createdBy`;
    }

    if (complaintType) {
      query += ` AND ComplaintsType = @complaintType`;
    }

    if (complaintStatus) {
      query += ` AND ComplaintsStatus = @complaintStatus`;
    }

    console.log("Executing query:", query);

    const result = await pool
      .request()
      .input("startDate", sql.DateTime, new Date(startDate))
      .input("endDate", sql.DateTime, new Date(endDate))
      .input("mobileNumber", sql.VarChar, mobileNumber || null)
      .input("createdBy", sql.NVarChar, createdBy || null)
      .input("complaintType", sql.NVarChar, complaintType || null)
      .input("complaintStatus", sql.NVarChar, complaintStatus || null)
      .query(query);

    console.log("Query result:", result.recordset);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching complaints:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch complaints", error: err.message });
  }
};


const getComplaintsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.body;

  console.log("Received startDate:", startDate);
  console.log("Received endDate:", endDate);

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
        `SELECT * FROM tblComplaints 
        WHERE CreatedDate BETWEEN @startDate AND @endDate`
      );

    console.log("Query result:", result.recordset);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching complaints:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch complaints", error: err.message });
  }
};

module.exports = {
  getComplaints,
  getComplaintsByDateRange,
};