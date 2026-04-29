// data-loader.js — Carga datos desde Google Sheets vía gviz y los transforma
// al mismo formato que mad-map-data.json, para que graph.js sea agnóstico
// del origen.
//
// gviz endpoint:
//   https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&sheet={TAB_NAME}
//
// El Sheet debe estar compartido como "Cualquier persona con el enlace puede ver".

const SHEET_TABS = [
  '01_Lineas',
  '02_Sublineas',
  '03_Areas',
  '04_Modos',
  '05_Salidas',
  '06_Laboratorios',
  '07_Investigadores',
  '08_Temas',
  '09_Sublinea_Tema',
  '10_Lab_Linea',
  '11_Lab_Salida',
  '12_Investigador_Lab',
  '13_Investigador_Modo',
  '14_Linea_Modo',
  '17_Sello',
  '18_Proximidad_Tematica',
];

function gvizUrl(sheetId, tabName) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
}

// ===========================================================================
// CSV parsing
// ===========================================================================

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(text) {
  const rows = text.split(/\r?\n/).map(parseCSVLine);
  while (rows.length && rows[rows.length - 1].every(c => c === '')) rows.pop();
  return rows;
}

// Detecta la fila de encabezados: la primera donde todas las columnas tienen valor
function detectHeaderRow(rows, maxScan = 8) {
  for (let r = 0; r < Math.min(maxScan, rows.length); r++) {
    const row = rows[r];
    if (row.length > 1 && row.every(c => c && c.length > 0)) return r;
  }
  return 0;
}

// Algunas pestañas devuelven el título de la hoja CONCATENADO con el primer
// nombre de columna en una sola celda (cuando el .xlsx subido tenía merged
// cells en filas de título y gviz las colapsó). Ej:
//   "18 · Proximidad temática ... PROXIMIDAD_PARES del script para que persistan. sublinea_a_id"
// Si detectamos eso, extraemos el último token alfanumérico/_ como header real.
function cleanHeader(cell) {
  if (!cell) return cell;
  if (cell.length <= 50) return cell;
  const tokens = cell.trim().split(/\s+/);
  const last = tokens[tokens.length - 1];
  if (/^[\wáéíóúñÁÉÍÓÚÑ_]+$/.test(last)) return last;
  return cell;
}

function tableFromCSV(text) {
  const rows = parseCSV(text);
  if (rows.length === 0) return [];
  const headerIdx = detectHeaderRow(rows);
  const headers = rows[headerIdx].map(cleanHeader);
  const out = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.every(c => !c)) continue;
    const obj = {};
    headers.forEach((h, i) => { if (h) obj[h] = row[i] ?? ''; });
    out.push(obj);
  }
  return out;
}

// ===========================================================================
// Fetch en paralelo de todas las pestañas
// ===========================================================================

async function fetchTab(sheetId, tabName) {
  const res = await fetch(gvizUrl(sheetId, tabName));
  if (!res.ok) throw new Error(`gviz fetch ${tabName}: HTTP ${res.status}`);
  const text = await res.text();
  return tableFromCSV(text);
}

async function loadAllTabs(sheetId) {
  const entries = await Promise.all(
    SHEET_TABS.map(async tab => [tab, await fetchTab(sheetId, tab)])
  );
  return Object.fromEntries(entries);
}

// ===========================================================================
// Conversión de tabs CSV a estructura de datos del frontend
// ===========================================================================

function buildDataFromTabs(tabs) {
  const lineas = (tabs['01_Lineas'] || []).map(r => ({
    id: r.id, nombre: r.nombre,
    descripcion: r['descripción'] || r.descripcion,
    estado: r.estado || '',
  })).filter(l => l.id);

  const sublineas = (tabs['02_Sublineas'] || []).map(r => ({
    id: r.id, nombre: r.nombre,
    linea: r.linea_id, area: r.area_id,
    notas: r.notas || '',
  })).filter(s => s.id);

  const areas = (tabs['03_Areas'] || []).map(r => ({
    id: r['código'] || r.codigo,
    nombre: r.nombre,
    descripcion: r['descripción'] || r.descripcion,
  })).filter(a => a.id);

  const modos = (tabs['04_Modos'] || []).map(r => ({
    id: r.id, nombre: r.nombre,
    descripcion: r['descripción'] || r.descripcion,
  })).filter(m => m.id);

  const salidas = (tabs['05_Salidas'] || []).map(r => ({
    id: r.id, nombre: r.nombre,
    descripcion: r['descripción'] || r.descripcion,
  })).filter(s => s.id);

  const laboratorios = (tabs['06_Laboratorios'] || []).map(r => ({
    id: r.id, nombre: r.nombre,
    descripcion: r['descripción'] || r.descripcion,
  })).filter(l => l.id);

  const investigadores = (tabs['07_Investigadores'] || []).map(r => ({
    id: r.id, nombre: r.nombre,
    area_principal: r['área_principal'] || r.area_principal,
    perfil_url: r.perfil_casiopea || r.perfil_url || '',
  })).filter(i => i.id);

  const temas = (tabs['08_Temas'] || []).map(r => ({
    id: r.id,
    investigador: r.investigador_id,
    texto: r.tema,
  })).filter(t => t.id);

  const sublinea_tema = (tabs['09_Sublinea_Tema'] || [])
    .filter(r => r.sublinea_id && r.tema_id);
  const lab_linea = (tabs['10_Lab_Linea'] || [])
    .filter(r => r.lab_id && r.linea_id);
  const lab_salida = (tabs['11_Lab_Salida'] || [])
    .filter(r => r.lab_id && r.salida_id);
  const inv_lab = (tabs['12_Investigador_Lab'] || [])
    .filter(r => r.investigador_id && r.lab_id);
  const inv_modo = (tabs['13_Investigador_Modo'] || [])
    .filter(r => r.investigador_id && r.modo_id);
  const linea_modo = (tabs['14_Linea_Modo'] || [])
    .filter(r => r.linea_id && r.modo_id);

  const proximidad = (tabs['18_Proximidad_Tematica'] || [])
    .filter(p => p.estado !== 'DESCARTADO' && p.sublinea_a_id && p.sublinea_b_id)
    .map(p => ({
      sublinea_a_id: p.sublinea_a_id,
      sublinea_b_id: p.sublinea_b_id,
      sublinea_a_nombre: p.sublinea_a_nombre,
      sublinea_b_nombre: p.sublinea_b_nombre,
      afinidad: parseFloat(p.afinidad) || 0,
      razonamiento: p.razonamiento,
      estado: p.estado,
    }));

  // Sello: variante elegida (foco contiene "ELEGIDO")
  const sello = (() => {
    const rows = tabs['17_Sello'] || [];
    for (const r of rows) {
      const foco = r.Foco || r.foco || '';
      if (typeof foco === 'string' && foco.includes('ELEGIDO')) {
        return {
          foco: foco.replace(' (ELEGIDO)', ''),
          texto: r.Texto || r.texto || '',
        };
      }
    }
    return { foco: '', texto: '' };
  })();

  const edges = computeEdges({
    lineas, sublineas, investigadores, temas,
    sublinea_tema, lab_linea, linea_modo, proximidad,
  });

  return {
    version: 'sheets-live',
    sello,
    lineas, sublineas, areas, modos, salidas, laboratorios,
    investigadores, temas,
    relations: {
      sublinea_tema, lab_linea, lab_salida,
      inv_lab, inv_modo, linea_modo, proximidad,
    },
    edges,
  };
}

// ===========================================================================
// Cómputo de aristas (a..g del spec)
// ===========================================================================

function computeEdges({ lineas, sublineas, investigadores, temas,
                       sublinea_tema, lab_linea, linea_modo, proximidad }) {
  const edges = {
    jerarquica: [],
    coautoria: [],
    coinvestigacion: [],
    sosten_lab: [],
    afinidad_lab: [],
    coincidencia_modo: [],
    proximidad_semantica: [],
  };

  // (a) Jerárquica: Sublínea → Línea-madre
  for (const s of sublineas) {
    if (s.linea) edges.jerarquica.push({ source: s.id, target: s.linea });
  }

  // (b) Coautoría: Investigador → Sublínea vía Tema
  const temaToInv = {};
  for (const t of temas) temaToInv[t.id] = t.investigador;
  const invToSublines = {};
  for (const st of sublinea_tema) {
    const invId = temaToInv[st.tema_id];
    if (!invId) continue;
    if (!invToSublines[invId]) invToSublines[invId] = new Set();
    invToSublines[invId].add(st.sublinea_id);
  }
  for (const [invId, subSet] of Object.entries(invToSublines)) {
    for (const subId of subSet) {
      edges.coautoria.push({ source: invId, target: subId });
    }
  }

  // (c) Coinvestigación: pares Sublínea↔Sublínea con Investigador compartido
  const subToInvs = {};
  for (const [invId, subSet] of Object.entries(invToSublines)) {
    for (const subId of subSet) {
      if (!subToInvs[subId]) subToInvs[subId] = new Set();
      subToInvs[subId].add(invId);
    }
  }
  const subIds = Object.keys(subToInvs).sort();
  for (let i = 0; i < subIds.length; i++) {
    for (let j = i + 1; j < subIds.length; j++) {
      const a = subIds[i], b = subIds[j];
      const shared = [...subToInvs[a]].filter(x => subToInvs[b].has(x));
      if (shared.length > 0) {
        edges.coinvestigacion.push({ source: a, target: b, weight: shared.length });
      }
    }
  }

  // (d) Sostén Lab: Laboratorio → Línea
  for (const ll of lab_linea) {
    edges.sosten_lab.push({ source: ll.lab_id, target: ll.linea_id });
  }

  // (e) Afinidad por Lab: Sublíneas cuyas Líneas-madre comparten Lab
  const lineaToLabs = {};
  for (const ll of lab_linea) {
    if (!lineaToLabs[ll.linea_id]) lineaToLabs[ll.linea_id] = new Set();
    lineaToLabs[ll.linea_id].add(ll.lab_id);
  }
  const subToLabs = {};
  for (const s of sublineas) {
    if (s.linea && lineaToLabs[s.linea]) subToLabs[s.id] = lineaToLabs[s.linea];
  }
  const subIdsWithLab = Object.keys(subToLabs).sort();
  for (let i = 0; i < subIdsWithLab.length; i++) {
    for (let j = i + 1; j < subIdsWithLab.length; j++) {
      const a = subIdsWithLab[i], b = subIdsWithLab[j];
      if ([...subToLabs[a]].some(x => subToLabs[b].has(x))) {
        edges.afinidad_lab.push({ source: a, target: b });
      }
    }
  }

  // (f) Coincidencia Modo: Sublíneas cuyas Líneas-madre comparten Modo predominante
  const lineaToModos = {};
  for (const lm of linea_modo) {
    if ((lm.nivel || '').toLowerCase() === 'predominante') {
      if (!lineaToModos[lm.linea_id]) lineaToModos[lm.linea_id] = new Set();
      lineaToModos[lm.linea_id].add(lm.modo_id);
    }
  }
  const subToModos = {};
  for (const s of sublineas) {
    if (s.linea && lineaToModos[s.linea]) subToModos[s.id] = lineaToModos[s.linea];
  }
  const subIdsWithModo = Object.keys(subToModos).sort();
  for (let i = 0; i < subIdsWithModo.length; i++) {
    for (let j = i + 1; j < subIdsWithModo.length; j++) {
      const a = subIdsWithModo[i], b = subIdsWithModo[j];
      if ([...subToModos[a]].some(x => subToModos[b].has(x))) {
        edges.coincidencia_modo.push({ source: a, target: b });
      }
    }
  }

  // (g) Proximidad semántica declarada
  for (const p of proximidad) {
    edges.proximidad_semantica.push({
      source: p.sublinea_a_id,
      target: p.sublinea_b_id,
      weight: p.afinidad,
    });
  }

  return edges;
}

// ===========================================================================
// API pública
// ===========================================================================

window.MadMapDataLoader = {
  loadFromSheets: async function (sheetId) {
    const tabs = await loadAllTabs(sheetId);
    return buildDataFromTabs(tabs);
  },
};
