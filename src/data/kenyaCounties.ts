export interface CountyData {
  id: string;
  name: string;
  waterAvailability: number; // 0-100%
  waterStress: number; // 0-100
  population: number;
  recentRainfall: number; // mm
  riskLevel: 'stable' | 'moderate' | 'severe';
  waterSources: {
    reservoirs: number;
    rivers: number;
    boreholes: number;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  trend: number[]; // 30-day history
}

export const kenyaCounties: CountyData[] = [
  {
    id: 'nairobi',
    name: 'Nairobi',
    waterAvailability: 65,
    waterStress: 72,
    population: 4397073,
    recentRainfall: 45,
    riskLevel: 'moderate',
    waterSources: { reservoirs: 3, rivers: 2, boreholes: 156 },
    coordinates: { lat: -1.2921, lng: 36.8219 },
    trend: [60, 62, 58, 55, 60, 63, 65, 62, 58, 61, 64, 66, 63, 60, 58, 62, 65, 67, 64, 61, 59, 63, 66, 68, 65, 62, 60, 64, 67, 65]
  },
  {
    id: 'mombasa',
    name: 'Mombasa',
    waterAvailability: 55,
    waterStress: 78,
    population: 1208333,
    recentRainfall: 32,
    riskLevel: 'severe',
    waterSources: { reservoirs: 1, rivers: 0, boreholes: 89 },
    coordinates: { lat: -4.0435, lng: 39.6682 },
    trend: [58, 55, 52, 50, 48, 52, 55, 53, 50, 48, 52, 55, 58, 55, 52, 50, 53, 56, 54, 51, 49, 52, 55, 57, 54, 51, 49, 53, 56, 55]
  },
  {
    id: 'kisumu',
    name: 'Kisumu',
    waterAvailability: 82,
    waterStress: 35,
    population: 1155574,
    recentRainfall: 78,
    riskLevel: 'stable',
    waterSources: { reservoirs: 5, rivers: 4, boreholes: 67 },
    coordinates: { lat: -0.1022, lng: 34.7617 },
    trend: [78, 80, 82, 85, 83, 81, 79, 82, 84, 86, 83, 80, 78, 81, 83, 85, 82, 79, 77, 80, 82, 84, 81, 78, 76, 79, 81, 83, 80, 82]
  },
  {
    id: 'nakuru',
    name: 'Nakuru',
    waterAvailability: 70,
    waterStress: 55,
    population: 2162202,
    recentRainfall: 55,
    riskLevel: 'moderate',
    waterSources: { reservoirs: 4, rivers: 3, boreholes: 112 },
    coordinates: { lat: -0.3031, lng: 36.0800 },
    trend: [65, 68, 70, 72, 69, 66, 64, 67, 70, 72, 69, 66, 64, 67, 70, 73, 70, 67, 65, 68, 71, 73, 70, 67, 65, 68, 71, 73, 70, 70]
  },
  {
    id: 'turkana',
    name: 'Turkana',
    waterAvailability: 22,
    waterStress: 95,
    population: 926976,
    recentRainfall: 8,
    riskLevel: 'severe',
    waterSources: { reservoirs: 0, rivers: 1, boreholes: 23 },
    coordinates: { lat: 3.1166, lng: 35.5966 },
    trend: [25, 23, 20, 18, 16, 18, 21, 23, 20, 17, 15, 18, 21, 24, 21, 18, 16, 19, 22, 24, 21, 18, 16, 19, 22, 25, 22, 19, 17, 22]
  },
  {
    id: 'kiambu',
    name: 'Kiambu',
    waterAvailability: 75,
    waterStress: 48,
    population: 2417735,
    recentRainfall: 62,
    riskLevel: 'stable',
    waterSources: { reservoirs: 6, rivers: 5, boreholes: 178 },
    coordinates: { lat: -1.1714, lng: 36.8356 },
    trend: [70, 72, 75, 77, 74, 71, 69, 72, 75, 78, 75, 72, 70, 73, 76, 78, 75, 72, 70, 73, 76, 79, 76, 73, 71, 74, 77, 79, 76, 75]
  },
  {
    id: 'machakos',
    name: 'Machakos',
    waterAvailability: 45,
    waterStress: 68,
    population: 1421932,
    recentRainfall: 28,
    riskLevel: 'moderate',
    waterSources: { reservoirs: 2, rivers: 2, boreholes: 95 },
    coordinates: { lat: -1.5177, lng: 37.2634 },
    trend: [48, 46, 43, 40, 42, 45, 48, 45, 42, 39, 42, 45, 48, 45, 42, 39, 42, 45, 48, 46, 43, 40, 43, 46, 49, 46, 43, 41, 44, 45]
  },
  {
    id: 'kajiado',
    name: 'Kajiado',
    waterAvailability: 38,
    waterStress: 75,
    population: 1117840,
    recentRainfall: 22,
    riskLevel: 'severe',
    waterSources: { reservoirs: 1, rivers: 1, boreholes: 56 },
    coordinates: { lat: -1.8524, lng: 36.7820 },
    trend: [42, 40, 37, 34, 36, 39, 42, 39, 36, 33, 36, 39, 42, 39, 36, 33, 36, 39, 42, 40, 37, 34, 37, 40, 43, 40, 37, 35, 38, 38]
  },
  {
    id: 'uasingishu',
    name: 'Uasin Gishu',
    waterAvailability: 78,
    waterStress: 42,
    population: 1163186,
    recentRainfall: 70,
    riskLevel: 'stable',
    waterSources: { reservoirs: 4, rivers: 3, boreholes: 89 },
    coordinates: { lat: 0.5143, lng: 35.2698 },
    trend: [75, 77, 79, 81, 78, 75, 73, 76, 79, 82, 79, 76, 74, 77, 80, 82, 79, 76, 74, 77, 80, 83, 80, 77, 75, 78, 81, 83, 80, 78]
  },
  {
    id: 'meru',
    name: 'Meru',
    waterAvailability: 72,
    waterStress: 52,
    population: 1545714,
    recentRainfall: 58,
    riskLevel: 'stable',
    waterSources: { reservoirs: 3, rivers: 4, boreholes: 102 },
    coordinates: { lat: 0.0500, lng: 37.6500 },
    trend: [68, 70, 72, 74, 71, 68, 66, 69, 72, 75, 72, 69, 67, 70, 73, 75, 72, 69, 67, 70, 73, 76, 73, 70, 68, 71, 74, 76, 73, 72]
  },
  {
    id: 'kilifi',
    name: 'Kilifi',
    waterAvailability: 48,
    waterStress: 70,
    population: 1453787,
    recentRainfall: 35,
    riskLevel: 'moderate',
    waterSources: { reservoirs: 2, rivers: 2, boreholes: 78 },
    coordinates: { lat: -3.6305, lng: 39.8499 },
    trend: [50, 48, 45, 42, 44, 47, 50, 47, 44, 41, 44, 47, 50, 47, 44, 41, 44, 47, 50, 48, 45, 42, 45, 48, 51, 48, 45, 43, 46, 48]
  },
  {
    id: 'wajir',
    name: 'Wajir',
    waterAvailability: 18,
    waterStress: 92,
    population: 781263,
    recentRainfall: 5,
    riskLevel: 'severe',
    waterSources: { reservoirs: 0, rivers: 0, boreholes: 34 },
    coordinates: { lat: 1.7471, lng: 40.0573 },
    trend: [22, 20, 17, 14, 16, 19, 22, 19, 16, 13, 16, 19, 22, 19, 16, 13, 16, 19, 22, 20, 17, 14, 17, 20, 23, 20, 17, 15, 18, 18]
  },
  {
    id: 'mandera',
    name: 'Mandera',
    waterAvailability: 15,
    waterStress: 94,
    population: 867457,
    recentRainfall: 3,
    riskLevel: 'severe',
    waterSources: { reservoirs: 0, rivers: 1, boreholes: 28 },
    coordinates: { lat: 3.9366, lng: 41.8670 },
    trend: [18, 16, 13, 10, 12, 15, 18, 15, 12, 9, 12, 15, 18, 15, 12, 9, 12, 15, 18, 16, 13, 10, 13, 16, 19, 16, 13, 11, 14, 15]
  },
  {
    id: 'garissa',
    name: 'Garissa',
    waterAvailability: 25,
    waterStress: 88,
    population: 841353,
    recentRainfall: 10,
    riskLevel: 'severe',
    waterSources: { reservoirs: 0, rivers: 1, boreholes: 45 },
    coordinates: { lat: -0.4536, lng: 39.6401 },
    trend: [28, 26, 23, 20, 22, 25, 28, 25, 22, 19, 22, 25, 28, 25, 22, 19, 22, 25, 28, 26, 23, 20, 23, 26, 29, 26, 23, 21, 24, 25]
  },
  {
    id: 'nyeri',
    name: 'Nyeri',
    waterAvailability: 80,
    waterStress: 38,
    population: 759164,
    recentRainfall: 75,
    riskLevel: 'stable',
    waterSources: { reservoirs: 5, rivers: 5, boreholes: 89 },
    coordinates: { lat: -0.4197, lng: 36.9553 },
    trend: [76, 78, 80, 82, 79, 76, 74, 77, 80, 83, 80, 77, 75, 78, 81, 83, 80, 77, 75, 78, 81, 84, 81, 78, 76, 79, 82, 84, 81, 80]
  },
  {
    id: 'kakamega',
    name: 'Kakamega',
    waterAvailability: 85,
    waterStress: 30,
    population: 1867579,
    recentRainfall: 85,
    riskLevel: 'stable',
    waterSources: { reservoirs: 6, rivers: 7, boreholes: 134 },
    coordinates: { lat: 0.2827, lng: 34.7519 },
    trend: [82, 84, 86, 88, 85, 82, 80, 83, 86, 89, 86, 83, 81, 84, 87, 89, 86, 83, 81, 84, 87, 90, 87, 84, 82, 85, 88, 90, 87, 85]
  },
  {
    id: 'siaya',
    name: 'Siaya',
    waterAvailability: 68,
    waterStress: 45,
    population: 993183,
    recentRainfall: 65,
    riskLevel: 'moderate',
    waterSources: { reservoirs: 2, rivers: 5, boreholes: 78 },
    coordinates: { lat: 0.0607, lng: 34.2422 },
    trend: [64, 66, 68, 70, 67, 64, 62, 65, 68, 71, 68, 65, 63, 66, 69, 71, 68, 65, 63, 66, 69, 72, 69, 66, 64, 67, 70, 72, 69, 68]
  },
  // === REMAINING 30 COUNTIES ===
  { id: 'kwale', name: 'Kwale', waterAvailability: 42, waterStress: 72, population: 866820, recentRainfall: 30, riskLevel: 'moderate', waterSources: { reservoirs: 1, rivers: 2, boreholes: 56 }, coordinates: { lat: -4.1816, lng: 39.4606 }, trend: [44,42,40,38,40,42,44,42,40,38,40,42,44,42,40,38,40,42,44,42,40,38,40,42,44,42,40,38,40,42] },
  { id: 'taita_taveta', name: 'Taita Taveta', waterAvailability: 40, waterStress: 65, population: 340671, recentRainfall: 25, riskLevel: 'moderate', waterSources: { reservoirs: 2, rivers: 3, boreholes: 45 }, coordinates: { lat: -3.3961, lng: 38.3566 }, trend: [42,40,38,36,38,40,42,40,38,36,38,40,42,40,38,36,38,40,42,40,38,36,38,40,42,40,38,36,38,40] },
  { id: 'lamu', name: 'Lamu', waterAvailability: 50, waterStress: 60, population: 143920, recentRainfall: 28, riskLevel: 'moderate', waterSources: { reservoirs: 0, rivers: 1, boreholes: 25 }, coordinates: { lat: -2.2717, lng: 40.9020 }, trend: [52,50,48,46,48,50,52,50,48,46,48,50,52,50,48,46,48,50,52,50,48,46,48,50,52,50,48,46,48,50] },
  { id: 'tana_river', name: 'Tana River', waterAvailability: 30, waterStress: 80, population: 315943, recentRainfall: 12, riskLevel: 'severe', waterSources: { reservoirs: 0, rivers: 2, boreholes: 35 }, coordinates: { lat: -1.5019, lng: 39.9884 }, trend: [32,30,28,26,28,30,32,30,28,26,28,30,32,30,28,26,28,30,32,30,28,26,28,30,32,30,28,26,28,30] },
  { id: 'marsabit', name: 'Marsabit', waterAvailability: 20, waterStress: 90, population: 459785, recentRainfall: 6, riskLevel: 'severe', waterSources: { reservoirs: 0, rivers: 0, boreholes: 28 }, coordinates: { lat: 2.3284, lng: 37.9900 }, trend: [22,20,18,16,18,20,22,20,18,16,18,20,22,20,18,16,18,20,22,20,18,16,18,20,22,20,18,16,18,20] },
  { id: 'isiolo', name: 'Isiolo', waterAvailability: 28, waterStress: 82, population: 268002, recentRainfall: 10, riskLevel: 'severe', waterSources: { reservoirs: 0, rivers: 1, boreholes: 32 }, coordinates: { lat: 0.3546, lng: 37.5822 }, trend: [30,28,26,24,26,28,30,28,26,24,26,28,30,28,26,24,26,28,30,28,26,24,26,28,30,28,26,24,26,28] },
  { id: 'embu', name: 'Embu', waterAvailability: 74, waterStress: 45, population: 608599, recentRainfall: 60, riskLevel: 'stable', waterSources: { reservoirs: 3, rivers: 4, boreholes: 78 }, coordinates: { lat: -0.5389, lng: 37.4596 }, trend: [72,74,76,74,72,70,72,74,76,74,72,70,72,74,76,74,72,70,72,74,76,74,72,70,72,74,76,74,72,74] },
  { id: 'tharaka_nithi', name: 'Tharaka Nithi', waterAvailability: 62, waterStress: 50, population: 393177, recentRainfall: 48, riskLevel: 'moderate', waterSources: { reservoirs: 2, rivers: 3, boreholes: 56 }, coordinates: { lat: -0.3044, lng: 37.8497 }, trend: [60,62,64,62,60,58,60,62,64,62,60,58,60,62,64,62,60,58,60,62,64,62,60,58,60,62,64,62,60,62] },
  { id: 'kitui', name: 'Kitui', waterAvailability: 32, waterStress: 78, population: 1136187, recentRainfall: 18, riskLevel: 'severe', waterSources: { reservoirs: 1, rivers: 2, boreholes: 68 }, coordinates: { lat: -1.3667, lng: 38.0106 }, trend: [34,32,30,28,30,32,34,32,30,28,30,32,34,32,30,28,30,32,34,32,30,28,30,32,34,32,30,28,30,32] },
  { id: 'makueni', name: 'Makueni', waterAvailability: 35, waterStress: 74, population: 987653, recentRainfall: 20, riskLevel: 'severe', waterSources: { reservoirs: 2, rivers: 2, boreholes: 72 }, coordinates: { lat: -1.8039, lng: 37.6200 }, trend: [37,35,33,31,33,35,37,35,33,31,33,35,37,35,33,31,33,35,37,35,33,31,33,35,37,35,33,31,33,35] },
  { id: 'nyandarua', name: 'Nyandarua', waterAvailability: 78, waterStress: 38, population: 638289, recentRainfall: 72, riskLevel: 'stable', waterSources: { reservoirs: 4, rivers: 5, boreholes: 85 }, coordinates: { lat: -0.1804, lng: 36.5232 }, trend: [76,78,80,78,76,74,76,78,80,78,76,74,76,78,80,78,76,74,76,78,80,78,76,74,76,78,80,78,76,78] },
  { id: 'muranga', name: "Murang'a", waterAvailability: 76, waterStress: 40, population: 1056640, recentRainfall: 68, riskLevel: 'stable', waterSources: { reservoirs: 4, rivers: 5, boreholes: 95 }, coordinates: { lat: -0.7210, lng: 37.1526 }, trend: [74,76,78,76,74,72,74,76,78,76,74,72,74,76,78,76,74,72,74,76,78,76,74,72,74,76,78,76,74,76] },
  { id: 'kirinyaga', name: 'Kirinyaga', waterAvailability: 80, waterStress: 35, population: 610411, recentRainfall: 70, riskLevel: 'stable', waterSources: { reservoirs: 5, rivers: 4, boreholes: 72 }, coordinates: { lat: -0.4989, lng: 37.2803 }, trend: [78,80,82,80,78,76,78,80,82,80,78,76,78,80,82,80,78,76,78,80,82,80,78,76,78,80,82,80,78,80] },
  { id: 'laikipia', name: 'Laikipia', waterAvailability: 55, waterStress: 58, population: 518560, recentRainfall: 40, riskLevel: 'moderate', waterSources: { reservoirs: 2, rivers: 3, boreholes: 65 }, coordinates: { lat: 0.0600, lng: 36.7800 }, trend: [53,55,57,55,53,51,53,55,57,55,53,51,53,55,57,55,53,51,53,55,57,55,53,51,53,55,57,55,53,55] },
  { id: 'samburu', name: 'Samburu', waterAvailability: 24, waterStress: 88, population: 310327, recentRainfall: 8, riskLevel: 'severe', waterSources: { reservoirs: 0, rivers: 1, boreholes: 28 }, coordinates: { lat: 1.2667, lng: 36.9000 }, trend: [26,24,22,20,22,24,26,24,22,20,22,24,26,24,22,20,22,24,26,24,22,20,22,24,26,24,22,20,22,24] },
  { id: 'trans_nzoia', name: 'Trans Nzoia', waterAvailability: 80, waterStress: 38, population: 990341, recentRainfall: 75, riskLevel: 'stable', waterSources: { reservoirs: 4, rivers: 5, boreholes: 95 }, coordinates: { lat: 1.0567, lng: 34.9507 }, trend: [78,80,82,80,78,76,78,80,82,80,78,76,78,80,82,80,78,76,78,80,82,80,78,76,78,80,82,80,78,80] },
  { id: 'baringo', name: 'Baringo', waterAvailability: 45, waterStress: 62, population: 666763, recentRainfall: 35, riskLevel: 'moderate', waterSources: { reservoirs: 2, rivers: 3, boreholes: 55 }, coordinates: { lat: 0.4667, lng: 35.9667 }, trend: [43,45,47,45,43,41,43,45,47,45,43,41,43,45,47,45,43,41,43,45,47,45,43,41,43,45,47,45,43,45] },
  { id: 'elgeyo_marakwet', name: 'Elgeyo Marakwet', waterAvailability: 72, waterStress: 42, population: 454480, recentRainfall: 62, riskLevel: 'stable', waterSources: { reservoirs: 3, rivers: 4, boreholes: 58 }, coordinates: { lat: 0.6833, lng: 35.5167 }, trend: [70,72,74,72,70,68,70,72,74,72,70,68,70,72,74,72,70,68,70,72,74,72,70,68,70,72,74,72,70,72] },
  { id: 'nandi', name: 'Nandi', waterAvailability: 76, waterStress: 40, population: 885711, recentRainfall: 68, riskLevel: 'stable', waterSources: { reservoirs: 3, rivers: 4, boreholes: 78 }, coordinates: { lat: 0.1833, lng: 35.1500 }, trend: [74,76,78,76,74,72,74,76,78,76,74,72,74,76,78,76,74,72,74,76,78,76,74,72,74,76,78,76,74,76] },
  { id: 'west_pokot', name: 'West Pokot', waterAvailability: 35, waterStress: 72, population: 621241, recentRainfall: 25, riskLevel: 'severe', waterSources: { reservoirs: 1, rivers: 2, boreholes: 35 }, coordinates: { lat: 1.6167, lng: 35.2333 }, trend: [37,35,33,31,33,35,37,35,33,31,33,35,37,35,33,31,33,35,37,35,33,31,33,35,37,35,33,31,33,35] },
  { id: 'kericho', name: 'Kericho', waterAvailability: 82, waterStress: 32, population: 901777, recentRainfall: 80, riskLevel: 'stable', waterSources: { reservoirs: 4, rivers: 5, boreholes: 85 }, coordinates: { lat: -0.3689, lng: 35.2863 }, trend: [80,82,84,82,80,78,80,82,84,82,80,78,80,82,84,82,80,78,80,82,84,82,80,78,80,82,84,82,80,82] },
  { id: 'bomet', name: 'Bomet', waterAvailability: 70, waterStress: 45, population: 875689, recentRainfall: 62, riskLevel: 'moderate', waterSources: { reservoirs: 3, rivers: 4, boreholes: 72 }, coordinates: { lat: -0.7813, lng: 35.3419 }, trend: [68,70,72,70,68,66,68,70,72,70,68,66,68,70,72,70,68,66,68,70,72,70,68,66,68,70,72,70,68,70] },
  { id: 'bungoma', name: 'Bungoma', waterAvailability: 75, waterStress: 42, population: 1670570, recentRainfall: 72, riskLevel: 'stable', waterSources: { reservoirs: 4, rivers: 5, boreholes: 98 }, coordinates: { lat: 0.5635, lng: 34.5607 }, trend: [73,75,77,75,73,71,73,75,77,75,73,71,73,75,77,75,73,71,73,75,77,75,73,71,73,75,77,75,73,75] },
  { id: 'busia', name: 'Busia', waterAvailability: 72, waterStress: 45, population: 893681, recentRainfall: 68, riskLevel: 'moderate', waterSources: { reservoirs: 2, rivers: 4, boreholes: 68 }, coordinates: { lat: 0.4608, lng: 34.1108 }, trend: [70,72,74,72,70,68,70,72,74,72,70,68,70,72,74,72,70,68,70,72,74,72,70,68,70,72,74,72,70,72] },
  { id: 'vihiga', name: 'Vihiga', waterAvailability: 70, waterStress: 48, population: 590013, recentRainfall: 72, riskLevel: 'moderate', waterSources: { reservoirs: 2, rivers: 3, boreholes: 55 }, coordinates: { lat: 0.0833, lng: 34.7333 }, trend: [68,70,72,70,68,66,68,70,72,70,68,66,68,70,72,70,68,66,68,70,72,70,68,66,68,70,72,70,68,70] },
  { id: 'homa_bay', name: 'Homa Bay', waterAvailability: 65, waterStress: 50, population: 1131950, recentRainfall: 60, riskLevel: 'moderate', waterSources: { reservoirs: 2, rivers: 3, boreholes: 65 }, coordinates: { lat: -0.5273, lng: 34.4571 }, trend: [63,65,67,65,63,61,63,65,67,65,63,61,63,65,67,65,63,61,63,65,67,65,63,61,63,65,67,65,63,65] },
  { id: 'migori', name: 'Migori', waterAvailability: 62, waterStress: 52, population: 1116436, recentRainfall: 58, riskLevel: 'moderate', waterSources: { reservoirs: 2, rivers: 4, boreholes: 62 }, coordinates: { lat: -1.0634, lng: 34.4731 }, trend: [60,62,64,62,60,58,60,62,64,62,60,58,60,62,64,62,60,58,60,62,64,62,60,58,60,62,64,62,60,62] },
  { id: 'kisii', name: 'Kisii', waterAvailability: 74, waterStress: 42, population: 1266860, recentRainfall: 72, riskLevel: 'stable', waterSources: { reservoirs: 3, rivers: 4, boreholes: 82 }, coordinates: { lat: -0.6817, lng: 34.7667 }, trend: [72,74,76,74,72,70,72,74,76,74,72,70,72,74,76,74,72,70,72,74,76,74,72,70,72,74,76,74,72,74] },
  { id: 'nyamira', name: 'Nyamira', waterAvailability: 72, waterStress: 44, population: 605576, recentRainfall: 70, riskLevel: 'stable', waterSources: { reservoirs: 2, rivers: 3, boreholes: 58 }, coordinates: { lat: -0.5633, lng: 34.9333 }, trend: [70,72,74,72,70,68,70,72,74,72,70,68,70,72,74,72,70,68,70,72,74,72,70,68,70,72,74,72,70,72] },
  { id: 'narok', name: 'Narok', waterAvailability: 50, waterStress: 58, population: 1157873, recentRainfall: 42, riskLevel: 'moderate', waterSources: { reservoirs: 2, rivers: 4, boreholes: 65 }, coordinates: { lat: -1.0873, lng: 35.8600 }, trend: [48,50,52,50,48,46,48,50,52,50,48,46,48,50,52,50,48,46,48,50,52,50,48,46,48,50,52,50,48,50] },
];

export const getCountyByCoordinates = (lat: number, lng: number): CountyData | null => {
  // Simple distance-based matching
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

export const getNationalStats = () => {
  const totalPopulation = kenyaCounties.reduce((sum, c) => sum + c.population, 0);
  const avgWaterAvailability = kenyaCounties.reduce((sum, c) => sum + c.waterAvailability, 0) / kenyaCounties.length;
  const avgWaterStress = kenyaCounties.reduce((sum, c) => sum + c.waterStress, 0) / kenyaCounties.length;
  const avgRainfall = kenyaCounties.reduce((sum, c) => sum + c.recentRainfall, 0) / kenyaCounties.length;
  
  const severeCount = kenyaCounties.filter(c => c.riskLevel === 'severe').length;
  const moderateCount = kenyaCounties.filter(c => c.riskLevel === 'moderate').length;
  const stableCount = kenyaCounties.filter(c => c.riskLevel === 'stable').length;

  return {
    totalPopulation,
    avgWaterAvailability: Math.round(avgWaterAvailability),
    avgWaterStress: Math.round(avgWaterStress),
    avgRainfall: Math.round(avgRainfall),
    severeCount,
    moderateCount,
    stableCount,
    totalCounties: kenyaCounties.length
  };
};
