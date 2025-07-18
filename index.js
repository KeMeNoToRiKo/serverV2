require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./db/mongo');
const searchRoute = require('./routes/search');

const { getTodaysBibleVerse } = require('./utils/bible');

const app = express();
app.use(cors());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

app.use('/search', searchRoute);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  console.log("Today's Bible Verse:");
  getTodaysBibleVerse().then(verse => {
    if (verse) {
      console.log(`${verse.text} — ${verse.reference}`);
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}).catch(err => {
  console.error('Failed to connect to DB:', err);
  process.exit(1);
});

//HELLO