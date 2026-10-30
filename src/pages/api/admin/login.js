import { timingSafeEqual } from 'node:crypto';
import { authConfigured,createSession,setAuthCookie,throttle,clientKey,json,sameOrigin } from '../../../lib/auth.js';
export const prerender=false;
export async function POST({request,cookies,url,clientAddress}){
  if(!sameOrigin(request))return json({error:'Origen no permitido'},403);
  if(throttle(clientKey(request,'login',clientAddress),8,15*60*1000))return json({error:'Demasiados intentos. Intenta más tarde.'},429);
  if(!authConfigured())return json({error:'Debes configurar ADMIN_PASSWORD y SESSION_SECRET en el servidor.'},503);
  let body;try{body=await request.json();}catch{return json({error:'Datos inválidos'},400);}
  const supplied=Buffer.from(String(body.password||''));
  const expected=Buffer.from(process.env.ADMIN_PASSWORD);
  if(supplied.length!==expected.length || !timingSafeEqual(supplied,expected))return json({error:'Contraseña incorrecta'},401);
  setAuthCookie(cookies,createSession(),url.protocol==='https:' || process.env.PUBLIC_ORIGIN?.startsWith('https://'));
  return json({ok:true});
}
