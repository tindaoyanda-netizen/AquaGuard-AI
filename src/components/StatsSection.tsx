import { motion } from 'framer-motion';
import { getNationalStats } from '@/data/kenyaCounties';

const StatsSection = () => {
  const stats = getNationalStats();

  const statItems = [
    { value: `${stats.avgWaterAvailability}%`, label: 'Avg Water Availability', subtext: 'Across all counties' },
    { value: stats.severeCount.toString(), label: 'Counties at Severe Risk', subtext: 'Requiring immediate attention' },
    { value: `${stats.avgRainfall}mm`, label: 'Average Rainfall', subtext: 'Last 30 days' },
    { value: '47', label: 'Counties Monitored', subtext: 'Real-time data coverage' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-secondary relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-accent/8 blur-3xl" />
      
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-heading font-bold text-secondary-foreground mb-2 tracking-tight">
                {stat.value}
              </div>
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
