import 'kleur/colors';
import { f as decodeKey } from './chunks/astro/server_m5rbnaUP.mjs';
import 'clsx';
import 'cookie';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_DS87Wb3P.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/matthewheaton/GitHub/0_WEB/mheatondotnet/","cacheDir":"file:///Users/matthewheaton/GitHub/0_WEB/mheatondotnet/node_modules/.astro/","outDir":"file:///Users/matthewheaton/GitHub/0_WEB/mheatondotnet/dist/","srcDir":"file:///Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/","publicDir":"file:///Users/matthewheaton/GitHub/0_WEB/mheatondotnet/public/","buildClientDir":"file:///Users/matthewheaton/GitHub/0_WEB/mheatondotnet/dist/client/","buildServerDir":"file:///Users/matthewheaton/GitHub/0_WEB/mheatondotnet/dist/server/","adapterName":"@astrojs/node","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"cv/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/cv","isIndex":false,"type":"page","pattern":"^\\/cv\\/?$","segments":[[{"content":"cv","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/cv.astro","pathname":"/cv","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"works/dataviz/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/works/dataviz","isIndex":false,"type":"page","pattern":"^\\/works\\/dataviz\\/?$","segments":[[{"content":"works","dynamic":false,"spread":false}],[{"content":"dataviz","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/works/dataviz.astro","pathname":"/works/dataviz","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"works/grid3/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/works/grid3","isIndex":false,"type":"page","pattern":"^\\/works\\/grid3\\/?$","segments":[[{"content":"works","dynamic":false,"spread":false}],[{"content":"grid3","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/works/grid3.astro","pathname":"/works/grid3","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"works/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/works","isIndex":false,"type":"page","pattern":"^\\/works\\/?$","segments":[[{"content":"works","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/works.astro","pathname":"/works","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/pages/about.astro",{"propagation":"none","containsHead":true}],["/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/pages/cv.astro",{"propagation":"none","containsHead":true}],["/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/pages/works/dataviz.astro",{"propagation":"none","containsHead":true}],["/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/pages/works/grid3.astro",{"propagation":"none","containsHead":true}],["/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/pages/works.astro",{"propagation":"none","containsHead":true}],["/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/cv@_@astro":"pages/cv.astro.mjs","\u0000@astro-page:src/pages/works/dataviz@_@astro":"pages/works/dataviz.astro.mjs","\u0000@astro-page:src/pages/works/grid3@_@astro":"pages/works/grid3.astro.mjs","\u0000@astro-page:src/pages/works@_@astro":"pages/works.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_yTw4JcBn.mjs","/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/node_modules/unstorage/drivers/fs-lite.mjs":"chunks/fs-lite_COtHaKzy.mjs","/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/components/lifeVis.jsx":"_astro/lifeVis.BGXBbObj.js","/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/components/AsciiHearts.jsx":"_astro/AsciiHearts.BstpCd53.js","/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/components/ModelLoader.jsx":"_astro/ModelLoader.B1iD2OZi.js","/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/components/contourVis.jsx":"_astro/contourVis.B0IkOmxw.js","/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/components/shapeshiftVis.jsx":"_astro/shapeshiftVis.xrbsopiv.js","/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/pages/cv.astro?astro&type=script&index=0&lang.ts":"_astro/cv.astro_astro_type_script_index_0_lang.C62kQ9XQ.js","/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.UD9x7rX_.js","/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/components/RandomVisualization.jsx":"_astro/RandomVisualization.DCVb0SFW.js","@astrojs/react/client.js":"_astro/client.D2WMwoKK.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/pages/cv.astro?astro&type=script&index=0&lang.ts","function i(t,o){navigator.clipboard.writeText(o).then(function(){var e=document.getElementById(\"copyMessage\")||document.getElementById(\"requestCopyMessage\");t.target&&t.target.id===\"request-email\"&&(e=document.getElementById(\"requestCopyMessage\")),e&&(e.classList.add(\"show\"),setTimeout(function(){e&&(e.style.opacity=\"0\"),setTimeout(function(){e&&(e.classList.remove(\"show\"),e.style.opacity=\"1\")},500)},1e3))}).catch(function(e){console.error(\"Failed to copy email: \",e)})}window.copyEmailToClipboard=i;"],["/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/src/pages/index.astro?astro&type=script&index=0&lang.ts","function a(o,t){navigator.clipboard.writeText(t).then(function(){var e=document.getElementById(\"copyMessage\")||document.getElementById(\"requestCopyMessage\");o.target&&o.target.id===\"request-email\"&&(e=document.getElementById(\"requestCopyMessage\")),e&&(e.classList.add(\"show\"),setTimeout(function(){e&&(e.style.opacity=\"0\"),setTimeout(function(){e&&(e.classList.remove(\"show\"),e.style.opacity=\"1\")},500)},1e3))}).catch(function(e){console.error(\"Failed to copy email: \",e)})}window.copyEmailToClipboard=a;document.getElementById(\"colorwheel\")?.addEventListener(\"click\",()=>{const o=[\"#3a6ea5\",\"#444444\",\"#c25237\",\"#524bd0\",\"#344242\"],t=o[Math.floor(Math.random()*o.length)],e=document.getElementById(\"overlay\");e&&(e.style.backgroundColor=t)});"]],"assets":["/_astro/AsciiEffect.8R29u7ks.js","/_astro/AsciiHearts.BstpCd53.js","/_astro/AsciiHearts.DGHvvXAN.js","/_astro/ModelLoader.B1iD2OZi.js","/_astro/OrbitControls.Bn8mG_4i.js","/_astro/RandomVisualization.DCVb0SFW.js","/_astro/client.D2WMwoKK.js","/_astro/contourVis.B0IkOmxw.js","/_astro/index.RH_Wq4ov.js","/_astro/jsx-runtime.D_zvdyIk.js","/_astro/lifeVis.BGXBbObj.js","/_astro/shapeshiftVis.xrbsopiv.js","/_astro/simplex-noise.1Zj9OLGt.js","/cursor/arrow.cur","/cursor/arrow.png","/cursor/loading.cur","/cursor/loading.png","/cursor/point.cur","/cursor/point.png","/cursor/text.cur","/css/cv.css","/css/style.css","/css/works.css","/img/colorwheel.png","/img/favicon.png","/img/me.png","/img/question.svg","/img/refresh.png","/img/visible.png","/obj/hand_d.obj","/obj/horse_d.obj","/about/index.html","/cv/index.html","/works/dataviz/index.html","/works/grid3/index.html","/works/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"WgUd+PIAMndlgFOJA+MSmjSsUQaIsfc70FpYzmoVBso=","sessionConfig":{"driver":"fs-lite","options":{"base":"/Users/matthewheaton/GitHub/0_WEB/mheatondotnet/node_modules/.astro/sessions"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/fs-lite_COtHaKzy.mjs');

export { manifest };
