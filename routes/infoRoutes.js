// routes/infoRoutes.js
const express = require('express');
const router = express.Router();
const Group = require('../models/info');
const Test = require('../models/Test');

// Get all groups for a teacher by email
router.get('/teacher/:email', async (req, res) => {
  try {
    const groups = await Group.find({ teacherEmail: req.params.email });
    res.json({ success: true, data: groups });
  } catch (err) {
    console.error('Error fetching group info:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch group info' });
  }
});


router.get('/group-with-tests/:groupId', async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // 1. Fetch group
    const group = await Group.findById(groupId).lean(); 

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // 2. Fetch all tests related to this group
    const tests = await Test.find({ groupId });

    // 3. Attach tests to the group
    group.tests = tests;

    res.json({ success: true, data: group });
  } catch (err) {
    console.error('Error fetching group with tests:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});



module.exports = router;
