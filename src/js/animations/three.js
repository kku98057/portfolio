import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/Addons.js";
import {
  EffectComposer,
  RenderPass,
  BloomEffect,
  EffectPass,
} from "postprocessing";

export default class Three {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.container = document.querySelector(".webgl");
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 2);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.setClearColor("black", 0);
    this.container.appendChild(this.renderer.domElement);

    this.setupCamera();
    this.setupLight();
    this.setupModels();
    this.setupComposer();
    this.setupEvent();

    window.addEventListener("mousemove", this.mouseMove.bind(this));
  }
  setupCamera() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;
    const fov = 75;
    const near = 0.1;
    const far = 1000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 0, 30);
    this.scene.add(this.camera);
  }
  setupLight() {
    const light = new THREE.DirectionalLight("red", 1);
    light.position.set(-1, 2, 4);
    this.scene.add(light);
  }
  setupModels() {
    this.torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
    this.material = new THREE.MeshNormalMaterial();

    this.torus = new THREE.Mesh(this.torusGeometry, this.material);

    this.torusMesh = this.createParticles(this.torus, 10000, 0.1);
  }
  createParticles(mesh, length, size) {
    const sampler = new MeshSurfaceSampler(mesh);
    const position = new THREE.Vector3();
    const positions = [];
    sampler.build();
    for (let i = 0; i < length; i++) {
      sampler.sample(position);
      positions.push(position.x, position.y, position.z);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, // 시간 uniform 추가
      },
      vertexShader: `
          uniform float uTime;
          varying vec3 vPosition;
          
          // 랜덤 함수
          float random(vec3 pos) {
            return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
          }
          
          void main() {
            vPosition = position;
            
            // 각 파티클마다 다른 랜덤값
            float randomValue = random(position);
            float randomValue2 = random(position * 2.0);
            float randomValue3 = random(position * 3.0);
            
            // 시간 기반 움직임
            vec3 newPosition = position;
            newPosition.x += sin(uTime * randomValue * 3.0) * 0.5;
            newPosition.y += cos(uTime * randomValue2 * 2.0) * 0.5;
            newPosition.z += sin(uTime * randomValue3 * 4.0) * 0.5;
            
            vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
            gl_PointSize = ${size};
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
      fragmentShader: `
        varying vec3 vPosition;
        
        void main() {
          // 거리 기반 색상
          float distance = length(vPosition);
          vec3 color = vec3(
            0.2 + 0.3 * sin(distance * 2.0),
            0.3 + 0.3 * cos(distance * 1.5),
            0.4 + 0.2 * sin(distance * 3.0)
          );
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
    return { particles, particleMaterial };
  }
  setupComposer() {
    // 투명도 지원이 내장된 EffectComposer
    this.composer = new EffectComposer(this.renderer, {
      frameBufferType: THREE.HalfFloatType, // HDR 지원
    });

    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // 블룸 이펙트
    const bloomEffect = new BloomEffect({
      intensity: 1,
      radius: 0.0001,
      luminanceThreshold: 0.4,
    });

    this.composer.addPass(new EffectPass(this.camera, bloomEffect));
  }

  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const camera = this.camera;
    if (camera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }
  setupEvent() {
    window.onresize = this.resize.bind(this);
    this.resize();
    this.renderer.setAnimationLoop(this.render.bind(this));
  }
  update(time) {
    time *= 0.001;

    if (this.torusMesh.particleMaterial) {
      this.torusMesh.particleMaterial.uniforms.uTime.value = time * 2;
    }
  }
  mouseMove(e) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    this.mouse = {
      x: e.clientX - centerX, // 중앙에서 0
      y: e.clientY - centerY,
    };
    this.camera.rotation.y = THREE.MathUtils.lerp(
      this.camera.rotation.y,
      this.mouse.x * Math.PI * 0.00001,
      1
    );
    this.camera.rotation.x = THREE.MathUtils.lerp(
      this.camera.rotation.x,
      this.mouse.y * Math.PI * 0.00001,
      1
    );
  }
  render(time) {
    this.update(time);
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}

new Three();
