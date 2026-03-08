import { useMemo } from 'react';

interface RainDrop {
  id: number;
  left: string;
  delay: string;
  duration: string;
  opacity: number;
  height: string;
}

interface RainEffectProps {
  dropCount?: number;
  className?: string;
}

const RainEffect = ({ dropCount = 60, className = '' }: RainEffectProps) => {
  const drops: RainDrop[] = useMemo(() => {
    return Array.from({ length: dropCount }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${0.6 + Math.random() * 0.6}s`,
      opacity: 0.15 + Math.random() * 0.25,
      height: `${12 + Math.random() * 18}px`,
    }));
  }, [dropCount]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute top-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-primary/10 animate-rain"
          style={{
            left: drop.left,
            height: drop.height,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default RainEffect;
