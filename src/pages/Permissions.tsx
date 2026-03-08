import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Camera, Bell, CheckCircle2, XCircle, ArrowRight, Droplets, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type PermissionStatus = 'pending' | 'granted' | 'denied';

interface PermissionItem {
  id: string;
  title: string;
  description: string;
  icon: typeof MapPin;
  status: PermissionStatus;
}

const Permissions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      id: 'location',
      title: 'Location Access',
      description: 'Pinpoint environmental issues accurately on the map for faster response by county teams.',
      icon: MapPin,
      status: 'pending',
    },
    {
      id: 'camera',
      title: 'Camera Access',
      description: 'Capture real-time photo evidence of flooded roads, dry boreholes, and broken kiosks.',
      icon: Camera,
      status: 'pending',
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Get alerts when your reports are verified or when water issues arise in your county.',
      icon: Bell,
      status: 'pending',
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [allDone, setAllDone] = useState(false);

  const updatePermission = (id: string, status: PermissionStatus) => {
    setPermissions(prev =>
      prev.map(p => (p.id === id ? { ...p, status } : p))
    );
  };

  const requestLocation = async () => {
    try {
      const result = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      localStorage.setItem(
        'ag_location',
        JSON.stringify({ lat: result.coords.latitude, lng: result.coords.longitude })
      );
      updatePermission('location', 'granted');
      toast({ title: 'Location enabled', description: 'Your position will be used for accurate reporting.' });
    } catch {
      updatePermission('location', 'denied');
      toast({ title: 'Location denied', description: 'You can enable it later in browser settings.', variant: 'destructive' });
    }
    advanceStep();
  };

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      updatePermission('camera', 'granted');
      toast({ title: 'Camera enabled', description: 'You can now capture evidence for reports.' });
    } catch {
      updatePermission('camera', 'denied');
      toast({ title: 'Camera denied', description: 'You can still upload photos from your gallery.', variant: 'destructive' });
    }
    advanceStep();
  };

  const requestNotifications = async () => {
    try {
      if ('Notification' in window) {
        const result = await Notification.requestPermission();
        updatePermission('notifications', result === 'granted' ? 'granted' : 'denied');
        if (result === 'granted') {
          toast({ title: 'Notifications enabled', description: 'You\'ll receive alerts for your county.' });
        } else {
          toast({ title: 'Notifications denied', description: 'You can enable them later in browser settings.', variant: 'destructive' });
        }
      } else {
        updatePermission('notifications', 'denied');
      }
    } catch {
      updatePermission('notifications', 'denied');
    }
    advanceStep();
  };

  const advanceStep = () => {
    if (currentStep < permissions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setAllDone(true);
    }
  };

  const handleRequest = () => {
    const current = permissions[currentStep];
    if (current.id === 'location') requestLocation();
    else if (current.id === 'camera') requestCamera();
    else if (current.id === 'notifications') requestNotifications();
  };

  const handleSkip = () => {
    updatePermission(permissions[currentStep].id, 'denied');
    advanceStep();
  };

  const handleContinue = () => {
    localStorage.setItem('ag_permissions_done', 'true');
    navigate('/dashboard');
  };

  const grantedCount = permissions.filter(p => p.status === 'granted').length;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {allDone ? 'You\'re All Set!' : 'Enable Permissions'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {allDone
              ? `${grantedCount} of ${permissions.length} permissions enabled`
              : 'Help AquaGuard deliver accurate data by allowing these permissions'}
          </p>
        </div>

        {/* Permission Cards Summary */}
        <div className="flex gap-2 justify-center mb-6">
          {permissions.map((perm, idx) => (
            <div
              key={perm.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                perm.status === 'granted'
                  ? 'bg-success/15 text-success'
                  : perm.status === 'denied'
                  ? 'bg-destructive/10 text-destructive'
                  : idx === currentStep && !allDone
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {perm.status === 'granted' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : perm.status === 'denied' ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : (
                <perm.icon className="w-3.5 h-3.5" />
              )}
              {perm.title.split(' ')[0]}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="card-glass p-8">
          <AnimatePresence mode="wait">
            {allDone ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="space-y-4">
                  {permissions.map(perm => (
                    <div key={perm.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <perm.icon className={`w-5 h-5 ${perm.status === 'granted' ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium text-foreground flex-1 text-left">{perm.title}</span>
                      {perm.status === 'granted' ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="hero" size="lg" className="w-full group" onClick={handleContinue}>
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                {(() => {
                  const current = permissions[currentStep];
                  return (
                    <>
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                        <current.icon className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground mb-2">{current.title}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
                      </div>
                      <div className="space-y-3">
                        <Button variant="hero" size="lg" className="w-full" onClick={handleRequest}>
                          Allow {current.title.split(' ')[0]}
                        </Button>
                        <button
                          onClick={handleSkip}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Skip for now
                        </button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step indicator */}
        {!allDone && (
          <div className="flex justify-center gap-2 mt-6">
            {permissions.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep ? 'w-8 bg-primary' : idx < currentStep ? 'w-4 bg-success' : 'w-4 bg-muted'
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Permissions;
