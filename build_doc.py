#!/usr/bin/env python3
"""Genera lineas-investigacion.md desde mad-map-data.json.

Mantiene el documento en sincronía con la data. Correr después de build_data.py.
"""

import json
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).parent
JSON_PATH = ROOT / "mad-map-data.json"
OUT = ROOT / "lineas-investigacion.md"

CONDICIONES = {
    "LIN-01": "*de quién habita*",
    "LIN-02": "*de dónde se habita*",
    "LIN-03": "*desde dónde se piensa*",
    "LIN-04": "*con qué se hace y cómo se transmite*",
}

PREGUNTAS = {
    "LIN-01": "cómo el diseño puede sostener la vida independiente y la participación de personas con condiciones diversas",
    "LIN-02": "cómo el territorio se construye, se sostiene y se piensa políticamente",
    "LIN-03": "qué tradición y qué pensamiento sostienen la disciplina, y cómo se actualizan",
    "LIN-04": "cómo la disciplina se hace, se enseña y se reproduce en sus medios",
}


def main():
    data = json.loads(JSON_PATH.read_text())

    lineas = data["lineas"]
    sublineas = data["sublineas"]
    investigadores = data["investigadores"]

    # Construir mapa investigador → sublíneas via coautoría
    inv_to_subs = defaultdict(set)
    sub_to_invs = defaultdict(set)
    for e in data["edges"]["coautoria"]:
        inv_to_subs[e["source"]].add(e["target"])
        sub_to_invs[e["target"]].add(e["source"])

    inv_by_id = {i["id"]: i for i in investigadores}
    sub_by_id = {s["id"]: s for s in sublineas}

    # Salida
    out = []
    out.append("# Líneas de investigación\n")
    out.append("**Doctorado en Arquitectura y Diseño · e[ad] PUCV**\n")
    out.append("> El doctorado forma investigadores para quienes la obra es origen y prueba de la tesis. La pregunta que esa obra está llamada a argumentar: **cómo reinventar el habitar humano**. Cada línea troncal del programa responde a una de las condiciones que esa pregunta convoca.\n")

    # Tabla resumen
    out.append("| Id | Nombre | Condición que aborda | Sublíneas | Profesores |")
    out.append("|---|---|---|---|---|")
    for l in lineas:
        subs_de_linea = [s for s in sublineas if s["linea"] == l["id"]]
        invs_de_linea = set()
        for s in subs_de_linea:
            invs_de_linea |= sub_to_invs[s["id"]]
        out.append(f"| {l['id']} | {l['nombre']} | {CONDICIONES.get(l['id'], '')} | {len(subs_de_linea)} | {len(invs_de_linea)} |")
    out.append("\n---\n")

    # Detalle por línea
    for l in lineas:
        subs_de_linea = [s for s in sublineas if s["linea"] == l["id"]]
        out.append(f"## {l['id']} — {l['nombre']}\n")
        out.append(f"**Condición del habitar que aborda:** {CONDICIONES.get(l['id'], '').replace('*', '').strip()}.\n")
        out.append(f"{l['descripcion']} **Pregunta nuclear:** {PREGUNTAS.get(l['id'], '')}.\n")

        # Sublíneas
        out.append(f"### Sublíneas ({len(subs_de_linea)})\n")
        out.append("| Id | Sublínea |")
        out.append("|---|---|")
        for s in sorted(subs_de_linea, key=lambda x: x["id"]):
            out.append(f"| {s['id']} | {s['nombre']} |")
        out.append("")

        # Profesores que la sostienen
        invs_de_linea = defaultdict(set)
        for s in subs_de_linea:
            for inv_id in sub_to_invs[s["id"]]:
                invs_de_linea[inv_id].add(s["id"])

        if invs_de_linea:
            out.append("### Profesores que la sostienen\n")
            out.append("| Profesor | Sublíneas que cultiva en esta línea |")
            out.append("|---|---|")
            sorted_invs = sorted(
                invs_de_linea.items(),
                key=lambda kv: (-len(kv[1]), inv_by_id[kv[0]]["nombre"]),
            )
            for inv_id, sub_ids in sorted_invs:
                inv = inv_by_id[inv_id]
                subs_list = ", ".join(sorted(sub_ids))
                out.append(f"| **{inv['nombre']}** | {subs_list} |")
            out.append("")

        out.append("---\n")

    # Notas finales
    out.append("## Cobertura del mapeo\n")
    mapped_temas = {st["tema_id"] for st in data["relations"]["sublinea_tema"]}
    total_temas = len(data["temas"])
    unmapped_temas = [t for t in data["temas"] if t["id"] not in mapped_temas]
    out.append(f"- **Temas declarados mapeados a sublíneas**: {total_temas - len(unmapped_temas)} de {total_temas} ({100 * (1 - len(unmapped_temas)/total_temas):.0f}%).")

    sub_ids_with_inv = set(sub_to_invs.keys())
    orphan_subs = [s for s in sublineas if s["id"] not in sub_ids_with_inv]
    out.append(f"- **Sublíneas con al menos un profesor**: {len(sublineas) - len(orphan_subs)} de {len(sublineas)}.")

    inv_ids_with_sub = set(inv_to_subs.keys())
    orphan_invs = [i for i in investigadores if i["id"] not in inv_ids_with_sub]
    out.append(f"- **Investigadores con al menos una sublínea**: {len(investigadores) - len(orphan_invs)} de {len(investigadores)}.")

    if unmapped_temas:
        out.append("\n### Temas declarados sin sublínea de acogida\n")
        for t in unmapped_temas:
            inv = inv_by_id[t["investigador"]]
            out.append(f"- *{inv['nombre']}* — {t['texto']}")

    if orphan_subs:
        out.append("\n### Sublíneas sin profesor mapeado\n")
        for s in orphan_subs:
            out.append(f"- {s['id']}: {s['nombre']} — pendiente de respaldo")

    out.append("\n## Procedencia\n")
    out.append("Documento generado automáticamente desde `mad-map-data.json` por `build_doc.py`. Las relaciones investigador↔sublínea provienen de la hoja `09_Sublinea_Tema` (vía temas declarados). Los nombres y descripciones de las líneas vienen de `01_Lineas`. Para regenerar tras editar la planilla, correr `python3 build_doc.py`.\n")

    OUT.write_text("\n".join(out))
    print(f"OK: {OUT}")
    print(f"  Líneas: {len(lineas)}")
    print(f"  Sublíneas: {len(sublineas)}")
    print(f"  Investigadores con mapeo: {len(investigadores) - len(orphan_invs)}")
    print(f"  Cobertura temas: {total_temas - len(unmapped_temas)}/{total_temas}")


if __name__ == "__main__":
    main()
