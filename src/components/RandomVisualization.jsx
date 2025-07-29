import { useEffect, useState } from 'react';

const components = [
  () => import('./lifeVis.jsx'),
  () => import('./AsciiHearts.jsx'),
  () => import('./ModelLoader.jsx'),
  () => import('./contourVis.jsx'),
  () => import('./shapeshiftVis.jsx')
];

export default function RandomVisualization() {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    const pick = Math.floor(Math.random() * components.length);
    components[pick]().then((mod) => {
      setComponent(() => mod.default);
    });
  }, []);

  if (!Component) return null;
  return <Component />;
}
