# Parroquia Apóstol Santiago de Munaypata

Microaplicación de **preinscripciones sacramentales** y **centro de control parroquial**, desarrollada con **Astro 7.4.1 + HTML + CSS + JavaScript** y almacenamiento **SQLite local del servidor**.

Pensada para la comunidad de **Munaypata, La Paz, Bolivia**. El diseño se adapta a computadora, tablet y celular; incluye animaciones discretas y una opción de movimiento reducido respetada por el CSS.

> **IMPORTANTE:** Es un proyecto listo para instalar y configurar, **no es un canal oficial de inscripciones** hasta que la parroquia lo valide, configure, publique y active. El logo (emblema SVG) y la combinación verde petróleo/marfil/dorado son **provisionales**: no fue posible obtener y verificar los archivos originales de Facebook. Puedes reemplazarlos en el panel sin editar código.

## 1. Instalación en tu PC (Windows / macOS / Linux)

Necesitas **Bun 1.4.3 o superior**, **Node.js 22.22 o superior** para las herramientas de Astro y conexión a Internet para descargar dependencias. Usa Bun como gestor de paquetes y conserva `bun.lock` para instalaciones reproducibles.

```bash
bun install
```

### Versión de Astro y compatibilidad

Astro está fijado en **7.4.1**, con `@astrojs/node` **11.1.9 o compatible** y `@astrojs/check` **0.9.12 o compatible**. Se conserva SSR en modo standalone y SQLite local. `compressHTML: true` mantiene el tratamiento de espacios anterior a Astro 7, evitando cambios de presentación entre elementos inline.

La migración sigue las guías oficiales de [Astro 6](https://docs.astro.build/en/guides/upgrade-to/v6/), [Astro 7](https://docs.astro.build/en/guides/upgrade-to/v7/) y el [adaptador Node](https://docs.astro.build/en/guides/integrations-guide/node/). El requisito de Node.js **22.22.0+** corresponde a los metadatos de Astro 7.4.1.

### Formato y calidad de código

```bash
bun run format
bun run format:check
bun run lint
bun run lint:fix
bun run check
```

Prettier incluye soporte para Astro y ESLint usa la configuración recomendada de JavaScript y Astro, sin reglas de formato que compitan con Prettier. Se excluyen las dependencias, la salida generada y los datos locales.

Las pruebas se ejecutan con Bun, incluida su compatibilidad con `node:sqlite`. El servidor de producción conserva Node.js como runtime por el adaptador existente `@astrojs/node`.

Copia `.env.example` a `.env` y cambia **obligatoriamente** las variables `ADMIN_PASSWORD` (contraseña única de 12+ caracteres) y `SESSION_SECRET` (secreto aleatorio de 32+ caracteres). No uses literalmente los valores de ejemplo.

```bash
bun run dev
```

Abre **http://localhost:4321**. La primera vez se genera automáticamente `data/parroquia.sqlite`.

Sitio: `http://localhost:4321/`

Panel: `http://localhost:4321/admin/login`

**No hay contraseña predefinida**: se establece en `.env`, para evitar exponer el panel por accidente.

## 2. Preparar el portal para la parroquia

1. Inicia sesión en `/admin/login` con tu contraseña.
2. Ve a **Ajustes del sitio**. Modifica nombre, contacto, textos, logo, imagen de portada y colores.
3. Revisa **Sacramentos**. Confirma y corrige requisitos, catequesis y disponibilidad.
4. Revisa **Horarios**. El horario dominical inicial de las 10:00 proviene de directorios antiguos; **no está verificado para octubre de 2026**.
5. Publica **Avisos** y **Eventos**, y agrega fotografías desde **Galería**.
6. Coordina con la parroquia el aviso de privacidad y el procedimiento para custodiar y borrar datos personales.
7. Cuando todo esté revisado, activa **Ajustes → Permitir que se envíen nuevas preinscripciones**.

## 3. Páginas públicas

| Página                        | Función                                                                    |
| ----------------------------- | -------------------------------------------------------------------------- |
| `/`                           | Portada, sacramentos, pasos, horarios, avisos, invitación                  |
| `/sacramentos`                | Introducción a Bautismo, Primera Comunión, Confirmación y Matrimonio       |
| `/sacramentos/bautismo`, etc. | Página específica editable por sacramento                                  |
| `/inscripcion`                | Formulario paso a paso, validación, consentimiento y código de seguimiento |
| `/consultar`                  | Estado de preinscripción con código y teléfono completo                    |
| `/horarios`                   | Celebraciones, catequesis y despacho                                       |
| `/vida-parroquial`            | Avisos, eventos y galería de imágenes                                      |
| `/contacto`                   | Datos parroquiales, Facebook y vínculo a Google Maps                       |

La Reconciliación y Unción de los Enfermos aparecen como consulta directa a la parroquia, **no** como inscripciones ordinarias.

## 4. Centro de control

- **Resumen:** métricas y últimas solicitudes.
- **Inscripciones:** filtro y búsqueda por participante, estado, datos de responsable, notas internas; actualización de estados y borrado permanente. Descarga de **CSV**.
- **Sacramentos:** textos, requisitos, preparación, disponibilidad por sacramento.
- **Horarios:** crear, editar y eliminar actividades y horarios.
- **Avisos:** título, categoría, fecha, imagen y archivo PDF de boletín.
- **Eventos:** fecha, hora, lugar y descripción.
- **Galería:** carga y publicación de imágenes JPG, PNG o WebP.
- **Ajustes:** identidad visual, contactos, horarios de secretaría, logo y fotografía de portada; activar/pausar inscripciones.

Las fotografías y PDF se guardan en `data/uploads/`. SQLite se guarda en `data/parroquia.sqlite`. Estos contenidos **no están en el repositorio público** y deben estar en un disco persistente del servidor.

## 5. Compilar y publicar

```bash
bun run test
bun run build
bun run start
```

Este proyecto utiliza `@astrojs/node` en modo SSR (`output: server`). **No es un sitio HTML estático**; necesita un servidor Node 22.22+ con almacenamiento persistente. En plataformas como Railway, Render (con disco persistente), un VPS o un servidor Node propio puedes configurar `ADMIN_PASSWORD`, `SESSION_SECRET` y `DATA_DIR` como variables de entorno. Detrás de un proxy HTTPS, establece además `PUBLIC_ORIGIN=https://tu-dominio.com` para validar correctamente los formularios y marcar las cookies como seguras.

- **Cloudflare Pages estático NO es compatible directamente** con este backend SQLite local y carga de archivos.
- Puedes utilizar un dominio administrado en Cloudflare como proxy/DNS apuntando a tu servidor Node.
- Para ejecutarlo **dentro de Cloudflare Workers** sería necesario migrar la persistencia a **D1** y el almacenamiento de archivos a **R2**; esta adaptación no está incluida.
- Si tu hosting descarta el sistema de archivos en cada despliegue, **se perderían solicitudes y archivos**: utiliza un volumen persistente y respaldos.
- Configura HTTPS obligatorio antes de recopilar datos reales.

## 6. Protección de datos y límites

- Contraseña de administrador configurable y sin clave por defecto.
- Cookie de sesión firmada, `HttpOnly`, `SameSite=Strict`, con caducidad de 12 h.
- Comprobación básica de origen, límites de solicitudes en memoria, validación de formularios y tipos reales de archivos.
- Los datos de participantes y sus responsables se almacenan en SQLite del servidor. No se piden documentos de identidad ni partidas de nacimiento en el formulario público.
- Solo se consultan los estados cuando coinciden el código aleatorio y el teléfono registrado. La respuesta no revela los nombres ni contactos.
- El formulario tiene un consentimiento explícito. Revisa con la parroquia las normas bolivianas aplicables, la autorización para tratar datos de menores, un aviso de privacidad adecuado, controles adicionales de producción y un plazo de retención de datos.
- Se dispone de borrado de solicitudes; **no** hay borrado automático ni gestión de usuarios múltiples, y el límite de intentos está en memoria (para muchas instancias usa un almacén compartido).
- Se recomienda una política de copias de seguridad cifradas y acceso restringido a `data/` y a los CSV descargados.
- Para una instalación sensible o a gran escala, realiza una auditoría de seguridad adicional.

## 7. Estructura

```
src/
  components/        # Layout, navegación, iconos y tarjetas
  lib/               # SQLite, datos iniciales, auth y validación
  pages/             # 8 páginas públicas y administrativas
    api/             # Endpoints de solicitudes, autenticación y CMS
    media/[name].js  # Archivos publicados desde el servidor
  styles/global.css  # Diseño responsive y animaciones
public/
  admin.js            # Centro de control (JavaScript vanilla)
  emblema.svg         # Emblema provisional reemplazable
  templo-ilustracion.svg
scripts/smoke-test.mjs
data/                 # Base de datos y archivos (privados, no subir a Git)
```

## Componentes y efectos visuales

Las reglas de [AGENTS.md](./AGENTS.md) se aplican a las páginas públicas y al panel administrativo. Antes de añadir interfaz, reutiliza los componentes de `src/components/` y los renderizadores del panel en `public/admin/`.

- `Action`, `Heading`, `Eyebrow` e `Image` mantienen los elementos semánticos y permiten conservar clases, atributos, accesibilidad y contenido mediante slots.
- `SacramentCard`, `NewsCard`, `NoticeCard`, `EventCard`, `ScheduleCard`, `ScheduleRow`, `ContactItem`, `JourneyStep` y `EmptyState` encapsulan patrones de presentación reutilizables.
- Los campos públicos se mantienen en `src/components/forms/`; los componentes específicos del panel, en `src/components/admin/`.
- Los textos y contenedores exclusivos de una sección permanecen junto a su contenido cuando extraerlos no aporta reutilización. No se crea un componente por cada etiqueta HTML aislada.
- `bun run test` incluye regresiones de los renderizadores administrativos: escape de contenido, atributos, variantes de campos, colecciones, estados y resúmenes.
- `AGENTS.md` se excluye de Prettier para conservar literalmente el texto y la separación de reglas solicitados.
- Los efectos se implementan con CSS nativo. JavaScript se limita a interacción, navegación y detección de visibilidad; el movimiento reducido desactiva animaciones decorativas y desplazamiento suave, incluso si la preferencia cambia durante la sesión.

## 8. Referencias públicas consultadas

- [Facebook oficial proporcionado](https://www.facebook.com/pquiaapostolsantiago.munaypata) — no fue posible inspeccionar de forma fiable el perfil ni extraer el logo.
- [INFODECOM: parroquias de La Paz](https://infodecom.net/iglesias-de-la-paz-bolivia/) — dirección, teléfono y horario dominical histórico.
- [SIIC: Santiago Apóstol, Munaypata](https://siic.pastoraldigital.net/obra/view/profile/3658) — ubicación y contacto.
- [Comunidad Educativa Marien Garten: historia parroquial](https://www.mariengarten.org/parroquia-ap%C3%B3stol-santiago) — misión desde 1962 y servicios comunitarios.

No se inventaron campañas de inscripción, fechas de catequesis, requisitos definitivos ni datos personales. Los textos de requisitos en los sacramentos son **orientativos** y editables desde el panel.

## Revisión responsive y accesibilidad

- El menú público admite cierre con Escape, clic fuera y cambio al ancho de escritorio; mantiene sincronizados su nombre accesible y `aria-expanded`. En pantallas de poca altura tiene desplazamiento propio.
- La navegación incluye un enlace para saltar al contenido, indicadores de foco y `aria-current`. Los formularios reorganizan sus columnas en tablet y usan campos de 16 px en móvil para evitar el zoom automático de iOS.
- La preinscripción lleva el foco al encabezado de cada paso, conserva la revisión de datos largos y respeta el bloqueo de inscripciones. La consulta anuncia los resultados y muestra un estado de carga.
- Los estilos específicos de administración están en `public/admin/admin.css`; incluyen navegación móvil, modales, tablas y estados accesibles, sin alterar la identidad del sitio público.
- Comprobación en navegador: 13 rutas públicas y de acceso, en anchos de 320, 375, 768, 1024 y 1440 px (65 combinaciones), sin scroll horizontal, imágenes rotas ni excepciones JavaScript. Se probaron los pasos del formulario sin enviar solicitudes y la consulta con respuesta simulada. Las pruebas administrativas usaron una interfaz de prueba con API interceptada, sin escribir datos reales.
- No existe un selector de tema oscuro/claro en el sitio actual. Se conserva el tema claro y se declara explícitamente para evitar controles nativos oscuros sobre formularios claros; no se añade un rediseño de tema.
- El acceso administrativo requiere `ADMIN_PASSWORD` y `SESSION_SECRET`. Mientras no estén configurados y las preinscripciones sigan cerradas, las comprobaciones no sustituyen una prueba final autenticada con la configuración de producción ni pruebas en dispositivos físicos.

## 9. Comprobaciones realizadas durante la entrega

- `bun run test`: **correcto**. Incluye pruebas de SQLite, seguridad de sesiones, validación de datos, API de preinscripciones, consulta de estados, ajustes, avisos y subida/servicio de imágenes.
- Sintaxis de JavaScript: comprobada con `node --check` y extracción de los scripts inline.
- SVG de emblema e ilustración: renderizados e inspeccionados.
- `bun run format:check` y `bun run lint`: **correctos** con la configuración de Prettier y ESLint para Astro.
- `bun run build`: **correcto**. La revisión visual final en dispositivos reales sigue pendiente.
- `bun run check`: **correcto**, con 0 errores y 0 advertencias. Se conservan los hints informativos; la extracción de componentes puede redistribuirlos (23 en la validación actual). Los formularios de consulta, inscripción y acceso administrativo comprueban los tipos DOM sin desactivar reglas.
- Formularios verificados en navegador con datos temporales: validación, avance, resumen y retroceso de inscripción, envío con consentimiento y recibo, consulta de estado y acceso administrativo con reintento tras contraseña incorrecta.
