/* IB Chemistry values transcribed only from ib-electronegativity-reference.png. */
const EN = {
  H: 2.2, Li: 1.0, Be: 1.6, B: 2.0, C: 2.6, N: 3.0, O: 3.4, F: 4.0,
  Na: 0.9, Mg: 1.3, Al: 1.6, Si: 1.9, P: 2.2, S: 2.6, Cl: 3.2,
  K: 0.8, Ca: 1.0, Sc: 1.4, Ti: 1.5, V: 1.6, Cr: 1.7, Mn: 1.6, Fe: 1.8, Co: 1.9, Ni: 1.9, Cu: 1.9, Zn: 1.6, Ga: 1.8, Ge: 2.0, As: 2.2, Se: 2.6, Br: 3.0,
  Rb: 0.8, Sr: 1.0, Y: 1.2, Zr: 1.3, Nb: 1.6, Mo: 2.2, Tc: 2.1, Ru: 2.2, Rh: 2.3, Pd: 2.2, Ag: 1.9, Cd: 1.7, In: 1.8, Sn: 2.0, Sb: 2.0, Te: 2.1, I: 2.7,
  Cs: 0.8, Ba: 0.9, La: 1.1, Hf: 1.3, Ta: 1.5, W: 1.7, Re: 1.9, Os: 2.2, Ir: 2.2, Pt: 2.2, Au: 2.4, Hg: 1.9, Tl: 1.8, Pb: 1.8, Bi: 1.9, Po: 2.0, At: 2.2,
  Fr: 0.7, Ra: 0.9, Ac: 1.1,
  Ce: 1.1, Pr: 1.1, Nd: 1.1, Sm: 1.2, Gd: 1.2, Dy: 1.2, Ho: 1.2, Er: 1.2, Tm: 1.3, Lu: 1.0,
  Th: 1.3, Pa: 1.5, U: 1.7, Np: 1.3, Pu: 1.3
};

const PERIODS = [
  ['H','','','','','','','','','','','','','','','','','He'],
  ['Li','Be','','','','','','','','','','','B','C','N','O','F','Ne'],
  ['Na','Mg','','','','','','','','','','','Al','Si','P','S','Cl','Ar'],
  ['K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'],
  ['Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'],
  ['Cs','Ba','La','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn'],
  ['Fr','Ra','Ac','','','','','','','','','','','','','','',''],
  ['','', 'Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','',''],
  ['','', 'Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr','','']
];

const X_MIN = 0.79, X_MAX = 4.0, Y_MAX = 3.2;
const PLOT = { left: 88, top: 90, width: 620, height: 560 };
const points = [];
const inputA = document.querySelector('#element-a');
const inputB = document.querySelector('#element-b');
const message = document.querySelector('#message');
const results = document.querySelector('#results');
const pointLayer = document.querySelector('#plot-points');
const svgNS = 'http://www.w3.org/2000/svg';

function normalizeSymbol(value) {
  const text = value.trim();
  if (!/^[a-zA-Z]{1,2}$/.test(text)) return null;
  return text[0].toUpperCase() + text.slice(1).toLowerCase();
}
function xToSvg(x) { return PLOT.left + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT.width; }
function yToSvg(y) { return PLOT.top + PLOT.height - (y / Y_MAX) * PLOT.height; }
function svgEl(name, attributes = {}, text = '') {
  const node = document.createElementNS(svgNS, name);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  node.textContent = text;
  return node;
}
function polygonPath(coords) { return coords.map(([x, y]) => `${xToSvg(x)},${yToSvg(y)}`).join(' '); }
function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if (((yi > point[1]) !== (yj > point[1])) && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const OUTER_TRIANGLE = {
  left: [0.79, 0],
  apex: [2.32, 3.18],
  right: [3.97, 0]
};
function pointOnEdgeAtY(start, end, y) {
  const progress = (y - start[1]) / (end[1] - start[1]);
  return [start[0] + (end[0] - start[0]) * progress, y];
}
const metallicIonicEdge = pointOnEdgeAtY(OUTER_TRIANGLE.left, OUTER_TRIANGLE.apex, 1.20);
const ionicPolarEdge = pointOnEdgeAtY(OUTER_TRIANGLE.apex, OUTER_TRIANGLE.right, 2.35);
const polarCovalentEdge = pointOnEdgeAtY(OUTER_TRIANGLE.apex, OUTER_TRIANGLE.right, 1.00);
const lowerInternalEdge = [1.73, 0.40];
const lowerCovalentEdge = [1.92, 0];

const REGIONS = [
  { name: 'metallic', label: 'Metallic', color: '#70706c', points: [OUTER_TRIANGLE.left, metallicIonicEdge, lowerInternalEdge, lowerCovalentEdge] },
  { name: 'ionic', label: 'Ionic', color: '#c2c4bc', points: [metallicIonicEdge, OUTER_TRIANGLE.apex, ionicPolarEdge, lowerInternalEdge] },
  { name: 'polar covalent', label: 'Polar\ncovalent', color: '#8b9ea0', points: [lowerInternalEdge, ionicPolarEdge, polarCovalentEdge] },
  { name: 'covalent', label: 'Covalent', color: '#e5bf69', points: [lowerCovalentEdge, lowerInternalEdge, ionicPolarEdge, polarCovalentEdge, OUTER_TRIANGLE.right] }
];
function bondingRegion(avg, delta) {
  const point = [avg, delta];
  const region = REGIONS.find((item) => pointInPolygon(point, item.points));
  return region ? region.name : 'outside the reference triangle';
}
function characterRange(delta) {
  const levels = [[0, 100, 0], [1, 75, 25], [1.6, 50, 50], [2.3, 25, 75], [3.1, 8, 92]];
  const exact = levels.find(([value]) => Math.abs(delta - value) < 0.00001);
  if (exact) return { covalent: `${exact[1]}%`, ionic: `${exact[2]}%` };
  if (delta < 1) return { covalent: 'between 75% and 100%', ionic: 'between 0% and 25%' };
  if (delta < 1.6) return { covalent: 'between 50% and 75%', ionic: 'between 25% and 50%' };
  if (delta < 2.3) return { covalent: 'between 25% and 50%', ionic: 'between 50% and 75%' };
  if (delta < 3.1) return { covalent: 'between 8% and 25%', ionic: 'between 75% and 92%' };
  return { covalent: 'less than 8%', ionic: 'more than 92%' };
}
function fmt(value) { return value.toFixed(2).replace(/\.?0+$/, ''); }
function fmtEN(value) { return value.toFixed(1); }

function drawTriangle() {
  const base = document.querySelector('#triangle-base');
  base.replaceChildren();
  base.append(svgEl('text', { x: 0, y: 29, 'font-size': 25, 'font-weight': 'bold' }, 'Electronegativity difference:'));
  base.append(svgEl('text', { x: 98, y: 67, 'font-size': 27, 'font-style': 'italic' }, 'Δχ = |χₐ − χᵦ|'));
  base.append(svgEl('rect', { x: PLOT.left, y: PLOT.top, width: PLOT.width, height: PLOT.height, fill: 'none', stroke: '#333', 'stroke-width': 1 }));
  [1, 1.6, 2.3].forEach((value) => base.append(svgEl('line', { x1: PLOT.left, y1: yToSvg(value), x2: PLOT.left + PLOT.width, y2: yToSvg(value), stroke: '#777', 'stroke-width': 1 })));
  REGIONS.forEach((region) => base.append(svgEl('polygon', { points: polygonPath(region.points), fill: region.color })));
  const labels = [
    ['Metallic', 1.32, .32], ['Ionic', 2.32, 2.38], ['Polar', 2.88, 1.26], ['covalent', 2.88, 1.05], ['Covalent', 3.08, .32]
  ];
  labels.forEach(([text, x, y]) => base.append(svgEl('text', { x: xToSvg(x), y: yToSvg(y), 'text-anchor': 'middle', 'font-size': 25, fill: '#151515' }, text)));
  [0, .5, 1, 1.5, 2, 2.5, 3].forEach((value) => {
    base.append(svgEl('line', { x1: PLOT.left - 8, y1: yToSvg(value), x2: PLOT.left, y2: yToSvg(value), stroke: '#222' }));
    base.append(svgEl('text', { x: PLOT.left - 26, y: yToSvg(value) + 7, 'text-anchor': 'end', 'font-size': 20, 'font-weight': value % 1 === 0 ? 'bold' : 'normal' }, value === 0 ? '0' : value.toFixed(1)));
  });
  [0.79, 1, 1.5, 2, 2.5, 3, 3.5, 4].forEach((value) => {
    base.append(svgEl('line', { x1: xToSvg(value), y1: PLOT.top + PLOT.height, x2: xToSvg(value), y2: PLOT.top + PLOT.height + 8, stroke: '#222' }));
    base.append(svgEl('text', { x: xToSvg(value), y: PLOT.top + PLOT.height + 45, 'text-anchor': 'middle', 'font-size': value === .79 ? 19 : 20, 'font-weight': value === .79 || value === 4 ? 'bold' : 'normal' }, value === .79 ? '0.79' : value.toFixed(1)));
  });
  base.append(svgEl('text', { x: 890, y: 725, 'text-anchor': 'end', 'font-size': 24, 'font-weight': 'bold' }, 'Average electronegativity'));
  base.append(svgEl('text', { x: 640, y: 767, 'font-size': 25, 'font-style': 'italic' }, 'χavg = (χₐ + χᵦ) / 2'));
  base.append(svgEl('text', { x: 786, y: 26, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 'bold' }, '%'));
  base.append(svgEl('text', { x: 786, y: 56, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 'bold' }, 'covalent'));
  base.append(svgEl('text', { x: 870, y: 26, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 'bold', fill: '#666' }, '%'));
  base.append(svgEl('text', { x: 870, y: 56, 'text-anchor': 'middle', 'font-size': 20, fill: '#666' }, 'ionic'));
  [[3.1,'8','92'],[2.3,'25','75'],[1.6,'50','50'],[1,'75','25'],[0,'100','0']].forEach(([y, c, i]) => {
    base.append(svgEl('text', { x: 786, y: yToSvg(y) + 7, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 'bold' }, c));
    base.append(svgEl('text', { x: 870, y: yToSvg(y) + 7, 'text-anchor': 'middle', 'font-size': 20, fill: '#666' }, i));
  });
}
function renderPoints() {
  pointLayer.replaceChildren();
  points.forEach((point, index) => {
    const isLatest = index === points.length - 1;
    const opacity = isLatest ? 1 : .48;
    const highPoint = point.delta > 2.1;
    const labelOnLeft = highPoint || bondingRegion(point.avg, point.delta) === 'polar covalent';
    const labelY = highPoint ? yToSvg(point.delta) + 24 : yToSvg(point.delta) - 9;
    const labelX = labelOnLeft ? xToSvg(point.avg) - 10 : xToSvg(point.avg) + 9;
    pointLayer.append(svgEl('circle', { cx: xToSvg(point.avg), cy: yToSvg(point.delta), r: isLatest ? 7 : 5.5, fill: '#b30000', stroke: '#fff', 'stroke-width': 2, opacity }));
    pointLayer.append(svgEl('text', { x: labelX, y: labelY, 'text-anchor': labelOnLeft ? 'end' : 'start', fill: '#8a0000', 'font-size': 15, 'font-weight': 'bold', opacity }, point.label));
  });
}
function renderResults(a, b, avg, delta, region) {
  const range = characterRange(delta);
  results.innerHTML = `<p>${a} electronegativity: ${fmtEN(EN[a])}</p><p>${b} electronegativity: ${fmtEN(EN[b])}</p><p>Electronegativity difference: ${fmt(delta)}</p><p>Average electronegativity: ${fmt(avg)}</p><p class="result-heading">Predominantly ${region}</p><p>Covalent character: ${range.covalent}</p><p>Ionic character: ${range.ionic}</p>`;
}
function plot() {
  const a = normalizeSymbol(inputA.value), b = normalizeSymbol(inputB.value);
  message.textContent = '';
  if (!a || !b || !PERIODS.flat().includes(a) || !PERIODS.flat().includes(b)) {
    message.textContent = 'Please enter a valid element symbol (e.g. Na, Cl, Fe).';
    return;
  }
  inputA.value = a; inputB.value = b;
  if (EN[a] === undefined || EN[b] === undefined) {
    message.textContent = 'No electronegativity value available in the reference table.';
    return;
  }
  const delta = Math.abs(EN[a] - EN[b]), avg = (EN[a] + EN[b]) / 2, region = bondingRegion(avg, delta);
  const [first, second] = [a, b].sort();
  const key = `${first}-${second}`;
  if (!points.some((item) => item.key === key)) points.push({ key, label: `${a}–${b}`, avg, delta });
  renderPoints();
  renderResults(a, b, avg, delta, region);
}
function buildPeriodicTable() {
  const table = document.querySelector('#periodic-table');
  PERIODS.flat().forEach((symbol) => {
    const cell = document.createElement('div');
    cell.className = symbol ? 'element' : 'empty';
    if (symbol) cell.innerHTML = `<span class="element-symbol">${symbol}</span><span class="element-value">${EN[symbol] === undefined ? '—' : fmtEN(EN[symbol])}</span>`;
    table.append(cell);
  });
}
document.querySelector('#plot-button').addEventListener('click', plot);
document.querySelector('#clear-button').addEventListener('click', () => { points.length = 0; renderPoints(); });
[inputA, inputB].forEach((input) => input.addEventListener('keydown', (event) => { if (event.key === 'Enter') plot(); }));
drawTriangle(); buildPeriodicTable();
