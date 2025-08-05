
import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function GlobeVis() {
  const globeId = 'globeContainer1';
  useEffect(() => {

    let map;
    let isMounted = true;
    (async () => {
      const THREE = await import('three');

    // Fetch the style JSON and inject the API key at runtime
    const styleResponse = await fetch('/json/bright.json');
    const styleJson = await styleResponse.json();
    // Use a different API key for dev vs prod
    let apiKey = import.meta.env.PUBLIC_MAPTILER_KEY;
    const devKey = import.meta.env.PUBLIC_MAPTILER_KEY_DEV;
    const isDev = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isDev && devKey) {
      apiKey = devKey;
    }
    if (apiKey && styleJson.sources && styleJson.sources.openmaptiles && styleJson.sources.openmaptiles.url) {
      styleJson.sources.openmaptiles.url = styleJson.sources.openmaptiles.url
        .replace('maptiler_api_key', apiKey)
    }
    if (apiKey && styleJson.glyphs && typeof styleJson.glyphs === 'string') {
      styleJson.glyphs = styleJson.glyphs
        .replace('maptiler_api_key', apiKey)
    }
    if (apiKey && styleJson.sprite && typeof styleJson.sprite === 'string') {
      styleJson.sprite = styleJson.sprite
        .replace('maptiler_api_key', apiKey)
    }
    map = new maplibregl.Map({
      container: globeId,
      style: styleJson,
      zoom: 3.5,
      center: [-74.006, 40.7128],
      maxPitch: 80,
      pitch: 0,
      canvasContextAttributes: { antialias: false },
      attributionControl: false
    });
    // Add attribution control in compact (collapsed) mode
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

      map.on('style.load', () => {
        map.setProjection({ type: 'globe' });
      });
      const customLayer = {
        id: '3d-empty',
        type: 'custom',
        renderingMode: '3d',
        onAdd(map, gl) {
          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();
          // Define earth radius and altitude for lights (in arbitrary units, e.g., 1 = globe radius)
          const earthRadius = 1;
          const altitude = 3; // 2x earth radius above surface

          // Helper to convert lat/lon/alt to Cartesian coordinates
          function latLonAltToXYZ(lat, lon, radius) {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            const x = -(radius * Math.sin(phi) * Math.cos(theta));
            const z = (radius * Math.sin(phi) * Math.sin(theta));
            const y = (radius * Math.cos(phi));
            return [x, y, z];
          }

          // Indian Ocean (approx. center at 20°S, 80°E)
          const [ix, iy, iz] = latLonAltToXYZ(-20, 80, earthRadius + altitude);
          const oceanLight = new THREE.DirectionalLight(0xff00cc, 100);
          oceanLight.position.set(ix, iy, iz);
          oceanLight.castShadow = true;
          this.scene.add(oceanLight);  
            
          // South Pole
          const [sx, sy, sz] = latLonAltToXYZ(-90, 0, earthRadius + altitude);
          const southPoleLight = new THREE.DirectionalLight(0x00ffcc, 50);
          southPoleLight.position.set(sx, sy, sz);
          southPoleLight.castShadow = true;
          this.scene.add(southPoleLight);

          // Equator at 0° longitude
          const [ex1, ey1, ez1] = latLonAltToXYZ(0, 0, earthRadius + altitude);
          const equatorLight1 = new THREE.PointLight(0xffff00, 1.2, 500);
          equatorLight1.position.set(ex1, ey1, ez1);
          equatorLight1.castShadow = true;
          this.scene.add(equatorLight1);

          // Equator at 180 longitude
          const [ex2, ey2, ez2] = latLonAltToXYZ(0, 180, earthRadius + altitude);
          const equatorLight2 = new THREE.PointLight(0x00ffff, 1.2, 500);
          equatorLight2.position.set(ex2, ey2, ez2);
          equatorLight2.castShadow = true;
          this.scene.add(equatorLight2);

          // Ambient light for general illumination
          const ambientLight = new THREE.AmbientLight(0x2222ff, 0.7);
          this.scene.add(ambientLight);

          this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true
          });
          this.renderer.autoClear = false;
        },
        render(gl, args) {
          this.renderer.resetState();
          this.renderer.render(this.scene, this.camera);
          map.triggerRepaint();
        }
      };
      map.on('style.load', () => {
        if (isMounted) map.addLayer(customLayer);
      });
        })();

    return () => {
      isMounted = false;
      if (map) map.remove();
    };
  }, []);

  return (
    <div
      id={globeId}
      className="vis-container globe-vis-container"
    ></div>
  );
}
