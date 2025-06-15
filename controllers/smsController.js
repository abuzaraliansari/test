const twilio = require('twilio');
const { sql, poolPromise } = require('../config/db');

// Twilio credentials
const accountSid = 'AC9f09ddc35a39ceea3c7c3e36be7cae19';
const authToken = '7fec610408c69f694060a172d857e0fd';
const client = twilio(accountSid, authToken);

// Generate a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendSms = async (req, res) => {
    const { mobileNumber } = req.body;
  
    if (!mobileNumber) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
  
    const otp = generateOtp();
  
    try {
      const pool = await poolPromise;
  
      // Store the mobile number and OTP in the database
      const result = await pool
        .request()
        .input('mobileNumber', sql.VarChar, mobileNumber)
        .query('SELECT * FROM otp WHERE mobilenumber = @mobileNumber');
  
      if (result.recordset.length > 0) {
        // Update the existing record
        await pool
          .request()
          .input('mobileNumber', sql.VarChar, mobileNumber)
          .input('otpCode', sql.VarChar, otp)
          .query(
            'UPDATE otp SET OTP = @otpCode, CreatedDate = GETDATE() WHERE mobilenumber = @mobileNumber'
          );
      } else {
        // Insert a new record
        await pool
          .request()
          .input('mobileNumber', sql.VarChar, mobileNumber)
          .input('otpCode', sql.VarChar, otp)
          .query(
            'INSERT INTO otp (mobilenumber, OTP) VALUES (@mobileNumber, @otpCode)'
          );
      }
  
      // Send OTP via SMS to the hardcoded number +919990553762
      const response = await client.messages.create({
        body: `Your OTP is: ${otp}`,
        from: '+16189360376', // Your Twilio phone number
        to: '+919990553762', // Hardcoded default number
      });
  
      res.status(200).json({ success: true, message: 'OTP sent successfully', data: response });
    } catch (error) {
      console.error('Error sending OTP:', error.message);
      res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
    }
  };


const sendWhatsAppMessage = async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ success: false, message: 'Recipient number and message are required' });
  }

  try {
    const response = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Twilio's WhatsApp sandbox number
      to: `whatsapp:${to}`, // Recipient's WhatsApp number
    });

    res.status(200).json({ success: true, message: 'WhatsApp message sent successfully', data: response });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send WhatsApp message', error: error.message });
  }
};


const verifyOtp = async (req, res) => {
    const { mobileNumber, otp } = req.body;
  
    if (!mobileNumber || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }
  
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('mobileNumber', sql.VarChar, mobileNumber)
        .input('otp', sql.NVarChar, otp)
        .query(
          `SELECT TOP 1 * 
           FROM otp 
           WHERE mobilenumber = @mobileNumber AND OTP = @otp AND CreatedDate > DATEADD(MINUTE, -5, GETDATE())`
        );
  
      if (result.recordset.length > 0) {
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error.message);
      res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
    }
  };

module.exports = { sendSms, sendWhatsAppMessage, verifyOtp };