const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { sql, poolPromise } = require('../config/db');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Function to handle insertion into the FileMetadata table
const uploadFileMetadata = async (req, res) => {
    try {
        const { OwnerID, PropertyID, CreatedBy, ModifiedBy } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const pool = await poolPromise;

        for (const file of req.files) {
            const { originalname, filename, path: filePath, size } = file;

            await pool.request()
                .input('OwnerID', sql.Int, OwnerID)
                .input('PropertyID', sql.Int, PropertyID)
                .input('OriginalName', sql.NVarChar, originalname)
                .input('FileName', sql.NVarChar, filename)
                .input('FilePath', sql.NVarChar, filePath)
                .input('FileSize', sql.Int, size)
                .input('CreatedBy', sql.NVarChar, CreatedBy)
                .input('ModifiedBy', sql.NVarChar, ModifiedBy)
                .input('IsActive', sql.Bit, 1)
                .query(`
                    INSERT INTO FileMetadata (OwnerID, PropertyID, OriginalName, FileName, FilePath, FileSize, CreatedBy, DateCreated, ModifiedBy, IsActive)
                    VALUES (@OwnerID, @PropertyID, @OriginalName, @FileName, @FilePath, @FileSize, @CreatedBy, GETDATE(), @ModifiedBy, @IsActive)
                `);
        }

        res.status(200).json({ message: 'Files uploaded and saved to FileMetadata successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading files to FileMetadata.', error: error.message });
    }
};

// Function to handle insertion into the TenantDocuments table
const uploadTenantDocuments = async (req, res) => {
    try {
        const { OwnerID, PropertyID, tenantNames, CreatedBy, ModifiedBy } = req.body;

        if (!tenantNames) {
            return res.status(400).json({ message: 'Tenant names are required for TenantDocuments.' });
        }

        const tenantNamesArray = JSON.parse(tenantNames); // Parse tenant names as an array

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        // Ensure the number of tenant names matches the number of uploaded files
        if (tenantNamesArray.length !== req.files.length) {
            return res.status(400).json({
                message: 'The number of tenant names must match the number of uploaded files.'
            });
        }

        const pool = await poolPromise;

        // Iterate over tenant names and files
        for (let i = 0; i < tenantNamesArray.length; i++) {
            const tenantName = tenantNamesArray[i];
            const file = req.files[i];
            const { filename, path: filePath, size } = file;

            await pool.request()
                .input('OwnerID', sql.Int, OwnerID)
                .input('PropertyID', sql.Int, PropertyID)
                .input('tenantName', sql.VarChar, tenantName)
                .input('documentName', sql.VarChar, filename)
                .input('documentPath', sql.VarChar, filePath)
                .input('documentSize', sql.Int, size)
                .input('documentType', sql.VarChar, path.extname(file.originalname))
                .input('CreatedBy', sql.NVarChar, CreatedBy)
                .input('ModifiedBy', sql.NVarChar, ModifiedBy)
                .input('IsActive', sql.Bit, 1)
                .query(`
                    INSERT INTO TenantDocuments (OwnerID, PropertyID, tenantName, documentName, documentPath, documentSize, documentType, CreatedBy, DateCreated, ModifiedBy, IsActive)
                    VALUES (@OwnerID, @PropertyID, @tenantName, @documentName, @documentPath, @documentSize, @documentType, @CreatedBy, GETDATE(), @ModifiedBy, @IsActive)
                `);
        }

        res.status(200).json({ message: 'Files uploaded and saved to TenantDocuments successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading files to TenantDocuments.', error: error.message });
    }
};

module.exports = { uploadFileMetadata, uploadTenantDocuments, upload };
