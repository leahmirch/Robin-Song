const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function sendMessageToChatGPT(req, res) {
    console.log(":small_blue_diamond: Received message from frontend:", req.body);

    try {
        const { message } = req.body;
        console.log("Processing message:", message);

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: message }],
        });

        console.log("ChatGPT Response:", response.choices[0].message.content);

        res.json({ botMessage: response.choices[0].message.content });
    } catch (error) {
        console.error("Error in ChatGPT API call:", error);
        res.status(500).json({ error: "ChatGPT API call failed" });
    }
}

module.exports = { sendMessageToChatGPT };