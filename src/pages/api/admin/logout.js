import { clearAuthCookie,json,sameOrigin } from '../../../lib/auth.js';
export const prerender=false;
export function POST({request,cookies}){
  if(!sameOrigin(request))return json({error:'Origen no permitido'},403);
  clearAuthCookie(cookies);return json({ok:true});
}
