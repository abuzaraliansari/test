const { sql, poolPromise } = require("../config/db");
const fs = require('fs');
const path = require('path');

const submitComplaint = async (req, res) => {
  const {
    description,
    attachmentDoc,
    userImage,
    location,
    createdBy,
    createdDate,
    mobileNumber,
    complaintStatus,
    ipAddress,
    isAdmin,
    userID, // Ensure this line is included
    complaintType // Ensure this line is included
  } = req.body;

  console.log('Mobile Number:', mobileNumber);
  console.log('User ID:', userID);
  console.log('createdBy:', createdBy);

  let docUrl = null;
  let imageUrl = null;

  try {
    // Save the document locally
    if (attachmentDoc) {
      const docPath = path.join(__dirname, '..', 'uploads', 'docs', attachmentDoc);
      fs.writeFileSync(docPath, Buffer.from(attachmentDoc, 'base64'));
      docUrl = `http://localhost:3000/uploads/docs/${attachmentDoc}`;
    }

    // Save the image locally
    if (userImage) {
      const imagePath = path.join(__dirname, '..', 'uploads', 'images', userImage);
      fs.writeFileSync(imagePath, Buffer.from(userImage, 'base64'));
      imageUrl = `http://localhost:3000/uploads/images/${userImage}`;
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("description", sql.Text, description)
      .input("attachmentDoc", sql.VarChar, attachmentDoc)
      .input("userImage", sql.VarChar, userImage)
      .input("location", sql.VarChar, location)
      .input("createdBy", sql.NVarChar, createdBy) // Ensure createdBy is handled as a string
      .input("createdDate", sql.DateTime, createdDate)
      .input("mobileno", sql.VarChar, mobileNumber)
      .input("complaintsStatus", sql.VarChar, complaintStatus) // Corrected column name
      .input("ipAddress", sql.VarChar, ipAddress)
      .input("isAdmin", sql.Bit, isAdmin)
      .input("docUrl", sql.VarChar, docUrl)
      .input("imageUrl", sql.VarChar, imageUrl)
      .input("userID", sql.Int, userID) // Ensure this line is included
      .input("complaintType", sql.NVarChar, complaintType) // Ensure this line is included
      .query(
        "INSERT INTO Complaints (Description, AttachmentDOC, UserImage, Location, CreatedBy, CreatedDate, MobileNo, ComplaintsStatus, IPAddress, isAdmin, DocUrl, ImageUrl, UserID, ComplaintsType) OUTPUT INSERTED.ComplaintID VALUES (@description, @attachmentDoc, @userImage, @location, @createdBy, @createdDate, @mobileno, @complaintsStatus, @ipAddress, @isAdmin, @docUrl, @imageUrl, @userID, @complaintType)"
      );

    console.log("SQL Query Result:", result);

    if (result.recordset && result.recordset.length > 0) {
      const complaintID = result.recordset[0].ComplaintID;
      res.status(200).json({ success: true, message: "Complaint submitted successfully", complaintID, mobileNumber, username: createdBy });
      console.log("Complaint ID:", complaintID);
    } else {
      throw new Error("Failed to retrieve inserted complaint ID");
    }
  } catch (err) {
    console.error('Error submitting complaint:', err.message);
    res.status(500).json({ success: false, message: "Failed to submit complaint", error: err.message });
  }
};

module.exports = {
  submitComplaint,
};