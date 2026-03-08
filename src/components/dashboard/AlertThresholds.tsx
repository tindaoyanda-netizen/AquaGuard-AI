import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Plus, Trash2, Droplets, AlertTriangle, CloudRain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AlertThreshold {
  id: string;
  metric: string;
  condition: 'above' | 'below';
  value: number;
  enabled: boolean;
}

interface AlertThresholdsProps {
  isOpen: boolean;
  onClose: () => void;
}

const metricOptions = [
  { value: 'water_availability', label: 'Water Availability (%)', icon: Droplets },
  { value: 'flood_risk', label: 'Flood Risk Level', icon: AlertTriangle },
  { value: 'rainfall', label: 'Rainfall (mm)', icon: CloudRain },
];

const AlertThresholds = ({ isOpen, onClose }: AlertThresholdsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [thresholds, setThresholds] = useState<AlertThreshold[]>(() => {
    const stored = localStorage.getItem('ag_alert_thresholds');
    return stored ? JSON.parse(stored) : [];
  });
  const [newMetric, setNewMetric] = useState('water_availability');
  const [newCondition, setNewCondition] = useState<'above' | 'below'>('below');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    localStorage.setItem('ag_alert_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  const addThreshold = () => {
    if (!newValue || isNaN(Number(newValue))) {
      toast({ title: 'Invalid value', description: 'Please enter a valid number.', variant: 'destructive' });
      return;
    }

    const threshold: AlertThreshold = {
      id: crypto.randomUUID(),
      metric: newMetric,
      condition: newCondition,
      value: Number(newValue),
      enabled: true,
    };

    setThresholds(prev => [...prev, threshold]);
    setNewValue('');
    toast({ title: 'Alert created', description: 'You\'ll be notified when this threshold is crossed.' });
  };

  const toggleThreshold = (id: string) => {
    setThresholds(prev =>
      prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t)
    );
  };

  const removeThreshold = (id: string) => {
    setThresholds(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Alert removed' });
  };

  const getMetricLabel = (value: string) => metricOptions.find(m => m.value === value)?.label || value;
  const getMetricIcon = (value: string) => metricOptions.find(m => m.value === value)?.icon || Droplets;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-foreground">Custom Alerts</h2>
                <p className="text-xs text-muted-foreground">Set thresholds for water metrics</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Add new threshold */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/30">
              <h3 className="text-sm font-medium text-foreground">New Alert Rule</h3>
              <div className="grid grid-cols-3 gap-2">
                <Select value={newMetric} onValueChange={setNewMetric}>
                  <SelectTrigger className="col-span-3 sm:col-span-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metricOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={newCondition} onValueChange={(v) => setNewCondition(v as 'above' | 'below')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  placeholder="Value"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                />
              </div>
              <Button onClick={addThreshold} size="sm" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Alert
              </Button>
            </div>

            {/* Existing thresholds */}
            {thresholds.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No alerts configured yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Add a rule above to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {thresholds.map((threshold, idx) => {
                  const Icon = getMetricIcon(threshold.metric);
                  return (
                    <motion.div
                      key={threshold.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        threshold.enabled
                          ? 'bg-card border-border/50'
                          : 'bg-muted/20 border-border/20 opacity-60'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {getMetricLabel(threshold.metric)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Alert when {threshold.condition} {threshold.value}
                        </p>
                      </div>
                      <Switch
                        checked={threshold.enabled}
                        onCheckedChange={() => toggleThreshold(threshold.id)}
                      />
                      <button
                        onClick={() => removeThreshold(threshold.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-border/50 bg-muted/20">
            <p className="text-xs text-muted-foreground text-center">
              Alerts are checked when dashboard data refreshes. Enable push notifications for real-time delivery.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertThresholds;
