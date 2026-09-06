const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const root = __dirname;
const port = process.env.PORT || 3000;
const libraryFile = path.join(root, "index.html");
const excludedHtmlFiles = new Set(["index.html", "library.html"]);

function findHTMLFiles(directory, relativeDirectory = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ["node_modules", ".git"].includes(entry.name)) {
      return [];
    }

    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.join(relativeDirectory, entry.name);

    if (entry.isDirectory()) {
      return findHTMLFiles(absolutePath, relativePath);
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      return [relativePath.split(path.sep).join("/")];
    }

    return [];
  });
}

function findBackgroundImages(directory, relativeDirectory = "") {
  const supported = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) return findBackgroundImages(absolutePath, relativePath);
    if (entry.isFile() && supported.has(path.extname(entry.name).toLowerCase())) {
      return [relativePath.split(path.sep).join("/")];
    }
    return [];
  });
}

app.get("/api/html-files", (_request, response) => {
  try {
    const files = findHTMLFiles(root)
      .filter((file) => {
        const name = file.split("/").pop().toLowerCase();
        return !excludedHtmlFiles.has(name);
      })
      .sort((first, second) => first.localeCompare(second));
    response.json(files);
  } catch (error) {
    console.error("HTML scan failed:", error);
    response.status(500).json({ error: "Could not scan HTML files." });
  }
});

app.get("/api/background-images", (_request, response) => {
  try {
    const imageRoot = path.join(root, "webichan_images");
    if (!fs.existsSync(imageRoot)) return response.json([]);
    response.json(findBackgroundImages(imageRoot).map((file) => `/webichan_images/${file}`));
  } catch (error) {
    console.error("Background image scan failed:", error);
    response.status(500).json({ error: "Could not scan background images." });
  }
});

app.get("/", (_request, response) => {
  const page = fs.readFileSync(libraryFile, "utf8");
  const recovery = `<script>
    if (!document.querySelector('.preview-card') && typeof load === 'function') load();
    document.querySelectorAll('.preview-frame').forEach((frame) => frame.addEventListener('load', () => frame.classList.add('loaded'), { once: true }));
    if (window.THREE && !window.__cuteStar) {
      window.__cuteStar = true;
      const host = document.getElementById('heroArt');
      host.querySelectorAll('canvas').forEach((canvas) => canvas.remove());
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, .1, 100);
      camera.position.z = 6;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      scene.add(new THREE.AmbientLight(0xffffff, 2));
      const key = new THREE.DirectionalLight(0xb9fbff, 4); key.position.set(-3, 4, 5); scene.add(key);
      const fill = new THREE.PointLight(0xb14dff, 9, 8); fill.position.set(3, -1, 3); scene.add(fill);
      const group = new THREE.Group(); scene.add(group);
      const shape = new THREE.Shape();
      for (let i = 0; i < 10; i++) { const angle = -Math.PI / 2 + i * Math.PI / 5; const radius = i % 2 ? .66 : 1.35; const x = Math.cos(angle) * radius; const y = Math.sin(angle) * radius; i ? shape.lineTo(x, y) : shape.moveTo(x, y); }
      shape.closePath();
      const star = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .38, bevelEnabled: true, bevelSegments: 4, steps: 2, bevelSize: .1, bevelThickness: .1 }), new THREE.MeshPhysicalMaterial({ color: 0x9d51ef, metalness: .12, roughness: .16, clearcoat: 1, clearcoatRoughness: .08 }));
      star.rotation.x = -.16; group.add(star);
      const faceMaterial = new THREE.MeshBasicMaterial({ color: 0x17131f });
      [-.3, .3].forEach((x) => { const eye = new THREE.Mesh(new THREE.SphereGeometry(.105, 16, 12), faceMaterial); eye.position.set(x, -.02, .52); eye.scale.y = 1.35; group.add(eye); });
      const mouth = new THREE.Mesh(new THREE.TorusGeometry(.16, .035, 8, 18, Math.PI), faceMaterial); mouth.position.set(0, -.34, .52); mouth.rotation.z = Math.PI; group.add(mouth);
      const blushMaterial = new THREE.MeshBasicMaterial({ color: 0xff91c8, transparent: true, opacity: .8 });
      [-.53, .53].forEach((x) => { const blush = new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 12), blushMaterial); blush.position.set(x, -.3, .52); blush.scale.set(1.35, .55, .2); group.add(blush); });
      const sparkle = new THREE.Mesh(new THREE.SphereGeometry(.1, 16, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); sparkle.position.set(-.48, .5, .55); group.add(sparkle);
      let tx = 0, ty = 0; host.addEventListener('pointermove', (event) => { const rect = host.getBoundingClientRect(); tx = (event.clientX - rect.left) / rect.width - .5; ty = (event.clientY - rect.top) / rect.height - .5; });
      const resize = () => { const rect = host.getBoundingClientRect(); camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix(); renderer.setSize(rect.width, rect.height, false); }; new ResizeObserver(resize).observe(host); resize();
      const animate = () => { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) { group.rotation.y += (tx * .35 - group.rotation.y) * .04; group.rotation.x += (-ty * .2 - group.rotation.x) * .04; group.rotation.z = Math.sin(performance.now() * .0007) * .08; group.position.y = Math.sin(performance.now() * .001) * .08; } renderer.render(scene, camera); requestAnimationFrame(animate); }; animate();
    }
  </script>`;
  const character = `<script>
    if (window.THREE && !window.__webcoreCharacter) {
      window.__webcoreCharacter = true;
      const host = document.getElementById('heroArt'); host.querySelectorAll('canvas').forEach((canvas) => canvas.remove());
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(24, 1, .1, 100); camera.position.set(0, 1.6, 6.3);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace; host.appendChild(renderer.domElement);
      scene.add(new THREE.HemisphereLight(0xdffeff, 0x24113c, 2.8)); const key = new THREE.DirectionalLight(0xd8ffff, 4.5); key.position.set(-4, 6, 7); scene.add(key); const rim = new THREE.PointLight(0x9b4dff, 10, 12); rim.position.set(4, 1, 4); scene.add(rim);
      const girl = new THREE.Group(); girl.position.y = -.25; scene.add(girl);
      const skin = new THREE.MeshPhysicalMaterial({ color: 0xffd0bd, roughness: .42, clearcoat: .25 }), hair = new THREE.MeshPhysicalMaterial({ color: 0x398bfa, metalness: .12, roughness: .2, clearcoat: 1 }), purple = new THREE.MeshPhysicalMaterial({ color: 0x442363, metalness: .25, roughness: .25, clearcoat: 1 }), white = new THREE.MeshPhysicalMaterial({ color: 0xdbe9ff, roughness: .35 }), neon = new THREE.MeshBasicMaterial({ color: 0x72faff }), dark = new THREE.MeshPhysicalMaterial({ color: 0x111528, metalness: .35, roughness: .22, clearcoat: 1 }), eye = new THREE.MeshBasicMaterial({ color: 0x168dff });
      const add = (geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) => { const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); mesh.scale.set(...scale); mesh.rotation.set(...rotation); girl.add(mesh); return mesh; };
      const capsule = (radius, length, material, position, rotation = [0, 0, 0], scale = [1, 1, 1]) => add(new THREE.CapsuleGeometry(radius, length, 8, 16), material, position, scale, rotation);
      add(new THREE.SphereGeometry(.72, 32, 24), skin, [0, 2.35, 0], [.82, 1, .78]); add(new THREE.SphereGeometry(.82, 32, 20), hair, [0, 2.7, -.02], [.95, .8, .8]);
      for (let i = 0; i < 7; i++) { const a = -1.2 + i * .4; add(new THREE.SphereGeometry(.42, 20, 16), hair, [Math.sin(a) * .92, 2.48 + Math.cos(a) * .5, -.05], [.55, 1.18, .55], [0, 0, a * .32]); }
      for (let i = 0; i < 5; i++) { const a = i * .48 - .9; add(new THREE.SphereGeometry(.35, 20, 16), hair, [Math.sin(a) * (1.05 + i * .08), 2.1 - i * .17, -.02], [.7, 1.55, .6], [0, 0, a]); }
      add(new THREE.TorusGeometry(.78, .075, 10, 28, Math.PI), dark, [0, 2.66, -.04], [1, 1, 1], [Math.PI / 2, 0, 0]); add(new THREE.TorusGeometry(.3, .07, 10, 24), dark, [-.76, 2.35, 0], [1, 1.5, 1], [0, Math.PI / 2, 0]); add(new THREE.TorusGeometry(.3, .07, 10, 24), dark, [.76, 2.35, 0], [1, 1.5, 1], [0, Math.PI / 2, 0]);
      [-.27, .27].forEach((x) => { add(new THREE.SphereGeometry(.13, 18, 14), eye, [x, 2.4, .69], [1, 1.35, .35]); add(new THREE.SphereGeometry(.035, 10, 8), white, [x + .04, 2.47, .75], [.8, .8, .2]); }); add(new THREE.TorusGeometry(.14, .035, 8, 18, Math.PI), purple, [0, 2.1, .7], [1, 1, 1], [0, 0, Math.PI]);
      capsule(.62, .75, purple, [0, 1.35, 0], [0, 0, 0], [1.15, 1, .65]); capsule(.4, .95, skin, [0, .55, 0], [0, 0, 0], [.78, 1, .55]); add(new THREE.TorusGeometry(.42, .035, 8, 24), neon, [0, 1.45, .47], [1.1, .5, .7], [Math.PI / 2, 0, 0]);
      [[-.78, 1.3, -.02, -.35], [.78, 1.3, -.02, .35]].forEach(([x, y, z, r]) => { capsule(.22, .9, white, [x, y, z], [0, 0, r]); capsule(.18, .42, dark, [x * 1.22, .82, z], [0, 0, r]); add(new THREE.SphereGeometry(.18, 16, 12), neon, [x * 1.25, .59, .08], [.8, .35, .25]); });
      add(new THREE.CylinderGeometry(.43, .58, .25, 6), dark, [-.34, .45, 0], [1, 1, 1], [0, 0, -.08]); add(new THREE.CylinderGeometry(.43, .58, .25, 6), dark, [.34, .45, 0], [1, 1, 1], [0, 0, .08]);
      [[-.34, -.05, .02], [.34, -.05, .02]].forEach(([x, y, z]) => { capsule(.2, .85, skin, [x, y, z]); add(new THREE.BoxGeometry(.5, .22, .8), dark, [x, -.52, .08], [1, 1, 1]); add(new THREE.BoxGeometry(.38, .035, .65), neon, [x, -.39, .5], [1, 1, .3]); });
      girl.scale.setScalar(1.16); const resize = () => { const r = host.getBoundingClientRect(); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); renderer.setSize(r.width, r.height, false); }; new ResizeObserver(resize).observe(host); resize(); let tx = 0, ty = 0; host.addEventListener('pointermove', (event) => { const r = host.getBoundingClientRect(); tx = (event.clientX - r.left) / r.width - .5; ty = (event.clientY - r.top) / r.height - .5; }); const animate = () => { girl.rotation.y += (tx * .22 - girl.rotation.y) * .035; girl.rotation.x += (-ty * .1 - girl.rotation.x) * .035; girl.position.y = -.25 + Math.sin(performance.now() * .001) * .08; renderer.render(scene, camera); requestAnimationFrame(animate); }; animate();
    }
  </script>`;
  const previewPage = page.replace("heroScene();load();", "load();").replaceAll("allow-scripts allow-forms allow-modals", "allow-scripts allow-same-origin allow-forms allow-modals").replace("frame.addEventListener(\"load\",()=>loader.classList.add(\"hidden\"),{once:true});", "frame.addEventListener(\"load\",()=>{loader.classList.add(\"hidden\");frame.classList.add(\"loaded\")},{once:true});").replace(".preview-frame{position:absolute;top:0;left:0;width:200%;height:200%;border:0;background:#fff;transform:scale(.5);transform-origin:top left;background:#fff;transition:transform .35s ease}", ".preview-frame{position:absolute;top:0;left:0;width:200%;height:200%;border:0;background:#fff;transform:scale(.5);transform-origin:top left;opacity:0;transition:transform .35s ease,opacity .8s ease}.preview-frame.loaded{opacity:1}");
  const mascotStyles = `<style>
    html,body{overflow-x:hidden!important}.mascot-backdrop{position:fixed;inset:0;width:100%;height:100%;z-index:0;object-fit:cover;object-position:center top;pointer-events:none;opacity:.34;filter:saturate(1.18) contrast(1.08);transform:translate3d(0,var(--mascot-shift,0px),0);transition:transform .2s ease-out}
    .mascot-wash{position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(180deg,rgba(5,5,7,.3) 0%,rgba(5,5,7,.72) 48%,rgba(5,5,7,.97) 88%)}
    .page-shell{position:relative;z-index:1}
    .hero{position:relative}.hero-art{display:none}.hero:before{content:"";position:absolute;inset:8% 10% 0;z-index:-1;border-radius:50%;background:radial-gradient(ellipse,rgba(43,201,255,.12),transparent 65%);filter:blur(24px);pointer-events:none}
    .work,.library,.footer{position:relative}.work:before,.library:before{content:"";position:absolute;inset:0 -20vw;z-index:-1;background:linear-gradient(180deg,rgba(5,5,7,.32),rgba(5,5,7,.82));pointer-events:none}
    @media(max-width:700px){.mascot-backdrop{object-position:58% top;opacity:.28}.hero:before{inset:10% 0 0}.wc-carousel-card{flex-basis:46vw;height:min(64vw,270px)}}
  </style>`;
  const parallax = "<script>if(!matchMedia('(prefers-reduced-motion: reduce)').matches){addEventListener('scroll',()=>document.documentElement.style.setProperty('--mascot-shift',Math.min(scrollY*.045,34)+'px'),{passive:true})}</script>";
  const mascotMarkup = `<img class="mascot-backdrop" src="/webichan_images/web1.png" alt=""><div class="mascot-wash" aria-hidden="true"></div>`;
  const carouselAssets = `<link rel="stylesheet" href="/carousel.css"><style>@media(max-width:700px){.wc-carousel-card{flex-basis:46vw;height:min(64vw,270px)}}</style><script src="/carousel.js" defer></script>`;
  const carouselMarkup = `<section class="wc-carousel-section" id="experimentCarousel" aria-labelledby="experimentCarouselTitle"><div class="wc-carousel-heading"><p class="wc-carousel-kicker">The living collection</p><h2 class="wc-carousel-title" id="experimentCarouselTitle">EXPLORE THE EXPERIMENTS</h2><p class="wc-carousel-subtitle">A living collection of creative HTML experiences.</p></div><div class="wc-carousel-shell"><div class="wc-carousel-viewport" tabindex="0" aria-label="HTML experiment carousel"><div class="wc-carousel-track"></div><p class="wc-carousel-empty">Loading experiments...</p></div></div><div class="wc-carousel-controls"><button class="wc-carousel-button" type="button" data-carousel-previous aria-label="Previous experiment">&#8592;</button><button class="wc-carousel-button" type="button" data-carousel-next aria-label="Next experiment">&#8594;</button></div></section>`;
  const animationAssets = `<link rel="stylesheet" href="/animations.css"><script src="/animations.js" defer></script>`;
  response.type("html").send(previewPage.replace("</style>", `${mascotStyles}</style>`).replace("</head>", `${animationAssets}${carouselAssets}</head>`).replace("<body>", `<body>${mascotMarkup}`).replace('</a></header>', `</a>${carouselMarkup}</header>`).replace("</body>", `${parallax}</body>`));
});

app.use(express.static(root, { extensions: ["html"] }));

app.listen(port, () => {
  console.log(`WEBCore running at http://localhost:${port}`);
});
