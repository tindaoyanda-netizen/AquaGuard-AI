import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  MessageSquare,
  ChevronRight,
  Loader2,
  Info,
  Brain,
  Send,
  Reply
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { kenyaCounties } from '@/data/aquaguardData';
import { format } from 'date-fns';

interface EnvironmentalReport {
  id: string;
  reporter_id: string;
  report_type: 'flooded_road' | 'dry_borehole' | 'broken_kiosk' | 'overflowing_river';
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
  created_at: string;
}

interface ReportReply {
  id: string;
  report_id: string;
  admin_id: string;
  message: string;
  created_at: string;
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userCountyId: string;
}

const reportTypeLabels: Record<string, { label: string; icon: string }> = {
  flooded_road: { label: 'Flooded Road', icon: '🌊' },
  dry_borehole: { label: 'Dry Borehole', icon: '🕳️' },
  broken_kiosk: { label: 'Broken Kiosk', icon: '🚰' },
  overflowing_river: { label: 'Overflowing River', icon: '🏞️' },
};

const AdminDashboard = ({ isOpen, onClose, userCountyId }: AdminDashboardProps) => {
  const [reports, setReports] = useState<EnvironmentalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<EnvironmentalReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [replies, setReplies] = useState<ReportReply[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const { toast } = useToast();

  const countyName = kenyaCounties.find(c => c.id === userCountyId)?.name || 'Unknown';

  useEffect(() => {
    if (isOpen) {
      fetchReports();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('admin-reports')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'environmental_reports',
            filter: `county_id=eq.${userCountyId}`,
          },
          () => {
            fetchReports();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, userCountyId]);

  // Fetch replies when a report is selected
  useEffect(() => {
    if (selectedReport) {
      fetchReplies(selectedReport.id);
    } else {
      setReplies([]);
    }
  }, [selectedReport?.id]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('environmental_reports')
        .select('*')
        .eq('county_id', userCountyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data as EnvironmentalReport[]) || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Failed to load reports',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReplies = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('report_replies')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies((data as ReportReply[]) || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedReport || !replyMessage.trim()) return;

    setIsSendingReply(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('report_replies')
        .insert({
          report_id: selectedReport.id,
          admin_id: user.id,
          message: replyMessage.trim(),
        });

      if (error) throw error;

      setReplyMessage('');
      fetchReplies(selectedReport.id);
      toast({ title: 'Reply sent', description: 'Your response has been posted.' });
    } catch (error) {
      console.error('Reply error:', error);
      toast({
        title: 'Failed to send reply',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleVerification = async (action: 'verified' | 'rejected') => {
    if (!selectedReport) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update report status
      const { error: updateError } = await supabase
        .from('environmental_reports')
        .update({ status: action })
        .eq('id', selectedReport.id);

      if (updateError) throw updateError;

      // Create verification record
      const { error: verificationError } = await supabase
        .from('report_verifications')
        .insert({
          report_id: selectedReport.id,
          admin_id: user.id,
          action,
          comment: comment || null,
        });

      if (verificationError) throw verificationError;

      toast({
        title: action === 'verified' ? 'Report Verified' : 'Report Rejected',
        description: `The report has been ${action} successfully`,
      });

      setSelectedReport(null);
      setComment('');
      fetchReports();
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Action failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredReports = reports.filter(r => 
    filter === 'all' ? true : r.status === filter
  );

  const stats = {
    pending: reports.filter(r => r.status === 'pending').length,
    verified: reports.filter(r => r.status === 'verified').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border p-4 z-20">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-heading text-xl font-bold text-foreground">
                    County Admin Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {countyName} County • Report Verification
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={onClose}>
                Back to Map
              </Button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-warning mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-success mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
                <p className="text-2xl font-bold">{stats.verified}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-destructive mb-1">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Rejected</span>
                </div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {(['pending', 'all', 'verified', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {f} {f !== 'all' && `(${stats[f as keyof typeof stats]})`}
                </button>
              ))}
            </div>

            {/* Reports Grid */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Reports List */}
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No {filter} reports found</p>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-card rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedReport?.id === report.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border'
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">
                            {reportTypeLabels[report.report_type]?.icon}
                          </span>
                          <div>
                            <h3 className="font-medium">
                              {reportTypeLabels[report.report_type]?.label}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {report.town_name || 'Unknown area'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={
                                  report.status === 'verified'
                                    ? 'default'
                                    : report.status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {report.status}
                              </Badge>
                              {report.ai_confidence_score !== null && (
                                <Badge variant="outline" className="gap-1">
                                  <Brain className="w-3 h-3" />
                                  {report.ai_confidence_score}%
                                </Badge>
                              )}
                              {report.is_duplicate && (
                                <Badge variant="destructive">Duplicate</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Report Details Panel */}
              <div className="lg:sticky lg:top-24 h-fit">
                {selectedReport ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    {/* Image */}
                    {selectedReport.image_url && (
                      <div className="aspect-video bg-muted">
                        <img
                          src={selectedReport.image_url}
                          alt="Report evidence"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-4 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                            <span>{reportTypeLabels[selectedReport.report_type]?.icon}</span>
                            {reportTypeLabels[selectedReport.report_type]?.label}
                          </h3>
                          <Badge
                            variant={
                              selectedReport.status === 'verified'
                                ? 'default'
                                : selectedReport.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {selectedReport.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedReport.town_name || 'Unknown'}, {countyName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(selectedReport.created_at), 'PPp')}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {selectedReport.description && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">{selectedReport.description}</p>
                        </div>
                      )}

                      {/* AI Analysis */}
                      {selectedReport.ai_analysis && (
                        <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium">AI Analysis</span>
                            {selectedReport.ai_confidence_score !== null && (
                              <Badge
                                variant={
                                  selectedReport.ai_confidence_score >= 70
                                    ? 'default'
                                    : selectedReport.ai_confidence_score >= 40
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {selectedReport.ai_confidence_score}% confidence
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {selectedReport.ai_analysis}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-2 italic">
                            ⚠️ AI analysis is advisory only. Final decision rests with the admin.
                          </p>
                        </div>
                      )}

                      {/* Admin Actions */}
                      {selectedReport.status === 'pending' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Admin Comment (Optional)
                            </label>
                            <Textarea
                              placeholder="Add a comment about your decision..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="min-h-[80px]"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              className="flex-1 bg-success hover:bg-success/90"
                              onClick={() => handleVerification('verified')}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                              )}
                              Verify Report
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleVerification('rejected')}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              Reject
                            </Button>
                          </div>
                        </>
                      )}

                      {/* Reply Thread */}
                      <div className="border-t border-border pt-4 space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Reply className="w-4 h-4" />
                          Admin Replies ({replies.length})
                        </h4>

                        {replies.length > 0 && (
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="p-3 bg-primary/5 border border-primary/10 rounded-lg"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Shield className="w-3 h-3 text-primary" />
                                  <span className="text-xs font-medium text-primary">County Admin</span>
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {format(new Date(reply.created_at), 'MMM d, h:mm a')}
                                  </span>
                                </div>
                                <p className="text-sm">{reply.message}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Input */}
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Type a reply to the reporter..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="min-h-[60px] flex-1"
                          />
                          <Button
                            size="icon"
                            onClick={sendReply}
                            disabled={isSendingReply || !replyMessage.trim()}
                            className="self-end"
                          >
                            {isSendingReply ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Info className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      Select a report to view details and take action
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ethics Notice */}
            <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-primary" />
                Human-AI Collaboration Guidelines
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AI confidence scores are advisory only and do not replace human judgment</li>
                <li>• Always consider local context and conditions when verifying reports</li>
                <li>• Verified reports directly impact flood risk and water stress calculations</li>
                <li>• Duplicate detection has ~85% accuracy; manual review is essential</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminDashboard;
