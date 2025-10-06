const express = require('express');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.COMPANY_EMAIL,
    pass: process.env.COMPANY_PASSWORD,
  },
});

const otpStore = {};

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
}

function setOTPExpiry() {
  return Date.now() + 5 * 60 * 1000; // 5 minutes
}
// POST /api/teachers/join-request - Create teacher join request
router.post('/join-request', async (req, res) => {
  try {
    const { name, email, dob, department, password, phone, school } = req.body;
    
    if (!name || !email || !dob || !department || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          dob: !dob ? 'Date of birth is required' : null,
          department: !department ? 'Department is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password too short',
        details: { password: 'Password must be at least 8 characters long' }
      });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ 
        error: 'Email already exists',
        details: { email: 'This email is already registered' }
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const teacher = new Teacher({
      name,
      email,
      dob: new Date(dob),
      department,
      password: hashedPassword,
      phone,
      school,
      status: 'pending'
    });

    await teacher.save();
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      details: error.errors 
    });
  }
});

// PATCH /api/teachers/join-requests/:id - Update join request status
router.patch('/join-requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/teachers/join-requests/pending - Get all pending join requests
router.get('/join-requests/pending', async (req, res) => {
  try {
    const pendingRequests = await Teacher.find({ status: 'pending' });
    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (teacher.status !== 'approved') {
      return res.status(403).json({ error: 'Account not approved' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate and store OTP
    const otp = generateOTP();
    const expires = setOTPExpiry();
    otpStore[email] = { otp, expires };

    // Send OTP via email
await transporter.sendMail({
  from: process.env.COMPANY_EMAIL,
  to: email,
  subject: "Your One-Time Password (OTP) for Login",
  text: `Dear Teacher,

Your secure 6-digit OTP is: ${otp}

Please use this code to complete your login. It will expire in 5 minutes for security reasons.

If you did not request this OTP, please ignore this message.

Best regards,  
The Team`,
});


    // Return success but require OTP next (e.g., frontend prompts for OTP)
    res.status(200).json({ 
      message: 'OTP sent to your email. Please enter it to complete login.',
      email: email // For frontend to know which email
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// New route: POST /api/teachers/verify-otp (to complete login after OTP)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }

    const stored = otpStore[email];
    if (!stored || Date.now() > stored.expires) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    if (stored.otp !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Clear OTP
    delete otpStore[email];

    // Generate JWT token (as in original nodeMail.js)
    const token = jwt.sign({ email, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Fetch teacher data (exclude password)
    const teacher = await Teacher.findOne({ email }).select('-password');

    res.status(200).json({ 
      message: 'Login successful',
      token,
      teacher 
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});


// READ ALL - GET /api/teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// READ ONE - GET /api/teachers/:id
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher || teacher.status !== 'approved') {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE - PUT /api/teachers/:id
router.put('/:id', async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        dob: req.body.dob ? new Date(req.body.dob) : undefined
      },
      { new: true, runValidators: true }
    );

    if (!teacher || teacher.status !== 'approved') {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({
      error: error.message,
      details: error.errors
    });
  }
});

// DELETE - DELETE /api/teachers/:id
router.delete('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET by email - GET /api/teachers/email/:email
router.get('/email/:email', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ email: req.params.email });
    if (!teacher || teacher.status !== 'approved') {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;