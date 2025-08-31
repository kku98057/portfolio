uniform float uTime;
varying vec3 vPosition;
attribute vec3 morphTarget0;
attribute vec3 morphTarget1; 
attribute vec3 morphTarget2;
// 랜덤 함수
float random(vec3 pos) {
  return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

void main() {
  vPosition = position;
  vec3 newPosition = position;
  
  // 🎯 GLB 모델용 - 살짝만 움직이는 파티클
  float randomValue = random(position);
  float randomValue2 = random(position * 2.0);
  float randomValue3 = random(position * 3.0);
  
  // 아주 작은 움직임
  newPosition.x += sin(uTime * randomValue * 2.0) * 0.03;
  newPosition.y += cos(uTime * randomValue2 * 1.5) * 0.03;
  newPosition.z += sin(uTime * randomValue3 * 2.5) * 0.03;
  
  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  
  // 원근감
  float distance = -mvPosition.z;
  float scale = 100.0 / distance;
  gl_PointSize = clamp(scale, 0.5, 3.0);
  
  gl_Position = projectionMatrix * mvPosition;
}