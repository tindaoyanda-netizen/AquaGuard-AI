import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  AlertTriangle, 
  Droplets, 
  X, 
  MapPin, 
  Upload, 
  Loader2,
  CheckCircle2,
  Info,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { kenyaCounties } from '@/data/aquaguardData';

const reportSchema = z.object({
  reportType: z.enum(['flooded_road', 'dry_borehole', 'broken_kiosk', 'overflowing_river']),
  townName: z.string().trim().min(1, 'Town/area name is required').max(100),
  subLocation: z.string().trim().max(100).optional(),
  roadName: z.string().trim().max(150).optional(),
  landmark: z.string().trim().max(200).optional(),
  description: z.string().trim().max(500, 'Description must be less than 500 characters').optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  userCountyId: string | null;
  onReportSubmitted: () => void;
}

const reportTypes = [
  { id: 'flooded_road', label: 'Flooded Road', icon: '🌊', description: 'Roads or streets covered in water' },
  { id: 'dry_borehole', label: 'Dry Borehole', icon: '🕳️', description: 'Borehole with no water output' },
  { id: 'broken_kiosk', label: 'Broken Water Kiosk', icon: '🚰', description: 'Damaged or non-functional kiosk' },
  { id: 'overflowing_river', label: 'Overflowing River', icon: '🏞️', description: 'River exceeding its banks' },
] as const;

const ReportForm = ({ isOpen, onClose, userLocation, userCountyId, onReportSubmitted }: ReportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{ score: number; analysis: string } | null>(null);
  const [step, setStep] = useState<'form' | 'analyzing' | 'success'>('form');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  });

  const selectedType = watch('reportType');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      toast({
        title: 'Camera unavailable',
        description: 'Please grant camera permission or upload an image instead.',
        variant: 'destructive',
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImageFile(file);
        setImagePreview(canvas.toDataURL('image/jpeg'));
        closeCamera();
      }
    }, 'image/jpeg', 0.85);
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const onSubmit = async (data: ReportFormData) => {
    if (!userLocation || !userCountyId) {
      toast({
        title: 'Location required',
        description: 'Please enable location services to submit a report',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setStep('analyzing');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let imageUrl: string | null = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('report-images')
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      // Create the report
      const { data: report, error: reportError } = await supabase
        .from('environmental_reports')
        .insert({
          reporter_id: user.id,
          report_type: data.reportType,
          county_id: userCountyId,
          town_name: data.townName || null,
          sub_location: data.subLocation || null,
          road_name: data.roadName || null,
          landmark: data.landmark || null,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          description: data.description || null,
          image_url: imageUrl,
          status: 'pending',
        } as any)
        .select()
        .single();

      if (reportError) throw reportError;

      // Get weather data for the county
      const county = kenyaCounties.find(c => c.id === userCountyId);
      const weatherData = county?.weather;

      // Trigger AI analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-report', {
        body: {
          reportId: report.id,
          reportType: data.reportType,
          countyId: userCountyId,
          townName: data.townName,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          description: data.description,
          weatherData: weatherData ? {
            temperature: weatherData.temperature,
            humidity: weatherData.humidity,
            rainfall24h: weatherData.rainfall24h,
          } : undefined,
        },
      });

      if (analysisError) {
        console.error('AI analysis error:', analysisError);
      } else if (analysisData) {
        setAiAnalysis({
          score: analysisData.confidence_score,
          analysis: analysisData.analysis,
        });
      }

      setStep('success');
      
      setTimeout(() => {
        onReportSubmitted();
        handleClose();
      }, 3000);

    } catch (error) {
      console.error('Report submission error:', error);
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Failed to submit report',
        variant: 'destructive',
      });
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setImageFile(null);
    setImagePreview(null);
    setAiAnalysis(null);
    setStep('form');
    onClose();
  };

  const countyName = kenyaCounties.find(c => c.id === userCountyId)?.name || 'Unknown';

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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Submit Environmental Report
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Help your community stay informed
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {step === 'form' && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Location Display */}
                  <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Reporting from: <span className="font-medium text-foreground">{countyName} County</span>
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
                    {errors.reportType && (
                      <p className="text-sm text-destructive">{errors.reportType.message}</p>
                    )}
                  </div>

                  {/* Town Name */}
                  <div className="space-y-2">
                    <Label htmlFor="townName">Town/Area Name *</Label>
                    <Input
                      id="townName"
                      placeholder="e.g., Westlands, Kibera, Bondo Town"
                      {...register('townName')}
                    />
                    {errors.townName && (
                      <p className="text-sm text-destructive">{errors.townName.message}</p>
                    )}
                  </div>

                  {/* Sub-location */}
                  <div className="space-y-2">
                    <Label htmlFor="subLocation">Sub-location / Ward</Label>
                    <Input
                      id="subLocation"
                      placeholder="e.g., South B Ward, Usonga Sub-location"
                      {...register('subLocation')}
                    />
                  </div>

                  {/* Road Name */}
                  <div className="space-y-2">
                    <Label htmlFor="roadName">Road / Street Name</Label>
                    <Input
                      id="roadName"
                      placeholder="e.g., Mombasa Road, near junction of..."
                      {...register('roadName')}
                    />
                  </div>

                  {/* Landmark */}
                  <div className="space-y-2">
                    <Label htmlFor="landmark">Nearest Landmark</Label>
                    <Input
                      id="landmark"
                      placeholder="e.g., opposite Tuskys, near Bondo Primary School"
                      {...register('landmark')}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Details</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the situation: how severe is it, how many people affected, any urgent needs..."
                      className="min-h-[100px]"
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Photo Evidence (Optional)</Label>
                    <div className="relative">
                      {imagePreview ? (
                        <div className="relative rounded-xl overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg hover:bg-black/70"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload image</span>
                          <span className="text-xs text-muted-foreground">Max 5MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* AI Notice */}
                  <div className="flex items-start gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Your report will be analyzed by AI to assess credibility and detect duplicates. 
                      Final verification is performed by County Admins.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={!selectedType || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </Button>
                </form>
              )}

              {step === 'analyzing' && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">Analyzing Your Report</h3>
                  <p className="text-muted-foreground text-sm">
                    Our AI is reviewing your submission for credibility and checking for duplicates...
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="py-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </motion.div>
                  <h3 className="font-heading text-lg font-semibold mb-2">Report Submitted!</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Your report is now pending verification by County Admins.
                  </p>
                  
                  {aiAnalysis && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-xl text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">AI Confidence Score</span>
                        <span className={`text-lg font-bold ${
                          aiAnalysis.score >= 70 ? 'text-success' :
                          aiAnalysis.score >= 40 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {aiAnalysis.score}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{aiAnalysis.analysis}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportForm;
