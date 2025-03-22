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
          u.[GeoLocation]
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

    console.log(ownerResult.recordset[0]);
    const OwnerID = ownerResult.recordset[0].OwnerID;

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
            [PropertyID],
            [OwnerID],
            [PropertyMode],
            [PropertyAge],
            [RoomCount],
            [FloorCount],
            [ShopCount],
            [ShopArea],
            [TenantCount],
            [TenantYearlyRent],
            [WaterHarvesting],
            [Submersible],
            [ZoneID],
            [Locality],
            [Colony],
            [GalliNumber],
            [HouseNumber],
            [HouseType],
            [OpenArea],
            [ConstructedArea],
            [BankAccountNumber],
            [Consent],
            [CreatedBy],
            [DateCreated],
            [ModifiedBy],
            [DateModified],
            [IsActive]
          FROM 
            [dbo].[Property]
          WHERE 
            OwnerID = @OwnerID 
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
            [GeoLocation],
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
      owner: ownerResult.recordset[0],
      familyMembers: familyMembers.recordset,
      properties: properties.recordset,
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