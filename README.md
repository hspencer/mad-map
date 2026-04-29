# Investigación e[ad]

Mapa dinámico del cuerpo investigativo del **Doctorado en Arquitectura y Diseño** de la e[ad] PUCV. Las cuatro líneas troncales del programa, sus sublíneas y los profesores que las cultivan, en una visualización interactiva que se alimenta directamente de una planilla colaborativa.

> *La obra como argumento.* El doctorado forma investigadores para quienes la obra es origen y prueba de la tesis. La pregunta que esa obra está llamada a argumentar: **cómo reinventar el habitar humano**.

| | |
|---|---|
| **Visualización** | [[hspencer.github.io/mad-map](https://eadpucv.github.io/investigacion-ead/) |
| **Documento institucional** | [lineas-investigacion.md](./lineas-investigacion.md) |
| **Planilla colaborativa** | [Google Sheet](https://docs.google.com/spreadsheets/d/1Vbua3waIfGyszVnu3vr6qv2KvwVqK1zIHnZIrIEaFzQ/edit) |

## Cómo funciona

Los datos —líneas, sublíneas, investigadores, temas, áreas, modos, salidas, laboratorios y sus relaciones m:n— viven en una planilla compartida de Google Sheets. La visualización los carga **en vivo** mediante la API `gviz`. No hay paso intermedio de regeneración: la planilla es la fuente de verdad y cualquier edición se refleja en la visualización con sólo refrescar el navegador.

```
Google Sheet  ──gviz──►  data-loader.js  ──►  graph.js  ──►  superficies HTML
   (editable)                (parser CSV +              (D3 force-directed)
                              cómputo de aristas)
```

Para actualizar la visualización:

1. Editar cualquier pestaña en el [Google Sheet](https://docs.google.com/spreadsheets/d/1Vbua3waIfGyszVnu3vr6qv2KvwVqK1zIHnZIrIEaFzQ/edit).
2. Refrescar la página de la visualización (la caché de `gviz` puede demorar hasta unos minutos).

## Las tres superficies

Las tres páginas comparten el mismo motor (`graph.js`) pero exponen controles, aristas y nodos distintos según su audiencia:

- [**Cartografía**](https://hspencer.github.io/mad-map/cartografia.html) · *postulantes* — las 4 líneas y sus sublíneas como territorio temático, sin perfiles individuales.
- [**Narrativa**](https://hspencer.github.io/mad-map/narrativa.html) · *evaluadores · CNA* — activa la capa de profesores y dos vistas predefinidas: *cobertura por línea* y *perfiles por área*.
- [**Exploración**](https://hspencer.github.io/mad-map/exploracion.html) · *equipo del doctorado* — todos los controles: los siete tipos de aristas como toggles, filtros completos por línea/área/modo/salida/laboratorio/investigador, y búsqueda.

Cada superficie tiene una columna lateral de controles y una zona principal con el grafo. Click en cualquier nodo abre el panel de detalle al lado derecho. Hover muestra tooltip con el nombre. Drag reposiciona temporalmente; soltarlo deja que las fuerzas reacomoden.

## Documento institucional

[`lineas-investigacion.md`](./lineas-investigacion.md) describe formalmente cada línea: alcance temático, pregunta nuclear, cuerpo académico que la sostiene y argumentación de su consolidación y sostenibilidad. Pensado para audiencia institucional (CNA, comité doctoral, autoridades).

Para regenerarlo después de una edición significativa de la planilla:

```bash
python3 build_data.py     # snapshot Google Sheet → JSON local
python3 build_doc.py      # JSON → lineas-investigacion.md
```

(Sólo es necesario regenerar cuando cambia el cuerpo académico, las sublíneas o las descripciones de las líneas; no para cada edición menor del Sheet.)

## Especificación

La especificación formal del comportamiento del sistema (entidades, superficies, reglas, invariantes) está en [`mad-map.allium`](./mad-map.allium), en formato Allium v3.

## Versiones

| Branch | Modelo de datos | Estado |
|---|---|---|
| `main` | Google Sheets en vivo (`gviz`) | **Activa** |
| `v2` | Pipeline Python local con snapshot `.xlsx` | Snapshot del mapa pre-Sheets |
| `v1` | Mapa MAD legacy (Magíster) | Versión histórica con CSV publicado |

Cualquiera puede consultarse con `git checkout v1` o `git checkout v2`.

## Estructura del proyecto

```
.
├── index.html                  ← portada con sello + 3 tarjetas
├── cartografia.html            ← superficie pública (postulantes)
├── narrativa.html              ← superficie evaluadores · CNA
├── exploracion.html            ← superficie equipo del doctorado
├── graph.js                    ← motor de visualización (D3 force-directed)
├── data-loader.js              ← carga desde Google Sheets vía gviz
├── style.css                   ← estilos compartidos
├── d3.v7.min.js                ← biblioteca D3
├── lineas-investigacion.md     ← documento institucional formal
├── mad-map.allium              ← spec de comportamiento (Allium v3)
├── mad-map-data.json           ← snapshot local (fallback offline)
├── mad-map-data-v2.xlsx        ← snapshot local en formato xlsx
├── build_data.py               ← (opcional) regenera JSON local desde xlsx
├── build_doc.py                ← (opcional) regenera doc institucional
├── build_xlsx.py               ← (opcional) inicializa estructura del .xlsx
└── legacy.html                 ← visualización anterior del Magíster
```

## Modo offline

Si la red falla o el Sheet no es accesible, la visualización cae automáticamente al snapshot local `mad-map-data.json`. Para refrescar el snapshot:

```bash
python3 build_data.py
```

Para correr el sitio localmente:

```bash
python3 -m http.server 8765
# abrir http://localhost:8765/
```
