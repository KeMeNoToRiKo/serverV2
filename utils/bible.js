const axios = require('axios');

async function getTodaysBibleVerse() {
  try {
    // Example API: https://beta.ourmanna.com/api/v1/get/?format=json
    const response = await axios.get('https://beta.ourmanna.com/api/v1/get/?format=json');
    const verseData = response.data.verse.details;
    //console.log("Today's Bible Verse:");
    //console.log(`${verseData.text} — ${verseData.reference}`);
    return verseData;
  } catch (error) {
    console.error('Error fetching Bible verse:', error.message);
    return null;
  }
}

module.exports = { getTodaysBibleVerse };