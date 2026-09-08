import * as THREE from 'three';

const ease = (value) => value * value * (3 - 2 * value);

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? .65,
    metalness: options.metalness ?? .12,
    emissive: options.emissive ?? 0,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: true,
    opacity: options.opacity ?? 1,
  });
}

function box(width, height, depth, color, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color, options));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export class ThresholdScene {
  constructor(canvas, { onKnock, onOpen, onDoorOpen, onWebGLError } = {}) {
    this.canvas = canvas;
    this.onKnock = onKnock;
    this.onOpen = onOpen;
    this.onDoorOpen = onDoorOpen;
    this.onWebGLError = onWebGLError;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.leftDoor = null;
    this.rightDoor = null;
    this.roomLight = null;
    this.progress = 0;
    this.target = 0;
    this.knockCount = 0;
    this.knockUntil = 0;
    this.sequenceTimer = null;
    this.openTimer = null;
    this.didOpen = false;
    this.opening = false;
    this.walking = false;
    this.walkProgress = 0;
    this.walkStartZ = 7.8;
    this.walkEndZ = -1.2;
    this.theme = 'light';
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.clock = new THREE.Clock();
    this.time = 0;

    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } catch (error) {
      this.onWebGLError?.(error);
      return;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, .1, 30);
    this.camera.position.set(0, .1, 7.8);
    this.camera.lookAt(0, .1, 0);
    this.scene.add(new THREE.HemisphereLight(0xe6e0d4, 0x201c1a, 1.4));
    const key = new THREE.DirectionalLight(0xffead0, 2.2);
    key.position.set(-3, 5, 5);
    key.castShadow = true;
    this.scene.add(key);
    this.roomLight = new THREE.PointLight(0xd47b5d, 0, 9, 2);
    this.roomLight.position.set(0, .7, 1.5);
    this.scene.add(this.roomLight);
    this.createRoom();
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    this.animate();
  }

  createRoom() {
    const room = new THREE.Group();
    const floor = box(7.2, .12, 4.6, 0x847c71, { roughness: .88, metalness: .08 });
    floor.position.set(0, -2.18, .2);
    room.add(floor);
    const back = box(7.2, 5.2, .12, 0x252f2c, { roughness: .82, metalness: .08 });
    back.position.set(0, .35, -1.55);
    room.add(back);
    const ceiling = box(7.2, .1, 4.6, 0x34302b, { roughness: .75, metalness: .16 });
    ceiling.position.set(0, 2.72, .2);
    room.add(ceiling);
    const threshold = box(3.6, .08, .42, 0xb39476, { roughness: .56, metalness: .24 });
    threshold.position.set(0, -2.1, .2);
    room.add(threshold);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 3.7), new THREE.MeshBasicMaterial({ color: 0xd98768, transparent: true, opacity: 0 }));
    glow.position.set(0, .08, -1.47);
    room.add(glow);
    this.glow = glow;
    const frameTop = box(3.55, .18, .22, 0xaaa39a, { roughness: .34, metalness: .55 });
    frameTop.position.set(0, 2.35, -.98);
    room.add(frameTop);
    const frameLeft = box(.17, 4.0, .22, 0xaaa39a, { roughness: .34, metalness: .55 });
    frameLeft.position.set(-1.7, .35, -.98);
    const frameRight = frameLeft.clone();
    frameRight.position.x = 1.7;
    room.add(frameLeft, frameRight);

    const leftPivot = new THREE.Group();
    leftPivot.position.set(-1.7, .35, -.83);
    const leftDoor = box(1.68, 3.92, .18, 0x56615b, { roughness: .42, metalness: .42 });
    leftDoor.position.x = .84;
    leftPivot.add(leftDoor);
    const leftInset = box(1.28, 3.48, .025, 0x35433e, { roughness: .52, metalness: .24 });
    leftInset.position.set(.84, 0, .105);
    leftPivot.add(leftInset);
    const leftHandle = box(.04, .52, .04, 0xc3a77d, { roughness: .24, metalness: .75 });
    leftHandle.position.set(1.45, 0, .16);
    leftPivot.add(leftHandle);
    const rightPivot = new THREE.Group();
    rightPivot.position.set(1.7, .35, -.83);
    const rightDoor = box(1.68, 3.92, .18, 0x56615b, { roughness: .42, metalness: .42 });
    rightDoor.position.x = -.84;
    rightPivot.add(rightDoor);
    const rightInset = box(1.28, 3.48, .025, 0x35433e, { roughness: .52, metalness: .24 });
    rightInset.position.set(-.84, 0, .105);
    rightPivot.add(rightInset);
    const rightHandle = box(.04, .52, .04, 0xc3a77d, { roughness: .24, metalness: .75 });
    rightHandle.position.set(-1.45, 0, .16);
    rightPivot.add(rightHandle);
    room.add(leftPivot, rightPivot);
    this.leftDoor = leftPivot;
    this.rightDoor = rightPivot;
    this.room = room;
    this.scene.add(room);
  }

  startSequence() {
    // The door waits for a real visitor. The first click starts three deliberate knocks.
    return this;
  }

  knock() {
    if (this.didOpen) return;
    this.knockCount = Math.min(this.knockCount + 1, 3);
    this.knockUntil = performance.now() + 190;
    this.onKnock?.(this.knockCount);
  }

  open() {
    if (this.didOpen || this.opening) return;
    this.opening = true;
    if (this.sequenceTimer) window.clearTimeout(this.sequenceTimer);
    if (this.openTimer) window.clearTimeout(this.openTimer);
    if (this.knockTimer) window.clearTimeout(this.knockTimer);
    this.sequenceTimer = null;
    this.openTimer = null;
    let knocks = 0;
    const nextKnock = () => {
      knocks += 1;
      this.knock();
      if (knocks < 3) {
        this.sequenceTimer = window.setTimeout(nextKnock, 190);
        return;
      }
      this.sequenceTimer = null;
      this.openTimer = window.setTimeout(() => this.beginOpening(), 240);
    };
    nextKnock();
  }

  beginOpening() {
    if (this.didOpen) return;
    this.openTimer = null;
    this.target = 1;
    if (this.reducedMotion || !this.renderer) {
      this.progress = 1;
      this.updateDoors();
      this.startWalkthrough();
    }
  }

  startWalkthrough() {
    if (this.didOpen) return;
    this.didOpen = true;
    this.walkStartZ = this.camera?.position.z ?? this.walkStartZ;
    this.walkProgress = 0;
    this.onDoorOpen?.();
    if (this.reducedMotion || !this.renderer) {
      this.onOpen?.();
      return;
    }
    this.walking = true;
  }

  updateDoors() {
    const value = ease(this.progress);
    this.leftDoor.rotation.y = -value * .88;
    this.rightDoor.rotation.y = value * .88;
    if (this.roomLight) this.roomLight.intensity = value * (this.theme === 'dark' ? 3.2 : 2.4);
    if (this.glow) this.glow.material.opacity = value * .18;
  }

  updateWalkCamera() {
    if (!this.camera) return;
    const value = ease(Math.min(1, this.walkProgress));
    this.camera.position.z = THREE.MathUtils.lerp(this.walkStartZ, this.walkEndZ, value);
    this.camera.position.y = .1 + Math.sin(value * Math.PI) * .07;
    this.camera.position.x = Math.sin(value * Math.PI * 2) * .025;
    this.camera.fov = 32 + value * 5;
    this.camera.lookAt(0, .08, -.75 - value * .16);
    this.camera.updateProjectionMatrix();
  }

  setTheme(theme) {
    this.theme = theme === 'dark' ? 'dark' : 'light';
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const width = Math.max(1, this.canvas.clientWidth || window.innerWidth);
    const height = Math.max(1, this.canvas.clientHeight || window.innerHeight);
    this.camera.aspect = width / height;
    this.camera.position.z = width < 600 ? 9.2 : 7.8;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate() {
    if (!this.renderer) return;
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), .05);
    this.time += dt;
    if (!this.reducedMotion) this.progress += (this.target - this.progress) * Math.min(1, dt * 3.8);
    else this.progress = this.target;
    if (this.progress > .985 && this.target === 1 && !this.didOpen) this.startWalkthrough();
    this.updateDoors();

    if (this.walking) {
      this.walkProgress += dt * 1.15;
      this.updateWalkCamera();
      if (this.walkProgress >= 1) {
        this.walkProgress = 1;
        this.walking = false;
        this.onOpen?.();
      }
    } else if (performance.now() < this.knockUntil) {
      this.camera.position.x = Math.sin(this.knockUntil - performance.now()) * .035;
    } else {
      this.camera.position.x += (0 - this.camera.position.x) * dt * 8;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
