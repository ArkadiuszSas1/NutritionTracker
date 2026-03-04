import { GoogleGenAI } from '@google/genai';

// Using a placeholder API key if one is not provided in env vars.
// The user must configure this later in Netlify or their local .env file.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface NutritionalAnalysis {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export class GeminiService {
    /**
     * Analyzes a base64 image of food and returns nutritional data.
     * @param base64Image The image data (e.g., "data:image/jpeg;base64,...")
     */
    static async analyzeFoodImage(base64Image: string): Promise<NutritionalAnalysis> {
        try {
            // 1. Prepare image data for the SDK
            // Extract the mime type and the raw base64 string without the prefix
            const match = base64Image.match(/^data:(image\/[a-z]+);base64,(.+)$/);
            if (!match) {
                throw new Error('Invalid image format. Expected a base64 data URL.');
            }
            const mimeType = match[1];
            const data = match[2];

            // 2. Define the strict JSON schema we want Gemini to return
            const prompt = `
        Analyze this image of food. Identify what the meal is and estimate its nutritional value.
        You must return the response as a valid JSON object matching this exact structure:
        {
          "foodName": "A short, descriptive name of the meal (e.g., 'Chicken Salad and Rice')",
          "calories": number (estimated total calories),
          "protein": number (estimated total protein in grams),
          "carbs": number (estimated total carbohydrates in grams),
          "fat": number (estimated total fat in grams)
        }
        Do not include any other text, markdown formatting, or explanations in your response. Just the raw JSON object.
      `;

            // 3. Call the Gemini API (using gemini-2.5-flash which is fast and supports multimodal)
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
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
                    // Tell the model we expect JSON back
                    responseMimeType: 'application/json',
                    temperature: 0.2, // Low temperature for more factual, consistent nutritional estimates
                }
            });

            const text = response.text;
            if (!text) throw new Error('No response text received from Gemini');

            // 4. Parse and validate the response
            const parsedData = JSON.parse(text) as NutritionalAnalysis;

            // Basic validation to ensure required fields exist
            if (
                typeof parsedData.foodName !== 'string' ||
                typeof parsedData.calories !== 'number' ||
                typeof parsedData.protein !== 'number' ||
                typeof parsedData.carbs !== 'number' ||
                typeof parsedData.fat !== 'number'
            ) {
                throw new Error('Gemini returned an invalid data structure.');
            }

            return parsedData;

        } catch (error) {
            console.error('Error analyzing image with Gemini:', error);
            throw error;
        }
    }
}
