export const SPREADSHEET_TITLE = 'Nutrition Tracker Data';
export const MEALS_SHEET_NAME = 'Meals';

export interface MealEntry {
    id: string; // generate UUID
    date: string; // ISO format: YYYY-MM-DD
    time: string; // HH:mm format
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    comment?: string;
}
