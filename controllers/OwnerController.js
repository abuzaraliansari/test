const { sql, poolPromise } = require('../config/db');
const ownerDetails = require('../models/OwnerDetails');

// const jwt = require('jsonwebtoken');
// const express = require('express');
// const dotenv = require('dotenv');

// const app = express();
// app.use(express.json());
// dotenv.config();


// const tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
// const jwtSecretKey = process.env.JWT_SECRET_KEY;

// Controller for adding a property
const addOwner = async (req, res) => {
    // console.log(req.body);
    // try {
    //     const token = req.header(tokenHeaderKey);
    //     if (!token) {
    //         return res.status(401).json({ success: false, message: 'Access Denied: No token provided.' });
    //     }

    //     const verified = jwt.verify(token, jwtSecretKey);
    //     if (!verified) {
    //         return res.status(401).json({ success: false, message: 'Access Denied: Invalid token.' });
    //     }
    // } catch (error) {
    //     return res.status(401).json({ success: false, message: 'Access Denied: Token verification failed.', error: error.message });
    // }

    console.log(req.body);
        const { ownerDetails} = req.body;
    
    try {

      
        //validate(); // Validate the data
        const pool = await poolPromise;

        // Insert owner into PropertyOwner table and get the OwnerID
        const ownerResult = await pool.request()
            .input('firstName', sql.NVarChar, ownerDetails.firstName)
            .input('middleName', sql.NVarChar, ownerDetails.middleName)
            .input('lastName', sql.NVarChar, ownerDetails.lastName)
            .input('mobileNumber', sql.VarChar, ownerDetails.mobileNumber)
            .input('occupation', sql.NVarChar, ownerDetails.occupation)
            .input('age', sql.NVarChar, ownerDetails.age)
            .input('gender', sql.Char, ownerDetails.gender)
            .input('income', sql.NVarChar, ownerDetails.income)
            .input('religion', sql.NVarChar, ownerDetails.religion)
            .input('category', sql.NVarChar, ownerDetails.category)
            .input('createdBy', sql.NVarChar, ownerDetails.createdBy)
            .input('Email', sql.NVarChar, ownerDetails.Email)
            .input('PanNumber', sql.NVarChar, ownerDetails.PanNumber)
            .input('AdharNumber', sql.NVarChar, ownerDetails.AdharNumber)
            .input('NumberOfMembers', sql.Int, ownerDetails.NumberOfMembers)
            .input('Cast', sql.NVarChar, ownerDetails.Cast)
            .input('IsActive', sql.NVarChar, ownerDetails.IsActive)
            .query(`
                INSERT INTO PropertyOwner (FirstName, MiddleName, LastName, MobileNumber, Occupation, Age, Gender, Income, Religion, Category, CreatedBy, Email, PanNumber, AdharNumber, NumberOfMembers, Cast, IsActive)
                OUTPUT INSERTED.OwnerID
                VALUES (@firstName, @middleName, @lastName, @mobileNumber, @occupation, @age, @gender, @income, @religion, @category, @createdBy, @Email, @PanNumber, @AdharNumber, @NumberOfMembers, @Cast, @IsActive)
            `);

        if (ownerResult.recordset.length === 0) {
            return res.status(400).json({ success: false, message: 'Failed to add owner' });
        }

        const ownerID = ownerResult.recordset[0].OwnerID;

        res.status(201).json({
            success: true,
            message: 'Owner Details added successfully',
            ownerID: ownerID // Return the PropertyID if needed
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};


module.exports = {
    addOwner
};

