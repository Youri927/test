// Carte du parcours du Dr. Fakhoury : les États de l'est des États-Unis, en tracés SVG.
// Données : us-atlas (Census Bureau, domaine public), projection conique conforme centrée sur l'est.
// Écrit src/data/east-map.json : contour, frontières intérieures, les trois États du parcours, les trois étapes.
//   node tools/map.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { geoConicConformal, geoPath } from 'd3-geo'
import { feature, merge, mesh } from 'topojson-client'
import { presimplify, simplify } from 'topojson-simplify'

const root = path.resolve(import.meta.dirname, '..')
const topo = JSON.parse(readFileSync(path.join(root, 'node_modules/us-atlas/states-10m.json'), 'utf8'))

const EAST = new Set([
  'Michigan', 'Wisconsin', 'Illinois', 'Indiana', 'Ohio', 'Kentucky', 'Tennessee', 'Mississippi', 'Alabama', 'Georgia', 'Florida',
  'South Carolina', 'North Carolina', 'Virginia', 'West Virginia', 'Maryland', 'Delaware', 'District of Columbia', 'New Jersey',
  'Pennsylvania', 'New York', 'Connecticut', 'Rhode Island', 'Massachusetts', 'Vermont', 'New Hampshire', 'Maine',
])

// simplification : on garde les détails visibles à environ 700 px de haut
const simple = simplify(presimplify(topo), 0.004)
const geoms = simple.objects.states.geometries.filter((g) => EAST.has(g.properties.name))
const states = { type: 'GeometryCollection', geometries: geoms }

const W = 600
const H = 720
const fc = feature(simple, states)
const projection = geoConicConformal().parallels([30, 44]).rotate([82, 0]).fitExtent([[6, 6], [W - 6, H - 6]], fc)
const toPath = geoPath(projection).digits(1)

const outline = toPath(merge(simple, geoms))
const borders = toPath(mesh(simple, states, (a, b) => a !== b))
const stateOf = (name) => toPath(feature(simple, geoms.find((g) => g.properties.name === name)))
const pt = (lon, lat) => projection([lon, lat]).map((v) => Math.round(v * 10) / 10)

// les étapes : le Michigan (centre de la péninsule inférieure), Manhattan (NYU), Naples (4280 Tamiami Trail East)
const stops = {
  michigan: pt(-84.6, 43.3),
  newYork: pt(-73.997, 40.73),
  naples: pt(-81.75, 26.12),
}

const out = { w: W, h: H, outline, borders, michigan: stateOf('Michigan'), newYork: stateOf('New York'), florida: stateOf('Florida'), stops }
writeFileSync(path.join(root, 'src/data/east-map.json'), JSON.stringify(out) + '\n')
console.log(`east-map.json : ${(JSON.stringify(out).length / 1024).toFixed(1)} Ko`, stops)
