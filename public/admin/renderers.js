const esc = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (ch) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[ch],
  );
function actionButton(text, fn) {
  return `<button class="admin-action-primary" data-action="${fn}">${text} <span>↗</span></button>`;
}
function overview(db) {
  const settings = db.settings;
  const pending = db.registrations.filter(
      (x) => x.status === 'Recibida' || x.status === 'En revisión',
    ).length,
    approved = db.registrations.filter((x) => x.status === 'Aprobada').length;
  return `<div class="overview-stats">${statCard(`◫`, `Total de solicitudes`, `${db.registrations.length}`, `Solicitudes recibidas`)}${statCard(`◷`, `Por revisar`, `${pending}`, `Requieren seguimiento`)}${statCard(`✓`, `Aprobadas`, `${approved}`, `Solicitudes aprobadas`)}${statCard(`✳`, `Próximos eventos`, `${db.eventos.length}`, `Publicados en el sitio`)}</div>
      <div class="overview-columns"><section class="admin-panel">${panelHead(`Últimas inscripciones`, `Movimientos recientes en el sistema`, `<button data-action="goto" data-to="solicitudes">Ver todas ↗</button>`)}${
        db.registrations.length
          ? db.registrations
              .slice(0, 6)
              .map(
                (r) =>
                  `<div class="recent-row"><span class="recent-avatar">${esc(r.name.slice(0, 1).toUpperCase())}</span><div><strong>${esc(r.name)}</strong><small>${esc(r.sacrament.replaceAll('-', ' '))} · ${formatDate(r.created_at)}</small></div>${statusTag(r.status)}</div>`,
              )
              .join('')
          : '<div class="admin-empty">Las primeras inscripciones aparecerán aquí.</div>'
      }</section>
      <section class="admin-panel control-panel">${panelHead(`Estado del portal`, `Configuración principal`, ``)}<div class="portal-state"><span class="portal-indicator ${settings.registrationOpen ? 'on' : 'off'}">${settings.registrationOpen ? '●' : '○'}</span><div><strong>Preinscripciones ${settings.registrationOpen ? 'activadas' : 'desactivadas'}</strong><p>${settings.registrationOpen ? 'El formulario público acepta solicitudes.' : 'No se están recibiendo solicitudes.'}</p></div></div><button class="admin-switch-action" data-action="toggle-registration">${settings.registrationOpen ? 'Pausar preinscripciones' : 'Activar preinscripciones'} →</button><div class="control-divider"></div><h4>Accesos rápidos</h4><button data-action="goto" data-to="horarios">Editar horarios <span>↗</span></button><button data-action="goto" data-to="avisos">Publicar noticia <span>↗</span></button><button data-action="goto" data-to="ajustes">Personalizar sitio <span>↗</span></button></section></div>
      <div class="admin-info-note">✳ <span><strong>Antes de publicar:</strong> revisa requisitos, horarios y fotografías. Las inscripciones están inicialmente pausadas para evitar recopilar datos antes de la validación parroquial.</span></div>`;
}
function statusClass(s) {
  return s === 'Aprobada' || s === 'Finalizada'
    ? 'good'
    : s === 'Documentos pendientes'
      ? 'warn'
      : s === 'Rechazada'
        ? 'bad'
        : 'neutral';
}
function formatDate(s) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(s);
  }
}
function requests() {
  return `<div class="admin-panel"><div class="admin-toolbar"><label class="admin-search"><span>⌕</span><input placeholder="Buscar nombre, código o teléfono..." id="request-search" aria-label="Buscar inscripciones" type="search"/></label><select id="request-filter" aria-label="Filtrar por estado"><option value="">Todos los estados</option>${['Recibida', 'En revisión', 'Documentos pendientes', 'Aprobada', 'Finalizada', 'Rechazada'].map((s) => `<option>${s}</option>`).join('')}</select></div><div class="admin-table-scroll" tabindex="0" role="region" aria-label="Inscripciones: tabla desplazable"><table class="admin-table" aria-label="Inscripciones"><thead><tr><th scope="col">PARTICIPANTE</th><th scope="col">SACRAMENTO</th><th scope="col">FECHA</th><th scope="col">ESTADO</th><th scope="col">ACCIÓN</th></tr></thead><tbody id="requests-rows"></tbody></table></div></div><p class="admin-privacy-note">Privacidad: la información personal solo es visible para administradores autorizados. Exporta los registros únicamente para uso pastoral y elimina los innecesarios.</p>`;
}
function collectionPage(kind, items) {
  if (!items.length)
    return '<div class="admin-empty large">Todavía no hay contenidos. Usa “Nuevo” para publicar el primero.</div>';
  return `<div class="collection-grid ${kind === 'sacramentos' ? 'two-columns' : ''}">${items.map((item) => `<article class="collection-card"><div class="collection-card-top">${item.image ? `<img class="collection-photo" src="${esc(item.image)}" alt=""/>` : `<span class="collection-deco">${kind === 'sacramentos' ? '✝' : kind === 'horarios' ? '◷' : kind === 'avisos' ? '✦' : kind === 'eventos' ? '◈' : '▧'}</span>`}<span class="collection-chip">${esc(kind === 'sacramentos' ? (item.open ? 'Habilitado' : 'Pausado') : item.type || item.category || kind)}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.description || item.detail || item.note || [item.day, item.time, item.place].filter(Boolean).join(' · ') || 'Sin descripción')}</p>${kind === 'sacramentos' ? `<p class="collection-meta">${(item.requirements || []).length} requisitos editables</p>` : ''}<div class="collection-actions">${action('✎ Editar', 'edit', item.id)}${kind === 'sacramentos' ? '' : `${action('× Eliminar', 'delete', item.id, 'danger')}`}</div></article>`).join('')}</div>`;
}
function settingsPage(settings) {
  return `<div class="settings-layout"><form id="settings-form">${settingGroups.map(([title, fields]) => `<section class="admin-panel settings-panel">${panelHead(`${title}`, `Estos cambios se reflejan en la web pública.`, ``)}<div class="settings-grid">${fields.map(([key, label, type]) => settingField(key, label, type, settings)).join('')}</div></section>`).join('')}<section class="admin-panel settings-panel registration-config">${panelHead(`Preinscripciones en línea`, `Habilita la recepción de datos cuando el equipo parroquial esté preparado.`, ``)}<label class="toggle-label"><input type="checkbox" name="registrationOpen" ${settings.registrationOpen ? 'checked' : ''}/><span class="toggle-ui"></span><span>Permitir que se envíen nuevas preinscripciones</span></label><p class="fine-print">Asegúrate de contar con autorización parroquial, aviso de privacidad y una política de conservación de datos.</p></section><p class="upload-feedback" role="status" aria-live="polite"></p><div class="settings-actions"><button type="submit" class="btn btn-primary">Guardar configuración ↗</button></div></form></div>`;
}
function settingField(key, label, type, settings) {
  const value = settings[key] ?? '';
  if (type === 'textarea') return field(label, textarea(key, value, 3));
  if (type === 'image')
    return `<div class="admin-field wide">${label}<div class="upload-control">${value ? `<a href="${esc(value)}" target="_blank" rel="noopener"><img src="${esc(value)}" alt="Imagen actual"/></a>` : ''}<input aria-label="${label}: archivo actual" type="text" name="${key}" value="${esc(value)}" readonly placeholder="Sin imagen cargada"/><label class="upload-button">↑ Subir imagen<input type="file" aria-label="Subir ${label}" accept="image/png,image/jpeg,image/webp" class="file-input" data-target="${key}"/></label></div></div>`;
  return `<label class="admin-field ${key === 'mainColor' || key === 'accentColor' ? '' : 'wide'}">${label}<input type="${type}" name="${key}" value="${esc(value)}" ${type === 'color' ? 'class="color-input"' : ''}/></label>`;
}
const settingGroups = [
  [
    'Identidad y mensaje',
    [
      ['name', 'Nombre público', 'text'],
      ['subtitle', 'Ubicación / subtítulo', 'text'],
      ['tagline', 'Frase principal del inicio', 'text'],
      ['heroDescription', 'Descripción de portada', 'textarea'],
      ['about', 'Presentación de la parroquia', 'textarea'],
    ],
  ],
  [
    'Contacto y horarios',
    [
      ['address', 'Dirección', 'text'],
      ['phone', 'Teléfono parroquial', 'text'],
      ['email', 'Correo (si existe)', 'email'],
      ['facebook', 'Enlace de Facebook', 'url'],
      ['officeHours', 'Horario de secretaría', 'text'],
      ['publicNotice', 'Aviso general de confirmación', 'textarea'],
    ],
  ],
  [
    'Apariencia y fotografías',
    [
      ['mainColor', 'Color principal', 'color'],
      ['accentColor', 'Color de acento', 'color'],
      ['logo', 'Logo parroquial (subir foto)', 'image'],
      ['heroImage', 'Foto principal (opcional)', 'image'],
    ],
  ],
];

function editorField(key, label, type, value) {
  const val = value;
  if (type === 'checkbox')
    return `<label class="toggle-label modal-check"><input type="checkbox" name="${key}" ${val ? 'checked' : ''}/><span class="toggle-ui"></span><span>${label}</span></label>`;
  if (type === 'textarea' || type === 'lines')
    return field(
      label,
      textarea(
        key,
        Array.isArray(val) ? val.join('\n') : val,
        type === 'lines' ? 5 : 4,
        type === 'lines' ? 'Un requisito por línea' : '',
      ),
    );
  if (type === 'image' || type === 'file')
    return `<div class="admin-field wide">${label}<div class="upload-control">${val ? (type === 'image' ? `<img src="${esc(val)}" alt="Imagen cargada"/>` : `<a href="${esc(val)}" target="_blank" rel="noopener noreferrer">PDF cargado ↗</a>`) : ''}<input aria-label="${label}: archivo actual" type="text" name="${key}" value="${esc(val)}" readonly placeholder="Sin archivo seleccionado"/><label class="upload-button">↑ Subir ${type === 'file' ? 'PDF' : 'imagen'}<input class="file-input" type="file" aria-label="Subir ${label}" data-target="${key}" accept="${type === 'file' ? 'application/pdf' : 'image/png,image/jpeg,image/webp'}"/></label></div></div>`;
  return `<label class="admin-field wide">${label}<input type="text" name="${key}" value="${esc(val)}" maxlength="350" ${key === 'title' ? 'required' : ''}/></label>`;
}

function panelHead(title, description, actions = '') {
  return `<div class="admin-panel-head"><div><h3>${title}</h3><p>${description}</p></div>${actions}</div>`;
}
function statCard(icon, label, value, description) {
  return `<div class="overview-stat"><div class="stat-icon">${icon}</div><small>${label}</small><strong>${value}</strong><span>${description}</span></div>`;
}
function statusTag(status) {
  return `<span class="status-tag ${statusClass(status)}">${esc(status)}</span>`;
}

export {
  esc,
  actionButton,
  overview,
  formatDate,
  requests,
  collectionPage,
  settingsPage,
  statusTag,
  editorField,
};

function field(label, control) {
  return `<label class="admin-field wide">${label}${control}</label>`;
}
function textarea(key, value, rows, placeholder) {
  return `<textarea name="${key}" rows="${rows}"${placeholder === undefined ? '' : ` placeholder="${placeholder}"`}>${esc(value)}</textarea>`;
}
function action(text, name, id, className = '') {
  return `<button${className ? ` class="${className}"` : ''} data-action="${name}" data-id="${esc(id)}">${text}</button>`;
}
export { field, textarea, action };
