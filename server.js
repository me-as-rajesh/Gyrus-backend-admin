// server/server.js
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

// MongoDB Connection for localhost
mongoose.connect('mongodb://localhost:27017/gyrus', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB 👍 (localhost:27017/gyrus)'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});