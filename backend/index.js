const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Zoho SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_USER,
    pass: process.env.ZOHO_APP_PASSWORD,
  },
});

// Verify SMTP Connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Error:", error);
  } else {
    console.log("✅ Zoho SMTP Connected Successfully");
  }
});

app.post("/send-email", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required!",
    });
  }

  try {
    const mailOptions = {
      from: `"Digixta Contact Form" <${process.env.ZOHO_USER}>`,
      to: process.env.ZOHO_USER,
      replyTo: email,
      subject: `New Contact Form: ${subject}`,
      html: `
        <h2>📩 New Contact Form Submission</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>

        <hr />

        <h3>Message</h3>

        <p>${message.replace(/\n/g, "<br>")}</p>

        <hr />

        <small>Received: ${new Date().toLocaleString()}</small>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully!",
    });
  } catch (error) {
    console.error("❌ Email Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email.",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});