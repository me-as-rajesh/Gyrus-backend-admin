const express = require('express');
const router = express.Router();
const Question = require('../models/Mcq');

// GET all questions (no filters)
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find({ isDelete: false })
      .select('_id mcqId question 1 2 3 4 answer explanation subjectId subjectName topicsId topicName standard')
      .limit(10000);

    const transformedQuestions = questions.map((q) => {
      const options = [
        { key: q['1']?.key || '1', value: q['1']?.value || '' },
        { key: q['2']?.key || '2', value: q['2']?.value || '' },
        { key: q['3']?.key || '3', value: q['3']?.value || '' },
        { key: q['4']?.key || '4', value: q['4']?.value || '' },
      ].filter(opt => opt.value);
      return {
        _id: q._id,
        mcqId: q.mcqId || 'N/A',
        question: q.question || { value: 'No question' },
        options: options.length > 0 ? options : [],
        answer: q.answer || 'N/A',
        explanation: q.explanation || { value: 'No explanation' },
        subjectId: q.subjectId || null,
        subjectName: q.subjectName || 'General',
        topicsId: q.topicsId || null,
        topicName: q.topicName || 'N/A',
        standard: q.standard || 'N/A'
      };
    });

    // Only return questions with content or options
    const validQuestions = transformedQuestions.filter(q => 
      q.question.value !== 'No question' || q.options.length > 0
    );

    if (validQuestions.length === 0) {
      return res.status(404).json({ message: 'No valid questions found. Please seed the database with complete data.' });
    }
    res.json(validQuestions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching questions', error: err.message });
  }
});


// GET filtered questions
router.get('/filtered', async (req, res) => {
  try {
    const subjectMap = {
      'NEET': null,
      'Physics': '659fc324c2444fa264d2b546',
      'Chemistry': '659fc329c2444fa264d2b548',
      'Botany': '659fc35dc2444fa264d2b54b',
      'Zoology': '659fc3c2c2444fa264d2b553'
    };

    let query = { isDelete: false };
    const subject = req.query.subject;
    const count = parseInt(req.query.count) || 20;
    const standard = req.query.standard;

    if (subject && subjectMap[subject]) {
      query.subjectId = subjectMap[subject];
    } else if (subject === 'NEET') {
      query.subjectId = { $in: Object.values(subjectMap).filter(id => id) };
    }
    if (standard) query.standard = standard;

    let questions = await Question.find(query)
      .select('_id mcqId question 1 2 3 4 answer explanation subjectId subjectName topicsId topicName standard')
      .limit(10000);

    // Shuffle and slice
    questions = questions.sort(() => 0.5 - Math.random()).slice(0, count);

    const transformedQuestions = questions.map((q) => {
      const options = [
        { key: q['1']?.key || '1', value: q['1']?.value || '' },
        { key: q['2']?.key || '2', value: q['2']?.value || '' },
        { key: q['3']?.key || '3', value: q['3']?.value || '' },
        { key: q['4']?.key || '4', value: q['4']?.value || '' },
      ].filter(opt => opt.value);
      return {
        _id: q._id,
        mcqId: q.mcqId || 'N/A',
        question: q.question || { value: 'No question' },
        options: options.length > 0 ? options : [],
        answer: q.answer || 'N/A',
        explanation: q.explanation || { value: 'No explanation' },
        subjectId: q.subjectId || null,
        subjectName: q.subjectName || 'General',
        topicsId: q.topicsId || null,
        topicName: q.topicName || 'N/A',
        standard: q.standard || 'N/A'
      };
    });

    // Only return questions with content or options
    const validQuestions = transformedQuestions.filter(q => 
      q.question.value !== 'No question' || q.options.length > 0
    );

    if (validQuestions.length === 0) {
      return res.status(404).json({ message: 'No valid questions found for filter.' });
    }
    res.json(validQuestions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching filtered questions', error: err.message });
  }
});

module.exports = router;
