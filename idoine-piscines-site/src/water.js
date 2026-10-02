/* Idoine — l'eau vivante (WebGL) et la texture de reflets (caustiques) */
(() => {
  'use strict';

  /* ——— Texture de caustiques, tuilable, calculée une fois (Voronoï périodique) ——— */
  // Les reflets de lumière au fond d'un bassin dessinent un réseau de filaments clairs :
  // on les obtient aux frontières des cellules d'un diagramme de Voronoï, déformé.
  function causticTile(size = 256, cells = 5, seed = 7, warp = 0.07) {
    let s = seed;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const layers = [cells, cells * 2].map((n) => {
      const pts = [];
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) pts.push([(i + rnd()) / n, (j + rnd()) / n]);
      return {n, pts};
    });
    const edge = (layer, x, y) => {
      const {n, pts} = layer;
      const ci = Math.floor(x * n);
      const cj = Math.floor(y * n);
      let d1 = 9;
      let d2 = 9;
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          const ii = (ci + di + n) % n;
          const jj = (cj + dj + n) % n;
          const p = pts[jj * n + ii];
          // position de la cellule voisine, en tenant compte du bouclage de la tuile
          const px = p[0] + Math.floor((ci + di) / n);
          const py = p[1] + Math.floor((cj + dj) / n);
          const dx = (px - x) * n;
          const dy = (py - y) * n;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
        }
      }
      return d2 - d1;
    };
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(size, size);
    const TAU = Math.PI * 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const v = y / size;
        // déformation périodique : les filaments ondulent sans casser la tuile
        const wu = u + warp * Math.sin(TAU * (v * 2 + u)) + warp * 0.5 * Math.sin(TAU * v * 3);
        const wv = v + warp * Math.sin(TAU * (u * 2 - v)) + warp * 0.5 * Math.cos(TAU * u * 3);
        const fu = ((wu % 1) + 1) % 1;
        const fv = ((wv % 1) + 1) % 1;
        const a = edge(layers[0], fu, fv);
        const b = edge(layers[1], (fu + 0.37) % 1, (fv + 0.61) % 1);
        const ka = Math.pow(Math.max(0, 1 - a / 0.16), 2.4);
        const kb = Math.pow(Math.max(0, 1 - b / 0.12), 2.6) * 0.55;
        const k = Math.min(1, ka + kb);
        const o = (y * size + x) * 4;
        img.data[o] = 236;
        img.data[o + 1] = 255;
        img.data[o + 2] = 251;
        img.data[o + 3] = Math.round(k * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }

  /* ——— L'eau vivante : surface calculée en direct ——— */
  const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScale;
uniform int uCount;
uniform vec4 uDrops[24];

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 hash2(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }

// hauteur de la surface : houle légère + ondes nées des gouttes
float height(vec2 p){
  vec2 q = p / uScale;
  float t = uTime;
  float h = 0.0;
  h += sin(dot(q, vec2(0.86, 0.50)) * 1.6 + t * 0.85) * 0.11;
  h += sin(dot(q, vec2(-0.42, 0.91)) * 2.2 + t * 1.10) * 0.08;
  h += sin(dot(q, vec2(0.97, -0.24)) * 3.3 + t * 1.55) * 0.045;
  h += sin(dot(q, vec2(0.18, 0.98)) * 5.1 - t * 2.05) * 0.025;
  for (int i = 0; i < 24; i++) {
    if (i >= uCount) break;
    vec4 d = uDrops[i];
    float age = t - d.z;
    if (age > 0.0 && age < 5.0) {
      float r = length(p - d.xy) / uScale;
      float x = r - age * 1.45;
      float env = exp(-x * x * 2.6) * exp(-age * 0.95);
      h += d.w * 1.7 * sin(x * 8.5) * env / (1.0 + r * 1.2);
    }
  }
  return h;
}

// frontières de cellules de Voronoï animées : les filaments de lumière
float vedge(vec2 x, float t){
  vec2 n = floor(x);
  vec2 f = fract(x);
  float d1 = 8.0;
  float d2 = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      o = 0.5 + 0.42 * sin(t + 6.2831 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
    }
  }
  return sqrt(d2) - sqrt(d1);
}

float caustic(vec2 p, float t){
  float a = vedge(p, t * 0.55);
  float b = vedge(p * 1.9 + 4.7, -t * 0.42);
  return pow(1.0 - smoothstep(0.0, 0.2, a), 3.0) + 0.5 * pow(1.0 - smoothstep(0.0, 0.15, b), 3.0);
}

// fond du bassin : mosaïque de pâte de verre, joints clairs
vec3 mosaic(vec2 fp){
  vec2 tc = fp / (uScale * 0.2);
  vec2 id = floor(tc);
  vec2 f = fract(tc);
  float j = 0.05;
  float g = smoothstep(0.0, j, f.x) * smoothstep(0.0, j, f.y) * smoothstep(1.0, 1.0 - j, f.x) * smoothstep(1.0, 1.0 - j, f.y);
  float v = hash(id);
  vec3 deep = vec3(0.02, 0.31, 0.35);
  vec3 light = vec3(0.10, 0.56, 0.59);
  vec3 tile = mix(deep, light, 0.35 + 0.45 * v);
  tile *= 0.94 + 0.12 * hash(id + 3.7);
  vec3 joint = vec3(0.40, 0.66, 0.66);
  return mix(joint, tile, g);
}

void main(){
  vec2 p = gl_FragCoord.xy;
  float e = max(1.0, uScale * 0.012);
  float hc = height(p);
  float hx = height(p + vec2(e, 0.0)) - hc;
  float hy = height(p + vec2(0.0, e)) - hc;
  vec3 n = normalize(vec3(-hx * uScale * 0.7 / e, -hy * uScale * 0.7 / e, 1.0));

  // réfraction : le fond est vu à travers la surface
  vec2 fp = p + n.xy * uScale * 0.42;
  vec3 col = mosaic(fp);

  // les reflets de lumière dansent au fond, déviés par les vagues
  float c = caustic(fp / (uScale * 0.62) + n.xy * 1.6, uTime);
  // la lumière n'est pas uniforme : de grandes nappes plus claires passent lentement
  float m = 0.5 + 0.5 * sin(fp.x / (uScale * 2.6) + uTime * 0.21) * sin(fp.y / (uScale * 2.1) - uTime * 0.17);
  c *= 0.45 + 0.75 * m;
  col = col * (0.8 + 0.2 * c) + vec3(0.80, 1.0, 0.96) * c * 0.36;

  // profondeur : plus sombre vers le bas de l'écran
  vec2 uv = gl_FragCoord.xy / uRes;
  col = mix(col, vec3(0.02, 0.23, 0.27), 0.42 * pow(1.0 - uv.y, 1.4));

  // éclats du soleil sur la surface
  vec3 L = normalize(vec3(-0.32, 0.52, 0.79));
  vec3 R = reflect(-L, n);
  float spec = pow(max(R.z, 0.0), 140.0);
  col += vec3(1.0, 0.99, 0.95) * spec * 0.7;
  col += vec3(0.86, 0.98, 1.0) * pow(1.0 - n.z, 1.5) * 0.7;

  gl_FragColor = vec4(col, 1.0);
}`;

  function createWater(canvas) {
    const gl = canvas.getContext('webgl', {antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance'})
      || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      return sh;
    };
    let prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (err) {
      console.warn('Eau : WebGL indisponible', err);
      return null;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const U = (name) => gl.getUniformLocation(prog, name);
    const uRes = U('uRes');
    const uTime = U('uTime');
    const uScale = U('uScale');
    const uCount = U('uCount');
    const uDrops = U('uDrops[0]');

    const MAX = 24;
    const drops = new Float32Array(MAX * 4);
    let head = 0;
    let count = 0;
    let res = 1;
    let cssW = 1;
    let cssH = 1;
    let time = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      cssW = Math.max(1, r.width);
      cssH = Math.max(1, r.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      // budget de pixels : l'eau est douce, inutile de la calculer en pleine définition
      res = Math.min(dpr, Math.sqrt(1.5e6 / (cssW * cssH)));
      canvas.width = Math.round(cssW * res);
      canvas.height = Math.round(cssH * res);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    // une goutte en (x, y) px CSS, depuis le coin haut gauche du canvas
    const drop = (x, y, strength) => {
      const i = head * 4;
      drops[i] = x * res;
      drops[i + 1] = (cssH - y) * res;
      drops[i + 2] = time;
      drops[i + 3] = strength;
      head = (head + 1) % MAX;
      count = Math.min(MAX, count + 1);
    };

    const render = (t) => {
      time = t;
      const scale = Math.max(90, Math.min(cssW, 1500) * 0.085) * res;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uScale, scale);
      gl.uniform1i(uCount, count);
      gl.uniform4fv(uDrops, drops);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();
    return {resize, drop, render, get time() { return time; }};
  }

  window.IdoineWater = {createWater, causticTile};
})();
