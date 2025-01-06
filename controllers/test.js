const multer = require('multer');
const { sql, poolPromise } = require('../config/db');
const { request } = require('express');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Add timestamp to the filename
  },
});

const upload = multer({ storage });

// Controller for handling file upload
const uploadFile = async (req, res) => {
    console.log(req.body);
  const { ownerID, propertyID, createdBy } = req.body;

  try {
 
    const pool = await poolPromise;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    for (const file of req.files) {
      const { originalname: originalName, filename: fileName, path: filePath, size: fileSize } = file;

      // Save file metadata to the database
      await pool.request()
        .input('OwnerID', sql.Int, ownerID)
        .input('PropertyID', sql.Int, propertyID)
        .input('OriginalName', sql.NVarChar, originalName)
        .input('FileName', sql.NVarChar, fileName)
        .input('FilePath', sql.NVarChar, filePath)
        .input('FileSize', sql.Int, fileSize)
        .input('CreatedBy', sql.NVarChar, createdBy)
        .input('DateCreated', sql.DateTime, new Date())
        .query(`
          INSERT INTO FileMetadata (
            OwnerID, PropertyID, OriginalName, FileName, FilePath, FileSize, CreatedBy, DateCreated
          )
          VALUES (
            @OwnerID, @PropertyID, @OriginalName, @FileName, @FilePath, @FileSize, @CreatedBy, @DateCreated
          )
        `);
    }

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Controller for handling tenant documents upload
const uploadDoc = async (req, res) => {
  const { ownerID, propertyID, createdBy, tenantDetails } = req.body;

  try {
    // Parse tenantDetails as JSON if it's sent as a string
    const tenants = typeof tenantDetails === 'string' ? JSON.parse(tenantDetails) : tenantDetails;

    if (!tenants || tenants.length === 0) {
      return res.status(400).json({ success: false, message: 'No tenant details provided' });
    }

    const pool = await poolPromise;

    for (const tenant of tenants) {
      const { name, document } = tenant;

      if (!name || !document) {
        return res.status(400).json({ success: false, message: 'Tenant name or document missing' });
      }

      const { documentName, documentPath, documentSize, documentType } = document;

      // Save tenant details and document metadata into the database
      await pool.request()
        .input('OwnerID', sql.Int, ownerID)
        .input('PropertyID', sql.Int, propertyID)
        .input('tenantName', sql.NVarChar, name)
        .input('documentName', sql.NVarChar, documentName)
        .input('documentPath', sql.NVarChar, documentPath)
        .input('documentSize', sql.Int, documentSize)
        .input('documentType', sql.NVarChar, documentType)
        .input('CreatedBy', sql.NVarChar, createdBy)
        .input('CreatedAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO TenantDocuments (
            OwnerID, PropertyID, tenantName, documentName, documentPath, documentSize, documentType, CreatedAt, CreatedBy
          )
          VALUES (
            @OwnerID, @PropertyID, @tenantName, @documentName, @documentPath, @documentSize, @documentType, @CreatedAt, @CreatedBy
          )
        `);
    }

    res.status(201).json({
      success: true,
      message: 'All tenant details and documents stored successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = {
  uploadFile,
  uploadDoc,
  upload,
};