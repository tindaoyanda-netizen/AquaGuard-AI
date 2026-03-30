import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Mail, Lock, User, ArrowRight, Eye, EyeOff, MapPin, Loader2, Shield, Users, Building2, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { kenyaCounties, getCountyByCoordinates, getTownByCoordinates } from '@/data/aquaguardData';
import { z } from 'zod';

const GOVT_ADMIN_SECRET = 'KENYA-GOV-2026';

const FloatingBubble = ({ delay, size, left }: { delay: number; size: number; left: string }) => (
  <motion.div
    className="absolute rounded-full bg-primary/10 border border-primary/5"
    style={{ width: size, height: size, left }}
    initial={{ y: '100vh', opacity: 0 }}
    animate={{ y: '-10vh', opacity: [0, 0.6, 0.4, 0] }}
    transition={{ duration: 8 + Math.random() * 6, delay, repeat: Infinity, ease: 'easeOut' }}
  />
);

const WaterWaves = () => (
  <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden opacity-20 pointer-events-none">
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-20"
      style={{ background: 'linear-gradient(to top, hsl(var(--primary) / 0.3), transparent)', borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
      animate={{ scaleX: [1, 1.05, 1], y: [0, -4, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-16"
      style={{ background: 'linear-gradient(to top, hsl(var(--primary) / 0.2), transparent)', borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
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
  const [selectedRole, setSelectedRole] = useState<'resident' | 'government_admin'>('resident');
  const [govSecret, setGovSecret] = useState('');
  const [showGovSecret, setShowGovSecret] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', countyId: '' });
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
            setDetectedLocation({ town: town?.name || county.towns[0]?.name || 'Unknown', county: county.name, countyId: county.id });
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
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!isLogin) {
      if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
      if (!formData.email.includes('@')) newErrors.email = 'Invalid email address';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (selectedRole === 'resident' && !formData.countyId) newErrors.countyId = 'Please select a county';
      if (selectedRole === 'government_admin' && !govSecret) newErrors.govSecret = 'Authorization code required';
    } else {
      if (!formData.email.includes('@')) newErrors.email = 'Invalid email address';
      if (!formData.password) newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        toast({ title: 'Welcome back!', description: 'You have successfully signed in' });
        navigate('/dashboard');
      } else {
        if (selectedRole === 'government_admin') {
          // Validate secret code
          if (govSecret !== GOVT_ADMIN_SECRET) {
            setErrors({ govSecret: 'Invalid authorization code' });
            setIsSubmitting(false);
            return;
          }
          // Check if gov admin already exists
          const res = await fetch('/api/admin/check-gov-admin');
          const text = await res.text();
          let data: { exists?: boolean } = {};
          try { data = JSON.parse(text); } catch { data = { exists: false }; }
          if (data.exists) {
            toast({
              title: 'Account already exists',
              description: 'A government administrator account has already been registered.',
              variant: 'destructive',
            });
            setIsSubmitting(false);
            return;
          }
          // Sign up with special county_id
          await signUp(formData.email, formData.password, formData.name, 'kenya_national', 'county_admin');
          toast({ title: '🏛️ Government Admin Created', description: 'Your national admin account is ready. Please verify your email.' });
          navigate('/dashboard');
        } else {
          await signUp(formData.email, formData.password, formData.name, formData.countyId, 'resident');
          toast({ title: 'Account created!', description: 'Please check your email to verify your account' });
          if (formData.countyId) {
            const county = kenyaCounties.find(c => c.id === formData.countyId);
            if (county) localStorage.setItem('ag_location', JSON.stringify({ lat: county.coordinates.lat, lng: county.coordinates.lng }));
          }
          navigate('/permissions');
        }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

  const roles = [
    { id: 'resident', label: 'Resident', icon: Users, description: 'Submit environmental reports', color: 'from-primary/20 to-primary/5', border: 'border-primary/30' },
    { id: 'government_admin', label: 'Government Admin', icon: Building2, description: 'National oversight authority', color: 'from-accent/20 to-accent/5', border: 'border-accent/30' },
  ] as const;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingBubble delay={0} size={60} left="10%" />
        <FloatingBubble delay={2} size={40} left="25%" />
        <FloatingBubble delay={1} size={80} left="70%" />
        <FloatingBubble delay={3} size={50} left="85%" />
        <FloatingBubble delay={4} size={35} left="45%" />
        <FloatingBubble delay={1.5} size={55} left="60%" />
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
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">

          {/* Logo & Title */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg relative"
              whileHover={{ scale: 1.08, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Waves className="w-8 h-8 text-primary-foreground" />
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
            <motion.p className="text-muted-foreground mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              {isLogin ? 'Sign in to access your dashboard' : 'Create your account to get started'}
            </motion.p>
          </motion.div>

          {/* Form Card */}
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-xl opacity-50" />

            <div className="card-glass p-8 relative">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name Field */}
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-2 overflow-hidden">
                      <Label htmlFor="name">Full Name *</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </motion.div>

                {/* Role Selection */}
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div key="role" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-2 overflow-hidden">
                      <Label>Account Type *</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {roles.map(role => (
                          <motion.button
                            key={role.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedRole(role.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all duration-200 relative overflow-hidden ${
                              selectedRole === role.id
                                ? `${role.border} bg-gradient-to-br ${role.color} ring-2 ${role.id === 'government_admin' ? 'ring-accent/20' : 'ring-primary/20'} shadow-md`
                                : 'border-border hover:border-primary/40 hover:bg-muted/50'
                            }`}
                          >
                            {role.id === 'government_admin' && selectedRole === 'government_admin' && (
                              <motion.div className="absolute top-1.5 right-1.5" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Star className="w-3 h-3 text-accent fill-accent" />
                              </motion.div>
                            )}
                            <role.icon className={`w-5 h-5 mb-1.5 transition-colors ${selectedRole === role.id ? role.id === 'government_admin' ? 'text-accent' : 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="font-semibold text-sm block">{role.label}</span>
                            <span className="text-xs text-muted-foreground leading-tight">{role.description}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* County Selection — Resident only */}
                <AnimatePresence mode="wait">
                  {!isLogin && selectedRole === 'resident' && (
                    <motion.div key="county" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-2 overflow-hidden">
                      <Label>Your County *</Label>
                      {detectedLocation ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                          <MapPin className="w-5 h-5 text-success" />
                          <span className="text-sm font-medium text-success">{detectedLocation.town}, {detectedLocation.county}</span>
                          <button type="button" onClick={() => { setDetectedLocation(null); setFormData(prev => ({ ...prev, countyId: '' })); }} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Change</button>
                        </motion.div>
                      ) : (
                        <div className="space-y-2">
                          <Button type="button" variant="outline" className="w-full" onClick={detectLocation} disabled={isDetectingLocation}>
                            {isDetectingLocation ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Detecting...</> : <><MapPin className="w-4 h-4 mr-2" />Auto-Detect Location</>}
                          </Button>
                          <div className="text-center text-xs text-muted-foreground">or select manually</div>
                          <select
                            value={formData.countyId}
                            onChange={e => setFormData({ ...formData, countyId: e.target.value })}
                            className={`w-full h-10 px-3 rounded-md border bg-background text-sm ${errors.countyId ? 'border-destructive' : 'border-input'}`}
                          >
                            <option value="">Select a county...</option>
                            {kenyaCounties.map(county => (
                              <option key={county.id} value={county.id}>{county.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {errors.countyId && <p className="text-sm text-destructive">{errors.countyId}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Government Admin — Authorization Code */}
                <AnimatePresence mode="wait">
                  {!isLogin && selectedRole === 'government_admin' && (
                    <motion.div key="govSecret" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-2 overflow-hidden">
                      {/* Info banner */}
                      <div className="flex items-start gap-3 p-3 bg-accent/10 border border-accent/20 rounded-xl">
                        <Shield className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-accent">Government Authorization Required</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Only one national administrator account is permitted. Enter the authorized government access code to proceed.</p>
                        </div>
                      </div>
                      <Label htmlFor="govSecret">Authorization Code *</Label>
                      <div className="relative group">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <Input
                          id="govSecret"
                          type={showGovSecret ? 'text' : 'password'}
                          placeholder="Enter government access code"
                          className={`pl-10 pr-10 ${errors.govSecret ? 'border-destructive' : 'focus:border-accent'}`}
                          value={govSecret}
                          onChange={e => setGovSecret(e.target.value)}
                        />
                        <button type="button" onClick={() => setShowGovSecret(!showGovSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showGovSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.govSecret && <p className="text-sm text-destructive">{errors.govSecret}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className={`w-full group overflow-hidden relative ${!isLogin && selectedRole === 'government_admin' ? 'bg-gradient-to-r from-accent to-primary hover:opacity-95' : ''}`}
                    disabled={isSubmitting}
                    data-testid="button-submit"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />{isLogin ? 'Signing in...' : 'Creating account...'}</>
                      ) : (
                        <>
                          {!isLogin && selectedRole === 'government_admin' && <Building2 className="w-5 h-5" />}
                          {isLogin ? 'Sign In' : selectedRole === 'government_admin' ? 'Create Government Account' : 'Create Account'}
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-sm"><span className="bg-card px-4 text-muted-foreground">or</span></div>
              </div>

              {/* Toggle */}
              <p className="text-center text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setIsLogin(!isLogin); setErrors({}); setSelectedRole('resident'); setGovSecret(''); }}
                  className="text-primary font-semibold hover:underline underline-offset-2"
                >
                  {isLogin ? 'Create account' : 'Sign in'}
                </motion.button>
              </p>

              {/* Back to home */}
              <div className="mt-4 text-center">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  ← Back to home
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
