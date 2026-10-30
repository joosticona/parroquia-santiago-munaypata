export const DEFAULTS = {
  settings: {
    name: 'Parroquia Apóstol Santiago',
    subtitle: 'Munaypata · La Paz, Bolivia',
    tagline: 'Caminamos juntos en la fe',
    heroDescription: 'Un espacio para acercarte a los sacramentos, conocer la vida parroquial y dar el siguiente paso en comunidad.',
    address: 'Calle Sapahaqui s/n, zona Munaypata, La Paz',
    phone: '+591 2 2396624',
    email: '',
    facebook: 'https://www.facebook.com/pquiaapostolsantiago.munaypata',
    logo: '/emblema.svg',
    heroImage: '',
    mainColor: '#193e45',
    accentColor: '#bd9661',
    registrationOpen: false,
    publicNotice: 'Los horarios y requisitos específicos deben confirmarse con la secretaría parroquial.',
    officeHours: 'Consultar con secretaría',
    about: 'Somos una comunidad de fe en Munaypata, La Paz, con una historia de servicio pastoral y comunitario vinculada a la misión de sacerdotes de Bérgamo desde 1962.'
  },
  sacramentos: [
    {id:'bautismo',icon:'droplets',title:'Bautismo',tag:'Primer encuentro',description:'Un nuevo comienzo en la vida de fe. Acompañamos a las familias en su preparación.',detail:'El Bautismo es la puerta de entrada a la vida cristiana. La parroquia orientará a padres y padrinos sobre la preparación y los pasos necesarios.',requirements:['Consultar la documentación del niño o niña','Solicitar información sobre la preparación de padres y padrinos','Confirmar fechas disponibles en secretaría'],duration:'Según programación parroquial',open:true,featured:true},
    {id:'primera-comunion',icon:'wheat',title:'Primera Comunión',tag:'Encuentro con Jesús',description:'Un camino de catequesis para recibir por primera vez la Eucaristía.',detail:'La Primera Comunión es un momento especial de encuentro con Cristo. Incluye preparación catequética y acompañamiento familiar.',requirements:['Consultar edades y grupos de catequesis','Consultar los documentos solicitados','Confirmar calendario de preparación'],duration:'Según calendario catequético',open:true,featured:true},
    {id:'confirmacion',icon:'flame',title:'Confirmación',tag:'Fortalecer la fe',description:'Profundizar el compromiso cristiano y recibir la fuerza del Espíritu Santo.',detail:'La Confirmación fortalece el vínculo con la Iglesia y anima a vivir la fe en comunidad.',requirements:['Consultar edad mínima y preparación','Consultar certificado de Bautismo','Confirmar los encuentros con catequistas'],duration:'Según calendario catequético',open:true,featured:true},
    {id:'matrimonio',icon:'heart',title:'Matrimonio',tag:'Un amor que trasciende',description:'Preparación y orientación para celebrar la unión sacramental.',detail:'El sacramento del Matrimonio acompaña el compromiso de los novios ante Dios y la comunidad. Los requisitos y plazos deben coordinarse con el despacho parroquial.',requirements:['Solicitar entrevista con la parroquia','Consultar documentación eclesiástica y civil','Coordinar preparación y disponibilidad de fechas'],duration:'Coordinación previa',open:true,featured:true}
  ],
  horarios: [
    {id:'misa-dominical',type:'Celebración',title:'Santa Misa dominical',day:'Domingo',time:'10:00',place:'Templo parroquial',note:'Horario encontrado en directorios públicos antiguos. Confirmar antes de asistir.'},
    {id:'secretaria',type:'Atención',title:'Secretaría parroquial',day:'Por confirmar',time:'Consultar',place:'Oficina parroquial',note:'Solicita información por teléfono o Facebook.'},
    {id:'catequesis',type:'Catequesis',title:'Grupos de preparación',day:'Por anunciar',time:'Por anunciar',place:'Parroquia',note:'La parroquia publicará los horarios actualizados.'}
  ],
  avisos: [
    {id:'bienvenida',title:'Bienvenidos a nuestra comunidad digital',category:'Comunidad',date:'',description:'Aquí compartiremos avisos, noticias y actividades de nuestra parroquia. El equipo parroquial puede actualizar este contenido desde el panel.',image:'',featured:true}
  ],
  eventos: [],
  galeria: []
};
export const STATES = ['Recibida', 'En revisión', 'Documentos pendientes', 'Aprobada', 'Finalizada', 'Rechazada'];
