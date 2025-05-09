const { sql, poolPromise } = require("../config/db");
const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");
const fs = require("fs");

// Azure Blob Storage Configuration
const AZURE_STORAGE_ACCOUNT_NAME = "babraladoc";
const AZURE_STORAGE_CONTAINER_NAME = "babrala";
const AZURE_STORAGE_SAS_TOKEN = "sv=2024-11-04&ss=bfqt&srt=c&sp=rwdlacupiytfx&se=2025-04-28T21:41:35Z&st=2025-04-28T13:41:35Z&spr=https,http&sig=AvUrob6ysf35Aw...";

const uploadToAzureBlob = async (filePath, fileName) => {
  try {
    const blobServiceClient = new BlobServiceClient(
      `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net?${AZURE_STORAGE_SAS_TOKEN}`
    );
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    const fileStream = fs.createReadStream(filePath);
    const fileStats = fs.statSync(filePath);

    await blockBlobClient.uploadStream(fileStream, fileStats.size, 5, {
      blobHTTPHeaders: { blobContentType: "application/octet-stream" },
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading to Azure Blob Storage:", error.message);
    throw error;
  }
};

const submitFiles = async (req, res) => {
  const { userID, complaintID, createdBy } = req.body;
  const attachmentDoc = req.files && req.files["attachmentDoc"] ? req.files["attachmentDoc"][0].filename : null;
  const userImage = req.files && req.files["userImage"] ? req.files["userImage"][0].filename : null;

  let docUrl = null;
  let imageUrl = null;
  let docID = null;
  let imageID = null;

  try {
    const pool = await poolPromise;

    // Save the document to Azure Blob Storage and in the database
    if (attachmentDoc) {
      const docPath = path.join(__dirname, "..", "uploads", attachmentDoc);
      docUrl = await uploadToAzureBlob(docPath, `documents/${attachmentDoc}`);

      const docResult = await pool
        .request()
        .input("UserID", sql.Int, userID)
        .input("ComplaintID", sql.Int, complaintID)
        .input("DocUrl", sql.NVarChar, docUrl)
        .input("DocName", sql.NVarChar, attachmentDoc)
        .input("CreatedBy", sql.NVarChar, createdBy)
        .query(
          "INSERT INTO ComplainDoc (UserID, ComplaintID, DocUrl, DocName, CreatedBy) OUTPUT INSERTED.DocID VALUES (@UserID, @ComplaintID, @DocUrl, @DocName, @CreatedBy)"
        );

      if (docResult.recordset && docResult.recordset.length > 0) {
        docID = docResult.recordset[0].DocID;
        console.log("Document ID:", docID);
      } else {
        throw new Error("Failed to retrieve inserted document ID");
      }
    }

    // Save the image to Azure Blob Storage and in the database
    if (userImage) {
      const imagePath = path.join(__dirname, "..", "uploads", userImage);
      imageUrl = await uploadToAzureBlob(imagePath, `images/${userImage}`);

      const imageResult = await pool
        .request()
        .input("UserID", sql.Int, userID)
        .input("ComplaintID", sql.Int, complaintID)
        .input("ImageUrl", sql.NVarChar, imageUrl)
        .input("ImageName", sql.NVarChar, userImage)
        .input("CreatedBy", sql.NVarChar, createdBy)
        .query(
          "INSERT INTO ComplainImage (UserID, ComplaintID, ImageUrl, ImageName, CreatedBy) OUTPUT INSERTED.ImageID VALUES (@UserID, @ComplaintID, @ImageUrl, @ImageName, @CreatedBy)"
        );

      if (imageResult.recordset && imageResult.recordset.length > 0) {
        imageID = imageResult.recordset[0].ImageID;
        console.log("Image ID:", imageID);
      } else {
        throw new Error("Failed to retrieve inserted image ID");
      }
    }

    res.status(200).json({ success: true, docID, imageID });
  } catch (err) {
    console.error("Error submitting files:", err.message);
    res.status(500).json({ success: false, message: "Failed to submit files", error: err.message });
  }
};

module.exports = {
  submitFiles,
};