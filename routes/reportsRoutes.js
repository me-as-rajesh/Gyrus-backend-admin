const express = require('express');
const router = express.Router();
const Report = require('../models/Report'); // Adjust path as needed

// // Get all reports
// router.get('/', async (req, res) => {
//   try {
//     const reportsData = await Report.find();
//     res.json(reportsData);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// ✅ Get reports by teacher email
router.get('/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const reports = await Report.find({ email: email });
    
    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports found for this email.' });
    }

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one report
router.get('/:id', getReport, (req, res) => {
  res.json(res.report);
});

// Create one report
router.post('/', async (req, res) => {
  const report = new Report({
    email: req.body.email
  });
  try {
    const newReport = await report.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update one report
router.patch('/:id', getReport, async (req, res) => {
  if (req.body.email != null) {
    res.report.email = req.body.email;
  }
  try {
    const updatedReport = await res.report.save();
    res.json(updatedReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete one report
router.delete('/:id', getReport, async (req, res) => {
  try {
    await res.report.deleteOne(); // Use deleteOne instead of remove
    res.json({ message: 'Deleted Report' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getReport(req, res, next) {
  let report;
  try {
    report = await Report.findById(req.params.id);
    if (report == null) {
      return res.status(404).json({ message: 'Cannot find report' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.report = report;
  next();
}

module.exports = router;