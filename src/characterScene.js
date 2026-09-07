import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const C = {
  floor: 0x091728,
  desk: 0x1b3555,
  deskEdge: 0x58a9ff,
  chair: 0x263d58,
  chairLight: 0x6b8eaf,
  hoodie: 0x102b49,
  hoodieLight: 0x244f79,
  skin: 0xc98569,
  skinLight: 0xe0a17f,
  hair: 0x111a29,
  trousers: 0x17283d,
  shoe: 0x07101c,
  screen: 0x103a63,
  blue: 0x58a9ff,
  cyan: 0x6fe5df,
  violet: 0x9e92ff,
  lime: 0xc5ef96,
  white: 0xedf4ff,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ease = (value) => value * value * (3 - 2 * value);

function physical(color, options = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: options.roughness ?? .68,
    metalness: options.metalness ?? .02,
    clearcoat: options.clearcoat ?? .14,
    clearcoatRoughness: options.clearcoatRoughness ?? .35,
    sheen: options.sheen ?? 0,
    sheenColor: options.sheenColor ?? color,
    emissive: options.emissive ?? 0,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    side: options.side ?? THREE.FrontSide,
  });
}

function roundedBox(width, height, depth, color, options = {}) {
  const radiusLimit = Math.max(.001, Math.min(width, height, depth) / 2 - .001);
  const radius = Math.min(options.radius ?? .08, radiusLimit);
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, radius, options.smoothness ?? 4), physical(color, options));
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

function sphere(radius, color, options = {}) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, options.segments ?? 26, options.rings ?? 18), physical(color, options));
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

function capsule(radius, length, color, options = {}) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, options.segments ?? 20), physical(color, options));
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

function cylinder(radiusTop, radiusBottom, height, color, options = {}) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, options.segments ?? 24), physical(color, options));
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

function makeDisplay() {
  const display = new THREE.Group();
  const frame = roundedBox(4.0, 1.72, .1, 0x0b1525, { radius: .12, roughness: .27, metalness: .42, clearcoat: .7 });
  frame.position.set(0, 3.4, -.92);
  display.add(frame);
  const glass = roundedBox(3.72, 1.43, .018, C.screen, { radius: .08, roughness: .18, clearcoat: .8, transparent: true, opacity: .9, emissive: C.screen, emissiveIntensity: .18 });
  glass.position.set(0, 3.4, -.855);
  display.add(glass);
  const topLine = roundedBox(3.35, .018, .01, C.blue, { radius: .006, roughness: .25, emissive: C.blue, emissiveIntensity: .8 });
  topLine.position.set(-.03, 3.95, -.84);
  display.add(topLine);
  const subLine = roundedBox(1.05, .018, .01, C.cyan, { radius: .006, roughness: .25, emissive: C.cyan, emissiveIntensity: .8 });
  subLine.position.set(-1.0, 2.91, -.84);
  display.add(subLine);
  const stand = cylinder(.06, .08, .55, 0x122a45, { segments: 20, roughness: .42, metalness: .36 });
  stand.position.set(0, 2.45, -.92);
  display.add(stand);
  const foot = roundedBox(.62, .05, .25, 0x122a45, { radius: .02, roughness: .38, metalness: .38 });
  foot.position.set(0, 2.2, -.92);
  display.add(foot);
  return display;
}

function makeDesk() {
  const desk = new THREE.Group();
  const top = roundedBox(4.7, .16, 1.2, C.desk, { radius: .06, roughness: .48, metalness: .18, clearcoat: .24 });
  top.position.set(0, 2.3, -.47);
  desk.add(top);
  const edge = roundedBox(4.6, .035, .04, C.deskEdge, { radius: .01, roughness: .34, metalness: .4, emissive: C.deskEdge, emissiveIntensity: .12 });
  edge.position.set(0, 2.2, .1);
  desk.add(edge);
  [-1.9, 1.9].forEach((x) => [-.87, -.18].forEach((z) => {
    const leg = cylinder(.04, .055, 2.16, 0x91a7bf, { segments: 16, roughness: .4, metalness: .25 });
    leg.position.set(x, 1.1, z);
    desk.add(leg);
  }));
  const keyboard = roundedBox(.85, .045, .33, 0x263b55, { radius: .02, roughness: .34, metalness: .3 });
  keyboard.position.set(0, 2.42, -.03);
  desk.add(keyboard);
  for (let row = 0; row < 3; row++) {
    const keys = roundedBox(.58 - row * .03, .01, .022, row === 1 ? C.cyan : C.white, { radius: .004, roughness: .35, emissive: row === 1 ? C.cyan : 0, emissiveIntensity: .45 });
    keys.position.set(0, 2.455, -.13 + row * .07);
    desk.add(keys);
  }
  const mouse = sphere(.09, C.violet, { segments: 14, rings: 8, roughness: .3, clearcoat: .4, emissive: C.violet, emissiveIntensity: .14 });
  mouse.scale.set(1, .45, 1.2);
  mouse.position.set(.63, 2.41, -.02);
  desk.add(mouse);
  const lightStrip = roundedBox(3.0, .018, .018, C.cyan, { radius: .008, roughness: .2, emissive: C.cyan, emissiveIntensity: .7 });
  lightStrip.position.set(0, 2.23, .12);
  desk.add(lightStrip);
  desk.add(makeDisplay());
  return desk;
}

function makeChair() {
  const chair = new THREE.Group();
  const back = roundedBox(1.02, 1.62, .2, C.chairLight, { radius: .16, roughness: .55, clearcoat: .27 });
  back.position.set(0, 1.98, .76);
  chair.add(back);
  const backPad = roundedBox(.76, 1.03, .04, C.chair, { radius: .1, roughness: .56, clearcoat: .18 });
  backPad.position.set(0, 1.98, .64);
  chair.add(backPad);
  const seat = roundedBox(1.1, .2, .88, C.chairLight, { radius: .12, roughness: .55, clearcoat: .22 });
  seat.position.set(0, 1.2, .35);
  chair.add(seat);
  const post = cylinder(.07, .11, .55, C.chair, { segments: 20, metalness: .55, roughness: .34 });
  post.position.set(0, .9, .35);
  chair.add(post);
  const base = cylinder(.1, .15, .08, C.chair, { segments: 20, metalness: .55, roughness: .34 });
  base.position.set(0, .59, .35);
  chair.add(base);
  [-.75, -.25, .25, .75].forEach((x) => {
    const spoke = roundedBox(.72, .055, .07, C.chair, { radius: .022, metalness: .45, roughness: .38 });
    spoke.position.set(x / 2, .55, .35);
    spoke.rotation.y = x * -.24;
    chair.add(spoke);
    const wheel = sphere(.09, 0x07111d, { segments: 14, rings: 8, roughness: .3, metalness: .5 });
    wheel.position.set(x, .45, .35);
    chair.add(wheel);
  });
  [-.56, .56].forEach((x) => {
    const arm = roundedBox(.12, .08, .62, C.chair, { radius: .03, roughness: .4, metalness: .3 });
    arm.position.set(x, 1.68, .44);
    chair.add(arm);
  });
  return chair;
}

function makeDeveloper() {
  const developer = new THREE.Group();
  developer.userData.walking = false;
  developer.userData.phase = Math.random() * Math.PI * 2;
  const torso = roundedBox(.84, 1.08, .62, C.hoodie, { radius: .15, roughness: .75, sheen: .2, sheenColor: C.hoodieLight });
  torso.position.set(0, 1.84, .28);
  developer.add(torso);
  developer.userData.torso = torso;
  const hood = new THREE.Mesh(new THREE.TorusGeometry(.41, .075, 12, 32, Math.PI * 1.05), physical(C.hoodieLight, { roughness: .76, sheen: .2, sheenColor: C.hoodieLight }));
  hood.position.set(0, 2.39, .24);
  hood.rotation.z = Math.PI;
  developer.add(hood);
  const neck = cylinder(.14, .16, .23, C.skin, { segments: 20, roughness: .6 });
  neck.position.set(0, 2.45, .26);
  developer.add(neck);
  const head = sphere(.46, C.skin, { segments: 32, rings: 22, roughness: .58, clearcoat: .15 });
  head.position.set(0, 2.8, .25);
  developer.add(head);
  developer.userData.head = head;
  const hair = sphere(.48, C.hair, { segments: 32, rings: 18, roughness: .32, metalness: .08, clearcoat: .48 });
  hair.position.set(0, 3.05, .2);
  hair.scale.set(1.02, .65, .98);
  developer.add(hair);
  [-.26, -.08, .1, .27].forEach((x, index) => {
    const lock = sphere(.11 - index * .006, C.hair, { segments: 18, rings: 10, roughness: .3, metalness: .08, clearcoat: .5 });
    lock.scale.set(.8, 1.22, .7);
    lock.position.set(x, 3.05 - Math.abs(x) * .1, .56);
    developer.add(lock);
  });
  const ear = sphere(.1, C.skin, { segments: 16, rings: 10, roughness: .58 });
  ear.position.set(.43, 2.79, .25);
  developer.add(ear);
  const headphones = new THREE.Mesh(new THREE.TorusGeometry(.49, .035, 8, 28, Math.PI), physical(C.chair, { roughness: .3, metalness: .45, clearcoat: .5 }));
  headphones.position.set(0, 3.0, .16);
  headphones.rotation.z = Math.PI;
  developer.add(headphones);
  [-.47, .47].forEach((x) => {
    const cup = roundedBox(.12, .2, .15, C.blue, { radius: .045, emissive: C.blue, emissiveIntensity: .12, roughness: .34, metalness: .24 });
    cup.position.set(x, 2.82, .2);
    developer.add(cup);
  });

  const armLeft = new THREE.Group();
  const armRight = new THREE.Group();
  armLeft.position.set(-.43, 2.18, .16);
  armRight.position.set(.43, 2.18, .16);
  const sleeveL = capsule(.13, .58, C.hoodie, { roughness: .76, sheen: .2, sheenColor: C.hoodieLight });
  const sleeveR = sleeveL.clone();
  sleeveL.position.set(0, -.27, -.16); sleeveL.rotation.x = .83;
  sleeveR.position.set(0, -.27, -.16); sleeveR.rotation.x = .83;
  const handL = sphere(.13, C.skin, { segments: 18, rings: 12, roughness: .55 });
  const handR = handL.clone();
  handL.position.set(0, -.58, -.53); handR.position.set(0, -.58, -.53);
  armLeft.add(sleeveL, handL); armRight.add(sleeveR, handR);
  developer.add(armLeft, armRight);
  developer.userData.arms = { left: armLeft, right: armRight };

  const thighL = roundedBox(.24, .25, .9, C.trousers, { radius: .08, roughness: .84 });
  const thighR = thighL.clone();
  thighL.position.set(-.2, 1.17, -.17); thighL.rotation.x = Math.PI / 2;
  thighR.position.set(.2, 1.17, -.17); thighR.rotation.x = Math.PI / 2;
  developer.add(thighL, thighR);
  const calfL = capsule(.13, .5, C.trousers, { roughness: .87 });
  const calfR = calfL.clone();
  calfL.position.set(-.2, .78, -.66); calfR.position.set(.2, .78, -.66);
  developer.add(calfL, calfR);
  const shoeL = roundedBox(.3, .16, .54, C.shoe, { radius: .05, roughness: .35, clearcoat: .4 });
  const shoeR = shoeL.clone();
  shoeL.position.set(-.2, .34, -.76); shoeR.position.set(.2, .34, -.76);
  developer.add(shoeL, shoeR);
  developer.userData.legs = { left: calfL, right: calfR };
  return developer;
}

export class CharacterScene {
  constructor(canvas, { onWebGLError } = {}) {
    this.canvas = canvas;
    this.onWebGLError = onWebGLError;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.rig = null;
    this.developer = null;
    this.shadow = null;
    this.clock = new THREE.Clock();
    this.time = 0;
    this.move = null;
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.positions = [-1.15, -.57, 0, .57, 1.15];
    this.positionIndex = 0;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.1;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } catch (error) {
      this.onWebGLError?.(error);
      return;
    }
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(29, 1, .1, 50);
    this.camera.position.set(4.4, 3.75, 10.7);
    this.camera.lookAt(0, 1.85, -.15);
    this.scene.add(new THREE.HemisphereLight(0xd8ecff, 0x06101e, 1.75));
    const key = new THREE.DirectionalLight(0xe9f4ff, 4.4);
    key.position.set(-4, 8, 8); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.near = .5; key.shadow.camera.far = 24; key.shadow.camera.left = -6; key.shadow.camera.right = 6; key.shadow.camera.top = 7; key.shadow.camera.bottom = -2; this.scene.add(key);
    const blueFill = new THREE.PointLight(C.blue, 3.4, 12, 2); blueFill.position.set(3.4, 4.5, -2.2); this.scene.add(blueFill);
    const cyanFill = new THREE.PointLight(C.cyan, 2.1, 10, 2); cyanFill.position.set(-4, 2.5, 5); this.scene.add(cyanFill);
    this.createStage();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  createStage() {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), physical(C.floor, { roughness: .95, metalness: .02, clearcoat: .02 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -.05; floor.receiveShadow = true; this.scene.add(floor);
    this.scene.add(makeDesk());
    this.rig = new THREE.Group();
    this.rig.add(makeChair());
    this.developer = makeDeveloper();
    this.rig.add(this.developer);
    this.rig.position.set(0, 0, .2);
    this.scene.add(this.rig);
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(1.2, 48), new THREE.MeshBasicMaterial({ color: 0x02050a, transparent: true, opacity: .42, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2; this.shadow.position.set(0, .012, .42); this.scene.add(this.shadow);
  }

  setSection(index) {
    if (!this.rig) return;
    this.positionIndex = clamp(index, 0, 4);
    this.move = { start: performance.now(), duration: this.reducedMotion ? 1 : 980, fromX: this.rig.position.x, toX: this.positions[this.positionIndex] };
    this.developer.userData.walking = true;
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    const width = Math.max(1, rect?.width || window.innerWidth);
    const height = Math.max(1, rect?.height || window.innerHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    const distance = Math.hypot(this.camera.position.z, this.camera.position.y - 1.85);
    const visibleHalfWidth = distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect;
    const maxX = clamp(visibleHalfWidth * .28, .8, 1.42);
    this.positions = [-maxX, -maxX / 2, 0, maxX / 2, maxX];
    if (this.move) this.move.toX = this.positions[this.positionIndex];
    else if (this.rig) { this.rig.position.x = this.positions[this.positionIndex]; this.shadow.position.x = this.rig.position.x; }
  }

  animate() {
    if (!this.renderer) return;
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), .05);
    this.time += dt;
    if (this.move) {
      const progress = clamp((performance.now() - this.move.start) / this.move.duration, 0, 1);
      const t = ease(progress);
      this.rig.position.x = THREE.MathUtils.lerp(this.move.fromX, this.move.toX, t);
      if (progress >= 1) { this.move = null; this.developer.userData.walking = false; }
    }
    const motion = this.developer.userData.walking ? this.time * 11 : this.time * 1.6;
    const arm = this.developer.userData.walking ? Math.sin(motion) * .08 : Math.sin(motion) * .018;
    this.developer.userData.arms.left.rotation.z = -.05 - arm;
    this.developer.userData.arms.right.rotation.z = .05 + arm;
    this.developer.userData.legs.left.rotation.x = this.developer.userData.walking ? Math.sin(motion) * .07 : 0;
    this.developer.userData.legs.right.rotation.x = this.developer.userData.walking ? -Math.sin(motion) * .07 : 0;
    this.developer.userData.torso.position.y = 1.84 + Math.sin(this.time * 1.5 + this.developer.userData.phase) * .006;
    this.developer.userData.head.rotation.y = Math.sin(this.time * .55) * .025;
    this.shadow.position.x = this.rig.position.x;
    this.shadow.scale.x = 1 + (this.developer.userData.walking ? Math.abs(Math.sin(motion)) * .06 : 0);
    this.renderer.render(this.scene, this.camera);
  }
}
