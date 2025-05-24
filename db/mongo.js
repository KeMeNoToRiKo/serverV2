const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let questionsCollection;

async function connectDB() {
  await client.connect();
  const db = client.db();
  questionsCollection = db.collection('mgapogis');
  await questionsCollection.createIndex({ questionId: 1 });
  await questionsCollection.createIndex({ Question: 1 });
}

function getQuestionsCollection() {
  if (!questionsCollection) throw new Error('DB not connected');
  return questionsCollection;
}

module.exports = { connectDB, getQuestionsCollection };