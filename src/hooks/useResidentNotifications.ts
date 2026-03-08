import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResidentNotification {
  id: string;
  type: 'reply' | 'status_change';
  reportId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface UseResidentNotificationsOptions {
  userId: string | null;
  enabled?: boolean;
}

export function useResidentNotifications({ userId, enabled = true }: UseResidentNotificationsOptions) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<ResidentNotification[]>([]);
  const reportIdsRef = useRef<string[]>([]);

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {
      // Audio not available
    }
  }, []);

  // Fetch user's report IDs
  useEffect(() => {
    if (!enabled || !userId) return;

    const fetchReportIds = async () => {
      const { data } = await supabase
        .from('environmental_reports')
        .select('id')
        .eq('reporter_id', userId);
      reportIdsRef.current = data?.map(r => r.id) || [];
    };
    fetchReportIds();
  }, [enabled, userId]);

  // Subscribe to new replies on user's reports
  useEffect(() => {
    if (!enabled || !userId) return;

    const channel = supabase
      .channel(`resident-replies-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'report_replies',
        },
        (payload) => {
          const reply = payload.new as { id: string; report_id: string; message: string; created_at: string };
          
          // Only notify if this reply is for one of the user's reports
          if (reportIdsRef.current.includes(reply.report_id)) {
            const notification: ResidentNotification = {
              id: reply.id,
              type: 'reply',
              reportId: reply.report_id,
              message: reply.message,
              timestamp: reply.created_at,
              read: false,
            };

            setNotifications(prev => [notification, ...prev]);
            playNotificationSound();
            
            toast({
              title: '💬 Admin Reply',
              description: reply.message.length > 80 
                ? reply.message.slice(0, 80) + '…' 
                : reply.message,
              duration: 8000,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to status changes on user's reports
    const statusChannel = supabase
      .channel(`resident-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'environmental_reports',
        },
        (payload) => {
          const report = payload.new as { id: string; reporter_id: string; status: string; report_type: string; updated_at: string };
          const oldReport = payload.old as { status?: string };

          if (report.reporter_id === userId && oldReport.status !== report.status) {
            const statusEmoji = report.status === 'verified' ? '✅' : report.status === 'rejected' ? '❌' : '⏳';
            const statusLabel = report.status === 'verified' ? 'Verified' : report.status === 'rejected' ? 'Rejected' : 'Pending';

            const notification: ResidentNotification = {
              id: `status-${report.id}-${Date.now()}`,
              type: 'status_change',
              reportId: report.id,
              message: `Your report has been ${statusLabel.toLowerCase()} by the county admin.`,
              timestamp: report.updated_at,
              read: false,
            };

            setNotifications(prev => [notification, ...prev]);
            playNotificationSound();

            toast({
              title: `${statusEmoji} Report ${statusLabel}`,
              description: `Your report has been ${statusLabel.toLowerCase()} by the county admin.`,
              duration: 8000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(statusChannel);
    };
  }, [enabled, userId, toast, playNotificationSound]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markAllRead };
}
