const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const authRoutes = require('./routes/authRoutes');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer(); // For handling in-memory file uploads

require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/auth', authRoutes);

// Test route
app.get('/test', (req, res) => {
    res.send('Hello World!');
});

// Send Certificate Email
app.post('/mail', upload.single('certificate'), async (req, res) => {
    const { to, fullName, category, eventName, position, date } = req.body;
    const certificate = req.file; // The uploaded PDF file

    if (!to || !fullName || !eventName || !category || !date || !certificate) {
        return res.status(400).send({
            success: false,
            message: 'Missing required fields or certificate file',
        });
    }

    const subject = ' Your Winner’s Certificate from CNCG Mission Olly – Victory Achieved!';
    const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Dear <strong>${fullName}</strong>,</p>

        <p>Congratulations on securing <strong>2st</strong> Place in <strong>CNCG Mission Olly: Panic at the Pod</strong>!</p>

        <p>
          Your performance truly stood out, and we’re thrilled to celebrate your achievement. As a token of our appreciation and recognition of your outstanding performance, please find your <strong>Certificate of Winning</strong> attached to this email.
        </p>

        <p>
          We hope the experience inspired you as much as your presence inspired us. Let’s keep the momentum going!
        </p>

        <p>
          📣 <strong>We’d love your feedback:</strong><br>
          👉 <a href="https://forms.gle/K3QXJwc8R5P9e4rw7" target="_blank">Submit Feedback Here</a>
        </p>

        <p>
          🔗 <strong>Stay connected with the CNCG Noida community:</strong><br>
          • Follow us on LinkedIn: 
          <a href="https://www.linkedin.com/company/cloud-native-noida" target="_blank">Cloud Native Noida</a><br>
          • Join our WhatsApp Community: 
          <a href="https://chat.whatsapp.com/Brhc38vAug112AVNr1GYgW" target="_blank">Click to Join</a>
        </p>

        <p>We’re building something amazing together – and we want you to be a part of it.</p>

        <p>Until the next mission,<br>
        <strong>Team CNCG Noida</strong></p>

      </body>
    </html>
    `;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password',
            },
        });

        await transporter.sendMail({
            from: `"CNCG Noida" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html, // Use the HTML content here
            attachments: [
                {
                    filename: `${fullName}_certificate.pdf`,
                    content: certificate.buffer, // Use the uploaded file's buffer
                },
            ],
        });

        res.send({ success: true, message: 'Email sent successfully' });
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).send({ success: false, error: err.message });
    }
});
// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
