import { useEffect, useState } from 'react';
import LifeVisualization from './lifeVis.jsx';
import AsciiHearts from './AsciiHearts.jsx';
import ModelLoader from './ModelLoader.jsx';
import contour_degrade from './contourVis.jsx';

const visualizations = [
  LifeVisualization,
  AsciiHearts,
  ModelLoader,
  contour_degrade
];

export default function RandomVisualization() {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    const index = Math.floor(Math.random() * visualizations.length);
    setComponent(() => visualizations[index]);
  }, []);

  if (!Component) return null;

  return <Component />;
}
