precision highp float;

uniform float uNormalizedY;
uniform float uProgress;

varying vec2 vUv;

#define PI 3.14159265358979

float easeInOutCubic(float t) {
  return t < 0.5
    ? 4.0 * t * t * t
    : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

mat3 rotateX(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}

void main() {
  vUv = uv;
  vec3 pos = position;

  // ── Phase 2: Page-flip (uProgress 0→1) ──────────────────────────────────
  if (uProgress > 0.001) {
    float offset = 1.0 - uv.y;
    float smoothProgress = clamp((uProgress - offset * 0.4) / 0.6, 0.0, 1.0);
    float jump = sin(uProgress * PI) * 0.2;

    // Slight scale-down from top as flip begins — pinch effect
    float pinch = 1.0 - smoothstep(0.0, 0.25, uProgress) * 0.06 * (1.0 - uv.y);
    pos.y *= pinch;

    vec3 center = vec3(0.0, 0.0, 0.1);
    pos =
      rotateX(easeInOutCubic(smoothProgress) * PI) * (pos - center) + center;
    pos.y += jump;

    float widthFactor = pow(1.0 - uv.y, 2.0); // stronger near bottom
    float expand = jump * widthFactor;

    pos.x *= 1.0 + expand;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    return;
  }
  // ────────────────────────────────────────────────────────────────────────

  // Scroll fold
  float foldProgress = clamp(abs(uNormalizedY), 0.0, 1.0);
  float rollRadius = 0.2;

  if (foldProgress > 0.001) {
    if (uNormalizedY < 0.0) {
      float foldLine = foldProgress;
      float foldLocal = foldLine - 0.5;
      if (uv.y < foldLine) {
        float d = foldLocal - pos.y;
        float phi = min(d / rollRadius, PI);
        pos.y = foldLocal - rollRadius * sin(phi);
        pos.z += rollRadius * (1.0 - cos(phi));
      }
    } else {
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

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
