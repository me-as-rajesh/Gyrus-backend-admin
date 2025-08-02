const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../models/Student');
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
router.get('/teacher-data/:email', async (req, res) => {
  try {
    const teacherEmail = req.params.email;

    // Step 1: Find the teacher by email and populate groups and tests
    const teacherData = await Group.aggregate([
      // Match groups by teacher email
      {
        $match: { teacherEmail: teacherEmail },
      },
      // Lookup tests for each group
      {
        $lookup: {
          from: 'tests', // The collection name for Test model
          localField: '_id',
          foreignField: 'groupId',
          as: 'tests',
        },
      },
      // Group all data to avoid duplicate teacher info
      {
        $group: {
          _id: null,
          groups: {
            $push: {
              _id: '$_id',
              groupName: '$groupName',
              section: '$section',
              students: '$students',
              maxStudents: '$maxStudents',
              currentStudentCount: '$currentStudentCount',
              createdAt: '$createdAt',
              tests: '$tests',
            },
          },
        },
      },
      // Lookup teacher details
      {
        $lookup: {
          from: 'teachers', // The collection name for Teacher model
          let: { email: teacherEmail },
          pipeline: [{ $match: { $expr: { $eq: ['$email', '$$email'] } } }],
          as: 'teacher',
        },
      },
      // Unwind teacher to get a single object
      {
        $unwind: '$teacher',
      },
      // Project the final structure
      {
        $project: {
          _id: 0,
          teacher: {
            _id: '$teacher._id',
            name: '$teacher.name',
            email: '$teacher.email',
            dob: '$teacher.dob',
            department: '$teacher.department',
            createdAt: '$teacher.createdAt',
          },
          groups: 1,
        },
      },
    ]);

    // Check if data was found
    if (!teacherData || teacherData.length === 0) {
      return res.status(404).json({ message: 'No data found for this teacher email' });
    }

    // Return the aggregated data
    res.status(200).json(teacherData[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET API to fetch group, tests, and teacher by student name and regNo
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

    // Step 2: Find tests associated with the group
    const tests = await Test.find({ groupId: group._id }).lean();

    // Step 3: Fetch teacher details using teacherEmail from the group
    const teacher = await mongoose.model('Teacher').findOne({ email: group.teacherEmail }).lean();
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Step 4: Construct the response
    const response = {
      success: true,
      data: {
        student: {
          name,
          regNo,
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