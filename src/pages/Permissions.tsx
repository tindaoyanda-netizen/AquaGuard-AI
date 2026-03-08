import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Camera, Bell, CheckCircle2, XCircle, ArrowRight, Shield, Waves } from 'lucide-react';
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

// Floating bubble component
const FloatingBubble = ({ delay, size, left }: { delay: number; size: number; left: string }) => (
  <motion.div
    className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
    style={{ width: size, height: size, left, bottom: -size }}
    animate={{
      y: [0, -window.innerHeight - size],
      x: [0, Math.random() * 40 - 20],
      opacity: [0, 0.6, 0.4, 0],
    }}
    transition={{
      duration: 8 + Math.random() * 6,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  />
);

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
    <div className="min-h-screen bg-water-dark relative flex items-center justify-center px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-water-dark via-secondary to-water-dark" />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-[10%] w-72 h-72 rounded-full bg-primary/8 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-[10%] w-56 h-56 rounded-full bg-accent/8 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Floating bubbles */}
      <FloatingBubble delay={0} size={12} left="15%" />
      <FloatingBubble delay={2} size={8} left="45%" />
      <FloatingBubble delay={4} size={16} left="70%" />
      <FloatingBubble delay={1} size={10} left="85%" />
      <FloatingBubble delay={3} size={14} left="30%" />
      
      {/* Bottom waves */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-20 z-0">
        <svg className="absolute bottom-0 w-[200%] h-full animate-wave opacity-20" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,60 L0,60 Z" fill="hsl(var(--primary))" />
        </svg>
        <svg className="absolute bottom-0 w-[200%] h-full animate-wave-reverse opacity-15" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,40 C240,10 480,50 720,30 C960,10 1200,50 1440,30 L1440,60 L0,60 Z" fill="hsl(var(--water-teal))" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative inline-flex items-center justify-center w-20 h-20 mb-5"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent" />
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Waves className="w-10 h-10 text-primary-foreground relative z-10" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading text-2xl font-bold text-primary-foreground"
          >
            {allDone ? 'You\'re All Set!' : 'Enable Permissions'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-primary-foreground/60 mt-2"
          >
            {allDone
              ? `${grantedCount} of ${permissions.length} permissions enabled`
              : 'Help AquaGuard deliver accurate data'}
          </motion.p>
        </div>

        {/* Permission Status Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2 justify-center mb-6"
        >
          {permissions.map((perm, idx) => (
            <motion.div
              key={perm.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1, type: 'spring' }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border transition-all duration-300 ${
                perm.status === 'granted'
                  ? 'bg-success/20 text-success border-success/30'
                  : perm.status === 'denied'
                  ? 'bg-destructive/15 text-destructive/80 border-destructive/20'
                  : idx === currentStep && !allDone
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-primary-foreground/5 text-primary-foreground/40 border-primary-foreground/10'
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
            </motion.div>
          ))}
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl" />
          <div className="relative bg-card/10 backdrop-blur-xl border border-primary-foreground/10 rounded-2xl p-8">
            <AnimatePresence mode="wait">
              {allDone ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-2"
                  >
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </motion.div>
                  <div className="space-y-3">
                    {permissions.map((perm, idx) => (
                      <motion.div
                        key={perm.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10"
                      >
                        <perm.icon className={`w-5 h-5 ${perm.status === 'granted' ? 'text-success' : 'text-primary-foreground/40'}`} />
                        <span className="text-sm font-medium text-primary-foreground flex-1 text-left">{perm.title}</span>
                        {perm.status === 'granted' ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-primary-foreground/30" />
                        )}
                      </motion.div>
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
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="text-center space-y-6"
                >
                  {(() => {
                    const current = permissions[currentStep];
                    return (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                          className="relative inline-flex items-center justify-center w-24 h-24"
                        >
                          <div className="absolute inset-0 rounded-full bg-primary/15 backdrop-blur-sm" />
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-primary/30"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <current.icon className="w-12 h-12 text-primary relative z-10" />
                        </motion.div>
                        <div>
                          <h2 className="text-xl font-bold text-primary-foreground mb-2">{current.title}</h2>
                          <p className="text-sm text-primary-foreground/50 leading-relaxed">{current.description}</p>
                        </div>
                        <div className="space-y-3">
                          <Button variant="hero" size="lg" className="w-full" onClick={handleRequest}>
                            Allow {current.title.split(' ')[0]}
                          </Button>
                          <button
                            onClick={handleSkip}
                            className="text-sm text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
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
        </motion.div>

        {/* Step indicator */}
        {!allDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-2 mt-6"
          >
            {permissions.map((_, idx) => (
              <motion.div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentStep ? 'w-8 bg-primary' : idx < currentStep ? 'w-4 bg-success' : 'w-4 bg-primary-foreground/15'
                }`}
                layoutId={`step-${idx}`}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Permissions;
