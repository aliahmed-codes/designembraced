precision highp float;

uniform float uNormalizedY;
uniform float uIdleTime;
uniform float uFlipCurve;

varying vec2 vUv;

#define PI 3.14159265358979

void main() {
  vUv = uv;

  vec3 pos = position;

  float foldProgress = clamp(abs(uNormalizedY), 0.0, 1.0);
  float rollRadius = 0.2;

  if (foldProgress > 0.001) {
    if (uNormalizedY < 0.0) {
      // exiting upward — crease rises from bottom, plane rolls into cylinder
      float foldLine = foldProgress;
      float foldLocal = foldLine - 0.5;

      if (uv.y < foldLine) {
        float d = foldLocal - pos.y; // distance below crease (>0)
        float phi = min(d / rollRadius, PI); // angle around cylinder, max half-rev
        pos.y = foldLocal - rollRadius * sin(phi);
        pos.z += rollRadius * (1.0 - cos(phi));
      }
    } else {
      // entering from below — crease descends from top, plane unrolls
      float foldLine = 1.0 - foldProgress;
      float foldLocal = foldLine - 0.5;

      if (uv.y > foldLine) {
        float d = pos.y - foldLocal;
        float phi = min(d / rollRadius, PI);
        pos.y = foldLocal + rollRadius * sin(phi);
        pos.z += rollRadius * (1.0 - cos(phi));
      }
    }
  }

  // Rounded flip: bow centre toward viewer so rotation feels like a physical card
  pos.z += uFlipCurve * sin(uv.y * PI) * 0.35;

  // Subtle idle vertex animation in final state
  if (uIdleTime > 0.0) {
    pos.z += sin(pos.y * 3.2 + uIdleTime) * 0.007
           + sin(pos.x * 2.1 + uIdleTime * 0.73) * 0.005;
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
