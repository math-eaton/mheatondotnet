import { useEffect } from 'react';
import { shapeshift } from '../js/shapeshift.js';

export default function shapeshiftVis({ containerId = 'shapeshiftContainer1' }) {
  useEffect(() => {
    const instance = shapeshift(containerId);
    return () => {
      if (instance && instance.dispose) instance.dispose();
    };
  }, [containerId]);

  return <div id={containerId} className="vis-container"></div>;
}
