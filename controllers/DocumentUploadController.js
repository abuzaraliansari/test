const multer = require('multer');
const { sql, poolPromise } = require('../config/db');
const DocumentService = require('../models/DocumentService');
const path = require('path');

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

// Controller for handling multiple tenants' data
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

            // Extract file details
            const documentName = document.documentName;
            const documentSize = document.documentSize;
            const documentPath = document.documentPath;
            const documentType = document.documentType;

            // Validate file size (example: ensure file size is less than 20 MB)
            if (documentSize > 20 * 1024 * 1024) {
                return res.status(400).json({ success: false, message: 'File size exceeds the allowed limit of 20 MB' });
            }

            // Save tenant details and document metadata into the database
            await pool.request()
                .input('originalName', sql.NVarChar, documentName)
                .input('filePath', sql.NVarChar, documentPath)
                .input('fileSize', sql.Int, documentSize)
                .input('documentType', sql.NVarChar, documentType)
                .input('ownerID', sql.Int, ownerID)
                .input('propertyID', sql.Int, propertyID)
                .input('tenantName', sql.NVarChar, name)
                .input('createdBy', sql.NVarChar, createdBy)
                .input('createdAt', sql.DateTime, new Date())
                .input('modifiedBy', sql.NVarChar, null)
                .input('dateModified', sql.DateTime, null)
                .query(`
                    INSERT INTO TenantDocuments (
                        OwnerID, PropertyID, TenantName, DocumentName, DocumentPath, DocumentSize, DocumentType, CreatedAt, CreatedBy, ModifiedBy, DateModified
                    )
                    VALUES (
                        @ownerID, @propertyID, @tenantName, @originalName, @filePath, @fileSize, @documentType, @createdAt, @createdBy, @modifiedBy, @dateModified
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
    uploadDoc,
    Upload,
};