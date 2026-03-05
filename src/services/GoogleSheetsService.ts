import { SPREADSHEET_TITLE, MEALS_SHEET_NAME } from '../types';
import type { MealEntry } from '../types';

const GOOGLE_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3/files';

export class GoogleSheetsService {
    private accessToken: string;
    private spreadsheetId: string | null = null;

    // Static map to hold initialization promises keyed by access token, preventing multiple StrictMode renders from starting separate init flows
    private static initMap = new Map<string, Promise<string>>();

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    private get headers() {
        return {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        };
    }

    // 1. Find existing spreadsheet or create one
    public async initialize(): Promise<void> {
        if (!GoogleSheetsService.initMap.has(this.accessToken)) {
            GoogleSheetsService.initMap.set(this.accessToken, this._initialize());
        }

        try {
            this.spreadsheetId = await GoogleSheetsService.initMap.get(this.accessToken)!;
        } catch (e) {
            // Clear the failed promise so we can retry later
            GoogleSheetsService.initMap.delete(this.accessToken);
            throw e;
        }
    }

    private async _initialize(): Promise<string> {
        try {
            console.log('[GoogleSheetsService] Starting initialize()');
            console.log('[GoogleSheetsService] Searching for existing spreadsheet...');
            const searchRes = await fetch(
                `${GOOGLE_DRIVE_API}?q=name='${SPREADSHEET_TITLE}' and trashed=false&spaces=drive`,
                { headers: this.headers }
            );

            const searchData = await searchRes.json();
            console.log('[GoogleSheetsService] Search results:', searchData);

            if (searchData.files && searchData.files.length > 0) {
                console.log(`[GoogleSheetsService] Found existing spreadsheet. ID: ${searchData.files[0].id}`);
                return searchData.files[0].id; // Return the ID to resolve the static promise
            } else {
                console.log('[GoogleSheetsService] No existing spreadsheet found. Creating a new one...');
                const createRes = await fetch(GOOGLE_API_BASE, {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify({
                        properties: { title: SPREADSHEET_TITLE },
                        sheets: [{ properties: { title: MEALS_SHEET_NAME } }],
                    }),
                });

                const createData = await createRes.json();
                const newSpreadsheetId = createData.spreadsheetId;
                console.log(`[GoogleSheetsService] Created new spreadsheet. ID: ${newSpreadsheetId}`);

                console.log('[GoogleSheetsService] Initializing columns headers for the new spreadsheet...');
                const range = `${MEALS_SHEET_NAME}!A1:I1`;
                const values = [['ID', 'Date', 'Time', 'Food Name', 'Calories', 'Protein', 'Carbs', 'Fat', 'Comment']];

                await fetch(`${GOOGLE_API_BASE}/${newSpreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
                    method: 'PUT',
                    headers: this.headers,
                    body: JSON.stringify({ values }),
                });
                console.log('[GoogleSheetsService] Headers initialized.');

                return newSpreadsheetId;
            }
        } catch (e) {
            console.error('Failed to initialize spreadsheet', e);
            throw e;
        }
    }

    // 2. Read all data
    public async getMeals(): Promise<MealEntry[]> {
        if (!this.spreadsheetId) throw new Error('Spreadsheet not initialized');

        try {
            const range = `${MEALS_SHEET_NAME}!A2:I`; // Skip headers
            const res = await fetch(`${GOOGLE_API_BASE}/${this.spreadsheetId}/values/${range}`, {
                headers: this.headers,
            });

            const data = await res.json();
            const rows: any[][] = data.values || [];

            return rows.map(row => ({
                id: row[0],
                date: row[1],
                time: row[2],
                foodName: row[3],
                calories: Number(row[4] || 0),
                protein: Number(row[5] || 0),
                carbs: Number(row[6] || 0),
                fat: Number(row[7] || 0),
                comment: row[8] || '',
            }));
        } catch (e) {
            console.error('Error getting meals', e);
            return [];
        }
    }

    // 3. Append new meal
    public async addMeal(meal: MealEntry): Promise<void> {
        if (!this.spreadsheetId) throw new Error('Spreadsheet not initialized');

        try {
            const range = `${MEALS_SHEET_NAME}!A:I`;
            const values = [[
                meal.id,
                meal.date,
                meal.time,
                meal.foodName,
                meal.calories,
                meal.protein,
                meal.carbs,
                meal.fat,
                meal.comment || ''
            ]];

            await fetch(`${GOOGLE_API_BASE}/${this.spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({ values }),
            });
        } catch (e) {
            console.error('Error adding meal', e);
            throw e;
        }
    }
}
