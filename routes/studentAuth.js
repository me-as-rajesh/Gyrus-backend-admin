const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Group = require('../models/Group');
const Test = require('../models/Test');

// Student login
router.post('/login', async (req, res) => {
  try {
    const { name, regNo } = req.body;
    console.log('Login request received:', req.body);

    // Step 1: Validate input fields
    if (!name || !regNo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          regNo: !regNo ? 'Registration number is required' : null,
        },
      });
    }

    // Step 2: Find the group containing the student in its students array
    const group = await Group.findOne({
      students: {
        $elemMatch: {
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          regNo: regNo.toUpperCase(),
        },
      },
    }).lean();

    if (!group) {
      return res.status(401).json({ success: false, message: 'Student not found in any group' });
    }

    // Step 3: Find tests associated with the group
    const tests = await Test.find({ groupId: group._id }).lean();

    // Step 4: Fetch teacher details using teacherEmail from the group
    const teacher = await mongoose.model('Teacher').findOne({ email: group.teacherEmail }).lean();
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Step 5: Construct the response
    const response = {
      success: true,
      data: {
        student: {
          name,
          regNo,
        },
        group: {
          id: group._id,
          name: group.groupName,
          section: group.section,
          maxStudents: group.maxStudents,
          currentStudentCount: group.currentStudentCount,
          createdAt: group.createdAt,
        },
        tests,
        teacher: {
          name: teacher.name,
          email: teacher.email,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error during student login:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET API to fetch all data for a teacher by email
router.get('/student-data/:name/:regNo', async (req, res) => {
  try {
    const { name, regNo } = req.params;

    // Step 1: Find the group containing the student in its students array
    const group = await Group.findOne({
      students: {
        $elemMatch: {
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          regNo: regNo.toUpperCase(),
        },
      },
    }).lean();

    if (!group) {
      return res.status(404).json({ success: false, message: 'Student not found in any group' });
    }

    // Step 2: Find the student object in the group's students array
    const student = group.students.find(
      s => s.name.toLowerCase() === name.toLowerCase() && s.regNo.toUpperCase() === regNo.toUpperCase()
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student details not found in group' });
    }

    // Step 3: Find tests associated with the group
    const tests = await Test.find({ groupId: group._id }).lean();

    // Step 4: Fetch teacher details using teacherEmail from the group
    const teacher = await mongoose.model('Teacher').findOne({ email: group.teacherEmail }).lean();
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Step 5: Construct the response
    const response = {
      success: true,
      data: {
        student: {
          name: student.name,
          regNo: student.regNo,
          email: student.email,
          gender: student.gender,
          dob: student.dob,
        },
        group: {
          _id: group._id,
          groupName: group.groupName,
          section: group.section,
          maxStudents: group.maxStudents,
          currentStudentCount: group.currentStudentCount,
          createdAt: group.createdAt,
        },
        tests,
        teacher: {
          name: teacher.name,
          email: teacher.email,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;