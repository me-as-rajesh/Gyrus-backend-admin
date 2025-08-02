const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET 20 Valid Questions
router.get('/all-questions', async (req, res) => {
  try {
    const questions = await Question.find({
      question: { $exists: true, $ne: null },
      1: { $exists: true, $ne: null },
      2: { $exists: true, $ne: null },
      3: { $exists: true, $ne: null },
      4: { $exists: true, $ne: null },
      answer: { $exists: true, $ne: '' },
      explanation: { $exists: true, $ne: null },
      isDelete: false
    })
    .select('mcqId subjectId standard yearOfQues question 1 2 3 4 answer explanation note')
    .limit(20);

    if (!questions.length) {
      return res.status(404).json({ message: 'No questions found.' });
    }

    return res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error.message);
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
