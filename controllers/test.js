const { sql, poolPromise } = require('../config/db');
const { response } = require('express');

const addOwnerProperty = async (req, res) => {
    const { ownerDetails, familyMembers, propertyDetails, specialConsideration } = req.body;

    if (!ownerDetails) {
        return res.status(400).json({ success: false, message: 'Owner details are required' });
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

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
console.log(ownerID)
console.log(ownerResult)
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
            .input('HouseType', sql.NVarChar, propertyDetails.HouseType)
            .input('OpenArea', sql.NVarChar, propertyDetails.OpenArea)
            .input('ConstructedArea', sql.NVarChar, propertyDetails.ConstructedArea)
            .input('BankAccountNumber', sql.VarChar, propertyDetails.bankAccountNumber)
            .input('Consent', sql.Bit, propertyDetails.consent === 'Yes' ? 1 : 0)
            .input('CreatedBy', sql.NVarChar, propertyDetails.CreatedBy)
            .input('IsActive', sql.Bit, 1)
            .query(`
                INSERT INTO Property (OwnerID, PropertyMode, PropertyAge, RoomCount, FloorCount, ShopCount, ShopArea, TenantCount, TenantYearlyRent, WaterHarvesting, Submersible, ZoneID, Locality, Colony, GalliNumber, HouseNumber, HouseType, OpenArea, ConstructedArea, BankAccountNumber, Consent, CreatedBy, IsActive)
                OUTPUT INSERTED.PropertyID
                VALUES (@ownerID, @PropertyMode, @PropertyAge, @RoomCount, @FloorCount, @ShopCount, @ShopArea, @TenantCount, @TenantYearlyRent, @WaterHarvesting, @Submersible, @ZoneID, @Locality, @Colony, @GalliNumber, @HouseNumber, @HouseType, @OpenArea, @ConstructedArea, @BankAccountNumber, @Consent, @CreatedBy, @IsActive)
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
        console.error('Error fdff:', error);
        if (transaction) await transaction.rollback();
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    addOwnerProperty
};