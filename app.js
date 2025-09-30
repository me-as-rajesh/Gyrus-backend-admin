const express = require('express');
const cors = require('cors');
const app = express();

// Route imports
const teacherRoutes = require('./routes/teacherRoutes');
const groupRoutes = require('./routes/groupRoutes');
const testRoutes = require('./routes/testRoutes');
const fetchRoutes = require('./routes/fetchRoutes');
const infoRoutes = require('./routes/infoRoutes');
const questionRoutes = require('./routes/questionRoutes');
const studentAuthRoutes = require('./routes/studentAuth');
const reportsRouter = require('./routes/reportsRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const otpRoutes = require('./routes/otpRoutes');
const nodeMailRoutes = require('./routes/nodeMail');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportsRouter);
app.use('/api/teachers', teacherRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/fetch', fetchRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/student', studentAuthRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/email', nodeMailRoutes);

module.exports = app;
