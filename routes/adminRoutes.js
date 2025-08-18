const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const Group = require('../models/Group');
const bcrypt = require("bcryptjs");

// POST /api/admin/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }

  try {
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/admin/admins
router.get("/admins", async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/admins
router.post("/admins", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Username, password, and role are required" });
  }

  try {
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      role: role || "Admin"
    });

    const savedAdmin = await newAdmin.save();

    res.status(201).json({
      _id: savedAdmin._id,
      username: savedAdmin.username,
      role: savedAdmin.role,
      createdAt: savedAdmin.createdAt,
      status: "Active"
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/admin/admins/:id
router.put("/admins/:id", async (req, res) => {
  const { username, role } = req.body;
  const { id } = req.params;

  if (!username || !role) {
    return res.status(400).json({ message: "Username and role are required" });
  }

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const existingAdmin = await Admin.findOne({ username, _id: { $ne: id } });
    if (existingAdmin) {
      return res.status(400).json({ message: "Username already exists" });
    }

    admin.username = username;
    admin.role = role;
    const updatedAdmin = await admin.save();

    res.json({
      _id: updatedAdmin._id,
      username: updatedAdmin.username,
      role: updatedAdmin.role,
      createdAt: updatedAdmin.createdAt,
      status: "Active"
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/admin/admins/:id
router.delete("/admins/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await admin.deleteOne();
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/allstudents', async (req, res) => {
  try {
    const groups = await Group.find().lean();
    const allStudents = groups.reduce((acc, group) => {
      return acc.concat(group.students.map(student => ({
        ...student,
        groupId: group._id,
        groupName: group.groupName,
        section: group.section,
        class: group.class || group.section || '-'
      })));
    }, []);
    res.json(allStudents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/plans', async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .select('name email department school')
      .sort({ createdAt: -1 });

    const response = teachers.map(teacher => ({
      "School Name": teacher.school,
      "Teacher Name": teacher.name,
      "Department": teacher.department,
      "Plan": teacher.status === 'approved' ? 'Paid' : 'Free' 
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;