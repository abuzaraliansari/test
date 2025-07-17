const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const authRoutes = require('./routes/authRoutes');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer(); // For handling in-memory file uploads
const XLSX = require('xlsx');
const puppeteer = require('puppeteer');

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

    const subject = '🎫 Your Entry Pass for Kube & AI – 21st June at Microsoft Noida';
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Kube & AI – Entry Pass</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px;">
        <table style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <tr>
            <td>
              <h2 style="color: #2d79c7;">🎫 Your Entry Pass for Kube & AI</h2>
              <p>Hi <strong>${fullName}</strong>,</p>

              <p>Thank you for confirming your participation in <strong>Kube & AI</strong>, happening on <strong>Saturday, 21st June 2025</strong> at <strong>Microsoft Office, Noida</strong>.</p>

              <h3 style="color: #2d79c7;">📌 Entry Ticket</h3>
              <p>Please find your <strong>event pass attached</strong> to this email. <br />
                <span style="color: red;"><strong>This ticket is mandatory for entry</strong></span> and will be checked at the registration desk. Please carry a <strong>digital or printed copy</strong> with you.</p>

              <h3 style="color: #2d79c7;">📍 Venue Details</h3>
              <p>
                <strong>Microsoft Office – Noida</strong><br />
                Sovereign Capital Gate, Floor – 6,<br />
                F.C. 12, Sector 16A,<br />
                Noida – 201301, Uttar Pradesh, India<br />
                <a href="https://maps.app.goo.gl/Q3rbGNARNM56ufV28" target="_blank" style="color: #2d79c7;">📍 View on Google Maps</a>
              </p>

              <p>
                🕘 <strong>Registration Starts:</strong> 9:00 AM<br />
                🗣 <strong>Event Begins:</strong> 9:30 AM
              </p>

              <h3 style="color: #2d79c7;">🚗 Parking</h3>
              <p>
                If you’ve requested parking, please ensure you’ve submitted your <strong>vehicle number</strong> in advance for security clearance.
              </p>

              <h3 style="color: #2d79c7;">📞 Need Help?</h3>
              <p>
                If you have any questions, feel free to reach out to:<br />
                <strong>Hemant Singh Rathore</strong> – <a href="tel:+918898944389" style="color: #2d79c7;">88989 44389</a><br />
                <strong>Rahul Sharma</strong> – <a href="tel:+917015256657" style="color: #2d79c7;">70152 56657</a>
              </p>

              <p>We look forward to welcoming you at <strong>Kube & AI</strong> – get ready for a day full of learning, networking, and cloud-native innovation!</p>

              <p style="margin-top: 30px;">Warm regards,<br />
              <strong>Kube & AI Organizing Team</strong><br />
              <em>CNCF | Cloud Native Noida Chapter</em></p>
            </td>
          </tr>
        </table>
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
                    filename: `${fullName}_Ticket.pdf`,
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


app.post('/bulk-mail', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Parse Excel
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Launch Puppeteer once for all PDFs
    const browser = await puppeteer.launch();
    let sent = 0, failed = 0, errors = [];

    for (const row of data) {
        const {
            "Full Name": fullName,
            "Email Address": to,
            "Category": category,
            "Event Name": eventName,
            "Position": position,
            "Date": date
        } = row;

        // Read the background image and convert to base64
        const bgPath = path.join(__dirname, 'uploads', 'na.png');
        let bgBase64 = '';
        try {
            const bgBuffer = fs.readFileSync(bgPath);
            bgBase64 = `data:image/png;base64,${bgBuffer.toString('base64')}`;
        } catch (e) {
            console.error('Background image not found or error reading:', e);
        }


        // Generate HTML for certificate with background image
        const certHtml = `
        <html>
        <head>
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet">
        <style>
        html, body { height: 100%; margin: 0; padding: 0; }
        body { font-family: Arial; background: #222; height: 100%; }
        .certificate-wrapper {
            width: 1000px;
            height: 690px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #fff;
            border: 4px solid #fff;
            border-radius: 8px;
            overflow: hidden;
        }
        .certificate-bg {
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 0;
        }
        .center-content {
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
        }
        .name {
            font-family: 'Great Vibes', cursive, Arial, sans-serif;
            font-size: 3.5em;
            font-weight: bold;
            color: black;
            background: rgba(255,255,255,0.0);
            letter-spacing: 1px;
            border-radius: 8px;
            text-align: center;
            word-break: break-word;
            white-space: pre-line;
            position: absolute;
            top: 35%;
            left: 50%;
            transform: translate(-50%, 0);
            width: 80%;
            display: block;
            line-height: 1.1;
        }
        </style>
        </head>
        <body>
        <div class="certificate-wrapper">
            <img class="certificate-bg" src="${bgBase64}" />
            <div class="center-content">
                <div class="name">${fullName}</div>
            </div>
        </div>
        </body>
        </html>
        `;

        // Generate PDF using Puppeteer
        let pdfBuffer;
        try {
            const page = await browser.newPage();
            await page.setContent(certHtml, { waitUntil: 'networkidle0' });
            pdfBuffer = await page.pdf({ width: '1000px', height: '700px', printBackground: true });
            await page.close();
        } catch (err) {
            failed++;
            errors.push({ to, error: 'PDF generation failed', details: err.message });
            continue;
        }

        // Email content
        const subject = '🎓 Certificate of Attending Kube & AI – 21st June at Microsoft Noida';
        const html =`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Certificate of Attending – Kube & AI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px;">
        <table style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <tr>
            <td>
              <h2 style="color: #2d79c7;">🎓 Certificate of Attending</h2>
              <p>Dear <strong>${fullName}</strong>,</p>

              <p>Thank you for being a part of <strong>Kube & AI</strong> – 21st June at Microsoft Noida.</p>

              <p>We truly appreciate your attendance and energy during the event. As a token of our appreciation, please find your <strong>Certificate of Attending</strong> attached to this email.</p>

              
              <p>We hope the experience inspired you as much as your presence inspired us. Let’s keep the momentum going!</p>

              <p style="font-size:1.1em; margin-bottom: 18px;">
                📣 We’d love your feedback:<br>
                👉 <a href="https://docs.google.com/forms/u/0/d/1D8jVKNv6daJ-bh_A5ivkU8XXaDndmXHdo_AS2nTIxJk/viewform?edit_requested=true" target="_blank" style="color:#2d79c7; text-decoration:underline;">Submit Feedback Here</a>
              </p>
              <h3 style="color: #2d79c7;">🔗 Stay connected with the CNCG Noida community:</h3>
              <ul>
                <li>Follow us on LinkedIn: <a href="https://www.linkedin.com/company/cloud-native-noida" target="_blank">Cloud Native Noida</a></li>
                <li>Join our WhatsApp Community: <a href="https://chat.whatsapp.com/Brhc38vAug112AVNr1GYgW" target="_blank">Click to Join</a></li>
              </ul>

              <p>We’re building something amazing together – and we want you to be a part of it.</p>

              <p style="margin-top: 30px;">Until the next mission,<br />
              <strong>Team CNCG Noida</strong></p>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;

        // Send email
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
                html,
                attachments: [
                    {
                        filename: `${fullName}_Certificate.pdf`,
                        content: pdfBuffer,
                    },
                ],
            });
            sent++;
        } catch (err) {
            failed++;
            errors.push({ to, error: 'Email send failed', details: err.message });
        }
    }

    await browser.close();
    res.json({ success: true, sent, failed, errors });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});