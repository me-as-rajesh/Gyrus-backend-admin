// fetchRoutes.js
const express = require('express');
const router = express.Router();
const Teacher = require('../models/Fetch');
const nodemailer = require('nodemailer');
require('dotenv').config();

// GET teacher by ID
router.get('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET teacher by email
router.get('/teachers/email/:email', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ email: req.params.email });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST contact admin
router.post('/contact-admin', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New Contact Message from ${name}`,
      text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

module.exports = router;


// // fetchRoutes.js
// const express = require('express');
// const router = express.Router();
// const Teacher = require('../models/Fetch'); // Adjust path as needed

// // GET teacher by ID (example)
// router.get('/teachers/:id', async (req, res) => {
//   try {
//     const teacher = await Teacher.findById(req.params.id);
//     if (!teacher) {
//       return res.status(404).json({ message: 'Teacher not found' });
//     }
//     res.json(teacher);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ✅ NEW: GET teacher by email
// router.get('/teachers/email/:email', async (req, res) => {
//   try {
//     const teacher = await Teacher.findOne({ email: req.params.email });
//     if (!teacher) {
//       return res.status(404).json({ message: 'Teacher not found' });
//     }
//     res.json(teacher);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
// // GET all teachers (optional)
// router.get('/teachers', async (req, res) => {
//   try {
//     const teachers = await Teacher.find();
//     res.json(teachers);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;