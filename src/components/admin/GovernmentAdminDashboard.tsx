import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, CheckCircle2, XCircle, Clock, AlertTriangle, MapPin,
  Loader2, Brain, Send, Globe, FileText, ArrowLeft,
  RefreshCw, Star, Zap, BellRing, Bell, CircleCheck, CircleX,
  ChevronRight, Search, Filter, ChevronLeft, Image, Calendar,
  User, MessageSquare, Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { kenyaCounties } from '@/data/aquaguardData';
import { format, formatDistanceToNow } from 'date-fns';

interface EnvironmentalReport {
  id: string;
  reporter_id: string;
  report_type: string;
  county_id: string;
  town_name: string | null;
  sub_location: string | null;
  road_name: string | null;
  landmark: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
  image_url: string | null;
  status: 'pending' | 'verified' | 'rejected';
  ai_confidence_score: number | null;
  ai_analysis: string | null;
  is_duplicate: boolean | null;
  severity_level: string | null;
  escalated: boolean | null;
  created_at: string;
}

interface ReportReply {
  id: string;
  report_id: string;
  admin_id: string;
  message: string;
  created_at: string;
}

interface GovernmentAdminDashboardProps {
  onClose: () => void;
  adminName: string;
}

const typeConfig: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
  flooded_road: { label: 'Flooded Road', icon: '🌊', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' },
  dry_borehole: { label: 'Dry Borehole', icon: '🕳️', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20' },
  broken_kiosk: { label: 'Broken Kiosk', icon: '🚰', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10', border: 'border-yellow-200 dark:border-yellow-500/20' },
  overflowing_river: { label: 'Overflowing River', icon: '🏞️', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-200 dark:border-cyan-500/20' },
};

const statusConfig = {
  pending: { label: 'Pending Review', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', dot: 'bg-warning' },
  verified: { label: 'Approved', color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', dot: 'bg-success' },
  rejected: { label: 'Rejected', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', dot: 'bg-destructive' },
};

const notifyResident = async (reportId: string, action: string, adminMessage?: string) => {
  try {
    await supabase.functions.invoke('notify-resident', { body: { reportId, action, adminMessage } });
  } catch { /* non-blocking */ }
};

// ─── Report Detail Modal ────────────────────────────────────────────────────
const ReportDetail = ({
  report, onClose, onStatusChange,
}: {
  report: EnvironmentalReport;
  onClose: () => void;
  onStatusChange: (id: string, status: 'verified' | 'rejected') => void;
}) => {
  const [replies, setReplies] = useState<ReportReply[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(report.status);
  const { toast } = useToast();

  useEffect(() => {
    fetchReplies();
    // Scroll to top when opened
    document.getElementById('report-detail-scroll')?.scrollTo(0, 0);
  }, [report.id]);

  const fetchReplies = async () => {
    const { data } = await supabase
      .from('report_replies').select('*').eq('report_id', report.id).order('created_at', { ascending: true });
    setReplies((data as ReportReply[]) || []);
  };

  const handleAction = async (action: 'verified' | 'rejected') => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('environmental_reports').update({ status: action }).eq('id', report.id);
      if (error) throw error;

      // Log verification (non-blocking)
      supabase.from('report_verifications').insert({ report_id: report.id, admin_id: user.id, action, comment: comment || null })
        .then(({ error }) => { if (error) console.warn('Verification log skipped:', error.message); });

      // If comment, send it as a reply so resident sees the reason
      if (comment.trim()) {
        const prefix = action === 'verified' ? '✅ Approved' : '❌ Rejected';
        await supabase.from('report_replies').insert({
          report_id: report.id, admin_id: user.id,
          message: `${prefix} — ${comment.trim()}`,
        });
        await fetchReplies();
      }

      notifyResident(report.id, action, comment || undefined);
      setCurrentStatus(action);
      onStatusChange(report.id, action);
      setComment('');

      toast({
        title: action === 'verified' ? '✅ Report Approved' : '❌ Report Rejected',
        description: comment ? 'Your reason was sent to the resident.' : 'The resident has been notified.',
      });
    } catch (err) {
      toast({ title: 'Action failed', description: err instanceof Error ? err.message : 'Please try again', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim()) return;
    setIsSendingReply(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('report_replies').insert({
        report_id: report.id, admin_id: user.id, message: replyMessage.trim(),
      });
      if (error) throw error;

      notifyResident(report.id, 'reply', replyMessage.trim());
      setReplyMessage('');
      await fetchReplies();
      toast({ title: '📨 Notification sent!', description: 'The resident received your message in real-time.' });
    } catch (err) {
      toast({ title: 'Failed to send', description: err instanceof Error ? err.message : 'Please try again', variant: 'destructive' });
    } finally {
      setIsSendingReply(false);
    }
  };

  const type = typeConfig[report.report_type] || { label: report.report_type, icon: '📋', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
  const county = kenyaCounties.find(c => c.id === report.county_id)?.name || report.county_id;
  const status = statusConfig[currentStatus];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors flex-shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl flex-shrink-0">{type.icon}</span>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-base leading-tight truncate">{type.label}</h2>
              <p className="text-xs text-muted-foreground truncate">{report.town_name || 'Unknown area'}, {county} County</p>
            </div>
          </div>
          <div className="ml-auto flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.color} ${status.border}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div id="report-detail-scroll" className="flex-1 overflow-y-auto">
          {/* Evidence image */}
          {report.image_url ? (
            <div className="w-full aspect-video bg-muted relative overflow-hidden">
              <img src={report.image_url} alt="Evidence" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm gap-1">
                  <Image className="w-3 h-3" />Evidence Photo
                </Badge>
              </div>
            </div>
          ) : (
            <div className="w-full h-20 bg-muted/50 flex items-center justify-center">
              <div className="text-4xl opacity-30">{type.icon}</div>
            </div>
          )}

          <div className="p-5 space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-xl p-3 border ${type.bg} ${type.border}`}>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Report Type</p>
                <p className={`text-sm font-semibold ${type.color}`}>{type.icon} {type.label}</p>
              </div>
              <div className="rounded-xl p-3 border border-border bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">County</p>
                <p className="text-sm font-semibold flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-primary" />{county}</p>
              </div>
              {report.town_name && (
                <div className="rounded-xl p-3 border border-border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Town / Area</p>
                  <p className="text-sm font-semibold flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" />{report.town_name}</p>
                </div>
              )}
              <div className="rounded-xl p-3 border border-border bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Submitted</p>
                <p className="text-sm font-semibold flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" />{format(new Date(report.created_at), 'MMM d, yyyy HH:mm')}</p>
              </div>
              {report.sub_location && (
                <div className="rounded-xl p-3 border border-border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Ward / Sub-location</p>
                  <p className="text-sm font-semibold">{report.sub_location}</p>
                </div>
              )}
              {report.landmark && (
                <div className="rounded-xl p-3 border border-border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Nearby Landmark</p>
                  <p className="text-sm font-semibold">{report.landmark}</p>
                </div>
              )}
              {report.road_name && (
                <div className="rounded-xl p-3 border border-border bg-muted/30 col-span-2">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Road</p>
                  <p className="text-sm font-semibold">{report.road_name}</p>
                </div>
              )}
              {report.severity_level && (
                <div className="rounded-xl p-3 border border-border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Severity</p>
                  <p className="text-sm font-semibold capitalize">{report.severity_level}</p>
                </div>
              )}
              {report.escalated && (
                <div className="rounded-xl p-3 border border-orange-500/20 bg-orange-500/10">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Flag</p>
                  <p className="text-sm font-semibold text-orange-500 flex items-center gap-1"><Zap className="w-3.5 h-3.5" />Escalated</p>
                </div>
              )}
            </div>

            {/* Description */}
            {report.description && (
              <div className="rounded-xl border border-border p-4 bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />Resident's Description
                </p>
                <p className="text-sm leading-relaxed text-foreground">{report.description}</p>
              </div>
            )}

            {/* GPS coordinates */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="w-3 h-3" />
              <span>GPS: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
            </div>

            {/* AI Analysis */}
            {report.ai_analysis && (
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold">AI Analysis</span>
                  {report.ai_confidence_score !== null && (
                    <Badge className="ml-auto text-xs" variant={report.ai_confidence_score >= 70 ? 'default' : 'secondary'}>
                      {report.ai_confidence_score}% confidence
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{report.ai_analysis}</p>
                <p className="text-xs text-muted-foreground/50 mt-2 italic">AI advisory only — your decision is final.</p>
              </div>
            )}

            {/* ── DECISION SECTION ── */}
            {currentStatus === 'pending' ? (
              <div className="rounded-xl border-2 border-dashed border-warning/40 bg-warning/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <p className="text-sm font-semibold text-warning">Awaiting your decision</p>
                </div>
                <Textarea
                  placeholder="Optional: add a reason or comment — this will be sent to the resident as a notification..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="min-h-[80px] text-sm resize-none bg-background"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="bg-success hover:bg-success/90 text-white gap-2 h-11"
                    onClick={() => handleAction('verified')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CircleCheck className="w-5 h-5" />}
                    Approve Report
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2 h-11"
                    onClick={() => handleAction('rejected')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CircleX className="w-5 h-5" />}
                    Reject Report
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-primary" />
                  Resident gets a real-time in-app notification instantly.
                </p>
              </div>
            ) : (
              <div className={`rounded-xl border p-3 flex items-center gap-3 ${currentStatus === 'verified' ? 'border-success/20 bg-success/5' : 'border-destructive/20 bg-destructive/5'}`}>
                {currentStatus === 'verified'
                  ? <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  : <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />}
                <p className="text-sm font-medium">
                  This report has been <span className="font-bold">{currentStatus === 'verified' ? 'approved' : 'rejected'}</span>.
                </p>
              </div>
            )}

            {/* ── REPLY / NOTIFY RESIDENT ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-border">
                <Bell className="w-4 h-4 text-primary" />
                <p className="text-sm font-bold">Send a Message to the Resident</p>
                {replies.length > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">{replies.length} message{replies.length > 1 ? 's' : ''} sent</span>
                )}
              </div>

              {/* Previous replies */}
              {replies.length > 0 && (
                <div className="space-y-2.5">
                  {replies.map(reply => (
                    <div key={reply.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 bg-primary/5 border border-primary/10 rounded-xl px-3.5 py-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-primary">Government Admin</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(reply.created_at), 'MMM d, HH:mm')}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{reply.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Compose */}
              <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2.5">
                <Textarea
                  placeholder="Type your message to the resident here. They will receive it as a real-time notification in the app..."
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  className="min-h-[90px] text-sm resize-none bg-background border-input"
                />
                <Button
                  className="w-full h-10 gap-2 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                  onClick={sendReply}
                  disabled={isSendingReply || !replyMessage.trim()}
                >
                  {isSendingReply
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Sending notification...</>
                    : <><BellRing className="w-4 h-4" />Send Notification to Resident</>}
                </Button>
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <Bell className="w-3 h-3" />
                  Delivered instantly as an in-app notification + email
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────
const GovernmentAdminDashboard = ({ onClose, adminName }: GovernmentAdminDashboardProps) => {
  const [reports, setReports] = useState<EnvironmentalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<EnvironmentalReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
    const channel = supabase
      .channel('gov-reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'environmental_reports' }, () => fetchReports())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('environmental_reports').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setReports((data as EnvironmentalReport[]) || []);
    } catch {
      toast({ title: 'Failed to load reports', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStatusChange = (id: string, status: 'verified' | 'rejected') => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    verified: reports.filter(r => r.status === 'verified').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  };

  const filteredReports = reports.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.town_name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.county_id.toLowerCase().includes(q) ||
        (kenyaCounties.find(c => c.id === r.county_id)?.name.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="border-b border-border bg-card/95 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-sm font-bold text-foreground">National Command Centre</h1>
              <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 text-xs h-4 px-1.5">
                <Star className="w-2 h-2 mr-0.5" />GOV
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{adminName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={fetchReports} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onClose}>
              <ArrowLeft className="w-3.5 h-3.5" />Back
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Total', value: stats.total, color: 'text-primary', bg: 'bg-primary/10', icon: FileText },
              { label: 'Pending', value: stats.pending, color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
              { label: 'Approved', value: stats.verified, color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
              { label: 'Rejected', value: stats.rejected, color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-3 text-center cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setFilter(s.label.toLowerCase() as any)}>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-1.5`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className={`text-xl font-bold leading-none ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Search + Filter tabs */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by town, county, description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-1.5">
              {([
                { key: 'pending', label: `Pending (${stats.pending})`, active: 'bg-warning text-warning-foreground' },
                { key: 'all', label: `All (${stats.total})`, active: 'bg-primary text-primary-foreground' },
                { key: 'verified', label: `Approved (${stats.verified})`, active: 'bg-success text-success-foreground' },
                { key: 'rejected', label: `Rejected (${stats.rejected})`, active: 'bg-destructive text-destructive-foreground' },
              ] as const).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-1 ${filter === f.key ? f.active : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Report count */}
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredReports.length}</span> report{filteredReports.length !== 1 ? 's' : ''}
            {filter === 'pending' && stats.pending > 0 && <span className="text-warning font-medium"> — tap any to review & decide</span>}
          </p>

          {/* Report list */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading national reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-muted-foreground opacity-30" />
              </div>
              <p className="text-muted-foreground text-sm">No reports found</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredReports.map((report, idx) => {
                const type = typeConfig[report.report_type] || { label: report.report_type, icon: '📋', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
                const county = kenyaCounties.find(c => c.id === report.county_id)?.name || report.county_id;
                const st = statusConfig[report.status];

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedReport(report)}
                    className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 hover:shadow-md active:scale-[0.99] transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl ${type.bg} ${type.border} border flex items-center justify-center text-2xl flex-shrink-0`}>
                        {type.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm leading-tight">{type.label}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {report.town_name || 'Unknown area'}, <span className="font-medium text-foreground/70">{county}</span>
                              </span>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${st.bg} ${st.color} ${st.border}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {report.status === 'verified' ? 'Approved' : report.status === 'rejected' ? 'Rejected' : 'Pending'}
                          </div>
                        </div>

                        {/* Description preview */}
                        {report.description && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{report.description}</p>
                        )}

                        {/* Footer row */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </span>
                          {report.escalated && (
                            <span className="text-xs text-orange-500 font-medium flex items-center gap-0.5">
                              <Zap className="w-3 h-3" />Escalated
                            </span>
                          )}
                          {report.ai_confidence_score !== null && (
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5 ml-auto">
                              <Brain className="w-3 h-3" />{report.ai_confidence_score}% AI
                            </span>
                          )}
                          <span className="text-xs text-primary font-medium flex items-center gap-0.5 ml-auto group-hover:gap-1 transition-all">
                            Tap to open <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report detail modal */}
      <AnimatePresence>
        {selectedReport && (
          <ReportDetail
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GovernmentAdminDashboard;
