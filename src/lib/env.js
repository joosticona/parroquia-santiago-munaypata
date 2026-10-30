import { existsSync } from 'node:fs';
// El modo standalone de Astro no carga automáticamente .env en todos los alojamientos.
// Permite usar .env en desarrollo y variables del entorno en producción.
if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env');
}
