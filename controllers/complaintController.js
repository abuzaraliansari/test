const { sql, poolPromise } = require("../config/db");

const submitComplaint = async (req, res) => {
  const {
    description,
    attachmentDoc,
    userImage,
    location,
    createdBy,
    createdDate,
    mobileno,
    emailID,
    complaintStatus,
    ipAddress,
  } = req.body;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("description", sql.Text, description)
      .input("attachmentDoc", sql.VarChar, attachmentDoc)
      .input("userImage", sql.VarChar, userImage)
      .input("location", sql.VarChar, location)
      .input("createdBy", sql.VarChar, createdBy)
      .input("createdDate", sql.DateTime, createdDate)
      .input("mobileno", sql.VarChar, mobileno)
      .input("emailID", sql.VarChar, emailID)
      .input("complaintStatus", sql.VarChar, complaintStatus)
      .input("ipAddress", sql.VarChar, ipAddress)
      .query(
        "INSERT INTO tblComplaints (Description, AttachmentDOC, UserImage, Location, CreatedBy, CreatedDate, mobileno, EmailID, ComplaintStatus, IPAddress) VALUES (@description, @attachmentDoc, @userImage, @location, @createdBy, @createdDate, @mobileno, @emailID, @complaintStatus, @ipAddress)"
      );

    res.status(200).json({ success: true, message: "Complaint submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to submit complaint", error: err.message });
  }
};

module.exports = {
  submitComplaint,
};