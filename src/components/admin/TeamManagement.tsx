import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Shield, ShieldCheck, Mail, Trash2, Settings, Users, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TeamManagementProps {
  isOpen: boolean;
  onClose: () => void;
  countyId: string;
}

interface TeamMember {
  user_id: string;
  full_name: string;
  role: string;
  permissions?: {
    can_verify_reports: boolean;
    can_reply_reports: boolean;
    can_view_analytics: boolean;
    can_manage_alerts: boolean;
    can_export_data: boolean;
  };
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export default function TeamManagement({ isOpen, onClose, countyId }: TeamManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [tab, setTab] = useState<'team' | 'invitations'>('team');

  const fetchTeam = useCallback(async () => {
    if (!countyId) return;
    setLoading(true);
    try {
      // Fetch profiles in this county
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, county_id')
        .eq('county_id', countyId);

      if (!profiles) { setLoading(false); return; }

      // Fetch roles for these users
      const userIds = profiles.map(p => p.user_id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // Fetch permissions for sub_admins
      const { data: perms } = await supabase
        .from('sub_admin_permissions')
        .select('*')
        .eq('county_id', countyId);

      const adminRoles = roles?.filter(r => r.role === 'county_admin' || r.role === 'sub_admin') || [];
      const teamMembers: TeamMember[] = adminRoles.map(r => {
        const profile = profiles.find(p => p.user_id === r.user_id);
        const perm = perms?.find(p => p.user_id === r.user_id);
        return {
          user_id: r.user_id,
          full_name: profile?.full_name || 'Unknown',
          role: r.role,
          permissions: perm ? {
            can_verify_reports: perm.can_verify_reports,
            can_reply_reports: perm.can_reply_reports,
            can_view_analytics: perm.can_view_analytics,
            can_manage_alerts: perm.can_manage_alerts,
            can_export_data: perm.can_export_data,
          } : undefined,
        };
      });

      setMembers(teamMembers);

      // Fetch invitations
      const { data: invites } = await supabase
        .from('admin_invitations')
        .select('id, email, status, created_at')
        .eq('county_id', countyId)
        .order('created_at', { ascending: false });

      setInvitations(invites || []);
    } catch (err) {
      console.error('Error fetching team:', err);
    }
    setLoading(false);
  }, [countyId]);

  useEffect(() => {
    if (isOpen) fetchTeam();
  }, [isOpen, fetchTeam]);

  const handleInvite = async () => {
    if (!inviteEmail || !user) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from('admin_invitations')
        .insert({
          email: inviteEmail,
          county_id: countyId,
          invited_by: user.id,
          role: 'sub_admin' as any,
        });

      if (error) throw error;

      toast({ title: '✅ Invitation sent', description: `Invited ${inviteEmail} as sub-admin` });
      setInviteEmail('');
      fetchTeam();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to send invitation', variant: 'destructive' });
    }
    setSending(false);
  };

  const handleRevokeInvitation = async (id: string) => {
    const { error } = await supabase
      .from('admin_invitations')
      .update({ status: 'revoked' })
      .eq('id', id);

    if (!error) {
      toast({ title: 'Invitation revoked' });
      fetchTeam();
    }
  };

  const handleUpdatePermission = async (userId: string, field: string, value: boolean) => {
    const { error } = await supabase
      .from('sub_admin_permissions')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('county_id', countyId);

    if (!error) {
      setMembers(prev => prev.map(m =>
        m.user_id === userId && m.permissions
          ? { ...m, permissions: { ...m.permissions, [field]: value } }
          : m
      ));
      toast({ title: 'Permission updated' });
    }
  };

  if (!isOpen) return null;

  const permissionLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    can_verify_reports: { label: 'Verify Reports', icon: <ShieldCheck className="w-4 h-4" /> },
    can_reply_reports: { label: 'Reply to Reports', icon: <Mail className="w-4 h-4" /> },
    can_view_analytics: { label: 'View Analytics', icon: <Settings className="w-4 h-4" /> },
    can_manage_alerts: { label: 'Manage Alerts', icon: <Shield className="w-4 h-4" /> },
    can_export_data: { label: 'Export Data', icon: <Settings className="w-4 h-4" /> },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Team Management</h2>
                <p className="text-sm text-muted-foreground">Manage sub-admins and permissions</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setTab('team')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === 'team' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
              }`}
            >
              Team ({members.length})
            </button>
            <button
              onClick={() => setTab('invitations')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === 'invitations' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
              }`}
            >
              Invitations ({invitations.filter(i => i.status === 'pending').length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : tab === 'team' ? (
              <>
                {members.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No team members yet. Invite sub-admins below.</p>
                ) : (
                  members.map(member => (
                    <div key={member.user_id} className="border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {member.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{member.full_name}</p>
                            <Badge variant={member.role === 'county_admin' ? 'default' : 'secondary'}>
                              {member.role === 'county_admin' ? 'County Admin' : 'Sub-Admin'}
                            </Badge>
                          </div>
                        </div>
                        {member.role === 'sub_admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMember(editingMember === member.user_id ? null : member.user_id)}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Permissions
                          </Button>
                        )}
                      </div>

                      {editingMember === member.user_id && member.permissions && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="space-y-3 pt-3 border-t border-border"
                        >
                          {Object.entries(permissionLabels).map(([key, { label, icon }]) => (
                            <div key={key} className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-foreground">
                                {icon}
                                {label}
                              </div>
                              <Switch
                                checked={member.permissions![key as keyof typeof member.permissions]}
                                onCheckedChange={(v) => handleUpdatePermission(member.user_id, key, v)}
                              />
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))
                )}
              </>
            ) : (
              <>
                {/* Invite form */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter email to invite..."
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleInvite()}
                    />
                  </div>
                  <Button onClick={handleInvite} disabled={sending || !inviteEmail}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-1" />}
                    Invite
                  </Button>
                </div>

                {invitations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No invitations sent yet.</p>
                ) : (
                  invitations.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between border border-border rounded-xl p-4">
                      <div>
                        <p className="font-medium text-foreground">{inv.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Sent {new Date(inv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          inv.status === 'pending' ? 'secondary' :
                          inv.status === 'accepted' ? 'default' : 'destructive'
                        }>
                          {inv.status === 'pending' ? '⏳ Pending' :
                           inv.status === 'accepted' ? '✅ Accepted' : '❌ Revoked'}
                        </Badge>
                        {inv.status === 'pending' && (
                          <Button variant="ghost" size="icon" onClick={() => handleRevokeInvitation(inv.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
