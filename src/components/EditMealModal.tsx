import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { MealEntry } from '../types';

interface EditMealModalProps {
    meal: MealEntry;
    onSave: (updatedMeal: MealEntry) => void;
    onCancel: () => void;
}

export function EditMealModal({ meal, onSave, onCancel }: EditMealModalProps) {
    const [date, setDate] = useState(meal.date);
    const [time, setTime] = useState(meal.time);
    const [foodName, setFoodName] = useState(meal.foodName);
    const [calories, setCalories] = useState(meal.calories?.toString() || '0');
    const [protein, setProtein] = useState(meal.protein?.toString() || '0');
    const [carbs, setCarbs] = useState(meal.carbs?.toString() || '0');
    const [fat, setFat] = useState(meal.fat?.toString() || '0');
    const [comment, setComment] = useState(meal.comment || '');
    const [novaGrade, setNovaGrade] = useState(meal.novaGrade?.toString() || '');
    const [fiber, setFiber] = useState(meal.fiber?.toString() || '');
    const [netCarbs, setNetCarbs] = useState(meal.netCarbs?.toString() || '');
    const [addedSugars, setAddedSugars] = useState(meal.addedSugars?.toString() || '');
    const [saturatedFat, setSaturatedFat] = useState(meal.saturatedFat?.toString() || '');
    const [monounsaturatedFat, setMonounsaturatedFat] = useState(meal.monounsaturatedFat?.toString() || '');
    const [polyunsaturatedFat, setPolyunsaturatedFat] = useState(meal.polyunsaturatedFat?.toString() || '');
    const [omega36Ratio, setOmega36Ratio] = useState(meal.omega36Ratio || '');
    const [glycemicLoad, setGlycemicLoad] = useState(meal.glycemicLoad?.toString() || '');
    const [energyImpact, setEnergyImpact] = useState(meal.energyImpact || '');

    const handleSave = () => {
        onSave({
            ...meal,
            date,
            time,
            foodName,
            calories: Number(calories) || 0,
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0,
            comment: comment.trim() || undefined,
            novaGrade: novaGrade ? Number(novaGrade) : undefined,
            fiber: fiber ? Number(fiber) : undefined,
            netCarbs: netCarbs ? Number(netCarbs) : undefined,
            addedSugars: addedSugars ? Number(addedSugars) : undefined,
            saturatedFat: saturatedFat ? Number(saturatedFat) : undefined,
            monounsaturatedFat: monounsaturatedFat ? Number(monounsaturatedFat) : undefined,
            polyunsaturatedFat: polyunsaturatedFat ? Number(polyunsaturatedFat) : undefined,
            omega36Ratio: omega36Ratio.trim() || undefined,
            glycemicLoad: glycemicLoad ? Number(glycemicLoad) : undefined,
            energyImpact: energyImpact.trim() || undefined,
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Time</label>
                            <input
                                type="time"
                                step="1"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 mt-2">
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

                    <h4 className="text-sm font-bold text-gray-700 mt-4 border-b border-gray-100 pb-1">Detailed Nutrition</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">NOVA Grade (1-4)</label>
                            <input type="number" min="1" max="4" value={novaGrade} onChange={(e) => setNovaGrade(e.target.value)} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Glycemic Load</label>
                            <input type="number" value={glycemicLoad} onChange={(e) => setGlycemicLoad(e.target.value)} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Fiber (g)</label>
                            <input type="number" value={fiber} onChange={(e) => setFiber(e.target.value)} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-2 text-gray-700 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Net Carbs (g)</label>
                            <input type="number" value={netCarbs} onChange={(e) => setNetCarbs(e.target.value)} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-2 text-gray-700 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Added Sugar (g)</label>
                            <input type="number" value={addedSugars} onChange={(e) => setAddedSugars(e.target.value)} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-2 text-gray-700 text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Sat Fat (g)</label>
                            <input type="number" value={saturatedFat} onChange={(e) => setSaturatedFat(e.target.value)} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-2 text-gray-700 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Mono Fat (g)</label>
                            <input type="number" value={monounsaturatedFat} onChange={(e) => setMonounsaturatedFat(e.target.value)} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-2 text-gray-700 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Poly Fat (g)</label>
                            <input type="number" value={polyunsaturatedFat} onChange={(e) => setPolyunsaturatedFat(e.target.value)} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-2 text-gray-700 text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Omega 3:6</label>
                            <input type="text" placeholder="e.g. 1:4" value={omega36Ratio} onChange={(e) => setOmega36Ratio(e.target.value)} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Energy Impact</label>
                            <input type="text" placeholder="e.g. Sustained" value={energyImpact} onChange={(e) => setEnergyImpact(e.target.value)} className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-gray-700" />
                        </div>
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
