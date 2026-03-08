// Extended data layer for AquaGuard Kenya with towns, water sources, weather, and flood data

export interface WaterSource {
  id: string;
  name: string;
  type: 'reservoir' | 'river' | 'borehole' | 'kiosk';
  countyId: string;
  coordinates: { lat: number; lng: number };
  currentLevel: number; // 0-100%
  capacity?: number; // liters
  status: 'normal' | 'low' | 'critical';
}

export interface Town {
  id: string;
  name: string;
  countyId: string;
  coordinates: { lat: number; lng: number };
  population: number;
}

export interface WeatherData {
  countyId: string;
  temperature: number; // Celsius
  humidity: number; // %
  rainfall24h: number; // mm
  forecast: {
    date: string;
    rainfall: number;
    condition: 'sunny' | 'cloudy' | 'rain' | 'heavy_rain' | 'storm';
  }[];
}

export interface FloodRisk {
  countyId: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  probability: number; // 0-100%
  predictedDate?: string;
  affectedAreas: string[];
  precautions: string[];
}

export interface Notification {
  id: string;
  type: 'water_scarcity' | 'flood_alert' | 'weather_alert' | 'daily_insight';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  countyId: string;
  townId?: string;
  timestamp: Date;
  coordinates?: { lat: number; lng: number };
  read: boolean;
}

export interface CountyData {
  id: string;
  name: string;
  waterAvailability: number;
  waterStress: number;
  population: number;
  recentRainfall: number;
  riskLevel: 'stable' | 'moderate' | 'severe';
  floodRisk: FloodRisk;
  waterSources: {
    reservoirs: number;
    rivers: number;
    boreholes: number;
    kiosks: number;
  };
  coordinates: { lat: number; lng: number };
  trend: number[];
  towns: Town[];
  weather: WeatherData;
}

// Sample water sources across Kenya
export const waterSources: WaterSource[] = [
  // Nairobi
  { id: 'ws-nrb-1', name: 'Ndakaini Dam', type: 'reservoir', countyId: 'nairobi', coordinates: { lat: -0.95, lng: 36.95 }, currentLevel: 68, capacity: 70000000, status: 'normal' },
  { id: 'ws-nrb-2', name: 'Sasumua Dam', type: 'reservoir', countyId: 'nairobi', coordinates: { lat: -0.78, lng: 36.67 }, currentLevel: 55, capacity: 26000000, status: 'low' },
  { id: 'ws-nrb-3', name: 'Thika River', type: 'river', countyId: 'nairobi', coordinates: { lat: -1.05, lng: 37.05 }, currentLevel: 72, status: 'normal' },
  { id: 'ws-nrb-4', name: 'Ruiru Borehole A', type: 'borehole', countyId: 'nairobi', coordinates: { lat: -1.15, lng: 36.96 }, currentLevel: 45, status: 'low' },
  // Mombasa
  { id: 'ws-mbs-1', name: 'Mzima Springs', type: 'river', countyId: 'mombasa', coordinates: { lat: -2.98, lng: 38.02 }, currentLevel: 42, status: 'low' },
  { id: 'ws-mbs-2', name: 'Tiwi Borehole', type: 'borehole', countyId: 'mombasa', coordinates: { lat: -4.24, lng: 39.55 }, currentLevel: 35, status: 'critical' },
  // Kisumu
  { id: 'ws-ksm-1', name: 'Lake Victoria Intake', type: 'reservoir', countyId: 'kisumu', coordinates: { lat: -0.09, lng: 34.76 }, currentLevel: 92, capacity: 100000000, status: 'normal' },
  { id: 'ws-ksm-2', name: 'Nyando River', type: 'river', countyId: 'kisumu', coordinates: { lat: -0.15, lng: 34.95 }, currentLevel: 85, status: 'normal' },
  // Turkana
  { id: 'ws-trk-1', name: 'Turkwel Dam', type: 'reservoir', countyId: 'turkana', coordinates: { lat: 1.90, lng: 35.35 }, currentLevel: 18, capacity: 1600000000, status: 'critical' },
  { id: 'ws-trk-2', name: 'Lodwar Borehole', type: 'borehole', countyId: 'turkana', coordinates: { lat: 3.12, lng: 35.60 }, currentLevel: 22, status: 'critical' },
  // Nakuru
  { id: 'ws-nkr-1', name: 'Lake Nakuru', type: 'reservoir', countyId: 'nakuru', coordinates: { lat: -0.37, lng: 36.09 }, currentLevel: 65, status: 'normal' },
  { id: 'ws-nkr-2', name: 'Menengai Borehole', type: 'borehole', countyId: 'nakuru', coordinates: { lat: -0.18, lng: 36.07 }, currentLevel: 58, status: 'low' },
  // Kiambu
  { id: 'ws-kmb-1', name: 'Ruiru Dam', type: 'reservoir', countyId: 'kiambu', coordinates: { lat: -1.13, lng: 36.98 }, currentLevel: 74, capacity: 2900000, status: 'normal' },
  { id: 'ws-kmb-2', name: 'Gatanga River', type: 'river', countyId: 'kiambu', coordinates: { lat: -0.95, lng: 37.02 }, currentLevel: 78, status: 'normal' },
  // Garissa
  { id: 'ws-grs-1', name: 'Tana River', type: 'river', countyId: 'garissa', coordinates: { lat: -0.46, lng: 39.64 }, currentLevel: 28, status: 'critical' },
];

// Counties with extended data
export const kenyaCounties: CountyData[] = [
  {
    id: 'nairobi',
    name: 'Nairobi',
    waterAvailability: 65,
    waterStress: 72,
    population: 4397073,
    recentRainfall: 45,
    riskLevel: 'moderate',
    floodRisk: { countyId: 'nairobi', riskLevel: 'moderate', probability: 35, affectedAreas: ['Mathare', 'Kibera', 'Eastleigh'], precautions: ['Clear drainage channels', 'Avoid low-lying areas during rain', 'Store emergency supplies'] },
    waterSources: { reservoirs: 3, rivers: 2, boreholes: 156, kiosks: 234 },
    coordinates: { lat: -1.2921, lng: 36.8219 },
    trend: [60, 62, 58, 55, 60, 63, 65, 62, 58, 61, 64, 66, 63, 60, 58, 62, 65, 67, 64, 61, 59, 63, 66, 68, 65, 62, 60, 64, 67, 65],
    towns: [
      { id: 'nrb-westlands', name: 'Westlands', countyId: 'nairobi', coordinates: { lat: -1.2673, lng: 36.8111 }, population: 281562 },
      { id: 'nrb-kasarani', name: 'Kasarani', countyId: 'nairobi', coordinates: { lat: -1.2219, lng: 36.8882 }, population: 525624 },
      { id: 'nrb-embakasi', name: 'Embakasi', countyId: 'nairobi', coordinates: { lat: -1.3226, lng: 36.8987 }, population: 987456 },
    ],
    weather: { countyId: 'nairobi', temperature: 24, humidity: 65, rainfall24h: 12, forecast: [
      { date: '2026-02-02', rainfall: 15, condition: 'rain' },
      { date: '2026-02-03', rainfall: 8, condition: 'cloudy' },
      { date: '2026-02-04', rainfall: 0, condition: 'sunny' },
    ]}
  },
  {
    id: 'mombasa',
    name: 'Mombasa',
    waterAvailability: 55,
    waterStress: 78,
    population: 1208333,
    recentRainfall: 32,
    riskLevel: 'severe',
    floodRisk: { countyId: 'mombasa', riskLevel: 'high', probability: 65, predictedDate: '2026-02-05', affectedAreas: ['Likoni', 'Kisauni', 'Changamwe'], precautions: ['Move valuables to higher ground', 'Prepare evacuation routes', 'Stock food and water'] },
    waterSources: { reservoirs: 1, rivers: 0, boreholes: 89, kiosks: 156 },
    coordinates: { lat: -4.0435, lng: 39.6682 },
    trend: [58, 55, 52, 50, 48, 52, 55, 53, 50, 48, 52, 55, 58, 55, 52, 50, 53, 56, 54, 51, 49, 52, 55, 57, 54, 51, 49, 53, 56, 55],
    towns: [
      { id: 'mbs-nyali', name: 'Nyali', countyId: 'mombasa', coordinates: { lat: -4.0347, lng: 39.7096 }, population: 193534 },
      { id: 'mbs-likoni', name: 'Likoni', countyId: 'mombasa', coordinates: { lat: -4.0829, lng: 39.6572 }, population: 222871 },
    ],
    weather: { countyId: 'mombasa', temperature: 29, humidity: 78, rainfall24h: 45, forecast: [
      { date: '2026-02-02', rainfall: 55, condition: 'heavy_rain' },
      { date: '2026-02-03', rainfall: 40, condition: 'rain' },
      { date: '2026-02-04', rainfall: 25, condition: 'rain' },
    ]}
  },
  {
    id: 'kisumu',
    name: 'Kisumu',
    waterAvailability: 82,
    waterStress: 35,
    population: 1155574,
    recentRainfall: 78,
    riskLevel: 'stable',
    floodRisk: { countyId: 'kisumu', riskLevel: 'moderate', probability: 40, affectedAreas: ['Nyalenda', 'Manyatta'], precautions: ['Monitor lake levels', 'Keep emergency contacts ready'] },
    waterSources: { reservoirs: 5, rivers: 4, boreholes: 67, kiosks: 89 },
    coordinates: { lat: -0.1022, lng: 34.7617 },
    trend: [78, 80, 82, 85, 83, 81, 79, 82, 84, 86, 83, 80, 78, 81, 83, 85, 82, 79, 77, 80, 82, 84, 81, 78, 76, 79, 81, 83, 80, 82],
    towns: [
      { id: 'ksm-central', name: 'Kisumu Central', countyId: 'kisumu', coordinates: { lat: -0.0917, lng: 34.7680 }, population: 167890 },
      { id: 'ksm-nyando', name: 'Nyando', countyId: 'kisumu', coordinates: { lat: -0.1654, lng: 34.9023 }, population: 145623 },
    ],
    weather: { countyId: 'kisumu', temperature: 27, humidity: 72, rainfall24h: 22, forecast: [
      { date: '2026-02-02', rainfall: 18, condition: 'rain' },
      { date: '2026-02-03', rainfall: 5, condition: 'cloudy' },
      { date: '2026-02-04', rainfall: 0, condition: 'sunny' },
    ]}
  },
  {
    id: 'nakuru',
    name: 'Nakuru',
    waterAvailability: 70,
    waterStress: 55,
    population: 2162202,
    recentRainfall: 55,
    riskLevel: 'moderate',
    floodRisk: { countyId: 'nakuru', riskLevel: 'low', probability: 15, affectedAreas: ['Lake Nakuru Basin'], precautions: ['Standard flood awareness'] },
    waterSources: { reservoirs: 4, rivers: 3, boreholes: 112, kiosks: 178 },
    coordinates: { lat: -0.3031, lng: 36.0800 },
    trend: [65, 68, 70, 72, 69, 66, 64, 67, 70, 72, 69, 66, 64, 67, 70, 73, 70, 67, 65, 68, 71, 73, 70, 67, 65, 68, 71, 73, 70, 70],
    towns: [
      { id: 'nkr-central', name: 'Nakuru Town', countyId: 'nakuru', coordinates: { lat: -0.2833, lng: 36.0667 }, population: 367183 },
      { id: 'nkr-naivasha', name: 'Naivasha', countyId: 'nakuru', coordinates: { lat: -0.7172, lng: 36.4320 }, population: 181966 },
    ],
    weather: { countyId: 'nakuru', temperature: 22, humidity: 58, rainfall24h: 8, forecast: [
      { date: '2026-02-02', rainfall: 5, condition: 'cloudy' },
      { date: '2026-02-03', rainfall: 0, condition: 'sunny' },
      { date: '2026-02-04', rainfall: 2, condition: 'cloudy' },
    ]}
  },
  {
    id: 'turkana',
    name: 'Turkana',
    waterAvailability: 22,
    waterStress: 95,
    population: 926976,
    recentRainfall: 8,
    riskLevel: 'severe',
    floodRisk: { countyId: 'turkana', riskLevel: 'low', probability: 5, affectedAreas: [], precautions: ['Focus on drought preparedness'] },
    waterSources: { reservoirs: 0, rivers: 1, boreholes: 23, kiosks: 45 },
    coordinates: { lat: 3.1166, lng: 35.5966 },
    trend: [25, 23, 20, 18, 16, 18, 21, 23, 20, 17, 15, 18, 21, 24, 21, 18, 16, 19, 22, 24, 21, 18, 16, 19, 22, 25, 22, 19, 17, 22],
    towns: [
      { id: 'trk-lodwar', name: 'Lodwar', countyId: 'turkana', coordinates: { lat: 3.1166, lng: 35.5966 }, population: 82970 },
      { id: 'trk-kakuma', name: 'Kakuma', countyId: 'turkana', coordinates: { lat: 3.7167, lng: 34.8500 }, population: 60000 },
    ],
    weather: { countyId: 'turkana', temperature: 35, humidity: 25, rainfall24h: 0, forecast: [
      { date: '2026-02-02', rainfall: 0, condition: 'sunny' },
      { date: '2026-02-03', rainfall: 0, condition: 'sunny' },
      { date: '2026-02-04', rainfall: 0, condition: 'sunny' },
    ]}
  },
  {
    id: 'kiambu',
    name: 'Kiambu',
    waterAvailability: 75,
    waterStress: 48,
    population: 2417735,
    recentRainfall: 62,
    riskLevel: 'stable',
    floodRisk: { countyId: 'kiambu', riskLevel: 'low', probability: 20, affectedAreas: ['Thika Town lowlands'], precautions: ['Maintain drainage systems'] },
    waterSources: { reservoirs: 6, rivers: 5, boreholes: 178, kiosks: 267 },
    coordinates: { lat: -1.1714, lng: 36.8356 },
    trend: [70, 72, 75, 77, 74, 71, 69, 72, 75, 78, 75, 72, 70, 73, 76, 78, 75, 72, 70, 73, 76, 79, 76, 73, 71, 74, 77, 79, 76, 75],
    towns: [
      { id: 'kmb-thika', name: 'Thika', countyId: 'kiambu', coordinates: { lat: -1.0334, lng: 37.0693 }, population: 139853 },
      { id: 'kmb-ruiru', name: 'Ruiru', countyId: 'kiambu', coordinates: { lat: -1.1456, lng: 36.9607 }, population: 238858 },
    ],
    weather: { countyId: 'kiambu', temperature: 23, humidity: 68, rainfall24h: 15, forecast: [
      { date: '2026-02-02', rainfall: 12, condition: 'rain' },
      { date: '2026-02-03', rainfall: 8, condition: 'cloudy' },
      { date: '2026-02-04', rainfall: 3, condition: 'cloudy' },
    ]}
  },
  {
    id: 'machakos',
    name: 'Machakos',
    waterAvailability: 45,
    waterStress: 68,
    population: 1421932,
    recentRainfall: 28,
    riskLevel: 'moderate',
    floodRisk: { countyId: 'machakos', riskLevel: 'moderate', probability: 30, affectedAreas: ['Athi River Basin'], precautions: ['Monitor river levels', 'Avoid crossing flooded areas'] },
    waterSources: { reservoirs: 2, rivers: 2, boreholes: 95, kiosks: 145 },
    coordinates: { lat: -1.5177, lng: 37.2634 },
    trend: [48, 46, 43, 40, 42, 45, 48, 45, 42, 39, 42, 45, 48, 45, 42, 39, 42, 45, 48, 46, 43, 40, 43, 46, 49, 46, 43, 41, 44, 45],
    towns: [
      { id: 'mks-machakos', name: 'Machakos Town', countyId: 'machakos', coordinates: { lat: -1.5177, lng: 37.2634 }, population: 150041 },
      { id: 'mks-athi', name: 'Athi River', countyId: 'machakos', coordinates: { lat: -1.4548, lng: 36.9820 }, population: 120000 },
    ],
    weather: { countyId: 'machakos', temperature: 26, humidity: 52, rainfall24h: 5, forecast: [
      { date: '2026-02-02', rainfall: 8, condition: 'cloudy' },
      { date: '2026-02-03', rainfall: 2, condition: 'sunny' },
      { date: '2026-02-04', rainfall: 0, condition: 'sunny' },
    ]}
  },
  {
    id: 'kajiado',
    name: 'Kajiado',
    waterAvailability: 38,
    waterStress: 75,
    population: 1117840,
    recentRainfall: 22,
    riskLevel: 'severe',
    floodRisk: { countyId: 'kajiado', riskLevel: 'low', probability: 10, affectedAreas: [], precautions: ['Focus on water conservation'] },
    waterSources: { reservoirs: 1, rivers: 1, boreholes: 56, kiosks: 89 },
    coordinates: { lat: -1.8524, lng: 36.7820 },
    trend: [42, 40, 37, 34, 36, 39, 42, 39, 36, 33, 36, 39, 42, 39, 36, 33, 36, 39, 42, 40, 37, 34, 37, 40, 43, 40, 37, 35, 38, 38],
    towns: [
      { id: 'kjd-ngong', name: 'Ngong', countyId: 'kajiado', coordinates: { lat: -1.3583, lng: 36.6583 }, population: 77458 },
      { id: 'kjd-kitengela', name: 'Kitengela', countyId: 'kajiado', coordinates: { lat: -1.4763, lng: 36.9569 }, population: 154436 },
    ],
    weather: { countyId: 'kajiado', temperature: 28, humidity: 40, rainfall24h: 2, forecast: [
      { date: '2026-02-02', rainfall: 0, condition: 'sunny' },
      { date: '2026-02-03', rainfall: 0, condition: 'sunny' },
      { date: '2026-02-04', rainfall: 5, condition: 'cloudy' },
    ]}
  },
  {
    id: 'uasingishu',
    name: 'Uasin Gishu',
    waterAvailability: 78,
    waterStress: 42,
    population: 1163186,
    recentRainfall: 70,
    riskLevel: 'stable',
    floodRisk: { countyId: 'uasingishu', riskLevel: 'low', probability: 12, affectedAreas: ['Eldoret lowlands'], precautions: ['Standard preparedness'] },
    waterSources: { reservoirs: 4, rivers: 3, boreholes: 89, kiosks: 134 },
    coordinates: { lat: 0.5143, lng: 35.2698 },
    trend: [75, 77, 79, 81, 78, 75, 73, 76, 79, 82, 79, 76, 74, 77, 80, 82, 79, 76, 74, 77, 80, 83, 80, 77, 75, 78, 81, 83, 80, 78],
    towns: [
      { id: 'usg-eldoret', name: 'Eldoret', countyId: 'uasingishu', coordinates: { lat: 0.5143, lng: 35.2698 }, population: 475716 },
    ],
    weather: { countyId: 'uasingishu', temperature: 20, humidity: 65, rainfall24h: 18, forecast: [
      { date: '2026-02-02', rainfall: 15, condition: 'rain' },
      { date: '2026-02-03', rainfall: 10, condition: 'cloudy' },
      { date: '2026-02-04', rainfall: 5, condition: 'cloudy' },
    ]}
  },
  {
    id: 'meru',
    name: 'Meru',
    waterAvailability: 72,
    waterStress: 52,
    population: 1545714,
    recentRainfall: 58,
    riskLevel: 'stable',
    floodRisk: { countyId: 'meru', riskLevel: 'low', probability: 18, affectedAreas: ['River valleys'], precautions: ['Monitor Mt. Kenya runoff'] },
    waterSources: { reservoirs: 3, rivers: 4, boreholes: 102, kiosks: 156 },
    coordinates: { lat: 0.0500, lng: 37.6500 },
    trend: [68, 70, 72, 74, 71, 68, 66, 69, 72, 75, 72, 69, 67, 70, 73, 75, 72, 69, 67, 70, 73, 76, 73, 70, 68, 71, 74, 76, 73, 72],
    towns: [
      { id: 'mru-meru', name: 'Meru Town', countyId: 'meru', coordinates: { lat: 0.0500, lng: 37.6500 }, population: 52304 },
    ],
    weather: { countyId: 'meru', temperature: 21, humidity: 62, rainfall24h: 12, forecast: [
      { date: '2026-02-02', rainfall: 10, condition: 'rain' },
      { date: '2026-02-03', rainfall: 5, condition: 'cloudy' },
      { date: '2026-02-04', rainfall: 2, condition: 'sunny' },
    ]}
  },
  {
    id: 'kilifi',
    name: 'Kilifi',
    waterAvailability: 48,
    waterStress: 70,
    population: 1453787,
    recentRainfall: 35,
    riskLevel: 'moderate',
    floodRisk: { countyId: 'kilifi', riskLevel: 'moderate', probability: 45, affectedAreas: ['Coastal lowlands', 'Malindi'], precautions: ['Prepare for flash floods', 'Clear drainage'] },
    waterSources: { reservoirs: 2, rivers: 2, boreholes: 78, kiosks: 123 },
    coordinates: { lat: -3.6305, lng: 39.8499 },
    trend: [50, 48, 45, 42, 44, 47, 50, 47, 44, 41, 44, 47, 50, 47, 44, 41, 44, 47, 50, 48, 45, 42, 45, 48, 51, 48, 45, 43, 46, 48],
    towns: [
      { id: 'klf-malindi', name: 'Malindi', countyId: 'kilifi', coordinates: { lat: -3.2138, lng: 40.1169 }, population: 119859 },
      { id: 'klf-kilifi', name: 'Kilifi Town', countyId: 'kilifi', coordinates: { lat: -3.6305, lng: 39.8499 }, population: 52073 },
    ],
    weather: { countyId: 'kilifi', temperature: 30, humidity: 75, rainfall24h: 28, forecast: [
      { date: '2026-02-02', rainfall: 35, condition: 'rain' },
      { date: '2026-02-03', rainfall: 20, condition: 'rain' },
      { date: '2026-02-04', rainfall: 10, condition: 'cloudy' },
    ]}
  },
  {
    id: 'wajir',
    name: 'Wajir',
    waterAvailability: 18,
    waterStress: 92,
    population: 781263,
    recentRainfall: 5,
    riskLevel: 'severe',
    floodRisk: { countyId: 'wajir', riskLevel: 'low', probability: 5, affectedAreas: [], precautions: ['Focus on drought mitigation'] },
    waterSources: { reservoirs: 0, rivers: 0, boreholes: 34, kiosks: 56 },
    coordinates: { lat: 1.7471, lng: 40.0573 },
    trend: [22, 20, 17, 14, 16, 19, 22, 19, 16, 13, 16, 19, 22, 19, 16, 13, 16, 19, 22, 20, 17, 14, 17, 20, 23, 20, 17, 15, 18, 18],
    towns: [
      { id: 'wjr-wajir', name: 'Wajir Town', countyId: 'wajir', coordinates: { lat: 1.7471, lng: 40.0573 }, population: 89849 },
    ],
    weather: { countyId: 'wajir', temperature: 34, humidity: 28, rainfall24h: 0, forecast: [
      { date: '2026-02-02', rainfall: 0, condition: 'sunny' },
      { date: '2026-02-03', rainfall: 0, condition: 'sunny' },
      { date: '2026-02-04', rainfall: 0, condition: 'sunny' },
    ]}
  },
  {
    id: 'mandera',
    name: 'Mandera',
    waterAvailability: 15,
    waterStress: 94,
    population: 867457,
    recentRainfall: 3,
    riskLevel: 'severe',
    floodRisk: { countyId: 'mandera', riskLevel: 'low', probability: 3, affectedAreas: [], precautions: ['Prioritize water storage'] },
    waterSources: { reservoirs: 0, rivers: 1, boreholes: 28, kiosks: 45 },
    coordinates: { lat: 3.9366, lng: 41.8670 },
    trend: [18, 16, 13, 10, 12, 15, 18, 15, 12, 9, 12, 15, 18, 15, 12, 9, 12, 15, 18, 16, 13, 10, 13, 16, 19, 16, 13, 11, 14, 15],
    towns: [
      { id: 'mnd-mandera', name: 'Mandera Town', countyId: 'mandera', coordinates: { lat: 3.9366, lng: 41.8670 }, population: 61294 },
    ],
    weather: { countyId: 'mandera', temperature: 36, humidity: 22, rainfall24h: 0, forecast: [
      { date: '2026-02-02', rainfall: 0, condition: 'sunny' },
      { date: '2026-02-03', rainfall: 0, condition: 'sunny' },
      { date: '2026-02-04', rainfall: 0, condition: 'sunny' },
    ]}
  },
  {
    id: 'garissa',
    name: 'Garissa',
    waterAvailability: 25,
    waterStress: 88,
    population: 841353,
    recentRainfall: 10,
    riskLevel: 'severe',
    floodRisk: { countyId: 'garissa', riskLevel: 'moderate', probability: 25, affectedAreas: ['Tana River Basin'], precautions: ['Monitor Tana River levels', 'Move livestock to higher ground'] },
    waterSources: { reservoirs: 0, rivers: 1, boreholes: 45, kiosks: 67 },
    coordinates: { lat: -0.4536, lng: 39.6401 },
    trend: [28, 26, 23, 20, 22, 25, 28, 25, 22, 19, 22, 25, 28, 25, 22, 19, 22, 25, 28, 26, 23, 20, 23, 26, 29, 26, 23, 21, 24, 25],
    towns: [
      { id: 'grs-garissa', name: 'Garissa Town', countyId: 'garissa', coordinates: { lat: -0.4536, lng: 39.6401 }, population: 65881 },
    ],
    weather: { countyId: 'garissa', temperature: 33, humidity: 35, rainfall24h: 2, forecast: [
      { date: '2026-02-02', rainfall: 5, condition: 'cloudy' },
      { date: '2026-02-03', rainfall: 0, condition: 'sunny' },
      { date: '2026-02-04', rainfall: 0, condition: 'sunny' },
    ]}
  },
  {
    id: 'nyeri',
    name: 'Nyeri',
    waterAvailability: 80,
    waterStress: 38,
    population: 759164,
    recentRainfall: 75,
    riskLevel: 'stable',
    floodRisk: { countyId: 'nyeri', riskLevel: 'low', probability: 15, affectedAreas: ['River valleys near Mt. Kenya'], precautions: ['Standard monitoring'] },
    waterSources: { reservoirs: 5, rivers: 5, boreholes: 89, kiosks: 134 },
    coordinates: { lat: -0.4197, lng: 36.9553 },
    trend: [76, 78, 80, 82, 79, 76, 74, 77, 80, 83, 80, 77, 75, 78, 81, 83, 80, 77, 75, 78, 81, 84, 81, 78, 76, 79, 82, 84, 81, 80],
    towns: [
      { id: 'nyr-nyeri', name: 'Nyeri Town', countyId: 'nyeri', coordinates: { lat: -0.4197, lng: 36.9553 }, population: 119353 },
    ],
    weather: { countyId: 'nyeri', temperature: 19, humidity: 70, rainfall24h: 20, forecast: [
      { date: '2026-02-02', rainfall: 18, condition: 'rain' },
      { date: '2026-02-03', rainfall: 12, condition: 'rain' },
      { date: '2026-02-04', rainfall: 5, condition: 'cloudy' },
    ]}
  },
  {
    id: 'kakamega',
    name: 'Kakamega',
    waterAvailability: 85,
    waterStress: 30,
    population: 1867579,
    recentRainfall: 85,
    riskLevel: 'stable',
    floodRisk: { countyId: 'kakamega', riskLevel: 'high', probability: 55, predictedDate: '2026-02-03', affectedAreas: ['Budalangi', 'Mumias lowlands'], precautions: ['Evacuate low-lying areas', 'Stock emergency supplies', 'Avoid river crossings'] },
    waterSources: { reservoirs: 6, rivers: 7, boreholes: 134, kiosks: 198 },
    coordinates: { lat: 0.2827, lng: 34.7519 },
    trend: [82, 84, 86, 88, 85, 82, 80, 83, 86, 89, 86, 83, 81, 84, 87, 89, 86, 83, 81, 84, 87, 90, 87, 84, 82, 85, 88, 90, 87, 85],
    towns: [
      { id: 'kkm-kakamega', name: 'Kakamega Town', countyId: 'kakamega', coordinates: { lat: 0.2827, lng: 34.7519 }, population: 99987 },
      { id: 'kkm-mumias', name: 'Mumias', countyId: 'kakamega', coordinates: { lat: 0.3367, lng: 34.4883 }, population: 99987 },
    ],
    weather: { countyId: 'kakamega', temperature: 25, humidity: 80, rainfall24h: 45, forecast: [
      { date: '2026-02-02', rainfall: 55, condition: 'heavy_rain' },
      { date: '2026-02-03', rainfall: 60, condition: 'storm' },
      { date: '2026-02-04', rainfall: 30, condition: 'rain' },
    ]}
  },
  {
    id: 'siaya',
    name: 'Siaya',
    waterAvailability: 68,
    waterStress: 45,
    population: 993183,
    recentRainfall: 65,
    riskLevel: 'moderate',
    floodRisk: { countyId: 'siaya', riskLevel: 'moderate', probability: 38, affectedAreas: ['Yala Swamp', 'Bondo lowlands'], precautions: ['Monitor Lake Victoria levels', 'Avoid Yala swamp during rains'] },
    waterSources: { reservoirs: 2, rivers: 5, boreholes: 78, kiosks: 112 },
    coordinates: { lat: 0.0607, lng: 34.2422 },
    trend: [64, 66, 68, 70, 67, 64, 62, 65, 68, 71, 68, 65, 63, 66, 69, 71, 68, 65, 63, 66, 69, 72, 69, 66, 64, 67, 70, 72, 69, 68],
    towns: [
      { id: 'sya-siaya', name: 'Siaya Town', countyId: 'siaya', coordinates: { lat: 0.0607, lng: 34.2422 }, population: 47168 },
      { id: 'sya-bondo', name: 'Bondo', countyId: 'siaya', coordinates: { lat: -0.0833, lng: 34.2667 }, population: 52754 },
    ],
    weather: { countyId: 'siaya', temperature: 26, humidity: 74, rainfall24h: 18, forecast: [
      { date: '2026-02-02', rainfall: 20, condition: 'rain' },
      { date: '2026-02-03', rainfall: 12, condition: 'cloudy' },
      { date: '2026-02-04', rainfall: 5, condition: 'cloudy' },
    ]}
  },
  // === REMAINING 30 COUNTIES ===
  {
    id: 'kwale', name: 'Kwale', waterAvailability: 42, waterStress: 72, population: 866820, recentRainfall: 30, riskLevel: 'moderate',
    floodRisk: { countyId: 'kwale', riskLevel: 'moderate', probability: 35, affectedAreas: ['Shimba Hills lowlands'], precautions: ['Monitor coastal rivers'] },
    waterSources: { reservoirs: 1, rivers: 2, boreholes: 56, kiosks: 78 },
    coordinates: { lat: -4.1816, lng: 39.4606 },
    trend: [44, 42, 40, 38, 40, 42, 44, 42, 40, 38, 40, 42, 44, 42, 40, 38, 40, 42, 44, 42, 40, 38, 40, 42, 44, 42, 40, 38, 40, 42],
    towns: [{ id: 'kwl-kwale', name: 'Kwale Town', countyId: 'kwale', coordinates: { lat: -4.1816, lng: 39.4606 }, population: 28252 }],
    weather: { countyId: 'kwale', temperature: 28, humidity: 72, rainfall24h: 10, forecast: [{ date: '2026-02-02', rainfall: 12, condition: 'rain' }, { date: '2026-02-03', rainfall: 5, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 0, condition: 'sunny' }] }
  },
  {
    id: 'taita_taveta', name: 'Taita Taveta', waterAvailability: 40, waterStress: 65, population: 340671, recentRainfall: 25, riskLevel: 'moderate',
    floodRisk: { countyId: 'taita_taveta', riskLevel: 'low', probability: 10, affectedAreas: ['Taveta plains'], precautions: ['Standard monitoring'] },
    waterSources: { reservoirs: 2, rivers: 3, boreholes: 45, kiosks: 56 },
    coordinates: { lat: -3.3961, lng: 38.3566 },
    trend: [42, 40, 38, 36, 38, 40, 42, 40, 38, 36, 38, 40, 42, 40, 38, 36, 38, 40, 42, 40, 38, 36, 38, 40, 42, 40, 38, 36, 38, 40],
    towns: [{ id: 'tt-wundanyi', name: 'Wundanyi', countyId: 'taita_taveta', coordinates: { lat: -3.3961, lng: 38.3566 }, population: 14768 }],
    weather: { countyId: 'taita_taveta', temperature: 25, humidity: 55, rainfall24h: 5, forecast: [{ date: '2026-02-02', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-03', rainfall: 2, condition: 'sunny' }, { date: '2026-02-04', rainfall: 0, condition: 'sunny' }] }
  },
  {
    id: 'lamu', name: 'Lamu', waterAvailability: 50, waterStress: 60, population: 143920, recentRainfall: 28, riskLevel: 'moderate',
    floodRisk: { countyId: 'lamu', riskLevel: 'moderate', probability: 40, affectedAreas: ['Lamu Island lowlands'], precautions: ['Monitor tidal surges'] },
    waterSources: { reservoirs: 0, rivers: 1, boreholes: 25, kiosks: 34 },
    coordinates: { lat: -2.2717, lng: 40.9020 },
    trend: [52, 50, 48, 46, 48, 50, 52, 50, 48, 46, 48, 50, 52, 50, 48, 46, 48, 50, 52, 50, 48, 46, 48, 50, 52, 50, 48, 46, 48, 50],
    towns: [{ id: 'lmu-lamu', name: 'Lamu Town', countyId: 'lamu', coordinates: { lat: -2.2717, lng: 40.9020 }, population: 18382 }],
    weather: { countyId: 'lamu', temperature: 29, humidity: 76, rainfall24h: 8, forecast: [{ date: '2026-02-02', rainfall: 10, condition: 'rain' }, { date: '2026-02-03', rainfall: 5, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 0, condition: 'sunny' }] }
  },
  {
    id: 'tana_river', name: 'Tana River', waterAvailability: 30, waterStress: 80, population: 315943, recentRainfall: 12, riskLevel: 'severe',
    floodRisk: { countyId: 'tana_river', riskLevel: 'high', probability: 60, affectedAreas: ['Tana Delta', 'Hola town'], precautions: ['Evacuate flood plains', 'Monitor river levels'] },
    waterSources: { reservoirs: 0, rivers: 2, boreholes: 35, kiosks: 45 },
    coordinates: { lat: -1.5019, lng: 39.9884 },
    trend: [32, 30, 28, 26, 28, 30, 32, 30, 28, 26, 28, 30, 32, 30, 28, 26, 28, 30, 32, 30, 28, 26, 28, 30, 32, 30, 28, 26, 28, 30],
    towns: [{ id: 'tr-hola', name: 'Hola', countyId: 'tana_river', coordinates: { lat: -1.5019, lng: 39.9884 }, population: 6931 }],
    weather: { countyId: 'tana_river', temperature: 32, humidity: 45, rainfall24h: 3, forecast: [{ date: '2026-02-02', rainfall: 5, condition: 'cloudy' }, { date: '2026-02-03', rainfall: 0, condition: 'sunny' }, { date: '2026-02-04', rainfall: 0, condition: 'sunny' }] }
  },
  {
    id: 'marsabit', name: 'Marsabit', waterAvailability: 20, waterStress: 90, population: 459785, recentRainfall: 6, riskLevel: 'severe',
    floodRisk: { countyId: 'marsabit', riskLevel: 'low', probability: 5, affectedAreas: [], precautions: ['Focus on drought preparedness'] },
    waterSources: { reservoirs: 0, rivers: 0, boreholes: 28, kiosks: 35 },
    coordinates: { lat: 2.3284, lng: 37.9900 },
    trend: [22, 20, 18, 16, 18, 20, 22, 20, 18, 16, 18, 20, 22, 20, 18, 16, 18, 20, 22, 20, 18, 16, 18, 20, 22, 20, 18, 16, 18, 20],
    towns: [{ id: 'msb-marsabit', name: 'Marsabit Town', countyId: 'marsabit', coordinates: { lat: 2.3284, lng: 37.9900 }, population: 19739 }],
    weather: { countyId: 'marsabit', temperature: 30, humidity: 30, rainfall24h: 0, forecast: [{ date: '2026-02-02', rainfall: 0, condition: 'sunny' }, { date: '2026-02-03', rainfall: 0, condition: 'sunny' }, { date: '2026-02-04', rainfall: 2, condition: 'cloudy' }] }
  },
  {
    id: 'isiolo', name: 'Isiolo', waterAvailability: 28, waterStress: 82, population: 268002, recentRainfall: 10, riskLevel: 'severe',
    floodRisk: { countyId: 'isiolo', riskLevel: 'low', probability: 8, affectedAreas: [], precautions: ['Water conservation priority'] },
    waterSources: { reservoirs: 0, rivers: 1, boreholes: 32, kiosks: 40 },
    coordinates: { lat: 0.3546, lng: 37.5822 },
    trend: [30, 28, 26, 24, 26, 28, 30, 28, 26, 24, 26, 28, 30, 28, 26, 24, 26, 28, 30, 28, 26, 24, 26, 28, 30, 28, 26, 24, 26, 28],
    towns: [{ id: 'isl-isiolo', name: 'Isiolo Town', countyId: 'isiolo', coordinates: { lat: 0.3546, lng: 37.5822 }, population: 45989 }],
    weather: { countyId: 'isiolo', temperature: 31, humidity: 32, rainfall24h: 0, forecast: [{ date: '2026-02-02', rainfall: 0, condition: 'sunny' }, { date: '2026-02-03', rainfall: 0, condition: 'sunny' }, { date: '2026-02-04', rainfall: 0, condition: 'sunny' }] }
  },
  {
    id: 'embu', name: 'Embu', waterAvailability: 74, waterStress: 45, population: 608599, recentRainfall: 60, riskLevel: 'stable',
    floodRisk: { countyId: 'embu', riskLevel: 'low', probability: 15, affectedAreas: ['Rupingazi River basin'], precautions: ['Monitor Mt. Kenya runoff'] },
    waterSources: { reservoirs: 3, rivers: 4, boreholes: 78, kiosks: 112 },
    coordinates: { lat: -0.5389, lng: 37.4596 },
    trend: [72, 74, 76, 74, 72, 70, 72, 74, 76, 74, 72, 70, 72, 74, 76, 74, 72, 70, 72, 74, 76, 74, 72, 70, 72, 74, 76, 74, 72, 74],
    towns: [{ id: 'emb-embu', name: 'Embu Town', countyId: 'embu', coordinates: { lat: -0.5389, lng: 37.4596 }, population: 60673 }],
    weather: { countyId: 'embu', temperature: 21, humidity: 65, rainfall24h: 14, forecast: [{ date: '2026-02-02', rainfall: 12, condition: 'rain' }, { date: '2026-02-03', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 3, condition: 'cloudy' }] }
  },
  {
    id: 'tharaka_nithi', name: 'Tharaka Nithi', waterAvailability: 62, waterStress: 50, population: 393177, recentRainfall: 48, riskLevel: 'moderate',
    floodRisk: { countyId: 'tharaka_nithi', riskLevel: 'low', probability: 12, affectedAreas: ['Tharaka lowlands'], precautions: ['Standard monitoring'] },
    waterSources: { reservoirs: 2, rivers: 3, boreholes: 56, kiosks: 78 },
    coordinates: { lat: -0.3044, lng: 37.8497 },
    trend: [60, 62, 64, 62, 60, 58, 60, 62, 64, 62, 60, 58, 60, 62, 64, 62, 60, 58, 60, 62, 64, 62, 60, 58, 60, 62, 64, 62, 60, 62],
    towns: [{ id: 'tn-chuka', name: 'Chuka', countyId: 'tharaka_nithi', coordinates: { lat: -0.3322, lng: 37.6483 }, population: 18239 }],
    weather: { countyId: 'tharaka_nithi', temperature: 22, humidity: 60, rainfall24h: 10, forecast: [{ date: '2026-02-02', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-03', rainfall: 5, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 0, condition: 'sunny' }] }
  },
  {
    id: 'kitui', name: 'Kitui', waterAvailability: 32, waterStress: 78, population: 1136187, recentRainfall: 18, riskLevel: 'severe',
    floodRisk: { countyId: 'kitui', riskLevel: 'low', probability: 10, affectedAreas: ['Athi River basin'], precautions: ['Conserve water supplies'] },
    waterSources: { reservoirs: 1, rivers: 2, boreholes: 68, kiosks: 90 },
    coordinates: { lat: -1.3667, lng: 38.0106 },
    trend: [34, 32, 30, 28, 30, 32, 34, 32, 30, 28, 30, 32, 34, 32, 30, 28, 30, 32, 34, 32, 30, 28, 30, 32, 34, 32, 30, 28, 30, 32],
    towns: [{ id: 'ktu-kitui', name: 'Kitui Town', countyId: 'kitui', coordinates: { lat: -1.3667, lng: 38.0106 }, population: 109568 }],
    weather: { countyId: 'kitui', temperature: 28, humidity: 42, rainfall24h: 2, forecast: [{ date: '2026-02-02', rainfall: 0, condition: 'sunny' }, { date: '2026-02-03', rainfall: 0, condition: 'sunny' }, { date: '2026-02-04', rainfall: 5, condition: 'cloudy' }] }
  },
  {
    id: 'makueni', name: 'Makueni', waterAvailability: 35, waterStress: 74, population: 987653, recentRainfall: 20, riskLevel: 'severe',
    floodRisk: { countyId: 'makueni', riskLevel: 'low', probability: 12, affectedAreas: ['Athi River lowlands'], precautions: ['Sand dam maintenance'] },
    waterSources: { reservoirs: 2, rivers: 2, boreholes: 72, kiosks: 95 },
    coordinates: { lat: -1.8039, lng: 37.6200 },
    trend: [37, 35, 33, 31, 33, 35, 37, 35, 33, 31, 33, 35, 37, 35, 33, 31, 33, 35, 37, 35, 33, 31, 33, 35, 37, 35, 33, 31, 33, 35],
    towns: [{ id: 'mkn-wote', name: 'Wote', countyId: 'makueni', coordinates: { lat: -1.7833, lng: 37.6333 }, population: 56419 }],
    weather: { countyId: 'makueni', temperature: 27, humidity: 45, rainfall24h: 3, forecast: [{ date: '2026-02-02', rainfall: 2, condition: 'sunny' }, { date: '2026-02-03', rainfall: 0, condition: 'sunny' }, { date: '2026-02-04', rainfall: 0, condition: 'sunny' }] }
  },
  {
    id: 'nyandarua', name: 'Nyandarua', waterAvailability: 78, waterStress: 38, population: 638289, recentRainfall: 72, riskLevel: 'stable',
    floodRisk: { countyId: 'nyandarua', riskLevel: 'low', probability: 15, affectedAreas: ['Kinangop plains'], precautions: ['Standard monitoring'] },
    waterSources: { reservoirs: 4, rivers: 5, boreholes: 85, kiosks: 120 },
    coordinates: { lat: -0.1804, lng: 36.5232 },
    trend: [76, 78, 80, 78, 76, 74, 76, 78, 80, 78, 76, 74, 76, 78, 80, 78, 76, 74, 76, 78, 80, 78, 76, 74, 76, 78, 80, 78, 76, 78],
    towns: [{ id: 'nyd-olkalou', name: 'Ol Kalou', countyId: 'nyandarua', coordinates: { lat: -0.2667, lng: 36.3833 }, population: 39622 }],
    weather: { countyId: 'nyandarua', temperature: 16, humidity: 72, rainfall24h: 18, forecast: [{ date: '2026-02-02', rainfall: 15, condition: 'rain' }, { date: '2026-02-03', rainfall: 10, condition: 'rain' }, { date: '2026-02-04', rainfall: 5, condition: 'cloudy' }] }
  },
  {
    id: 'muranga', name: "Murang'a", waterAvailability: 76, waterStress: 40, population: 1056640, recentRainfall: 68, riskLevel: 'stable',
    floodRisk: { countyId: 'muranga', riskLevel: 'low', probability: 18, affectedAreas: ['Mathioya River basin'], precautions: ['Monitor highland runoff'] },
    waterSources: { reservoirs: 4, rivers: 5, boreholes: 95, kiosks: 145 },
    coordinates: { lat: -0.7210, lng: 37.1526 },
    trend: [74, 76, 78, 76, 74, 72, 74, 76, 78, 76, 74, 72, 74, 76, 78, 76, 74, 72, 74, 76, 78, 76, 74, 72, 74, 76, 78, 76, 74, 76],
    towns: [{ id: 'mrg-muranga', name: "Murang'a Town", countyId: 'muranga', coordinates: { lat: -0.7210, lng: 37.1526 }, population: 305424 }],
    weather: { countyId: 'muranga', temperature: 20, humidity: 68, rainfall24h: 16, forecast: [{ date: '2026-02-02', rainfall: 14, condition: 'rain' }, { date: '2026-02-03', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 4, condition: 'cloudy' }] }
  },
  {
    id: 'kirinyaga', name: 'Kirinyaga', waterAvailability: 80, waterStress: 35, population: 610411, recentRainfall: 70, riskLevel: 'stable',
    floodRisk: { countyId: 'kirinyaga', riskLevel: 'low', probability: 15, affectedAreas: ['Mwea irrigation scheme'], precautions: ['Monitor canal levels'] },
    waterSources: { reservoirs: 5, rivers: 4, boreholes: 72, kiosks: 105 },
    coordinates: { lat: -0.4989, lng: 37.2803 },
    trend: [78, 80, 82, 80, 78, 76, 78, 80, 82, 80, 78, 76, 78, 80, 82, 80, 78, 76, 78, 80, 82, 80, 78, 76, 78, 80, 82, 80, 78, 80],
    towns: [{ id: 'kry-kerugoya', name: 'Kerugoya', countyId: 'kirinyaga', coordinates: { lat: -0.4989, lng: 37.2803 }, population: 24316 }],
    weather: { countyId: 'kirinyaga', temperature: 21, humidity: 66, rainfall24h: 15, forecast: [{ date: '2026-02-02', rainfall: 12, condition: 'rain' }, { date: '2026-02-03', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 3, condition: 'cloudy' }] }
  },
  {
    id: 'laikipia', name: 'Laikipia', waterAvailability: 55, waterStress: 58, population: 518560, recentRainfall: 40, riskLevel: 'moderate',
    floodRisk: { countyId: 'laikipia', riskLevel: 'low', probability: 10, affectedAreas: ['Ewaso Nyiro basin'], precautions: ['Wildlife corridor water points'] },
    waterSources: { reservoirs: 2, rivers: 3, boreholes: 65, kiosks: 85 },
    coordinates: { lat: 0.0600, lng: 36.7800 },
    trend: [53, 55, 57, 55, 53, 51, 53, 55, 57, 55, 53, 51, 53, 55, 57, 55, 53, 51, 53, 55, 57, 55, 53, 51, 53, 55, 57, 55, 53, 55],
    towns: [{ id: 'lkp-nanyuki', name: 'Nanyuki', countyId: 'laikipia', coordinates: { lat: 0.0167, lng: 37.0667 }, population: 47679 }],
    weather: { countyId: 'laikipia', temperature: 22, humidity: 55, rainfall24h: 8, forecast: [{ date: '2026-02-02', rainfall: 6, condition: 'cloudy' }, { date: '2026-02-03', rainfall: 3, condition: 'sunny' }, { date: '2026-02-04', rainfall: 0, condition: 'sunny' }] }
  },
  {
    id: 'samburu', name: 'Samburu', waterAvailability: 24, waterStress: 88, population: 310327, recentRainfall: 8, riskLevel: 'severe',
    floodRisk: { countyId: 'samburu', riskLevel: 'low', probability: 5, affectedAreas: [], precautions: ['Drought preparedness'] },
    waterSources: { reservoirs: 0, rivers: 1, boreholes: 28, kiosks: 35 },
    coordinates: { lat: 1.2667, lng: 36.9000 },
    trend: [26, 24, 22, 20, 22, 24, 26, 24, 22, 20, 22, 24, 26, 24, 22, 20, 22, 24, 26, 24, 22, 20, 22, 24, 26, 24, 22, 20, 22, 24],
    towns: [{ id: 'smb-maralal', name: 'Maralal', countyId: 'samburu', coordinates: { lat: 1.1000, lng: 36.7000 }, population: 20606 }],
    weather: { countyId: 'samburu', temperature: 30, humidity: 28, rainfall24h: 0, forecast: [{ date: '2026-02-02', rainfall: 0, condition: 'sunny' }, { date: '2026-02-03', rainfall: 0, condition: 'sunny' }, { date: '2026-02-04', rainfall: 0, condition: 'sunny' }] }
  },
  {
    id: 'trans_nzoia', name: 'Trans Nzoia', waterAvailability: 80, waterStress: 38, population: 990341, recentRainfall: 75, riskLevel: 'stable',
    floodRisk: { countyId: 'trans_nzoia', riskLevel: 'moderate', probability: 35, affectedAreas: ['Kitale lowlands'], precautions: ['Monitor Nzoia River'] },
    waterSources: { reservoirs: 4, rivers: 5, boreholes: 95, kiosks: 140 },
    coordinates: { lat: 1.0567, lng: 34.9507 },
    trend: [78, 80, 82, 80, 78, 76, 78, 80, 82, 80, 78, 76, 78, 80, 82, 80, 78, 76, 78, 80, 82, 80, 78, 76, 78, 80, 82, 80, 78, 80],
    towns: [{ id: 'tnz-kitale', name: 'Kitale', countyId: 'trans_nzoia', coordinates: { lat: 1.0187, lng: 35.0020 }, population: 106187 }],
    weather: { countyId: 'trans_nzoia', temperature: 22, humidity: 70, rainfall24h: 20, forecast: [{ date: '2026-02-02', rainfall: 18, condition: 'rain' }, { date: '2026-02-03', rainfall: 12, condition: 'rain' }, { date: '2026-02-04', rainfall: 5, condition: 'cloudy' }] }
  },
  {
    id: 'baringo', name: 'Baringo', waterAvailability: 45, waterStress: 62, population: 666763, recentRainfall: 35, riskLevel: 'moderate',
    floodRisk: { countyId: 'baringo', riskLevel: 'moderate', probability: 30, affectedAreas: ['Lake Baringo shores', 'Marigat'], precautions: ['Monitor lake levels'] },
    waterSources: { reservoirs: 2, rivers: 3, boreholes: 55, kiosks: 75 },
    coordinates: { lat: 0.4667, lng: 35.9667 },
    trend: [43, 45, 47, 45, 43, 41, 43, 45, 47, 45, 43, 41, 43, 45, 47, 45, 43, 41, 43, 45, 47, 45, 43, 41, 43, 45, 47, 45, 43, 45],
    towns: [{ id: 'brg-kabarnet', name: 'Kabarnet', countyId: 'baringo', coordinates: { lat: 0.4918, lng: 35.7430 }, population: 26057 }],
    weather: { countyId: 'baringo', temperature: 26, humidity: 50, rainfall24h: 6, forecast: [{ date: '2026-02-02', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-03', rainfall: 3, condition: 'sunny' }, { date: '2026-02-04', rainfall: 0, condition: 'sunny' }] }
  },
  {
    id: 'elgeyo_marakwet', name: 'Elgeyo Marakwet', waterAvailability: 72, waterStress: 42, population: 454480, recentRainfall: 62, riskLevel: 'stable',
    floodRisk: { countyId: 'elgeyo_marakwet', riskLevel: 'moderate', probability: 28, affectedAreas: ['Kerio Valley'], precautions: ['Monitor Kerio River'] },
    waterSources: { reservoirs: 3, rivers: 4, boreholes: 58, kiosks: 80 },
    coordinates: { lat: 0.6833, lng: 35.5167 },
    trend: [70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 72],
    towns: [{ id: 'em-iten', name: 'Iten', countyId: 'elgeyo_marakwet', coordinates: { lat: 0.6667, lng: 35.5000 }, population: 22855 }],
    weather: { countyId: 'elgeyo_marakwet', temperature: 18, humidity: 65, rainfall24h: 15, forecast: [{ date: '2026-02-02', rainfall: 12, condition: 'rain' }, { date: '2026-02-03', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 3, condition: 'cloudy' }] }
  },
  {
    id: 'nandi', name: 'Nandi', waterAvailability: 76, waterStress: 40, population: 885711, recentRainfall: 68, riskLevel: 'stable',
    floodRisk: { countyId: 'nandi', riskLevel: 'low', probability: 15, affectedAreas: ['Nandi Hills lowlands'], precautions: ['Standard monitoring'] },
    waterSources: { reservoirs: 3, rivers: 4, boreholes: 78, kiosks: 110 },
    coordinates: { lat: 0.1833, lng: 35.1500 },
    trend: [74, 76, 78, 76, 74, 72, 74, 76, 78, 76, 74, 72, 74, 76, 78, 76, 74, 72, 74, 76, 78, 76, 74, 72, 74, 76, 78, 76, 74, 76],
    towns: [{ id: 'nnd-kapsabet', name: 'Kapsabet', countyId: 'nandi', coordinates: { lat: 0.2000, lng: 35.1000 }, population: 86803 }],
    weather: { countyId: 'nandi', temperature: 20, humidity: 68, rainfall24h: 16, forecast: [{ date: '2026-02-02', rainfall: 14, condition: 'rain' }, { date: '2026-02-03', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 3, condition: 'cloudy' }] }
  },
  {
    id: 'west_pokot', name: 'West Pokot', waterAvailability: 35, waterStress: 72, population: 621241, recentRainfall: 25, riskLevel: 'severe',
    floodRisk: { countyId: 'west_pokot', riskLevel: 'moderate', probability: 30, affectedAreas: ['Wei Wei Valley'], precautions: ['Landslide awareness', 'Monitor rivers'] },
    waterSources: { reservoirs: 1, rivers: 2, boreholes: 35, kiosks: 50 },
    coordinates: { lat: 1.6167, lng: 35.2333 },
    trend: [37, 35, 33, 31, 33, 35, 37, 35, 33, 31, 33, 35, 37, 35, 33, 31, 33, 35, 37, 35, 33, 31, 33, 35, 37, 35, 33, 31, 33, 35],
    towns: [{ id: 'wp-kapenguria', name: 'Kapenguria', countyId: 'west_pokot', coordinates: { lat: 1.2389, lng: 35.1117 }, population: 25274 }],
    weather: { countyId: 'west_pokot', temperature: 24, humidity: 50, rainfall24h: 5, forecast: [{ date: '2026-02-02', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-03', rainfall: 3, condition: 'sunny' }, { date: '2026-02-04', rainfall: 0, condition: 'sunny' }] }
  },
  {
    id: 'kericho', name: 'Kericho', waterAvailability: 82, waterStress: 32, population: 901777, recentRainfall: 80, riskLevel: 'stable',
    floodRisk: { countyId: 'kericho', riskLevel: 'low', probability: 12, affectedAreas: ['Tea plantation valleys'], precautions: ['Standard monitoring'] },
    waterSources: { reservoirs: 4, rivers: 5, boreholes: 85, kiosks: 125 },
    coordinates: { lat: -0.3689, lng: 35.2863 },
    trend: [80, 82, 84, 82, 80, 78, 80, 82, 84, 82, 80, 78, 80, 82, 84, 82, 80, 78, 80, 82, 84, 82, 80, 78, 80, 82, 84, 82, 80, 82],
    towns: [{ id: 'krc-kericho', name: 'Kericho Town', countyId: 'kericho', coordinates: { lat: -0.3689, lng: 35.2863 }, population: 150817 }],
    weather: { countyId: 'kericho', temperature: 19, humidity: 75, rainfall24h: 22, forecast: [{ date: '2026-02-02', rainfall: 20, condition: 'rain' }, { date: '2026-02-03', rainfall: 15, condition: 'rain' }, { date: '2026-02-04', rainfall: 8, condition: 'cloudy' }] }
  },
  {
    id: 'bomet', name: 'Bomet', waterAvailability: 70, waterStress: 45, population: 875689, recentRainfall: 62, riskLevel: 'moderate',
    floodRisk: { countyId: 'bomet', riskLevel: 'low', probability: 15, affectedAreas: ['Sotik lowlands'], precautions: ['Standard monitoring'] },
    waterSources: { reservoirs: 3, rivers: 4, boreholes: 72, kiosks: 100 },
    coordinates: { lat: -0.7813, lng: 35.3419 },
    trend: [68, 70, 72, 70, 68, 66, 68, 70, 72, 70, 68, 66, 68, 70, 72, 70, 68, 66, 68, 70, 72, 70, 68, 66, 68, 70, 72, 70, 68, 70],
    towns: [{ id: 'bmt-bomet', name: 'Bomet Town', countyId: 'bomet', coordinates: { lat: -0.7813, lng: 35.3419 }, population: 27135 }],
    weather: { countyId: 'bomet', temperature: 20, humidity: 68, rainfall24h: 14, forecast: [{ date: '2026-02-02', rainfall: 12, condition: 'rain' }, { date: '2026-02-03', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 3, condition: 'cloudy' }] }
  },
  {
    id: 'bungoma', name: 'Bungoma', waterAvailability: 75, waterStress: 42, population: 1670570, recentRainfall: 72, riskLevel: 'stable',
    floodRisk: { countyId: 'bungoma', riskLevel: 'moderate', probability: 35, affectedAreas: ['Nzoia River basin'], precautions: ['Monitor river levels', 'Avoid flood plains'] },
    waterSources: { reservoirs: 4, rivers: 5, boreholes: 98, kiosks: 145 },
    coordinates: { lat: 0.5635, lng: 34.5607 },
    trend: [73, 75, 77, 75, 73, 71, 73, 75, 77, 75, 73, 71, 73, 75, 77, 75, 73, 71, 73, 75, 77, 75, 73, 71, 73, 75, 77, 75, 73, 75],
    towns: [{ id: 'bgm-bungoma', name: 'Bungoma Town', countyId: 'bungoma', coordinates: { lat: 0.5635, lng: 34.5607 }, population: 73527 }],
    weather: { countyId: 'bungoma', temperature: 23, humidity: 72, rainfall24h: 18, forecast: [{ date: '2026-02-02', rainfall: 20, condition: 'rain' }, { date: '2026-02-03', rainfall: 12, condition: 'rain' }, { date: '2026-02-04', rainfall: 5, condition: 'cloudy' }] }
  },
  {
    id: 'busia', name: 'Busia', waterAvailability: 72, waterStress: 45, population: 893681, recentRainfall: 68, riskLevel: 'moderate',
    floodRisk: { countyId: 'busia', riskLevel: 'high', probability: 55, affectedAreas: ['Budalangi', 'Nzoia River delta'], precautions: ['Evacuate Budalangi during floods', 'Stock emergency supplies'] },
    waterSources: { reservoirs: 2, rivers: 4, boreholes: 68, kiosks: 95 },
    coordinates: { lat: 0.4608, lng: 34.1108 },
    trend: [70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 72],
    towns: [{ id: 'bsa-busia', name: 'Busia Town', countyId: 'busia', coordinates: { lat: 0.4608, lng: 34.1108 }, population: 52105 }],
    weather: { countyId: 'busia', temperature: 25, humidity: 74, rainfall24h: 16, forecast: [{ date: '2026-02-02', rainfall: 18, condition: 'rain' }, { date: '2026-02-03', rainfall: 12, condition: 'rain' }, { date: '2026-02-04', rainfall: 5, condition: 'cloudy' }] }
  },
  {
    id: 'vihiga', name: 'Vihiga', waterAvailability: 70, waterStress: 48, population: 590013, recentRainfall: 72, riskLevel: 'moderate',
    floodRisk: { countyId: 'vihiga', riskLevel: 'moderate', probability: 30, affectedAreas: ['Maragoli lowlands'], precautions: ['Drain farmland channels'] },
    waterSources: { reservoirs: 2, rivers: 3, boreholes: 55, kiosks: 78 },
    coordinates: { lat: 0.0833, lng: 34.7333 },
    trend: [68, 70, 72, 70, 68, 66, 68, 70, 72, 70, 68, 66, 68, 70, 72, 70, 68, 66, 68, 70, 72, 70, 68, 66, 68, 70, 72, 70, 68, 70],
    towns: [{ id: 'vhg-mbale', name: 'Mbale', countyId: 'vihiga', coordinates: { lat: 0.0833, lng: 34.7333 }, population: 91616 }],
    weather: { countyId: 'vihiga', temperature: 22, humidity: 72, rainfall24h: 18, forecast: [{ date: '2026-02-02', rainfall: 16, condition: 'rain' }, { date: '2026-02-03', rainfall: 10, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 4, condition: 'cloudy' }] }
  },
  {
    id: 'homa_bay', name: 'Homa Bay', waterAvailability: 65, waterStress: 50, population: 1131950, recentRainfall: 60, riskLevel: 'moderate',
    floodRisk: { countyId: 'homa_bay', riskLevel: 'moderate', probability: 35, affectedAreas: ['Lake Victoria shores', 'Homa Bay town'], precautions: ['Monitor lake levels'] },
    waterSources: { reservoirs: 2, rivers: 3, boreholes: 65, kiosks: 90 },
    coordinates: { lat: -0.5273, lng: 34.4571 },
    trend: [63, 65, 67, 65, 63, 61, 63, 65, 67, 65, 63, 61, 63, 65, 67, 65, 63, 61, 63, 65, 67, 65, 63, 61, 63, 65, 67, 65, 63, 65],
    towns: [{ id: 'hb-homabay', name: 'Homa Bay Town', countyId: 'homa_bay', coordinates: { lat: -0.5273, lng: 34.4571 }, population: 55532 }],
    weather: { countyId: 'homa_bay', temperature: 26, humidity: 70, rainfall24h: 14, forecast: [{ date: '2026-02-02', rainfall: 16, condition: 'rain' }, { date: '2026-02-03', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 3, condition: 'cloudy' }] }
  },
  {
    id: 'migori', name: 'Migori', waterAvailability: 62, waterStress: 52, population: 1116436, recentRainfall: 58, riskLevel: 'moderate',
    floodRisk: { countyId: 'migori', riskLevel: 'moderate', probability: 32, affectedAreas: ['Migori River basin'], precautions: ['Monitor river crossings'] },
    waterSources: { reservoirs: 2, rivers: 4, boreholes: 62, kiosks: 85 },
    coordinates: { lat: -1.0634, lng: 34.4731 },
    trend: [60, 62, 64, 62, 60, 58, 60, 62, 64, 62, 60, 58, 60, 62, 64, 62, 60, 58, 60, 62, 64, 62, 60, 58, 60, 62, 64, 62, 60, 62],
    towns: [{ id: 'mgr-migori', name: 'Migori Town', countyId: 'migori', coordinates: { lat: -1.0634, lng: 34.4731 }, population: 66730 }],
    weather: { countyId: 'migori', temperature: 25, humidity: 68, rainfall24h: 12, forecast: [{ date: '2026-02-02', rainfall: 14, condition: 'rain' }, { date: '2026-02-03', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 3, condition: 'cloudy' }] }
  },
  {
    id: 'kisii', name: 'Kisii', waterAvailability: 74, waterStress: 42, population: 1266860, recentRainfall: 72, riskLevel: 'stable',
    floodRisk: { countyId: 'kisii', riskLevel: 'low', probability: 15, affectedAreas: ['Gucha River basin'], precautions: ['Standard monitoring'] },
    waterSources: { reservoirs: 3, rivers: 4, boreholes: 82, kiosks: 120 },
    coordinates: { lat: -0.6817, lng: 34.7667 },
    trend: [72, 74, 76, 74, 72, 70, 72, 74, 76, 74, 72, 70, 72, 74, 76, 74, 72, 70, 72, 74, 76, 74, 72, 70, 72, 74, 76, 74, 72, 74],
    towns: [{ id: 'ksi-kisii', name: 'Kisii Town', countyId: 'kisii', coordinates: { lat: -0.6817, lng: 34.7667 }, population: 112417 }],
    weather: { countyId: 'kisii', temperature: 21, humidity: 72, rainfall24h: 18, forecast: [{ date: '2026-02-02', rainfall: 16, condition: 'rain' }, { date: '2026-02-03', rainfall: 10, condition: 'rain' }, { date: '2026-02-04', rainfall: 5, condition: 'cloudy' }] }
  },
  {
    id: 'nyamira', name: 'Nyamira', waterAvailability: 72, waterStress: 44, population: 605576, recentRainfall: 70, riskLevel: 'stable',
    floodRisk: { countyId: 'nyamira', riskLevel: 'low', probability: 12, affectedAreas: ['Sondu River basin'], precautions: ['Standard monitoring'] },
    waterSources: { reservoirs: 2, rivers: 3, boreholes: 58, kiosks: 82 },
    coordinates: { lat: -0.5633, lng: 34.9333 },
    trend: [70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 68, 70, 72, 74, 72, 70, 72],
    towns: [{ id: 'nym-nyamira', name: 'Nyamira Town', countyId: 'nyamira', coordinates: { lat: -0.5633, lng: 34.9333 }, population: 36895 }],
    weather: { countyId: 'nyamira', temperature: 20, humidity: 70, rainfall24h: 16, forecast: [{ date: '2026-02-02', rainfall: 14, condition: 'rain' }, { date: '2026-02-03', rainfall: 8, condition: 'cloudy' }, { date: '2026-02-04', rainfall: 4, condition: 'cloudy' }] }
  },
  {
    id: 'narok', name: 'Narok', waterAvailability: 50, waterStress: 58, population: 1157873, recentRainfall: 42, riskLevel: 'moderate',
    floodRisk: { countyId: 'narok', riskLevel: 'moderate', probability: 28, affectedAreas: ['Mara River basin', 'Narok Town'], precautions: ['Monitor Mara River', 'Avoid low crossings'] },
    waterSources: { reservoirs: 2, rivers: 4, boreholes: 65, kiosks: 88 },
    coordinates: { lat: -1.0873, lng: 35.8600 },
    trend: [48, 50, 52, 50, 48, 46, 48, 50, 52, 50, 48, 46, 48, 50, 52, 50, 48, 46, 48, 50, 52, 50, 48, 46, 48, 50, 52, 50, 48, 50],
    towns: [{ id: 'nrk-narok', name: 'Narok Town', countyId: 'narok', coordinates: { lat: -1.0873, lng: 35.8600 }, population: 68789 }],
    weather: { countyId: 'narok', temperature: 22, humidity: 55, rainfall24h: 8, forecast: [{ date: '2026-02-02', rainfall: 10, condition: 'cloudy' }, { date: '2026-02-03', rainfall: 5, condition: 'sunny' }, { date: '2026-02-04', rainfall: 2, condition: 'sunny' }] }
  },
];

// Generate data-driven notifications from actual county metrics
export const generateNotifications = (userCountyId?: string): Notification[] => {
  const now = new Date();
  const notifications: Notification[] = [];
  let notifIndex = 0;

  // 1. Critical flood alerts — counties with high/critical flood risk AND heavy rainfall
  kenyaCounties
    .filter(c => (c.floodRisk.riskLevel === 'high' || c.floodRisk.riskLevel === 'critical') && c.weather.rainfall24h >= 25)
    .sort((a, b) => b.floodRisk.probability - a.floodRisk.probability)
    .slice(0, 3)
    .forEach(c => {
      notifications.push({
        id: `notif-flood-${notifIndex++}`,
        type: 'flood_alert',
        severity: c.floodRisk.riskLevel === 'critical' ? 'critical' : 'warning',
        title: `Flood ${c.floodRisk.riskLevel === 'critical' ? 'Warning' : 'Watch'}: ${c.name}`,
        message: `${c.weather.rainfall24h}mm rainfall recorded in 24h (${c.weather.rainfall24h >= 50 ? 'heavy' : 'moderate'}). ${c.floodRisk.probability}% flood probability. Affected areas: ${c.floodRisk.affectedAreas.slice(0, 3).join(', ')}. ${c.floodRisk.precautions[0] || 'Take precautions.'}`,
        countyId: c.id,
        timestamp: new Date(now.getTime() - notifIndex * 45 * 60000),
        read: false,
      });
    });

  // 2. Severe water scarcity — counties with water availability < 30% or stress > 85
  kenyaCounties
    .filter(c => c.waterAvailability < 30 || c.waterStress > 85)
    .sort((a, b) => a.waterAvailability - b.waterAvailability)
    .slice(0, 3)
    .forEach(c => {
      notifications.push({
        id: `notif-water-${notifIndex++}`,
        type: 'water_scarcity',
        severity: c.waterAvailability < 25 ? 'critical' : 'warning',
        title: `Water ${c.waterAvailability < 25 ? 'Crisis' : 'Shortage'}: ${c.name}`,
        message: `Water availability at ${c.waterAvailability}%, stress level ${c.waterStress}/100. Recent rainfall: ${c.recentRainfall}mm. ${c.waterSources.boreholes} boreholes serving ${(c.population / 1000).toFixed(0)}K people. Ration water and seek alternative sources.`,
        countyId: c.id,
        timestamp: new Date(now.getTime() - notifIndex * 60 * 60000),
        read: false,
      });
    });

  // 3. Weather alerts — counties expecting heavy rain in forecast
  kenyaCounties
    .filter(c => c.weather.forecast.some(f => f.condition === 'heavy_rain' || f.condition === 'storm'))
    .slice(0, 2)
    .forEach(c => {
      const heavyDay = c.weather.forecast.find(f => f.condition === 'heavy_rain' || f.condition === 'storm');
      if (heavyDay) {
        notifications.push({
          id: `notif-weather-${notifIndex++}`,
          type: 'weather_alert',
          severity: heavyDay.condition === 'storm' ? 'critical' : 'warning',
          title: `${heavyDay.condition === 'storm' ? 'Storm' : 'Heavy Rain'} Alert: ${c.name}`,
          message: `${heavyDay.rainfall}mm rainfall expected on ${heavyDay.date}. Current humidity: ${c.weather.humidity}%. ${c.floodRisk.riskLevel !== 'low' ? `Combined with existing ${c.floodRisk.riskLevel} flood risk, exercise extreme caution.` : 'Monitor drainage and avoid low-lying areas.'}`,
          countyId: c.id,
          timestamp: new Date(now.getTime() - notifIndex * 90 * 60000),
          read: false,
        });
      }
    });

  // 4. Daily national summary
  const stats = getNationalStats();
  notifications.push({
    id: `notif-daily-${notifIndex++}`,
    type: 'daily_insight',
    severity: 'info',
    title: 'Daily National Water Report',
    message: `Avg. water availability: ${stats.avgWaterAvailability}% across ${stats.totalCounties} counties. ${stats.severeCount} counties under severe stress. ${stats.highFloodRisk} active flood warnings. Avg. rainfall: ${stats.avgRainfall}mm.`,
    countyId: 'national',
    timestamp: new Date(now.getTime() - 12 * 3600000),
    read: true,
  });

  // 5. User-specific county notification (prioritized at top)
  if (userCountyId) {
    const uc = kenyaCounties.find(c => c.id === userCountyId);
    if (uc) {
      const floodWarning = uc.floodRisk.riskLevel !== 'low'
        ? ` ⚠️ Flood risk: ${uc.floodRisk.riskLevel.toUpperCase()} (${uc.floodRisk.probability}% probability). Affected: ${uc.floodRisk.affectedAreas.slice(0, 2).join(', ')}.`
        : ' No flood warnings.';
      const rainfallForecast = uc.weather.forecast[0]
        ? ` Tomorrow: ${uc.weather.forecast[0].rainfall}mm ${uc.weather.forecast[0].condition.replace('_', ' ')}.`
        : '';

      notifications.unshift({
        id: 'notif-user-county',
        type: 'daily_insight',
        severity: uc.riskLevel === 'severe' ? 'warning' : 'info',
        title: `${uc.name} County Update`,
        message: `Water: ${uc.waterAvailability}% (stress: ${uc.waterStress}/100). 24h rainfall: ${uc.weather.rainfall24h}mm, ${uc.weather.temperature}°C, humidity ${uc.weather.humidity}%.${floodWarning}${rainfallForecast}`,
        countyId: userCountyId,
        timestamp: now,
        read: false,
      });
    }
  }

  return notifications;
};

export const getCountyByCoordinates = (lat: number, lng: number): CountyData | null => {
  let closest: CountyData | null = null;
  let minDistance = Infinity;

  for (const county of kenyaCounties) {
    const distance = Math.sqrt(
      Math.pow(county.coordinates.lat - lat, 2) + 
      Math.pow(county.coordinates.lng - lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = county;
    }
  }

  return closest;
};

export const getTownByCoordinates = (lat: number, lng: number): Town | null => {
  let closest: Town | null = null;
  let minDistance = Infinity;

  for (const county of kenyaCounties) {
    for (const town of county.towns) {
      const distance = Math.sqrt(
        Math.pow(town.coordinates.lat - lat, 2) + 
        Math.pow(town.coordinates.lng - lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = town;
      }
    }
  }

  return closest;
};

export const getNationalStats = () => {
  const totalPopulation = kenyaCounties.reduce((sum, c) => sum + c.population, 0);
  const avgWaterAvailability = kenyaCounties.reduce((sum, c) => sum + c.waterAvailability, 0) / kenyaCounties.length;
  const avgWaterStress = kenyaCounties.reduce((sum, c) => sum + c.waterStress, 0) / kenyaCounties.length;
  const avgRainfall = kenyaCounties.reduce((sum, c) => sum + c.recentRainfall, 0) / kenyaCounties.length;
  
  const severeCount = kenyaCounties.filter(c => c.riskLevel === 'severe').length;
  const moderateCount = kenyaCounties.filter(c => c.riskLevel === 'moderate').length;
  const stableCount = kenyaCounties.filter(c => c.riskLevel === 'stable').length;
  
  const highFloodRisk = kenyaCounties.filter(c => c.floodRisk.riskLevel === 'high' || c.floodRisk.riskLevel === 'critical').length;

  return {
    totalPopulation,
    avgWaterAvailability: Math.round(avgWaterAvailability),
    avgWaterStress: Math.round(avgWaterStress),
    avgRainfall: Math.round(avgRainfall),
    severeCount,
    moderateCount,
    stableCount,
    highFloodRisk,
    totalCounties: kenyaCounties.length
  };
};

export const getWaterSourcesByCounty = (countyId: string): WaterSource[] => {
  return waterSources.filter(ws => ws.countyId === countyId);
};
