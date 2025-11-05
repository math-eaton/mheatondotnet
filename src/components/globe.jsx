import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function GlobeVis() {
  const globeId = 'globeContainer1';
  useEffect(() => {

    let map;
    let isMounted = true;
    let animationFrameId;
    let isUserInteracting = false;

    (async () => {
      const THREE = await import('three');

      // Fetch the style JSON and inject the API key at runtime
      const styleResponse = await fetch('/json/bright.json');
      const styleJson = await styleResponse.json();
      // Use a different API key for dev vs prod
      let apiKey = import.meta.env.PUBLIC_MAPTILER_KEY || 'xHRm7K23zzCN4h6B9V8s';
      if (!apiKey) {
        console.error("MapTiler API key is missing or invalid.");
        return;
      }
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
        center: [0, 0],
        maxPitch: 45,
        minZoom: 2,
        maxZoom: 15,
        pitch: 0,
        canvasContextAttributes: { antialias: false },
        attributionControl: false
      });
      // Add attribution control in compact (collapsed) mode
      map.addControl(new maplibregl.AttributionControl({ compact: true }));

      // Accelerate mouse wheel zoom (default is around 1/450)
      // Higher values = faster zoom
      map.scrollZoom.setWheelZoomRate(1/125);

      map.on('style.load', () => {
        map.setProjection({ type: 'globe' });
      });

      const rotateEarth = () => {
        if (isMounted && !isUserInteracting) {
          const currentCenter = map.getCenter();
          const currentZoom = map.getZoom();

          // const minZoom = 2;
          const fastCutoff = 4;   // up to this zoom keep it fast
          const slowCutoff = 8;  // at and above this zoom, essentially stop

          let speedMultiplier;
          if (currentZoom >= slowCutoff) {
        // effectively stop 
        speedMultiplier = 0.0001;
          } else if (currentZoom <= fastCutoff) {
        // slightly speed up when very zoomed out
        speedMultiplier = 1.1;
          } else {
        // heavy falloff between fastCutoff..slowCutoff using a high-power curve
        const t = (currentZoom - fastCutoff) / (slowCutoff - fastCutoff); // 0..1
        speedMultiplier = Math.max(0.00001, Math.pow(1 - t, 6));
          }

          const baseSpeed = 0.01; // base panning step when fully fast
          const adjustedSpeed = baseSpeed * speedMultiplier;

          // Keep longitude in [-180, 180] to avoid huge numbers over time
          let newLongitude = currentCenter.lng + adjustedSpeed;
          if (newLongitude > 180) newLongitude = ((newLongitude + 180) % 360) - 180;
          if (newLongitude < -180) newLongitude = ((newLongitude - 180) % 360) + 180;

          map.setCenter([newLongitude, currentCenter.lat]);
          animationFrameId = requestAnimationFrame(rotateEarth);
        }
      };

      // Event listeners to detect user interaction
      const onInteractionStart = () => {
        isUserInteracting = true;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };

      const onInteractionEnd = () => {
        isUserInteracting = false;
        rotateEarth();
      };

      map.on('mousedown', onInteractionStart);
      map.on('touchstart', onInteractionStart);
      map.on('mouseup', onInteractionEnd);
      map.on('touchend', onInteractionEnd);

      // Start rotation
      rotateEarth();

    })();

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (map) {
        map.off('mousedown', onInteractionStart);
        map.off('touchstart', onInteractionStart);
        map.off('mouseup', onInteractionEnd);
        map.off('touchend', onInteractionEnd);
        map.remove();
      }
    };
  }, []);

  return (
    <div
      id={globeId}
      className="vis-container globe-vis-container"
        style={{
        backgroundColor: 'rgba(0, 0, 0, 0)', // troubleshooting hit detection for controls?
        cursor: 'grab'
      }}
    ></div>
  );
}