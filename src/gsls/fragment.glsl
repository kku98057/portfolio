varying vec3 vPosition;
uniform float u_morphTargetInfluences[4];
        
void main() {
    // 🎯 원형 파티클 만들기
    vec2 pointCoord = gl_PointCoord - 0.5;
    float distance = length(pointCoord);
    float alpha = 1.0 - smoothstep(0.3, 0.5, distance);
    
    // 기존 색상 로직
    float distanceFromCenter = length(vPosition.xy);
    float angle = atan(vPosition.y, vPosition.x);
    
    // 토러스: 블루-시안-보라 믹스
    vec3 torusColor1 = vec3(0.2, 0.5, 1.0);
    vec3 torusColor2 = vec3(0.1, 0.9, 0.8);
    vec3 torusColor3 = vec3(0.5, 0.3, 0.9);
    float torusPattern = sin(angle * 3.0 + distanceFromCenter * 2.0) * 0.5 + 0.5;
    vec3 torusColor = mix(
        mix(torusColor1, torusColor2, torusPattern),
        torusColor3,
        sin(distanceFromCenter * 4.0) * 0.3 + 0.3
    );
    
    // 박스: 레드-오렌지-핑크 믹스
    vec3 boxColor1 = vec3(1.0, 0.2, 0.3);
    vec3 boxColor2 = vec3(1.0, 0.6, 0.1);
    vec3 boxColor3 = vec3(1.0, 0.3, 0.6);
    vec2 uv = (vPosition.xy + 10.0) / 20.0;
    float boxPattern = sin(uv.x * 8.0) * sin(uv.y * 8.0);
    vec3 boxColor = mix(
        mix(boxColor1, boxColor2, abs(boxPattern)),
        boxColor3,
        smoothstep(0.3, 0.7, distanceFromCenter * 0.2)
    );
    
    // 구: 골드-라임-옐로우 믹스
    vec3 sphereColor1 = vec3(1.0, 0.8, 0.2);
    vec3 sphereColor2 = vec3(0.8, 1.0, 0.3);
    vec3 sphereColor3 = vec3(1.0, 1.0, 0.1);
    float spherePattern = sin(angle * 5.0) * cos(distanceFromCenter * 3.0);
    vec3 sphereColor = mix(
        mix(sphereColor1, sphereColor2, spherePattern * 0.5 + 0.5),
        sphereColor3,
        sin(uv.x * uv.y * 20.0) * 0.4 + 0.4
    );
    
    // 실린더: 퍼플-민트-터콰이즈 믹스
    vec3 cylinderColor1 = vec3(0.7, 0.2, 0.9);
    vec3 cylinderColor2 = vec3(0.3, 0.9, 0.7);
    vec3 cylinderColor3 = vec3(0.2, 0.8, 0.9);
    float cylinderPattern = sin(vPosition.x * 4.0 + vPosition.y * 3.0);
    vec3 cylinderColor = mix(
        mix(cylinderColor1, cylinderColor2, abs(cylinderPattern)),
        cylinderColor3,
        cos(angle * 4.0 + distanceFromCenter) * 0.3 + 0.5
    );
    
    // 최종 색상 블렌딩
    vec3 finalColor = torusColor;
    finalColor = mix(finalColor, boxColor, u_morphTargetInfluences[0]);
    finalColor = mix(finalColor, sphereColor, u_morphTargetInfluences[1]); 
    finalColor = mix(finalColor, cylinderColor, u_morphTargetInfluences[2]);
    
    // 🎯 원형 마스크 적용
    gl_FragColor = vec4(finalColor, alpha);
    
    if(alpha < 0.01) discard;
}