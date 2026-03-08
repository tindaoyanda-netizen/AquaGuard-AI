import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  AlertTriangle, X, MapPin, Upload, Loader2, CheckCircle2, Info, Beaker
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { kenyaCounties } from '@/data/aquaguardData';

const reportSchema = z.object({
  reportType: z.enum(['flooded_road', 'dry_borehole', 'broken_kiosk', 'overflowing_river']),
  townName: z.string().trim().min(1, 'Town/area name is required').max(100),
  subLocation: z.string().trim().max(100).optional(),
  roadName: z.string().trim().max(150).optional(),
  landmark: z.string().trim().max(200).optional(),
  description: z.string().trim().max(500).optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface DemoReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  demoCountyId: string;
}

const reportTypes = [
  { id: 'flooded_road', label: 'Flooded Road', icon: '🌊', description: 'Roads or streets covered in water' },
  { id: 'dry_borehole', label: 'Dry Borehole', icon: '🕳️', description: 'Borehole with no water output' },
  { id: 'broken_kiosk', label: 'Broken Water Kiosk', icon: '🚰', description: 'Damaged or non-functional kiosk' },
  { id: 'overflowing_river', label: 'Overflowing River', icon: '🏞️', description: 'River exceeding its banks' },
] as const;

const FLOOD_PRONE = ['kakamega', 'kisumu', 'siaya', 'busia', 'homa_bay', 'tana_river', 'garissa', 'kilifi'];

const generateMockAnalysis = (reportType: string, countyId: string, description?: string) => {
  const county = kenyaCounties.find(c => c.id === countyId);
  if (!county) return { score: 50, analysis: 'Unable to assess — county data unavailable.' };

  let score = 50;
  const factors: string[] = [];

  // Weather cross-reference
  if (reportType === 'flooded_road' || reportType === 'overflowing_river') {
    if (county.weather.rainfall24h >= 40) {
      score += 25;
      factors.push(`${county.weather.rainfall24h}mm rainfall in 24h supports flooding reports`);
    } else if (county.weather.rainfall24h >= 20) {
      score += 10;
      factors.push(`${county.weather.rainfall24h}mm rainfall is moderate — flooding possible in low-lying areas`);
    } else {
      score -= 15;
      factors.push(`Only ${county.weather.rainfall24h}mm rainfall — flooding unlikely without upstream causes`);
    }

    if (FLOOD_PRONE.includes(countyId)) {
      score += 15;
      factors.push(`${county.name} is historically flood-prone (${county.floodRisk.affectedAreas.slice(0, 2).join(', ')})`);
    }

    if (county.weather.humidity >= 75) {
      score += 5;
      factors.push(`High humidity (${county.weather.humidity}%) indicates saturated conditions`);
    }
  }

  if (reportType === 'dry_borehole') {
    if (county.waterAvailability < 35) {
      score += 20;
      factors.push(`Low water availability (${county.waterAvailability}%) consistent with dry borehole`);
    } else {
      score -= 10;
      factors.push(`Water availability at ${county.waterAvailability}% — isolated borehole failure possible`);
    }
    if (county.waterStress > 75) {
      score += 10;
      factors.push(`High water stress (${county.waterStress}/100) corroborates report`);
    }
  }

  if (reportType === 'broken_kiosk') {
    score += 10;
    factors.push('Infrastructure reports require on-ground verification');
    if (county.waterSources.kiosks > 100) {
      factors.push(`${county.waterSources.kiosks} kiosks in county — maintenance issues expected`);
    }
  }

  if (description && description.length > 30) {
    score += 5;
    factors.push('Detailed description improves credibility');
  }

  score = Math.max(10, Math.min(95, score));

  const analysis = `AI Assessment for ${county.name} County:\n\n` +
    factors.map((f, i) => `${i + 1}. ${f}`).join('\n') +
    `\n\nOverall confidence: ${score}%. ${score >= 70 ? 'Report is consistent with environmental data — recommended for priority review.' : score >= 40 ? 'Some supporting evidence found — standard verification recommended.' : 'Limited supporting data — requires closer admin inspection.'}`;

  return { score, analysis };
};

const DemoReportForm = ({ isOpen, onClose, demoCountyId }: DemoReportFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{ score: number; analysis: string } | null>(null);
  const [step, setStep] = useState<'form' | 'analyzing' | 'success'>('form');
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  });

  const selectedType = watch('reportType');
  const countyName = kenyaCounties.find(c => c.id === demoCountyId)?.name || 'Unknown';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Image must be less than 5MB', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    setStep('analyzing');

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = generateMockAnalysis(data.reportType, demoCountyId, data.description);
    setAiAnalysis(result);
    setStep('success');
  };

  const handleClose = () => {
    reset();
    setImagePreview(null);
    setAiAnalysis(null);
    setStep('form');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <Beaker className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Demo Report
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Try the full flow — no account needed
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {/* Demo banner */}
              <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-xl flex items-start gap-2">
                <Beaker className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Demo Mode:</strong> This simulates report submission with local AI analysis. No data is saved. Sign up to submit real reports.
                </p>
              </div>

              {step === 'form' && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Demo county: <span className="font-medium text-foreground">{countyName} County</span>
                    </span>
                  </div>

                  {/* Report Type Selection */}
                  <div className="space-y-2">
                    <Label>What are you reporting? *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {reportTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setValue('reportType', type.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedType === type.id
                              ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <span className="text-2xl block mb-1">{type.icon}</span>
                          <span className="font-medium text-sm block">{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </button>
                      ))}
                    </div>
                    {errors.reportType && <p className="text-sm text-destructive">{errors.reportType.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="townName">Town/Area Name *</Label>
                    <Input id="townName" placeholder="e.g., Westlands, Kibera, Bondo Town" {...register('townName')} />
                    {errors.townName && <p className="text-sm text-destructive">{errors.townName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Details</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the situation — more detail improves AI confidence..."
                      className="min-h-[80px]"
                      {...register('description')}
                    />
                  </div>

                  {/* Image Upload (cosmetic in demo) */}
                  <div className="space-y-2">
                    <Label>Photo Evidence (Optional)</Label>
                    {imagePreview ? (
                      <div className="relative rounded-xl overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                        <button
                          type="button"
                          onClick={() => setImagePreview(null)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg hover:bg-black/70"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-sm text-muted-foreground">Click to upload</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={!selectedType}>
                    Run Demo Analysis
                  </Button>
                </form>
              )}

              {step === 'analyzing' && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">Simulating AI Analysis</h3>
                  <p className="text-muted-foreground text-sm">
                    Cross-referencing with weather data, flood history, and water metrics...
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="py-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <h3 className="font-heading text-lg font-semibold mb-2">Demo Analysis Complete</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Here's what the AI would assess for this report:
                  </p>

                  {aiAnalysis && (
                    <div className="p-4 bg-muted/50 rounded-xl text-left space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">AI Confidence Score</span>
                        <span className={`text-xl font-bold ${
                          aiAnalysis.score >= 70 ? 'text-green-500' :
                          aiAnalysis.score >= 40 ? 'text-yellow-500' : 'text-destructive'
                        }`}>
                          {aiAnalysis.score}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${aiAnalysis.score}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-2 rounded-full ${
                            aiAnalysis.score >= 70 ? 'bg-green-500' :
                            aiAnalysis.score >= 40 ? 'bg-yellow-500' : 'bg-destructive'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-line">{aiAnalysis.analysis}</p>
                    </div>
                  )}

                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleClose}>
                      Close
                    </Button>
                    <Button variant="hero" className="flex-1" onClick={() => { handleClose(); window.location.href = '/auth'; }}>
                      Sign Up to Submit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DemoReportForm;
