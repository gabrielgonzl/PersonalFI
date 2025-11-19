/**
 * Skeleton Loading Components
 * Professional skeleton screens for better perceived performance
 */

export const Skeleton = ({ className = '', width, height }) => {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
      style={style}
    />
  );
};

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <Skeleton
        key={i}
        className="h-4"
        width={i === lines - 1 ? '70%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
    <div className="animate-pulse">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-2/3 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const SkeletonKPICard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="w-12 h-12 rounded-full" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    {/* Table Header */}
    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
    </div>

    {/* Table Rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4" width={colIndex === 0 ? '80%' : '60%'} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = ({ height = 300 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <Skeleton className="h-4 w-32 mb-4" />
    <Skeleton className="w-full" height={`${height}px`} />
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6 pb-6">
    {/* Header */}
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-12 w-64 mb-4" />
      <Skeleton className="h-8 w-32" />
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <SkeletonKPICard />
      <SkeletonKPICard />
      <SkeletonKPICard />
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SkeletonChart />
      <SkeletonChart />
    </div>

    {/* Table */}
    <SkeletonTable rows={5} columns={4} />
  </div>
);

export const SkeletonAssetCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonPortfolioCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="animate-pulse">
      <Skeleton className="h-5 w-40 mb-3" />
      <Skeleton className="h-8 w-32 mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ items = 3, CardComponent = SkeletonCard }) => (
  <div className="space-y-4">
    {[...Array(items)].map((_, i) => (
      <CardComponent key={i} />
    ))}
  </div>
);

export const SkeletonGrid = ({ items = 6, columns = 3, CardComponent = SkeletonCard }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
    {[...Array(items)].map((_, i) => (
      <CardComponent key={i} />
    ))}
  </div>
);
