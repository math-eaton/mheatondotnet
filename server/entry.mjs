import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BDpCxo8e.mjs';
import { manifest } from './manifest_yTw4JcBn.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/about.astro.mjs');
const _page1 = () => import('./pages/cv.astro.mjs');
const _page2 = () => import('./pages/works/dataviz.astro.mjs');
const _page3 = () => import('./pages/works/grid3.astro.mjs');
const _page4 = () => import('./pages/works.astro.mjs');
const _page5 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["src/pages/about.astro", _page0],
    ["src/pages/cv.astro", _page1],
    ["src/pages/works/dataviz.astro", _page2],
    ["src/pages/works/grid3.astro", _page3],
    ["src/pages/works.astro", _page4],
    ["src/pages/index.astro", _page5]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///Users/matthewheaton/GitHub/0_WEB/mheatondotnet/dist/client/",
    "server": "file:///Users/matthewheaton/GitHub/0_WEB/mheatondotnet/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
