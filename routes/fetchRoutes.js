// fetchRoutes.js
const express = require('express');
const router = express.Router();
const Teacher = require('../models/Fetch'); // Adjust path as needed

// GET teacher by ID (example)
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

// ✅ NEW: GET teacher by email
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
// GET all teachers (optional)
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;