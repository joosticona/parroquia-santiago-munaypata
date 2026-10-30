import { findRegistration } from '../../lib/db.js';
import { cleanPhone } from '../../lib/validation.js';
import { json,throttle,clientKey,sameOrigin } from '../../lib/auth.js';
export const prerender=false;
export async function POST({request,clientAddress}){
  if(!sameOrigin(request))return json({error:'Origen no permitido'},403);
  if(throttle(clientKey(request,'estado',clientAddress),15,60*60*1000))return json({error:'Demasiadas consultas. Prueba más tarde.'},429);
  let body;try{body=await request.json();}catch{return json({error:'Solicitud inválida'},400);}
  const code=String(body.code||'').toUpperCase().trim().slice(0,32), phone=cleanPhone(body.phone);
  if(!/^STG-[0-9A-F]{16}$/.test(code)||phone.length<7)return json({error:'Comprueba el código y el teléfono.'},400);
  const reg=findRegistration(code);
  if(!reg||reg.phone!==phone)return json({error:'No encontramos una solicitud con estos datos.'},404);
  return json({ok:true,status:reg.status,sacrament:reg.sacrament,updated:reg.updated_at});
}
