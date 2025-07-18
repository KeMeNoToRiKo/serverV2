const { GoogleGenAI } = require("@google/genai");
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function callGemini(question, answerChoice) {
    let MASTER_PROMPT = `You will answer the question only in the given choices of answers. If you think there is no correct answer, you will guess the best answer from the given choices. If asked to choose more than one answer, separate them by a newline\nQuestion: ${question}`;
    if (answerChoice) {
        MASTER_PROMPT += `\nAnswer Choices: ${answerChoice}`;
    }

    console.log("Calling Gemini with prompt:", MASTER_PROMPT);
    try {
        const response = await gemini.models.generateContent({
            model: "gemini-2.0-flash",
            contents: MASTER_PROMPT
        });
        //console.log("Gemini response:", response);
        //console.log(response.text);
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini:", error);
        throw error;
    }
}

module.exports = { gemini, callGemini };