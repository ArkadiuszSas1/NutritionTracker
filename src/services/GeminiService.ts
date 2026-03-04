// The URL of your deployed Firebase Cloud Function.
// We set this in .env.local for local testing, e.g., http://127.0.0.1:5001/nutritiontracker-706c4/us-central1/analyzeFood
const CLOUD_FUNCTION_URL = import.meta.env.VITE_CLOUD_FUNCTION_URL || 'YOUR_CLOUD_FUNCTION_URL';

export interface NutritionalAnalysis {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export class GeminiService {
    /**
     * Analyzes a meal by calling our secure Cloud Function proxy.
     * @param options Provide either a base64Image or a textDescription.
     */
    static async analyzeFood(options: { imageBase64?: string; textDescription?: string }): Promise<NutritionalAnalysis> {
        try {
            const response = await fetch(CLOUD_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageBase64: options.imageBase64,
                    textDescription: options.textDescription
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Cloud Function error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            // Basic validation
            if (
                typeof data.foodName !== 'string' ||
                typeof data.calories !== 'number'
            ) {
                throw new Error('Cloud Function returned an invalid data structure.');
            }

            return data as NutritionalAnalysis;

        } catch (error) {
            console.error('Error analyzing image via Cloud Function:', error);
            throw error;
        }
    }
}
