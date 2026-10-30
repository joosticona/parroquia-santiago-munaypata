export function getDb() {
  throw new Error(
    'El despliegue requiere el binding D1 DB; SQLite local no está disponible en Pages.',
  );
}
export function dataDir() {
  throw new Error(
    'El despliegue requiere el binding R2 UPLOADS; el disco local no es persistente en Pages.',
  );
}
