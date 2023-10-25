# MAD - Líneas de Investigación

Este es un mapa construido a partir de las líneas de investigación declarada por los profesores del programa de Magíster en Arquitectura y Diseño PUCV.

### Datos
Los datos están estructurados en una [planilla compartida](https://docs.google.com/spreadsheets/d/1Vbua3waIfGyszVnu3vr6qv2KvwVqK1zIHnZIrIEaFzQ/edit?usp=sharing) que se publica en formato [CSV](https://docs.google.com/spreadsheets/d/e/2PACX-1vRcrfsdeArUHSpYd5J7Pby6nn2bZgwGTy8KBl5NPdTCNsvkBTXdI54amrC39Q3PQd0AAO6KY-lhcplr/pub?gid=1147217014&single=true&output=csv) y es consumida por la visualización. La estructura de los datos se ordena de la siguiente manera:

| **Línea** | **EAD** | **Relación 1** | **Relación 2** | **Relación 3** | **...** | **Relación 10** |
|-------------|---------|----------------|----------------|----------------|---------|-----------------|
| Tipografía  | sí      | Observación    | Dibujo         | Presentación   |         |                 |

1. La primera columna (Línea) nombra una línea de investigación y define un nodo del grafo
2. La segunta columna (EAD) define si esa línea es específica a un área de investigación, es tranversal o central al programa. Los valores permitidos son: _específica_, _transversal_, _central_
3. Desde la tercera columna (Relación N) se nombran las líneas relacionadas o dependientes. El conteo de relaciones (veces que una línea es referida) determinará el tamaño del nodo.

**&rarr; [ver mapa](http://hspencer.github.io/mad-map)**