const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// Simulated Redis or in-memory store
const otpStore = {};

// Validate Indian phone number
const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);

// Send OTP via Fast2SMS
router.post('/send', async (req, res) => {
  const { phone } = req.body;

  if (!validatePhone(phone)) {
    return res.status(400).json({ success: false, message: 'Invalid phone number' });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'dlt',
      sender_id: 'GYRUSN', // DLT-approved sender ID
      message: '189108', // DLT-approved message template ID
      variables_values: otp, // OTP as the variable value for {#var#} in template
      flash: 0,
      numbers: phone // Single phone number
      // schedule_time is omitted as it's null by default
    }, {
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    if (response.data.return) {
      otpStore[phone] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // Store OTP with 5-minute expiration
      res.json({ success: true, message: 'OTP sent successfully', request_id: response.data.request_id });
    } else {
      res.status(500).json({ success: false, message: 'OTP sending failed', response: response.data });
    }
  } catch (error) {
    console.error('Fast2SMS OTP send error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
});

// Verify OTP
router.post('/verify', (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
  }

  const stored = otpStore[phone];
  if (!stored || stored.expires < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
  }

  if (stored.otp === otp) {
    delete otpStore[phone]; // Clear OTP after successful verification
    res.json({ success: true, message: 'OTP verified' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

module.exports = router;



// const express = require('express');
// const axios = require('axios');
// const router = express.Router();
// require('dotenv').config();

// // Simulated Redis client (replace with actual Redis in production)
// const otpStore = {};

// // 2Factor Credentials
// const API_KEY = process.env.TWO_FACTOR_API_KEY;
// const SENDER_ID = 'GYRUSO';
// const TEMPLATE_ID = '1207174377400483683';
// // Validate phone number (basic example for Indian numbers)
// const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);

// // Send OTP
// router.post('/send', async (req, res) => {
//   const { phone } = req.body;

//   if (!validatePhone(phone)) {
//     return res.status(400).json({ success: false, message: 'Invalid phone number' });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   try {
//     const response = await axios.get(
//       `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/${otp}/${TEMPLATE_ID}`,
//       { timeout: 5000 } // Add timeout for API call
//     );

//     otpStore[phone] = { otp, expires: Date.now() + 30 * 60 * 1000 };
//     res.json({ success: true, message: 'OTP sent', response: response.data });
//   } catch (error) {
//     console.error('OTP send error:', error.message); // Log for debugging
//     res.status(500).json({ success: false, message: 'Failed to send OTP' });
//   }
// });

// // Verify OTP
// router.post('/verify', (req, res) => {
//   const { phone, otp } = req.body;

//   const stored = otpStore[phone];
//   if (!stored || stored.expires < Date.now()) {
//     return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
//   }

//   if (stored.otp === otp) {
//     delete otpStore[phone];
//     res.json({ success: true, message: 'OTP verified' });
//   } else {
//     res.status(400).json({ success: false, message: 'Invalid OTP' });
//   }
// });

// module.exports = router;
