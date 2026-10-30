# Reglas de desarrollo y reutilización de componentes

- Cada elemento de la interfaz —botones, imágenes, textos, títulos, subtítulos y cualquier otro tipo de elemento visual o funcional— debe implementarse como un componente independiente, único y reutilizable cuando corresponda.

- Cada página debe reutilizar los componentes existentes. Si necesita un componente que aún no existe, debe crearse de forma reutilizable para que pueda utilizarse en otras páginas o secciones.

- Para cualquier animación, transición, transformación o efecto visual, se debe priorizar CSS nativo (por ejemplo, `transition`, `animation`, `transform` y `@keyframes`) antes que JavaScript o librerías externas. Solo utilizar JavaScript o una librería de animación cuando CSS no permita implementar adecuadamente el comportamiento requerido. Respetar la preferencia de movimiento reducido mediante `prefers-reduced-motion`.
