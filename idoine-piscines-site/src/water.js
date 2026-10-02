/* Idoine — texture de reflets (caustiques) pour l'eau des dessins */
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

  window.IdoineWater = {causticTile};
})();
