/** Reusable skeleton placeholder for loading states */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-bg-card border border-border rounded-xl p-5 animate-pulse ${className}`}>
      <div className="h-3 bg-border rounded w-1/3 mb-3" />
      <div className="h-6 bg-border rounded w-1/2" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="w-8 h-8 bg-border rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-border rounded w-1/3" />
        <div className="h-2 bg-border rounded w-2/3" />
      </div>
      <div className="h-4 bg-border rounded w-16" />
    </div>
  );
}

export function SkeletonChart({ height = 250 }: { height?: number }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-border rounded w-1/4 mb-4" />
      <div className="rounded-lg bg-border/50" style={{ height }} />
    </div>
  );
}

/** Empty state shown when no data is available */
export function EmptyState({ icon = '📭', title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-sm font-semibold text-text-secondary mb-1">{title}</h3>
      {description && <p className="text-xs text-text-muted max-w-xs">{description}</p>}
    </div>
  );
}
