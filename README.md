# Investigación e[ad]

Mapa dinámico del cuerpo investigativo del **Doctorado en Arquitectura y Diseño** de la e[ad] PUCV. Visualiza las cuatro líneas troncales del programa, sus sublíneas, y los profesores investigadores que las cultivan, con tres superficies pensadas para audiencias distintas.

> **Sello formativo del programa**
>
> *La obra como argumento.* El doctorado forma investigadores para quienes la obra es origen y prueba de la tesis. Esa obra, sea edificada, fabricada, escrita o dibujada, vale como argumento por sí misma. La pregunta que esa obra está llamada a argumentar: cómo reinventar el habitar humano.

## Cómo correr el mapa

Por restricciones de CORS, las páginas necesitan servirse desde un servidor HTTP local (no abrir como `file://`).

```bash
cd /ruta/al/proyecto
python3 -m http.server 8765
# abrir http://localhost:8765/
```

La portada (`index.html`) muestra el sello formativo y enlaces a las tres superficies.

---

## Las tres superficies

Las tres consumen el mismo dataset (`mad-map-data.json`) y comparten el motor de visualización (`graph.js`), pero exponen controles, aristas y nodos distintos según su audiencia.

### 1. Cartografía (`cartografia.html`) — audiencia: postulantes

Un mapa abierto de **lo que se investiga** en el programa. Sin perfiles individuales: el postulante ve el cuerpo de líneas y sublíneas como territorio temático, no como roster de profesores.

**Qué se ve:**
- **Nodos**: las 4 líneas troncales (rojo, mayor tamaño) y las ~30 sublíneas (gris).
- **Aristas**:
  - *Pertenencia a línea* — cada sublínea conectada a su línea madre (gris sólido).
  - *Proximidad temática* — pares de sublíneas declarados como afines en la curaduría del programa (rojo translúcido).
- **Envolventes** — regiones traslúcidas que rodean los nodos por su categoría:
  - *Áreas del programa* (ECH, EAA, FCT) — encendida por defecto.
  - *Modos de investigar* y *Salidas* — disponibles como capas adicionales.

**Cómo se interactúa:**
- **Hover sobre nodo** — tooltip con el nombre.
- **Click sobre nodo** — abre un panel lateral con la descripción, la línea madre y la lista de sublíneas/temas asociados.
- **Click fuera de cualquier nodo** — cierra el panel.
- **Drag de nodo** — arrastrar reposiciona; soltar reanima las fuerzas físicas.
- **Scroll en el lienzo** — zoom (rueda del mouse o pinch en trackpad).
- **Drag en lienzo vacío** — pan.
- **Buscar** — el campo de la barra superior resalta nodos cuyo nombre o descripción contienen el texto, atenuando los demás.
- **Toggles de envolvente / arista** — encender o apagar capas en la columna izquierda.

**Lo que NO está disponible aquí:**
- No hay capa de perfiles (decisión de prudencia frente al público).
- No hay filtros, sliders ni selectores avanzados.
- No hay persistencia de estado en URL (cada visita parte de los defaults).

### 2. Narrativa (`narrativa.html`) — audiencia: evaluadores · CNA

Vista curada que articula la **coherencia institucional**: cómo se distribuyen las líneas, qué laboratorios las sostienen, qué profesores las cultivan. Pensada para una lectura corta orientada a justificar el programa.

**Qué se ve además de cartografía:**
- **Capa de perfiles** activable: 22 nodos investigadores (cuadrados grises) que se conectan a las sublíneas que cultivan.
- **Aristas adicionales**:
  - *Coautoría* — perfil → sublínea (vía temas declarados). Se enciende automáticamente al activar perfiles.
  - *Coinvestigación* — pares de sublíneas que comparten profesores.
  - *Sostén por laboratorio* — laboratorios → líneas que sostienen.
- **Filtros multi-selección** — Línea, Área, Modo. Al seleccionar uno o varios valores, los nodos que no pertenecen quedan ocultos.
- **Vistas predefinidas** — botones que aplican configuraciones curadas:
  - *Cobertura por línea* — aristas jerárquicas, áreas como envolvente, sin perfiles. Foco: las 4 líneas troncales y sus sublíneas como anclas.
  - *Perfiles por área* — perfiles encendidos, áreas como envolvente, coautoría visible. Foco: el cuerpo académico distribuido.

**Interacción adicional:**
- **Click sobre perfil** — panel con el área principal, las sublíneas que cultiva y enlace al perfil Casiopea.
- **Limpiar todo** — botón al pie de la barra lateral para resetear filtros y búsqueda.

**Lo que NO está disponible aquí:**
- No hay selector de algoritmo de proyección.
- No hay sliders ni controles avanzados.
- No hay persistencia en URL (la vista parte limpia, los presets son la única forma de "guardar" una configuración).

### 3. Exploración (`exploracion.html`) — audiencia: equipo del doctorado

Herramienta interna con **todos los controles** para descubrir relaciones latentes, huecos del programa y armar argumentos a partir del dato.

**Qué se ve además de narrativa:**
- **Las 7 aristas del modelo** disponibles como toggles independientes:
  - *(a) Jerárquica* — Sublínea → Línea.
  - *(b) Coautoría* — Investigador → Sublínea (vía Tema).
  - *(c) Coinvestigación* — Sublínea ↔ Sublínea (perfiles compartidos).
  - *(d) Sostén por laboratorio* — Laboratorio → Línea.
  - *(e) Afinidad por laboratorio* — Sublíneas cuyas líneas-madre comparten Lab.
  - *(f) Coincidencia de modo* — Sublíneas cuyas líneas-madre comparten modo predominante.
  - *(g) Proximidad semántica* — pares declarados a mano en la pestaña 18 del .xlsx.
- **Filtros completos** — además de Línea/Área/Modo: Salida, Laboratorio, Investigador.
- **Selector de algoritmo de proyección** — UMAP / PCA / t-SNE (placeholder hoy; activo cuando llegue Modelo IV en iteración 1b. Por ahora todas las superficies usan force-directed).

**Interacción adicional:**
- Cada arista de tipo (a)…(g) tiene su propio toggle. Encender muchas a la vez satura el grafo: úsese con criterio.
- Filtros se acumulan: seleccionar varios valores en un mismo facet hace OR; entre facets distintos hace AND.

**Lo que faltará en iteraciones futuras:**
- 3D toggle (placeholder hoy, requiere integración con three.js).
- Persistencia del estado en URL (vista compartible por enlace).
- Vistas guardadas en `localStorage`.
- Exportación SVG/PNG/JSON.

---

## Codificación visual común

| Elemento | Forma | Color |
|---|---|---|
| Línea troncal | Círculo grande | Rojo |
| Sublínea | Círculo mediano | Gris oscuro |
| Investigador | Cuadrado | Gris medio |
| Arista jerárquica | Línea sólida | Gris oscuro |
| Arista coautoría | Línea punteada fina | Gris |
| Arista coinvestigación | Línea sólida fina | Azul |
| Arista sostén lab | Línea segmentada | Verde |
| Arista proximidad semántica | Línea sólida media | Rojo |
| Envolvente Área ECH | Polígono translúcido | Azul |
| Envolvente Área EAA | Polígono translúcido | Verde |
| Envolvente Área FCT | Polígono translúcido | Magenta |

Las envolventes son convex hulls de los nodos visibles que pertenecen a cada categoría. Si una categoría queda sin nodos visibles (filtro activo), su envolvente desaparece.

---

## Pipeline de datos

El sistema tiene dos eslabones:

```
build_xlsx.py  ──►  mad-map-data-v2.xlsx  ──►  build_data.py  ──►  mad-map-data.json  ──►  HTMLs
   (script)         (planilla, 19 hojas)         (script)            (consumido en browser)
```

**Fuente de verdad:** `build_xlsx.py`. Este script contiene como literales Python todas las entidades del programa (líneas, sublíneas, áreas, modos, salidas, laboratorios, investigadores, temas), las relaciones m:n entre ellas, el sello formativo y la matriz de proximidad temática.

### Flujo A — Modificar la estructura del programa (recomendado)

Cuando se agregan/quitan/renombran líneas, sublíneas, profesores, temas, laboratorios, etc.

```bash
# 1. Editar build_xlsx.py (sección que corresponda: LINEAS, SUBLINEAS, INVESTIGADORES, etc.)
$EDITOR build_xlsx.py

# 2. Regenerar la planilla desde el script
python3 build_xlsx.py
#   ↳ produce: mad-map-data-v2.xlsx (sobreescribe)

# 3. Exportar el JSON consumido por las páginas
python3 build_data.py
#   ↳ produce: mad-map-data.json

# 4. Refrescar el navegador (Cmd+Shift+R / Ctrl+Shift+R para vaciar cache)
```

### Flujo B — Afinación manual del .xlsx

Cuando se edita la planilla directamente en Excel/Numbers (por ejemplo, marcar un par de proximidad como `CONFIRMADO`, ajustar una afinidad).

```bash
# 1. Editar mad-map-data-v2.xlsx en Excel/Numbers, guardar y cerrar.

# 2. Regenerar el JSON desde la planilla recién editada.
python3 build_data.py

# 3. Refrescar el navegador.
```

> ⚠️ **No correr `build_xlsx.py` después de ediciones manuales** — sobrescribe el .xlsx y pierde los cambios. Si quieres que esos ajustes sobrevivan a futuras regeneraciones, reflejarlos en las constantes `PROXIMIDAD_PARES` o `SELLO_VARIANTES` (u otras) dentro de `build_xlsx.py`.

### Servidor local mientras se trabaja

El navegador necesita un servidor HTTP para fetch del JSON (no funciona con `file://`). Mantener una pestaña con el server arriba mientras se itera:

```bash
python3 -m http.server 8765
# abrir http://localhost:8765/
```

Tras correr `build_data.py`, basta refrescar la página.

## Especificación

El comportamiento del sistema está formalizado en `mad-map.allium` (formato Allium v3). El spec describe entidades, superficies, reglas de comportamiento e invariantes globales. Las decisiones de diseño quedaron registradas con sus alternativas en `sello.csv` (foco identitario) y en la pestaña `15_Decisiones` del .xlsx.

## Estructura de archivos

```
.
├── index.html              ← portada con sello + 3 tarjetas
├── cartografia.html        ← superficie pública
├── narrativa.html          ← superficie para evaluadores
├── exploracion.html        ← superficie para el equipo del doctorado
├── graph.js                ← motor de visualización (D3 force-directed)
├── style.css               ← estilos compartidos
├── d3.v7.min.js            ← biblioteca D3
├── mad-map-data.json       ← datos consumidos por las páginas (generado)
├── mad-map-data-v2.xlsx    ← fuente de datos (19 pestañas)
├── build_xlsx.py           ← regenera el .xlsx desde scripts
├── build_data.py           ← exporta xlsx → JSON
├── mad-map.allium          ← spec de comportamiento (Allium v3)
├── sello.csv               ← variantes del sello formativo
├── lineas-areas-mad.csv    ← dataset legacy de la versión anterior
└── legacy.html             ← visualización anterior (force-directed sobre el legacy CSV)
```

## Estado actual

Versión MVP funcional con force-directed (Modelo I del spec). Pendiente migración a Modelo IV (posiciones derivadas de embedding semántico) en iteración 1b. Ver `mad-map.allium` para detalle de los pendientes y `15_Decisiones` para preguntas abiertas que afectan el modelo.
