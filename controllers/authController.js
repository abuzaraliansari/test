const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");
const bcrypt = require('bcryptjs');

require("dotenv").config();

const loginC = async (req, res) => {
  const { username, mobileNumber, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username || null)
      .input("mobileNumber", sql.NVarChar, mobileNumber || null)
      .query(`
        SELECT * FROM Users 
        WHERE (Username = @username OR MobileNo = @mobileNumber)
      `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      const validPassword = await bcrypt.compare(password, user.PasswordHash);

      if (validPassword) {
        const token = jwt.sign(
          { userId: user.UserID, username: user.Username },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1h" }
        );

        res.status(200).json({
          success: true,
          message: "Login successful",
          token: token,
          user: {
            userID: user.UserID,
            username: user.Username,
            mobileNumber: user.MobileNo,
            emailID: user.EmailID,
            isAdmin: user.isAdmin,
            isActive: user.IsActive
          }
        });
        console.log("User ID:", user.UserID);
      } else {
        res.status(401).json({ success: false, message: "Invalid password" });
      }
    } else {
      res.status(401).json({ success: false, message: "Invalid username or mobile number" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const signup = async (req, res) => {
  const { username, mobileno, password, emailID } = req.body;

  try {
    const existingUser = await findUserByUsernameOrMobile(username, mobileno);

    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCreated = await createUser(username, mobileno, password, hashedPassword, emailID);

    if (userCreated) {
      res.json({ success: true, message: "User created successfully" });
    } else {
      res.status(500).json({ success: false, message: "Failed to create user" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  loginC,
  signup,
};