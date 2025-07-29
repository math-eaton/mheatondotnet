import { useEffect } from 'react';
import { life } from '../js/life.js';

export default function lifeVis({ containerId = 'lifeContainer1' }) {
  useEffect(() => {
    life(containerId);
  }, [containerId]);

  return <div id={containerId} className="vis-container"></div>;
}
