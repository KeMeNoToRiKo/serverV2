// INIT
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

//BOT
const client = require('./bot/client');

//DB
const connectDB = require('./db');
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

client.once('destroyed', () => {
    server.close(async () => {
        console.log('Express server closed.');
        // Close mongoose connection
        await mongoose.connection.close();
        process.exit(0); // Force exit if needed
    });
});

client.login(process.env.DISCORD_TOKEN);
