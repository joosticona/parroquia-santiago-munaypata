import { getAllContent, listRegistrations } from '../../../lib/db.js';
import { adminResponse, json, unauthorized } from '../../../lib/auth.js';
export const prerender = false;
export async function GET({ request, locals }) {
  const env = locals?.runtime?.env;
  if (!(await adminResponse(request, env))) return unauthorized();
  return json({
    ...(await getAllContent(env)),
    registrations: await listRegistrations(2000, env),
  });
}
