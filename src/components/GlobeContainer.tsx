"use client";

import { useEffect, useRef, useMemo, useState, Suspense, useCallback } from "react";
import * as THREE from "three";
import { useGlobalStore } from "@/store/useGlobalStore";
import type { EventCategory } from "@/types/global";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import ThreeGlobe from "three-globe";

// Category colors for atmosphere and markers
const CATEGORY_COLORS: Record<EventCategory, string> = {
  conflict: "#ef4444",
  market: "#22d3ee",
  resources: "#34d399",
  natural_disaster: "#f59e0b",
  cyber: "#a855f7",
  political: "#3b82f6",
  humanitarian: "#ec4899",
};

// Texture URLs - Using versioned URLs to avoid 403/CORS issues
const GLOBE_IMAGE_URL = "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg";
const BUMP_IMAGE_URL = "https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png";
const CLOUDS_IMAGE_URL = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r154/examples/textures/planets/earth_clouds_2048.png";

function Clouds() {
  const cloudRef = useRef<THREE.Mesh>(null);
  const cloudTexture = useLoader(THREE.TextureLoader, CLOUDS_IMAGE_URL);

  useFrame((state, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.02; 
    }
  });

  return (
    <mesh ref={cloudRef} scale={[1.01, 1.01, 1.01]}>
      <sphereGeometry args={[100, 64, 64]} />
      <meshStandardMaterial
        map={cloudTexture}
        transparent={true}
        opacity={0.35}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GlobeScene() {
  const { settings, events, layers } = useGlobalStore();
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [citiesData, setCitiesData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/data/countries.json")
      .then(res => res.json())
      .then(data => {
        if (data?.features) setCountriesData(data.features);
      })
      .catch(err => console.error("Failed to load country data:", err));
      
    fetch("/data/cities.json")
      .then(res => res.json())
      .then(data => {
        if (data) setCitiesData(data);
      })
      .catch(err => console.error("Failed to load cities data:", err));
  }, []);

  const globe = useMemo(() => {
    const globeMaterial = new THREE.MeshPhongMaterial();
    globeMaterial.color = new THREE.Color("#ffffff");
    globeMaterial.emissive = new THREE.Color("#020510");
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 15;

    const g = new ThreeGlobe()
      .globeMaterial(globeMaterial)
      .globeImageUrl(GLOBE_IMAGE_URL)
      .bumpImageUrl(BUMP_IMAGE_URL)
      .showAtmosphere(settings.showAtmosphere)
      .atmosphereColor("#ec4899") 
      .atmosphereAltitude(0.15)
      .polygonCapColor(() => "rgba(236, 72, 153, 0.05)") 
      .polygonSideColor(() => "rgba(0, 0, 0, 0.0)")
      .polygonStrokeColor(() => "rgba(255, 255, 255, 0.15)") 
      .polygonAltitude(0.012)
      .labelLat(d => (d as any).lat)
      .labelLng(d => (d as any).lng)
      .labelText(d => (d as any).name)
      .labelSize(d => ((d as any).tier === 1 ? 1.5 : 1))
      .labelDotRadius(d => ((d as any).tier === 1 ? 0.3 : 0.2))
      .labelColor(() => 'rgba(255, 255, 255, 0.8)')
      .labelResolution(2);

    return g;
  }, [settings.showAtmosphere]);

  useEffect(() => {
    if (countriesData.length > 0 && globe) {
      globe.polygonsData(countriesData);
    }
  }, [globe, countriesData]);

  const satelliteMeshRef = useRef<THREE.InstancedMesh>(null);
  const satelliteMetaRef = useRef<{name: string, category: string}[]>([]);
  const [satCount, setSatCount] = useState(0);
  // Minimalist satellite: central body + two solar panels
  const satGeometry = useMemo(() => {
    const body = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    const panelL = new THREE.BoxGeometry(2.5, 0.1, 0.75);
    panelL.translate(-1.75, 0, 0);
    const panelR = new THREE.BoxGeometry(2.5, 0.1, 0.75);
    panelR.translate(1.75, 0, 0);
    return mergeGeometries([body, panelL, panelR])!;
  }, []);
  const satMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x22d3ee,
    emissiveIntensity: 4,
    transparent: true,
    opacity: 0.7,
  }), []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Minimalist airplane: fuselage + delta wings + tail
  const planeMeshRef = useRef<THREE.InstancedMesh>(null);
  const planeMetaRef = useRef<{name: string, category: string}[]>([]);
  const [planeCount, setPlaneCount] = useState(0);
  const planeGeometry = useMemo(() => {
    const fuselage = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 4);
    fuselage.rotateX(Math.PI / 2);
    const wingL = new THREE.BoxGeometry(2.0, 0.05, 0.6);
    wingL.translate(-0.5, 0, 0.25);
    const wingR = new THREE.BoxGeometry(2.0, 0.05, 0.6);
    wingR.translate(0.5, 0, 0.25);
    const tail = new THREE.BoxGeometry(0.05, 0.6, 0.4);
    tail.translate(0, 0.3, -1.0);
    return mergeGeometries([fuselage, wingL, wingR, tail])!;
  }, []);
  const planeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xf59e0b,
    emissiveIntensity: 5,
  }), []);

  // Minimalist ship: tapered hull
  const shipMeshRef = useRef<THREE.InstancedMesh>(null);
  const shipMetaRef = useRef<{name: string, category: string}[]>([]);
  const [shipCount, setShipCount] = useState(0);
  const shipGeometry = useMemo(() => {
    const hull = new THREE.CylinderGeometry(0.15, 0.4, 2.0, 4);
    hull.rotateX(Math.PI / 2);
    const bridge = new THREE.BoxGeometry(0.3, 0.3, 0.4);
    bridge.translate(0, 0.2, -0.25);
    return mergeGeometries([hull, bridge])!;
  }, []);
  const shipMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x3b82f6,
    emissiveIntensity: 3,
  }), []);

  // ── Satellite Worker ──
  useEffect(() => {
    if (!globe || !settings.showSatellites) return;

    let worker: Worker;
    
    fetch('/data/active-satellites.txt')
      .then(res => res.text())
      .then(tles => {
        const count = Math.floor(tles.split('\n').filter(l => l.trim().length > 0).length / 3);
        setSatCount(count);
        
        worker = new Worker(new URL('../lib/workers/satellite.worker.ts', import.meta.url));
        worker.postMessage({ type: 'INIT', payload: tles });
        
        worker.onmessage = (e) => {
          if (e.data.type === 'INIT_DONE') {
            satelliteMetaRef.current = e.data.metadata;
          }
          if (e.data.type === 'UPDATE' && satelliteMeshRef.current && globe) {
            const buffer = e.data.payload as Float32Array;
            const numSats = buffer.length / 3;
            for (let i = 0; i < numSats; i++) {
              const lat = buffer[i * 3];
              const lng = buffer[i * 3 + 1];
              const alt = buffer[i * 3 + 2];
              
              const meta = satelliteMetaRef.current[i];
              const isFiltered = meta && !settings.assetFilters.satellites.includes(meta.category);

              if (isFiltered || isNaN(lat) || isNaN(lng) || isNaN(alt) || (lat === 0 && lng === 0 && alt === 0)) {
                dummy.scale.set(0, 0, 0);
                dummy.updateMatrix();
                satelliteMeshRef.current.setMatrixAt(i, dummy.matrix);
                continue;
              }
              const coords = globe.getCoords(lat, lng, alt);
              if (coords && !isNaN(coords.x) && !isNaN(coords.y) && !isNaN(coords.z)) {
                dummy.position.set(coords.x, coords.y, coords.z);
                dummy.lookAt(0, 0, 0);
                dummy.scale.set(1, 1, 1);
                dummy.updateMatrix();
                satelliteMeshRef.current.setMatrixAt(i, dummy.matrix);
              } else {
                dummy.scale.set(0, 0, 0);
                dummy.updateMatrix();
                satelliteMeshRef.current.setMatrixAt(i, dummy.matrix);
              }
            }
            satelliteMeshRef.current.instanceMatrix.needsUpdate = true;
          }
        };
      })
      .catch(err => console.error("Failed to load satellites:", err));

    return () => { if (worker) worker.terminate(); };
  }, [globe, settings.showSatellites, settings.assetFilters.satellites, dummy]);

  // ── Vehicle Worker (runs independently of satellite toggle) ──
  useEffect(() => {
    if (!globe) return;

    const vehicleWorker = new Worker(new URL('../lib/workers/vehicles.worker.ts', import.meta.url));
    vehicleWorker.postMessage({ type: 'INIT' });
    
    vehicleWorker.onmessage = (e) => {
      if (e.data.type === 'INIT_DONE') {
        planeMetaRef.current = e.data.planeMeta;
        shipMetaRef.current = e.data.shipMeta;
      }
      if (e.data.type === 'UPDATE' && globe) {
        if (planeMeshRef.current) {
          const planes = e.data.planes as Float32Array;
          const numPlanes = planes.length / 3;
          if (planeCount !== numPlanes) setPlaneCount(numPlanes);
          for (let i = 0; i < numPlanes; i++) {
            const lat = planes[i * 3];
            const lng = planes[i * 3 + 1];
            const alt = planes[i * 3 + 2];
            
            const meta = planeMetaRef.current[i];
            const isFiltered = meta && !settings.assetFilters.planes.includes(meta.category);

            if (isFiltered || isNaN(lat) || isNaN(lng) || isNaN(alt) || (lat === 0 && lng === 0 && alt === 0)) {
              dummy.scale.set(0, 0, 0);
              dummy.updateMatrix();
              planeMeshRef.current.setMatrixAt(i, dummy.matrix);
              continue;
            }
            const coords = globe.getCoords(lat, lng, alt);
            if (coords && !isNaN(coords.x) && !isNaN(coords.y) && !isNaN(coords.z)) {
              dummy.position.set(coords.x, coords.y, coords.z);
              dummy.lookAt(0, 0, 0);
              dummy.rotateX(Math.PI / 2);
              dummy.scale.set(1, 1, 1);
              dummy.updateMatrix();
              planeMeshRef.current.setMatrixAt(i, dummy.matrix);
            } else {
              dummy.scale.set(0, 0, 0);
              dummy.updateMatrix();
              planeMeshRef.current.setMatrixAt(i, dummy.matrix);
            }
          }
          planeMeshRef.current.instanceMatrix.needsUpdate = true;
        }
        if (shipMeshRef.current) {
          const ships = e.data.ships as Float32Array;
          const numShips = ships.length / 3;
          if (shipCount !== numShips) setShipCount(numShips);
          for (let i = 0; i < numShips; i++) {
            const lat = ships[i * 3];
            const lng = ships[i * 3 + 1];
            const alt = ships[i * 3 + 2];

            const meta = shipMetaRef.current[i];
            const isFiltered = meta && !settings.assetFilters.ships.includes(meta.category);

            if (isFiltered || isNaN(lat) || isNaN(lng) || isNaN(alt) || (lat === 0 && lng === 0 && alt === 0)) {
              dummy.scale.set(0, 0, 0);
              dummy.updateMatrix();
              shipMeshRef.current.setMatrixAt(i, dummy.matrix);
              continue;
            }
            const coords = globe.getCoords(lat, lng, alt);
            if (coords && !isNaN(coords.x) && !isNaN(coords.y) && !isNaN(coords.z)) {
              dummy.position.set(coords.x, coords.y, coords.z);
              dummy.lookAt(0, 0, 0);
              dummy.scale.set(1, 1, 1);
              dummy.updateMatrix();
              shipMeshRef.current.setMatrixAt(i, dummy.matrix);
            } else {
              dummy.scale.set(0, 0, 0);
              dummy.updateMatrix();
              shipMeshRef.current.setMatrixAt(i, dummy.matrix);
            }
          }
          shipMeshRef.current.instanceMatrix.needsUpdate = true;
        }
      }
    };

    return () => vehicleWorker.terminate();
  }, [globe, settings.assetFilters.planes, settings.assetFilters.ships, dummy]);

  const pingMeshRef = useRef<THREE.InstancedMesh>(null);
  const pingGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.8, 0.8, 5);
    geo.translate(0, 0, 2.5);
    return geo;
  }, []);

  const enabledCategories = useMemo(() => {
    return new Set(layers.filter(l => l.enabled).map(l => l.category));
  }, [layers]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => enabledCategories.has(e.category));
  }, [events, enabledCategories]);

  const dominantColor = useMemo(() => {
    if (filteredEvents.length === 0) return "#ec4899";
    const counts: Record<string, number> = {};
    filteredEvents.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1; });
    const topCat = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as EventCategory;
    return CATEGORY_COLORS[topCat] || "#ec4899";
  }, [filteredEvents]);

  const pingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: dominantColor,
    emissive: dominantColor,
    emissiveIntensity: 15,
  }), [dominantColor]);

  useEffect(() => {
    if (pingMeshRef.current && globe && filteredEvents.length > 0) {
      filteredEvents.forEach((event, i) => {
        const coords = globe.getCoords(event.coordinates.lat, event.coordinates.lon, 0.01);
        if (coords) {
          dummy.position.set(coords.x, coords.y, coords.z);
          dummy.lookAt(0, 0, 0);
          dummy.updateMatrix();
          pingMeshRef.current!.setMatrixAt(i, dummy.matrix);
        }
      });
      pingMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [filteredEvents, globe, dummy]);

  const lastLodUpdate = useRef<number>(0);
  const prevLodRef = useRef<number>(0);

  useFrame((state) => {
    if (!globe) return;
    
    // Throttle LOD calculations to prevent frame drops
    const now = Date.now();
    if (now - lastLodUpdate.current < 500) return;
    lastLodUpdate.current = now;

    // Calculate City LOD based on camera distance
    const dist = state.camera.position.length();
    let currentLod = 1;
    if (dist < 150) currentLod = 3;
    else if (dist < 250) currentLod = 2;

    if (currentLod !== prevLodRef.current && citiesData.length > 0) {
      prevLodRef.current = currentLod;
      const filteredCities = citiesData.filter(c => c.tier <= currentLod);
      globe.labelsData(filteredCities);
    }
  });

  return (
    <>
      {/* Evenly distributed lighting to ensure full globe visibility */}
      <ambientLight intensity={1.5} />
      <hemisphereLight intensity={1.5} groundColor="#1a2035" color="#ffffff" />
      {/* Front/Sun fill */}
      <directionalLight position={[200, 0, 200]} intensity={1.5} color="#ffffff" />
      {/* Back fill */}
      <directionalLight position={[-200, 0, -200]} intensity={1.2} color="#a855f7" />
      {/* Top fill */}
      <directionalLight position={[0, 250, 0]} intensity={1.0} color="#22d3ee" />
      {/* Bottom fill */}
      <directionalLight position={[0, -250, 0]} intensity={1.0} color="#ec4899" />
      
      <primitive object={globe} />
      
      {settings.showSatellites && satCount > 0 && (
        <instancedMesh 
          ref={satelliteMeshRef} 
          args={[satGeometry, satMaterial, satCount]} 
          onClick={(e) => {
            e.stopPropagation();
            if (e.instanceId !== undefined && satelliteMetaRef.current[e.instanceId]) {
              useGlobalStore.getState().setSelectedAsset({
                id: `sat-${e.instanceId}`,
                type: 'satellite',
                ...satelliteMetaRef.current[e.instanceId],
                location: 'Low Earth Orbit',
                status: 'Active'
              });
            }
          }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
        />
      )}
      {settings.showPlanes && planeCount > 0 && (
        <instancedMesh 
          ref={planeMeshRef} 
          args={[planeGeometry, planeMaterial, planeCount]} 
          onClick={(e) => {
            e.stopPropagation();
            if (e.instanceId !== undefined && planeMetaRef.current[e.instanceId]) {
              useGlobalStore.getState().setSelectedAsset({
                id: `plane-${e.instanceId}`,
                type: 'aircraft',
                ...planeMetaRef.current[e.instanceId],
                location: 'Airborne',
                status: 'En Route'
              });
            }
          }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
        />
      )}
      {settings.showShips && shipCount > 0 && (
        <instancedMesh 
          ref={shipMeshRef} 
          args={[shipGeometry, shipMaterial, shipCount]} 
          onClick={(e) => {
            e.stopPropagation();
            if (e.instanceId !== undefined && shipMetaRef.current[e.instanceId]) {
              useGlobalStore.getState().setSelectedAsset({
                id: `ship-${e.instanceId}`,
                type: 'maritime',
                ...shipMetaRef.current[e.instanceId],
                location: 'At Sea',
                status: 'Underway'
              });
            }
          }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
        />
      )}
      {filteredEvents.length > 0 && (
        <instancedMesh ref={pingMeshRef} args={[pingGeometry, pingMaterial, filteredEvents.length]} />
      )}
    </>
  );
}

export default function GlobeContainer() {
  const { settings } = useGlobalStore();

  return (
    <div className="absolute inset-0 bg-[#000511] pointer-events-auto cursor-move overflow-hidden">
      <div className="absolute inset-0 z-10">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full w-full bg-[#000511] text-pink-500 font-mono text-xl animate-pulse">
            INITIALIZING GLOBAL INTELLIGENCE...
          </div>
        }>
          <Canvas shadows gl={{ antialias: true, alpha: true }}>
            <PerspectiveCamera makeDefault position={[0, 0, 280]} fov={45} near={10} far={2000} />
            <OrbitControls
              enablePan={false}
              mouseButtons={{
                LEFT: THREE.MOUSE.NONE, // Left click is for selecting objects now
                RIGHT: THREE.MOUSE.ROTATE, // Right click rotates
                MIDDLE: THREE.MOUSE.DOLLY,
              }}
              minDistance={120}
              maxDistance={800}
              autoRotate={settings.autoRotate}
              autoRotateSpeed={settings.autoRotateSpeed}
              enableDamping
              dampingFactor={0.05}
            />
            <Stars radius={1000} depth={50} count={5000} factor={7} saturation={0} fade speed={1} />
            <GlobeScene />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
