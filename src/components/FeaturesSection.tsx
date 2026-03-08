import { motion, useInView } from 'framer-motion';
import { Droplets, Globe, MapPin, Bell, CloudRain, Shield } from 'lucide-react';
import { useRef } from 'react';

const features = [
  {
    icon: Droplets,
    title: 'Real-Time Water Data',
    description: 'County and town-level metrics for rivers, reservoirs, boreholes, and water kiosks across all 47 counties.',
    gradient: 'from-primary to-water-teal',
  },
  {
    icon: Globe,
    title: 'Weather & Flood Forecast',
    description: 'Predictive insights for your area with rainfall forecasts, flood risk assessment, and early warning alerts.',
    gradient: 'from-water-teal to-primary',
  },
  {
    icon: MapPin,
    title: 'Personalized Alerts',
    description: 'Notifications with precautions and daily insights tailored to your town and county location.',
    gradient: 'from-accent to-warning',
  },
];

const additionalFeatures = [
  { icon: Bell, title: 'Real-Time Alerts', description: 'Instant notifications for water and flood warnings.' },
  { icon: CloudRain, title: 'Predictive Analytics', description: 'AI-powered forecasts for water and weather trends.' },
  { icon: Shield, title: 'Data Security', description: 'Your location data is encrypted and private.' },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group"
    >
      <div className="card-glass p-8 h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
        {/* Hover gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
          >
            <feature.icon className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
            {feature.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-24 lg:py-36 bg-background relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      
      {/* Water ripple accents */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full border border-primary/10 animate-splash" />
      <div className="absolute bottom-32 left-16 w-24 h-24 rounded-full border border-water-teal/10 animate-splash" style={{ animationDelay: '0.7s' }} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-accent uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20"
          >
            Platform Features
          </motion.p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5">
            Empowering Water{' '}
            <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Advanced monitoring tools designed to help you understand and manage Kenya's water resources effectively.
          </p>
        </motion.div>
        
        {/* Main Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
        
        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {additionalFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-4 p-5 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-card/50 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
