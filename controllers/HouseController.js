const { sql, poolPromise } = require('../config/db');

// Controller to fetch the max house number and calculate the new one
const getMaxHouseNumber = async (req, res) => {
    try {
        console.log('API called: /getMaxHouseNumber');
        console.log('Request body:', req.body);

        const { zone, galliNumber } = req.body;
        if (!zone || !galliNumber) {
            console.error('Missing zone or galliNumber in request body');
            return res.status(400).json({ success: false, error: 'zone and galliNumber are required' });
        }

        const pool = await poolPromise;

        // Query to get the maximum house number for the selected zone and galli number
        const result = await pool.request()
            .input('ZoneID', sql.Int, zone)
            .input('GalliNumber', sql.NVarChar, galliNumber)
            .query(`
                SELECT MAX(HouseNumber) AS TopHouseNumber
                FROM Property
                WHERE ZoneID = @ZoneID and GalliNumber = @GalliNumber
            `);

        console.log('SQL Query Result:', result);

        const topHouseNumber = result.recordset[0].TopHouseNumber; // Get the highest number
        const newHouseNumber = (topHouseNumber || 0) + 1; // Increment the house number

        console.log('TopHouseNumber:', topHouseNumber, 'NewHouseNumber:', newHouseNumber);

        res.status(200).json({ success: true, maxHouseNumber: topHouseNumber, newHouseNumber });
    } catch (err) {
        console.error('Error in getMaxHouseNumber:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    getMaxHouseNumber
};