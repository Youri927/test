/* Fond de bassin sous l'eau, en WebGL2.
 *
 * La surface est une somme de houles (et des ronds laissés par le curseur), calculée de façon
 * exacte à chaque instant : la même image pour le même temps, ce qui permet de filmer le site
 * image par image.
 * 1. Caustiques : une grille de rayons de soleil traverse la surface, se réfracte (loi de
 *    Snell) et touche le fond ; la lumière reçue est le rapport des aires avant et après
 *    réfraction, accumulé dans une texture (là où les rayons se resserrent, le fond s'allume).
 * 2. Image : le fond est vu à travers la même surface, éclairé par ces caustiques, teinté par
 *    l'épaisseur d'eau, avec les reflets du soleil sur les crêtes. Le bassin peut être vidé ou
 *    rempli (une ligne d'eau avance sur le fond sec) et un fond peut en remplacer un autre, en
 *    cercle (porté par une onde) ou en bande (comme une passe de lisseuse).
 */
(function () {
  const SURF = `
  #define NW 12
  #define ND 16
  uniform float uT;
  uniform vec4 uW[NW];
  uniform vec2 uWo[NW];
  uniform vec4 uDrop[ND];
  uniform vec3 uRip;
  vec3 surf(vec2 p) {
    vec3 r = vec3(0.);
    for (int i = 0; i < NW; i++) {
      vec4 w = uW[i];
      float ph = dot(w.xy, p) * w.z - uT * uWo[i].x + uWo[i].y;
      r += w.w * vec3(sin(ph), w.z * w.xy * cos(ph));
    }
    for (int i = 0; i < ND; i++) {
      vec4 d = uDrop[i];
      float age = uT - d.z;
      if (d.w <= 0. || age <= 0. || age > 7.) continue;
      vec2 v = p - d.xy;
      float rr = length(v) + 0.001;
      float sig = 14. + 22. * age;
      float f = rr - uRip.y * age;
      float env = d.w * exp(-f * f / (2. * sig * sig)) * exp(-age * uRip.z) * inversesqrt(1. + rr * 0.02);
      float ph = rr * uRip.x - 2. * uRip.x * uRip.y * age;
      float s = sin(ph), c = cos(ph);
      r.x += env * s;
      float dr = env * (uRip.x * c - f / (sig * sig) * s);
      r.yz += dr * v / rr;
    }
    return r;
  }`;

  const CAUS_VS = `#version 300 es
  precision highp float;
  ${SURF}
  in vec2 aPos;
  uniform vec2 uRes;
  uniform float uMargin, uDepth;
  uniform vec2 uTilt;
  out vec2 vOld, vNew;
  void main() {
    vec2 p = mix(vec2(-uMargin), uRes + uMargin, aPos);
    vec3 s = surf(p);
    vec3 n = normalize(vec3(-s.y, -s.z, 1.));
    vec3 L = normalize(vec3(uTilt, -1.));
    vec3 R = refract(L, n, 0.7519);
    vec3 R0 = refract(L, vec3(0., 0., 1.), 0.7519);
    vec2 shift = R0.xy * (uDepth / -R0.z);
    vNew = p + R.xy * (uDepth / -R.z) - shift;
    vOld = p;
    gl_Position = vec4(vNew / uRes * 2. - 1., 0., 1.);
  }`;

  const CAUS_FS = `#version 300 es
  precision highp float;
  in vec2 vOld, vNew;
  out vec4 o;
  void main() {
    vec2 ax = dFdx(vOld), ay = dFdy(vOld), bx = dFdx(vNew), by = dFdy(vNew);
    float a0 = abs(ax.x * ay.y - ax.y * ay.x);
    float a1 = abs(bx.x * by.y - bx.y * by.x);
    o = vec4(vec3(0.25 * a0 / max(a1, a0 * 0.02)), 1.);
  }`;

  const VIEW_VS = `#version 300 es
  in vec2 aPos;
  out vec2 vUv;
  void main() { vUv = aPos * .5 + .5; gl_Position = vec4(aPos, 0., 1.); }`;

  const VIEW_FS = `#version 300 es
  precision highp float;
  ${SURF}
  in vec2 vUv;
  out vec4 o;
  uniform sampler2D uA, uB, uCaus;
  uniform vec2 uRes;
  uniform float uScaleA, uScaleB, uDepth, uView, uSun, uAmb, uGrain, uBlur, uClear;
  uniform vec3 uRing;
  uniform vec4 uWipe, uFill;
  uniform vec3 uTransA, uTransB, uDeepA, uDeepB;
  uniform vec3 uSunDir;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 uv = vUv;
    vec2 p = uv * uRes;
    // l'eau arrive du grand bain (f = 0) ; ligne d'eau légèrement irrégulière
    float f = dot(uv - .5, uFill.xy) + .5;
    f += .006 * sin(p.x * .031 + p.y * .017) + .004 * sin(p.y * .05 - p.x * .02 + 1.3);
    float L = uFill.z * 1.7 - .25;
    float inW = smoothstep(L + .0015, L - .0015, f);
    float dd = clamp((L - f) / .22, 0., 1.);
    vec3 s = surf(p);
    vec2 g = s.yz * inW;
    vec2 q = p - g * uDepth * .25 * uView * dd;
    // nouveau fond : en cercle ou en bande
    float inB = 0., fresh = 0.;
    float rim = 0.;
    if (uRing.z > 0.) {
      float rd = length(q - uRing.xy) - uRing.z;
      inB = smoothstep(1.5, -1.5, rd);
      rim = exp(-rd * rd / 40.) * .35 + exp(-max(rd, 0.) / 26.) * step(0., rd) * .08;
    }
    if (uWipe.w > 0.) {
      float x = dot(q / uRes - .5, uWipe.xy) + .5;
      x += .004 * sin(q.y * .023 + 1.7) + .003 * sin(q.y * .061 + q.x * .011) + .0015 * sin(q.y * .17 + q.x * .05);
      float wb = smoothstep(uWipe.z + .002, uWipe.z - .002, x);
      fresh = wb * smoothstep(uWipe.z - .05, uWipe.z, x) * step(uWipe.z, .999);
      inB = max(inB, wb);
    }
    float bl = uBlur * inW * dd;
    vec2 tq = vec2(q.x, uRes.y - q.y);
    vec3 fa = texture(uA, tq * uScaleA, bl).rgb;
    vec3 fb = texture(uB, tq * uScaleB, bl).rgb;
    vec3 fl = mix(fa, fb, inB) * (1. - .22 * fresh);
    // fond sec, au soleil ; plus sombre là où il vient d'être mouillé
    float band = smoothstep(L + .04, L, f) * (1. - inW);
    vec3 dry = fl * (uAmb + uSun) * (1. - .16 * band);
    // fond mouillé : caustiques avec une légère dispersion des couleurs
    vec2 cuv = q / uRes;
    vec2 disp = g * .9 / uRes;
    vec3 c = vec3(texture(uCaus, cuv - disp).r, texture(uCaus, cuv).r, texture(uCaus, cuv + disp).r) * 4.;
    float cm = sqrt(dd) * uClear;
    vec3 trans = mix(vec3(1.), mix(uTransA, uTransB, inB) * mix(.72, 1., uClear), dd);
    vec3 deep = mix(uDeepA, uDeepB, inB) * dd * (1. + (1. - uClear) * 1.6);
    vec3 wet = fl * (uAmb + uSun * mix(vec3(1.), c, cm)) * trans + deep;
    vec3 n = normalize(vec3(-g * 1.4, 1.));
    vec3 rf = reflect(vec3(0., 0., -1.), n);
    wet += pow(max(dot(rf, uSunDir), 0.), 420.) * 1.6 * dd;
    wet += vec3(.85, .95, 1.) * (.015 + 2.5 * (1. - n.z)) * dd;
    vec3 col = mix(dry, wet, inW) + rim;
    col += exp(-pow((f - L) / .0016, 2.)) * .22 * step(.001, uFill.z) * step(uFill.z, .999) * (1. - step(1.2, L));
    col = col / (1. + col * .18);
    col = sqrt(max(col, 0.));
    col += (hash(gl_FragCoord.xy + fract(uT) * 91.) - .5) * uGrain;
    o = vec4(col, 1.);
  }`;

  function sh(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function prog(gl, vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, sh(gl, gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      u[info.name.replace('[0]', '')] = gl.getUniformLocation(p, info.name);
    }
    return {p, u};
  }

  // générateur pseudo-aléatoire reproductible
  function rnd(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

  class Water {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {object} o  tile : largeur d'une texture de fond en px (à l'échelle 1), depth : profondeur
     *                    en px, focus : netteté des caustiques, lam : longueurs d'onde de la houle
     */
    constructor(canvas, o = {}) {
      this.canvas = canvas;
      this.o = Object.assign({depth: 1500, tile: 330, focus: 4, lam: [64, 200], calm: 1, dpr: 1.5, seed: 7, sun: 0.85, amb: 0.3, wind: -0.6, blur: 1.4, view: 0.32, grain: 0.012, tint: 1, spread: 2.4}, o);
      const gl = canvas.getContext('webgl2', {antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: !!o.keep, powerPreference: 'high-performance'});
      if (!gl) throw new Error('webgl2');
      this.gl = gl;
      this.caus = prog(gl, CAUS_VS, CAUS_FS);
      this.view = prog(gl, VIEW_VS, VIEW_FS);
      this.drops = new Float32Array(16 * 4);
      this.di = 0;
      this.texs = {};
      this.s = {a: null, b: null, ring: null, wipe: -1, wipeDir: [1, 0], level: 1, fillDir: [1, 0], clear: 1};
      this.t = 0;
      this.quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      this.grid = {buf: gl.createBuffer(), idx: gl.createBuffer(), n: 0, key: ''};
      this.fbo = gl.createFramebuffer();
      this.ctex = gl.createTexture();
      this.resize();
    }

    get k() {
      // échelle commune à toute la page (la largeur de la fenêtre), pas celle du canvas
      return this.o.scale || Math.min(1.25, Math.max(0.62, window.innerWidth / 1440));
    }

    /** Houle : 12 trains d'ondes autour d'une direction de vent, accordés pour que les rayons se croisent juste au-dessus du fond */
    waves() {
      const r = rnd(this.o.seed);
      const W = new Float32Array(48);
      const Wo = new Float32Array(24);
      const D = this.o.depth;
      for (let i = 0; i < 12; i++) {
        const lam = (this.o.lam[0] + r() * (this.o.lam[1] - this.o.lam[0])) * this.k;
        const k = (2 * Math.PI) / lam;
        const a = this.o.wind + (r() - 0.5) * this.o.spread;
        const focus = (this.o.focus / 12) * (0.6 + r() * 0.8) * this.o.calm;
        W.set([Math.cos(a), Math.sin(a), k, focus / (D * 0.25 * k * k)], i * 4);
        Wo.set([Math.sqrt((11000 * k) / this.k) * 0.26, r() * 6.283], i * 2);
      }
      this.W = W;
      this.Wo = Wo;
      // ronds dans l'eau : longueur d'onde 46 px, vitesse 110 px/s, amortissement
      const kr = (2 * Math.PI) / (46 * this.k);
      this.rip = [kr, 110 * this.k, 0.55];
      this.ripAmp = 1.6 / (D * 0.25 * kr * kr);
    }

    /** Ajoute un fond : image décodée, teinte de l'eau au-dessus (deep : couleur diffusée, trans : transmission RVB), taille relative */
    texture(name, img, {deep = '#0a4a60', trans = [0.24, 0.72, 0.86], size = 1} = {}) {
      const gl = this.gl;
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      const af = gl.getExtension('EXT_texture_filter_anisotropic');
      if (af) gl.texParameterf(gl.TEXTURE_2D, af.TEXTURE_MAX_ANISOTROPY_EXT, 8);
      this.texs[name] = {t, deep: hex(deep), trans, size};
      if (!this.s.a) this.s.a = name;
    }

    /** Change l'état (fond a, fond b, ring {x, y, t0}, wipe 0..1, level 0..1, clear 0..1, fillDir, wipeDir) */
    set(st) {
      Object.assign(this.s, st);
    }

    resize() {
      const c = this.canvas;
      const w = c.clientWidth || 1;
      const h = c.clientHeight || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, this.o.dpr);
      const k0 = this.w ? this.k : 0;
      this.w = w;
      this.h = h;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      if (this.k !== k0) this.waves();
      // grille de rayons : un sommet tous les ~7 px, avec une marge pour les rayons déviés vers l'intérieur
      const gl = this.gl;
      this.margin = 90 * this.k;
      const step = 7 * this.k;
      const nx = Math.min(320, Math.ceil((w + 2 * this.margin) / step));
      const ny = Math.min(320, Math.ceil((h + 2 * this.margin) / step));
      const key = nx + 'x' + ny;
      if (key !== this.grid.key) {
        const v = new Float32Array((nx + 1) * (ny + 1) * 2);
        let o = 0;
        for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { v[o++] = i / nx; v[o++] = j / ny; }
        const idx = new Uint32Array(nx * ny * 6);
        o = 0;
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
          const a = j * (nx + 1) + i, b = a + 1, c2 = a + nx + 1, d = c2 + 1;
          idx[o++] = a; idx[o++] = b; idx[o++] = c2; idx[o++] = b; idx[o++] = d; idx[o++] = c2;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.grid.buf);
        gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.grid.idx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
        this.grid.n = idx.length;
        this.grid.key = key;
      }
      // texture des caustiques : demi-résolution
      this.cw = Math.max(64, Math.round(c.width * 0.5));
      this.ch = Math.max(64, Math.round(c.height * 0.5));
      gl.bindTexture(gl.TEXTURE_2D, this.ctex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.cw, this.ch, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.ctex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /** Un rond dans l'eau, en px CSS depuis le coin haut gauche du canvas */
    drop(x, y, amp = 1, t = this.t) {
      this.drops.set([x, this.h - y, t, amp * this.ripAmp], this.di * 4);
      this.di = (this.di + 1) % 16;
    }

    /** Remplace le fond par un autre à partir de (x, y), porté par une onde */
    swap(name, x, y, t = this.t) {
      if (name === this.s.a && !this.s.ring) return;
      if (this.s.ring) this.s.a = this.s.b;
      this.s.b = name;
      this.s.ring = {x, y: this.h - y, t0: t, dur: 1.5, far: Math.hypot(Math.max(x, this.w - x), Math.max(y, this.h - y)) + 60};
      this.drop(x, y, 2.2, t);
    }

    uniforms(pr) {
      const gl = this.gl;
      gl.uniform1f(pr.u.uT, this.t);
      gl.uniform4fv(pr.u.uW, this.W);
      gl.uniform2fv(pr.u.uWo, this.Wo);
      gl.uniform4fv(pr.u.uDrop, this.drops);
      gl.uniform3fv(pr.u.uRip, this.rip);
    }

    render(t) {
      this.t = t;
      const gl = this.gl;
      const s = this.s;
      let ringR = -1;
      if (s.ring) {
        const k = Math.min(1, Math.max(0, (t - s.ring.t0) / s.ring.dur));
        ringR = s.ring.far * (1 - Math.pow(1 - k, 2.6));
        if (k >= 1) {
          s.a = s.b;
          s.ring = null;
          ringR = -1;
        }
      }
      const A = this.texs[s.a];
      const B = this.texs[s.b] || A;
      if (!A) return;
      // 1. caustiques (inutiles si le bassin est vide)
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.viewport(0, 0, this.cw, this.ch);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (s.level > 0.001) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        const c = this.caus;
        gl.useProgram(c.p);
        this.uniforms(c);
        gl.uniform2f(c.u.uRes, this.w, this.h);
        gl.uniform1f(c.u.uMargin, this.margin);
        gl.uniform1f(c.u.uDepth, this.o.depth);
        gl.uniform2f(c.u.uTilt, 0.12, 0.2);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.grid.buf);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.grid.idx);
        gl.drawElements(gl.TRIANGLES, this.grid.n, gl.UNSIGNED_INT, 0);
        gl.disable(gl.BLEND);
      }
      // 2. le fond vu à travers l'eau
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      const v = this.view;
      gl.useProgram(v.p);
      this.uniforms(v);
      const base = this.o.tile * this.k;
      gl.uniform2f(v.u.uRes, this.w, this.h);
      gl.uniform1f(v.u.uScaleA, 1 / (base * A.size));
      gl.uniform1f(v.u.uScaleB, 1 / (base * B.size));
      gl.uniform1f(v.u.uDepth, this.o.depth);
      gl.uniform1f(v.u.uView, this.o.view);
      gl.uniform1f(v.u.uSun, this.o.sun);
      gl.uniform1f(v.u.uAmb, this.o.amb);
      gl.uniform1f(v.u.uGrain, this.o.grain);
      gl.uniform1f(v.u.uBlur, this.o.blur);
      gl.uniform1f(v.u.uClear, s.clear);
      gl.uniform3f(v.u.uRing, s.ring ? s.ring.x : 0, s.ring ? s.ring.y : 0, ringR);
      gl.uniform4f(v.u.uWipe, s.wipeDir[0], s.wipeDir[1], s.wipe, s.wipe >= 0 ? 1 : 0);
      gl.uniform4f(v.u.uFill, s.fillDir[0], s.fillDir[1], s.level, 0);
      // tint < 1 : eau moins épaisse, le fond se lit mieux
      const tn = this.o.tint;
      gl.uniform3fv(v.u.uTransA, A.trans.map((x) => 1 - (1 - x) * tn));
      gl.uniform3fv(v.u.uTransB, B.trans.map((x) => 1 - (1 - x) * tn));
      gl.uniform3fv(v.u.uDeepA, A.deep.map((x) => x * tn));
      gl.uniform3fv(v.u.uDeepB, B.deep.map((x) => x * tn));
      const sd = [0.25, 0.3, 1];
      const l = Math.hypot(...sd);
      gl.uniform3f(v.u.uSunDir, sd[0] / l, sd[1] / l, sd[2] / l);
      [[A.t, 'uA'], [B.t, 'uB'], [this.ctex, 'uCaus']].forEach(([tx, name], i) => {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, tx);
        gl.uniform1i(v.u[name], i);
      });
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }

  window.Water = Water;
})();
