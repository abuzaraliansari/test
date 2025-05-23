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
    u.[IsActive],
    u.[ModifiedBy],
    u.[ModifiedDate],
    po.[FirstName],
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
            isActive: user.IsActive,
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

const updateUserStatus = async (req, res) => {
  const { mobileNo, isActive, modifiedBy } = req.body;

  console.log("Received mobileNo:", mobileNo);
  console.log("Received isActive:", isActive);
  console.log("Received modifiedBy:", modifiedBy);

  if (!mobileNo || isActive === undefined || !modifiedBy) {
    return res.status(400).json({ success: false, message: "mobileNo, isActive, and modifiedBy must be provided" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("mobileNo", sql.NVarChar, mobileNo)
      .input("isActive", sql.Bit, isActive)
      .input("modifiedBy", sql.NVarChar, modifiedBy)
      .input("dateModified", sql.DateTime, new Date())
      .query(
        `UPDATE Users
         SET IsActive = @isActive,
             ModifiedBy = @modifiedBy,
             ModifiedDate = @dateModified
         WHERE MobileNo = @mobileNo`
      );

    console.log("Update result:", result);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "No user found with the provided mobile number" });
    }

    res.status(200).json({ success: true, message: "User status updated successfully" });
  } catch (err) {
    console.error("Error updating user status:", err.message);
    res.status(500).json({ success: false, message: "Failed to update user status", error: err.message });
  }
};


const getAllUsersWithRoles = async (req, res) => {
  const { mobileNumber } = req.body; // Optional filter for mobileNumber

  try {
    const pool = await poolPromise;

    // SQL query to fetch user data along with roles
    const result = await pool.request()
      .input("mobileNumber", sql.NVarChar, mobileNumber || null)
      .query(`
        SELECT 
          u.[UserID],
          u.[Username],
          u.[MobileNo],
          u.[EmailID],
          u.[CreatedBy],
          u.[CreatedDate],
          u.[ModifiedBy],
          u.[ModifiedDate],
          u.[isAdmin],
          u.[IsActive],
          r.[RoleName]
        FROM 
          dbo.Users u
        LEFT JOIN 
          dbo.UserRoles ur ON u.UserID = ur.UserID
        LEFT JOIN 
          dbo.Roles r ON ur.RoleID = r.RoleID
        ${mobileNumber ? "WHERE u.MobileNo = @mobileNumber" : ""}
      `);

    if (result.recordset.length === 0) {
      return res.status(204).json({ success: false, message: "No users found." });
    }

    // Group roles for each user
    const users = result.recordset.reduce((acc, row) => {
      const user = acc.find(u => u.UserID === row.UserID);
      if (user) {
        user.roles.push(row.RoleName);
      } else {
        acc.push({
          userID: row.UserID,
          username: row.Username,
          mobileNumber: row.MobileNo,
          emailID: row.EmailID,
          createdBy: row.CreatedBy,
          createdDate: row.CreatedDate,
          modifiedBy: row.ModifiedBy,
          modifiedDate: row.ModifiedDate,
          isAdmin: row.isAdmin,
          isActive: row.IsActive,
          roles: row.RoleName ? [row.RoleName] : []
        });
      }
      return acc;
    }, []);

    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users with roles:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch users", error: err.message });
  }
};

const getAllUsersWithRoleslimit = async (req, res) => {
  const { mobileNumber, username, role, isActive, limit = 10, offset = 0 } = req.body; // Default limit to 10, offset to 0

  console.log("Received mobileNumber:", mobileNumber);
  console.log("Received username:", username);
  console.log("Received role:", role);
  console.log("Received isActive:", isActive);
  console.log("Received limit:", limit);
  console.log("Received offset:", offset);

  try {
    const pool = await poolPromise;

    // Query with lazy loading
    let query = `
      SELECT 
        u.[UserID],
        u.[Username],
        u.[MobileNo],
        u.[EmailID],
        u.[Password],
        u.[PasswordHash],
        u.[CreatedBy],
        u.[CreatedDate],
        u.[IsActive],
        u.[ModifiedBy],
        u.[ModifiedDate],
        po.[OwnerID],
        po.[FirstName],
        po.[MiddleName],
        po.[LastName],
        po.[FatherName],
        po.[MobileNumber],
        po.[Occupation],
        po.[Age],
        po.[DOB],
        po.[Gender],
        po.[Income],
        po.[Religion],
        po.[Category],
        po.[Cast],
        po.[AdharNumber],
        po.[PanNumber],
        po.[Email],
        po.[NumberOfMembers],
        po.[CreatedBy] AS PropertyOwnerCreatedBy,
        po.[DateCreated],
        po.[ModifiedBy] AS PropertyOwnerModifiedBy,
        po.[DateModified],
        po.[IsActive] AS PropertyOwnerIsActive,
        p.[ZoneID],
        p.[Locality],
        p.[Colony],
        p.[GalliNumber],
        p.[HouseNumber],
        sc.[GeoLocation],
        r.[RoleName]
      FROM 
        dbo.Users u
      LEFT JOIN 
        dbo.PropertyOwner po ON u.MobileNo = po.MobileNumber
      LEFT JOIN 
        dbo.Property p ON po.OwnerID = p.OwnerID
      LEFT JOIN 
        dbo.SpecialConsideration sc ON po.OwnerID = sc.OwnerID
      LEFT JOIN 
        dbo.UserRoles ur ON u.UserID = ur.UserID
      LEFT JOIN 
        dbo.Roles r ON ur.RoleID = r.RoleID
      WHERE 
        1=1`;

    // Add filters dynamically
    if (mobileNumber) {
      query += ` AND u.MobileNo = @mobileNumber`;
    }
    if (username) {
      query += ` AND (@username IS NULL OR u.Username LIKE @username)`;
    }
    if (role) {
      if (role === "Admin") {
        query += ` AND r.RoleName = 'Admin'`;
      } else {
        query += ` AND (r.RoleName IS NULL OR r.RoleName != 'Admin')`;
      }
    }
    if (isActive !== null && isActive !== undefined) {
      query += ` AND u.IsActive = @isActive`;
    }

    query += `
      ORDER BY u.CreatedDate DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;`;

    console.log("Executing query:", query);

    const result = await pool.request()
      .input("mobileNumber", sql.NVarChar, mobileNumber || null)
      .input("username", sql.NVarChar, username ? `${username}%` : null)
      .input("isActive", sql.Bit, isActive !== null && isActive !== undefined ? isActive : null)
      .input("limit", sql.Int, limit) // Bind the limit
      .input("offset", sql.Int, offset) // Bind the offset
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(204).json({ success: false, message: "No users found." });
    }

    // Process the result to adjust roles
    const users = result.recordset.map(user => {
      if (user.RoleName !== "Admin") {
        user.RoleName = "User"; // Set role to "User" if not "Admin"
      }
      return user;
    });

    console.log("API Result:", users); // Log the result in the console

    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users with roles:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch users", error: err.message });
  }
};


const getTaxSurveyByUserId = async (req, res) => {
  const { userId } = req.body; // Expecting userId in the request body

  console.log("Received userId:", userId);

  if (!userId) {
    return res.status(400).json({ success: false, message: "UserID must be provided" });
  }

  try {
    const pool = await poolPromise;

    // Query to fetch TaxSurvey data for the given UserID
    const query = `
      SELECT 
        [Sno],
        [UserID],
        [TaxAmount],
        [TaxCalculatedDate],
        [TaxPending],
        [TaxModifiedDate],
        [PaidStatus],
        [UpdatedBy],
        [UpdatedDate],
        [Remark],
        [TaxPaidAmount],
        [TaxPaidDate],
        [TaxPaidMode],
        [UtrNo],
        [ReferenceNo],
        [ReturnAmount],
        [ReturnReferenceNo],
        [ReturnDate],
        [LateTaxFee],
        [Flag],
        [TaxYear],
        [IsTaxCalculated],
        [CalculatedDate],
        [ModifyDate]
      FROM 
        dbo.TaxSurvey
      WHERE 
        [UserID] = @userId
      ORDER BY 
        [TaxCalculatedDate] DESC;`;

    console.log("Executing query:", query);

    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(204).json({ success: false, message: "No tax survey data found for the given UserID." });
    }

    console.log("API Result:", result.recordset); // Log the result in the console

    res.status(200).json({ success: true, taxSurveyData: result.recordset });
  } catch (err) {
    console.error("Error fetching tax survey data:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch tax survey data", error: err.message });
  }
};

module.exports = {
  loginC,
  signup,
  updateUserStatus,
  getAllUsersWithRoles,
  getAllUsersWithRoleslimit,
  getTaxSurveyByUserId,
};