// Simple distance and bearing math for globe
const R = 6371; // Earth radius in km

function toRad(degrees: number) { return degrees * Math.PI / 180; }
function toDeg(radians: number) { return radians * 180 / Math.PI; }

interface Vehicle {
  lat: number;
  lng: number;
  alt: number; // 0 for ships, >0 for planes
  targetLat: number;
  targetLng: number;
  speed: number; // degrees per tick
  category: string;
  name: string;
}

let planes: Vehicle[] = [];
let ships: Vehicle[] = [];
let planesBuffer: Float32Array;
let shipsBuffer: Float32Array;

// Mock major hubs to fly/sail between
const HUBS = [
  { lat: 40.7128, lng: -74.0060 }, // NYC
  { lat: 51.5074, lng: -0.1278 },  // London
  { lat: 35.6762, lng: 139.6503 }, // Tokyo
  { lat: 1.3521, lng: 103.8198 },  // Singapore
  { lat: 25.2048, lng: 55.2708 },  // Dubai
  { lat: -33.8688, lng: 151.2093 }, // Sydney
  { lat: -23.5505, lng: -46.6333 }, // Sao Paulo
  { lat: 34.0522, lng: -118.2437 }, // LA
  { lat: 22.3193, lng: 114.1694 }, // Hong Kong
  { lat: 48.8566, lng: 2.3522 }, // Paris
];

function randomHub() { return HUBS[Math.floor(Math.random() * HUBS.length)]; }

self.onmessage = (e: MessageEvent) => {
  if (e.data.type === 'INIT') {
    // Generate 2000 flights
    for (let i = 0; i < 2000; i++) {
      const start = randomHub();
      const end = randomHub();
      const categories = ['commercial', 'commercial', 'commercial', 'cargo', 'military'];
      const cat = categories[Math.floor(Math.random() * categories.length)];
      planes.push({
        lat: start.lat + (Math.random() - 0.5) * 10,
        lng: start.lng + (Math.random() - 0.5) * 10,
        alt: 0.05 + Math.random() * 0.02, // Plane altitude relative to globe
        targetLat: end.lat,
        targetLng: end.lng,
        speed: 0.05 + Math.random() * 0.05, // Degrees per tick
        category: cat,
        name: `FLT-${Math.floor(Math.random() * 9000) + 1000}`
      });
    }

    // Generate 1000 ships
    for (let i = 0; i < 1000; i++) {
      const start = randomHub();
      const end = randomHub();
      const categories = ['cargo', 'cargo', 'tanker', 'military'];
      const cat = categories[Math.floor(Math.random() * categories.length)];
      ships.push({
        lat: start.lat + (Math.random() - 0.5) * 40,
        lng: start.lng + (Math.random() - 0.5) * 40,
        alt: 0, // Sea level
        targetLat: end.lat,
        targetLng: end.lng,
        speed: 0.01 + Math.random() * 0.01, // Ships are slower
        category: cat,
        name: `VSL-${Math.floor(Math.random() * 9000) + 1000}`
      });
    }

    planesBuffer = new Float32Array(planes.length * 3);
    shipsBuffer = new Float32Array(ships.length * 3);

    const planeMeta = planes.map(p => ({ name: p.name, category: p.category }));
    const shipMeta = ships.map(s => ({ name: s.name, category: s.category }));
    
    self.postMessage({ type: 'INIT_DONE', planeMeta, shipMeta });

    setInterval(updateVehicles, 100);
  }
};

function moveTowards(v: Vehicle) {
  const dLat = v.targetLat - v.lat;
  const dLng = v.targetLng - v.lng;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  
  if (dist < v.speed) {
    // Reached destination, pick new one
    const newTarget = randomHub();
    v.targetLat = newTarget.lat;
    v.targetLng = newTarget.lng;
  } else {
    v.lat += (dLat / dist) * v.speed;
    v.lng += (dLng / dist) * v.speed;
  }
}

function updateVehicles() {
  for (let i = 0; i < planes.length; i++) {
    moveTowards(planes[i]);
    planesBuffer[i * 3] = planes[i].lat;
    planesBuffer[i * 3 + 1] = planes[i].lng;
    planesBuffer[i * 3 + 2] = planes[i].alt;
  }

  for (let i = 0; i < ships.length; i++) {
    moveTowards(ships[i]);
    shipsBuffer[i * 3] = ships[i].lat;
    shipsBuffer[i * 3 + 1] = ships[i].lng;
    shipsBuffer[i * 3 + 2] = ships[i].alt;
  }

  self.postMessage({ type: 'UPDATE', planes: planesBuffer, ships: shipsBuffer });
}
