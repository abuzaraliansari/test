const path = require('path');

// File processing service
const processDoc = async (document) => {
    try {
        const { documentName, documentPath, documentSize, documentType } = document;

        // Example validation: Ensure file size is less than 20 MB
        if (documentSize > 20 * 1024 * 1024) {
            throw new Error('File size exceeds the allowed limit of 20 MB');
        }

        // Return processed file information
        return {
            originalName: documentName,
            filePath: documentPath,
            size: documentSize,
            extension: path.extname(documentName),
        };
    } catch (error) {
        console.error('Error processing file:', error.message);
        throw error;
    }
};

module.exports = {
    processDoc,
};