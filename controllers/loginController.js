const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

require("dotenv").config();

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM AgentLogin WHERE Username = @username');

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      const passwordMatch = await bcrypt.compare(password, user.PasswordHash);

      if (passwordMatch) {
        const token = jwt.sign(
          { userId: user.AgentID, username: user.Username },
          process.env.JWT_SECRET_KEY,
          { expiresIn: '1h' }
        );

        res.json({
          success: true,
          message: 'Login successful',
          token: token,
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const addUser = async (req, res) => {
  const { username, password, fullName, email, mobileNumber, createdBy } = req.body;

  if (!username || !password || !fullName || !email || !mobileNumber) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;
    const query = `
      INSERT INTO AgentLogin (Username, PasswordHash, FullName, Email, MobileNumber, CreatedBy, DateCreated)
      VALUES (@username, @passwordHash, @fullName, @Email, @mobileNumber, @createdBy, GETDATE())
    `;
    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('passwordHash', sql.NVarChar, hashedPassword)
      .input('fullName', sql.NVarChar, fullName)
      .input('email', sql.NVarChar, email)
      .input('mobileNumber', sql.VarChar, mobileNumber)
      .input('createdBy', sql.NVarChar, createdBy)
      .query(query);

    res.json({ success: true, message: 'User added successfully.' });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ success: false, message: 'Failed to add user. Please try again.' });
  }
};


module.exports = {
  login,
  addUser,
};
