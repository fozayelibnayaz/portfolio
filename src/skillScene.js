import * as THREE from 'three';

const palette = [0x58a9ff, 0x6fe5df, 0x9e92ff, 0xc5ef96, 0x8ec8ff];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function makeLabel(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(8, 17, 31, .84)';
  context.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(5, 5, canvas.width - 10, canvas.height - 10, 18);
  context.fill();
  context.stroke();
  context.fillStyle = '#edf4ff';
  context.font = '600 28px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: .94 });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.34, .335, 1);
  return sprite;
}

export class SkillScene {
  constructor(canvas, { labels = [], onWebGLError } = {}) {
    this.canvas = canvas;
    this.onWebGLError = onWebGLError;
    this.labels = labels;
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.clock = new THREE.Clock();
    this.time = 0;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.orbit = null;
    this.resizeObserver = null;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
    } catch (error) {
      this.onWebGLError?.(error);
      return;
    }
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(31, 1, .1, 30);
    this.camera.position.set(0, .15, 6.5);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(new THREE.AmbientLight(0xbfdcff, 1.8));
    const light = new THREE.PointLight(0x58a9ff, 4.2, 14, 2);
    light.position.set(-3, 3, 4);
    this.scene.add(light);
    this.createObject();
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(canvas.parentElement || canvas);
    }
    window.addEventListener('resize', () => this.resize(), { passive: true });
    this.resize();
    this.animate();
  }

  createObject() {
    this.orbit = new THREE.Group();
    this.scene.add(this.orbit);
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(.74, 2),
      new THREE.MeshPhysicalMaterial({ color: 0x1c4d7c, emissive: 0x0a2949, emissiveIntensity: .7, roughness: .3, metalness: .35, transparent: true, opacity: .88 })
    );
    this.orbit.add(core);
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(.93, 2),
      new THREE.MeshBasicMaterial({ color: 0x6fe5df, wireframe: true, transparent: true, opacity: .22 })
    );
    this.orbit.add(wire);
    [0, Math.PI / 3, -Math.PI / 3].forEach((rotation, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.15 + index * .12, .008, 8, 80),
        new THREE.MeshBasicMaterial({ color: palette[index + 1], transparent: true, opacity: .42 })
      );
      ring.rotation.set(rotation, index === 1 ? Math.PI / 2 : 0, index === 2 ? Math.PI / 2 : 0);
      this.orbit.add(ring);
    });
    const labels = [...new Set(this.labels)].slice(0, 24);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    labels.forEach((label, index) => {
      const y = 1 - (index / Math.max(1, labels.length - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * index;
      const sprite = makeLabel(label, palette[index % palette.length]);
      sprite.position.set(Math.cos(theta) * radius * 1.75, y * 1.48, Math.sin(theta) * radius * 1.75);
      sprite.userData.baseY = sprite.position.y;
      sprite.userData.phase = index * .48;
      sprite.userData.depth = sprite.position.z;
      this.orbit.add(sprite);
    });
    for (let index = 0; index < 12; index += 1) {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(.035 + (index % 3) * .012, 10, 8),
        new THREE.MeshBasicMaterial({ color: palette[index % palette.length], transparent: true, opacity: .78 })
      );
      const theta = goldenAngle * index * 1.9;
      const y = Math.sin(index * 1.7) * 1.55;
      node.position.set(Math.cos(theta) * 1.7, y, Math.sin(theta) * 1.7);
      this.orbit.add(node);
    }
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const parent = this.canvas.parentElement;
    const width = Math.max(1, parent?.clientWidth || this.canvas.clientWidth || 420);
    const height = Math.max(1, parent?.clientHeight || this.canvas.clientHeight || 320);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate() {
    if (!this.renderer) return;
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), .05);
    this.time += dt;
    const speed = this.reducedMotion ? .025 : .16;
    this.orbit.rotation.y += dt * speed;
    this.orbit.rotation.x = Math.sin(this.time * .33) * .07;
    this.orbit.children.forEach((child, index) => {
      if (child.userData.baseY === undefined) return;
      child.position.y = child.userData.baseY + Math.sin(this.time * 1.2 + child.userData.phase) * .045;
      child.material.opacity = clamp(.66 + (Math.sin(this.time * .8 + index) + 1) * .14, .66, .94);
    });
    this.renderer.render(this.scene, this.camera);
  }
}
