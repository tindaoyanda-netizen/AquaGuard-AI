import { useMemo } from 'react';
import { Delaunay } from 'd3-delaunay';
import { CountyData } from '@/data/aquaguardData';

const PROJECT_BOUNDS = {
  minLat: -4.8,
  maxLat: 5.6,
  minLng: 33.5,
  maxLng: 42.2,
};

const SVG_WIDTH = 500;
const SVG_HEIGHT = 600;
const SVG_PADDING = 20;

export const projectToSvg = (lat: number, lng: number) => {
  const x = SVG_PADDING + ((lng - PROJECT_BOUNDS.minLng) / (PROJECT_BOUNDS.maxLng - PROJECT_BOUNDS.minLng)) * (SVG_WIDTH - 2 * SVG_PADDING);
  const y = SVG_PADDING + ((PROJECT_BOUNDS.maxLat - lat) / (PROJECT_BOUNDS.maxLat - PROJECT_BOUNDS.minLat)) * (SVG_HEIGHT - 2 * SVG_PADDING);
  return { x, y };
};

// Real Kenya border from Natural Earth GeoJSON [lng, lat]
const KENYA_BORDER_COORDS: [number, number][] = [
  [40.993,-0.85829],[41.58513,-1.68325],[40.88477,-2.08255],[40.63785,-2.49979],
  [40.26304,-2.57309],[40.12119,-3.27768],[39.80006,-3.68116],[39.60489,-4.34653],
  [39.20222,-4.67677],[37.7669,-3.67712],[37.69869,-3.09699],[34.07262,-1.05982],
  [33.903711,-0.95],[33.893569,0.109814],[34.18,0.515],[34.6721,1.17694],
  [35.03599,1.90584],[34.59607,3.05374],[34.47913,3.5556],[34.005,4.249885],
  [34.620196,4.847123],[35.298007,5.506],[35.817448,5.338232],[35.817448,4.776966],
  [36.159079,4.447864],[36.855093,4.447864],[38.120915,3.598605],[38.43697,3.58851],
  [38.67114,3.61607],[38.89251,3.50074],[39.559384,3.42206],[39.85494,3.83879],
  [40.76848,4.25702],[41.1718,3.91909],[41.855083,3.918912],[40.98105,2.78452],
  [40.993,-0.85829],
];

export const KENYA_BORDER_SVG = KENYA_BORDER_COORDS.map(([lng, lat]) => projectToSvg(lat, lng));

export const KENYA_OUTLINE_PATH = `M ${KENYA_BORDER_SVG.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')} Z`;

// Lake paths
const lakeCoordsToPath = (coords: [number, number][]) => {
  const pts = coords.map(([lng, lat]) => projectToSvg(lat, lng));
  return `M ${pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')} Z`;
};

export const LAKE_VICTORIA_PATH = lakeCoordsToPath([
  [33.92,-0.95],[34.07,-1.06],[34.30,-1.15],[34.55,-1.05],
  [34.72,-0.75],[34.80,-0.45],[34.65,-0.15],[34.35,0.02],
  [34.10,0.10],[33.90,0.05],[33.89,-0.30],[33.90,-0.60],[33.92,-0.95],
]);

export const LAKE_TURKANA_PATH = lakeCoordsToPath([
  [36.05,4.40],[36.25,4.20],[36.40,3.80],[36.60,3.30],
  [36.80,2.80],[36.85,2.50],[36.70,2.45],[36.50,2.60],
  [36.30,3.00],[36.15,3.50],[36.10,3.90],[36.05,4.40],
]);

// Sutherland-Hodgman polygon clipping
type Point = [number, number];

function clipPolygon(subject: Point[], clip: Point[]): Point[] {
  let output = [...subject];
  
  for (let i = 0; i < clip.length; i++) {
    if (output.length === 0) return [];
    const input = [...output];
    output = [];
    
    const edgeStart = clip[i];
    const edgeEnd = clip[(i + 1) % clip.length];
    
    for (let j = 0; j < input.length; j++) {
      const current = input[j];
      const previous = input[(j + input.length - 1) % input.length];
      
      const currInside = isInside(current, edgeStart, edgeEnd);
      const prevInside = isInside(previous, edgeStart, edgeEnd);
      
      if (currInside) {
        if (!prevInside) {
          const inter = intersection(previous, current, edgeStart, edgeEnd);
          if (inter) output.push(inter);
        }
        output.push(current);
      } else if (prevInside) {
        const inter = intersection(previous, current, edgeStart, edgeEnd);
        if (inter) output.push(inter);
      }
    }
  }
  
  return output;
}

function isInside(p: Point, edgeStart: Point, edgeEnd: Point): boolean {
  return (edgeEnd[0] - edgeStart[0]) * (p[1] - edgeStart[1]) - 
         (edgeEnd[1] - edgeStart[1]) * (p[0] - edgeStart[0]) >= 0;
}

function intersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  const x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1];
  const x3 = p3[0], y3 = p3[1], x4 = p4[0], y4 = p4[1];
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return null;
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

export function useVoronoiCounties(counties: CountyData[]) {
  return useMemo(() => {
    if (counties.length === 0) return [];
    
    // Project county centers to SVG coordinates
    const points: [number, number][] = counties.map(c => {
      const p = projectToSvg(c.coordinates.lat, c.coordinates.lng);
      return [p.x, p.y];
    });
    
    // Compute Voronoi diagram
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, SVG_WIDTH, SVG_HEIGHT]);
    
    // Kenya border as clip polygon in SVG coords
    const kenyaClip: Point[] = KENYA_BORDER_SVG.map(p => [p.x, p.y]);
    
    // For each county, get its Voronoi cell clipped to Kenya border
    return counties.map((county, i) => {
      const cellPolygon = voronoi.cellPolygon(i);
      if (!cellPolygon) return { county, path: '' };
      
      // cellPolygon is [[x,y], ...] with first === last
      const cellPoints: Point[] = cellPolygon.slice(0, -1);
      
      // Clip to Kenya border
      const clipped = clipPolygon(cellPoints, kenyaClip);
      
      if (clipped.length < 3) return { county, path: '' };
      
      const path = `M ${clipped.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L ')} Z`;
      
      return { county, path };
    });
  }, [counties]);
}

export { SVG_WIDTH, SVG_HEIGHT, PROJECT_BOUNDS };
