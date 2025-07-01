const fs = require('fs');
const path = require('path');
const parseMessageEmbed = require('../utils/embedParser');
const sendToDB = require('../models/schema');
const LastFetchedId = require('../models/lastFetchedId');

const fetchMessage = async (client, channelId, isNewSearch = false) => {
    let stopAtMessageId = null;

    // Read the last fetched message ID from MongoDB
    try {
        const lastIdDoc = await LastFetchedId.findOne({ key: 'last_fetched_id' });
        if (lastIdDoc) {
            stopAtMessageId = lastIdDoc.value;
            console.log(`Will stop fetching at message ID (from DB): ${stopAtMessageId}`);
        }
    } catch (err) {
        console.error('Error fetching last fetched message ID from DB:', err);
    }

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            console.error('Channel not found');
            return;
        }
        if (!channel.isTextBased()) {
            console.error('Channel is not text-based');
            return;
        }

        let lastMessageId;
        let allMessagesFetched = false;
        let totalMessagesFetched = 0;
        let firstMessageIdThisRun = null;
        let newOldestMessageId = null;

        while (!allMessagesFetched) {
            const options = { limit: 100 };
            if (lastMessageId) options.before = lastMessageId;

            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) {
                allMessagesFetched = true;
                break;
            }

            // Track the oldest message ID fetched this run
            newOldestMessageId = messages.last().id;

            for (const message of messages.values()) {
                if (message.id == stopAtMessageId) {
                    allMessagesFetched = true;
                    break;
                }
                totalMessagesFetched++;
                console.log(`Found message: ${message.id}`);
                const parsedData = parseMessageEmbed(message);
                if(parsedData && Array.isArray(parsedData.Answer)) {
                    // Only proceed if there is at least one correct answer
                    const hasCorrect = parsedData.Answer.some(ans => ans.Correct === true);
                    if (!hasCorrect) {
                        console.log(`No correct answer found for message: ${message.id}. Skipping DB insert.`);
                        continue;
                    }

                    // Collect all Question_IDs from the Answer array
                    const questionIds = parsedData.Answer
                        .map(ans => ans.Question_ID)
                        .filter(id => !!id);

                    // Check if any of these Question_IDs already exist in the DB
                    const exists = await sendToDB.exists({ "Answer.Question_ID": { $in: questionIds } });
                    if (exists) {
                        console.log(`Duplicate Question_ID(s) (${questionIds.join(", ")}) found. Skipping DB insert.`);
                    } else {
                        await sendToDB.create(parsedData);
                        console.log(`Saved message to DB: ${message.id}`);
                    }
                } else if (parsedData) {
                    // If no Answer array, just insert (or skip, depending on your needs)
                    await sendToDB.create(parsedData);
                    console.log(`Saved message to DB (no Answer array): ${message.id}`);
                }
                if(firstMessageIdThisRun === null) {
                    firstMessageIdThisRun = message.id;
                }
            }

            lastMessageId = messages.last().id;
            if (messages.size < 100) {
                allMessagesFetched = true;
            }
        }

        console.log(newOldestMessageId)
        console.log(firstMessageIdThisRun)

        // Save the new oldest message ID only if we fetched past the previous stop point
        if (firstMessageIdThisRun && firstMessageIdThisRun !== stopAtMessageId) {
            try {
                console.log("Saving to DB: ", firstMessageIdThisRun);
                await LastFetchedId.findOneAndUpdate(
                    { key: 'last_fetched_id' },
                    { value: firstMessageIdThisRun },
                    { upsert: true, new: true }
                );
                console.log(`Saved last fetched message ID to DB: ${firstMessageIdThisRun}`);
            } catch (error) {
                console.error('Error saving last fetched message ID to DB:', error);
            }
        } else {
            console.log('No new older messages fetched, not updating last fetched message ID.');
        }

        console.log(`Total messages fetched: ${totalMessagesFetched}`);
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

module.exports = fetchMessage;