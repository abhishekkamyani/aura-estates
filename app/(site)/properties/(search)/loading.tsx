export default function PropertiesLoading() {
  return (
    <div role="status" aria-label="Loading residences">
      <div className="border-b border-stone-200/80 bg-alabaster">
        <div className="container-luxe max-w-none space-y-4 py-10 lg:px-12">
          <div className="skeleton-shimmer h-3 w-40 rounded-full" />
          <div className="skeleton-shimmer h-12 w-80 rounded-2xl" />
        </div>
      </div>
      <div className="h-16 border-b border-stone-200/80 bg-white" />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(26rem,40%)]">
        <div className="grid gap-6 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:py-10 lg:pl-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[1.5rem] border border-stone-200/80 bg-white p-2">
              <div className="skeleton-shimmer aspect-[4/3] rounded-[1.1rem]" />
              <div className="space-y-3 p-3">
                <div className="skeleton-shimmer h-6 w-40 rounded-lg" />
                <div className="skeleton-shimmer h-4 w-56 rounded-full" />
                <div className="skeleton-shimmer h-4 w-48 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden p-4 lg:block">
          <div className="skeleton-shimmer h-[calc(100dvh-var(--header-height)-6rem)] rounded-[1.5rem]" />
        </div>
      </div>
    </div>
  );
}
