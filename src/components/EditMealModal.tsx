import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { MealEntry } from '../types';

interface EditMealModalProps {
    meal: MealEntry;
    onSave: (updatedMeal: MealEntry) => void;
    onCancel: () => void;
}

export function EditMealModal({ meal, onSave, onCancel }: EditMealModalProps) {
    const [foodName, setFoodName] = useState(meal.foodName);
    const [calories, setCalories] = useState(meal.calories?.toString() || '0');
    const [protein, setProtein] = useState(meal.protein?.toString() || '0');
    const [carbs, setCarbs] = useState(meal.carbs?.toString() || '0');
    const [fat, setFat] = useState(meal.fat?.toString() || '0');
    const [comment, setComment] = useState(meal.comment || '');

    const handleSave = () => {
        onSave({
            ...meal,
            foodName,
            calories: Number(calories) || 0,
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0,
            comment: comment.trim() || undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-900">Edit Meal</h3>
                    <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Food Name</label>
                        <input
                            type="text"
                            value={foodName}
                            onChange={(e) => setFoodName(e.target.value)}
                            className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Calories (kcal)</label>
                            <input
                                type="number"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                                className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Protein (g)</label>
                            <input
                                type="number"
                                value={protein}
                                onChange={(e) => setProtein(e.target.value)}
                                className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Carbs (g)</label>
                            <input
                                type="number"
                                value={carbs}
                                onChange={(e) => setCarbs(e.target.value)}
                                className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Fat (g)</label>
                            <input
                                type="number"
                                value={fat}
                                onChange={(e) => setFat(e.target.value)}
                                className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 mt-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                        />
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-gray-100 grid grid-cols-2 gap-3 mt-auto">
                    <button
                        onClick={onCancel}
                        className="bg-white border-2 border-red-100 hover:border-red-200 hover:bg-red-50 text-red-600 font-bold py-3 px-3 rounded-2xl transition-all flex justify-center items-center gap-2 cursor-pointer"
                    >
                        <X size={20} />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-3 rounded-2xl shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2 cursor-pointer"
                    >
                        <Check size={20} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
