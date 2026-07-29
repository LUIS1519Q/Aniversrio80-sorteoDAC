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

let disciplinaActual = 'hombres';

function seleccionarDisciplina(clave, navegar){
  if(navegar === undefined) navegar = true;
  disciplinaActual = clave;
  const d = disciplinas[clave];
  document.getElementById('titulo-sorteo').textContent = 'Sorteo de equipos — ' + d.titulo;

  // Reconstruir lista de pendientes, limpia, sin sorteos previos
  const listaUl = document.getElementById('lista-equipos');
  listaUl.innerHTML = '';
  d.equipos.forEach(nombre => {
    const li = document.createElement('li');
    li.dataset.nombre = nombre;
    li.textContent = nombre;
    listaUl.appendChild(li);
  });

  // Reconstruir cajas de grupos según numGrupos de la disciplina
  const cont = document.querySelector('.grupos-sorteo');
  cont.innerHTML = '';
  cont.style.gridTemplateColumns = 'repeat(' + d.numGrupos + ', 1fr)';
  for(let i=1; i<=d.numGrupos; i++){
    const box = document.createElement('div');
    box.className = 'grupo-box';
    box.innerHTML = '<h3>GRUPO ' + i + '</h3><ul id="g' + i + '" class="grupo-ul"></ul>';
    cont.appendChild(box);
  }

  if(navegar) ir(1);
}

// --- Sorteo verdaderamente aleatorio, sin patrón fijo ---
function sortearUno(){
  const pendientes = document.querySelectorAll('#lista-equipos li:not(.asignado)');
  if(pendientes.length === 0){ return; }

  // Elegimos un equipo al azar entre los pendientes, no siempre el primero
  const li = pendientes[Math.floor(Math.random() * pendientes.length)];
  const nombre = li.dataset.nombre;

  const numGrupos = disciplinas[disciplinaActual].numGrupos;
  const grupoIdx = Math.floor(Math.random() * numGrupos) + 1;

  li.classList.add('asignado');
  const etiqueta = document.createElement('span');
  etiqueta.className = 'etiqueta-grupo';
  etiqueta.textContent = 'Grupo ' + grupoIdx;
  li.appendChild(etiqueta);

  const grupoUl = document.getElementById('g' + grupoIdx);
  const nuevoLi = document.createElement('li');
  const posicion = grupoUl.children.length + 1;
  nuevoLi.innerHTML = '<b>' + posicion + '</b>' + nombre;
  grupoUl.appendChild(nuevoLi);
}

function agregarEquipo(){
  const input = document.getElementById('nuevo-equipo');
  const nombre = input.value.trim();
  if(!nombre) return;
  const li = document.createElement('li');
  li.dataset.nombre = nombre;
  li.textContent = nombre;
  document.getElementById('lista-equipos').appendChild(li);
  input.value = '';
}

function ir(i, btn){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('s'+i).classList.add('active');
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  if(btn){btn.classList.add('active');}
  else{document.querySelectorAll('nav button')[i].classList.add('active');}
}

seleccionarDisciplina('hombres', false);
ir(0);