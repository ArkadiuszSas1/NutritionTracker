"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeFood = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const genai_1 = require("@google/genai");
const GEMINI_API_KEY = (0, params_1.defineSecret)("GEMINI_API_KEY");
exports.analyzeFood = (0, https_1.onRequest)({
    secrets: [GEMINI_API_KEY],
    cors: true,
}, async (req, res) => {
    try {
        if (req.method !== "POST") {
            res.status(405).send("Method Not Allowed");
            return;
        }
        const { imageBase64, textDescription } = req.body;
        if (!imageBase64 && !textDescription) {
            res.status(400).send("Missing image or text description.");
            return;
        }
        const ai = new genai_1.GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
        let prompt = `
            Analyze this meal. Identify what the meal is and estimate its nutritional value.
            You must return the response as a valid JSON object matching this exact structure:
            {
              "foodName": "A short, descriptive name of the meal (e.g., 'Chicken Salad and Rice')",
              "calories": number,
              "protein": number,
              "carbs": number,
              "fat": number
            }
            Do not include any other text, markdown formatting, or explanations. Just the raw JSON object.
        `;
        const contents = [];
        if (textDescription) {
            prompt += `\n\nMeal description provided by user: "${textDescription}"`;
            contents.push(prompt);
        }
        else if (imageBase64) {
            const match = imageBase64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
            if (!match) {
                res.status(400).send("Invalid image format.");
                return;
            }
            const mimeType = match[1];
            const data = match[2];
            contents.push(prompt);
            contents.push({
                inlineData: {
                    data: data,
                    mimeType: mimeType
                }
            });
        }
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2,
            }
        });
        const text = result.text;
        if (!text)
            throw new Error("No response from Gemini");
        res.status(200).json(JSON.parse(text));
    }
    catch (error) {
        console.error("Gemini analysis failed:", error);
        res.status(500).send("Internal Server Error");
    }
});
//# sourceMappingURL=index.js.map