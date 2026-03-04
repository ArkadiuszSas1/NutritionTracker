import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

export const analyzeFood = onRequest({
    secrets: [GEMINI_API_KEY],
    cors: true, // Enable CORS automatically
}, async (req, res) => {
    try {
        if (req.method !== "POST") {
            res.status(405).send("Method Not Allowed");
            return;
        }

        const { imageBase64 } = req.body;
        if (!imageBase64) {
            res.status(400).send("Missing base64 image data.");
            return;
        }

        // 1. Initialize Gemini
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });

        // 2. Prepare image data
        const match = imageBase64.match(/^data:(image\/[a-z]+);base64,(.+)$/);
        if (!match) {
            res.status(400).send("Invalid image format.");
            return;
        }
        const mimeType = match[1];
        const data = match[2];

        // 3. Define the prompt
        const prompt = `
            Analyze this image of food. Identify what the meal is and estimate its nutritional value.
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

        // 4. Generate content
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                prompt,
                {
                    inlineData: {
                        data: data,
                        mimeType: mimeType
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
                temperature: 0.2,
            }
        });

        const text = result.text;
        if (!text) throw new Error("No response from Gemini");

        // 5. Send back the result
        res.status(200).json(JSON.parse(text));

    } catch (error) {
        console.error("Gemini analysis failed:", error);
        res.status(500).send("Internal Server Error");
    }
});
