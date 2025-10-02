// const express = require("express");
// const nodemailer = require("nodemailer");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const router = express.Router();

// // Fake DB (replace with real DB later)
// let users = {};

// function generatePassword() {
//   return Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digit
// }

// // Configure Nodemailer
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.COMPANY_EMAIL,
//     pass: process.env.COMPANY_PASSWORD,
//   },
// });

// // Register Route - Send email with password
// router.post("/register", async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) return res.status(400).json({ error: "Email required" });

//     const plainPassword = generatePassword();
//     const hashedPassword = await bcrypt.hash(plainPassword, 10);

//     users[email] = hashedPassword;

//     await transporter.sendMail({
//       from: process.env.COMPANY_EMAIL,
//       to: email,
//       subject: "Your Student Login Password",
//       text: `Hello Student, your login password is: ${plainPassword}`,
//     });

//     res.json({ message: "Password sent to student email" });
//   } catch (err) {
//     console.error("Error in register:", err);
//     res.status(500).json({ error: "Error sending mail" });
//   }
// });

// // Login Route
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!users[email]) return res.status(400).json({ error: "Email not found" });

//     const match = await bcrypt.compare(password, users[email]);
//     if (!match) return res.status(400).json({ error: "Invalid password" });

//     const token = jwt.sign({ email }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({ message: "Login successful", token });
//   } catch (err) {
//     console.error("Error in login:", err);
//     res.status(500).json({ error: "Login failed" });
//   }
// });

// module.exports = router;
