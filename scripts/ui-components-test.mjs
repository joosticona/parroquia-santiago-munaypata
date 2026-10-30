import assert from 'node:assert/strict';
import {
  esc,
  actionButton,
  overview,
  requests,
  collectionPage,
  settingsPage,
  statusTag,
  editorField,
  field,
  textarea,
  action,
} from '../public/admin/renderers.js';

const unsafe = '<img src=x onerror="alert(1)"> & \'test\'';
const escaped =
  '&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;test&#39;';
assert.equal(esc(unsafe), escaped);
assert.equal(esc(null), '');
assert.equal(
  action('Revisar ↗', 'request', unsafe, 'admin-edit-link'),
  `<button class="admin-edit-link" data-action="request" data-id="${escaped}">Revisar ↗</button>`,
);
assert.equal(
  actionButton('+ Nuevo aviso', 'new'),
  '<button class="admin-action-primary" data-action="new">+ Nuevo aviso <span>↗</span></button>',
);
assert.equal(
  field('Nota interna', textarea('note', unsafe, 3)),
  `<label class="admin-field wide">Nota interna<textarea name="note" rows="3">${escaped}</textarea></label>`,
);
for (const [status, className] of [
  ['Aprobada', 'good'],
  ['Finalizada', 'good'],
  ['Documentos pendientes', 'warn'],
  ['Rechazada', 'bad'],
  ['Recibida', 'neutral'],
]) {
  assert.equal(
    statusTag(status),
    `<span class="status-tag ${className}">${status}</span>`,
  );
}
assert.equal(
  statusTag(unsafe),
  `<span class="status-tag neutral">${escaped}</span>`,
);

for (const type of ['text', 'textarea', 'lines', 'image', 'file']) {
  const html = editorField('title', 'Campo', type, unsafe);
  assert.ok(html.includes(escaped), `Escaping: editor ${type}`);
  assert.ok(!html.includes(unsafe), `No raw content: editor ${type}`);
  assert.ok(html.includes('name="title"'));
}
assert.ok(
  editorField('title', 'Nombre', 'text', '').includes(
    'maxlength="350" required',
  ),
);
assert.ok(
  editorField('requirements', 'Requisitos', 'lines', ['uno', 'dos']).includes(
    'rows="5" placeholder="Un requisito por línea">uno\ndos</textarea>',
  ),
);
assert.ok(
  editorField('open', 'Disponible', 'checkbox', true).includes(' checked/>'),
);
assert.ok(
  !editorField('open', 'Disponible', 'checkbox', false).includes(' checked'),
);
assert.ok(
  editorField('image', 'Imagen', 'image', '').includes(
    'accept="image/png,image/jpeg,image/webp"',
  ),
);
assert.ok(
  editorField('document', 'Documento', 'file', '').includes(
    'accept="application/pdf"',
  ),
);

const kinds = ['sacramentos', 'horarios', 'avisos', 'eventos', 'galeria'];
for (const kind of kinds) {
  assert.equal(
    collectionPage(kind, []),
    '<div class="admin-empty large">Todavía no hay contenidos. Usa “Nuevo” para publicar el primero.</div>',
  );
  const html = collectionPage(kind, [
    {
      id: unsafe,
      title: unsafe,
      description: unsafe,
      image: unsafe,
      requirements: ['a'],
    },
  ]);
  assert.ok(html.includes(`data-id="${escaped}"`));
  assert.ok(html.includes(`src="${escaped}"`));
  assert.ok(html.includes(`<h3>${escaped}</h3>`));
  assert.ok(!html.includes(unsafe));
  assert.equal(html.includes('data-action="delete"'), kind !== 'sacramentos');
  assert.equal(html.includes('1 requisitos editables'), kind === 'sacramentos');
}
for (const registrationOpen of [true, false]) {
  const settings = {
    registrationOpen,
    name: unsafe,
    about: unsafe,
    logo: unsafe,
  };
  const html = settingsPage(settings);
  assert.ok(html.includes(`name="name" value="${escaped}"`));
  assert.ok(html.includes(`rows="3">${escaped}</textarea>`));
  assert.ok(html.includes(`href="${escaped}"`));
  assert.ok(!html.includes(unsafe));
  assert.equal(html.includes(' checked/>'), registrationOpen);
  assert.ok(html.includes('id="settings-form"'));
  for (const registrations of [
    [],
    [
      {
        name: unsafe,
        sacrament: 'primera-comunion',
        status: 'Recibida',
        created_at: '2026-10-29',
      },
    ],
  ]) {
    const summary = overview({ settings, registrations, eventos: [] });
    assert.equal((summary.match(/class="overview-stat"/g) || []).length, 4);
    assert.ok(
      summary.includes(
        `Preinscripciones ${registrationOpen ? 'activadas' : 'desactivadas'}`,
      ),
    );
    assert.equal(
      summary.includes('Las primeras inscripciones aparecerán aquí.'),
      registrations.length === 0,
    );
    assert.ok(!summary.includes(unsafe));
  }
}
const table = requests();
for (const id of ['request-search', 'request-filter', 'requests-rows'])
  assert.ok(table.includes(`id="${id}"`));
console.log(
  'UI admin: escaping, attributes, field variants, collections, states and summaries passed.',
);
