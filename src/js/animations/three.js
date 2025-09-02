import * as THREE from "three";
import * as dat from "dat.gui";
import {
  DRACOLoader,
  GLTFLoader,
  OrbitControls,
  MeshSurfaceSampler,
} from "three/examples/jsm/Addons.js";
import {
  EffectComposer,
  RenderPass,
  BloomEffect,
  EffectPass,
} from "postprocessing";

import gsap from "gsap";
import { CSSRulePlugin, ScrollTrigger } from "gsap/all";
import vertex from "../../gsls/vertex.glsl?raw";
import fragment from "../../gsls/fragment.glsl?raw";

import Lenis from "lenis";
import { morphTarget } from "./animaionSquence";
import CreateParticlePositions from "../createParticle";
const progressDivider = (min, max, progress) => {
  return Math.max(0, Math.min(1, (progress - min) / (max - min)));
};
export default class Three {
  constructor() {
    this.updateProgress(10, "Three.js 초기화 중...");

    gsap.registerPlugin(ScrollTrigger, CSSRulePlugin);
    this.resetScroll();
    this.container = document.querySelector(".webgl");
    this.randomRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    this.init();

    // window.addEventListener("mousemove", this.mouseMove.bind(this));
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
      this.scene.fog = new THREE.Fog(0xffffff, 50, 200);
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

      await this.delay(50);
      this.updateProgress(95, "후처리 효과 설정...");

      this.setupComposer();
      this.setupEvent();

      await this.delay(50);
      this.updateProgress(100, "로딩 완료!");
      this.setupGUI();
      new OrbitControls(this.camera, this.renderer.domElement);
      this.hideLoadingScreen();
    } catch (error) {
      console.error("Three.js 초기화 실패:", error);
      this.hideLoadingScreen();
    }
  }
  setupGUI() {
    // this.gui = new dat.GUI();
  }
  resetScroll() {
    // 스크롤 복원 막기
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // 강제로 맨 위로
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
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
    // this.headLight = new THREE.SpotLight(
    //   0xffffff,
    //   100,
    //   50,
    //   Math.PI / 6,
    //   0.25,
    //   1
    // );
    // this.headLight.position.set(0, 0, 0.5); // 카메라 약간 앞
    // this.headLight.target.position.set(0, 0, -1); // 카메라가 보는 방향
    // this.camera.add(this.headLight);
    // this.camera.add(this.headLight.target);
    // this.scene.add(this.camera);
  }

  background() {
    const BACKGROUND_COUNT = 4800;

    this.backColor = new Float32Array(BACKGROUND_COUNT);
    this.backPositionArray = new Float32Array(BACKGROUND_COUNT);
    for (let i = 0; i < BACKGROUND_COUNT; i++) {
      //백그라운드 범위지정
      this.backPositionArray[i] = this.randomRange(-60, 60);
      this.backPositionArray[i + 1] = this.randomRange(-60, 60);
      this.backPositionArray[i + 2] = this.randomRange(-60, 60);
      //백그라운드 컬러색상 지정
      this.backColor[i] = this.randomRange(0.1, 0.5);
      this.backColor[i + 1] = this.randomRange(0.1, 0.5);
      this.backColor[i + 2] = this.randomRange(0.1, 0.5);
    }

    const particleBackgroundGeometry = new THREE.BufferGeometry();
    //백그라운드의 포지션 및 색상값 추가
    particleBackgroundGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.backPositionArray, 3)
    );
    particleBackgroundGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.backColor, 3)
    );

    this.particleBackgroundMaterial = new THREE.PointsMaterial({
      size: 0.15,
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

  scrollEvent() {
    this.infinityRotation = false;
    this.isReverse = false;
    let mm = gsap.matchMedia();
    const heroAnimation = (endMultiplier) => {
      gsap
        .timeline({
          smoothChildTiming: true,
          scrollTrigger: {
            trigger: ".hero",
            scrub: 0.2,
            pin: true,
            start: "5% top",
            end: `+=${window.innerHeight * endMultiplier}px`,
            immediateRender: false,
          },
        })
        // hero 텍스트 애니메이션션
        .to(
          ".hero h1",
          {
            translateY: -window.innerHeight,
            opacity: 0,
          },
          0
        )
        .to(
          ".hero .sub",
          {
            translateY: window.innerHeight,
            opacity: 0,
          },
          0
        )
        .to(
          this.mesh.rotation,
          {
            y: THREE.MathUtils.degToRad(720),
            duration: 3,
          },
          0
        )
        //로켓을 45도 기울이고 발사사
        .to(this.wrapper.rotation, { z: THREE.MathUtils.degToRad(45) }, 0)
        .to(this.mesh.position, { y: -4 }, 0.5)
        .to(
          this.mesh.position,
          {
            y: 50,
          },
          1
        )
        //투명상태로 원상복구
        .to(
          this.shaderMaterial.uniforms.u_opacity,
          { value: 0, duration: 0.1 },
          1.5
        )

        .to(this.mesh.position, { y: 0 }, 1.5)
        .to(this.wrapper.rotation, { z: THREE.MathUtils.degToRad(0) }, 1.5)
        //투명상태가 1로돌아오면서 행성으로 변환환

        // .to(this.camera.position, { z: 20, duration: 2 }, 2)

        .to(
          this.shaderMaterial.uniforms.u_morphTargetInfluences.value,
          {
            ...morphTarget("행성"),
            duration: 2,
            ease: "power4.inout",
            onComplete: () => {
              this.infinityRotation = true;
              this.isReverse = true;
            },
            onReverseComplete: () => {
              this.infinityRotation = false;
              this.isReverse = false;
            },
          },

          2
        )
        .to(
          this.shaderMaterial.uniforms.u_opacity,
          { value: 1, duration: 0.4 },
          2.5
        )
        .to(
          this.mesh.rotation,
          {
            x: THREE.MathUtils.degToRad(15),
            y: THREE.MathUtils.degToRad(0),
            duration: 2,
          },
          2.5
        );
    };
    const projectAnimation = (endMultiplier) =>
      gsap
        .timeline({
          smoothChildTiming: true,
          scrollTrigger: {
            trigger: ".project",
            scrub: 0.2,
            start: "top top",
            pin: true,
            end: `+=${window.innerHeight * endMultiplier}px`,
            immediateRender: false,
          },
        })
        //카메라를 z10으로 이동 후 카드 나열
        .to(
          this.camera.position,
          {
            z: 10,
            ease: "power4.inout",
            duration: 1,
          },
          0
        )

        .to(
          ".project_list > li",
          {
            opacity: 1,
            translateZ: -50,
            duration: 1,
            ease: "none",
            stagger: (index) => {
              return index * 2;
            },
          },
          0
        )
        .to(
          ".project_list > li",
          {
            opacity: 0,
            xPercent: (index) => {
              if (index % 2 === 0) {
                return 250;
              }
              return -250;
            },
            yPercent: -250,
            rotate: (index) => {
              if (index % 2 === 0) {
                return 350;
              }
              return -350;
            },
            duration: 1,
            ease: "power4.inout",
            stagger: (index) => {
              return index * 2;
            },
          },
          2
        )
        .to(this.shaderMaterial.uniforms.u_morphTargetInfluences.value, {
          ...morphTarget("벛꽃"),
          duration: 3,
          ease: "none",
        })
        .to(
          this.bloomEffect,
          {
            intensity: 2,
            ease: "none",
            duration: 3,
          },
          "<"
        )
        .to(
          this.mesh.rotation,
          {
            x: THREE.MathUtils.degToRad(0),
            duration: 3,
            ease: "none",
          },
          "<"
        )

        .to(
          this.camera.position,
          {
            z: 0,
            duration: 3,
            ease: "none",
          },
          "<"
        )

        .to(
          this.shaderMaterial.uniforms.u_scale,
          {
            value: 2,
            ease: "none",
            duration: 3,
          },
          "<"
        );

    const introduceAnimaion = (endMultiplier) => {
      gsap
        .timeline({
          smoothChildTiming: true,
          scrollTrigger: {
            trigger: ".introduce",
            scrub: 0.2,
            start: "top top",
            end: `+=${window.innerHeight * endMultiplier}px`,
            pin: true,
            immediateRender: false,
          },
        })
        .from(
          ".self .text_in1",
          {
            opacity: 0,
            ease: "power4.inout",
            duration: 1,
            xPercent: -20,
          },
          0
        )
        .from(
          ".self .text_in2 p:first-child",
          {
            opacity: 0,
            ease: "power4.inout",
            duration: 1,
            xPercent: 20,
          },
          0
        )
        .to(
          ".self .text_in2 p:first-child",
          {
            ease: "none",
            duration: 1,
            yPercent: -100,
          },
          1
        )
        .to(
          ".self .text_in2 p:last-child",
          {
            opacity: 1,
            ease: "none",
            duration: 1,
            yPercent: -100,
          },
          1
        )
        .to(
          ".self .text_in2",
          {
            opacity: 1,
            duration: 1,
            ease: "none",
          },
          2
        )
        .to(
          ".self .text_1",
          {
            opacity: 0,
            duration: 1,
            ease: "none",
          },
          3
        )
        .from(
          ".self p.text_2",
          {
            opacity: 0,
            ease: "none",
            duration: 1,
            yPercent: -70,
          },
          4
        )
        .to(
          ".self p.text_2",
          {
            opacity: 0,
            ease: "none",
            duration: 1,
            yPercent: 20,
          },
          5
        )
        .from(
          ".self p.text_3",
          {
            opacity: 0,
            ease: "none",
            duration: 1,
            yPercent: 20,
          },
          6
        )
        .to(
          ".self p.text_3",
          {
            opacity: 0,
            ease: "none",
            duration: 1,
            xPercent: 20,
          },
          7
        )
        .from(
          ".self p.text_4",
          {
            opacity: 0,
            ease: "none",
            duration: 1,
            xPercent: 20,
          },
          8
        )
        .to(
          ".self p.text_4",
          {
            opacity: 0,
            ease: "none",
            duration: 1,
            xPercent: -20,
          },
          9
        )
        .from(
          ".self p.text_5",
          {
            opacity: 0,
            ease: "none",
            duration: 1,
            xPercent: -20,
          },
          10
        )
        .to(
          ".self p.text_5",
          {
            opacity: 0,
            ease: "none",
            duration: 1,
            xPercent: 20,
            onComplete: () => {
              gsap.to(".self .intro_section", {
                visibility: "hidden",
              });
            },
            onReverseComplete: () => {
              gsap.to(".self .intro_section", {
                visibility: "visible",
              });
            },
          },
          11
        )
        .to(
          this.camera.position,
          {
            z: 30,
            ease: "none",
            duration: 2,
          },
          12
        )
        .to(
          this.shaderMaterial.uniforms.u_morphTargetInfluences.value,
          {
            ...morphTarget("사람"),
            duration: 2,
            ease: "none",
          },
          13
        )

        .to(
          this.bloomEffect,
          {
            intensity: 0.1,
            ease: "none",
            duration: 2,
          },
          13
        )
        .to(
          this.shaderMaterial.uniforms.u_scale,
          {
            value: 0.5,
            ease: "none",
            duration: 2,
          },
          13
        )

        .to(
          ".self .skills_section",
          {
            translateZ: 0,
            opacity: 1,
            duration: 1,
            ease: "none",
          },
          15
        )
        .to(
          this.bloomEffect,
          {
            intensity: 1,
            ease: "none",
            duration: 4,
          },
          15
        )
        .to(
          ".self .skills_section",
          {
            translateZ: 100,
            opacity: 0,
            duration: 1,
            ease: "none",
            onComplete: () => {
              gsap.to(".self", {
                visibility: "hidden",
              });
            },
            onReverseComplete: () => {
              gsap.to(".self", {
                visibility: "visible",
              });
            },
          },
          17
        )
        .from(
          ".resume > ul",
          {
            xPercent: 120,

            duration: 4,
            ease: "none",
          },
          19
        )
        .to(
          {},
          {
            duration: 2,
          }
        );
    };
    const contactAnimaion = () => {
      gsap
        .timeline({
          smoothChildTiming: true,
          scrollTrigger: {
            trigger: ".contact",
            scrub: 0.2,
            end: "bottom bottom",
            immediateRender: false,
          },
        })
        .to(this.shaderMaterial.uniforms.u_morphTargetInfluences.value, {
          ...morphTarget("수화기"),
          duration: 2,
          ease: "none",
        })
        .to(
          this.mesh.position,
          {
            x: 5,
            y: -5,
            duration: 2,
            ease: "none",
          },
          "<"
        );
    };

    mm.add("(max-width:768px)", () => {
      heroAnimation(8);
      projectAnimation(16);
      introduceAnimaion(16);
      contactAnimaion();
    });
    mm.add("(min-width:769px)", () => {
      heroAnimation(4);
      projectAnimation(8);
      introduceAnimaion(8);
      contactAnimaion();
    });
  }
  async setupModels() {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

    loader.setDRACOLoader(draco);
    // 모델 로딩
    Promise.all([
      loader.loadAsync("/model/man.glb"),
      loader.loadAsync("/model/roket.glb"),
      loader.loadAsync("/model/saturnplanet.glb"),
      loader.loadAsync("/model/telephone.glb"),
    ]).then(async (results) => {
      const bufferGeometry = new THREE.BufferGeometry();
      const [man, rocket, saturn, telephone] = results;
      //모델들 중앙정렬
      results.forEach((result) => {
        this.centerdModels(result.scene);
      });
      //파티클 생성성
      const manPositions = new CreateParticlePositions(
        man,
        10000
      ).createParticles();
      const rocketPositions = new CreateParticlePositions(
        rocket,
        10000
      ).createParticles();

      const saturnPositions = new CreateParticlePositions(
        saturn,
        10000
      ).createParticles();
      const telephonePositions = new CreateParticlePositions(
        telephone,
        10000
      ).createParticles();

      //shaderMaterial 생성
      this.shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          u_scale: { value: 0.5 },
          u_opacity: { value: 1 },
          u_morphTargetInfluences: { value: [0, 0, 0, 0] },
        },
        side: THREE.DoubleSide,
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      //파티클 위치 데이터값 추가
      bufferGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(rocketPositions, 3)
      );
      bufferGeometry.setAttribute(
        "morphTarget1",
        new THREE.Float32BufferAttribute(manPositions, 3)
      );
      bufferGeometry.setAttribute(
        "morphTarget2",
        new THREE.Float32BufferAttribute(saturnPositions, 3)
      );
      bufferGeometry.setAttribute(
        "morphTarget3",
        new THREE.Float32BufferAttribute(telephonePositions, 3)
      );
      this.mesh = new THREE.Points(bufferGeometry, this.shaderMaterial);
      /**
       * warpper를 생성하고 mesh를 추가 한 후 wapper를 scene에 추가한 이유는
       *mesh에 rotation적용한 후 다른방향으로 재적용 시 mesh기준의 회전축이 아닌 화면 기준의 회전축에 적용되므로
       *warpper를 추가하여 mesh의 회전축을 유지할 수 있도록 하기위함
       */
      this.wrapper = new THREE.Object3D();
      this.wrapper.add(this.mesh);
      this.scene.add(this.wrapper);

      this.scrollEvent();
    });
  }
  centerdModels(gltfScene) {
    // 모델 전체를 감싸는 최대, 최소 좌표 생성성
    const box = new THREE.Box3().setFromObject(gltfScene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    //현재 모델의 중심점 좌표 - 모델기준으로 생성된 중심점좌표표 = 0,0,0이므로 중앙정렬
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
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    const camera = this.camera;
    if (camera) {
      camera.aspect = this.width / this.height;
      camera.updateProjectionMatrix();
    }
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
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
      0.1
    );
    this.camera.rotation.x = THREE.MathUtils.lerp(
      this.camera.rotation.x,
      this.mouse.y * Math.PI * 0.00001,
      0.1
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
  }

  hideLoadingScreen() {
    const loadingScreen = document.querySelector(".loading_screen");
    const mainContent = document.getElementById(".wrap");

    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add("loaded");
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
    if (this.infinityRotation) {
      this.mesh.rotation.y = time * (this.isReverse ? -0.1 : 0.1);
    }
  }
  render(time) {
    this.update(time);

    this.composer.render();
  }
}

// DOM 완료 후 시작
document.addEventListener("DOMContentLoaded", () => {
  window.outerHeight = window.screen.availHeight;
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  new Three();
});
