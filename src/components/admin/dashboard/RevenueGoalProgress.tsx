
interface RevenueGoalProgressProps {
  currentMonthRevenue: number;
  revenueGoal: number;
  showGoalBurst: boolean;
}

export const RevenueGoalProgress = ({ currentMonthRevenue, revenueGoal, showGoalBurst }: RevenueGoalProgressProps) => {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-purple-700">Current Month Revenue</span>
        <span className="text-sm font-semibold text-gray-700">Goal: ₦{revenueGoal.toLocaleString()}</span>
      </div>
      <div className="relative h-6 bg-purple-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(100, (currentMonthRevenue / revenueGoal) * 100)}%` }}
        />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-900 font-bold">
          ₦{currentMonthRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
        {showGoalBurst && <div className="absolute inset-0 z-10 pointer-events-none animate-goal-burst" />}
      </div>
    </div>
  );
};
