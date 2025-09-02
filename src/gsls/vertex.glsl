uniform float uTime;
uniform float u_morphTargetInfluences[4];
uniform float u_scale;

varying vec3 vPosition;
varying float vScatterAmount; // 🔥 퍼진 정도를 fragment로 전달

// morphTarget attributes
attribute vec3 morphTarget1; // rocket
attribute vec3 morphTarget2; // saturn
attribute vec3 morphTarget3; // phone

float random(vec3 pos) {
  return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

void main() {
  vPosition = position;
  vec3 newPosition = position; // 기본: notebook
  
  // === 모르프 0: 벚꽃 흩어짐 (GLSL 생성) ===
  if(u_morphTargetInfluences[0] > 0.0) {
    vec3 scatter = vec3(
      (random(position) - 0.5) * 300.0,
      (random(position * 2.0) - 0.5) * 300.0,
      (random(position * 3.0) - 0.5) * 300.0
    );
    newPosition += scatter * u_morphTargetInfluences[0];
    
    // 🔥 퍼진 거리 계산 (색상용)
    float scatterDistance = length(scatter * u_morphTargetInfluences[0]);
    vScatterAmount = scatterDistance / 100.0; // 0~3 정도 범위
  } else {
    vScatterAmount = 0.0; // 퍼지지 않음
  }
  
  // === 모르프 1: Rocket ===
  if(u_morphTargetInfluences[1] > 0.0) {
    newPosition = mix(newPosition, morphTarget1, u_morphTargetInfluences[1]);
  }
  
  // === 모르프 2: Saturn ===
  if(u_morphTargetInfluences[2] > 0.0) {
    newPosition = mix(newPosition, morphTarget2, u_morphTargetInfluences[2]);
  }
  
  // === 모르프 3: Telephone ===
  if(u_morphTargetInfluences[3] > 0.0) {
    newPosition = mix(newPosition, morphTarget3, u_morphTargetInfluences[3]);
  }

  // 미세한 애니메이션 (떨림 효과)
  float randomValue = random(position);
  newPosition.x += sin(uTime * randomValue * 3.0) * 0.1;
  newPosition.y += cos(uTime * randomValue * 2.0) * 0.1;
  newPosition.z += sin(uTime * randomValue * 4.0) * 0.1;
  
  // 최종 변환
  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  
  // 포인트 크기 (거리 기반 + 스케일)
  float distance = -mvPosition.z;
  float scale = 100.0 / distance;
  gl_PointSize = clamp(scale, 0.2, 3.0) * u_scale;
  
  gl_Position = projectionMatrix * mvPosition;
}