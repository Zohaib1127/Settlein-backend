import { GoogleGenerativeAI } from "@google/generative-ai";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Please type something first!" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ ERROR: GEMINI_API_KEY is missing in your .env file!");
      return res.status(500).json({ reply: "Server configuration error. API Key missing." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. SettleIn Context
    const prompt = `
      You are SettleIn AI, a helpful assistant for international students. 
      Help with: Housing, Roommates, Halal Food, and Student Life.
      User Question: ${message}
    `;

    const result = await model.generateContent(prompt);
    
    // 4. Proper Response parsing
    const response = result.response;
    const text = response.text();

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error("❌ GEMINI SYSTEM ERROR:", error.message);

    res.status(500).json({ 
      reply: "I'm having trouble connecting to my brain. Please try again!",
      debug: error.message 
    });
  }
};