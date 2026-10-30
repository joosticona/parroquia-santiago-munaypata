# Parroquia Apóstol Santiago de Munaypata

Microaplicación de **preinscripciones sacramentales** y **centro de control parroquial**, desarrollada con **Astro 5 + HTML + CSS + JavaScript** y almacenamiento **SQLite local del servidor**.

Pensada para la comunidad de **Munaypata, La Paz, Bolivia**. El diseño se adapta a computadora, tablet y celular; incluye animaciones discretas y una opción de movimiento reducido respetada por el CSS.

> **IMPORTANTE:** Es un proyecto listo para instalar y configurar, **no es un canal oficial de inscripciones** hasta que la parroquia lo valide, configure, publique y active. El logo (emblema SVG) y la combinación verde petróleo/marfil/dorado son **provisionales**: no fue posible obtener y verificar los archivos originales de Facebook. Puedes reemplazarlos en el panel sin editar código.

## 1. Instalación en tu PC (Windows / macOS / Linux)

Necesitas **Node.js 22.13 o superior** (SQLite integrada en Node 22 aún emite una advertencia experimental) y conexión a Internet para descargar dependencias.

```bash
npm install
```

Copia `.env.example` a `.env` y cambia **obligatoriamente** las variables `ADMIN_PASSWORD` (contraseña única de 12+ caracteres) y `SESSION_SECRET` (secreto aleatorio de 32+ caracteres). No uses literalmente los valores de ejemplo.

```bash
npm run dev
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

| Página | Función |
|---|---|
| `/` | Portada, sacramentos, pasos, horarios, avisos, invitación |
| `/sacramentos` | Introducción a Bautismo, Primera Comunión, Confirmación y Matrimonio |
| `/sacramentos/bautismo`, etc. | Página específica editable por sacramento |
| `/inscripcion` | Formulario paso a paso, validación, consentimiento y código de seguimiento |
| `/consultar` | Estado de preinscripción con código y teléfono completo |
| `/horarios` | Celebraciones, catequesis y despacho |
| `/vida-parroquial` | Avisos, eventos y galería de imágenes |
| `/contacto` | Datos parroquiales, Facebook y vínculo a Google Maps |

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
npm run test
npm run build
npm run start
```

Este proyecto utiliza `@astrojs/node` en modo SSR (`output: server`). **No es un sitio HTML estático**; necesita un servidor Node 22+ con almacenamiento persistente. En plataformas como Railway, Render (con disco persistente), un VPS o un servidor Node propio puedes configurar `ADMIN_PASSWORD`, `SESSION_SECRET` y `DATA_DIR` como variables de entorno. Detrás de un proxy HTTPS, establece además `PUBLIC_ORIGIN=https://tu-dominio.com` para validar correctamente los formularios y marcar las cookies como seguras.

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

## 8. Referencias públicas consultadas

- [Facebook oficial proporcionado](https://www.facebook.com/pquiaapostolsantiago.munaypata) — no fue posible inspeccionar de forma fiable el perfil ni extraer el logo.
- [INFODECOM: parroquias de La Paz](https://infodecom.net/iglesias-de-la-paz-bolivia/) — dirección, teléfono y horario dominical histórico.
- [SIIC: Santiago Apóstol, Munaypata](https://siic.pastoraldigital.net/obra/view/profile/3658) — ubicación y contacto.
- [Comunidad Educativa Marien Garten: historia parroquial](https://www.mariengarten.org/parroquia-ap%C3%B3stol-santiago) — misión desde 1962 y servicios comunitarios.

No se inventaron campañas de inscripción, fechas de catequesis, requisitos definitivos ni datos personales. Los textos de requisitos en los sacramentos son **orientativos** y editables desde el panel.

## 9. Comprobaciones realizadas durante la entrega

- `npm run test`: **correcto**. Incluye pruebas de SQLite, seguridad de sesiones, validación de datos, API de preinscripciones, consulta de estados, ajustes, avisos y subida/servicio de imágenes.
- Sintaxis de JavaScript: comprobada con `node --check` y extracción de los scripts inline.
- SVG de emblema e ilustración: renderizados e inspeccionados.
- **Compilación Astro y revisión visual final en navegador: pendientes**, porque el entorno de elaboración no pudo resolver `registry.npmjs.org` para descargar las dependencias. Después de `npm install`, ejecutar `npm run build` y revisar la apariencia en dispositivos reales. No se debe interpretar el resultado de las pruebas de lógica como una compilación verificada.
