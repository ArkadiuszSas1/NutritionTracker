import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import type { MealEntry } from '../types';

interface NutritionContextType {
    meals: MealEntry[];
    isLoading: boolean;
    error: string | null;
    addMeal: (meal: MealEntry) => Promise<void>;
    removeMeal: (id: string) => Promise<void>;
    refreshMeals: () => Promise<void>;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export function NutritionProvider({
    children,
    accessToken
}: {
    children: React.ReactNode;
    accessToken: string;
}) {
    const [meals, setMeals] = useState<MealEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [service, setService] = useState<GoogleSheetsService | null>(null);

    useEffect(() => {
        const initService = async () => {
            try {
                setIsLoading(true);
                const newService = new GoogleSheetsService(accessToken);
                await newService.initialize();
                setService(newService);

                const fetchedMeals = await newService.getMeals();
                setMeals(fetchedMeals);
            } catch (err) {
                setError('Failed to connect to Google Sheets.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        initService();
    }, [accessToken]);

    const addMeal = useCallback(async (meal: MealEntry) => {
        if (!service) throw new Error('Service not initialized');

        // Optimistic UI update
        setMeals(prev => [...prev, meal]);

        try {
            await service.addMeal(meal);
        } catch (err) {
            // Revert on failure
            setMeals(prev => prev.filter(m => m.id !== meal.id));
            setError('Failed to save meal.');
            throw err;
        }
    }, [service]);

    const refreshMeals = useCallback(async () => {
        if (!service) return;
        try {
            setIsLoading(true);
            const fetchedMeals = await service.getMeals();
            setMeals(fetchedMeals);
        } catch (err) {
            setError('Failed to refresh meals.');
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    const removeMeal = useCallback(async (id: string) => {
        if (!service) throw new Error('Service not initialized');

        setMeals(prev => prev.filter(m => m.id !== id));

        try {
            await service.deleteMeal(id);
        } catch (err) {
            setError('Failed to delete meal.');
            refreshMeals();
            throw err;
        }
    }, [service, refreshMeals]);

    return (
        <NutritionContext.Provider value={{ meals, isLoading, error, addMeal, removeMeal, refreshMeals }}>
            {children}
        </NutritionContext.Provider>
    );
}

export function useNutrition() {
    const context = useContext(NutritionContext);
    if (context === undefined) {
        throw new Error('useNutrition must be used within a NutritionProvider');
    }
    return context;
}
