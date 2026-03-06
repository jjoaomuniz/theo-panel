import { useState, useEffect, useCallback } from 'react';
import { useAPI } from '@/hooks/useAPI';
import { useWebSocket } from '@/hooks/useWebSocket';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { mockActivities } from '@/data/mockData';
import type { ActivityItem } from '@/types/agents';

const typeBorder: Record<string, string> = {
  info: 'border-l-accent-cyan',
  success: 'border-l-success',
  warning: 'border-l-warning',
  error: 'border-l-error',
};

export default function ActivityFeed({ compact = false }: { compact?: boolean }) {
  // Fetch from API (fallback to mock)
  const { data: apiActivities } = useAPI(
    () => api.activities(20),
    mockActivities.slice(0, 8),
    { pollInterval: 15_000 }
  );

  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities.slice(0, 8));

  // Update activities when API data changes
  useEffect(() => {
    if (apiActivities && apiActivities.length > 0) {
      setActivities(apiActivities);
    }
  }, [apiActivities]);

  // Listen for real-time activity via WebSocket
  useWebSocket({
    onMessage: useCallback((event) => {
      if (event.type === 'activity:new' && event.data) {
        const newActivity = event.data as ActivityItem;
        setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
      }
    }, []),
  });

  // Fallback: cycle mock activities if API is not available
  const [cycleIndex, setCycleIndex] = useState(0);
  const addMockActivity = useCallback(() => {
    if (apiActivities && apiActivities.length > 0) return;
    const nextActivity = mockActivities[cycleIndex % mockActivities.length];
    if (!nextActivity) return;
    const newItem: ActivityItem = {
      ...nextActivity,
      id: `${nextActivity.id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [newItem, ...prev.slice(0, 19)]);
    setCycleIndex(prev => prev + 1);
  }, [cycleIndex, apiActivities]);

  useEffect(() => {
    const delay = 8000 + Math.random() * 12000;
    const timer = setTimeout(addMockActivity, delay);
    return () => clearTimeout(timer);
  }, [addMockActivity]);

  return (
    <div className={`flex flex-col ${compact ? 'h-full' : ''}`}>
      {!compact && (
        <h3 className="text-xs text-text-muted uppercase tracking-wider font-mono mb-3 px-1">
          Atividade Recente
        </h3>
      )}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {activities.map((item, i) => (
          <div
            key={item.id}
            className={`bg-bg-card/80 border-l-2 ${typeBorder[item.type]} rounded-r-lg px-3 py-2.5 ${
              i === 0 ? 'animate-slide-in' : ''
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-xs shrink-0">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-accent-purple">{item.agentName}</span>
                  <span className="text-xs text-text-muted font-mono">{timeAgo(item.timestamp)}</span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 truncate">{item.action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
