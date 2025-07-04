const express = require('express');
const router = express.Router();
const { getQuestionsCollection } = require('../db/mongo');

router.get('/', async (req, res) => {
  const { questionText, questionId } = req.query;
  if (!questionText && !questionId) {
    console.log('Search request missing parameters');
    return res.status(400).json({ error: 'Provide questionText or questionId' });
  }

  const collection = getQuestionsCollection();

  try {
    let result = null;
    let searchMethod = null;

    // 1. Try searching by questionId first
    if (questionId) {
      const idQuery = { 'Answer.Question_ID': questionId };
      console.log('Searching by questionId:', idQuery);
      result = await collection.findOne(idQuery);
      if (result) searchMethod = 'questionId';
    }

    // 2. If not found and questionText is provided, search by questionText
    if (!result && questionText) {
      const textQuery = { Question: questionText };
      console.log('Searching by questionText:', textQuery);
      result = await collection.findOne(textQuery);
      if (result) searchMethod = 'questionText';
    }

    if (!result) {
      console.log('No result found for provided parameters.');
      return res.status(404).json({ error: 'Not found' });
    }

    // Put searchMethod inside result
    result.searchMethod = searchMethod;

    for (answers in result.Answer) {
      // Only log the Answer_Text
      console.log('Search result:', result.Answer[answers].Answer_Text);
      console.log('Question ID:', result.Answer[answers].Question_ID);
      console.log();
    }

    
    res.json(result);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;