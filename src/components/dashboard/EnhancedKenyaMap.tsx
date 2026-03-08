import { useRef, useState, useCallback, useEffect, WheelEvent, MouseEvent } from 'react';
import { CountyData, WaterSource, waterSources } from '@/data/aquaguardData';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  projectToSvg,
  KENYA_OUTLINE_PATH,
  LAKE_VICTORIA_PATH,
  LAKE_TURKANA_PATH,
  SVG_WIDTH,
  SVG_HEIGHT,
  PROJECT_BOUNDS,
  useVoronoiCounties,
} from './useVoronoiCounties';

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
  const voronoiCells = useVoronoiCounties(counties);

  // Zoom & pan state
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 6;

  const handleWheel = useCallback((e: WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev * delta)));
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent<SVGSVGElement>) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: MouseEvent<SVGSVGElement>) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  // Touch pinch-to-zoom and pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getTouchDist = (t: TouchList) => {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.hypot(dx, dy);
    };

    const getTouchCenter = (t: TouchList) => ({
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    });

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        lastTouchDist.current = getTouchDist(e.touches);
        lastTouchCenter.current = getTouchCenter(e.touches);
      } else if (e.touches.length === 1) {
        // Single finger pan when zoomed
        setIsPanning(true);
        setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastTouchDist.current !== null) {
        e.preventDefault();
        const newDist = getTouchDist(e.touches);
        const scale = newDist / lastTouchDist.current;
        setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev * scale)));
        lastTouchDist.current = newDist;

        // Pan with two fingers
        const center = getTouchCenter(e.touches);
        if (lastTouchCenter.current) {
          setPan(prev => ({
            x: prev.x + (center.x - lastTouchCenter.current!.x),
            y: prev.y + (center.y - lastTouchCenter.current!.y),
          }));
        }
        lastTouchCenter.current = center;
      } else if (e.touches.length === 1 && isPanning) {
        setPan({ x: e.touches[0].clientX - panStart.x, y: e.touches[0].clientY - panStart.y });
      }
    };

    const onTouchEnd = () => {
      lastTouchDist.current = null;
      lastTouchCenter.current = null;
      setIsPanning(false);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [pan, isPanning, panStart]);

  const handleZoomIn = () => setZoom(prev => Math.min(MAX_ZOOM, prev * 1.4));
  const handleZoomOut = () => setZoom(prev => Math.max(MIN_ZOOM, prev / 1.4));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Use CSS transform for zoom/pan (more reliable than viewBox manipulation)
  const transformStyle = {
    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
    transformOrigin: 'center center',
    transition: isPanning ? 'none' : 'transform 0.2s ease-out',
  };

  const getSimulatedRiskLevel = (county: CountyData) => {
    const rainfallChange = (simulationRainfall - 50) / 100;
    const consumptionChange = (simulationConsumption - 50) / 100;
    const adjustedStress = county.waterStress + (consumptionChange * 20) - (rainfallChange * 15);
    
    if (adjustedStress <= 40) return 'stable';
    if (adjustedStress <= 70) return 'moderate';
    return 'severe';
  };

  const getRiskFill = (county: CountyData) => {
    const level = getSimulatedRiskLevel(county);
    switch (level) {
      case 'stable': return 'hsl(var(--success))';
      case 'moderate': return 'hsl(var(--warning))';
      case 'severe': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getRiskFillOpacity = (county: CountyData, isSelected: boolean) => {
    return isSelected ? 0.5 : 0.25;
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

  return (
    <div ref={containerRef} className="relative bg-muted/30 rounded-2xl p-2 sm:p-4 h-full min-h-[400px] overflow-hidden touch-none">
      <svg 
        ref={svgRef}
        viewBox={viewBox}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : ''}`}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <linearGradient id="lakeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(200, 80%, 55%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(210, 85%, 40%)" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="landGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {/* Clip path for Kenya border */}
          <clipPath id="kenyaClip">
            <path d={KENYA_OUTLINE_PATH} />
          </clipPath>
        </defs>

        {/* Kenya land mass background */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={KENYA_OUTLINE_PATH}
          fill="url(#landGradient)"
          className="stroke-border"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* County boundary polygons (Voronoi) clipped to Kenya */}
        <g clipPath="url(#kenyaClip)">
          {voronoiCells.map(({ county, path }) => {
            if (!path) return null;
            const isSelected = selectedCounty?.id === county.id;
            
            return (
              <Tooltip key={`voronoi-${county.id}`}>
                <TooltipTrigger asChild>
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    d={path}
                    fill={getRiskFill(county)}
                    fillOpacity={getRiskFillOpacity(county, isSelected)}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'stroke-foreground stroke-[2]' 
                        : 'stroke-border/60 stroke-[0.5]'
                    }`}
                    style={{ 
                      filter: isSelected ? 'brightness(1.2)' : undefined,
                    }}
                    onClick={() => onCountySelect(county)}
                    onMouseEnter={(e) => {
                      (e.target as SVGPathElement).style.fillOpacity = '0.45';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as SVGPathElement).style.fillOpacity = isSelected ? '0.5' : '0.25';
                    }}
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
            );
          })}
        </g>

        {/* Kenya border on top of Voronoi cells */}
        <path
          d={KENYA_OUTLINE_PATH}
          fill="none"
          className="stroke-border"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Lake Victoria */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          d={LAKE_VICTORIA_PATH}
          fill="url(#lakeGradient)"
          className="stroke-primary/30"
          strokeWidth="0.5"
        />

        {/* Lake Turkana */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          d={LAKE_TURKANA_PATH}
          fill="url(#lakeGradient)"
          className="stroke-primary/30"
          strokeWidth="0.5"
        />

        {/* County center dots and labels */}
        {counties.map((county, i) => {
          const pos = projectToSvg(county.coordinates.lat, county.coordinates.lng);
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
                  r={8}
                  className={`fill-none ${getFloodRiskColor(county.floodRisk.riskLevel)} stroke-dashed`}
                  strokeDasharray="4 2"
                />
              )}
              
              {/* County center dot */}
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.02 }}
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 5 : 3}
                fill={getRiskFill(county)}
                className={`pointer-events-none ${
                  isSelected ? 'stroke-foreground stroke-[2]' : 'stroke-background stroke-[1]'
                }`}
              />

              {/* Pulse for severe */}
              {getSimulatedRiskLevel(county) === 'severe' && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={5}
                  className="fill-none stroke-destructive animate-ping opacity-40"
                  strokeWidth={1}
                />
              )}
              
              {/* Weather icon overlay */}
              {showWeatherOverlay && (
                <text
                  x={pos.x + 6}
                  y={pos.y - 4}
                  fontSize="8"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {getWeatherIcon(county.weather.forecast[0]?.condition || 'cloudy')}
                </text>
              )}
              
              {/* County label */}
              <text
                x={pos.x}
                y={pos.y + 10}
                textAnchor="middle"
                className="fill-foreground text-[5.5px] font-medium pointer-events-none select-none"
                style={{ textShadow: '0 0 3px hsl(var(--background)), 0 0 3px hsl(var(--background)), 0 0 3px hsl(var(--background))' }}
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
                  r={2.5}
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
              <circle cx={pos.x} cy={pos.y} r={14} className="fill-primary/15 animate-pulse" />
              <ellipse cx={pos.x} cy={pos.y + 12} rx={5} ry={2} className="fill-foreground/10" />
              <path
                d={`M ${pos.x} ${pos.y - 12} 
                    C ${pos.x - 7} ${pos.y - 12}, ${pos.x - 7} ${pos.y - 2}, ${pos.x} ${pos.y + 4}
                    C ${pos.x + 7} ${pos.y - 2}, ${pos.x + 7} ${pos.y - 12}, ${pos.x} ${pos.y - 12} Z`}
                className="fill-primary stroke-primary-foreground"
                strokeWidth="1"
              />
              <circle cx={pos.x} cy={pos.y - 7} r={2.5} className="fill-primary-foreground" />
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
                x1={left.x} y1={left.y} x2={right.x} y2={right.y}
                className="stroke-muted-foreground/20"
                strokeWidth="0.5"
                strokeDasharray="8 4"
              />
              <text
                x={right.x - 5} y={left.y - 4}
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
      
      {/* Zoom Controls */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex flex-col gap-1">
        <Button variant="outline" size="icon" className="h-7 w-7 bg-card/90 backdrop-blur-sm border-border" onClick={handleZoomIn}>
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7 bg-card/90 backdrop-blur-sm border-border" onClick={handleZoomOut}>
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        {zoom > 1 && (
          <Button variant="outline" size="icon" className="h-7 w-7 bg-card/90 backdrop-blur-sm border-border" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedKenyaMap;
