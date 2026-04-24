precision highp float;

uniform float uHover;
uniform vec2 uMouse;
uniform float uNormalizedY;
uniform float uBulge;
uniform float uFlipCurve;

varying vec2 vUv;

#define PI 3.14159265358979

void main()
{
    vUv = uv;

    vec3 pos = position;

    // Center bulge toward viewer, then relax
    float bulgeR = length(uv - 0.5);
    pos.z += smoothstep(0.72, 0.0, bulgeR) * uBulge * 0.65;

    float foldProgress = clamp(abs(uNormalizedY), 0.0, 1.0);
    float rollRadius   = 0.3;

    if(foldProgress > 0.001)
    {
        if(uNormalizedY < 0.0)
        {
            // exiting upward — crease rises from bottom
            float foldLine  = foldProgress;
            float foldLocal = foldLine - 0.5;

            if(uv.y < foldLine)
            {
                float d   = foldLocal - pos.y;
                float phi = min(d / rollRadius, PI);
                pos.y = foldLocal - rollRadius * sin(phi);
                pos.z += rollRadius * (1.0 - cos(phi));
            }
        }
        else
        {
            // entering from below — crease descends from top
            float foldLine  = 1.0 - foldProgress;
            float foldLocal = foldLine - 0.5;

            if(uv.y > foldLine)
            {
                float d   = pos.y - foldLocal;
                float phi = min(d / rollRadius, PI);
                pos.y = foldLocal + rollRadius * sin(phi);
                pos.z += rollRadius * (1.0 - cos(phi));
            }
        }
    }

    // Rounded flip: bow centre toward viewer so rotation feels like a physical card
    pos.z += uFlipCurve * sin(uv.y * PI) * 0.35;

    // hover bulge
    float dist = distance(uv, uMouse);
    float hoverStrength = smoothstep(0.5, 0.0, dist / 2.) * uHover;
    pos.z += hoverStrength * 0.35;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
