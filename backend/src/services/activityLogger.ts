import { supabaseAdmin } from '../lib/supabase.js';
import type { ActivityItem } from '../types/index.js';

export async function logActivities(activities: ActivityItem[]): Promise<void> {
  if (!activities.length) return;

  const rows = activities.map(a => ({
    agent_id: a.agentId,
    agent_name: a.agentName,
    type: a.type,
    message: a.action,
    timestamp: a.timestamp,
  }));

  const { error } = await supabaseAdmin
    .from('activity_logs')
    .upsert(rows, { onConflict: 'agent_id,timestamp' });

  if (error) {
    console.warn('[ActivityLogger] Supabase insert error:', error.message);
  }
}
