import { motion } from 'framer-motion';
import { Droplets, Globe, MapPin, Bell, CloudRain, Shield } from 'lucide-react';

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
          <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Platform Features</p>
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
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="group"
            >
              <div className="card-glass p-8 h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
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
          {additionalFeatures.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 p-5 rounded-xl border border-border/30 hover:border-border/60 hover:bg-card/50 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
