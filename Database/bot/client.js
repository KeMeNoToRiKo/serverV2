const {Client, GatewayIntentBits} = require('discord.js');
const fetchMessage = require('../fetch/fetch');
const channelId = process.env.CHANNEL_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    try {
        await fetchMessage(client, channelId, true);
        console.log('Fetch complete. Destroying client...');
        client.destroy();
        client.emit('destroyed'); // Add this line
    } catch (err) {
        console.error('Error during fetch:', err);
        client.destroy();
        client.emit('destroyed'); // Add this line
    }
});

module.exports = client;