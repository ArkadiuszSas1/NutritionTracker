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
    novaGrade?: number; // 1-4
    fiber?: number;
    netCarbs?: number;
    addedSugars?: number;
    saturatedFat?: number;
    monounsaturatedFat?: number;
    polyunsaturatedFat?: number;
    omega36Ratio?: string; // e.g. "1:4"
    glycemicLoad?: number;
    energyImpact?: string; // e.g. "Sustained" or "Crash"
}
