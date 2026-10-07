export default function AgencyLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="space-y-3">
        <div className="skeleton-shimmer h-3 w-24 rounded-full" />
        <div className="skeleton-shimmer h-12 w-64 rounded-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton-shimmer h-96 rounded-2xl" />
    </div>
  );
}
