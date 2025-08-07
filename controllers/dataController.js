const { sql, poolPromise } = require("../config/db");

// Controller for fetching all details by MobileNumber
const GetOwnerDetails = async (req, res) => {
  const { MobileNumber } = req.body;

  try {
    const pool = await poolPromise;

    // Step 1: Fetch OwnerID and User details using MobileNumber
    const ownerResult = await pool.request()
      .input("MobileNumber", sql.VarChar(15), MobileNumber)
      .query(`
        SELECT 
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
          po.[CreatedBy],
          po.[DateCreated],
          po.[ModifiedBy],
          po.[DateModified],
          po.[IsActive],
          u.[UserID],
          u.[Username],
          u.[MobileNo],
          u.[EmailID],
          u.[password],
          u.[PasswordHash],
          u.[CreatedBy] AS UserCreatedBy,
          u.[CreatedDate],
          u.[ModifiedBy] AS UserModifiedBy,
          u.[ModifiedDate],
          u.[isAdmin],
          u.[IsActive] AS UserIsActive,
          u.[ZoneID],
          u.[Locality],
          u.[Colony],
          u.[GalliNumber],
          u.[HouseNumber],
          -- Get GeoLocation from the first property (for backward compatibility)
          (SELECT TOP 1 GeoLocation FROM [dbo].[Property] WHERE OwnerID = po.OwnerID) AS GeoLocation
        FROM 
          [dbo].[PropertyOwner] po
        LEFT JOIN 
          [dbo].[Users] u ON po.MobileNumber = u.MobileNo
        WHERE 
          po.MobileNumber = @MobileNumber
      `);

    if (ownerResult.recordset.length === 0) {
      return res.status(204).json({ success: false, message: "Owner not found." });
    }

    const ownerData = ownerResult.recordset[0];
    const OwnerID = ownerData.OwnerID;

    // Step 2: Fetch related data from other tables
    const [familyMembers, properties, considerations, files, TenantDocuments] = await Promise.all([
      pool.request()
        .input("OwnerID", sql.Int, OwnerID)
        .query(`
          SELECT 
            [FamilyMemberID],
            [OwnerID],
            [Relation],
            [FirstName],
            [LastName],
            [Age],
            [DOB],
            [Gender],
            [Occupation],
            [CreatedBy],
            [Income],
            [DateCreated],
            [ModifiedBy],
            [DateModified],
            [IsActive]
          FROM 
            [dbo].[FamilyMember]
          WHERE 
            OwnerID = @OwnerID 
        `),
      pool.request()
        .input("OwnerID", sql.Int, OwnerID)
        .query(`
          SELECT 
            p.[PropertyID],
            p.[OwnerID],
            p.[PropertyMode],
            p.[PrePropertyNo],
            p.[PropertyAge],
            p.[RoomCount],
            p.[FloorCount],
            p.[ShopCount],
            p.[ShopArea],
            p.[TenantCount],
            p.[TenantYearlyRent],
            p.[WaterHarvesting],
            p.[Submersible],
            p.[ZoneID],
            p.[Locality],
            p.[Colony],
            p.[GalliNumber],
            p.[HouseNumber],
            p.[RoadSize],
            p.[HouseType],
            p.[OpenArea],
            p.[ConstructedArea],
            p.[BankAccountNumber],
            p.[Consent],
            p.[CreatedBy],
            p.[DateCreated],
            p.[ModifiedBy],
            p.[DateModified],
            p.[IsActive],
            p.[GeoLocation],
            l.[Zone] AS ZoneName,
            l.[Locality] AS LocalityName
          FROM 
            [dbo].[Property] p
          LEFT JOIN [dbo].[Locality] l ON p.ZoneID = l.ZoneID AND p.Locality = l.LocalityID
          WHERE 
            p.OwnerID = @OwnerID 
        `),
      pool.request()
        .input("OwnerID", sql.Int, OwnerID)
        .query(`
          SELECT  
            [ConsiderationID],
            [OwnerID],
            [PropertyID],
            [ConsiderationType],
            [Description],
            [CreatedBy],
            [DateCreated],
            [ModifiedBy],
            [DateModified],
            [IsActive]
          FROM 
            [dbo].[SpecialConsideration]
          WHERE 
            OwnerID = @OwnerID 
        `),
      pool.request()
        .input("OwnerID", sql.Int, OwnerID)
        .query(`
          SELECT 
            [FileID],
            [OwnerID],
            [PropertyID],
            [OriginalName],
            [FileName],
            [FilePath],
            [FileSize],
            [CreatedBy],
            [DateCreated],
            [ModifiedBy],
            [DateModified],
            [IsActive]
          FROM 
            [dbo].[FileMetadata]
          WHERE 
            OwnerID = @OwnerID 
        `),
      pool.request()
        .input("OwnerID", sql.Int, OwnerID)
        .query(`
          SELECT 
            [documentID],
            [OwnerID],
            [PropertyID],
            [tenantName],
            [documentName],
            [documentPath],
            [documentSize],
            [documentType],
            [CreatedBy],
            [DateCreated],
            [ModifiedBy],
            [DateModified],
            [IsActive]
          FROM 
            [dbo].[TenantDocuments]
          WHERE 
            OwnerID = @OwnerID 
        `)
    ]);

    // Step 3: Combine data and send the response
    res.status(200).json({
      owner: ownerData,
      familyMembers: familyMembers.recordset,
      properties: properties.recordset, // Each property now includes GeoLocation
      considerations: considerations.recordset,
      files: files.recordset,
      TenantDocuments: TenantDocuments.recordset
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  GetOwnerDetails,
};
