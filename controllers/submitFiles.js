const { sql, poolPromise } = require("../config/db");
const fs = require('fs');
const path = require('path');

const submitFiles = async (req, res) => {
  const { userID, complaintID, createdBy } = req.body;
  const attachmentDoc = req.files && req.files['attachmentDoc'] ? req.files['attachmentDoc'][0].filename : null;
  const userImage = req.files && req.files['userImage'] ? req.files['userImage'][0].filename : null;

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
        .input("ComplaintID", sql.Int, complaintID)
        .input("DocUrl", sql.NVarChar, docUrl)
        .input("DocName", sql.NVarChar, attachmentDoc)
        .input("DocPath", sql.NVarChar, docPath)
        .input("DocSize", sql.Int, fs.statSync(docPath).size)
        .input("CreatedBy", sql.NVarChar, createdBy)
        .query(
          "INSERT INTO ComplainDoc (UserID, ComplaintID, DocUrl, DocName, DocPath, DocSize, CreatedBy) OUTPUT INSERTED.DocID VALUES (@UserID, @ComplaintID, @DocUrl, @DocName, @DocPath, @DocSize, @CreatedBy)"
        );

      if (docResult.recordset && docResult.recordset.length > 0) {
        docID = docResult.recordset[0].DocID;
        console.log('Document ID:', docID);
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
        .input("ComplaintID", sql.Int, complaintID)
        .input("ImageUrl", sql.NVarChar, imageUrl)
        .input("ImageName", sql.NVarChar, userImage)
        .input("ImagePath", sql.NVarChar, imagePath)
        .input("ImageSize", sql.Int, fs.statSync(imagePath).size)
        .input("CreatedBy", sql.NVarChar, createdBy)
        .query(
          "INSERT INTO ComplainImage (UserID, ComplaintID, ImageUrl, ImageName, ImagePath, ImageSize, CreatedBy) OUTPUT INSERTED.ImageID VALUES (@UserID, @ComplaintID, @ImageUrl, @ImageName, @ImagePath, @ImageSize, @CreatedBy)"
        );

      if (imageResult.recordset && imageResult.recordset.length > 0) {
        imageID = imageResult.recordset[0].ImageID;
        console.log('Image ID:', imageID);
      } else {
        throw new Error("Failed to retrieve inserted image ID");
      }
    }

    res.status(200).json({ success: true, docID, imageID });
  } catch (err) {
    console.error('Error submitting files:', err.message);
    res.status(500).json({ success: false, message: "Failed to submit files", error: err.message });
  }
};

module.exports = {
  submitFiles,
};