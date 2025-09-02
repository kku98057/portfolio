varying vec3 vPosition;
varying float vScatterAmount; // 🔥 퍼진 정도
uniform float u_opacity;
uniform float u_morphTargetInfluences[4];
        
void main() {
    // 원형 파티클
    vec2 pointCoord = gl_PointCoord - 0.5;
    float distance = length(pointCoord);
    float alpha = 1.0 - smoothstep(0.3, 0.5, distance);
    
    // opacity 적용
    alpha *= u_opacity;
    
    // === 색상 ===
    vec3 finalColor = vec3(1.0, 0.8, 0.2); // 기본: 골드
    
    // 🔥 벚꽃 퍼짐에 따른 색상 변화
    if(u_morphTargetInfluences[0] > 0.01) {
        // 퍼진 정도에 따라 색상 변화
        vec3 nearColor = vec3(1.0, 0.7, 0.8);  // 가까우면 연핑크
        vec3 farColor = vec3(0.9, 0.3, 0.5);   // 멀면 진핑크
        vec3 veryFarColor = vec3(0.8, 0.2, 0.7); // 아주 멀면 보라
        
        if(vScatterAmount < 1.0) {
            finalColor = mix(nearColor, farColor, vScatterAmount);
        } else {
            finalColor = mix(farColor, veryFarColor, vScatterAmount - 1.0);
        }
        
        // 멀리 퍼진 파티클은 더 투명하게
        alpha *= (1.0 - clamp(vScatterAmount * 0.3, 0.0, 0.7));
    }
    
    // 나머지 색상들...
    finalColor = mix(finalColor, vec3(0.2, 0.5, 1.0), u_morphTargetInfluences[1]); // 블루
    finalColor = mix(finalColor, vec3(0.4, 0.6, 1.0), u_morphTargetInfluences[2]); // 라이트블루
    finalColor = mix(finalColor, vec3(0.3, 1.0, 0.6), u_morphTargetInfluences[3]); // 그린
    
    gl_FragColor = vec4(finalColor, alpha);
}