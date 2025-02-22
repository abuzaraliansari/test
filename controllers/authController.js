const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

require("dotenv").config();

const loginC = async (req, res) => {
  const { firstName, mobileNumber, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("firstName", sql.NVarChar, firstName)
      .input("mobileNumber", sql.VarChar, mobileNumber)
      .query("SELECT OwnerID, FirstName, MobileNumber, Email, IsActive FROM PropertyOwner WHERE FirstName = @firstName AND MobileNumber = @mobileNumber");

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      const validPassword = password === "1234"; // Common password for all users

      if (validPassword) {
        const token = jwt.sign(
          { userId: user.OwnerID, username: user.FirstName },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1h" }
        );

        res.status(200).json({
          success: true,
          message: "Login successful",
          token: token,
          user: {
            username: user.FirstName,
            mobileno: user.MobileNumber,
            emailID: user.Email,
            isAdmin: user.IsActive
          }
        });
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