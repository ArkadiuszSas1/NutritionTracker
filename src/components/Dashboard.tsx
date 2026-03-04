import { useNutrition } from '../hooks/useNutrition';

export function Dashboard() {
    const { meals, isLoading, error } = useNutrition();

    // Calculate today's totals
    const today = new Date().toISOString().split('T')[0];
    const todaysMeals = meals.filter(meal => meal.date === today);

    const totals = todaysMeals.reduce((acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Goals (could be user-configurable later)
    const GOALS = { calories: 2000, protein: 120, carbs: 250, fat: 65 };

    if (isLoading) {
        return <div className="text-center p-8 text-gray-500">Loading your data...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Today's Summary</h2>
                <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Main Calories Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 relative overflow-hidden">
                {/* Subtle background decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="text-center md:text-left space-y-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Calories Eaten</p>
                        <div className="flex items-baseline justify-center md:justify-start gap-1 text-gray-900">
                            <span className="text-5xl font-extrabold tracking-tighter">{totals.calories}</span>
                            <span className="text-lg font-medium text-gray-400">/ {GOALS.calories}</span>
                        </div>
                    </div>

                    {/* Circular Progress (Simplified for now) */}
                    <div className="w-32 h-32 rounded-full border-[10px] border-gray-100 border-t-blue-500 border-r-blue-500 transform rotate-45 flex items-center justify-center shadow-inner relative">
                        <div className="transform -rotate-45 text-center">
                            <span className="block text-2xl font-bold text-gray-800 pb-1">{Math.max(0, GOALS.calories - totals.calories)}</span>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Left</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-3">
                <MacroCard label="Protein" current={totals.protein} target={GOALS.protein} colorClass="bg-red-50" fillClass="bg-red-500" textClass="text-red-700" />
                <MacroCard label="Carbs" current={totals.carbs} target={GOALS.carbs} colorClass="bg-yellow-50" fillClass="bg-yellow-500" textClass="text-yellow-700" />
                <MacroCard label="Fat" current={totals.fat} target={GOALS.fat} colorClass="bg-purple-50" fillClass="bg-purple-500" textClass="text-purple-700" />
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
                            <div key={meal.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between group hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl">🍽️</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{meal.foodName}</h4>
                                        <p className="text-xs text-gray-500 font-medium">{meal.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-gray-900 block">{meal.calories}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">kcal</span>
                                </div>
                            </div>
                        ))
                    )}
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
