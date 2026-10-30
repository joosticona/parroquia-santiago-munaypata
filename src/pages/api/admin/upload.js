import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { dataDir } from '../../../lib/db.js';
import { adminResponse,json,unauthorized,sameOrigin,throttle,clientKey } from '../../../lib/auth.js';
export const prerender=false;
function typeOf(buffer){
  if(buffer.subarray(0,3).equals(Buffer.from([0xFF,0xD8,0xFF])))return ['jpg','image/jpeg'];
  if(buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return ['png','image/png'];
  if(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP')return ['webp','image/webp'];
  if(buffer.toString('ascii',0,5)==='%PDF-')return ['pdf','application/pdf'];
  return null;
}
export async function POST({request,clientAddress}){
  if(!adminResponse(request))return unauthorized();
  if(!sameOrigin(request))return json({error:'Origen no permitido'},403);
  if(throttle(clientKey(request,'upload',clientAddress),25,60*60*1000))return json({error:'Demasiadas cargas de archivos'},429);
  try{
    const form=await request.formData(),file=form.get('file');
    if(!(file instanceof File))return json({error:'Selecciona un archivo'},400);
    if(file.size>8*1024*1024 || file.size<10)return json({error:'Archivos de máximo 8 MB'},400);
    const bytes=Buffer.from(await file.arrayBuffer());const info=typeOf(bytes);
    if(!info)return json({error:'Solo imágenes JPG/PNG/WebP o PDF'},400);
    if(info[0]!=='pdf'&&file.size>5*1024*1024)return json({error:'Las imágenes deben pesar menos de 5 MB'},400);
    const dir=path.join(dataDir(),'uploads');await mkdir(dir,{recursive:true});
    const name=randomUUID()+'.'+info[0];
    await writeFile(path.join(dir,name),bytes,{flag:'wx',mode:0o600});
    return json({ok:true,url:'/media/'+name,type:info[1]});
  }catch{return json({error:'No se pudo subir el archivo'},400);}
}
