import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Waves } from 'lucide-react';
import heroBg from '@/assets/hero-drought.jpg';
import RainEffect from '@/components/RainEffect';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Deep Ocean Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-water-dark/90 via-secondary/80 to-water-dark/95" />
      
      {/* Rain */}
      <RainEffect dropCount={70} className="z-[1]" />
      
      {/* Animated wave layers */}
      <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden h-24">
        <svg className="absolute bottom-0 w-[200%] h-full animate-wave" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,60 L0,60 Z" fill="hsl(var(--background))" fillOpacity="0.6" />
        </svg>
        <svg className="absolute bottom-0 w-[200%] h-full animate-wave-reverse" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,40 C240,10 480,50 720,30 C960,10 1200,50 1440,30 L1440,60 L0,60 Z" fill="hsl(var(--background))" fillOpacity="0.8" />
        </svg>
        <svg className="absolute bottom-0 w-[200%] h-full animate-wave" style={{ animationDelay: '-3s', animationDuration: '12s' }} viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,25 C180,50 540,10 900,35 C1080,45 1260,20 1440,35 L1440,60 L0,60 Z" fill="hsl(var(--background))" />
        </svg>
      </div>
      
      {/* Floating water bubbles */}
      <div className="absolute bottom-1/4 left-[20%] w-3 h-3 rounded-full bg-primary/20 animate-bubble" />
      <div className="absolute bottom-1/3 left-[40%] w-2 h-2 rounded-full bg-accent/20 animate-bubble" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 right-[25%] w-4 h-4 rounded-full bg-primary/15 animate-bubble" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/3 right-[35%] w-2 h-2 rounded-full bg-water-teal/20 animate-bubble" style={{ animationDelay: '0.5s' }} />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-[15%] w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-1/3 right-[10%] w-56 h-56 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/15 backdrop-blur-md border border-primary/25 mb-10"
          >
            <Waves className="w-4 h-4 text-accent" />
            <span className="text-primary-foreground/90 text-sm font-medium tracking-wide">Real-Time Environmental Monitoring</span>
          </motion.div>
          
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground mb-6 leading-[1.1] tracking-tight"
          >
            AquaGuard Kenya
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Water & Weather Intelligence
            </span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg sm:text-xl text-primary-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Track water availability, forecast weather, predict floods, and receive personalized alerts for your town and county.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/auth">
              <Button variant="hero" size="xl" className="group">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="glass" size="xl">
                Explore Dashboard
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/25 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-accent"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
