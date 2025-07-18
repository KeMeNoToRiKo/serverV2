const axios = require('axios');

async function callOllama(question, answerChoice) {
    let MASTER_PROMPT = `You will answer the question only in the given choices of answers. If you think there is no correct answer, you will guess the best answer from the given choices.If asked to choose more than one answer, separate them by a newline\nQuestion: ${question}`;
    if (answerChoice) {
        MASTER_PROMPT += `\nAnswer Choices: ${answerChoice}`;
    }

    console.log("Calling Ollama with prompt:", MASTER_PROMPT);
    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "gemma3",
            prompt: MASTER_PROMPT,
            stream: false
        });
        //console.log("Ollama response:", response.data.response);
        return response.data.response;
    } catch (error) {
        console.error("Error calling Ollama:", error);
        throw error;
    }
}

module.exports = { callOllama };