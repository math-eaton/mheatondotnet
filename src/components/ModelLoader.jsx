import { useEffect, useRef } from 'react';
import { modelLoader } from '../js/primitives.js';

export default function ModelLoader({ containerId = 'horseContainer1' }) {
  const loaderRef = useRef(null);

  useEffect(() => {
    const loaderInstance = modelLoader(containerId);
    loaderRef.current = loaderInstance;

    // Add right-click (contextmenu) event to toggle GUI
    const container = document.getElementById(containerId);
    const handleContextMenu = (e) => {
      e.preventDefault();
      if (loaderRef.current && typeof loaderRef.current.toggleGUI === 'function') {
        loaderRef.current.toggleGUI();
      }
    };
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
    }

    // Clean up GUI, renderer, and event listener on unmount
    return () => {
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu);
      }
      if (loaderRef.current && typeof loaderRef.current.dispose === 'function') {
        loaderRef.current.dispose();
      }
    };
  }, [containerId]);

  return <div id={containerId} className="vis-container"></div>;
}
