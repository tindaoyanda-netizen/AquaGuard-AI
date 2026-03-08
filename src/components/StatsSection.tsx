import { motion, useInView } from 'framer-motion';
import { getNationalStats } from '@/data/kenyaCounties';
import { useRef } from 'react';

const AnimatedNumber = ({ value, suffix = '' }: { value: string; suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="text-4xl sm:text-5xl font-heading font-bold text-secondary-foreground mb-2 tracking-tight"
    >
      {value}{suffix}
    </motion.div>
  );
};

const StatsSection = () => {
  const stats = getNationalStats();

  const statItems = [
    { value: `${stats.avgWaterAvailability}`, suffix: '%', label: 'Avg Water Availability', subtext: 'Across all counties' },
    { value: stats.severeCount.toString(), suffix: '', label: 'Counties at Severe Risk', subtext: 'Requiring immediate attention' },
    { value: `${stats.avgRainfall}`, suffix: 'mm', label: 'Average Rainfall', subtext: 'Last 30 days' },
    { value: '47', suffix: '', label: 'Counties Monitored', subtext: 'Real-time data coverage' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-secondary relative overflow-hidden">
      {/* Decorative orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/8 blur-3xl"
        animate={{ x: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-accent/8 blur-3xl"
        animate={{ x: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      
      {/* Water shimmer overlay */}
      <div className="absolute inset-0 animate-water-shimmer pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="text-center group"
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <motion.div
                className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto mb-3 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              />
              <div className="text-secondary-foreground/80 font-medium mb-1 text-sm">{stat.label}</div>
              <div className="text-secondary-foreground/50 text-xs">{stat.subtext}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
