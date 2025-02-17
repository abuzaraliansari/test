const { sql, poolPromise } = require("../config/db");

const getComplaintsByDateRange = async (req, res) => {
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
  getComplaintsByDateRange,
  getAllComplaintsByDateRange,
};