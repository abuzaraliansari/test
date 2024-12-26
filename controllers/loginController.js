const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

require("dotenv").config();

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .query(
        "SELECT * FROM AgentLogin WHERE username = @username AND passwordHash = @password"
      );

    if (result.recordset.length > 0) {
      // res.json({ success: true, message: 'Login successful' });
      const user = result.recordset[0];

      // Generate a JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username }, // Payload
        process.env.JWT_SECRET_KEY, // Secret key from .env
        { expiresIn: "1h" } // Token expiration
      );

      res.json({
        success: true,
        message: "Login successful",
        token: token,
      });
      console.log(token);
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  login,
};
