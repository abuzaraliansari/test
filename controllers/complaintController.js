const { sql, poolPromise } = require("../config/db");
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

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
    colony
  } = req.body;

  const attachmentDoc = req.files && req.files['attachmentDoc'] ? req.files['attachmentDoc'][0].filename : null;
  const userImage = req.files && req.files['userImage'] ? req.files['userImage'][0].filename : null;

  console.log('Mobile Number:', mobileNumber);
  console.log('User ID:', userID);
  console.log('createdBy:', createdBy);

  let docUrl = null;
  let imageUrl = null;
  let docID = null;
  let imageID = null;

  try {
    const pool = await poolPromise;

    // Save the document locally and in the database
    if (attachmentDoc) {
      const docPath = path.join(__dirname, '..', 'uploads', attachmentDoc);
      docUrl = `http://localhost:3000/uploads/${attachmentDoc}`;

      const docResult = await pool
        .request()
        .input("UserID", sql.Int, userID)
        .input("DocUrl", sql.NVarChar, docUrl)
        .input("DocName", sql.NVarChar, attachmentDoc)
        .input("DocPath", sql.NVarChar, docPath)
        .input("DocSize", sql.Int, fs.statSync(docPath).size)
        .input("CreatedBy", sql.NVarChar, createdBy)
        .query(
          "INSERT INTO ComplainDoc (UserID, DocUrl, DocName, DocPath, DocSize, CreatedBy) OUTPUT INSERTED.DocID VALUES (@UserID, @DocUrl, @DocName, @DocPath, @DocSize, @CreatedBy)"
        );

      if (docResult.recordset && docResult.recordset.length > 0) {
        docID = docResult.recordset[0].DocID;
      } else {
        throw new Error("Failed to retrieve inserted document ID");
      }
    }

    // Save the image locally and in the database
    if (userImage) {
      const imagePath = path.join(__dirname, '..', 'uploads', userImage);
      imageUrl = `http://localhost:3000/uploads/${userImage}`;

      const imageResult = await pool
        .request()
        .input("UserID", sql.Int, userID)
        .input("ImageUrl", sql.NVarChar, imageUrl)
        .input("ImageName", sql.NVarChar, userImage)
        .input("ImagePath", sql.NVarChar, imagePath)
        .input("ImageSize", sql.Int, fs.statSync(imagePath).size)
        .input("CreatedBy", sql.NVarChar, createdBy)
        .query(
          "INSERT INTO ComplainImage (UserID, ImageUrl, ImageName, ImagePath, ImageSize, CreatedBy) OUTPUT INSERTED.ImageID VALUES (@UserID, @ImageUrl, @ImageName, @ImagePath, @ImageSize, @CreatedBy)"
        );

      if (imageResult.recordset && imageResult.recordset.length > 0) {
        imageID = imageResult.recordset[0].ImageID;
      } else {
        throw new Error("Failed to retrieve inserted image ID");
      }
    }

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
      .input("docUrl", sql.VarChar, docUrl)
      .input("imageUrl", sql.VarChar, imageUrl)
      .input("userID", sql.Int, userID)
      .input("complaintType", sql.NVarChar, complaintType)
      .input("zoneID", sql.Int, zoneID)
      .input("localityID", sql.Int, localityID)
      .input("colony", sql.NVarChar, colony)
      .input("docID", sql.Int, docID)
      .input("imageID", sql.Int, imageID)
      .query(
        "INSERT INTO Complaints (Description, Location, CreatedBy, CreatedDate, MobileNo, ComplaintsStatus, IPAddress, isAdmin, DocUrl, ImageUrl, UserID, ComplaintsType, ZoneID, LocalityID, Colony, DocID, ImageID) OUTPUT INSERTED.ComplaintID VALUES (@description, @location, @createdBy, @createdDate, @mobileno, @complaintsStatus, @ipAddress, @isAdmin, @docUrl, @imageUrl, @userID, @complaintType, @zoneID, @localityID, @colony, @docID, @imageID)"
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

module.exports = {
  submitComplaint,
  updateComplaintStatus,
};