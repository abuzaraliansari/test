const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

const addOwnerProperty = async (req, res) => {
    const { ownerDetails, familyMembers, propertyDetails, specialConsideration } = req.body;

    if (!ownerDetails) {
        return res.status(400).json({ success: false, message: 'Owner details are required' });
    }

    let transaction;
    try {
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);

        await transaction.begin();

        // Insert owner details
        const ownerResult = await transaction.request()
            .input('firstName', sql.NVarChar, ownerDetails.firstName)
            .input('middleName', sql.NVarChar, ownerDetails.middleName)
            .input('lastName', sql.NVarChar, ownerDetails.lastName)
            .input('FatherName', sql.NVarChar, ownerDetails.FatherName)
            .input('mobileNumber', sql.VarChar, ownerDetails.mobileNumber)
            .input('occupation', sql.NVarChar, ownerDetails.occupation)
            .input('age', sql.NVarChar, ownerDetails.age)
            .input('DOB', sql.NVarChar, ownerDetails.DOB)
            .input('gender', sql.Char, ownerDetails.gender)
            .input('income', sql.NVarChar, ownerDetails.income)
            .input('religion', sql.NVarChar, ownerDetails.religion)
            .input('category', sql.NVarChar, ownerDetails.category)
            .input('AdharNumber', sql.NVarChar, ownerDetails.AdharNumber)
            .input('PanNumber', sql.NVarChar, ownerDetails.PanNumber)
            .input('Email', sql.NVarChar, ownerDetails.Email)
            .input('NumberOfMembers', sql.Int, parseInt(ownerDetails.NumberOfMembers))
            .input('CreatedBy', sql.NVarChar, ownerDetails.CreatedBy)
            .input('IsActive', sql.Bit, 1)
            .query(`
                INSERT INTO PropertyOwner (FirstName, MiddleName, LastName, FatherName, MobileNumber, Occupation, Age, DOB, Gender, Income, Religion, Category, AdharNumber, PanNumber, Email, NumberOfMembers, CreatedBy, IsActive)
                OUTPUT INSERTED.OwnerID
                VALUES (@firstName, @middleName, @lastName, @FatherName, @mobileNumber, @occupation, @age, @DOB, @gender, @income, @religion, @category, @AdharNumber, @PanNumber, @Email, @NumberOfMembers, @CreatedBy, @IsActive)
            `);

        const ownerID = ownerResult.recordset[0].OwnerID;

        // Generate password based on conditions
        let password;
        if (ownerDetails.AdharNumber && ownerDetails.AdharNumber.trim() !== '') {
            password = ownerDetails.mobileNumber.slice(0, 4) + ownerDetails.AdharNumber.slice(-1);
        } else {
            let firstName = ownerDetails.firstName || '';
            firstName = firstName.padEnd(4, 'z').slice(0, 4); // Ensure at least 4 characters, fill with 'z' if needed
            password = ownerDetails.mobileNumber.slice(0, 4) + firstName;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user details into Users table
        const userResult = await transaction.request()
            .input('Username', sql.NVarChar, ownerDetails.mobileNumber) // Username is set to mobileNumber
            .input('MobileNo', sql.NVarChar, ownerDetails.mobileNumber)
            .input('EmailID', sql.NVarChar, ownerDetails.Email)
            .input('password', sql.NVarChar, password)
            .input('PasswordHash', sql.NVarChar, passwordHash)
            .input('CreatedBy', sql.NVarChar, ownerDetails.CreatedBy)
            .input('CreatedDate', sql.DateTime, new Date())
            .input('ModifiedBy', sql.NVarChar, ownerDetails.ModifiedBy)
            .input('ModifiedDate', sql.DateTime, ownerDetails.DateModified)
            .input('isAdmin', sql.Bit, 0)
            .input('IsActive', sql.Bit, 1)
            .input('ZoneID', sql.Int, parseInt(propertyDetails.zone))
            .input('Locality', sql.Int, parseInt(propertyDetails.locality))
            .input('Colony', sql.NVarChar, propertyDetails.colony)
            .input('GalliNumber', sql.NVarChar, propertyDetails.galliNumber)
            .input('HouseNumber', sql.Int, parseInt(propertyDetails.houseNumber))
            .input('GeoLocation', sql.NVarChar, `${specialConsideration.latitude},${specialConsideration.longitude}`)
            .query(`
                INSERT INTO Users (Username, MobileNo, EmailID, password, PasswordHash, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate, isAdmin, IsActive, ZoneID, Locality, Colony, GalliNumber, HouseNumber, GeoLocation)
                OUTPUT INSERTED.UserID
                VALUES (@Username, @MobileNo, @EmailID, @password, @PasswordHash, @CreatedBy, @CreatedDate, @ModifiedBy, @ModifiedDate, @isAdmin, @IsActive, @ZoneID, @Locality, @Colony, @GalliNumber, @HouseNumber, @GeoLocation)
            `);

        // Check if userResult.recordset is empty
        if (!userResult.recordset || userResult.recordset.length === 0) {
            throw new Error('Failed to insert user into Users table');
        }

        const userID = userResult.recordset[0].UserID;

        // Assign role to the user
        await transaction.request()
            .input('UserID', sql.Int, userID)
            .input('RoleID', sql.Int, 2) // RoleID = 2
            .input('CreatedBy', sql.NVarChar, ownerDetails.firstName)
            .query(`
                INSERT INTO UserRoles (UserID, RoleID, CreatedBy)
                VALUES (@UserID, @RoleID, @CreatedBy)
            `);

        console.log(`User created with UserID: ${userID} and assigned RoleID: 2`);




        // Insert family members if provided
        if (familyMembers && familyMembers.length > 0) {
            for (const member of familyMembers) {
                await transaction.request()
                    .input('ownerID', sql.Int, ownerID)
                    .input('Relation', sql.NVarChar, member.Relation)
                    .input('FirstName', sql.NVarChar, member.FirstName)
                    .input('LastName', sql.NVarChar, member.LastName)
                    .input('age', sql.NVarChar, member.age)
                    .input('DOB', sql.NVarChar, member.DOB)
                    .input('gender', sql.Char, member.gender)
                    .input('occupation', sql.NVarChar, member.occupation)
                    .input('Income', sql.NVarChar, member.Income)
                    .input('CreatedBy', sql.NVarChar, ownerDetails.CreatedBy)
                    .input('IsActive', sql.Bit, 1)
                    .query(`
                        INSERT INTO FamilyMember (OwnerID, Relation, FirstName, LastName, Age, DOB, Gender, Occupation, Income, CreatedBy, IsActive)
                        VALUES (@ownerID, @Relation, @FirstName, @LastName, @age, @DOB, @gender, @occupation, @Income, @CreatedBy, @IsActive)
                    `);
            }
        }

        // Insert property details
        const propertyResult = await transaction.request()
            .input('ownerID', sql.Int, ownerID)
            .input('PropertyMode', sql.NVarChar, propertyDetails.propertyMode)
            .input('PropertyAge', sql.NVarChar, propertyDetails.propertyAge)
            .input('RoomCount', sql.Int, parseInt(propertyDetails.roomCount))
            .input('FloorCount', sql.Int, parseInt(propertyDetails.floorCount))
            .input('ShopCount', sql.Int, parseInt(propertyDetails.shopCount))
            .input('ShopArea', sql.NVarChar, propertyDetails.ShopArea)
            .input('TenantCount', sql.Int, parseInt(propertyDetails.tenantCount))
            .input('TenantYearlyRent', sql.Int, parseInt(propertyDetails.TenantYearlyRent))
            .input('WaterHarvesting', sql.Bit, propertyDetails.waterHarvesting === 'Yes' ? 1 : 0)
            .input('Submersible', sql.Bit, propertyDetails.submersible === 'Yes' ? 1 : 0)
            .input('ZoneID', sql.Int, parseInt(propertyDetails.zone))
            .input('Locality', sql.Int, parseInt(propertyDetails.locality))
            .input('Colony', sql.NVarChar, propertyDetails.colony)
            .input('GalliNumber', sql.NVarChar, propertyDetails.galliNumber)
            .input('HouseNumber', sql.Int, parseInt(propertyDetails.houseNumber))
            .input('PrePropertyNo', sql.NVarChar, propertyDetails.prePropertyNo) // Added PrePropertyNo
            .input('RoadSize', sql.NVarChar, propertyDetails.RoadSize) // Added RoadSize
            .input('HouseType', sql.NVarChar, propertyDetails.HouseType)
            .input('OpenArea', sql.NVarChar, propertyDetails.OpenArea)
            .input('ConstructedArea', sql.NVarChar, propertyDetails.ConstructedArea)
            .input('BankAccountNumber', sql.VarChar, propertyDetails.bankAccountNumber)
            .input('Consent', sql.Bit, propertyDetails.consent === 'Yes' ? 1 : 0)
            .input('CreatedBy', sql.NVarChar, propertyDetails.CreatedBy)
            .input('IsActive', sql.Bit, 1)
            .query(`
                INSERT INTO Property (OwnerID, PropertyMode, PropertyAge, RoomCount, FloorCount, ShopCount, ShopArea, TenantCount, TenantYearlyRent, WaterHarvesting, Submersible, ZoneID, Locality, Colony, GalliNumber, HouseNumber, PrePropertyNo, RoadSize, HouseType, OpenArea, ConstructedArea, BankAccountNumber, Consent, CreatedBy, IsActive)
                OUTPUT INSERTED.PropertyID
                VALUES (@ownerID, @PropertyMode, @PropertyAge, @RoomCount, @FloorCount, @ShopCount, @ShopArea, @TenantCount, @TenantYearlyRent, @WaterHarvesting, @Submersible, @ZoneID, @Locality, @Colony, @GalliNumber, @HouseNumber, @PrePropertyNo, @RoadSize, @HouseType, @OpenArea, @ConstructedArea, @BankAccountNumber, @Consent, @CreatedBy, @IsActive)
            `);

        const propertyID = propertyResult.recordset[0].PropertyID;

        // Insert special consideration details
        if (specialConsideration) {
            await transaction.request()
                .input('ownerID', sql.Int, ownerID)
                .input('propertyID', sql.Int, propertyID)
                .input('ConsiderationType', sql.NVarChar, specialConsideration.considerationType)
                .input('Description', sql.NVarChar, specialConsideration.description)
                .input('GeoLocation', sql.NVarChar, `${specialConsideration.latitude},${specialConsideration.longitude}`)
                .input('CreatedBy', sql.NVarChar, specialConsideration.CreatedBy)
                .input('IsActive', sql.Bit, 1)
                .query(`
                    INSERT INTO SpecialConsideration (OwnerID, PropertyID, ConsiderationType, Description, GeoLocation, CreatedBy, IsActive)
                    VALUES (@ownerID, @propertyID, @ConsiderationType, @Description, @GeoLocation, @CreatedBy, @IsActive)
                `);
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Property details added successfully',
            ownerID: ownerID,
            propertyID: propertyID
        });
    } catch (error) {
        console.error('Error:', error);
        if (transaction) await transaction.rollback();
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    addOwnerProperty
};