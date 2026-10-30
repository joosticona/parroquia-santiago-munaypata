import {
  field,
  textarea,
  action,
  esc,
  actionButton,
  overview,
  formatDate,
  requests,
  collectionPage,
  settingsPage,
  statusTag,
  editorField,
} from './admin/renderers.js';

(() => {
  'use strict';
  let db = null,
    view = 'resumen',
    currentForm = null;
  const $ = (id) => document.getElementById(id);
  const names = {
    resumen: [
      'Bienvenido al <em>panel.</em>',
      'Todo lo que necesitas para acompañar a tu comunidad.',
    ],
    solicitudes: [
      'Gestión de <em>inscripciones.</em>',
      'Revisa y acompaña las solicitudes de las familias.',
    ],
    sacramentos: [
      'Nuestros <em>sacramentos.</em>',
      'Actualiza requisitos, descripciones y disponibilidad.',
    ],
    horarios: [
      'Horarios y <em>celebraciones.</em>',
      'Publica y corrige los horarios que ve la comunidad.',
    ],
    avisos: [
      'Avisos y <em>noticias.</em>',
      'Mantén informada a la comunidad parroquial.',
    ],
    eventos: [
      'Agenda de <em>actividades.</em>',
      'Organiza reuniones, celebraciones y actividades.',
    ],
    galeria: [
      'Galería de <em>momentos.</em>',
      'Comparte fotografías de la vida parroquial.',
    ],
    ajustes: [
      'Ajustes del <em>sitio.</em>',
      'Personaliza identidad, contacto, imágenes y preinscripciones.',
    ],
  };
  const collectionLabel = {
    sacramentos: 'sacramento',
    horarios: 'horario',
    avisos: 'aviso',
    eventos: 'evento',
    galeria: 'fotografía',
  };
  const fieldSpecs = {
    sacramentos: [
      ['title', 'Nombre', 'text'],
      ['tag', 'Etiqueta corta', 'text'],
      ['description', 'Descripción para la tarjeta', 'textarea'],
      ['detail', 'Descripción completa', 'textarea'],
      ['duration', 'Duración / preparación', 'text'],
      ['requirements', 'Requisitos (uno por línea)', 'lines'],
      ['open', 'Este sacramento acepta solicitudes', 'checkbox'],
      ['featured', 'Mostrar en inicio', 'checkbox'],
    ],
    horarios: [
      ['title', 'Actividad o celebración', 'text'],
      ['type', 'Categoría (Celebración, Atención, Catequesis...)', 'text'],
      ['day', 'Día(s)', 'text'],
      ['time', 'Horario', 'text'],
      ['place', 'Lugar', 'text'],
      ['note', 'Observación', 'textarea'],
    ],
    avisos: [
      ['title', 'Título', 'text'],
      ['category', 'Categoría', 'text'],
      ['date', 'Fecha (texto libre)', 'text'],
      ['description', 'Contenido del aviso', 'textarea'],
      ['image', 'Imagen de portada', 'image'],
      ['document', 'Boletín en PDF (opcional)', 'file'],
      ['featured', 'Destacar aviso', 'checkbox'],
    ],
    eventos: [
      ['title', 'Nombre del evento', 'text'],
      ['date', 'Fecha', 'text'],
      ['time', 'Hora', 'text'],
      ['place', 'Lugar', 'text'],
      ['description', 'Descripción', 'textarea'],
      ['image', 'Imagen del evento', 'image'],
    ],
    galeria: [
      ['title', 'Título de fotografía', 'text'],
      ['description', 'Descripción', 'textarea'],
      ['image', 'Fotografía', 'image'],
    ],
  };
  async function api(url, body, method = 'POST') {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({ error: 'Error de conexión' }));
    if (res.status === 401) {
      location.href = '/admin/login';
      throw Error('Sesión vencida');
    }
    if (!res.ok) throw Error(data.error || 'No se pudo completar');
    return data;
  }
  async function refresh() {
    db = await api('/api/admin/data', undefined, 'GET');
    $('sidebar-count').textContent = db.registrations.filter(
      (r) => r.status === 'Recibida',
    ).length;
    render();
  }
  let toastTimer;
  let modalOpener;
  let modalBusy = false;
  let uploadsPending = 0;
  const mobileMenu = window.matchMedia('(max-width: 700px)');
  function setMenu(open, restoreFocus = false) {
    const sidebar = $('admin-sidebar');
    sidebar.classList.toggle('sidebar-visible', open);
    sidebar.inert = mobileMenu.matches && !open;
    $('admin-menu-toggle').setAttribute('aria-expanded', String(open));
    $('admin-menu-toggle').setAttribute(
      'aria-label',
      open ? 'Cerrar menú' : 'Mostrar menú',
    );
    if (open) $('admin-menu-close').focus();
    else if (restoreFocus) $('admin-menu-toggle').focus();
  }
  function showModal() {
    modalOpener = document.activeElement;
    $('modal-form').querySelector('.upload-feedback').textContent = '';
    $('admin-modal').hidden = false;
    document.body.classList.add('modal-open');
    document.querySelector('.admin-shell').inert = true;
    $('modal-form')
      .querySelector('input:not([type="checkbox"]),textarea,select')
      ?.focus();
  }
  function setModalBusy(busy) {
    modalBusy = busy;
    $('modal-form').setAttribute('aria-busy', String(busy));
    $('modal-submit').disabled = busy || uploadsPending > 0;
    $('admin-modal')
      .querySelectorAll('[data-close-modal], #delete-request')
      .forEach((button) => {
        if (button instanceof HTMLButtonElement) button.disabled = busy;
      });
  }
  function toast(message, error = false) {
    const bar = $('admin-alert');
    bar.textContent = message;
    bar.className = 'admin-alert ' + (error ? 'danger' : '');
    bar.hidden = false;
    if ($('admin-modal').hidden)
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      bar.hidden = true;
    }, 5000);
  }
  function setView(v) {
    if (!names[v] || uploadsPending) return;
    view = v;
    document.querySelectorAll('[data-view]').forEach((b) => {
      b.classList.toggle('selected', b.dataset.view === v);
      if (b.dataset.view === v) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    $('active-view-name').textContent = v.toUpperCase();
    $('admin-view-title').innerHTML = names[v][0];
    $('admin-view-description').textContent = names[v][1];
    setMenu(false);
    render();
    $('admin-view-title').focus();
  }
  function render() {
    if (!db) return;
    const host = $('admin-render'),
      actions = $('admin-head-actions');
    actions.innerHTML = '';
    if (view === 'resumen') host.innerHTML = overview(db);
    else if (view === 'solicitudes') {
      actions.innerHTML =
        '<a href="/api/admin/export.csv" class="admin-action-outline">↓ Exportar CSV</a>';
      host.innerHTML = requests();
    } else if (view === 'ajustes') host.innerHTML = settingsPage(db.settings);
    else {
      if (view !== 'sacramentos')
        actions.innerHTML = actionButton(
          '+ Nuevo ' + collectionLabel[view],
          'new',
        );
      host.innerHTML = collectionPage(view, db[view]);
    }
    attachDynamic();
  }
  function renderRequestRows() {
    const q = ($('request-search')?.value || '').toLowerCase(),
      status = $('request-filter')?.value || '';
    const rows = db.registrations.filter(
      (r) =>
        (!status || r.status === status) &&
        [r.code, r.name, r.guardian, r.phone, r.sacrament]
          .join(' ')
          .toLowerCase()
          .includes(q),
    );
    $('requests-rows').innerHTML = rows.length
      ? rows
          .map(
            (r) =>
              `<tr><td><strong>${esc(r.name)}</strong><small>${esc(r.code)}</small></td><td>${esc(r.sacrament.replaceAll('-', ' '))}</td><td>${formatDate(r.created_at)}</td><td>${statusTag(r.status)}</td><td>${action('Revisar ↗', 'request', r.code, 'admin-edit-link')}</td></tr>`,
          )
          .join('')
      : '<tr><td colspan="5" class="admin-table-empty">No hay solicitudes para esta búsqueda.</td></tr>';
  }
  function attachDynamic() {
    if (view === 'solicitudes') {
      $('request-search').addEventListener('input', renderRequestRows);
      $('request-filter').addEventListener('change', renderRequestRows);
      renderRequestRows();
    }
    if (view === 'ajustes') {
      $('settings-form').addEventListener('submit', saveSettings);
      setupUploads($('settings-form'));
    }
  }
  async function saveSettings(e) {
    e.preventDefault();
    if (uploadsPending) return;
    const form = e.target,
      body = Object.fromEntries(new FormData(form));
    body.registrationOpen = form.elements.registrationOpen.checked;
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      await api('/api/admin/settings', body);
      await refresh();
      toast('Configuración guardada correctamente.');
    } catch (err) {
      toast(err.message, true);
    } finally {
      button.disabled = false;
    }
  }
  function openEditor(kind, id) {
    let old = id ? db[kind].find((x) => x.id === id) : {};
    if (id && !old) return;
    currentForm = { kind, id };
    $('modal-heading').textContent =
      (id ? 'Editar ' : 'Nuevo ') + collectionLabel[kind];
    $('modal-error').hidden = true;
    $('modal-fields').innerHTML = fieldSpecs[kind]
      .map(([key, label, type]) =>
        editorField(key, label, type, old[key] ?? ''),
      )
      .join('');
    $('modal-form').reset();
    for (const [key, , type] of fieldSpecs[kind]) {
      if (type === 'checkbox')
        $('modal-form').elements[key].checked = !!old[key];
      else if (old[key] != null)
        $('modal-form').elements[key].value = Array.isArray(old[key])
          ? old[key].join('\n')
          : old[key];
    }
    setupUploads($('modal-form'));
    showModal();
  }
  function closeModal() {
    if (modalBusy || uploadsPending) return;
    $('admin-modal').hidden = true;
    document.querySelector('.admin-shell').inert = false;
    if (modalOpener?.isConnected) modalOpener.focus();
    else $('admin-view-title').focus();
    document.body.classList.remove('modal-open');
    currentForm = null;
  }
  async function saveModal(e) {
    e.preventDefault();
    if (!currentForm) return;
    const { kind, id } = currentForm;
    const form = e.target,
      fields = Object.fromEntries(new FormData(form));
    for (const [key, , type] of fieldSpecs[kind]) {
      if (type === 'checkbox') fields[key] = form.elements[key].checked;
      if (type === 'lines')
        fields[key] = String(fields[key] || '')
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean);
    }
    if (id) fields.id = id;
    setModalBusy(true);
    try {
      await api('/api/admin/collections', {
        kind,
        operation: id ? 'update' : 'create',
        record: fields,
      });
      setModalBusy(false);
      closeModal();
      await refresh();
      toast('Contenido guardado correctamente.');
    } catch (err) {
      $('modal-error').textContent = err.message;
      $('modal-error').hidden = false;
    } finally {
      setModalBusy(false);
    }
  }
  function openRequest(id) {
    const r = db.registrations.find((x) => x.code === id);
    if (!r) return;
    currentForm = { request: id };
    $('modal-heading').textContent = 'Revisar solicitud';
    $('modal-error').hidden = true;
    $('modal-fields').innerHTML =
      `<div class="request-details"><span class="pill">${esc(r.code)}</span><h3>${esc(r.name)}</h3><p>${esc(r.sacrament.replaceAll('-', ' '))}</p><div><span>Edad</span><strong>${esc(r.age)}</strong></div><div><span>Responsable</span><strong>${esc(r.guardian)}</strong></div><div><span>Teléfono</span><strong>${esc(r.phone)}</strong></div><div><span>Correo</span><strong>${esc(r.email || 'No indicado')}</strong></div><div><span>Consulta</span><strong>${esc(r.notes || 'Sin comentarios')}</strong></div><div><span>Recibida</span><strong>${formatDate(r.created_at)}</strong></div></div><label class="admin-field wide">Estado<select name="status">${['Recibida', 'En revisión', 'Documentos pendientes', 'Aprobada', 'Finalizada', 'Rechazada'].map((s) => `<option ${r.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>${field('Nota interna (solo administración)', textarea('note', r.admin_note, 3))}<div class="request-delete"><button type="button" class="danger-text" id="delete-request">Eliminar permanentemente esta solicitud</button></div>`;
    showModal();
    $('delete-request').addEventListener('click', async () => {
      if (
        !confirm(
          '¿Eliminar definitivamente esta solicitud? No se podrá recuperar.',
        )
      )
        return;
      setModalBusy(true);
      try {
        await api('/api/admin/solicitudes', { action: 'delete', code: id });
        setModalBusy(false);
        closeModal();
        await refresh();
        toast('Solicitud eliminada.');
      } catch (err) {
        $('modal-error').textContent = err.message;
        $('modal-error').hidden = false;
      } finally {
        setModalBusy(false);
      }
    });
  }
  async function submitForm(e) {
    e.preventDefault();
    if (!currentForm || modalBusy || uploadsPending) return;
    if (currentForm.request) {
      const id = currentForm.request,
        f = new FormData(e.target);
      setModalBusy(true);
      try {
        await api('/api/admin/solicitudes', {
          action: 'update',
          code: id,
          status: f.get('status'),
          note: f.get('note'),
        });
        setModalBusy(false);
        closeModal();
        await refresh();
        toast('Solicitud actualizada.');
      } catch (err) {
        $('modal-error').textContent = err.message;
        $('modal-error').hidden = false;
      } finally {
        setModalBusy(false);
      }
    } else await saveModal(e);
  }
  function setupUploads(root) {
    root.querySelectorAll('.file-input').forEach((input) =>
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        const wrapper = input.closest('.upload-control'),
          target = wrapper.querySelector(
            `input[name="${input.dataset.target}"]`,
          );
        const label = input.closest('label'),
          text = label.childNodes[0];
        const original = text?.textContent || 'Subir archivo';
        if (text) text.textContent = ' Subiendo... ';
        uploadsPending++;
        input.disabled = true;
        root.setAttribute('aria-busy', 'true');
        root.querySelector('[type="submit"]').disabled = true;
        try {
          const form = new FormData();
          form.append('file', file);
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: form,
          });
          const out = await res.json();
          if (!res.ok) throw Error(out.error || 'No se pudo subir');
          target.value = out.url;
          const preview = wrapper.querySelector('img');
          if (preview && out.type.startsWith('image/')) preview.src = out.url;
          root.querySelector('.upload-feedback').textContent =
            'Archivo subido. Guarda el formulario para publicar los cambios.';
        } catch (err) {
          root.querySelector('.upload-feedback').textContent = err.message;
        } finally {
          uploadsPending--;
          input.disabled = false;
          root.setAttribute('aria-busy', String(uploadsPending > 0));
          root.querySelector('[type="submit"]').disabled = uploadsPending > 0;
          if (text) text.textContent = original;
          input.value = '';
        }
      }),
    );
  }
  document.addEventListener('click', async (e) => {
    const nav = e.target.closest('[data-view]');
    if (nav) {
      setView(nav.dataset.view);
      return;
    }
    if (e.target.closest('[data-close-modal]')) {
      closeModal();
      return;
    }
    const button = e.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action,
      id = button.dataset.id;
    if (action === 'goto') return setView(button.dataset.to);
    if (action === 'new') return openEditor(view, null);
    if (action === 'edit') return openEditor(view, id);
    if (action === 'request') return openRequest(id);
    if (action === 'delete') {
      if (!confirm('¿Eliminar este contenido del sitio público?')) return;
      try {
        await api('/api/admin/collections', {
          kind: view,
          operation: 'delete',
          record: { id },
        });
        await refresh();
        toast('Contenido eliminado.');
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }
    if (action === 'toggle-registration') {
      const next = !db.settings.registrationOpen;
      if (
        next &&
        !confirm(
          '¿Confirmas que la parroquia está preparada para recibir y custodiar datos personales?',
        )
      )
        return;
      try {
        await api('/api/admin/settings', { registrationOpen: next });
        await refresh();
        toast(
          next ? 'Preinscripciones activadas.' : 'Preinscripciones pausadas.',
        );
      } catch (err) {
        toast(err.message, true);
      }
    }
  });
  $('modal-form').addEventListener('submit', submitForm);
  $('admin-menu-toggle').addEventListener('click', () =>
    setMenu(!$('admin-sidebar').classList.contains('sidebar-visible')),
  );
  $('admin-menu-close').addEventListener('click', () => setMenu(false, true));
  mobileMenu.addEventListener('change', () => setMenu(false));
  setMenu(false);
  $('admin-logout').addEventListener('click', async () => {
    const button = $('admin-logout');
    button.disabled = true;
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (!response.ok)
        throw Error('No se pudo cerrar sesi?n. Int?ntalo de nuevo.');
      location.href = '/admin/login';
    } catch (err) {
      toast(err.message, true);
      button.disabled = false;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!$('admin-modal').hidden) closeModal();
      else if (
        mobileMenu.matches &&
        $('admin-sidebar').classList.contains('sidebar-visible')
      )
        setMenu(false, true);
    }
    if (e.key !== 'Tab') return;
    const region = !$('admin-modal').hidden
      ? $('admin-modal')
      : mobileMenu.matches &&
          $('admin-sidebar').classList.contains('sidebar-visible')
        ? $('admin-sidebar')
        : null;
    if (!region) return;
    const focusable = [
      ...region.querySelectorAll(
        'button, a[href], input, textarea, select, [tabindex]',
      ),
    ].filter(
      (el) => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length,
    );
    const first = focusable[0],
      last = focusable.at(-1);
    if (
      e.shiftKey &&
      (document.activeElement === first ||
        !region.contains(document.activeElement))
    ) {
      e.preventDefault();
      last?.focus();
    } else if (
      !e.shiftKey &&
      (document.activeElement === last ||
        !region.contains(document.activeElement))
    ) {
      e.preventDefault();
      first?.focus();
    }
  });
  refresh().catch((err) => {
    toast(err.message, true);
    $('admin-render').textContent = 'No se pudo cargar el centro de control.';
  });
})();
