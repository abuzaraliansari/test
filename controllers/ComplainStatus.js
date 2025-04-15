const { sql, poolPromise } = require("../config/db");

const getComplaints = async (req, res) => {
  const { mobileNumber, createdBy, isAdmin, startDate, endDate, complaintType, complaintStatus, zone, locality, complaintID } = req.body;


  console.log("Received mobileno:", mobileNumber);
  console.log("Received createdBy:", createdBy);
  console.log("Received isAdmin:", isAdmin);
  console.log("Received startDate:", startDate);
  console.log("Received endDate:", endDate);
  console.log("Received complaintType:", complaintType);
  console.log("Received complaintStatus:", complaintStatus);
  console.log("Received zone:", zone);
  console.log("Received locality:", locality);
  console.log("Received ComplaintID:", complaintID);

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
    if (mobileNumber) {
      query += ` AND MobileNo = @mobileNumber`;
    }

    if (complaintType) {
      query += ` AND ComplaintsType = @complaintType`;
    }

    if (complaintStatus) {
      query += ` AND ComplaintsStatus = @complaintStatus`;
    }

    if (zone) {
      query += ` AND zone = @zone`;
    }

    if (locality) {
      query += ` AND locality = @locality`;
    }

    if (complaintID) {
      query += ` AND ComplaintID = @complaintID`; // Add ComplaintID filter
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
      .input("zone", sql.NVarChar, zone || null)
      .input("locality", sql.NVarChar, locality || null)
      .input("complaintID", sql.Int, complaintID || null) // Bind ComplaintID
      .query(query);

    console.log("Query result:", result.recordset);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching complaints:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch complaints", error: err.message });
  }
};


const getUsers = async (req, res) => {
  const { zone, locality, colony, galliNumber } = req.body;

  try {
    const pool = await poolPromise;
    let query = `
      SELECT 
        u.[UserID],
        u.[Username],
        u.[MobileNo],
        u.[EmailID],
        u.[Password],
        u.[PasswordHash],
        u.[CreatedBy],
        u.[CreatedDate],
        u.[ModifiedBy],
        u.[ModifiedDate],
        po.[AdharNumber],
        p.[ZoneID],
        p.[Locality],
        p.[Colony],
        p.[GalliNumber],
        p.[HouseNumber],
        sc.[GeoLocation],
        c.[Colony] AS ColonyName,
        l.[Locality] AS LocalityName,
        l.[Zone] AS ZoneName
      FROM 
        dbo.Users u
      INNER JOIN 
        dbo.PropertyOwner po ON u.MobileNo = po.MobileNumber 
      LEFT JOIN 
        dbo.Property p ON po.OwnerID = p.OwnerID
      LEFT JOIN 
        dbo.SpecialConsideration sc ON po.OwnerID = sc.OwnerID
      LEFT JOIN 
        dbo.FileMetadata fmtd ON po.OwnerID = fmtd.OwnerID
      LEFT JOIN 
        dbo.TenantDocuments td ON po.OwnerID = td.OwnerID
      LEFT JOIN 
        dbo.Colony c ON p.Colony = c.Colony
      LEFT JOIN 
        dbo.Locality l ON c.LocalityID = l.LocalityID
      WHERE 1=1
    `;

    if (zone) {
      query += ` AND l.Zone = @zone`;
    }
    if (locality) {
      query += ` AND l.Locality = @locality`;
    }
    if (colony) {
      query += ` AND p.Colony = @colony`;
    }
    if (galliNumber) {
      query += ` AND p.GalliNumber = @galliNumber`;
    }

    const result = await pool
      .request()
      .input("zone", sql.NVarChar, zone || null)
      .input("locality", sql.NVarChar, locality || null)
      .input("colony", sql.NVarChar, colony || null)
      .input("galliNumber", sql.NVarChar, galliNumber || null)
      .query(query);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch users", error: err.message });
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
        `SELECT * FROM Complaints 
        WHERE CreatedDate BETWEEN @startDate AND @endDate`
      );

    console.log("Query result:", result.recordset);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching complaints:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch complaints", error: err.message });
  }
};

const getComplaintsLimit = async (req, res) => {
  const { mobileNumber, createdBy, isAdmin, startDate, endDate, complaintType, complaintStatus, zone, locality, complaintID, limit } = req.body;

  console.log("Received mobileno:", mobileNumber);
  console.log("Received createdBy:", createdBy);
  console.log("Received isAdmin:", isAdmin);
  console.log("Received startDate:", startDate);
  console.log("Received endDate:", endDate);
  console.log("Received complaintType:", complaintType);
  console.log("Received complaintStatus:", complaintStatus);
  console.log("Received zone:", zone);
  console.log("Received locality:", locality);
  console.log("Received ComplaintID:", complaintID);
  console.log("Received limit:", limit);

  if (!isAdmin && (!mobileNumber || !createdBy)) {
    return res.status(400).json({ success: false, message: "mobileno or createdBy must be provided for non-admin users" });
  }

  try {
    const pool = await poolPromise;
    let query = `SELECT TOP (@limit) * FROM Complaints
                WHERE CreatedDate BETWEEN @startDate AND @endDate`;

    if (!isAdmin) {
      query += ` AND MobileNo = @mobileNumber AND CreatedBy = @createdBy`;
    }
    if (mobileNumber) {
      query += ` AND MobileNo = @mobileNumber`;
    }

    if (complaintType) {
      query += ` AND ComplaintsType = @complaintType`;
    }

    if (complaintStatus) {
      query += ` AND ComplaintsStatus = @complaintStatus`;
    }

    if (zone) {
      query += ` AND zone = @zone`;
    }

    if (locality) {
      query += ` AND locality = @locality`;
    }

    if (complaintID) {
      query += ` AND ComplaintID = @complaintID`; // Add ComplaintID filter
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
      .input("zone", sql.NVarChar, zone || null)
      .input("locality", sql.NVarChar, locality || null)
      .input("complaintID", sql.Int, complaintID || null) // Bind ComplaintID
      .input("limit", sql.Int, limit || 20) // Default to 20 if limit is not provided
      .query(query);

    console.log("Query result:", result.recordset);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching complaints:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch complaints", error: err.message });
  }
};

module.exports = {
  getComplaints,
  getUsers,
  getComplaintsByDateRange,
  getComplaintsLimit,
};