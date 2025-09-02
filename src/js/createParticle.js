import { MeshSurfaceSampler } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
export default class CreateParticlePositions {
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

    return positions;
  }
  calculateParticleDistribution(allMesh, totalCount) {
    // 1단계: 각 메시의 부피 계산
    const meshVolumes = allMesh.map((mesh) => this.calculateMeshVolume(mesh));
    const totalVolume = meshVolumes.reduce((sum, volume) => sum + volume, 0);

    allMesh.forEach((mesh, i) => {});

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

    allMesh.forEach((mesh, i) => {
      const ratio = ((distribution[i] / totalCount) * 100).toFixed(1);
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

    // 특별한 조정 (필요시)
    let adjustedVolume = volume;

    // 너무 얇은 부품은 페널티
    const minThickness = Math.min(width, height, depth);
    if (minThickness < 0.5) {
      // 토성인 경우 페널티 없음
      if (mesh.name.includes("Object_8")) {
        adjustedVolume = volume; // 페널티 없음
      } else {
        adjustedVolume *= 0.5; // 다른 모델만 페널티
      }
    }
    if (mesh.name.includes("Circle_Bahan001")) {
      adjustedVolume *= 1.5; // 메인 몸통 강화
    } else if (mesh.name.includes("Cube")) {
      adjustedVolume *= 0.3; // 날개 약화
    } else if (mesh.name.includes("Object_8")) {
      adjustedVolume = 9999; // 👈 토성 고리 강화!
    }
    return Math.max(adjustedVolume, 0.1); // 최소값 보장
  }
}
