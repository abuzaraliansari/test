const { sql, poolPromise } = require('../config/db');

// Controller to fetch the max house number and calculate the new one
const getMaxHouseNumber = async (req, res) => {
    try {
        console.log(req.body);
        const { colonyName } = req.body;
       
        const pool = await poolPromise;

        // Query to get the maximum house number for the selected colony
        const result = await pool.request()
            .input('Colony', sql.NVarChar, colonyName)
            .query(`
                SELECT MAX(HouseNumber) AS TopHouseNumber
                FROM Property
                WHERE Colony = @Colony
            `);

        if (result.recordset.length === 0 || result.recordset[0].TopHouseNumber === null) {
            return res.status(404).json({ success: false, message: 'No house numbers found for this colony.' });
        }

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