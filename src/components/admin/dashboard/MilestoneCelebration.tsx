
interface MilestoneCelebrationProps {
  showMilestone: boolean;
  milestoneMonth: string;
}

export const MilestoneCelebration = ({ showMilestone, milestoneMonth }: MilestoneCelebrationProps) => {
  if (!showMilestone) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white/80 rounded-2xl shadow-lg p-8 flex flex-col items-center animate-fade-in-up">
        <span className="text-5xl mb-2 animate-bounce">🏆</span>
        <span className="text-2xl font-bold text-lemon-700 lemon-text-glow">Milestone!</span>
        <span className="text-lg text-gray-700 mt-1">₦1,000,000+ revenue in {milestoneMonth}</span>
      </div>
    </div>
  );
};
