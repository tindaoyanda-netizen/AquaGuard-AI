import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Droplets, Mail, Lock, User, ArrowRight, Eye, EyeOff, MapPin, Loader2, Shield, Users } from 'lucide-react';
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
          
          localStorage.setItem('ag_location', JSON.stringify({
            lat: latitude,
            lng: longitude,
          }));
          
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
          toast({
            title: 'Location detection failed',
            description: 'Please select your county manually',
            variant: 'destructive',
          });
        }
      );
    } else {
      setIsDetectingLocation(false);
      toast({
        title: 'Geolocation not supported',
        description: 'Please select your county manually',
        variant: 'destructive',
      });
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
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
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
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in',
        });
      } else {
        await signUp(
          formData.email,
          formData.password,
          formData.name,
          formData.countyId,
          formData.role
        );
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account',
        });
      }
      
      // Store location for dashboard personalization
      if (formData.countyId) {
        const county = kenyaCounties.find(c => c.id === formData.countyId);
        if (county) {
          localStorage.setItem('ag_location', JSON.stringify({
            lat: county.coordinates.lat,
            lng: county.coordinates.lng,
          }));
        }
      }
      
      // After signup, go to permissions; after login, go to dashboard
      if (isLogin) {
        navigate('/dashboard');
      } else {
        navigate('/permissions');
      }
    } catch (error) {
      console.error('Auth error:', error);
      const message = error instanceof Error ? error.message : 'Authentication failed';
      
      // Handle specific error cases
      if (message.includes('already registered')) {
        toast({
          title: 'Account exists',
          description: 'This email is already registered. Please sign in instead.',
          variant: 'destructive',
        });
        setIsLogin(true);
      } else if (message.includes('Invalid login credentials')) {
        toast({
          title: 'Invalid credentials',
          description: 'Please check your email and password',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { id: 'resident', label: 'Resident', icon: Users, description: 'Submit environmental reports' },
    { id: 'county_admin', label: 'County Admin', icon: Shield, description: 'Verify reports in your county' },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {isLogin ? 'Welcome Back' : 'Join AquaGuard Kenya'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? 'Sign in to access your dashboard' : 'Create your account to start reporting'}
            </p>
          </div>
          
          {/* Form Card */}
          <div className="card-glass p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field (Sign Up only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
              )}
              
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              
              {/* Role Selection (Sign Up only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label>I am a... *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role.id })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          formData.role === role.id
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <role.icon className={`w-5 h-5 mb-1 ${formData.role === role.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-medium text-sm block">{role.label}</span>
                        <span className="text-xs text-muted-foreground">{role.description}</span>
                      </button>
                    ))}
                  </div>
                  {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                </div>
              )}
              
              {/* County Selection (Sign Up only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label>Your County *</Label>
                  {detectedLocation ? (
                    <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <MapPin className="w-5 h-5 text-success" />
                      <span className="text-sm font-medium text-success">
                        {detectedLocation.town}, {detectedLocation.county}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDetectedLocation(null);
                          setFormData(prev => ({ ...prev, countyId: '' }));
                        }}
                        className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
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
                            <MapPin className="w-4 h-4 mr-2" />
                            Auto-Detect Location
                          </>
                        )}
                      </Button>
                      <div className="text-center text-xs text-muted-foreground">or select manually</div>
                      <select
                        value={formData.countyId}
                        onChange={(e) => setFormData({ ...formData, countyId: e.target.value })}
                        className={`w-full h-10 px-3 rounded-md border bg-background text-sm ${
                          errors.countyId ? 'border-destructive' : 'border-input'
                        }`}
                      >
                        <option value="">Select a county...</option>
                        {kenyaCounties.map((county) => (
                          <option key={county.id} value={county.id}>
                            {county.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {errors.countyId && <p className="text-sm text-destructive">{errors.countyId}</p>}
                </div>
              )}
              
              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
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
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
          
          {/* Info Notice */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? (
              '🔒 Your data is encrypted and secure'
            ) : (
              <>
                {formData.role === 'county_admin' 
                  ? '🛡️ County Admins can verify community reports in their assigned county'
                  : '📍 Residents can submit environmental reports for their community'
                }
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
