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
  const key = new THREE.DirectionalLight(0xffe4b3, 5);
  key.position.set(-3, 4, 5); scene.add(key);
  const edge = new THREE.DirectionalLight(0xc8ddff, 3.2);
  edge.position.set(4, -1, 3); scene.add(edge);
  const rimLight = new THREE.DirectionalLight(0xe8ba73, 2);
  rimLight.position.set(1, 3, -4); scene.add(rimLight);

  const alloy = new THREE.MeshStandardMaterial({ color: 0xaaa59b, metalness: .72, roughness: .26 });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x333941, metalness: .65, roughness: .34 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x101217, metalness: .04, roughness: .87 });
  const tread = new THREE.MeshStandardMaterial({ color: 0x1c1f24, roughness: .92 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4af68, metalness: .67, roughness: .3 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x555b63, metalness: .7, roughness: .55 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x080b0e, roughness: .9 });
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
  // Sidewall profile gives the tire real depth instead of a flat circular graphic.
  const tire = ring(1.47, .245, 0, rubber);
  tire.scale.z = 1.35;
  ring(1.49, .012, .29, tread);
  ring(1.35, .014, .245, tread);
  ring(1.49, .012, -.29, tread);
  const barrel = mesh(new THREE.CylinderGeometry(1.255, 1.255, .5, 80, 1, true), graphite);
  barrel.rotation.x = Math.PI / 2;
  ring(1.265, .043, .27, alloy);
  ring(1.265, .035, -.26, graphite);
  ring(1.19, .015, .28, gold);
  cylinder(1.09, .055, -.10, steel);
  ring(.88, .008, -.065, graphite);
  ring(1.02, .007, -.065, graphite);

  // Instancing keeps the tread and drilled brake details inexpensive on mobile.
  const treadBlocks = new THREE.InstancedMesh(new THREE.BoxGeometry(.045, .018, .38), tread, 64);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 64; i++) {
    const angle = i / 64 * Math.PI * 2;
    dummy.position.set(Math.cos(angle) * 1.708, Math.sin(angle) * 1.708, 0);
    dummy.rotation.set(0, 0, angle - Math.PI / 2);
    dummy.updateMatrix(); treadBlocks.setMatrixAt(i, dummy.matrix);
  }
  rotor.add(treadBlocks);
  const holes = new THREE.InstancedMesh(new THREE.CircleGeometry(.023, 8), dark, 48);
  for (let i = 0; i < 48; i++) {
    const angle = i / 24 * Math.PI * 2 + (i >= 24 ? .07 : 0);
    const radius = i < 24 ? .94 : .79;
    dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, -.069);
    dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); holes.setMatrixAt(i, dummy.matrix);
  }
  rotor.add(holes);
  // Five pairs of tapered, bevelled spokes, with the brake caliper behind them.
  const spokeShape = new THREE.Shape();
  spokeShape.moveTo(-.07, .24); spokeShape.lineTo(.07, .24);
  spokeShape.lineTo(.13, 1.19); spokeShape.lineTo(.035, 1.23); spokeShape.closePath();
  const spokeGeometry = new THREE.ExtrudeGeometry(spokeShape, {
    depth: .075, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .018, bevelThickness: .018
  });
  for (let i = 0; i < 5; i++) {
    for (const offset of [-.13, .13]) {
      const spoke = mesh(spokeGeometry, alloy);
      spoke.rotation.z = i / 5 * Math.PI * 2 + offset;
      spoke.position.z = .18;
    }
  }
  const caliper = mesh(new THREE.BoxGeometry(.24, .66, .19), gold, wheel);
  caliper.position.set(.91, .12, .015); caliper.rotation.z = -.16;
  cylinder(.30, .12, .23, graphite);
  cylinder(.19, .035, .31, gold);
  cylinder(.15, .04, .335, graphite);
  for (let i = 0; i < 5; i++) {
    const angle = i / 5 * Math.PI * 2;
    const bolt = cylinder(.038, .04, .32, alloy);
    bolt.position.x = Math.cos(angle) * .245;
    bolt.position.y = Math.sin(angle) * .245;
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
    wheel.rotation.set(-.16 + Math.sin(current * Math.PI * 2) * .12, -.48 + Math.sin(current * Math.PI * 2 - .4) * .32, -.1);
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
