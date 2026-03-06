import { Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useState } from 'react';
import { useNutrition } from '../hooks/useNutrition';

export function Diary() {
    const { meals, isLoading, error } = useNutrition();

    // View State
    const [currentDate, setCurrentDate] = useState(new Date());

    // Formatting helpers
    const todayStr = new Date().toISOString().split('T')[0];
    const viewingDateStr = currentDate.toISOString().split('T')[0];
    const isViewingToday = viewingDateStr === todayStr;

    // Filter meals for the selected date
    const selectedMeals = meals.filter(m => m.date === viewingDateStr);

    // Calculate day totals
    const totals = selectedMeals.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Navigation handlers
    const handlePrevDay = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 1);
        setCurrentDate(prev);
    }

    const handleNextDay = () => {
        if (isViewingToday) return;
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 1);
        setCurrentDate(next);
    }

    if (isLoading) {
        return <div className="text-center p-8 text-gray-500">Loading diary...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Food Diary</h2>
                    <p className="text-gray-500 text-sm mt-1">Review past meals</p>
                </div>
                <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
                    <Filter size={20} />
                </button>
            </div>

            {/* Date Navigator */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-50 flex items-center justify-between">
                <button onClick={handlePrevDay} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer">
                    <ChevronLeft size={24} />
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                        <Calendar size={20} />
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-gray-900">{isViewingToday ? 'Today' : currentDate.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                        <span className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            {currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleNextDay}
                    className={`p-2 rounded-full transition-colors cursor-pointer ${isViewingToday ? 'text-gray-300 cursor-not-allowed opacity-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                    disabled={isViewingToday}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Summary for the day */}
            <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Calories</span>
                    <span className="block font-bold text-gray-800">{Math.round(totals.calories)}</span>
                </div>
                <div className="bg-red-50 p-3 rounded-2xl text-center border border-red-100">
                    <span className="block text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Protein</span>
                    <span className="block font-bold text-red-800">{Math.round(totals.protein)}g</span>
                </div>
                <div className="bg-yellow-50 p-3 rounded-2xl text-center border border-yellow-100">
                    <span className="block text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-1">Carbs</span>
                    <span className="block font-bold text-yellow-800">{Math.round(totals.carbs)}g</span>
                </div>
                <div className="bg-purple-50 p-3 rounded-2xl text-center border border-purple-100">
                    <span className="block text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Fat</span>
                    <span className="block font-bold text-purple-800">{Math.round(totals.fat)}g</span>
                </div>
            </div>

            {/* Meals List */}
            <div className="space-y-4 pt-4">
                <h3 className="font-bold text-gray-900 px-1">Recorded Meals</h3>

                {selectedMeals.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 text-sm">
                        No meals found for this date.
                    </div>
                ) : (
                    selectedMeals.map(meal => (
                        <div key={meal.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl overflow-hidden relative border border-gray-100">
                                        <span className="text-gray-400 z-10 block">🍽️</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{meal.foodName}</h4>
                                        <div className="flex items-center gap-2 flex-wrap mt-1">
                                            <p className="text-sm font-medium text-gray-500">{meal.time}</p>
                                            {meal.novaGrade && (() => {
                                                const label = meal.novaGrade <= 1.5 ? 'Unprocessed' : meal.novaGrade <= 2.5 ? 'Lightly Processed' : meal.novaGrade <= 3.5 ? 'Moderately Processed' : 'Ultra-Processed';
                                                const dot = meal.novaGrade <= 1.5 ? 'bg-green-500' : meal.novaGrade <= 2.5 ? 'bg-lime-500' : meal.novaGrade <= 3.5 ? 'bg-orange-400' : 'bg-red-500';
                                                return (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${meal.novaGrade <= 2 ? 'bg-green-100 text-green-700' :
                                                        meal.novaGrade === 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                                                        {label}
                                                    </span>
                                                );
                                            })()}
                                            {meal.energyImpact && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
                                                    {meal.energyImpact}
                                                </span>
                                            )}
                                            {meal.comment && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <p className="text-xs text-indigo-500 font-semibold italic">"{meal.comment}"</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-extrabold text-blue-600 block text-xl">{Math.round(meal.calories)}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kcal</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                    <span className="text-xs font-semibold text-gray-600 truncate">{Math.round(meal.protein)}g</span>
                                </div>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <span className="text-xs font-semibold text-gray-600 truncate">{Math.round(meal.carbs)}g</span>
                                </div>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                    <span className="text-xs font-semibold text-gray-600 truncate">{Math.round(meal.fat)}g</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
