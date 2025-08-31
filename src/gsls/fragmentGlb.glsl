varying vec3 vPosition;
uniform float u_morphTargetInfluences[4];
uniform vec3 uModelCenter;
uniform vec3 uModelSize;
        
void main() {
    // 🎯 원형 파티클 만들기
    vec2 pointCoord = gl_PointCoord - 0.5;
    float distance = length(pointCoord);
    float alpha = 1.0 - smoothstep(0.2, 0.5, distance);
    
    // 🎯 모델 중심 기준으로 정규화
    vec3 normalizedPos = (vPosition - uModelCenter) / uModelSize;
    
    // 기본 색상 계산 (실제 모델 위치 기반)
    float heightGrad = (normalizedPos.y + 0.5); // 0~1
    float widthGrad = (normalizedPos.x + 0.5);  // 0~1
    float depthGrad = (normalizedPos.z + 0.5);  // 0~1
    
    // 🎨 노트북 색상 (더 단순하게)
    vec3 baseColor;
    
    // 높이에 따른 색상 (아래=어두움, 위=밝음)
    if (heightGrad < 0.3) {
        // 하단: 어두운 그레이
        baseColor = vec3(0.2, 0.25, 0.3);
    } else if (heightGrad < 0.7) {
        // 중간: 실버
        baseColor = vec3(0.7, 0.75, 0.8);
    } else {
        // 상단: 스크린 영역 (블루)
        baseColor = vec3(0.1, 0.3, 0.8);
    }
    
    // 🌟 노이즈 효과 제거 (단순한 색상)
    vec3 finalColor = baseColor;
    
    // morphTarget 영향 (단순하게)
    if (u_morphTargetInfluences[0] > 0.0) {
        // 모드 1: 빨강
        finalColor = mix(finalColor, vec3(1.0, 0.3, 0.3), u_morphTargetInfluences[0]);
    }
    
    if (u_morphTargetInfluences[1] > 0.0) {
        // 모드 2: 초록
        finalColor = mix(finalColor, vec3(0.3, 1.0, 0.3), u_morphTargetInfluences[1]);
    }
    
    if (u_morphTargetInfluences[2] > 0.0) {
        // 모드 3: 파랑
        finalColor = mix(finalColor, vec3(0.3, 0.3, 1.0), u_morphTargetInfluences[2]);
    }
    
    // 🎯 최종 출력
    gl_FragColor = vec4(finalColor, alpha * 0.8); // 투명도 조금 낮춤
    
    if(alpha < 0.01) discard;
}