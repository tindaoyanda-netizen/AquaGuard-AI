import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-24 h-5 hidden sm:block" />
            <Skeleton className="w-40 h-8 rounded-lg hidden lg:block" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-32 h-4 hidden md:block" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="hidden md:block w-[320px] border-r border-border/50 p-4 space-y-6">
          <Skeleton className="w-full h-10 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Skeleton className="w-full h-20 rounded-xl" />
              </motion.div>
            ))}
          </div>
          <Skeleton className="w-full h-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-24 rounded-xl" />
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6">
          {/* Action buttons */}
          <div className="flex gap-2 mb-4">
            <Skeleton className="w-36 h-10 rounded-lg" />
            <Skeleton className="w-28 h-10 rounded-lg" />
          </div>

          {/* Map skeleton */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative h-[calc(100vh-8rem)] rounded-2xl overflow-hidden"
          >
            <Skeleton className="w-full h-full rounded-2xl" />
            {/* Simulated map dots */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-3/4 h-3/4">
                {[
                  { top: '20%', left: '45%' },
                  { top: '35%', left: '55%' },
                  { top: '50%', left: '40%' },
                  { top: '30%', left: '60%' },
                  { top: '60%', left: '50%' },
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-primary/20"
                    style={pos}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
