const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sql, poolPromise } = require("../config/db");
const { createUser, findUserByUsernameOrMobile } = require("../models/userModel");

require("dotenv").config();

const loginC = async (req, res) => {
    const { username, password } = req.body;
  
    try {
    
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("username", sql.VarChar, username)
        .query("SELECT id, username, mobileno, emailID, passwordHash, isAdmin FROM Users WHERE username = @username or mobileno = @username");
  
      if (result.recordset.length > 0) {
        const user = result.recordset[0];
        const validPassword = await bcrypt.compare(password, user.passwordHash);
  
        if (validPassword) {
          const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
          );
  
          res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
              username: user.username,
              mobileno: user.mobileno,
              emailID: user.emailID,
              isAdmin: user.isAdmin
              
            }
            
          });
          
        } else {
          res.status(401).json({ success: false, message: "Invalid password" });
        }
      } else {
        res.status(401).json({ success: false, message: "Invalid username" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

const signup = async (req, res) => {
    const { username, mobileno, password, emailID, isAdmin } = req.body;
  
    try {
      const existingUser = await findUserByUsernameOrMobile(username, mobileno);
  
      if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const userCreated = await createUser(username, mobileno, password, hashedPassword, emailID, isAdmin);
  
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