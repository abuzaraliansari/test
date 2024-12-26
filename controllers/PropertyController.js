const { sql, poolPromise } = require('../config/db');
const PropertyRequest = require('../models/PropertyRequest');

// Controller for adding a property
const addProperty = async (req, res) => {
 
    console.log(req.body);
        const { ownerDetails, familyMembers, propertyDetails } = req.body;
      
    try {

        
        const propertyRequest = new PropertyRequest(ownerDetails, familyMembers, propertyDetails);
        propertyRequest.validate(); // Validate the data
        const pool = await poolPromise;

        // Insert owner into PropertyOwner table and get the OwnerID
        const ownerResult = await pool.request()
            .input('firstName', sql.NVarChar, propertyRequest.ownerDetails.firstName)
            .input('middleName', sql.NVarChar, propertyRequest.ownerDetails.middleName)
            .input('lastName', sql.NVarChar, propertyRequest.ownerDetails.lastName)
            .input('mobileNumber', sql.VarChar, propertyRequest.ownerDetails.mobileNumber)
            .input('occupation', sql.NVarChar, propertyRequest.ownerDetails.occupation)
            .input('age', sql.Int, propertyRequest.ownerDetails.age)
            .input('gender', sql.Char, propertyRequest.ownerDetails.gender)
            .input('income', sql.Decimal, propertyRequest.ownerDetails.income)
            .input('religion', sql.NVarChar, propertyRequest.ownerDetails.religion)
            .input('category', sql.NVarChar, propertyRequest.ownerDetails.category)
            .input('createdBy', sql.NVarChar, propertyRequest.ownerDetails.createdBy)
            .input('IsActive', sql.NVarChar, propertyRequest.ownerDetails.IsActive)
            .query(`
                INSERT INTO PropertyOwner (FirstName, MiddleName, LastName, MobileNumber, Occupation, Age, Gender, Income, Religion, Category, CreatedBy, IsActive)
                OUTPUT INSERTED.OwnerID
                VALUES (@firstName, @middleName, @lastName, @mobileNumber, @occupation, @age, @gender, @income, @religion, @category, @createdBy, @IsActive)
            `);

        if (ownerResult.recordset.length === 0) {
            return res.status(400).json({ success: false, message: 'Failed to add owner' });
        }

        const ownerID = ownerResult.recordset[0].OwnerID;

        // Insert family members into FamilyMember table (if any)
        if (propertyRequest.familyMembers && propertyRequest.familyMembers.length > 0) {
            for (const member of propertyRequest.familyMembers) {
                await pool.request()
                    .input('ownerID', sql.Int, ownerID)
                    .input('name', sql.NVarChar, member.name)
                    .input('age', sql.Int, member.age)
                    .input('gender', sql.Char, member.gender)
                    .input('occupation', sql.NVarChar, member.occupation)
                    .input('createdBy', sql.NVarChar, member.createdBy)
                    .query(`
                        INSERT INTO FamilyMember (OwnerID, Name, Age, Gender, Occupation, CreatedBy)
                        VALUES (@ownerID, @name, @age, @gender, @occupation, @createdBy)
                    `);
            }
        }

        // Insert property into Property table
        const propertyResult = await pool.request()
            .input('ownerID', sql.Int, ownerID)
            .input('propertyMode', sql.NVarChar, propertyRequest.propertyDetails.propertyMode)
            .input('propertyAge', sql.Int, propertyRequest.propertyDetails.propertyAge)
            .input('roomCount', sql.Int, propertyRequest.propertyDetails.roomCount)
            .input('floorCount', sql.Int, propertyRequest.propertyDetails.floorCount)
            .input('shopCount', sql.Int, propertyRequest.propertyDetails.shopCount)
            .input('tenantCount', sql.Int, propertyRequest.propertyDetails.tenantCount)
            .input('waterHarvesting', sql.Bit, propertyRequest.propertyDetails.waterHarvesting)
            .input('submersible', sql.Bit, propertyRequest.propertyDetails.submersible)
            .input('geoLocation', sql.NVarChar, propertyRequest.propertyDetails.geoLocation)
            .input('moholla', sql.NVarChar, propertyRequest.propertyDetails.moholla)
            .input('houseNumber', sql.NVarChar, propertyRequest.propertyDetails.houseNumber)
            .input('galliNumber', sql.NVarChar, propertyRequest.propertyDetails.galliNumber)
            .input('bankAccountNumber', sql.VarChar, propertyRequest.propertyDetails.bankAccountNumber)
            .input('consent', sql.Bit, propertyRequest.propertyDetails.consent)
            .input('createdBy', sql.NVarChar, propertyRequest.propertyDetails.createdBy)
            .query(`
                INSERT INTO Property (
                    OwnerID, PropertyMode, PropertyAge, RoomCount, FloorCount, 
                    ShopCount, TenantCount, WaterHarvesting, Submersible, 
                    GeoLocation, Moholla, HouseNumber, GalliNumber, 
                    BankAccountNumber, Consent, CreatedBy
                )
                    OUTPUT INSERTED.PropertyID
                VALUES (
                    @ownerID, @propertyMode, @propertyAge, @roomCount, @floorCount,
                    @shopCount, @tenantCount, @waterHarvesting, @submersible,
                    @geoLocation, @moholla, @houseNumber, @galliNumber,
                    @bankAccountNumber, @consent, @createdBy
                )
            `);

        res.status(201).json({
            success: true,
            message: 'Property added successfully',
            propertyID: propertyResult.recordset[0].PropertyID // Return the PropertyID if needed
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};


module.exports = {
    addProperty
};

