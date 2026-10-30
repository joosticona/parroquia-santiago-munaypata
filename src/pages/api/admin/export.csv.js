import { listRegistrations } from '../../../lib/db.js';
import { adminResponse } from '../../../lib/auth.js';
export const prerender=false;
const head=['code','sacrament','name','age','guardian','phone','email','notes','status','admin_note','created_at','updated_at'];
function cell(v){
  let s=String(v??'');
  if(/^[\s]*[=+@\-]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
}
export function GET({request}){
  if(!adminResponse(request))return new Response('No autorizado',{status:401});
  const csv='\uFEFF'+head.join(',')+'\r\n'+listRegistrations(0).map(r=>head.map(h=>cell(r[h])).join(',')).join('\r\n');
  return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="inscripciones-santiago.csv"','Cache-Control':'no-store'}});
}
