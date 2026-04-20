uniform float uHover;
uniform vec2 uMouse;
uniform float uNormalizedY;

varying vec2 vUv;

void main()
{
    vUv = uv;

    vec3 pos = position;

    float center = 0.5;
    float strength = 5. * abs(uNormalizedY);

    if(uNormalizedY < 0.0)
    {
        // above center — bottom half bends, 0 at center → 1 at top
        if(uv.y < center)
        {
            float s = (center - uv.y) / center;
            s = smoothstep(0.0, 1.0, s * 0.8);
            // s = pow(s, 1.0);
            pos.z += s * strength;
        }
    }
    else if(uNormalizedY > 0.0)
    {
        // below center — top half bends, 0 at center → 1 at bottom
        if(uv.y > center)
        {
            float s = (uv.y - center) / center;
            s = smoothstep(0.0, 1.0, s * 0.8);
            // s = pow(s, 1.0);
            pos.z += s * strength;
        }
    }

    // hover bulge
    float dist = distance(uv, uMouse);
    float hoverStrength = smoothstep(0.5, 0.0, dist / 2.) * uHover;
    pos.z += hoverStrength * 0.35;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
