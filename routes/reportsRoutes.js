const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Group = require('../models/Group');

// // Get all reports
router.get('/', async (req, res) => {
  try {
    const reportsData = await Report.find();
    res.json(reportsData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get reports by teacher email
router.get('/teacher/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    // Check DB connection
    if (!Report.db.readyState || Report.db.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected', status: 'dead' });
    }

    // Fetch reports where either teacherEmail or email matches
    const reports = await Report.find({
      $or: [
        { teacherEmail: email },
        { email: email }
      ]
    }).sort({ createdAt: -1 });

    return res.json({ status: 'alive', count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 'dead' });
  }
});

// Get one report
router.get('/id/:id', getReport, (req, res) => {
  res.json(res.report);
});

// Create one report
// Create one report (store full details)
router.post('/', async (req, res) => {
  try {
    const {
      groupId,
      groupName: rawGroupName,
      group, // fallback support
      studentName: rawStudentName,
      student: legacyStudent,
      studentEmail,
      teacherEmail: rawTeacherEmail,
      score,
      totalQuestions,
      answers,
      testName,
      subject,
      standard,
      timeTaken,
      date
    } = req.body;

    // Resolve group and teacher
    let groupDoc = null;
    if (groupId) {
      groupDoc = await Group.findById(groupId).lean();
    } else if (rawGroupName || group) {
      groupDoc = await Group.findOne({ groupName: rawGroupName || group }).lean();
    }

    const teacherEmail = groupDoc?.teacherEmail || rawTeacherEmail || null;
    const groupName = groupDoc?.groupName || rawGroupName || group || null;
    const resolvedGroupId = groupDoc?._id || groupId || null;
    const studentName = rawStudentName || legacyStudent || null;

    const report = new Report({
      teacherEmail,
      studentEmail,
      studentName,
      groupId: resolvedGroupId,
      groupName,
      score,
      totalQuestions,
      answers,
      testName,
      subject,
      standard,
      timeTaken,
      date
    });

    const newReport = await report.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update one report
router.patch('/id/:id', getReport, async (req, res) => {
  if (req.body.email != null) {
    res.report.studentEmail = req.body.email; // backward compatibility
  }
  try {
    const updatedReport = await res.report.save();
    res.json(updatedReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete one report
router.delete('/id/:id', getReport, async (req, res) => {
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

// Get test completion status for a group
router.get('/group/:groupId/test/:testName/completion-status', async (req, res) => {
  try {
    const { groupId, testName } = req.params;

    // 1. Get all students in the group
    const group = await Group.findById(groupId).lean();
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    // Support both array of objects and array of emails
    let students = [];
    if (Array.isArray(group.students)) {
      if (typeof group.students[0] === 'object') {
        students = group.students.map(s => ({ name: s.name || s.studentName || '', email: s.email || s.studentEmail || '' }));
      } else {
        // If just array of emails, try to get names from another field if available
        students = group.students.map(email => ({ name: '', email }));
      }
    }

    // 2. Get all reports for this group and test
    const reports = await Report.find({ groupId, testName }).lean();

    // 3. Build sets for finished students (by email)
    const finishedEmailSet = new Set(reports.map(r => r.studentEmail));

    // 4. Split students into finished and not finished
    const finished = [];
    const notFinished = [];
    students.forEach(s => {
      if (finishedEmailSet.has(s.email)) {
        finished.push({ name: s.name, email: s.email });
      } else {
        notFinished.push({ name: s.name, email: s.email });
      }
    });

    res.json({
      groupId,
      testName,
      totalStudents: students.length,
      finishedCount: finished.length,
      notFinishedCount: notFinished.length,
      finished,
      notFinished
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;