const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,  // Your app email e.g., dpamisapp@gmail.com
    pass: process.env.SMTP_PASS   // App password you generate
  }
});

// Test connection (optional)
transporter.verify((err, success) => {
  if (err) {
    console.error('Email transporter error:', err);
  } else {
    console.log('Email transporter ready');
  }
});

module.exports = transporter;
