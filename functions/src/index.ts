import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// --- LOGGING INTERCEPTOR START ---
// This wraps the global fetch to log the actual REST calls made by the Gemini SDK
const originalFetch = globalThis.fetch;
(globalThis as any).fetch = async (input: any, init?: any) => {
    const url = input.toString();
    console.log(`[HTTP Request] ${url}`);
    if (init?.body) {
        try {
            const bodyText = typeof init.body === 'string' ? init.body : new TextDecoder().decode(init.body instanceof Uint8Array ? init.body : Buffer.from(init.body as any));
            try {
                const bodyJson = JSON.parse(bodyText);
                console.log(`[HTTP Body]`, JSON.stringify(bodyJson, null, 2));
            } catch {
                console.log(`[HTTP Body]`, bodyText.substring(0, 500) + (bodyText.length > 500 ? "..." : ""));
            }
        } catch (e) {
            console.log(`[HTTP Body] (Unable to decode body content)`);
        }
    }

    const response = await originalFetch(input, init);
    console.log(`[HTTP Response Status] ${response.status} ${response.statusText}`);

    // We clone the response because otherwise the body can only be read once
    const clonedResponse = response.clone();
    try {
        const text = await clonedResponse.text();
        try {
            console.log(`[HTTP Response Body]`, JSON.stringify(JSON.parse(text), null, 2));
        } catch {
            console.log(`[HTTP Response Body]`, text.substring(0, 1000) + (text.length > 1000 ? "..." : ""));
        }
    } catch (e) {
        console.log(`[HTTP Response Body] (Error reading body)`);
    }

    return response;
};
// --- LOGGING INTERCEPTOR END ---

export const analyzeFood = onRequest({
    secrets: [GEMINI_API_KEY],
    cors: true, // Enable CORS automatically
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

        // 1. Initialize Gemini
        const apiKey = GEMINI_API_KEY.value();
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set or empty");
        }
        const ai = new GoogleGenAI({ apiKey });

        // 3. Define the prompt
        const systemPrompt = `
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

        const parts: any[] = [{ text: systemPrompt }];

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

        // 4. Generate content
        const result = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview", //do not change model name, it is verified to be correct
            contents: [{ role: "user", parts }],
            config: {
                responseMimeType: "application/json",
                temperature: 0.1,
            }
        });

        const responseText = result.text;
        console.log("Gemini response text:", responseText);

        if (!responseText) throw new Error("No response from Gemini");

        // 5. Send back the result
        res.status(200).json(JSON.parse(responseText));

    } catch (error: any) {
        console.error("Gemini analysis failed detailed error:", {
            message: error.message,
            stack: error.stack,
            response: error.response?.data || error.response
        });
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});
