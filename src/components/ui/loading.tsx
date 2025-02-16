export const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-r-2 border-primary animate-pulse"></div>
      </div>
    </div>
  );
};
