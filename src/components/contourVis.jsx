import { useEffect } from 'react';
import { contour_degrade } from '../js/contours.js';

export default function ContourDegrade({ containerId = 'contourContainer1' }) {
  useEffect(() => {
    contour_degrade(containerId);
  }, [containerId]);

  return <div id={containerId} className="vis-container"></div>;
}
