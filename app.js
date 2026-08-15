const CLASSROOM_CONFIG={OAUTH_CLIENT_ID:"932039937898-hbiit2lhvbih7c19e7ph01v0fddm7b3t.apps.googleusercontent.com",COURSES_SCOPE:"https://www.googleapis.com/auth/classroom.courses.readonly",STUDENT_COURSEWORK_SCOPE:"https://www.googleapis.com/auth/classroom.coursework.me.readonly",TEACHER_COURSEWORK_SCOPE:"https://www.googleapis.com/auth/classroom.coursework.students.readonly",ROSTERS_SCOPE:"https://www.googleapis.com/auth/classroom.rosters.readonly"};
let googleToken=sessionStorage.getItem("is1_google_token")||"";
const D=window.APP_DATA;
let state=JSON.parse(localStorage.getItem("is1_portable_state")||'{"role":null,"evidence":{},"rubrics":{},"project":{}}');
state.evidence=state.evidence||{}; state.rubrics=state.rubrics||{};state.studentRubrics=state.studentRubrics||{}; state.project=state.project||{}; state.classroomMap=state.classroomMap||{};state.classroomStudents=state.classroomStudents||[];state.classroomCourseWork=state.classroomCourseWork||[];
function save(){localStorage.setItem("is1_portable_state",JSON.stringify(state))}
state.user=state.user||null;
function app(html){document.getElementById("app").innerHTML=html}
function sessionByNo(n){return D.sessions.find(s=>s.no===Number(n))}
function studentRubricKey(userId,sessionNo){
  return String(userId)+"_"+String(sessionNo);
}

function getStudentRubric(userId,sessionNo){
  let key=studentRubricKey(userId,sessionNo);

  return state.studentRubrics[key]||{
    selection:0,
    processing:0,
    transfer:0,
    comment:"",
    evaluated:false
  };
}
function layout(content,active="inicio",role=state.role){
  return `<div class="layout"><aside class="sidebar"><div class="brand"><div class="logo">IS</div><div><strong>Investigación Social I</strong><small>Aprendizaje · Portafolio · Classroom</small></div></div>
  <button class="nav ${active==="inicio"?"active":""}" onclick="renderHome()">Inicio</button>
  ${role==="student"?`<button class="nav ${active==="portfolio"?"active":""}" onclick="renderPortfolio()">Mi portafolio</button><button class="nav ${active==="project"?"active":""}" onclick="renderProject()">Mi proyecto</button><button class="nav ${active==="analytics"?"active":""}" onclick="renderAnalytics()">Mi evolución</button><button class="nav ${active==="classroom"?"active":""}" onclick="renderClassroom()">Google Classroom</button>`:""}
  ${role==="teacher"?`<button class="nav ${active==="teacher"?"active":""}" onclick="renderTeacher()">Panel docente</button><button class="nav ${active==="classroom"?"active":""}" onclick="renderClassroom()">Google Classroom</button>`:""}
  <div style="margin-top:auto"><button class="nav" onclick="logout()">Cambiar perfil</button></div></aside>
  <main class="main">${content}</main></div>`
}
function login(){
 app(`<div class="login"><div class="loginbox">
 <section class="intro">
   <span class="badge">UMSS · Trabajo Social</span>
   <h1>Investigación Social I</h1>
   <p>Aprendizaje · Portafolio · Classroom</p>
 </section>
 <section class="access">
   <h2>Ingresar</h2>
   <p class="small">Seleccione su perfil para ingresar.</p>

   <button class="role-btn" onclick="chooseRole('student')">
     <b>Estudiante</b><br>
     <span class="small">Sesiones, cuaderno, portafolio y proyecto</span>
   </button>

   <button class="role-btn" onclick="chooseRole('teacher')">
     <b>Docente</b><br>
     <span class="small">Seguimiento, rúbricas, analítica y Classroom</span>
   </button>
 </section>
 </div></div>`)
}

function chooseRole(r){
 state.role=r;
 save();
 r==="teacher"?renderTeacher():renderHome()
}

function logout(){
 state.role=null;
 save();
 login()
}
function renderHome(){
 let done=Object.keys(state.evidence).length, pct=Math.round(done/32*100);
 let trs=[1,2,3,4].map(t=>`<article class="trajectory"><h3>Trayecto ${t}</h3><div class="session-grid">${D.sessions.filter(s=>s.trayecto===t).map(s=>`<div class="session-card" onclick="renderSession(${s.no})"><span>Semana ${s.week} · Sesión ${s.no}</span><b>${s.title}</b><small>${s.product}</small></div>`).join("")}</div></article>`).join("");
 app(layout(`<div class="topbar"><div><p class="eyebrow">PLATAFORMA DE APRENDIZAJE</p><h2>Inicio</h2></div><div class="user">${esc(state.user?.name||"Estudiante")}</div></div><section class="hero"><div><span class="badge">32 sesiones</span><h1>Aprender a investigar investigando</h1><p>Texto básico, ejemplo cotidiano, microciclo y portafolio.</p><button class="primary" onclick="renderSession(1)">Abrir Sesión 1</button> <button class="secondary" onclick="renderProject()">Ver mi proyecto</button></div><div class="progress"><span>Progreso</span><b>${done}/32</b><div class="bar"><i style="width:${pct}%"></i></div><small>${pct}% completado</small></div></section><section>${trs}</section>`,"inicio","student"))
}
function renderSession(no){
 const s=sessionByNo(no), ev=state.evidence[no]||{};
  const linkedClassroom=(state.classroomCourseWork||[]).filter(cw=>Number(state.classroomMap?.[cw.id])===Number(no));
 app(layout(`<div class="topbar"><div><p class="eyebrow">TRAYECTO ${s.trayecto} · SEMANA ${s.week}</p><h2>Sesión ${s.no}</h2></div></div>
 <section class="session-hero"><span class="badge">90 minutos</span><h1>${s.title}</h1><p><b>Propósito:</b> ${s.purpose}</p><p><b>Producto:</b> ${s.product}</p></section>
 ${linkedClassroom.length?`<section class="panel classroom-session-block"><p class="eyebrow">ACTIVIDAD INSTITUCIONAL EN GOOGLE CLASSROOM</p><h2>${linkedClassroom.length===1?"Actividad vinculada":"Actividades vinculadas"}</h2>${linkedClassroom.map(cw=>`<article class="coursework-card session-classroom-card"><span class="badge">Classroom</span><h3>${esc(cw.title||"Actividad")}</h3>${cw.description?`<p>${esc(cw.description).replace(/\n/g,"<br>")}</p>`:""}<div class="coursework-meta"><span>Estado: ${esc(cw.state||"")}</span><span>Tipo: ${esc(cw.workType||"")}</span>${cw.maxPoints!=null?`<span>Puntaje: ${cw.maxPoints}</span>`:""}</div><br><a class="primary" href="https://classroom.google.com/c/${state.linkedCourseId}/a/${cw.id}/details" target="_blank" rel="noopener noreferrer">Abrir actividad en Google Classroom ↗</a></article>`).join("")}</section>`:""}
 <div class="tabs"><button id="tb1" class="tab active" onclick="showTab('texto')">Texto Básico</button><button id="tb2" class="tab" onclick="showTab('cuaderno')">Cuaderno</button></div>
 <section id="texto" class="reading"><p class="eyebrow">DESARROLLO CONCEPTUAL</p><h2>${s.title}</h2><p>${s.concept}</p><div class="example"><b>Ejemplo cotidiano.</b> ${s.example}</div></section>
 <section id="cuaderno" class="form-card" style="display:none">
 <div class="activity-step"><span>1</span><div><h3>Selección</h3><p>${s.select_q}</p></div></div><textarea id="sel">${ev.selection||""}</textarea>
 <div class="activity-step"><span>2</span><div><h3>Procesamiento</h3><p>${s.process_q}</p></div></div><textarea id="proc">${ev.processing||""}</textarea>
 <div class="activity-step"><span>3</span><div><h3>Transferencia</h3><p>${s.transfer_q}</p></div></div><textarea id="trans">${ev.transfer||""}</textarea>
 <h3>Autoevaluación</h3><div class="score-grid">
 <label>Selección<select id="as"><option>1</option><option>2</option><option selected>3</option><option>4</option></select></label>
 <label>Procesamiento<select id="ap"><option>1</option><option>2</option><option selected>3</option><option>4</option></select></label>
 <label>Transferencia<select id="at"><option>1</option><option>2</option><option selected>3</option><option>4</option></select></label></div>
 <textarea id="refl" placeholder="Reflexión breve">${ev.reflection||""}</textarea><br><button class="primary" onclick="saveEvidence(${s.no})">Guardar evidencia</button> <button class="secondary" onclick="alert('La conexión real con Google Classroom se incorporará después.')">Enviar a Classroom</button></section>`,"","student"))
}
function showTab(id){document.getElementById("texto").style.display=id==="texto"?"block":"none";document.getElementById("cuaderno").style.display=id==="cuaderno"?"grid":"none";document.getElementById("tb1").classList.toggle("active",id==="texto");document.getElementById("tb2").classList.toggle("active",id==="cuaderno")}
function saveEvidence(no){state.evidence[no]={selection:sel.value,processing:proc.value,transfer:trans.value,self:[+as.value,+ap.value,+at.value],reflection:refl.value};save();alert("Evidencia guardada en este navegador.");renderPortfolio()}
function renderPortfolio(){
 let rows=D.sessions.map(s=>{let ev=state.evidence[s.no],r=state.rubrics[s.no];return `<div class="portfolio-row ${ev?"completed":""}" onclick="renderSession(${s.no})"><span>${ev?"✓":s.no}</span><div><small>Semana ${s.week} · Trayecto ${s.trayecto}</small><b>${s.product}</b><em>${s.title}</em></div><strong>${r?`Evaluado ${r.s+r.p+r.t}/12`:(ev?"Guardado":"Pendiente")}</strong></div>`}).join("");
 app(layout(`<div class="topbar"><div><p class="eyebrow">PORTAFOLIO</p><h2>Mi proceso de investigación</h2></div></div>${rows}`,"portfolio","student"))
}

const projectFields=[
 {key:"situation",title:"1. Situación social inicial",source:[1,2,3,4,8],help:"Describe la situación social que origina tu interés investigativo."},
 {key:"problem",title:"2. Problematización y problema",source:[17,18,20],help:"Explica qué tensión, relación o vacío convierte la situación en un problema investigable."},
 {key:"question",title:"3. Pregunta de investigación",source:[19,20],help:"Formula la pregunta central que orientará el proceso."},
 {key:"generalObjective",title:"4. Objetivo general",source:[21],help:"Expresa el propósito central de conocimiento."},
 {key:"specificObjectives",title:"5. Objetivos específicos",source:[22],help:"Desagrega el objetivo general en resultados parciales coherentes."},
 {key:"background",title:"6. Antecedentes y estado de conocimiento",source:[23,24],help:"Sintetiza estudios previos, coincidencias y vacíos."},
 {key:"methodology",title:"7. Estrategia metodológica",source:[25,26],help:"Define el enfoque y las decisiones metodológicas iniciales."},
 {key:"techniques",title:"8. Técnicas e instrumentos",source:[27,28],help:"Selecciona técnicas e instrumentos coherentes con los objetivos."},
 {key:"ethics",title:"9. Consideraciones éticas",source:[29],help:"Define consentimiento, confidencialidad, respeto y cuidado."},
 {key:"fieldwork",title:"10. Trabajo de campo y organización",source:[30,31],help:"Planifica la aproximación al campo y la organización inicial de información."},
 {key:"integration",title:"11. Síntesis del proyecto",source:[32],help:"Integra problema, pregunta, objetivos y metodología en una propuesta coherente."}
];
function esc(s){return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function suggestedText(f){let a=[];f.source.forEach(n=>{let e=state.evidence[n];if(e&&e.transfer&&e.transfer.trim())a.push(e.transfer.trim())});return a.join("\n\n")}
function projectProgress(){let c=projectFields.filter(f=>(state.project[f.key]||"").trim()).length;return {c,total:projectFields.length,pct:Math.round(c/projectFields.length*100)}}
function renderProject(){
 let pg=projectProgress();
 let sections=projectFields.map((f,i)=>{let v=state.project[f.key]||"",sg=suggestedText(f);return `<article class="project-section"><div class="project-head"><div><small>COMPONENTE ${i+1}</small><h3>${f.title}</h3></div><span>${v.trim()?"✓ Integrado":"En construcción"}</span></div><p>${f.help}</p>${sg?`<div class="source-box"><b>Producción recuperable del portafolio</b><p>${esc(sg).slice(0,900)}${sg.length>900?"…":""}</p><button class="secondary" onclick="useSuggestion('${f.key}')">Incorporar producción</button></div>`:"<div class='source-box muted'>Aún no existe una producción vinculada para recuperar.</div>"}<textarea id="proj_${f.key}">${esc(v)}</textarea><button class="primary" onclick="saveProjectField('${f.key}')">Guardar componente</button></article>`}).join("");
 app(layout(`<div class="topbar"><div><p class="eyebrow">PROYECTO DE INVESTIGACIÓN SOCIAL</p><h2>Documento en construcción</h2></div></div><section class="hero"><div><span class="badge">Construcción progresiva</span><h1>Tu investigación crece con cada trayecto</h1><p>Las evidencias producidas durante el curso pueden recuperarse, revisarse y convertirse en partes del proyecto.</p></div><div class="progress"><span>Proyecto integrado</span><b>${pg.c}/${pg.total}</b><div class="bar"><i style="width:${pg.pct}%"></i></div><small>${pg.pct}%</small></div></section><div class="project-actions"><button class="secondary" onclick="autoBuildProject()">Recuperar producciones disponibles</button><button class="secondary" onclick="renderProjectPreview()">Vista integrada</button><button class="primary" onclick="exportProject()">Exportar proyecto</button></div><section class="project-map"><div><b>Trayecto I</b><span>Situación y observación</span></div><i>→</i><div><b>Trayecto II</b><span>Interpretación</span></div><i>→</i><div><b>Trayecto III</b><span>Problema y objetivos</span></div><i>→</i><div><b>Trayecto IV</b><span>Metodología y proyecto</span></div></section>${sections}`,"project","student"))
}
function saveProjectField(k){state.project[k]=document.getElementById("proj_"+k).value;save();renderProject()}
function useSuggestion(k){let f=projectFields.find(x=>x.key===k);state.project[k]=suggestedText(f);save();renderProject()}
function autoBuildProject(){let c=0;projectFields.forEach(f=>{if(!(state.project[f.key]||"").trim()){let s=suggestedText(f);if(s){state.project[f.key]=s;c++}}});save();alert(c?`${c} componente(s) recuperado(s) desde el portafolio.`:"No hay nuevas producciones disponibles.");renderProject()}
function renderProjectPreview(){let pg=projectProgress(),body=projectFields.map(f=>`<section class="preview-section"><h2>${f.title}</h2><p>${esc(state.project[f.key]||"Componente todavía no desarrollado.").replace(/\n/g,"<br>")}</p></section>`).join("");app(layout(`<div class="topbar"><div><p class="eyebrow">VISTA INTEGRADA</p><h2>Proyecto de Investigación Social</h2></div></div><article class="panel project-cover"><span class="badge">Investigación Social I</span><h1>Proyecto formativo de investigación social</h1><p>Documento progresivo construido a partir de las evidencias del curso.</p><p><b>Avance:</b> ${pg.c} de ${pg.total} componentes.</p></article>${body}<div class="project-actions"><button class="secondary" onclick="renderProject()">← Volver a editar</button><button class="primary" onclick="exportProject()">Exportar proyecto</button></div>`,"project","student"))}
function exportProject(){let text="PROYECTO FORMATIVO DE INVESTIGACIÓN SOCIAL\nInvestigación Social I\n\n"+projectFields.map(f=>`${f.title.toUpperCase()}\n${state.project[f.key]||"Componente todavía no desarrollado."}\n`).join("\n");let blob=new Blob([text],{type:"text/plain;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Proyecto_Investigacion_Social.txt";document.body.appendChild(a);a.click();a.remove()}
function loadGoogleIdentity(cb){if(window.google&&google.accounts&&google.accounts.oauth2)return cb();let s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.async=true;s.defer=true;s.onload=cb;document.head.appendChild(s)}
function classroomScope(){
 let extra=state.role==="teacher"
   ?CLASSROOM_CONFIG.TEACHER_COURSEWORK_SCOPE+" "+CLASSROOM_CONFIG.ROSTERS_SCOPE
   :CLASSROOM_CONFIG.STUDENT_COURSEWORK_SCOPE;

 return CLASSROOM_CONFIG.COURSES_SCOPE+" "+extra;
}
function connectClassroom(){loadGoogleIdentity(()=>{let tc=google.accounts.oauth2.initTokenClient({client_id:CLASSROOM_CONFIG.OAUTH_CLIENT_ID,scope:classroomScope(),callback:r=>{if(r.error)return alert("OAuth: "+r.error);googleToken=r.access_token;sessionStorage.setItem("is1_google_token",googleToken);loadCourses()}});tc.requestAccessToken({prompt:"consent"})})}
async function classroomFetch(url){let r=await fetch(url,{headers:{Authorization:"Bearer "+googleToken}});if(r.status===401){googleToken="";sessionStorage.removeItem("is1_google_token");throw new Error("La sesión de Google venció. Vuelve a conectar Classroom.")}let d=await r.json();if(!r.ok)throw new Error(d.error?.message||"Error al consultar Google Classroom.");return d}
async function loadCourses(){try{let d=await classroomFetch("https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=50");state.classroomCourses=d.courses||[];save();renderClassroom()}catch(e){alert(e.message)}}
async function loadCourseWork(){
 if(!state.linkedCourseId)return alert("Primero vincula el curso INVESTIGACION SOCIAL I.");
 try{
   let d=await classroomFetch(
     `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(state.linkedCourseId)}/courseWork?pageSize=100&orderBy=updateTime%20desc`
   );
   state.classroomCourseWork=d.courseWork||[];
   save();
   renderClassroom();
 }catch(e){
   alert(e.message)
 }
}
async function loadStudentSubmissions(){
 if(!state.linkedCourseId)return alert("Primero vincula el curso INVESTIGACION SOCIAL I.");
 try{
   let d=await classroomFetch(
     `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(state.linkedCourseId)}/courseWork/-/studentSubmissions?pageSize=100`
   );
   state.classroomSubmissions=d.studentSubmissions||[];
   save();
   alert(`${state.classroomSubmissions.length} entrega(s) recuperada(s) de Classroom.`);
   renderClassroom();
 }catch(e){
   alert(e.message)
 }
}
async function loadClassroomStudents(){
 if(!state.linkedCourseId)return alert("Primero vincula el curso INVESTIGACION SOCIAL I.");
 try{
   let d=await classroomFetch(
     `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(state.linkedCourseId)}/students?pageSize=100`
   );
   state.classroomStudents=d.students||[];
   save();
   alert(`${state.classroomStudents.length} estudiante(s) recuperado(s) de Classroom.`);
   renderTeacher();
 }catch(e){
   alert(e.message)
 }
}
function linkCourse(id){state.linkedCourseId=id;state.classroomCourseWork=[];save();alert("Curso vinculado con Investigación Social I.");renderClassroom()}
function mapCourseWork(courseWorkId,sessionNo){if(!sessionNo)delete state.classroomMap[courseWorkId];else state.classroomMap[courseWorkId]=Number(sessionNo);save();renderClassroom()}
function sessionOptions(selected){let o=['<option value="">Sin vincular</option>'];D.sessions.forEach(s=>{let q=Number(selected)===s.no?" selected":"";o.push(`<option value="${s.no}"${q}>S${s.no} · ${esc(s.title)}</option>`)});return o.join("")}
function dueText(cw){if(!cw.dueDate)return "Sin fecha de entrega";let d=cw.dueDate;return `Entrega: ${String(d.day).padStart(2,"0")}/${String(d.month).padStart(2,"0")}/${d.year}`}
function courseWorkCard(cw){let m=state.classroomMap[cw.id]||"";return `<article class="coursework-card"><div class="coursework-head"><div><span class="badge">Actividad Classroom</span><h3>${esc(cw.title||"Actividad")}</h3></div><small>${dueText(cw)}</small></div>${cw.description?`<p>${esc(cw.description).replace(/\n/g,"<br>")}</p>`:""}<div class="coursework-meta"><span>Estado: ${esc(cw.state||"")}</span><span>Tipo: ${esc(cw.workType||"")}</span>${cw.maxPoints!=null?`<span>Puntaje: ${cw.maxPoints}</span>`:""}</div><label class="mapping-label">Vincular con sesión<select onchange="mapCourseWork('${cw.id}',this.value)">${sessionOptions(m)}</select></label>${m?`<div class="mapped-note">✓ Vinculada con Sesión ${m}: ${esc(sessionByNo(m).title)}</div>`:""}</article>`}
function renderClassroom(){let courses=state.classroomCourses||[],work=state.classroomCourseWork||[];let courseCards=courses.map(c=>`<article class="course-card"><span class="badge">Classroom</span><h3>${esc(c.name||"Curso")}</h3><p>${esc(c.section||"")}</p><small>ID: ${esc(c.id||"")}</small><button class="primary" onclick="linkCourse('${c.id}')">${state.linkedCourseId===c.id?"✓ Vinculado":"Vincular curso"}</button></article>`).join("");let workCards=work.map(courseWorkCard).join("");let mappedCount=Object.keys(state.classroomMap||{}).filter(id=>work.some(w=>w.id===id)).length;app(layout(`<div class="topbar"><div><p class="eyebrow">INTEGRACIÓN PEDAGÓGICA · V9</p><h2>Google Classroom</h2></div></div><section class="hero"><div><span class="badge">V9 · actividades + sesiones</span><h1>Classroom como capa institucional</h1><p>La plataforma consulta cursos y actividades en modo lectura. Cada actividad puede asociarse con una de las 32 sesiones de Investigación Social I.</p><button class="primary" onclick="connectClassroom()">Conectar / renovar permisos</button>${googleToken?'<button class="secondary" onclick="loadCourses()">Actualizar cursos</button>':''}${state.linkedCourseId&&googleToken?'<button class="secondary" onclick="loadCourseWork()">Leer actividades</button>':''}${state.linkedCourseId&&googleToken?'<button class="secondary" onclick="loadStudentSubmissions()">Leer entregas</button>':''}${state.linkedCourseId&&googleToken?'<button class="secondary" onclick="loadClassroomStudents()">Leer estudiantes</button>':''}</div><div class="progress"><span>Estado</span><b>${googleToken?"Conectado":"Pendiente"}</b><small>${state.linkedCourseId?"Curso vinculado":"Sin curso vinculado"}</small></div></section><article class="panel"><p class="eyebrow">CURSOS ACTIVOS</p><h2>Curso institucional</h2>${courseCards||'<p class="lead">Conecta tu cuenta de Google para consultar cursos activos.</p>'}</article><article class="panel"><div class="section-head"><div><p class="eyebrow">ACTIVIDADES DE CLASSROOM</p><h2>Vinculación con las 32 sesiones</h2></div><span>${mappedCount} vinculada(s)</span></div>${state.linkedCourseId?(workCards||'<p class="lead">Pulsa “Leer actividades” para traer el trabajo de clase del curso vinculado.</p>'):'<p class="lead">Primero vincula INVESTIGACION SOCIAL I.</p>'}</article>`,"classroom",state.role))}
function renderAnalytics(){
 let nums=Object.keys(state.rubrics).map(Number).sort((a,b)=>a-b), av=[0,0,0];
 if(nums.length){nums.forEach(n=>{let r=state.rubrics[n];av[0]+=r.s;av[1]+=r.p;av[2]+=r.t});av=av.map(x=>(x/nums.length).toFixed(2))}
 let min=nums.length?["Selección","Procesamiento","Transferencia"][av.map(Number).indexOf(Math.min(...av.map(Number)))]:"Sin datos";
 let rows=nums.map(n=>{let r=state.rubrics[n];return `<div class="compare-row"><b>Sesión ${n}</b><span>S ${r.s}/4 · P ${r.p}/4 · T ${r.t}/4</span><span>Total ${r.s+r.p+r.t}/12</span></div>`}).join("");
 app(layout(`<div class="topbar"><div><p class="eyebrow">ANALÍTICA LONGITUDINAL</p><h2>Mi evolución</h2></div></div><div class="stats"><article><span>Selección</span><b>${av[0]}/4</b></article><article><span>Procesamiento</span><b>${av[1]}/4</b></article><article><span>Transferencia</span><b>${av[2]}/4</b></article></div><div class="panel"><h2>Dimensión a fortalecer</h2><div class="alert-row">${min}</div></div><div class="panel"><h2>Evolución por sesión</h2>${rows||'<p class="lead">Aún no hay valoraciones docentes.</p>'}</div>`,"analytics","student"))
}
function classroomActivitySummary(){
 let submissions=state.classroomSubmissions||[];
 let work=state.classroomCourseWork||[];

 return work.map(cw=>{
   let subs=submissions.filter(s=>String(s.courseWorkId)===String(cw.id));
   let delivered=subs.filter(s=>
     s.state==="TURNED_IN" || s.state==="RETURNED"
   ).length;

   let pending=subs.length-delivered;
   let sessionNo=state.classroomMap[cw.id]||"";

   return {
     id:cw.id,
     title:cw.title||"Actividad",
     sessionNo,
     total:subs.length,
     delivered,
     pending
   };
 });
}
function renderTeacher(){
  let classroomStudents=state.classroomStudents||[];
let classroomStudentRows=classroomStudents.map(st=>{
  let name=st.profile?.name?.fullName||"Estudiante";
  let userId=st.userId||st.profile?.id||"";
  return `<div class="classroom-student-row">
    <div>
      <small>ESTUDIANTE</small>
      <b>${esc(name)}</b>
    </div>
    <div>
      <small>ID CLASSROOM</small>
      <span>${esc(userId)}</span>
    </div>
  </div>`;
}).join("");
  let classroomMatrix=classroomStudents.map(st=>{
  let userId=st.userId||st.profile?.id||"";
  let name=st.profile?.name?.fullName||"Estudiante";

  let sessions=D.sessions.map(s=>{
    let no=s.no;

let courseWorkIds=Object.keys(state.classroomMap||{}).filter(
  id=>Number(state.classroomMap[id])===no
);

let submission=(state.classroomSubmissions||[]).find(
  sub=>String(sub.userId)===String(userId) &&
       courseWorkIds.some(
         id=>String(sub.courseWorkId)===String(id)
       )
);

    return {
      session:no,
      trajectory:s.trayecto,
      week:s.week,
      title:s.title,
      state:submission?.state||"SIN_REGISTRO"
    };
  });

  return {
    userId,
    name,
    sessions
  };
});
let trajectoryMatrices=[1,2,3,4].map(trayecto=>{
  let start=(trayecto-1)*8+1;
  let end=trayecto*8;

  let rows=classroomMatrix.map(st=>{
    let cells=st.sessions
      .filter(s=>s.trajectory===trayecto)
      .map(s=>{
        let label="Sin actividad";
        let cls="matrix-none";

        if(s.state==="CREATED"){
          label="Pendiente";
          cls="matrix-pending";
        }else if(s.state==="TURNED_IN"){
          label="Entregada";
          cls="matrix-turned";
        }else if(s.state==="RETURNED"){
          label="Devuelta";
          cls="matrix-returned";
        }else if(s.state==="RECLAIMED_BY_STUDENT"){
          label="Retirada";
          cls="matrix-reclaimed";
        }

let rubric=getStudentRubric(st.userId,s.session);

let pedagogicalLabel="Sin valorar";

if(rubric.evaluated){
  let total=
    Number(rubric.selection||0)+
    Number(rubric.processing||0)+
    Number(rubric.transfer||0);

  pedagogicalLabel=`Valorada ${total}/12`;
}
let pedagogicalClass=rubric.evaluated
  ?"matrix-evaluated"
  :"matrix-not-evaluated";
return `<button class="matrix-cell ${cls} ${pedagogicalClass}"
  onclick="openStudentSession('${st.userId}',${s.session})">
  <small>S${s.session}</small>
  <span>${label}</span>
  <em>${pedagogicalLabel}</em>
</button>`;
      }).join("");

    return `<div class="matrix-student-row">
      <div class="matrix-student-name">${esc(st.name)}</div>
      <div class="matrix-session-cells">${cells}</div>
    </div>`;
  }).join("");

  return `<details class="panel trajectory-panel" ${trayecto===1?"open":""}>
  <summary class="trajectory-summary">
    <div>
      <p class="eyebrow">MATRIZ DE SEGUIMIENTO</p>
      <h2>Trayecto ${trayecto} · Sesiones ${start} a ${end}</h2>
    </div>
    <span class="trajectory-toggle">Ver seguimiento</span>
  </summary>

  <div class="trajectory-content">
    ${rows||'<p class="lead">Aún no existen datos para construir la matriz.</p>'}
  </div>
</details>`;
}).join("");
let evNums=Object.keys(state.evidence).map(Number).sort((a,b)=>a-b);
 let rs=Object.values(state.rubrics), av=[0,0,0];
 if(rs.length){
   rs.forEach(r=>{
     av[0]+=r.s;
     av[1]+=r.p;
     av[2]+=r.t
   });
   av=av.map(x=>(x/rs.length).toFixed(2))
 }

 let alerts=[];
 evNums.forEach(n=>{
   let r=state.rubrics[n];
   if(r){
     if(r.s<2.5)alerts.push(`Sesión ${n}: Selección requiere refuerzo.`);
     if(r.p<2.5)alerts.push(`Sesión ${n}: Procesamiento requiere refuerzo.`);
     if(r.t<2.5)alerts.push(`Sesión ${n}: Transferencia requiere refuerzo.`)
   }
 });

 let rows=evNums.map(n=>
   `<div class="evidence-row">
      <b>Sesión ${n} · ${sessionByNo(n).title}</b>
      <button class="secondary" onclick="reviewEvidence(${n})">Revisar</button>
    </div>`
 ).join("");

 let submissions=state.classroomSubmissions||[];

 let classroomStudentCount=
   new Set(submissions.map(s=>s.userId).filter(Boolean)).size;

 let classroomActivities=
   new Set(submissions.map(s=>s.courseWorkId).filter(Boolean)).size;

 let classroomDelivered=
   submissions.filter(s=>s.state==="TURNED_IN"||s.state==="RETURNED").length;

 let classroomPending=
   submissions.length-classroomDelivered;
let activitySummary=classroomActivitySummary();
let activityRows=activitySummary
  .sort((a,b)=>(Number(a.sessionNo)||999)-(Number(b.sessionNo)||999))
  .map(a=>{
    let sessionTitle=a.sessionNo
      ?esc(sessionByNo(a.sessionNo)?.title||"Sesión")
      :"Sin sesión vinculada";

    let classroomTitle=esc(a.title||"Actividad");

    return `<div class="classroom-activity-row">
      <div>
        <small>${a.sessionNo?`SESIÓN ${a.sessionNo}`:"SIN VINCULAR"}</small>
        <b>${sessionTitle}</b>
        <em>Actividad Classroom: ${classroomTitle}</em>
      </div>
      <div>
        <strong>${a.total} estudiantes</strong><br>
        <span>${a.delivered} entregada(s) · ${a.pending} pendiente(s)</span>
      </div>
    </div>`;
  }).join("");

 app(layout(`
   <div class="topbar">
     <div>
       <p class="eyebrow">PANEL DOCENTE</p>
       <h2>Seguimiento pedagógico</h2>
     </div>
   </div>
<div class="panel">
  <p class="eyebrow">ESTUDIANTES DE CLASSROOM</p>
  <h2>Lista de estudiantes</h2>
  ${classroomStudentRows||'<p class="lead">Aún no se recuperaron estudiantes desde Classroom.</p>'}
</div>
<div class="panel">
  <p class="eyebrow">MATRIZ DE SEGUIMIENTO</p>
  <h2>Trayecto I · Sesiones 1 a 8</h2>
${trajectoryMatrices}
   <div class="panel">
  <p class="eyebrow">SEGUIMIENTO POR ACTIVIDAD</p>
  <h2>Actividades de Classroom</h2>
  ${activityRows||'<p class="lead">Aún no hay actividades sincronizadas.</p>'}
</div>

<div class="stats">
  <article>
    <span>Estudiantes</span>
    <b>${classroomStudentCount}</b>
  </article>

  <article>
    <span>Actividades</span>
    <b>${classroomActivities}</b>
  </article>

  <article>
    <span>Entregadas</span>
    <b>${classroomDelivered}</b>
  </article>

  <article>
    <span>Pendientes</span>
    <b>${classroomPending}</b>
  </article>
</div>

     ${submissions.length
       ?`<p class="lead">${submissions.length} registros sincronizados desde Google Classroom.</p>`
       :`<p class="lead">Pulsa “Leer entregas” en Google Classroom para actualizar el seguimiento.</p>`
     }
   </div>

   <div class="stats">
     <article>
       <span>Selección</span>
       <b>${av[0]}/4</b>
     </article>

     <article>
       <span>Procesamiento</span>
       <b>${av[1]}/4</b>
     </article>

     <article>
       <span>Transferencia</span>
       <b>${av[2]}/4</b>
     </article>
   </div>

   <div class="panel">
     <h2>Alertas</h2>
     ${alerts.map(a=>`<div class="alert-row">${a}</div>`).join("")||
       '<p class="lead">Sin alertas todavía.</p>'}
   </div>

   <div class="panel">
     <h2>Evidencias</h2>
     ${rows||'<p class="lead">Aún no hay evidencias.</p>'}
   </div>
 `,"teacher","teacher"))
}
function openStudentSession(userId,sessionNo){
  let student=(state.classroomStudents||[]).find(
    st=>String(st.userId||st.profile?.id)===String(userId)
  );

  let session=sessionByNo(sessionNo);

  let courseWorkIds=Object.keys(state.classroomMap||{}).filter(
    id=>Number(state.classroomMap[id])===Number(sessionNo)
  );

  let submission=(state.classroomSubmissions||[]).find(
    sub=>String(sub.userId)===String(userId) &&
         courseWorkIds.some(
           id=>String(sub.courseWorkId)===String(id)
         )
  );

  let name=student?.profile?.name?.fullName||"Estudiante";

  let status="Sin actividad";

  if(submission?.state==="CREATED")status="Pendiente";
  else if(submission?.state==="TURNED_IN")status="Entregada";
  else if(submission?.state==="RETURNED")status="Devuelta";
  else if(submission?.state==="RECLAIMED_BY_STUDENT")status="Retirada";

  app(layout(`
    <div class="topbar">
      <div>
        <p class="eyebrow">SEGUIMIENTO INDIVIDUAL</p>
        <h2>${esc(name)}</h2>
      </div>
    </div>

    <div class="panel">
      <p class="eyebrow">SESIÓN ${sessionNo}</p>
      <h2>${esc(session?.title||"Sesión")}</h2>

      <div class="stats">
        <article>
          <span>Estado Classroom</span>
          <b>${status}</b>
        </article>

        <article>
          <span>Trayecto</span>
          <b>${session?.trayecto||"-"}</b>
        </article>

        <article>
          <span>Sesión</span>
          <b>S${sessionNo}</b>
        </article>
      </div>
    </div>

    <div class="panel">
  <h2>Seguimiento pedagógico</h2>

  ${(()=>{
    let r=getStudentRubric(userId,sessionNo);

    return `
      <div class="score-grid">
        <label>
          Selección
          <select id="student_rs">
  <option value="0" ${r.selection===0?"selected":""}>Sin valorar</option>
  <option value="1" ${r.selection===1?"selected":""}>1</option>
  <option value="2" ${r.selection===2?"selected":""}>2</option>
  <option value="3" ${r.selection===3?"selected":""}>3</option>
  <option value="4" ${r.selection===4?"selected":""}>4</option>
</select>
        </label>

        <label>
          Procesamiento
          <select id="student_rs">
  <option value="0" ${r.selection===0?"selected":""}>Sin valorar</option>
  <option value="1" ${r.selection===1?"selected":""}>1</option>
  <option value="2" ${r.selection===2?"selected":""}>2</option>
  <option value="3" ${r.selection===3?"selected":""}>3</option>
  <option value="4" ${r.selection===4?"selected":""}>4</option>
</select>
        </label>

        <label>
          Transferencia
          <<select id="student_rs">
  <option value="0" ${r.selection===0?"selected":""}>Sin valorar</option>
  <option value="1" ${r.selection===1?"selected":""}>1</option>
  <option value="2" ${r.selection===2?"selected":""}>2</option>
  <option value="3" ${r.selection===3?"selected":""}>3</option>
  <option value="4" ${r.selection===4?"selected":""}>4</option>
</select>
        </label>
      </div>

      <label style="display:block;margin-top:18px">
        <b>Observación docente</b>
        <textarea id="student_rc"
          style="width:100%;min-height:110px;margin-top:8px"
          placeholder="Registre observaciones sobre el proceso de aprendizaje.">${esc(r.comment||"")}</textarea>
      </label>

      <div style="margin-top:16px">
        <button class="primary"
          onclick="saveStudentRubric('${userId}',${sessionNo})">
          Guardar valoración
        </button>
      </div>
    `;
  })()}
</div>

    <button class="secondary" onclick="renderTeacher()">
      ← Volver al Panel docente
    </button>
  `,"teacher","teacher"));
}
function reviewEvidence(no){
 let e=state.evidence[no],r=state.rubrics[no]||{s:3,p:3,t:3,comment:""},s=sessionByNo(no);
 app(layout(`<div class="topbar"><div><p class="eyebrow">RÚBRICA DOCENTE</p><h2>Sesión ${no}</h2></div></div><div class="panel"><h3>${s.title}</h3><p><b>Selección:</b> ${e.selection}</p><p><b>Procesamiento:</b> ${e.processing}</p><p><b>Transferencia:</b> ${e.transfer}</p><p><b>Autoevaluación:</b> ${e.self?e.self.join(" / "):"Sin registro"}</p></div><div class="panel"><h2>Valoración docente</h2><div class="score-grid"><label>Selección<select id="rs">${[1,2,3,4].map(x=>`<option ${x==r.s?"selected":""}>${x}</option>`).join("")}</select></label><label>Procesamiento<select id="rp">${[1,2,3,4].map(x=>`<option ${x==r.p?"selected":""}>${x}</option>`).join("")}</select></label><label>Transferencia<select id="rt">${[1,2,3,4].map(x=>`<option ${x==r.t?"selected":""}>${x}</option>`).join("")}</select></label></div><textarea id="rc" style="width:100%;min-height:100px;margin-top:10px">${r.comment||""}</textarea><br><button class="primary" onclick="saveRubric(${no})">Guardar rúbrica</button></div>`,"teacher","teacher"))
}
function saveStudentRubric(userId,sessionNo){
  let key=studentRubricKey(userId,sessionNo);

  let selection=+document.getElementById("student_rs").value;
let processing=+document.getElementById("student_rp").value;
let transfer=+document.getElementById("student_rt").value;

state.studentRubrics[key]={
  selection,
  processing,
  transfer,
  comment:document.getElementById("student_rc").value,
  evaluated:selection>0 && processing>0 && transfer>0
};

  save();

  alert("Valoración individual guardada.");

  openStudentSession(userId,sessionNo);
}
function saveRubric(no){state.rubrics[no]={s:+rs.value,p:+rp.value,t:+rt.value,comment:rc.value};save();alert("Rúbrica guardada.");renderTeacher()}
if(!state.role)login();else state.role==="teacher"?renderTeacher():renderHome();
