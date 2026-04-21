precision highp float;

uniform sampler2D tMap;
uniform vec2 uMouse;
uniform float uParallax;

varying vec2 vUv;

void main()
{
    vec2 uv = vUv;

    // Mouse movement
    vec2 mouseOffset = (uMouse - 0.5);

    // Face mask

    vec2 faceCenter = vec2(0.5, 0.7);
    vec2 faceScale = vec2(0.23, 0.27);

    vec2 dist = (uv - faceCenter) / faceScale;

    float faceMask = 1.0 -
        smoothstep(0.55, 1.0, length(dist));

    // Face warp
    vec2 warp = mouseOffset *
        uParallax *
        (faceMask * 0.3);

    vec4 color = texture2D(tMap, uv - warp);

    // Darkness ONLY outside face
    float darkness = 0.7;

    // 1 outside face, 0 on face
    float bodyMask = 1.0 - faceMask;

    color.rgb = mix(color.rgb, vec3(0.0), darkness * bodyMask);

    gl_FragColor = color;
}