declare namespace App {
  interface Locals {
    // Supplied per request by the deployment entrypoint; absent in local Node.
    runtime?: {
      env: Record<string, unknown>;
      ctx?: { waitUntil(promise: Promise<unknown>): void };
    };
  }
}
