export const clean=(v,max=300)=>String(v??'').trim().slice(0,max);
export function cleanPhone(phone){return String(phone??'').replace(/[^0-9]/g,'').slice(0,16);}
export function validEmail(s){return !s||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);}
export function normalizeSettings(input,current){
  const result={...current};
  const limits={name:80,subtitle:100,tagline:100,heroDescription:360,address:220,phone:30,email:120,facebook:300,logo:350,heroImage:350,publicNotice:500,officeHours:180,about:1400};
  for(const [k,max] of Object.entries(limits)) if(k in input) result[k]=clean(input[k],max);
  for(const k of ['mainColor','accentColor']) if(k in input && /^#[a-fA-F0-9]{6}$/.test(String(input[k]))) result[k]=input[k];
  if('registrationOpen' in input) result.registrationOpen=input.registrationOpen===true;
  if(result.facebook && !/^https:\/\/((www\.)?facebook\.com|fb\.com)\//i.test(result.facebook)) throw Error('El enlace de Facebook no es válido');
  if(result.logo && !(result.logo.startsWith('/media/')||result.logo==='/emblema.svg')) throw Error('Sube el logo desde la galería de medios');
  if(result.heroImage && !result.heroImage.startsWith('/media/')) throw Error('Sube la portada desde la galería de medios');
  if(!validEmail(result.email)) throw Error('Correo electrónico inválido');
  return result;
}
const fields={
  sacramentos:{title:90,tag:60,description:300,detail:1800,duration:100,icon:25},
  horarios:{title:120,day:90,time:90,place:120,type:45,note:300},
  avisos:{title:160,category:40,date:24,description:1200,image:350,document:350},
  eventos:{title:160,date:24,time:80,place:140,description:700,image:350},
  galeria:{title:120,image:350,description:260}
};
export function normalizeRecord(kind,input,old){
  if(!fields[kind]) throw Error('Sección inválida');
  const out={...old};
  for(const [k,max] of Object.entries(fields[kind])) if(k in input) out[k]=clean(input[k],max);
  if(kind==='sacramentos'){
    if ('requirements' in input){if(!Array.isArray(input.requirements)) throw Error('Requisitos inválidos');out.requirements=input.requirements.slice(0,12).map(x=>clean(x,180)).filter(Boolean);}
    if('open' in input)out.open=input.open===true;
    if('featured' in input)out.featured=input.featured===true;
  }
  if(kind==='avisos' && 'featured' in input)out.featured=input.featured===true;
  if(!out.title?.trim()) throw Error('El título es obligatorio');
  for(const name of ['image','document']) if(out[name]&&!out[name].startsWith('/media/')) throw Error('Selecciona una imagen subida al panel');
  return out;
}
