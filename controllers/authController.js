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
        SELECT 
          u.[UserID],
    u.[Username],
    u.[MobileNo],
    u.[EmailID],
    u.[Password],
    u.[PasswordHash],
    u.[CreatedBy],
    u.[CreatedDate],
    u.[ModifiedBy],
    u.[ModifiedDate],
    po.[AdharNumber],
    p.[ZoneID],
    p.[Locality],
    p.[Colony],
    p.[GalliNumber],
    p.[HouseNumber],
    sc.[GeoLocation],
    c.[Colony] AS ColonyName,
    l.[Locality] AS LocalityName,
    l.[Zone] AS ZoneName
        FROM 
          dbo.Users u
        INNER JOIN 
          dbo.PropertyOwner po ON u.MobileNo = po.MobileNumber 
        LEFT JOIN 
          dbo.Property p ON po.OwnerID = p.OwnerID
        LEFT JOIN 
          dbo.SpecialConsideration sc ON po.OwnerID = sc.OwnerID
        LEFT JOIN 
          dbo.FileMetadata fmtd ON po.OwnerID = fmtd.OwnerID
        LEFT JOIN 
          dbo.TenantDocuments td ON po.OwnerID = td.OwnerID
        LEFT JOIN 
          dbo.Colony c ON p.Colony = c.Colony
        LEFT JOIN 
          dbo.Locality l ON c.LocalityID = l.LocalityID
        WHERE  
          (u.Username = @username OR u.MobileNo = @mobileNumber)
      `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      const validPassword = await bcrypt.compare(password, user.PasswordHash);

      if (validPassword) {
        // Fetch user roles
        const rolesResult = await pool
          .request()
          .input("userID", sql.Int, user.UserID)
          .query(`
            SELECT r.RoleName 
            FROM UserRoles ur
            JOIN Roles r ON ur.RoleID = r.RoleID
            WHERE ur.UserID = @userID
          `);

        const roles = rolesResult.recordset.map(role => role.RoleName);

        const token = jwt.sign(
          { userId: user.UserID, username: user.Username, roles: roles },
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
            createdBy: user.CreatedBy,
            createdDate: user.CreatedDate,
            modifiedBy: user.ModifiedBy,
            modifiedDate: user.ModifiedDate,
            roles: roles,
            firstName: user.FirstName,
            adharNumber: user.AdharNumber,
            zoneID: user.ZoneID,
            locality: user.Locality,
            colony: user.Colony,
            galliNumber: user.GalliNumber,
            houseNumber: user.HouseNumber,
            geoLocation: user.GeoLocation,
            colonyName: user.ColonyName,
            localityName: user.LocalityName,
            zoneName: user.ZoneName
          }
        });
        console.log("User ID:", user.UserID);
        console.log("Roles:", roles);
        console.log(user);
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