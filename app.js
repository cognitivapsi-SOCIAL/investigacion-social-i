const CLASSROOM_CONFIG={OAUTH_CLIENT_ID:"",SCOPE:"https://www.googleapis.com/auth/classroom.courses.readonly"};
let googleToken=sessionStorage.getItem("is1_google_token")||"";

const D=window.APP_DATA;
let state=JSON.parse(localStorage.getItem("is1_portable_state")||'{"role":null,"evidence":{},"rubrics":{},"project":{}}');
state.evidence=state.evidence||{}; state.rubrics=state.rubrics||{}; state.project=state.project||{};
function save(){localStorage.setItem("is1_portable_state",JSON.stringify(state))}
function app(html){document.getElementById("app").innerHTML=html}
function sessionByNo(n){return D.sessions.find(s=>s.no===Number(n))}
function layout(content,active="inicio",role=state.role){
  return `<div class="layout"><aside class="sidebar"><div class="brand"><div class="logo">IS</div><div><strong>Investigación Social I</strong><small>Portable · sin instalación</small></div></div>
  <button class="nav ${active==="inicio"?"active":""}" onclick="renderHome()">Inicio</button>
  ${role==="student"?`<button class="nav ${active==="portfolio"?"active":""}" onclick="renderPortfolio()">Mi portafolio</button><button class="nav ${active==="project"?"active":""}" onclick="renderProject()">Mi proyecto</button><button class="nav ${active==="analytics"?"active":""}" onclick="renderAnalytics()">Mi evolución</button><button class="nav ${active==="classroom"?"active":""}" onclick="renderClassroom()">Google Classroom</button>`:""}
  ${role==="teacher"?`<button class="nav ${active==="teacher"?"active":""}" onclick="renderTeacher()">Panel docente</button>`:""}
  <div style="margin-top:auto"><button class="nav" onclick="logout()">Cambiar perfil</button></div></aside>
  <main class="main">${content}</main></div>`
}
function login(){
 app(`<div class="login"><div class="loginbox"><section class="intro"><span class="badge">UMSS · Trabajo Social</span><h1>Investigación Social I</h1><p>Versión portable. No necesita Python, Flask ni instalación. Todo se guarda en este navegador.</p></section><section class="access"><h2>Ingresar</h2><p class="small">Elija un perfil de demostración.</p><button class="role-btn" onclick="chooseRole('student')"><b>Estudiante</b><br><span class="small">Sesiones, cuaderno, portafolio y evolución</span></button><button class="role-btn" onclick="chooseRole('teacher')"><b>Docente</b><br><span class="small">Evidencias, rúbricas y alertas</span></button></section></div></div>`)
}
function chooseRole(r){state.role=r;save();r==="teacher"?renderTeacher():renderHome()}
function logout(){state.role=null;save();login()}
function renderHome(){
 let done=Object.keys(state.evidence).length, pct=Math.round(done/32*100);
 let trs=[1,2,3,4].map(t=>`<article class="trajectory"><h3>Trayecto ${t}</h3><div class="session-grid">${D.sessions.filter(s=>s.trayecto===t).map(s=>`<div class="session-card" onclick="renderSession(${s.no})"><span>Semana ${s.week} · Sesión ${s.no}</span><b>${s.title}</b><small>${s.product}</small></div>`).join("")}</div></article>`).join("");
 app(layout(`<div class="topbar"><div><p class="eyebrow">PLATAFORMA DE APRENDIZAJE</p><h2>Inicio</h2></div><div class="user">Estudiante demo</div></div><section class="hero"><div><span class="badge">32 sesiones</span><h1>Aprender a investigar investigando</h1><p>Texto básico, ejemplo cotidiano, microciclo y portafolio.</p><button class="primary" onclick="renderSession(1)">Abrir Sesión 1</button> <button class="secondary" onclick="renderProject()">Ver mi proyecto</button></div><div class="progress"><span>Progreso</span><b>${done}/32</b><div class="bar"><i style="width:${pct}%"></i></div><small>${pct}% completado</small></div></section><section>${trs}</section>`,"inicio","student"))
}
function renderSession(no){
 const s=sessionByNo(no), ev=state.evidence[no]||{};
 app(layout(`<div class="topbar"><div><p class="eyebrow">TRAYECTO ${s.trayecto} · SEMANA ${s.week}</p><h2>Sesión ${s.no}</h2></div></div>
 <section class="session-hero"><span class="badge">90 minutos</span><h1>${s.title}</h1><p><b>Propósito:</b> ${s.purpose}</p><p><b>Producto:</b> ${s.product}</p></section>
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
function connectClassroom(){if(!CLASSROOM_CONFIG.OAUTH_CLIENT_ID){alert("Falta colocar el ID de cliente OAuth después de obtener la URL de Cloud Run.");return}loadGoogleIdentity(()=>{let tc=google.accounts.oauth2.initTokenClient({client_id:CLASSROOM_CONFIG.OAUTH_CLIENT_ID,scope:CLASSROOM_CONFIG.SCOPE,callback:r=>{if(r.error)return alert("OAuth: "+r.error);googleToken=r.access_token;sessionStorage.setItem("is1_google_token",googleToken);loadCourses()}});tc.requestAccessToken({prompt:"consent"})})}
async function loadCourses(){try{let r=await fetch("https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=50",{headers:{Authorization:"Bearer "+googleToken}}),d=await r.json();if(!r.ok)throw new Error(d.error?.message||"No se pudieron consultar los cursos.");state.classroomCourses=d.courses||[];save();renderClassroom()}catch(e){alert(e.message)}}
function renderClassroom(){let cs=state.classroomCourses||[],cards=cs.map(c=>`<article class="course-card"><span class="badge">Classroom</span><h3>${c.name||"Curso"}</h3><p>${c.section||""}</p><button class="primary" onclick="linkCourse('${c.id}')">${state.linkedCourseId===c.id?"✓ Vinculado":"Vincular curso"}</button></article>`).join("");app(layout(`<div class="topbar"><div><p class="eyebrow">INTEGRACIÓN</p><h2>Google Classroom</h2></div></div><section class="hero"><div><span class="badge">V8</span><h1>Conectar el curso institucional</h1><p>Esta primera integración solo consulta cursos activos; no modifica tareas ni calificaciones.</p><button class="primary" onclick="connectClassroom()">Conectar con Google Classroom</button></div><div class="progress"><span>Estado</span><b>${googleToken?"Conectado":"Pendiente"}</b></div></section><article class="panel"><h2>Cursos activos</h2>${cards||'<p class="lead">Conecta tu cuenta para consultar tus cursos.</p>'}</article>`,"classroom","student"))}
function linkCourse(id){state.linkedCourseId=id;save();alert("Curso vinculado con Investigación Social I.");renderClassroom()}

function renderAnalytics(){
 let nums=Object.keys(state.rubrics).map(Number).sort((a,b)=>a-b), av=[0,0,0];
 if(nums.length){nums.forEach(n=>{let r=state.rubrics[n];av[0]+=r.s;av[1]+=r.p;av[2]+=r.t});av=av.map(x=>(x/nums.length).toFixed(2))}
 let min=nums.length?["Selección","Procesamiento","Transferencia"][av.map(Number).indexOf(Math.min(...av.map(Number)))]:"Sin datos";
 let rows=nums.map(n=>{let r=state.rubrics[n];return `<div class="compare-row"><b>Sesión ${n}</b><span>S ${r.s}/4 · P ${r.p}/4 · T ${r.t}/4</span><span>Total ${r.s+r.p+r.t}/12</span></div>`}).join("");
 app(layout(`<div class="topbar"><div><p class="eyebrow">ANALÍTICA LONGITUDINAL</p><h2>Mi evolución</h2></div></div><div class="stats"><article><span>Selección</span><b>${av[0]}/4</b></article><article><span>Procesamiento</span><b>${av[1]}/4</b></article><article><span>Transferencia</span><b>${av[2]}/4</b></article></div><div class="panel"><h2>Dimensión a fortalecer</h2><div class="alert-row">${min}</div></div><div class="panel"><h2>Evolución por sesión</h2>${rows||'<p class="lead">Aún no hay valoraciones docentes.</p>'}</div>`,"analytics","student"))
}
function renderTeacher(){
 let evNums=Object.keys(state.evidence).map(Number).sort((a,b)=>a-b);
 let rs=Object.values(state.rubrics), av=[0,0,0]; if(rs.length){rs.forEach(r=>{av[0]+=r.s;av[1]+=r.p;av[2]+=r.t});av=av.map(x=>(x/rs.length).toFixed(2))}
 let alerts=[];evNums.forEach(n=>{let r=state.rubrics[n];if(r){if(r.s<2.5)alerts.push(`Sesión ${n}: Selección requiere refuerzo.`);if(r.p<2.5)alerts.push(`Sesión ${n}: Procesamiento requiere refuerzo.`);if(r.t<2.5)alerts.push(`Sesión ${n}: Transferencia requiere refuerzo.`)}})
 let rows=evNums.map(n=>`<div class="evidence-row"><b>Sesión ${n} · ${sessionByNo(n).title}</b><button class="secondary" onclick="reviewEvidence(${n})">Revisar</button></div>`).join("");
 app(layout(`<div class="topbar"><div><p class="eyebrow">PANEL DOCENTE</p><h2>Seguimiento pedagógico</h2></div></div><div class="stats"><article><span>Selección</span><b>${av[0]}/4</b></article><article><span>Procesamiento</span><b>${av[1]}/4</b></article><article><span>Transferencia</span><b>${av[2]}/4</b></article></div><div class="panel"><h2>Alertas</h2>${alerts.map(a=>`<div class="alert-row">${a}</div>`).join("")||'<p class="lead">Sin alertas todavía.</p>'}</div><div class="panel"><h2>Evidencias</h2>${rows||'<p class="lead">Aún no hay evidencias.</p>'}</div>`,"teacher","teacher"))
}
function reviewEvidence(no){
 let e=state.evidence[no],r=state.rubrics[no]||{s:3,p:3,t:3,comment:""},s=sessionByNo(no);
 app(layout(`<div class="topbar"><div><p class="eyebrow">RÚBRICA DOCENTE</p><h2>Sesión ${no}</h2></div></div><div class="panel"><h3>${s.title}</h3><p><b>Selección:</b> ${e.selection}</p><p><b>Procesamiento:</b> ${e.processing}</p><p><b>Transferencia:</b> ${e.transfer}</p><p><b>Autoevaluación:</b> ${e.self?e.self.join(" / "):"Sin registro"}</p></div><div class="panel"><h2>Valoración docente</h2><div class="score-grid"><label>Selección<select id="rs">${[1,2,3,4].map(x=>`<option ${x==r.s?"selected":""}>${x}</option>`).join("")}</select></label><label>Procesamiento<select id="rp">${[1,2,3,4].map(x=>`<option ${x==r.p?"selected":""}>${x}</option>`).join("")}</select></label><label>Transferencia<select id="rt">${[1,2,3,4].map(x=>`<option ${x==r.t?"selected":""}>${x}</option>`).join("")}</select></label></div><textarea id="rc" style="width:100%;min-height:100px;margin-top:10px">${r.comment||""}</textarea><br><button class="primary" onclick="saveRubric(${no})">Guardar rúbrica</button></div>`,"teacher","teacher"))
}
function saveRubric(no){state.rubrics[no]={s:+rs.value,p:+rp.value,t:+rt.value,comment:rc.value};save();alert("Rúbrica guardada.");renderTeacher()}
if(!state.role)login();else state.role==="teacher"?renderTeacher():renderHome();
