const { response } = require('express');
const { sql, poolPromise } = require('../config/db');
const e = require('express');

const checkMobileNumber = async (req, res) => {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
        return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('mobileNumber', sql.VarChar, mobileNumber)
            .query('SELECT COUNT(*) as count FROM PropertyOwner WHERE MobileNumber = @mobileNumber');

        if (result.recordset[0].count > 0) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking mobile number:', error);
        return res.status(500).json({ success: false, message: 'Failed to check mobile number' });
    }
};

module.exports = {
    checkMobileNumber,
};