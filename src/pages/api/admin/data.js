import { getAllContent,listRegistrations } from '../../../lib/db.js';
import { adminResponse,json,unauthorized } from '../../../lib/auth.js';
export const prerender=false;
export function GET({request}){
  if(!adminResponse(request))return unauthorized();
  return json({...getAllContent(),registrations:listRegistrations()});
}
