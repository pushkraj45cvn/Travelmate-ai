const Skeleton = ({ className = '', count = 1 }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((item) => (
        <div key={item} className={`skeleton ${className}`} />
      ))}
    </>
  );
};

export default Skeleton;

export const CardSkeleton = () => (
  <div className="card p-6 space-y-4">
    <Skeleton className="h-48 w-full rounded-xl" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    <div className="flex gap-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
      </div>
    ))}
  </div>
);
