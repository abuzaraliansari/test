const multer = require('multer');
const fileService = require('../models/fileService');
const { sql, poolPromise } = require('../config/db');

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Add timestamp to the filename
    },
});

const Upload = multer({ storage });

// Controller for handling file upload
const uploadDoc = async (req, res) => {
    const { ownerID, propertyID, tenantID, tenantName, createdBy } = req.body;

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Process the uploaded file using the service
        const fileInfo = await fileService.processFile(req.file);

        // Save file metadata to the database
        const pool = await poolPromise;
        const result = await pool.request()
            .input('originalName', sql.NVarChar, fileInfo.originalName)
            .input('fileName', sql.NVarChar, fileInfo.fileName)
            .input('filePath', sql.NVarChar, fileInfo.filePath)
            .input('fileSize', sql.Int, fileInfo.size)
            .input('ownerID', sql.Int, ownerID)
            .input('propertyID', sql.Int, propertyID)
            .input('tenantName', sql.NVarChar, tenantName)
            .input('createdBy', sql.NVarChar, createdBy)
            .input('createdAt', sql.DateTime, new Date()) // Adding the CreatedAt timestamp
            .input('modifiedBy', sql.NVarChar, null)
            .input('dateModified', sql.DateTime, null)
            .query(`
                INSERT INTO Tenant (
                    OwnerID, PropertyID, TenantName, DocumentName, DocumentPath, DocumentSize, CreatedAt, CreatedBy,ModifiedBy,DateModified
                )
                OUTPUT INSERTED.DocumentID
                VALUES (
                    @ownerID, @propertyID, @tenantName, @originalName, @filePath, @fileSize, @createdAt, @createdBy, @modifiedBy, @dateModified
                )
            `);

        const documentID = result.recordset[0]?.DocumentID;

        res.status(201).json({
            success: true,
            message: 'File uploaded and details stored successfully',
            documentID: documentID,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

module.exports = {
    uploadDoc,
    Upload,
};
