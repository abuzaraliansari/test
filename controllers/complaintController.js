const { sql, poolPromise } = require("../config/db");
const fs = require('fs');
const path = require('path');

const submitComplaint = async (req, res) => {
  const {
    description,
    location,
    createdBy,
    createdDate,
    mobileNumber,
    complaintStatus,
    ipAddress,
    isAdmin,
    userID,
    complaintType,
    zoneID,
    localityID,
    colony,
    locality,
    zone
  } = req.body;

  try {
    const pool = await poolPromise;

    // Insert the complaint into the Complaints table
    const result = await pool
      .request()
      .input("description", sql.Text, description)
      .input("location", sql.VarChar, location)
      .input("createdBy", sql.NVarChar, createdBy)
      .input("createdDate", sql.DateTime, createdDate)
      .input("mobileno", sql.VarChar, mobileNumber)
      .input("complaintsStatus", sql.VarChar, complaintStatus)
      .input("ipAddress", sql.VarChar, ipAddress)
      .input("isAdmin", sql.Bit, isAdmin)
      .input("userID", sql.Int, userID)
      .input("complaintType", sql.NVarChar, complaintType)
      .input("zoneID", sql.Int, zoneID)
      .input("localityID", sql.Int, localityID)
      .input("colony", sql.NVarChar, colony)
      .input("locality", sql.NVarChar, locality)
      .input("zone", sql.NVarChar, zone)
      .query(
        "INSERT INTO Complaints (Description, Location, CreatedBy, CreatedDate, MobileNo, ComplaintsStatus, IPAddress, isAdmin, UserID, ComplaintsType, ZoneID, LocalityID, Colony, locality, zone) OUTPUT INSERTED.ComplaintID VALUES (@description, @location, @createdBy, @createdDate, @mobileno, @complaintsStatus, @ipAddress, @isAdmin, @userID, @complaintType, @zoneID, @localityID, @colony, @locality, @zone)"
      );

    console.log("SQL Query Result:", result);

    if (result.recordset && result.recordset.length > 0) {
      const complaintID = result.recordset[0].ComplaintID;
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = String(currentDate.getFullYear()).slice(-2);
      const complaintTypeCode = complaintStatus === 'Open' ? '1' : '0';
      const complaintRegistrationNo = `${month}${year}/${complaintTypeCode}/${zoneID}/${localityID}/${complaintID}`;

      // Update the complaint with the generated ComplaintRegistrationNo
      await pool
        .request()
        .input("complaintID", sql.Int, complaintID)
        .input("complaintRegistrationNo", sql.NVarChar, complaintRegistrationNo)
        .query(
          "UPDATE Complaints SET ComplaintRegistrationNo = @complaintRegistrationNo WHERE ComplaintID = @complaintID"
        );

      console.log("Complaint Registration No:", complaintRegistrationNo);
      res.status(200).json({ success: true, complaintID, complaintRegistrationNo });
    } else {
      throw new Error("Failed to retrieve inserted complaint ID");
    }
  } catch (err) {
    console.error('Error submitting complaint:', err.message);
    res.status(500).json({ success: false, message: "Failed to submit complaint", error: err.message });
  }
};


const updateComplaintStatus = async (req, res) => {
  const { complaintno, status, modifiedBy } = req.body;

  console.log("Received complaintno:", complaintno);
  console.log("Received status:", status);
  console.log("Received modifiedBy:", modifiedBy);

  if (!complaintno || !status || !modifiedBy) {
    return res.status(400).json({ success: false, message: "complaintno, status, and modifiedBy must be provided" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("complaintno", sql.Int, complaintno)
      .input("status", sql.NVarChar, status)
      .input("modifiedBy", sql.NVarChar, modifiedBy)
      .input("dateModified", sql.DateTime, new Date())
      .query(
        `UPDATE Complaints
         SET ComplaintsStatus = @status,
             ModifiedBy = @modifiedBy,
             ModifiedDate = @dateModified
         WHERE ComplaintID = @complaintno`
      );

    console.log("Update result:", result);

    res.status(200).json({ success: true, message: "Complaint status updated successfully" });
  } catch (err) {
    console.error("Error updating complaint status:", err.message);
    res.status(500).json({ success: false, message: "Failed to update complaint status", error: err.message });
  }
};


const updateComplaintStatusOpen = async (req, res) => {
  const { complaintno, status, modifiedBy } = req.body;

  console.log("Received complaintno:", complaintno);
  console.log("Received status:", status);
  console.log("Received modifiedBy:", modifiedBy);

  if (!complaintno || !status || !modifiedBy) {
    return res.status(400).json({ success: false, message: "complaintno, status, and modifiedBy must be provided" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("complaintno", sql.Int, complaintno)
      .input("status", sql.NVarChar, status)
      .input("modifiedBy", sql.NVarChar, modifiedBy)
      .input("dateModified", sql.DateTime, new Date())
      .query(
        `UPDATE Complaints
         SET ComplaintsStatus = @status,
             ModifiedBy = @modifiedBy,
             ModifiedDate = @dateModified
         WHERE ComplaintID = @complaintno`
      );

    console.log("Update result:", result);

    res.status(200).json({ success: true, message: "Complaint status updated successfully" });
  } catch (err) {
    console.error("Error updating complaint status:", err.message);
    res.status(500).json({ success: false, message: "Failed to update complaint status", error: err.message });
  }
};

module.exports = {
  submitComplaint,
  updateComplaintStatus,
  updateComplaintStatusOpen
};