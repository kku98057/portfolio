uniform float uTime;
uniform float u_morphTargetInfluences[4];
varying vec3 vPosition;

// morphTarget attributes
attribute vec3 morphTarget0;
attribute vec3 morphTarget1; 
attribute vec3 morphTarget2;

float random(vec3 pos) {
  return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

void main() {
  vPosition = position;
  vec3 newPosition = position;
  
  // 🌸 첫 번째 모프: 벚꽃 흩날리기 효과
  if(u_morphTargetInfluences[0] > 0.0) {
    float randomX = random(position);
    float randomY = random(position * 2.0);
    float randomZ = random(position * 3.0);
    
    // 파티클들을 크게 흩어뜨리기
    vec3 scatter = vec3(
      (randomX - 0.5) * 120.0,
      (randomY - 0.5) * 120.0,
      (randomZ - 0.5) * 120.0
    ) * u_morphTargetInfluences[0];
    
    newPosition = mix(position, morphTarget0, u_morphTargetInfluences[0]);
    newPosition += scatter;
  }
  
  // 기본 morphing
  newPosition += (morphTarget1 - position) * u_morphTargetInfluences[1];
  newPosition += (morphTarget2 - position) * u_morphTargetInfluences[2];
  
  // 기본 애니메이션
  float randomValue = random(position);
  newPosition.x += sin(uTime * randomValue * 3.0) * 0.1;
  newPosition.y += cos(uTime * randomValue * 2.0) * 0.1;
  newPosition.z += sin(uTime * randomValue * 4.0) * 0.1;
  
  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  
  // 🎯 원근감을 위한 거리 기반 크기 조절
  float distance = -mvPosition.z;
  float scale = 100.0 / distance;
  gl_PointSize = clamp(scale, 0.2, 2.0);
  
  gl_Position = projectionMatrix * mvPosition;
}