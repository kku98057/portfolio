import * as THREE from "three";

import {
  DRACOLoader,
  GLTFLoader,
  MeshSurfaceSampler,
  OrbitControls,
} from "three/examples/jsm/Addons.js";
import {
  EffectComposer,
  RenderPass,
  BloomEffect,
  EffectPass,
} from "postprocessing";
import { heroIntroAnimaion } from "./intro";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import vertex from "../../gsls/vertex.glsl?raw";
import fragment from "../../gsls/fragment.glsl?raw";
import fragmentGlb from "../../gsls/fragmentGlb.glsl?raw";
import vertexGlb from "../../gsls/vertexGlb.glsl?raw";
export default class Three {
  constructor() {
    this.updateProgress(10, "Three.js 초기화 중...");

    this.container = document.querySelector(".webgl");

    this.randomRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    this.init();

    window.addEventListener("mousemove", this.mouseMove.bind(this));
  }
  async init() {
    try {
      // 각 단계마다 지연을 두고 진행
      await this.delay(50);
      this.updateProgress(10, "WebGL 렌더러 생성...");

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      this.container = document.querySelector(".webgl");

      await this.delay(50);
      this.updateProgress(25, "씬 및 카메라 설정...");

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      await this.delay(50);
      this.updateProgress(40, "렌더러 설정...");

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      this.renderer.setClearColor("black", 0);
      this.container.appendChild(this.renderer.domElement);
      new OrbitControls(this.camera, this.renderer.domElement);

      await this.delay(50);
      this.updateProgress(55, "카메라 및 라이트 설정...");

      this.setupCamera();
      this.setupLight();

      await this.delay(50);
      this.updateProgress(70, "3D 모델 생성...");

      this.setupModels();

      await this.delay(50);
      this.updateProgress(85, "파티클 시스템 생성...");

      this.background();
      gsap.registerPlugin(ScrollTrigger);
      // this.scollEvent();
      await this.delay(50);
      this.updateProgress(95, "후처리 효과 설정...");

      this.setupComposer();
      this.setupEvent();

      await this.delay(50);
      this.updateProgress(100, "로딩 완료!");

      this.hideLoadingScreen();
    } catch (error) {
      console.error("Three.js 초기화 실패:", error);
      this.hideLoadingScreen();
    }
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

  background() {
    this.backColor = new Float32Array(1200);
    this.backPositionArray = new Float32Array(1200);
    for (let i = 0; i < 1200; i++) {
      this.backPositionArray[i] = this.randomRange(-20, 20);
      this.backPositionArray[i + 1] = this.randomRange(-20, 20);
      this.backPositionArray[i + 2] = this.randomRange(-20, 20);
      this.backColor[i] = this.randomRange(0.1, 0.5);
      this.backColor[i + 1] = this.randomRange(0.1, 0.5);
      this.backColor[i + 2] = this.randomRange(0.1, 0.5);
    }

    const particleBackgroundGeometry = new THREE.BufferGeometry();

    particleBackgroundGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.backPositionArray, 3)
    );
    particleBackgroundGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.backColor, 3)
    );

    this.particleBackgroundMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: new THREE.TextureLoader().load("/images/circle.png"),
    });
    this.particleBackground = new THREE.Points(
      particleBackgroundGeometry,
      this.particleBackgroundMaterial
    );
    this.particleBackground.position.z = 15;
    this.scene.add(this.particleBackground);
  }
  createParticlesPosition(mesh, length) {
    const sampler = new MeshSurfaceSampler(mesh);
    const position = new THREE.Vector3();
    const positions = [];
    sampler.build();
    for (let i = 0; i < length; i++) {
      sampler.sample(position);
      positions.push(position.x, position.y, position.z);
    }

    return positions;
  }

  scollEvent() {
    const bloomControl = { intensity: 2 };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".wrap",
        scrub: 2,
        start: "top top",
        end: "bottom bottom", //
        markers: true,
      },
    });

    tl.to(this.mesh.material.uniforms.u_morphTargetInfluences.value, {
      0: 1,
      1: 0,
      2: 0,
      3: 0, // 목표 값
      duration: 1, // 지속 시간
      ease: "power4.inOut", // 이징 (선택사항)
    })
      .to(
        this.mesh.rotation,
        {
          y: Math.PI,
          duration: 1,
        },
        "-=1"
      )
      .to(
        this.mesh.material.uniforms.u_morphTargetInfluences.value,
        [0, 1, 0, 0]
      )
      .to(
        this.mesh.rotation,
        {
          y: Math.PI * 2,
          duration: 1,
        },
        "-=1"
      )
      // .to(
      //   bloomControl,
      //   {
      //     intensity: 6,
      //     duration: 1,
      //     onUpdate: () => {
      //       this.bloomEffect.intensity = bloomControl.intensity;
      //     },
      //   },
      //   "<"
      // )

      .to(
        this.mesh.material.uniforms.u_morphTargetInfluences.value,
        [0, 0, 1, 0]
      );

    window.addEventListener("scroll", () => {
      console.log(this.mesh.material.uniforms.u_morphTargetInfluences.value);
    });
  }
  async setupModels() {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

    loader.setDRACOLoader(draco);

    Promise.all([
      loader.loadAsync("/model/notebook.glb"),
      loader.loadAsync("/model/roket.glb"),
      loader.loadAsync("/model/rocket2.glb"),
    ]).then(async (results) => {
      const bufferGeometry = new THREE.BufferGeometry();
      const [notebook, rocket, rocket2] = results;
      results.forEach((result) => {
        this.centerdModels(result.scene);
      });
      const notebookPositions = new CreateParticlePositions(
        notebook,
        10000
      ).createParticles();
      const rocketPositions = new CreateParticlePositions(
        rocket,
        10000
      ).createParticles();

      const rocket2Positions = new CreateParticlePositions(
        rocket2,
        10000
      ).createParticles();

      this.shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          u_morphTargetInfluences: { value: [0, 0, 0, 0] },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
      });
      bufferGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(notebookPositions, 3)
      );
      bufferGeometry.setAttribute(
        "morphTarget0",
        new THREE.Float32BufferAttribute(rocket2Positions, 3)
      );
      bufferGeometry.setAttribute(
        "morphTarget1",
        new THREE.Float32BufferAttribute(notebookPositions, 3)
      );
      bufferGeometry.setAttribute(
        "morphTarget2",
        new THREE.Float32BufferAttribute(rocketPositions, 3)
      );
      this.mesh = new THREE.Points(bufferGeometry, this.shaderMaterial);
      const wrapper = new THREE.Object3D();
      wrapper.add(this.mesh);
      this.scene.add(this.mesh);

      const tl = gsap
        .timeline({
          scrollTrigger: {
            trigger: ".wrap",
            scrub: 2,
            start: "top top",
            end: "bottom bottom",
            markers: true,
          },
        })
        .to(this.mesh.material.uniforms.u_morphTargetInfluences.value, {
          0: 1,
          1: 0,
          2: 0,
          3: 0, // 목표 값
          duration: 1, // 지속 시간
          ease: "power4.inOut", // 이징 (선택사항)
        })
        .to(this.mesh.material.uniforms.u_morphTargetInfluences.value, {
          0: 0,
          1: 1,
          2: 0,
          3: 0, // 목표 값
          duration: 1, // 지속 시간
          ease: "power4.inOut", // 이징 (선택사항)
        })
        .to(this.mesh.material.uniforms.u_morphTargetInfluences.value, {
          0: 0,
          1: 0,
          2: 1,
          3: 0, // 목표 값
          duration: 1, // 지속 시간
          ease: "power4.inOut", // 이징 (선택사항)
        })
        .to(this.mesh.material.uniforms.u_morphTargetInfluences.value, {
          0: 0,
          1: 0,
          2: 0,
          3: 1, // 목표 값
          duration: 1, // 지속 시간
          ease: "power4.inOut", // 이징 (선택사항)
        })
        // 🚀 1단계: 45도 기울이기
        .to(wrapper.rotation, {
          z: Math.PI / 4,
          duration: 1,
          ease: "power2.out",
        })
        .to(this.mesh.rotation, {
          y: Math.PI * 4,
          duration: 1.5,
          ease: "none",
        })
        .to(
          this.mesh.position,
          {
            y: -10,
            duration: 0.5,
            ease: "none",
          },
          "<+0.5"
        )
        .to(
          this.mesh.position,
          {
            y: 100,
            duration: 0.5,
            ease: "none",
          },
          ">"
        );
    });
  }
  centerdModels(gltfScene) {
    const box = new THREE.Box3().setFromObject(gltfScene);
    const center = new THREE.Vector3();
    box.getCenter(center);

    gltfScene.position.sub(center);
  }

  setupComposer() {
    // 투명도 지원이 내장된 EffectComposer
    this.composer = new EffectComposer(this.renderer, {
      frameBufferType: THREE.HalfFloatType, // HDR 지원
    });

    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // 블룸 이펙트
    this.bloomEffect = new BloomEffect({
      intensity: 1,
      radius: 0.8,
      luminanceThreshold: 0.3,
    });

    this.composer.addPass(new EffectPass(this.camera, this.bloomEffect));
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

  updateProgress(progress, message = "") {
    const progressFill = document.getElementById("progress_fill");
    const progressText = document.getElementById("progress_text");
    const progressMessage = document.getElementById("progress_message");

    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
    if (progressText) {
      progressText.textContent = `${Math.round(progress)}%`;
    }
    if (progressMessage && message) {
      progressMessage.textContent = message;
    }

    console.log(`진행률: ${progress}% - ${message}`);
  }

  hideLoadingScreen() {
    const loadingScreen = document.querySelector(".loading_screen");
    const mainContent = document.getElementById(".wrap");

    console.log("로딩 완료! 화면 표시...");

    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add("loaded");
        heroIntroAnimaion();
      }, 1000);
    }

    if (mainContent) {
      mainContent.classList.add("loaded");
    }

    // 로딩 화면 완전 제거
    setTimeout(() => {
      if (loadingScreen && loadingScreen.parentNode) {
        loadingScreen.parentNode.removeChild(loadingScreen);
      }
    }, 1000);
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  update(time) {
    time *= 0.001;

    if (this.particleMaterial) {
      this.particleMaterial.uniforms.uTime.value = time * 2;
    }
    if (this.shaderMaterial) {
      this.shaderMaterial.uniforms.uTime.value = time * 5;
    }
    if (this.particleBackground) {
      this.particleBackground.rotation.x = time * 0.01;
      this.particleBackground.rotation.y = time * 0.1;
      this.particleBackground.rotation.z = time * 0.01;
    }
  }
  render(time) {
    this.update(time);

    this.composer.render();
  }
}

// DOM 완료 후 시작
document.addEventListener("DOMContentLoaded", () => {
  new Three();
});

class CreateParticlePositions {
  constructor(mesh, count) {
    this.mesh = mesh;
    this.count = count;
    this.targetSize = 20;
    this.particleDensity = 200; // 🎯 단위 면적당 파티클 수
    /**
     *
     * [key:string] : number
     *
     */
  }
  createParticles() {
    let allMesh = [];
    let positions = [];

    this.mesh.scene.traverse((child) => {
      if (child.isMesh) {
        allMesh.push(child);
      }
    });
    const particleDistribution = this.calculateParticleDistribution(
      allMesh,
      this.count
    );

    allMesh.forEach((mesh, index) => {
      const sampler = new MeshSurfaceSampler(mesh);

      const vector = new THREE.Vector3();
      sampler.build();
      let meshParticleCount;
      meshParticleCount = particleDistribution[index];

      for (let i = 0; i < meshParticleCount; i++) {
        sampler.sample(vector);
        mesh.localToWorld(vector);
        positions.push(vector.x, vector.y, vector.z);
      }
    });
    return this.normalizePositions(positions);
  }
  normalizePositions(positions) {
    console.log(positions);
    if (positions.length === 0) return positions;

    // 바운딩 박스 계산
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    for (let i = 0; i < positions.length; i += 3) {
      minX = Math.min(minX, positions[i]);
      maxX = Math.max(maxX, positions[i]);
      minY = Math.min(minY, positions[i + 1]);
      maxY = Math.max(maxY, positions[i + 1]);
      minZ = Math.min(minZ, positions[i + 2]);
      maxZ = Math.max(maxZ, positions[i + 2]);
    }

    // 중심점과 크기 계산
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const sizeZ = maxZ - minZ;
    const maxSize = Math.max(sizeX, sizeY, sizeZ);

    // 스케일 계산
    const scale = this.targetSize / maxSize;

    // 정규화 적용
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (positions[i] - centerX) * scale;
      positions[i + 1] = (positions[i + 1] - centerY) * scale;
      positions[i + 2] = (positions[i + 2] - centerZ) * scale;
    }

    console.log(`Model normalized: ${maxSize.toFixed(2)} → ${this.targetSize}`);
    console.log(positions);
    return positions;
  }
  calculateParticleDistribution(allMesh, totalCount) {
    // 1단계: 각 메시의 부피 계산
    const meshVolumes = allMesh.map((mesh) => this.calculateMeshVolume(mesh));
    const totalVolume = meshVolumes.reduce((sum, volume) => sum + volume, 0);

    console.log("=== Volume Analysis ===");
    allMesh.forEach((mesh, i) => {
      console.log(`${mesh.name}: volume=${meshVolumes[i].toFixed(4)}`);
    });
    console.log(`Total volume: ${totalVolume.toFixed(4)}`);

    // 2단계: 부피 비례로 파티클 분배
    let distribution = meshVolumes.map((volume) => {
      const ratio = volume / totalVolume;
      const particles = Math.max(Math.round(totalCount * ratio), 10); // 최소 10개
      return particles;
    });

    // 3단계: 총합 정확히 맞추기
    const currentTotal = distribution.reduce((sum, count) => sum + count, 0);
    const diff = totalCount - currentTotal;

    if (diff !== 0) {
      // 가장 큰 부피의 메시에서 조정
      const maxVolumeIndex = meshVolumes.indexOf(Math.max(...meshVolumes));
      distribution[maxVolumeIndex] = Math.max(
        distribution[maxVolumeIndex] + diff,
        10
      );
    }

    console.log("=== Particle Distribution ===");
    allMesh.forEach((mesh, i) => {
      const ratio = ((distribution[i] / totalCount) * 100).toFixed(1);
      console.log(`${mesh.name}: ${distribution[i]} particles (${ratio}%)`);
    });

    return distribution;
  }
  calculateMeshVolume(mesh) {
    const geometry = mesh.geometry;

    if (!geometry || !geometry.attributes.position) {
      return 1;
    }

    // 바운딩 박스 기반 부피
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;

    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;
    const depth = box.max.z - box.min.z;

    const volume = width * height * depth;

    // 🎯 특별한 조정 (필요시)
    let adjustedVolume = volume;

    // 너무 얇은 부품은 페널티
    const minThickness = Math.min(width, height, depth);
    if (minThickness < 0.5) {
      adjustedVolume *= 0.5; // 50% 감소
    }

    // 메시 이름 기반 조정
    if (mesh.name.includes("Circle_Bahan001")) {
      adjustedVolume *= 1.5; // 메인 몸통 강화
    } else if (mesh.name.includes("Cube")) {
      adjustedVolume *= 0.3; // 날개 약화
    }

    return Math.max(adjustedVolume, 0.1); // 최소값 보장
  }
}
