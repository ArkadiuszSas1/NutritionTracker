import { useNutrition } from '../hooks/useNutrition';

import { useState, useRef } from 'react';
import type { MealEntry } from '../types';

import { EditMealModal } from './EditMealModal';

function getNovaLabel(score: number): string {
    if (score <= 1.5) return 'Unprocessed';
    if (score <= 2.5) return 'Lightly Processed';
    if (score <= 3.5) return 'Moderately Processed';
    return 'Ultra-Processed';
}

function getNovaDotColor(score: number): string {
    if (score <= 1.5) return 'bg-green-500';
    if (score <= 2.5) return 'bg-lime-500';
    if (score <= 3.5) return 'bg-orange-400';
    return 'bg-red-500';
}

export function Dashboard() {
    const { meals, isLoading, error, removeMeal, updateMeal } = useNutrition();

    const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null);

    // Calculate today's totals
    const today = new Date().toISOString().split('T')[0];
    const todaysMeals = meals.filter(meal => meal.date === today);

    const totals = todaysMeals.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
        fiber: acc.fiber + (meal.fiber || 0),
        netCarbs: acc.netCarbs + (meal.netCarbs || 0),
        addedSugars: acc.addedSugars + (meal.addedSugars || 0),
        saturatedFat: acc.saturatedFat + (meal.saturatedFat || 0),
        monounsaturatedFat: acc.monounsaturatedFat + (meal.monounsaturatedFat || 0),
        polyunsaturatedFat: acc.polyunsaturatedFat + (meal.polyunsaturatedFat || 0),
        // Calculate running sum of NOVA grades to find average later
        novaSum: acc.novaSum + (meal.novaGrade || 0),
        novaCount: acc.novaCount + (meal.novaGrade ? 1 : 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, netCarbs: 0, addedSugars: 0, saturatedFat: 0, monounsaturatedFat: 0, polyunsaturatedFat: 0, novaSum: 0, novaCount: 0 });

    // Derive a daily omega-3/6 ratio summary from per-meal values
    const omega36Ratios = todaysMeals
        .map(m => m.omega36Ratio)
        .filter((r): r is string => !!r);
    const dailyOmega36 = omega36Ratios.length > 0 ? omega36Ratios.join(', ') : null;

    const avgNova = totals.novaCount > 0 ? (totals.novaSum / totals.novaCount).toFixed(1) : '-';

    // Goals (could be user-configurable later)
    const GOALS = { calories: 2000, protein: 120, carbs: 250, fat: 65, fiber: 30, sugars: 50, satFat: 20 };

    if (isLoading) {
        return <div className="text-center p-8 text-gray-500">Loading your data...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    const handleSaveMeal = async (updatedMeal: MealEntry) => {
        try {
            await updateMeal(updatedMeal);
            setEditingMeal(null);
        } catch (err) {
            alert('Failed to update meal. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Today's Summary</h2>
                    <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                {avgNova !== '-' && (
                    <div className="text-right relative">
                        <div className="flex items-center justify-end gap-1">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Food Processing</span>
                            <button
                                type="button"
                                className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-help relative"
                                aria-label="What is the Food Processing Score?"
                                onClick={(e) => {
                                    const tip = (e.currentTarget.nextElementSibling as HTMLElement);
                                    tip.classList.toggle('hidden');
                                }}
                            >i</button>
                            <div className="hidden absolute top-6 right-0 z-50 w-56 p-3 bg-gray-900 text-white text-[11px] leading-relaxed rounded-xl shadow-xl">
                                <p className="font-bold mb-1">NOVA Processing Scale</p>
                                <ul className="space-y-0.5">
                                    <li><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span><b>1</b> — Unprocessed</li>
                                    <li><span className="inline-block w-2 h-2 rounded-full bg-lime-500 mr-1"></span><b>2</b> — Lightly Processed</li>
                                    <li><span className="inline-block w-2 h-2 rounded-full bg-orange-400 mr-1"></span><b>3</b> — Moderately Processed</li>
                                    <li><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span><b>4</b> — Ultra-Processed</li>
                                </ul>
                                <p className="mt-1.5 text-gray-400">Lower is better. Aim for mostly 1–2.</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${getNovaDotColor(Number(avgNova))}`}></span>
                            <span className={`text-xl font-bold ${Number(avgNova) <= 2 ? 'text-green-600' : Number(avgNova) <= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {avgNova}
                            </span>
                        </div>
                        <span className="block text-[9px] font-semibold text-gray-400 mt-0.5">{getNovaLabel(Number(avgNova))}</span>
                    </div>
                )}
            </div>

            {/* Main Calories Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 relative overflow-hidden">
                {/* Subtle background decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="text-center md:text-left space-y-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Calories Eaten</p>
                        <div className="flex items-baseline justify-center md:justify-start gap-1 text-gray-900">
                            <span className="text-5xl font-extrabold tracking-tighter">{Math.round(totals.calories)}</span>
                            <span className="text-lg font-medium text-gray-400">/ {GOALS.calories}</span>
                        </div>
                    </div>

                    {/* Circular Progress */}
                    {(() => {
                        const radius = 52;
                        const circumference = 2 * Math.PI * radius;
                        const pct = Math.min(totals.calories / GOALS.calories, 1);
                        const offset = circumference * (1 - pct);
                        const overBudget = totals.calories > GOALS.calories;
                        return (
                            <div className="w-32 h-32 relative flex items-center justify-center">
                                <svg className="w-full h-full" viewBox="0 0 120 120">
                                    {/* Background track */}
                                    <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
                                    {/* Filled arc */}
                                    <circle
                                        cx="60" cy="60" r={radius}
                                        fill="none"
                                        stroke={overBudget ? '#ef4444' : '#3b82f6'}
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        transform="rotate(-90 60 60)"
                                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="block text-2xl font-bold text-gray-800 pb-1">{Math.max(0, GOALS.calories - Math.round(totals.calories))}</span>
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Left</span>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-3">
                <MacroCard label="Protein" current={totals.protein} target={GOALS.protein} colorClass="bg-red-50" fillClass="bg-red-500" textClass="text-red-700" />
                <MacroCard label="Carbs" current={totals.carbs} target={GOALS.carbs} colorClass="bg-yellow-50" fillClass="bg-yellow-500" textClass="text-yellow-700" />
                <MacroCard label="Fat" current={totals.fat} target={GOALS.fat} colorClass="bg-purple-50" fillClass="bg-purple-500" textClass="text-purple-700" />
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Carbs Breakdown Panel */}
                <BreakdownPanel title="Carbs Breakdown" accentClass="border-yellow-200" titleClass="text-yellow-700">
                    <BreakdownRow label="Fiber" value={totals.fiber} unit="g" target={GOALS.fiber} colorClass="text-green-600" />
                    <BreakdownRow label="Net Carbs" value={totals.netCarbs} unit="g" />
                    <BreakdownRow label="Added Sugars" value={totals.addedSugars} unit="g" target={GOALS.sugars} colorClass="text-orange-500" />
                </BreakdownPanel>

                {/* Fat Breakdown Panel */}
                <BreakdownPanel title="Fat Breakdown" accentClass="border-purple-200" titleClass="text-purple-700">
                    <BreakdownRow label="Saturated" value={totals.saturatedFat} unit="g" target={GOALS.satFat} colorClass="text-red-500" />
                    <BreakdownRow label="Monounsaturated" value={totals.monounsaturatedFat} unit="g" />
                    <BreakdownRow label="Polyunsaturated" value={totals.polyunsaturatedFat} unit="g" />
                    {dailyOmega36 && (
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-xs font-semibold text-gray-500">Omega‑3/6 Ratio</span>
                            <span className="text-sm font-bold text-indigo-600">{dailyOmega36}</span>
                        </div>
                    )}
                </BreakdownPanel>
            </div>

            {/* Recent Meals Section */}
            <div className="pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Today's Meals</h3>
                </div>

                <div className="space-y-3">
                    {todaysMeals.length === 0 ? (
                        <div className="text-center p-6 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
                            No meals logged today yet.
                        </div>
                    ) : (
                        todaysMeals.map(meal => (
                            <MealItem key={meal.id} meal={meal} onRemove={removeMeal} onEdit={() => setEditingMeal(meal)} />
                        ))
                    )}
                </div>
            </div>

            {editingMeal && (
                <EditMealModal
                    meal={editingMeal}
                    onSave={handleSaveMeal}
                    onCancel={() => setEditingMeal(null)}
                />
            )}
        </div>
    );
}

function MealItem({ meal, onRemove, onEdit }: { meal: MealEntry, onRemove: (id: string) => void, onEdit: () => void }) {
    const [offset, setOffset] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const startX = useRef(0);
    const currentX = useRef(0);
    const isDragging = useRef(false);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isDeleting) return;
        isDragging.current = true;
        startX.current = e.clientX;
        currentX.current = e.clientX;
        // Optionally capture pointer to keep receiving events even if cursor leaves element
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isDeleting || !isDragging.current) return;
        currentX.current = e.clientX;
        const diff = currentX.current - startX.current;
        // Allow swiping left (diff < 0) and right (diff > 0)
        setOffset(Math.max(-window.innerWidth, Math.min(diff, window.innerWidth)));
    };

    const handlePointerUpOrCancel = (e: React.PointerEvent) => {
        if (isDeleting || !isDragging.current) return;
        isDragging.current = false;

        try {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch (err) {
            // Ignore if pointer capture was already lost
        }

        if (offset > 100) {
            // Swiped right -> Delete
            setIsDeleting(true);
            setOffset(window.innerWidth); // Animate completely off screen
            setTimeout(() => {
                onRemove(meal.id);
            }, 300); // Wait for transition to finish
        } else if (offset < -100) {
            // Swiped left -> Edit
            setOffset(0); // Snap back
            onEdit();
        } else {
            // Not swiped enough
            setOffset(0); // Snap back
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gray-100">
            {/* Background delete area (left side, shows when swiping right) */}
            <div className="absolute inset-y-0 left-0 bg-red-100 flex items-center px-6" style={{ right: '50%' }}>
                <span className="text-red-600 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    Delete
                </span>
            </div>

            {/* Background edit area (right side, shows when swiping left) */}
            <div className="absolute inset-y-0 right-0 bg-indigo-100 flex items-center justify-end px-6" style={{ left: '50%' }}>
                <span className="text-indigo-600 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    Edit
                    <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                </span>
            </div>

            <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUpOrCancel}
                onPointerCancel={handlePointerUpOrCancel}
                style={{
                    transform: `translateX(${offset}px)`,
                    transition: offset === 0 || isDeleting ? 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
                    touchAction: 'pan-y' // Prevent vertical scrolling from interfering horizontally on some touch devices, but keep vertical scroll working
                }}
                className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between group cursor-pointer relative z-10 select-none ${isDeleting ? 'opacity-0 transition-opacity duration-300' : ''}`}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl">🍽️</div>
                    <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{meal.foodName}</h4>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            <p className="text-xs text-gray-500 font-medium">{meal.time.slice(0, 5)}</p>
                            {meal.novaGrade && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${meal.novaGrade <= 2 ? 'bg-green-100 text-green-700' :
                                    meal.novaGrade === 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${getNovaDotColor(meal.novaGrade)}`}></span>
                                    {getNovaLabel(meal.novaGrade)}
                                </span>
                            )}
                            {meal.energyImpact && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
                                    {meal.energyImpact}
                                </span>
                            )}
                            {meal.comment && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <p className="text-[10px] text-blue-500 font-medium italic truncate max-w-[120px]">"{meal.comment}"</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="font-bold text-gray-900 block">{meal.calories}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">kcal</span>
                </div>
            </div>
        </div>
    );
}

function MacroCard({ label, current, target, colorClass, fillClass, textClass }: { label: string, current: number, target: number, colorClass: string, fillClass: string, textClass: string }) {
    const percentage = Math.min((current / target) * 100, 100);

    return (
        <div className={`p-4 rounded-2xl flex flex-col justify-between h-28 ${colorClass}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${textClass}`}>{label}</span>
            <div>
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-xl font-bold text-gray-900">{Math.round(current)}</span>
                    <span className="text-xs font-semibold text-gray-500">/ {target}g</span>
                </div>
                <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${fillClass}`} style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        </div>
    );
}

function BreakdownPanel({ title, accentClass, titleClass, children }: { title: string, accentClass: string, titleClass: string, children: React.ReactNode }) {
    return (
        <div className={`bg-white rounded-3xl p-5 shadow-sm border ${accentClass} space-y-1`}>
            <h3 className={`text-xs font-bold uppercase tracking-widest pb-2 border-b border-gray-100 ${titleClass}`}>{title}</h3>
            <div className="divide-y divide-gray-50">
                {children}
            </div>
        </div>
    );
}

function BreakdownRow({ label, value, unit, target, colorClass = "text-gray-900" }: { label: string, value: number | undefined, unit: string, target?: number, colorClass?: string }) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-xs font-semibold text-gray-500">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className={`text-sm font-bold ${colorClass}`}>{value !== undefined ? Math.round(value) : '-'}</span>
                <span className="text-[10px] font-medium text-gray-400">{unit}</span>
                {target && <span className="text-[10px] font-medium text-gray-300 ml-0.5">/ {target}{unit}</span>}
            </div>
        </div>
    );
}
