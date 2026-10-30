// Standalone Node may not load .env; Workers receive secrets explicitly.
if (
  typeof process !== 'undefined' &&
  typeof process.loadEnvFile === 'function'
) {
  try {
    process.loadEnvFile('.env');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
export function runtimeEnv(env) {
  return env ?? (typeof process !== 'undefined' ? process.env : {});
}
