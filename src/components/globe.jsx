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

      map.on('style.load', () => {
        map.setProjection({ type: 'globe' });
      });

      // Function to simulate Earth's rotation by panning the camera
      const rotateEarth = () => {
        if (isMounted && !isUserInteracting) {
          const currentCenter = map.getCenter();
          const newLongitude = (currentCenter.lng + 0.01) % 360; // Adjust rotation speed here
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
    ></div>
  );
}

console.log("MapTiler API Key:", import.meta.env.PUBLIC_MAPTILER_KEY);
