// File: ModelLoader.jsx
import { useEffect } from 'react';
import { modelLoader } from '../js/primitives.js';

export default function ModelLoader({ containerId = 'horseContainer1' }) {
  useEffect(() => {
    modelLoader(containerId);
  }, [containerId]);

  return <div id={containerId} className="vis-container"></div>;
}
