uniform float uHover;
uniform vec2 uMouse;

varying vec2 vUv;

void main()
{
    vUv = uv;

    vec3 pos = position;

    float dist = distance(uv, uMouse);
    float strength = smoothstep(0.5, 0.0, dist / 2.) * uHover;

    pos.z += strength * 0.3;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
