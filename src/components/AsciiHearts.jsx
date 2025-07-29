import { useEffect } from 'react';
import { asciiHearts } from '../js/hearts.js';

export default function AsciiHearts({ containerId = 'heartsContainer1' }) {
  useEffect(() => {
    asciiHearts(containerId);
  }, [containerId]);

  return <div id={containerId} className="vis-container"></div>;
}
