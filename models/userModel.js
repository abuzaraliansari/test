const { sql, poolPromise } = require("../config/db");

const createUser = async (username, mobileno, password, hashedPassword, emailID) => {
    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("username", sql.VarChar, username)
            .input("mobileno", sql.VarChar, mobileno)
            .input("password", sql.VarChar, password)
            .input("hashedPassword", sql.VarChar, hashedPassword)
            .input("emailID", sql.VarChar, emailID)
            .query("INSERT INTO Users (username, mobileno, password, passwordHash, emailID) VALUES (@username, @mobileno, @password, @hashedPassword, @emailID)");
        return result.rowsAffected[0] > 0; // Return true if user was created
    } catch (err) {
        throw new Error("Error creating user: " + err.message);
    }
};

const findUserByUsernameOrMobile = async (username, mobileno) => {
    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("username", sql.VarChar, username)
            .input("mobileno", sql.VarChar, mobileno)
            .query("SELECT * FROM Users WHERE username = @username OR mobileno = @mobileno");

        return result.recordset.length > 0 ? result.recordset[0] : null; // Return user if found
    } catch (err) {
        throw new Error("Error finding user: " + err.message);
    }
}; 

module.exports = {
    createUser,
    findUserByUsernameOrMobile,
};