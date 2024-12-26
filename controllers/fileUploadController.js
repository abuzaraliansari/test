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

const upload = multer({ storage });

// Controller for handling file upload
const uploadFile = async (req, res) => {
    const { ownerID, propertyID, createdBy } = req.body;

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
            .input('createdBy', sql.NVarChar, createdBy)
            .input('modifiedBy', sql.NVarChar, null)
            .input('dateModified', sql.DateTime, null)
            //.input('IsActive', sql.NVarChar, IsActive)
            .query(`
                INSERT INTO FileMetadata (
                    OriginalName, FileName, FilePath, FileSize, OwnerID, PropertyID, CreatedBy, ModifiedBy, DateModified
                )
                OUTPUT INSERTED.FileID
                VALUES (
                    @originalName, @fileName, @filePath, @fileSize, @ownerID, @propertyID, @createdBy, @modifiedBy, @dateModified
                )
            `);

        const fileID = result.recordset[0]?.FileID;

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            fileID: fileID,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

module.exports = {
    uploadFile,
    upload,
};
