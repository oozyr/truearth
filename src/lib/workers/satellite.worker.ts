import * as satellite from 'satellite.js';

let satellites: satellite.SatRec[] = [];
let buffer: Float32Array;

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    const tles = payload as string;
    const lines = tles.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    satellites = [];
    const metadata: { name: string; category: string }[] = [];

    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        // Line 0 is name, Line 1 is TLE 1, Line 2 is TLE 2
        try {
          const satrec = satellite.twoline2satrec(lines[i+1], lines[i+2]);
          if (satrec) {
            satellites.push(satrec);
            
            // Determine category from name
            const name = lines[i];
            let category = 'other';
            const nameUpper = name.toUpperCase();
            if (nameUpper.includes('STARLINK') || nameUpper.includes('ONEWEB') || nameUpper.includes('IRIDIUM')) category = 'comms';
            else if (nameUpper.includes('NAVSTAR') || nameUpper.includes('GLONASS') || nameUpper.includes('GALILEO') || nameUpper.includes('BEIDOU') || nameUpper.includes('GPS')) category = 'nav';
            else if (nameUpper.includes('NOAA') || nameUpper.includes('GOES') || nameUpper.includes('METEOR')) category = 'weather';
            else if (nameUpper.includes('ISS') || nameUpper.includes('HUBBLE') || nameUpper.includes('JWST')) category = 'research';
            else if (nameUpper.includes('USA') || nameUpper.includes('COSMOS') || nameUpper.includes('YAOGAN')) category = 'military';

            metadata.push({ name, category });
          }
        } catch (e) {
          // ignore invalid TLEs
        }
      }
    }
    
    // Create a buffer to hold [x, y, z] for each satellite
    buffer = new Float32Array(satellites.length * 3);
    
    // Send metadata back to main thread
    self.postMessage({ type: 'INIT_DONE', metadata });

    // Start propagation loop at 10Hz (Main thread interpolates for 60Hz)
    setInterval(updatePositions, 100);
  }
};

function updatePositions() {
  if (!satellites.length) return;
  
  const now = new Date();
  const gmst = satellite.gstime(now);
  
  for (let i = 0; i < satellites.length; i++) {
    try {
      const posVel = satellite.propagate(satellites[i], now);
      const posEci = posVel.position;
      
      if (posEci && typeof posEci !== 'boolean') {
        const posGd = satellite.eciToGeodetic(posEci, gmst);
        const lat = satellite.degreesLat(posGd.latitude);
        const lng = satellite.degreesLong(posGd.longitude);
        const alt = (posGd.height / 6371) * 1.3; // scale altitude
        
        // Convert lat/lng to Cartesian coords for three-globe
        // Globe radius is typically 100.
        // x = r * cos(lat) * cos(lon)
        // y = r * sin(lat)
        // z = r * cos(lat) * sin(lon)
        // Wait, three-globe uses a specific orientation. 
        // We will just send lat, lng, alt and let the main thread use `globe.getCoords` OR we precompute if we know radius.
        // It's safer to send lat, lng, alt to the main thread, but that's still 3 floats.
        buffer[i * 3] = lat;
        buffer[i * 3 + 1] = lng;
        buffer[i * 3 + 2] = alt;
      }
    } catch {
      // In case of propagation error, leave at 0,0,0
      buffer[i * 3] = 0;
      buffer[i * 3 + 1] = 0;
      buffer[i * 3 + 2] = 0;
    }
  }
  
  // Transfer the buffer to main thread (copying 96KB at 10Hz is negligible, ~1MB/s bandwidth)
  // We don't transfer ownership to avoid recreating the array, just post a copy.
  self.postMessage({ type: 'UPDATE', payload: buffer });
}
