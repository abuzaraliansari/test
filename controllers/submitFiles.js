const { sql, poolPromise } = require("../config/db");
const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");
const fs = require("fs");

// Azure Blob Storage Configuration
const AZURE_STORAGE_ACCOUNT_NAME = "babraladoc";
const AZURE_STORAGE_CONTAINER_NAME = "babrala";
const AZURE_STORAGE_SAS_TOKEN = "sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-05-13T18:54:48Z&st=2025-05-13T10:54:48Z&spr=https,http&sig=6GWYJmEnQDk2dsMBzoUKALH5PhNsL2s%2FgorJApQRvfk%3D";

const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net?${AZURE_STORAGE_SAS_TOKEN}`
);

const uploadToAzureBlob = async (filePath, fileName) => {
  try {
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

  try {
    const pool = await poolPromise;

    // Save the document to Azure Blob Storage
    if (attachmentDoc) {
      const docPath = path.join(__dirname, "..", "uploads", attachmentDoc);
      docUrl = await uploadToAzureBlob(docPath, `documents/${attachmentDoc}`);
      await pool
        .request()
        .input("UserID", sql.Int, userID)
        .input("ComplaintID", sql.Int, complaintID)
        .input("DocUrl", sql.NVarChar, docUrl)
        .input("DocName", sql.NVarChar, attachmentDoc)
        .input("CreatedBy", sql.NVarChar, createdBy)
        .query(
          "INSERT INTO ComplainDoc (UserID, ComplaintID, DocUrl, DocName, CreatedBy) VALUES (@UserID, @ComplaintID, @DocUrl, @DocName, @CreatedBy)"
        );
    }

    // Save the image to Azure Blob Storage
    if (userImage) {
      const imagePath = path.join(__dirname, "..", "uploads", userImage);
      imageUrl = await uploadToAzureBlob(imagePath, `images/${userImage}`);
      await pool
        .request()
        .input("UserID", sql.Int, userID)
        .input("ComplaintID", sql.Int, complaintID)
        .input("ImageUrl", sql.NVarChar, imageUrl)
        .input("ImageName", sql.NVarChar, userImage)
        .input("CreatedBy", sql.NVarChar, createdBy)
        .query(
          "INSERT INTO ComplainImage (UserID, ComplaintID, ImageUrl, ImageName, CreatedBy) VALUES (@UserID, @ComplaintID, @ImageUrl, @ImageName, @CreatedBy)"
        );
    }

    res.status(200).json({ success: true, docUrl, imageUrl });
  } catch (err) {
    console.error("Error submitting files:", err.message);
    res.status(500).json({ success: false, message: "Failed to submit files", error: err.message });
  }
};

const getFiles = async (req, res) => {
  const { complaintID } = req.body; // Change from req.query to req.body

  try {
    const pool = await poolPromise;

    const docResult = await pool
      .request()
      .input("ComplaintID", sql.Int, complaintID)
      .query("SELECT DocUrl, DocName FROM ComplainDoc WHERE ComplaintID = @ComplaintID");

    const imageResult = await pool
      .request()
      .input("ComplaintID", sql.Int, complaintID)
      .query("SELECT ImageUrl, ImageName FROM ComplainImage WHERE ComplaintID = @ComplaintID");

    res.status(200).json({
      success: true,
      documents: docResult.recordset,
      images: imageResult.recordset,
    });
  } catch (err) {
    console.error("Error fetching files:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch files", error: err.message });
  }
};

module.exports = {
  submitFiles,
  getFiles,
};