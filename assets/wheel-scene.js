import * as THREE from './vendor/three.module.js';

export function mountWheel() {
  const layer = document.createElement('div');
  layer.className = 'wheel-backdrop';
  layer.setAttribute('aria-hidden', 'true');
  const stage = document.createElement('div');
  stage.className = 'wheel-stage';
  layer.append(stage);
  document.body.prepend(layer);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    layer.remove();
    return;
  }
  stage.append(renderer.domElement);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 30);
  camera.position.set(0, 0, 7.3);
  const wheel = new THREE.Group();
  const rotor = new THREE.Group();
  wheel.add(rotor);
  scene.add(wheel);
  scene.add(new THREE.HemisphereLight(0xcbd9ee, 0x15110c, 2.1));
  const key = new THREE.DirectionalLight(0xf4f1e9, 5);
  key.position.set(-3, 4, 5); scene.add(key);
  const edge = new THREE.DirectionalLight(0xc8ddff, 3.2);
  edge.position.set(4, -1, 3); scene.add(edge);
  const rimLight = new THREE.DirectionalLight(0xd9e0e8, 2);
  rimLight.position.set(1, 3, -4); scene.add(rimLight);

  const alloy = new THREE.MeshStandardMaterial({ color: 0xc1c5c7, metalness: .78, roughness: .19 });
  const graphite = new THREE.MeshPhysicalMaterial({ color: 0x181c21, metalness: .65,
    roughness: .23, clearcoat: 1, clearcoatRoughness: .15, side: THREE.DoubleSide });
  const face = new THREE.MeshPhysicalMaterial({ color: 0x30353a, metalness: .7,
    roughness: .2, clearcoat: 1, clearcoatRoughness: .12 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x080b0e, roughness: .55 });
  function mesh(geometry, material, parent = rotor) {
    const object = new THREE.Mesh(geometry, material); parent.add(object); return object;
  }
  function ring(radius, tube, z, material, parent = rotor) {
    const object = mesh(new THREE.TorusGeometry(radius, tube, 12, 80), material, parent);
    object.position.z = z;
    return object;
  }
  function cylinder(radius, depth, z, material, parent = rotor) {
    const object = mesh(new THREE.CylinderGeometry(radius, radius, depth, 64), material, parent);
    object.rotation.x = Math.PI / 2; object.position.z = z; return object;
  }
  // Open, deep barrel and machined lips match the reference's bare alloy rim.
  const profile = [[1.59,-.6],[1.63,-.57],[1.63,-.49],[1.56,-.43],
    [1.52,-.3],[1.52,.15],[1.57,.28],[1.62,.31],[1.63,.35],[1.59,.37]];
  const barrel = mesh(new THREE.LatheGeometry(profile.map(([r,z]) => new THREE.Vector2(r,z)), 96), graphite);
  barrel.rotation.x = Math.PI / 2;
  ring(1.615, .018, .35, alloy);
  ring(1.57, .009, .32, alloy);
  ring(1.615, .016, -.58, alloy);
  ring(1.58, .012, -.47, graphite);

  // Ten angular Y spokes: narrow black faces, bright bevels and a recessed hub.
  // The front slopes outward with radius to form a genuinely concave wheel face.
  const spokeShape = new THREE.Shape();
  const outline = [[-.04,.24],[.04,.24],[.065,.68],[.265,1.51],
    [.23,1.575],[.19,1.51],[.015,.86],[-.015,.86],[-.19,1.51],
    [-.23,1.575],[-.265,1.51],[-.065,.68]];
  outline.forEach(([x,y],i) => i ? spokeShape.lineTo(x,y) : spokeShape.moveTo(x,y));
  spokeShape.closePath();
  const spokeGeometry = new THREE.ExtrudeGeometry(spokeShape, {
    depth: .055, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .008, bevelThickness: .008
  });
  const vertices = spokeGeometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const radius = Math.hypot(vertices.getX(i), vertices.getY(i));
    vertices.setZ(i, vertices.getZ(i) - .14 + .42 * Math.pow(radius / 1.6, 1.5));
  }
  spokeGeometry.computeVertexNormals();
  for (let i = 0; i < 10; i++) {
    const spoke = mesh(spokeGeometry, [face, alloy]);
    spoke.rotation.z = i / 10 * Math.PI * 2;
  }
  cylinder(.29, .12, -.095, graphite);
  ring(.177, .016, -.012, alloy);
  cylinder(.16, .045, -.015, graphite);
  ring(.125, .004, .009, alloy);
  // A simple inset badge keeps the center understated without copying a logo.
  const badge = mesh(new THREE.BoxGeometry(.075,.01,.008), alloy);
  badge.position.set(0, .018, .012); badge.rotation.z = -.45;
  const badgeLower = mesh(new THREE.BoxGeometry(.075,.01,.008), alloy);
  badgeLower.position.set(0, -.018, .012); badgeLower.rotation.z = -.45;
  for (let i = 0; i < 5; i++) {
    const angle = i / 5 * Math.PI * 2 + Math.PI / 10;
    const socket = cylinder(.043, .025, -.025, dark);
    const bolt = cylinder(.024, .018, -.004, alloy);
    for (const detail of [socket, bolt]) {
      detail.position.x = Math.cos(angle) * .23;
      detail.position.y = Math.sin(angle) * .23;
    }
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let current = 0;
  let target = 0;
  let previous = 0;
  let lost = false;
  function updateTarget() {
    const distance = document.documentElement.scrollHeight - innerHeight;
    target = reduce.matches ? .12 : Math.max(0, Math.min(1, scrollY / Math.max(1, distance)));
    schedule();
  }
  function render(time) {
    frame = 0;
    if (document.hidden || lost) return;
    const dt = Math.min(64, previous ? time - previous : 16);
    previous = time;
    current = reduce.matches ? target : current + (target - current) * (1 - Math.exp(-dt / 150));
    wheel.rotation.set(-.16 + Math.sin(current * Math.PI * 2) * .12, -.62 + Math.sin(current * Math.PI * 2 - .4) * .18, -.1);
    rotor.rotation.z = .18 - current * Math.PI * 2.2;
    wheel.position.y = Math.sin(current * Math.PI * 2) * .18;
    renderer.render(scene, camera);
    if (Math.abs(target - current) > .00005) schedule();
    else previous = 0;
  }
  function schedule() {
    if (!frame && !document.hidden && !lost) frame = requestAnimationFrame(render);
  }
  function resize() {
    const width = stage.clientWidth;
    renderer.setSize(width, width, false);
    updateTarget();
  }
  window.addEventListener('scroll', updateTarget, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pageshow', updateTarget);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    else updateTarget();
  });
  reduce.addEventListener('change', updateTarget);
  if ('ResizeObserver' in window) new ResizeObserver(updateTarget).observe(document.body);
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost = true; cancelAnimationFrame(frame); frame = 0;
    layer.classList.remove('is-ready');
    document.documentElement.classList.remove('has-wheel');
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    lost = false; layer.classList.add('is-ready');
    document.documentElement.classList.add('has-wheel'); resize();
  });
  resize();
  current = target;
  document.documentElement.classList.add('has-wheel');
  layer.classList.add('is-ready');
}
