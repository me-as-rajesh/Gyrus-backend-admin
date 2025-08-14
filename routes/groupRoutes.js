const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Teacher = require('../models/Teacher');
const mongoose = require('mongoose');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { groupName, class: classValue, section, teacherEmail, students } = req.body;

    // Validation
    if (!groupName || !classValue || !section || !teacherEmail) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['groupName', 'class', 'section', 'teacherEmail']
      });
    }

    // Verify teacher exists
    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const newGroup = new Group({
      groupName,
      class: classValue,
      section,
      teacherEmail,
      students: students || [],
      maxStudents: req.body.maxStudents || 100
    });

    await newGroup.save();

    // Update teacher's groups array
    await Teacher.findOneAndUpdate(
      { email: teacherEmail },
      { $addToSet: { groups: newGroup._id } }
    );

    res.status(201).json(newGroup);
  } catch (err) {
    handleError(res, err);
  }
});

// @desc    Get all groups
// @route   GET /api/groups
// @access  Public
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('teacherEmail', 'name email department')
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    handleError(res, err);
  }
});

// @desc    Get groups by teacher email
// @route   GET /api/groups/teacher/:email
// @access  Private
router.get('/teacher/:email', async (req, res) => {
  try {
    const groups = await Group.find({ teacherEmail: req.params.email })
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    handleError(res, err);
  }
});
// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid group ID format" });
    }

    const group = await Group.findById(req.params.id)
      .populate('teacherEmail', 'name email department');  // Populate teacher info

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(group);  // Includes embedded students
  } catch (err) {
    console.error("Group fetch error:", err);
    res.status(500).json({ error: "Failed to fetch group" });
  }
});
// @desc    Get single group with full details
// @route   GET /api/groups/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid group ID format' });
    }

    const group = await Group.findById(req.params.id)
      .populate('teacherEmail', 'name email department');

    if (!group) {
      return res.status(404).json({
        error: 'Group not found',
        details: `No group found with ID: ${req.params.id}`
      });
    }

    res.json({
      ...group.toObject(),
      studentCount: group.students.length
    });
  } catch (err) {
    handleError(res, err);
  }
});
router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('tests')
      .lean();

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    res.json({ success: true, data: group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });  
  }
});

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid group ID format' });
    }

    const { groupName, class: classValue, section, students } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Update fields
    if (groupName) group.groupName = groupName;
    if (classValue) group.class = classValue;
    if (section) group.section = section;
    if (students) {
      // Validate before updating students
      if (students.length > group.maxStudents) {
        return res.status(400).json({
          error: `Cannot exceed ${group.maxStudents} students`,
          maxAllowed: group.maxStudents,
          attempted: students.length
        });
      }
      group.students = students.map(student => ({
        name: student.name,
        regNo: student.regNo,
        email: student.email,
        gender: student.gender,
        dob: student.dob
      }));
    }

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } catch (err) {
    handleError(res, err);
  }
});

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid group ID format' });
    }

    const group = await Group.findByIdAndDelete(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Remove from teacher's groups array
    await Teacher.findOneAndUpdate(
      { email: group.teacherEmail },
      { $pull: { groups: group._id } }
    );

    res.json({
      message: 'Group deleted successfully',
      deletedGroup: group
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Error handling utility
function handleError(res, err) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const errors = {};
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      details: err.message
    });
  }

  res.status(500).json({
    error: 'Server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
}

module.exports = router;