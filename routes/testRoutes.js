// routes/testRoutes.js
const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Group = require('../models/Group');

// @desc    Get tests for a group
// @route   GET /api/tests
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { groupId } = req.query;
    
    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    const tests = await Test.find({ groupId }).sort({ date: -1 });
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Create a new test
// @route   POST /api/tests
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { testName, date, time, subject, mcqCount, groupId } = req.body;

    // Validation
    if (!testName || !date || !time || !groupId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['testName', 'date', 'time', 'groupId'] 
      });
    }

    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const newTest = new Test({
      testName,
      date,
      time,
      subject,
      mcqCount,
      groupId
    });

    await newTest.save();
    res.status(201).json(newTest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get tests for a student (based on their group)
// @route   GET /api/tests/student
// @access  Private
router.get('/student', async (req, res) => {
  try {
    const { groupId } = req.query;
    
    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Find tests for the group that are on or after today
    const tests = await Test.find({ 
      groupId,
      date: { $gte: currentDate }
    }).sort({ date: 1 }); // Sort by date ascending
    
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all tests for all groups of a teacher
router.get('/teacher-tests/arun@gmail.com', async (req, res) => {
    try {
        const teacherEmail = req.params.teacherEmail;
        
        // 1. Find all groups for this teacher
        const groups = await Group.find({ teacherEmails: teacherEmail });
        
        // 2. Get all group IDs
        const groupIds = groups.map(group => group._id);
        
        // 3. Find all tests for these groups
        const tests = await Test.find({ groupId: { $in: groupIds } })
                               .sort({ date: -1 }); // Sort by date descending
        
        res.json(tests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;