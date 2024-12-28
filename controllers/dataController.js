const { sql, poolPromise } = require("../config/db");

// Controller for fetching all details by MobileNumber
const GetOwnerDetails = async (req, res) => {
  const { MobileNumber } = req.body;

  try {
    const pool = await poolPromise;

    // Step 1: Fetch OwnerID using MobileNumber
    const ownerResult = await pool.request()
      .input("MobileNumber", sql.VarChar(15), MobileNumber)
      .query(`
        SELECT [OwnerID]
      ,[FirstName]
      ,[MiddleName]
      ,[LastName]
      ,[MobileNumber]
      ,[Occupation]
      ,[Age]
      ,[Gender]
      ,[Income]
      ,[Religion]
      ,[Category]
      ,[Cast]
      ,[AdharNumber]
      ,[PanNumber]
      ,[Email]
      ,[NumberOfMembers]
        FROM [dbo].[PropertyOwner]
        WHERE MobileNumber = @MobileNumber
          
      `);

    if (ownerResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Owner not found." });
    }
console.log(ownerResult.recordset[0]);
    const OwnerID = ownerResult.recordset[0].OwnerID;

    // Step 2: Fetch related data from other tables
    const [familyMembers, properties, considerations, files] = await Promise.all([
      pool.request()
        .input("OwnerID", sql.Int, OwnerID)
        .query(`
          SELECT [FamilyMemberID]
      ,[OwnerID]
      ,[FirstName]
      ,[LastName]
      ,[Age]
      ,[Gender]
      ,[Occupation]
          FROM [dbo].[FamilyMember]
          WHERE OwnerID = @OwnerID 
        `),
      pool.request()
        .input("OwnerID", sql.Int, OwnerID)
        .query(`
          SELECT [PropertyID]
      ,[OwnerID]
      ,[PropertyMode]
      ,[PropertyAge]
      ,[RoomCount]
      ,[FloorCount]
      ,[ShopCount]
      ,[TenantCount]
      ,[WaterHarvesting]
      ,[Submersible]
      ,[ZoneID]
      ,[Locality]
      ,[Colony]
      ,[GalliNumber]
      ,[HouseNumber]
      ,[HouseType]
      ,[OpenArea]
      ,[ConstructedArea]
      ,[BankAccountNumber]
      ,[Consent]
          FROM [dbo].[Property]
          WHERE OwnerID = @OwnerID 
        `),
      pool.request()
        .input("OwnerID", sql.Int, OwnerID)
        .query(`
          SELECT [ConsiderationID]
      ,[OwnerID]
      ,[PropertyID]
      ,[ConsiderationType]
      ,[Description]
      ,[CreatedBy]
      ,[GeoLocation]
          FROM [dbo].[SpecialConsideration]
          WHERE OwnerID = @OwnerID 
        `),
      pool.request()
        .input("OwnerID", sql.Int, OwnerID)
        .query(`
          SELECT[FileID]
      ,[OwnerID]
      ,[PropertyID]
      ,[OriginalName]
      ,[FileName]
      ,[FilePath]
      ,[FileSize]
          FROM [dbo].[FileMetadata]
          WHERE OwnerID = @OwnerID 
        `)
    ]);

    // Step 3: Combine data and send the response
    res.status(200).json({
      owner: ownerResult.recordset[0],
      familyMembers: familyMembers.recordset,
      properties: properties.recordset,
      considerations: considerations.recordset,
      files: files.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  GetOwnerDetails,
};
