"use client";

import { useEffect, useRef, useMemo, useState, Suspense } from "react";
import * as THREE from "three";
import * as satellite from "satellite.js";
import { ISS_TLE, STARLINK_TLES } from "@/lib/tle-data";
import { useGlobalStore } from "@/store/useGlobalStore";
import type { EventCategory } from "@/types/global";

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

  useEffect(() => {
    fetch("/data/countries.json")
      .then(res => res.json())
      .then(data => {
        if (data?.features) setCountriesData(data.features);
      })
      .catch(err => console.error("Failed to load country data:", err));
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
      .polygonAltitude(0.012);

    return g;
  }, [settings.showAtmosphere]);

  useEffect(() => {
    if (countriesData.length > 0 && globe) {
      globe.polygonsData(countriesData);
    }
  }, [globe, countriesData]);

  const satelliteMeshRef = useRef<THREE.InstancedMesh>(null);
  const satGeometry = useMemo(() => new THREE.OctahedronGeometry(0.8, 0), []);
  const satMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xec4899,
    emissiveIntensity: 3,
    transparent: true,
    opacity: 0.9,
  }), []);

  const satellites = useMemo(() => {
    return [...STARLINK_TLES, ISS_TLE].map((tle, idx) => {
      const satrec = satellite.twoline2satrec(tle[0], tle[1]);
      return { satrec, id: idx };
    });
  }, []);

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

  const dummy = useMemo(() => new THREE.Object3D(), []);

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

  useFrame(() => {
    if (!settings.showSatellites || !satelliteMeshRef.current || !globe) return;

    const now = new Date();
    satellites.forEach((sat, i) => {
      try {
        const posVel = satellite.propagate(sat.satrec, now);
        const posEci = posVel.position;
        if (posEci && typeof posEci !== 'boolean') {
          const gmst = satellite.gstime(now);
          const posGd = satellite.eciToGeodetic(posEci, gmst);
          const lat = satellite.degreesLat(posGd.latitude);
          const lng = satellite.degreesLong(posGd.longitude);
          const alt = (posGd.height / 6371) * 1.3;
          const coords = globe.getCoords(lat, lng, alt);
          if (coords) {
            dummy.position.set(coords.x, coords.y, coords.z);
            dummy.lookAt(0, 0, 0);
            dummy.updateMatrix();
            satelliteMeshRef.current!.setMatrixAt(i, dummy.matrix);
          }
        }
      } catch { /* ignore */ }
    });
    satelliteMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <hemisphereLight intensity={0.7} groundColor="#000511" color="#ffffff" />
      <directionalLight position={[100, 100, 100]} intensity={2.2} castShadow />
      <directionalLight position={[-100, 50, -50]} intensity={1.2} color="#ec4899" />
      <pointLight position={[0, 0, 250]} intensity={0.8} />
      
      <primitive object={globe} />
      <Clouds />
      
      {settings.showSatellites && (
        <instancedMesh ref={satelliteMeshRef} args={[satGeometry, satMaterial, satellites.length]} />
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
            <PerspectiveCamera makeDefault position={[0, 0, 280]} fov={45} />
            <OrbitControls
              enablePan={false}
              minDistance={120}
              maxDistance={500}
              autoRotate={settings.autoRotate}
              autoRotateSpeed={settings.autoRotateSpeed}
              enableDamping
              dampingFactor={0.05}
            />
            <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade speed={1} />
            <GlobeScene />
            <EffectComposer>
              <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            </EffectComposer>
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
