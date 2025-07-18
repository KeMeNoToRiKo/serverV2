const express = require('express');
const router = express.Router();
const { getQuestionsCollection } = require('../db/mongo');
const { callGemini } = require('../ai/Gemini');
const { callOllama } = require('../ai/ollama');
const fs = require('fs');
const ini = require('ini'); // This is the npm package, not your config file

// Read AI provider from config.ini
let aiProvider = 'gemini';
try {
  const config = ini.parse(fs.readFileSync(require('path').join(__dirname, '../config.ini'), 'utf-8'));
  aiProvider = config.ai && config.ai.provider ? config.ai.provider : 'gemini';
} catch (e) {
  console.warn('Could not read config.ini, defaulting to gemini');
}

router.get('/', async (req, res) => {
  const { questionText, questionId, answerChoice } = req.query;
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
      // Only call the selected AI if there is no query result
      try {
        let aiResponse;
        if (aiProvider === 'none') {
          console.log('AI provider is set to none. Returning no results.');
          return res.status(200).json([]);
        } else if (aiProvider === 'ollama') {
          console.log('Calling Ollama for questionText:', questionText, 'and answerChoice:', answerChoice);
          try {
            aiResponse = await callOllama(questionText, answerChoice || '');
            console.log('Ollama response:', aiResponse);
          } catch (ollamaErr) {
            // Handle Ollama not running or not installed gracefully
            if (ollamaErr.code === 'ECONNREFUSED' || ollamaErr.code === 'ENOTFOUND' || (ollamaErr.message && ollamaErr.message.includes('connect'))) {
              console.warn('Ollama is not running or not installed. Returning no results.');
              return res.status(200).json([]);
            } else {
              console.error('Ollama error:', ollamaErr);
              return res.status(500).json({ error: 'Ollama error', details: ollamaErr.message });
            }
          }
        } else {
          console.log('Calling Gemini for questionText:', questionText, 'and answerChoice:', answerChoice);
          aiResponse = await callGemini(questionText, answerChoice || '');
        }
        // Handle multiple answers gracefully
        let aiAnswerObj;
        if (typeof aiResponse === 'string') {
          console.log('AI response is a string:', aiResponse);
          // Always return answers as an array
          const answers = aiResponse.split(/\n|\r|(?<=\d[\.|\)]) /).map(a => a.trim()).filter(a => a);
          console.log('AI response split into answers:', answers);
          aiAnswerObj = { answers };
        } else if (Array.isArray(aiResponse)) {
          aiAnswerObj = { answers: aiResponse };
        } else {
          aiAnswerObj = aiResponse;
        }
        return res.status(200).json([
          {
            answer_text: null,
            answer_id: null,
            question_id: questionId || null,
            question_text: questionText || null,
            question_type: null,
            searchMethod: 'ai',
            correct: null,
            aiAnswer: aiAnswerObj
          }
        ]);
      } catch (aiErr) {
        console.error('AI error:', aiErr);
        return res.status(500).json({ error: 'AI error', details: aiErr.message });
      }
    }

    console.log('Search result found:', result);
    

    for (answers in result.Answer) {
      // Only log the Answer_Text
      console.log('Search result:', result.Answer[answers].Answer_Text);
      console.log('Question ID:', result.Answer[answers].Question_ID);
      console.log();
    }

    result.searchMethod = searchMethod || 'unknown';

    console.log("Search result found:", result);

    res.json(result);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;