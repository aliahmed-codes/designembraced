precision highp float;

uniform sampler2D tMap;
uniform vec2 uImageSizes;
uniform vec2 uPlaneSizes;
uniform float uStrips;

varying vec2 vUv;

void main() {
    vec2 ratio = vec2(
        min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
        min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );

    vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    if (!gl_FrontFacing) {
        uv.y = 1.0 - uv.y;
    }

    // Horizontal strips with per-strip randomised UV offset
    if (uStrips > 0.001) {
        float numStrips = 14.0;
        float stripId   = floor(vUv.y * numStrips);
        float rand      = fract(sin(stripId * 127.1 + 0.5) * 43758.5453);
        uv.x = clamp(uv.x + (rand - 0.5) * uStrips * 0.22, 0.0, 1.0);
    }

    gl_FragColor = texture2D(tMap, uv);
}
