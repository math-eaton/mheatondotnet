
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
    map = new maplibregl.Map({
        container: globeId,
        style: '/json/bright.json',
        zoom: 3.5,
        center: [-74.006, 40.7128], 
        maxPitch: 80,
        pitch: 0,
        canvasContextAttributes: { antialias: true }
          });

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

          const dramaticLight = new THREE.DirectionalLight(0xff00cc, 2.5);
          dramaticLight.position.set(50, 100, 200);
          dramaticLight.castShadow = true;
          this.scene.add(dramaticLight);

          const ambientLight = new THREE.AmbientLight(0x2222ff, 0.7);
          this.scene.add(ambientLight);

          const pointLight = new THREE.PointLight(0x00ffff, 1.2, 500);
          pointLight.position.set(-100, -50, 150);
          this.scene.add(pointLight);

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
