// --- Datos por disciplina (cada una con su propio estado, independiente) ---
const disciplinas = {
  hombres: {
    titulo: 'Fútbol Hombres',
    numGrupos: 3,
    equipos: ['Torre de Control','Pista Norte','Radar 1','Escuadrón Sur','Los Pilotos','Aeroclub','Turbina FC','Vuelo 502']
  },
  mujeres: {
    titulo: 'Fútbol Mujeres',
    numGrupos: 1,
    equipos: ['Las Controladoras','Vuelo Rosa','Torre Femenina']
  },
  basquet: {
    titulo: 'Básquet Mixto',
    numGrupos: 3,
    equipos: ['Rebote DGAC','Los Altos','Canasta Aérea','Base Norte','Triple A','Zona Pintada','Salto Alto','Aro 80']
  },
  voley: {
    titulo: 'Ecuavoley',
    numGrupos: 3,
    equipos: ['Bloqueo Total','Remate DAC','Saque Alto','Red Sur','Los Rematadores','Ace Aéreo','Cancha Norte','Voley 80']
  }
};

const STORAGE_KEY = 'dgac_estado_disciplinas';

function guardarEstado(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(disciplinas));
}

function cargarEstado(){
  const guardado = localStorage.getItem(STORAGE_KEY);
  if(!guardado) return; // primera vez que se abre, no hay nada guardado todavía

  const datosGuardados = JSON.parse(guardado);
  // Solo sobreescribimos las disciplinas que ya conocemos (hombres, mujeres, etc.)
  Object.keys(datosGuardados).forEach(clave => {
    if(disciplinas[clave]){
      disciplinas[clave] = datosGuardados[clave];
    }
  });
}

let disciplinaActual = 'hombres';

function seleccionarDisciplina(clave, navegar){
  if(navegar === undefined) navegar = true;
  disciplinaActual = clave;
  const d = disciplinas[clave];
  document.getElementById('titulo-sorteo').textContent = 'Sorteo de equipos — ' + d.titulo;

  // Si esta disciplina aún no tiene grupos creados (primera vez), los inicializamos vacíos
  if(!d.grupos){
    d.grupos = [];
    for(let i=0; i<d.numGrupos; i++){ d.grupos.push([]); }
  }

  // Armamos un mapa: qué equipos ya están sorteados y en qué grupo
  const asignados = {};
  d.grupos.forEach((grupoArray, idx) => {
    grupoArray.forEach(nombre => { asignados[nombre] = idx + 1; });
  });

  // Reconstruir lista de pendientes/sorteados respetando el estado real
  const listaUl = document.getElementById('lista-equipos');
  listaUl.innerHTML = '';
  d.equipos.forEach(nombre => {
    const li = document.createElement('li');
    li.dataset.nombre = nombre;

    const span = document.createElement('span');
    span.textContent = nombre;
    li.appendChild(span);

    if(asignados[nombre]){
      li.classList.add('asignado');
      const etiqueta = document.createElement('span');
      etiqueta.className = 'etiqueta-grupo';
      etiqueta.textContent = 'Grupo ' + asignados[nombre];
      li.appendChild(etiqueta);
    } else {
      // Solo los equipos SIN sortear se pueden editar o eliminar
      const btnEditar = document.createElement('button');
      btnEditar.textContent = '✏️';
      btnEditar.title = 'Renombrar';
      btnEditar.onclick = () => editarEquipo(nombre);
      li.appendChild(btnEditar);

      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = '🗑️';
      btnEliminar.title = 'Eliminar';
      btnEliminar.onclick = () => eliminarEquipo(nombre);
      li.appendChild(btnEliminar);
    }

    listaUl.appendChild(li);
  });

  // Reconstruir cajas de grupos
  const cont = document.querySelector('.grupos-sorteo');
  cont.innerHTML = '';
  cont.style.gridTemplateColumns = 'repeat(' + d.numGrupos + ', 1fr)';
  for(let i=1; i<=d.numGrupos; i++){
    const box = document.createElement('div');
    box.className = 'grupo-box';
    box.innerHTML = '<h3>GRUPO ' + i + '</h3><ul id="g' + i + '" class="grupo-ul"></ul>';
    cont.appendChild(box);
  }

  // Rellenar cada grupo con los equipos que YA estaban guardados en d.grupos
  d.grupos.forEach((grupoArray, idx) => {
    const grupoUl = document.getElementById('g' + (idx + 1));
    grupoArray.forEach((nombre, pos) => {
      const li = document.createElement('li');
      li.innerHTML = '<b>' + (pos + 1) + '</b>' + nombre;
      grupoUl.appendChild(li);
    });
  });

  if(navegar) ir(1);
}

// --- Sorteo verdaderamente aleatorio, sin patrón fijo ---
function sortearUno(){
  const d = disciplinas[disciplinaActual];

  // Determinamos los pendientes comparando contra los DATOS (d.grupos), no contra el HTML.
  // Esto evita que un equipo aparezca "pendiente" en la pantalla pero ya esté sorteado en los datos, o viceversa.
  const yaAsignados = new Set(d.grupos.flat());
  const pendientes = d.equipos.filter(nombre => !yaAsignados.has(nombre));

  if(pendientes.length === 0){
    alert('Ya no quedan equipos por sortear.');
    return;
  }

  // Elegimos un equipo al azar entre los pendientes
  const nombre = pendientes[Math.floor(Math.random() * pendientes.length)];

  // Buscamos el tamaño más chico entre TODOS los grupos ahora mismo
  const minTamano = Math.min(...d.grupos.map(g => g.length));

  // Solo los grupos que tienen ese tamaño mínimo son candidatos a recibir el próximo equipo
  const candidatos = [];
  d.grupos.forEach((grupoArray, idx) => {
    if(grupoArray.length === minTamano) candidatos.push(idx);
  });

  // Sorteamos SOLO entre esos grupos "más vacíos"
  const grupoIdxCero = candidatos[Math.floor(Math.random() * candidatos.length)];
  d.grupos[grupoIdxCero].push(nombre);

  guardarEstado();

  // Redibujamos TODO desde los datos (esto automáticamente quita los botones editar/eliminar
  // del equipo recién sorteado, porque el render solo los pone en equipos SIN asignar).
  seleccionarDisciplina(disciplinaActual, false);
}

function rehacerSorteo(){
  const d = disciplinas[disciplinaActual];

  const confirmar = confirm(
    '¿Seguro que quieres rehacer el sorteo de "' + d.titulo + '"?\n' +
    'Todos los equipos volverán a la lista de pendientes. Los equipos NO se eliminan, solo se desasignan de sus grupos.'
  );
  if(!confirmar) return;

  // Reiniciamos los grupos a vacío, respetando el número de grupos de esta disciplina
  d.grupos = [];
  for(let i=0; i<d.numGrupos; i++){
    d.grupos.push([]);
  }

  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false); // redibuja todo: equipos vuelven a "pendientes"
}

function agregarEquipo(){
  const input = document.getElementById('nuevo-equipo');
  const nombre = input.value.trim();
  if(!nombre) return;

  const d = disciplinas[disciplinaActual];
  if(d.equipos.includes(nombre)){
    alert('Ya existe un equipo con ese nombre.');
    return;
  }

  d.equipos.push(nombre);   // 👈 esta línea es la que faltaba: ahora sí queda guardado
  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false); // re-dibuja la lista con el nuevo equipo
  input.value = '';
}

function editarEquipo(nombreActual){
  const nuevoNombre = prompt('Nuevo nombre para el equipo:', nombreActual);
  if(!nuevoNombre || !nuevoNombre.trim()) return;
  const nombreLimpio = nuevoNombre.trim();

  const d = disciplinas[disciplinaActual];
  if(d.equipos.includes(nombreLimpio)){
    alert('Ya existe un equipo con ese nombre.');
    return;
  }

  const idx = d.equipos.indexOf(nombreActual);
  if(idx !== -1) d.equipos[idx] = nombreLimpio;

  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
}

function eliminarEquipo(nombre){
  if(!confirm('¿Eliminar el equipo "' + nombre + '"?')) return;

  const d = disciplinas[disciplinaActual];
  const idx = d.equipos.indexOf(nombre);
  if(idx !== -1) d.equipos.splice(idx, 1);

  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
}

function ir(i, btn){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('s'+i).classList.add('active');
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  if(btn){btn.classList.add('active');}
  else{document.querySelectorAll('nav button')[i].classList.add('active');}
}

cargarEstado();
seleccionarDisciplina('hombres', false);
ir(0);