const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  Answer_Text: String,
  Answer_ID: String,
  Question_ID: String,
  Question_Type: String,
  Correct: Boolean,
});

const ParsedMessageSchema = new mongoose.Schema({
  Title: String,
  Question: String,
  Answer: [AnswerSchema],
});

module.exports = mongoose.model("MgaPogi", ParsedMessageSchema);