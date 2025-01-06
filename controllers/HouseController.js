const { sql, poolPromise } = require('../config/db');

// Controller to fetch the max house number and calculate the new one
const getMaxHouseNumber = async (req, res) => {
    try {
        console.log(req.body);
        const { zone, galliNumber } = req.body;
       
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

        const topHouseNumber = result.recordset[0].TopHouseNumber; // Get the highest number
        const newHouseNumber = topHouseNumber + 1; // Increment the house number

        res.status(200).json({ success: true, maxHouseNumber: topHouseNumber, newHouseNumber });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    getMaxHouseNumber
};