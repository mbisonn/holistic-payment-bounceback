interface DashboardHeaderProps {
  onTitleClick: () => void;
  showEasterEgg: boolean;
}

export const DashboardHeader = ({ onTitleClick, showEasterEgg }: DashboardHeaderProps) => {
  return (
    <div>
      <h2
        className={`text-base md:text-xl lg:text-3xl font-bold tracking-tight cursor-pointer select-none relative ${showEasterEgg ? 'text-pink-500 animate-bounce' : ''}`}
        onClick={onTitleClick}
      >
        Dashboard
        {showEasterEgg && (
          <span className="absolute left-full ml-2 text-xl animate-wiggle">🥚 You found the secret!</span>
        )}
      </h2>
      <p className="text-muted-foreground">
        Here's what's happening with your business today.
      </p>
    </div>
  );
};
