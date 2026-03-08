import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Mail, Lock, User, ArrowRight, Eye, EyeOff, MapPin, Loader2, Shield, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { kenyaCounties, getCountyByCoordinates, getTownByCoordinates } from '@/data/aquaguardData';
import { z } from 'zod';

const authSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['resident', 'county_admin']),
  countyId: z.string().min(1, 'Please select a county'),
});

// Floating bubble component
const FloatingBubble = ({ delay, size, left }: { delay: number; size: number; left: string }) => (
  <motion.div
    className="absolute rounded-full bg-primary/10 border border-primary/5"
    style={{ width: size, height: size, left }}
    initial={{ y: '100vh', opacity: 0 }}
    animate={{
      y: '-10vh',
      opacity: [0, 0.6, 0.4, 0],
    }}
    transition={{
      duration: 8 + Math.random() * 6,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

// Animated water waves for background
const WaterWaves = () => (
  <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden opacity-20 pointer-events-none">
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-20"
      style={{
        background: 'linear-gradient(to top, hsl(var(--primary) / 0.3), transparent)',
        borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
      }}
      animate={{ scaleX: [1, 1.05, 1], y: [0, -4, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-16"
      style={{
        background: 'linear-gradient(to top, hsl(var(--primary) / 0.2), transparent)',
        borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
      }}
      animate={{ scaleX: [1.05, 1, 1.05], y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
    />
  </div>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<{ town: string; county: string; countyId: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'resident' as UserRole,
    countyId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const detectLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          localStorage.setItem('ag_location', JSON.stringify({ lat: latitude, lng: longitude }));
          const county = getCountyByCoordinates(latitude, longitude);
          const town = getTownByCoordinates(latitude, longitude);
          if (county) {
            setDetectedLocation({
              town: town?.name || county.towns[0]?.name || 'Unknown',
              county: county.name,
              countyId: county.id,
            });
            setFormData(prev => ({ ...prev, countyId: county.id }));
          }
          setIsDetectingLocation(false);
        },
        () => {
          setIsDetectingLocation(false);
          toast({ title: 'Location detection failed', description: 'Please select your county manually', variant: 'destructive' });
        }
      );
    } else {
      setIsDetectingLocation(false);
      toast({ title: 'Geolocation not supported', description: 'Please select your county manually', variant: 'destructive' });
    }
  };

  const validateForm = () => {
    try {
      if (isLogin) {
        z.object({
          email: z.string().email('Invalid email address'),
          password: z.string().min(1, 'Password is required'),
        }).parse(formData);
      } else {
        authSchema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        toast({ title: 'Welcome back!', description: 'You have successfully signed in' });
      } else {
        await signUp(formData.email, formData.password, formData.name, formData.countyId, formData.role);
        toast({ title: 'Account created!', description: 'Please check your email to verify your account' });
      }
      if (formData.countyId) {
        const county = kenyaCounties.find(c => c.id === formData.countyId);
        if (county) {
          localStorage.setItem('ag_location', JSON.stringify({ lat: county.coordinates.lat, lng: county.coordinates.lng }));
        }
      }
      if (isLogin) {
        navigate('/dashboard');
      } else {
        navigate('/permissions');
      }
    } catch (error) {
      console.error('Auth error:', error);
      const message = error instanceof Error ? error.message : 'Authentication failed';
      if (message.includes('already registered')) {
        toast({ title: 'Account exists', description: 'This email is already registered. Please sign in instead.', variant: 'destructive' });
        setIsLogin(true);
      } else if (message.includes('Invalid login credentials')) {
        toast({ title: 'Invalid credentials', description: 'Please check your email and password', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: message, variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { id: 'resident', label: 'Resident', icon: Users, description: 'Submit environmental reports' },
    { id: 'county_admin', label: 'County Admin', icon: Shield, description: 'Verify reports in your county' },
  ] as const;

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingBubble delay={0} size={60} left="10%" />
        <FloatingBubble delay={2} size={40} left="25%" />
        <FloatingBubble delay={1} size={80} left="70%" />
        <FloatingBubble delay={3} size={50} left="85%" />
        <FloatingBubble delay={4} size={35} left="45%" />
        <FloatingBubble delay={1.5} size={55} left="60%" />

        {/* Gradient orbs */}
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent)), transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1], rotate: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <WaterWaves />

      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Logo & Title */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg relative"
              whileHover={{ scale: 1.08, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Waves className="w-8 h-8 text-primary-foreground" />
              {/* Ripple effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-primary/30"
                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.h1
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3 }}
                className="font-heading text-2xl font-bold text-foreground"
              >
                {isLogin ? 'Welcome Back' : 'Join AquaGuard Kenya'}
              </motion.h1>
            </AnimatePresence>
            <motion.p
              className="text-muted-foreground mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isLogin ? 'Sign in to access your dashboard' : 'Create your account to start reporting'}
            </motion.p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            {/* Card glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-xl opacity-50" />
            
            <div className="card-glass p-8 relative">
              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  {/* Name Field (Sign Up only) */}
                  {!isLogin && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label htmlFor="name">Full Name *</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your name"
                          className={`pl-10 transition-all duration-200 focus:shadow-md focus:shadow-primary/10 ${errors.name ? 'border-destructive' : ''}`}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      {errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">{errors.name}</motion.p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`pl-10 transition-all duration-200 focus:shadow-md focus:shadow-primary/10 ${errors.email ? 'border-destructive' : ''}`}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  {errors.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">{errors.email}</motion.p>}
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 transition-all duration-200 focus:shadow-md focus:shadow-primary/10 ${errors.password ? 'border-destructive' : ''}`}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                  {errors.password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">{errors.password}</motion.p>}
                </motion.div>

                {/* Role Selection (Sign Up only) */}
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="role"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label>I am a... *</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {roles.map((role) => (
                          <motion.button
                            key={role.id}
                            type="button"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setFormData({ ...formData, role: role.id })}
                            className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                              formData.role === role.id
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-md shadow-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            <role.icon className={`w-5 h-5 mb-1 transition-colors ${formData.role === role.id ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="font-medium text-sm block">{role.label}</span>
                            <span className="text-xs text-muted-foreground">{role.description}</span>
                          </motion.button>
                        ))}
                      </div>
                      {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* County Selection (Sign Up only) */}
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="county"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label>Your County *</Label>
                      {detectedLocation ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg"
                        >
                          <MapPin className="w-5 h-5 text-success" />
                          <span className="text-sm font-medium text-success">
                            {detectedLocation.town}, {detectedLocation.county}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setDetectedLocation(null); setFormData(prev => ({ ...prev, countyId: '' })); }}
                            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                          >
                            Change
                          </button>
                        </motion.div>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full group/detect"
                            onClick={detectLocation}
                            disabled={isDetectingLocation}
                          >
                            {isDetectingLocation ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Detecting...
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4 mr-2 group-hover/detect:text-primary transition-colors" />
                                Auto-Detect Location
                              </>
                            )}
                          </Button>
                          <div className="text-center text-xs text-muted-foreground">or select manually</div>
                          <select
                            value={formData.countyId}
                            onChange={(e) => setFormData({ ...formData, countyId: e.target.value })}
                            className={`w-full h-10 px-3 rounded-md border bg-background text-sm transition-all focus:shadow-md focus:shadow-primary/10 ${
                              errors.countyId ? 'border-destructive' : 'border-input'
                            }`}
                          >
                            <option value="">Select a county...</option>
                            {kenyaCounties.map((county) => (
                              <option key={county.id} value={county.id}>{county.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {errors.countyId && <p className="text-sm text-destructive">{errors.countyId}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full group overflow-hidden relative"
                    disabled={isSubmitting}
                  >
                    {/* Shimmer effect on button */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {isLogin ? 'Signing in...' : 'Creating account...'}
                        </>
                      ) : (
                        <>
                          {isLogin ? 'Sign In' : 'Create Account'}
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Toggle Auth Mode */}
              <p className="text-center text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                  className="text-primary font-semibold hover:underline underline-offset-2"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </motion.button>
              </p>
            </div>
          </motion.div>

          {/* Info Notice */}
          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            {isLogin ? (
              '🔒 Your data is encrypted and secure'
            ) : (
              formData.role === 'county_admin'
                ? '🛡️ County Admins can verify community reports in their assigned county'
                : '📍 Residents can submit environmental reports for their community'
            )}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
