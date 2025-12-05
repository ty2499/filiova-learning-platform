interface TopProgressBarProps {
  isLoading: boolean;
  progress: number;
}

const TopProgressBar = ({ isLoading, progress }: TopProgressBarProps) => {
  if (!isLoading && progress === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 shadow-lg shadow-blue-500/50 transition-all duration-200 ease-out"
        style={{ 
          width: `${progress}%`,
          opacity: isLoading ? 1 : 0,
        }}
      />
    </div>
  );
};

export default TopProgressBar;
