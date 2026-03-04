import { CountyData, WaterSource, waterSources } from '@/data/aquaguardData';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedKenyaMapProps {
  counties: CountyData[];
  onCountySelect: (county: CountyData) => void;
  selectedCounty: CountyData | null;
  userLocation?: { lat: number; lng: number } | null;
  showWeatherOverlay: boolean;
  showFloodOverlay: boolean;
  simulationRainfall: number;
  simulationConsumption: number;
}

// Project lat/lng to SVG coordinates
// Kenya bounds: lat -4.7 to 5.5, lng 33.9 to 41.9
const PROJECT_BOUNDS = {
  minLat: -4.8,
  maxLat: 5.6,
  minLng: 33.5,
  maxLng: 42.2,
};

const SVG_WIDTH = 500;
const SVG_HEIGHT = 600;
const SVG_PADDING = 20;

const projectToSvg = (lat: number, lng: number) => {
  const x = SVG_PADDING + ((lng - PROJECT_BOUNDS.minLng) / (PROJECT_BOUNDS.maxLng - PROJECT_BOUNDS.minLng)) * (SVG_WIDTH - 2 * SVG_PADDING);
  const y = SVG_PADDING + ((PROJECT_BOUNDS.maxLat - lat) / (PROJECT_BOUNDS.maxLat - PROJECT_BOUNDS.minLat)) * (SVG_HEIGHT - 2 * SVG_PADDING);
  return { x, y };
};

// Geographically accurate Kenya outline path (simplified but recognizable)
const KENYA_OUTLINE = (() => {
  // Key border points of Kenya (lat, lng) traced clockwise from NW
  const borderPoints: [number, number][] = [
    // Northwestern border (Uganda/South Sudan)
    [4.23, 35.80],  // NW tip near Ilemi
    [4.62, 35.95],
    [5.00, 35.75],
    [5.40, 35.60],  // Ilemi triangle top
    [5.02, 35.30],
    [4.63, 33.98],  // NW corner near Lake Turkana/Uganda
    // Western border (Uganda)
    [4.23, 34.38],
    [3.49, 34.40],
    [1.65, 34.40],
    [1.00, 34.00],
    [0.60, 34.30],
    [0.40, 34.07],
    [0.02, 34.02],
    [-0.10, 34.10],
    [-0.40, 34.08],
    [-0.65, 33.92],
    [-1.00, 33.92],
    [-1.05, 34.00],
    // Lake Victoria shoreline (approximate)
    [-1.10, 34.20],
    [-1.30, 34.60],
    [-1.50, 34.80],
    // Tanzania border
    [-1.73, 34.80],
    [-1.85, 34.60],
    [-2.00, 34.50],
    [-2.70, 35.35],
    [-3.05, 37.00],
    [-3.40, 37.65],
    [-3.70, 37.60],
    [-4.05, 37.70],
    [-4.45, 39.20],
    [-4.68, 39.18],
    // Coast
    [-4.65, 39.25],
    [-4.50, 39.45],
    [-4.05, 39.58],
    [-3.55, 39.85],
    [-3.30, 40.00],
    [-2.50, 40.15],
    [-1.68, 41.00],
    [-1.62, 41.30],
    // Somalia border
    [-0.40, 41.50],
    [0.10, 41.00],
    [1.60, 41.00],
    [2.05, 41.30],
    [3.50, 41.90],
    [3.95, 41.87],
    // Ethiopia border
    [4.25, 41.85],
    [4.62, 41.20],
    [3.95, 40.98],
    [3.50, 39.50],
    [4.22, 38.98],
    [4.30, 38.45],
    [4.25, 37.00],
    [4.80, 36.80],
    [5.30, 36.45],
    [5.40, 35.92],
    [5.40, 35.60],
  ];

  const svgPoints = borderPoints.map(([lat, lng]) => projectToSvg(lat, lng));
  return `M ${svgPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')} Z`;
})();

// Lake Victoria (approximate visible portion within Kenya)
const LAKE_VICTORIA = (() => {
  const lakePoints: [number, number][] = [
    [-0.10, 34.10],
    [-0.05, 34.40],
    [-0.20, 34.72],
    [-0.50, 34.88],
    [-0.80, 34.72],
    [-1.10, 34.20],
    [-1.05, 34.00],
    [-0.65, 33.92],
    [-0.40, 34.08],
    [-0.10, 34.10],
  ];
  const svgPoints = lakePoints.map(([lat, lng]) => projectToSvg(lat, lng));
  return `M ${svgPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')} Z`;
})();

// Lake Turkana
const LAKE_TURKANA = (() => {
  const lakePoints: [number, number][] = [
    [4.40, 36.10],
    [4.20, 36.30],
    [3.60, 36.15],
    [3.00, 36.05],
    [2.50, 36.60],
    [2.42, 36.80],
    [2.55, 36.85],
    [3.10, 36.30],
    [3.60, 36.35],
    [4.10, 36.40],
    [4.40, 36.10],
  ];
  const svgPoints = lakePoints.map(([lat, lng]) => projectToSvg(lat, lng));
  return `M ${svgPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')} Z`;
})();

const EnhancedKenyaMap = ({ 
  counties,
  onCountySelect, 
  selectedCounty,
  userLocation,
  showWeatherOverlay,
  showFloodOverlay,
  simulationRainfall,
  simulationConsumption,
}: EnhancedKenyaMapProps) => {
  
  const getSimulatedRiskLevel = (county: CountyData) => {
    const rainfallChange = (simulationRainfall - 50) / 100;
    const consumptionChange = (simulationConsumption - 50) / 100;
    const adjustedStress = county.waterStress + (consumptionChange * 20) - (rainfallChange * 15);
    
    if (adjustedStress <= 40) return 'stable';
    if (adjustedStress <= 70) return 'moderate';
    return 'severe';
  };

  const getRiskColor = (county: CountyData) => {
    const level = getSimulatedRiskLevel(county);
    switch (level) {
      case 'stable': return 'fill-success/80 hover:fill-success';
      case 'moderate': return 'fill-warning/80 hover:fill-warning';
      case 'severe': return 'fill-destructive/80 hover:fill-destructive';
      default: return 'fill-muted';
    }
  };

  const getFloodRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'stroke-success';
      case 'moderate': return 'stroke-warning';
      case 'high': return 'stroke-destructive';
      case 'critical': return 'stroke-destructive stroke-[3]';
      default: return 'stroke-muted';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rain': return '🌧️';
      case 'heavy_rain': return '⛈️';
      case 'storm': return '🌩️';
      default: return '☁️';
    }
  };

  const getSourcePinColor = (status: WaterSource['status']) => {
    switch (status) {
      case 'normal': return 'fill-success';
      case 'low': return 'fill-warning';
      case 'critical': return 'fill-destructive';
    }
  };

  // Get county marker size based on population
  const getCountySize = (county: CountyData) => {
    if (county.population > 3000000) return 16;
    if (county.population > 1500000) return 13;
    if (county.population > 1000000) return 11;
    return 9;
  };

  return (
    <div className="relative bg-muted/30 rounded-2xl p-2 sm:p-4 h-full min-h-[400px] overflow-hidden">
      <svg 
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Water gradient for lakes */}
          <linearGradient id="lakeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(200, 80%, 55%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(210, 85%, 40%)" stopOpacity="0.7" />
          </linearGradient>
          {/* Land gradient */}
          <linearGradient id="landGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.6" />
          </linearGradient>
          {/* Glow filter for selected county */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Kenya land mass */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={KENYA_OUTLINE}
          fill="url(#landGradient)"
          className="stroke-border"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Lake Victoria */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          d={LAKE_VICTORIA}
          fill="url(#lakeGradient)"
          className="stroke-primary/30"
          strokeWidth="0.5"
        />

        {/* Lake Turkana */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          d={LAKE_TURKANA}
          fill="url(#lakeGradient)"
          className="stroke-primary/30"
          strokeWidth="0.5"
        />

        {/* County markers - projected from real coordinates */}
        {counties.map((county, i) => {
          const pos = projectToSvg(county.coordinates.lat, county.coordinates.lng);
          const size = getCountySize(county);
          const isSelected = selectedCounty?.id === county.id;
          
          return (
            <g key={county.id}>
              {/* Flood risk ring */}
              {showFloodOverlay && county.floodRisk.riskLevel !== 'low' && (
                <motion.circle
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  cx={pos.x}
                  cy={pos.y}
                  r={size + 6}
                  className={`fill-none ${getFloodRiskColor(county.floodRisk.riskLevel)} stroke-dashed`}
                  strokeDasharray="4 2"
                />
              )}
              
              {/* Main county marker */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    cx={pos.x}
                    cy={pos.y}
                    r={size}
                    className={`${getRiskColor(county)} cursor-pointer transition-all duration-300 ${
                      isSelected ? 'stroke-foreground stroke-[3]' : 'stroke-background stroke-[1.5]'
                    }`}
                    filter={isSelected ? 'url(#glow)' : undefined}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onCountySelect(county)}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <div className="text-sm">
                    <p className="font-bold">{county.name}</p>
                    <p>Water: {county.waterAvailability}%</p>
                    <p>Stress: {county.waterStress}</p>
                    {county.floodRisk.riskLevel !== 'low' && (
                      <p className="text-destructive">Flood Risk: {county.floodRisk.riskLevel}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
              
              {/* Weather icon overlay */}
              {showWeatherOverlay && (
                <text
                  x={pos.x + size + 2}
                  y={pos.y - size}
                  fontSize="10"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {getWeatherIcon(county.weather.forecast[0]?.condition || 'cloudy')}
                </text>
              )}
              
              {/* Pulse animation for severe risk */}
              {getSimulatedRiskLevel(county) === 'severe' && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size}
                  className="fill-none stroke-destructive animate-ping opacity-40"
                  strokeWidth={1.5}
                />
              )}
              
              {/* County label */}
              <text
                x={pos.x}
                y={pos.y + size + 11}
                textAnchor="middle"
                className="fill-foreground text-[7px] font-medium pointer-events-none select-none"
                style={{ textShadow: '0 0 3px hsl(var(--background)), 0 0 3px hsl(var(--background))' }}
              >
                {county.name}
              </text>
            </g>
          );
        })}
        
        {/* Water source pins */}
        {waterSources.map((source) => {
          const pos = projectToSvg(source.coordinates.lat, source.coordinates.lng);
          
          return (
            <Tooltip key={source.id}>
              <TooltipTrigger asChild>
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + Math.random() * 0.3 }}
                  cx={pos.x}
                  cy={pos.y}
                  r={3}
                  className={`${getSourcePinColor(source.status)} stroke-background stroke-[0.5] cursor-pointer`}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="text-xs">
                  <p className="font-bold">{source.name}</p>
                  <p className="capitalize">{source.type}</p>
                  <p>Level: {source.currentLevel}%</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {/* User location pin */}
        {userLocation && (() => {
          const pos = projectToSvg(userLocation.lat, userLocation.lng);
          return (
            <motion.g
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', delay: 0.8 }}
            >
              {/* Pulse ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={14}
                className="fill-primary/15 animate-pulse"
              />
              {/* Pin shadow */}
              <ellipse
                cx={pos.x}
                cy={pos.y + 12}
                rx={5}
                ry={2}
                className="fill-foreground/10"
              />
              {/* Pin body */}
              <path
                d={`M ${pos.x} ${pos.y - 12} 
                    C ${pos.x - 7} ${pos.y - 12}, ${pos.x - 7} ${pos.y - 2}, ${pos.x} ${pos.y + 4}
                    C ${pos.x + 7} ${pos.y - 2}, ${pos.x + 7} ${pos.y - 12}, ${pos.x} ${pos.y - 12} Z`}
                className="fill-primary stroke-primary-foreground"
                strokeWidth="1"
              />
              {/* Pin dot */}
              <circle
                cx={pos.x}
                cy={pos.y - 7}
                r={2.5}
                className="fill-primary-foreground"
              />
            </motion.g>
          );
        })()}

        {/* Equator line */}
        {(() => {
          const left = projectToSvg(0, PROJECT_BOUNDS.minLng);
          const right = projectToSvg(0, PROJECT_BOUNDS.maxLng);
          return (
            <g>
              <line
                x1={left.x}
                y1={left.y}
                x2={right.x}
                y2={right.y}
                className="stroke-muted-foreground/20"
                strokeWidth="0.5"
                strokeDasharray="8 4"
              />
              <text
                x={right.x - 5}
                y={left.y - 4}
                textAnchor="end"
                className="fill-muted-foreground/40 text-[7px] italic"
              >
                Equator
              </text>
            </g>
          );
        })()}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-card/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-border">
        <p className="text-[10px] sm:text-xs font-medium text-foreground mb-1.5">Risk Level</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-[10px] text-muted-foreground">Stable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-[10px] text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <span className="text-[10px] text-muted-foreground">Severe</span>
          </div>
        </div>
        
        {showFloodOverlay && (
          <div className="border-t border-border mt-1.5 pt-1.5">
            <p className="text-[10px] font-medium text-foreground mb-1">Flood Risk</p>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-0.5 border border-dashed border-destructive" />
              <span className="text-[10px] text-muted-foreground">High/Critical</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-card/90 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 border border-border">
        <p className="text-[10px] sm:text-xs text-muted-foreground">Click a county for details</p>
      </div>
      
      {/* Water Source Legend */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-card/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-border">
        <p className="text-[10px] sm:text-xs font-medium text-foreground mb-1.5">Water Sources</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-[10px] text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-[10px] text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-[10px] text-muted-foreground">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedKenyaMap;
