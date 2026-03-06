"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeFood = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const genai_1 = require("@google/genai");
const GEMINI_API_KEY = (0, params_1.defineSecret)("GEMINI_API_KEY");
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
    const url = input.toString();
    console.log(`[HTTP Request] ${url}`);
    if (init?.body) {
        try {
            const bodyText = typeof init.body === 'string' ? init.body : new TextDecoder().decode(init.body instanceof Uint8Array ? init.body : Buffer.from(init.body));
            try {
                const bodyJson = JSON.parse(bodyText);
                console.log(`[HTTP Body]`, JSON.stringify(bodyJson, null, 2));
            }
            catch {
                console.log(`[HTTP Body]`, bodyText.substring(0, 500) + (bodyText.length > 500 ? "..." : ""));
            }
        }
        catch (e) {
            console.log(`[HTTP Body] (Unable to decode body content)`);
        }
    }
    const response = await originalFetch(input, init);
    console.log(`[HTTP Response Status] ${response.status} ${response.statusText}`);
    const clonedResponse = response.clone();
    try {
        const text = await clonedResponse.text();
        try {
            console.log(`[HTTP Response Body]`, JSON.stringify(JSON.parse(text), null, 2));
        }
        catch {
            console.log(`[HTTP Response Body]`, text.substring(0, 1000) + (text.length > 1000 ? "..." : ""));
        }
    }
    catch (e) {
        console.log(`[HTTP Response Body] (Error reading body)`);
    }
    return response;
};
exports.analyzeFood = (0, https_1.onRequest)({
    secrets: [GEMINI_API_KEY],
    cors: true,
}, async (req, res) => {
    try {
        if (req.method !== "POST") {
            res.status(405).send("Method Not Allowed");
            return;
        }
        const { imageBase64, text } = req.body;
        console.log("Request received - hasImage:", !!imageBase64, "text:", text);
        if (!imageBase64 && !text) {
            res.status(400).send("Missing image or text.");
            return;
        }
        const apiKey = GEMINI_API_KEY.value();
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set or empty");
        }
        const ai = new genai_1.GoogleGenAI({ apiKey });
        const systemPrompt = `
            Analyze this meal. Identify what the meal is and estimate its nutritional value.
            You must return the response as a valid JSON object matching this exact structure:
            {
              "foodName": "A short, descriptive name of the meal (e.g., 'Chicken Salad and Rice')",
              "calories": number,
              "protein": number,
              "carbs": number,
              "fat": number,
              "novaGrade": number (1-4, where 1=unprocessed/minimally processed, 4=ultra-processed),
              "fiber": number,
              "netCarbs": number,
              "addedSugars": number,
              "saturatedFat": number,
              "monounsaturatedFat": number,
              "polyunsaturatedFat": number,
              "omega36Ratio": "string representing ratio e.g. '1:4'",
              "glycemicLoad": number (estimate),
              "energyImpact": "string e.g. 'Sustained' or 'Crash' based on macros/sugar"
            }
            Do not include any other text, markdown formatting, or explanations. Just the raw JSON object.
        `;
        const parts = [{ text: systemPrompt }];
        if (text) {
            parts.push({ text: `User context/description: "${text}"` });
        }
        if (imageBase64) {
            const match = imageBase64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
            if (!match) {
                res.status(400).send("Invalid image format.");
                return;
            }
            parts.push({
                inlineData: {
                    data: match[2],
                    mimeType: match[1]
                }
            });
        }
        console.log("Calling Gemini with parts count:", parts.length);
        const result = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: [{ role: "user", parts }],
            config: {
                responseMimeType: "application/json",
                temperature: 0.1,
            }
        });
        const responseText = result.text;
        console.log("Gemini response text:", responseText);
        if (!responseText)
            throw new Error("No response from Gemini");
        res.status(200).json(JSON.parse(responseText));
    }
    catch (error) {
        console.error("Gemini analysis failed detailed error:", {
            message: error.message,
            stack: error.stack,
            response: error.response?.data || error.response
        });
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});
//# sourceMappingURL=index.js.map