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

function renderizarGrupos(){
  const d = disciplinas[disciplinaActual];
  document.querySelector('#s2 h1').textContent = 'Grupos generados — ' + d.titulo;

  const cont = document.querySelector('#s2 .grupos');
  cont.innerHTML = '';
  cont.style.gridTemplateColumns = 'repeat(' + d.numGrupos + ', 1fr)';

  d.grupos.forEach((equiposDelGrupo, idx) => {
    const box = document.createElement('div');
    box.className = 'grupo-box';

    let html = '<h3>GRUPO ' + (idx + 1) + '</h3><ul>';
    if(equiposDelGrupo.length === 0){
      html += '<li style="font-style:italic;color:#aab3bb;">— sin equipos sorteados aún —</li>';
    } else {
      equiposDelGrupo.forEach((nombre, pos) => {
        html += '<li><b>' + (pos + 1) + '</b> ' + nombre + '</li>';
      });
    }
    html += '</ul>';

    box.innerHTML = html;
    cont.appendChild(box);
  });
}
// Genera todos los cruces posibles dentro de un array de equipos (todos contra todos)
function generarCombinaciones(equipos){
  const partidos = [];
  for(let i = 0; i < equipos.length; i++){
    for(let j = i + 1; j < equipos.length; j++){
      partidos.push({
        local: equipos[i],
        visitante: equipos[j],
        golesLocal: null,   // null = todavía no se ha jugado
        golesVisitante: null
      });
    }
  }
  return partidos;
}

// Genera (o regenera) los partidos de TODOS los grupos de la disciplina actual,
// respetando los resultados que YA se hayan cargado si el partido sigue existiendo.
function generarPartidos(){
  const d = disciplinas[disciplinaActual];

  const partidosPrevios = d.partidos || [];

  d.partidos = d.grupos.map((equiposDelGrupo, idxGrupo) => {
    const nuevos = generarCombinaciones(equiposDelGrupo);
    const grupoPrevio = partidosPrevios[idxGrupo] || [];
    nuevos.forEach(p => {
      const encontrado = grupoPrevio.find(pv =>
        (pv.local === p.local && pv.visitante === p.visitante)
      );
      if(encontrado){
        p.golesLocal = encontrado.golesLocal;
        p.golesVisitante = encontrado.golesVisitante;
      }
    });
    return nuevos;
  });

  guardarEstado();
}

// Calcula la tabla de posiciones de UN grupo específico, a partir de sus partidos.
// Recibe el array de equipos del grupo y el array de partidos de ese mismo grupo.
function calcularTabla(equiposDelGrupo, partidosDelGrupo){
  // Inicializamos cada equipo en cero
  const stats = {};
  equiposDelGrupo.forEach(nombre => {
    stats[nombre] = { equipo: nombre, pj:0, pg:0, pe:0, pp:0, gf:0, gc:0, dif:0, pts:0 };
  });

  // Recorremos los partidos YA jugados (los que tienen goles cargados, no null)
  partidosDelGrupo.forEach(p => {
    if(p.golesLocal === null || p.golesVisitante === null) return; // no jugado, se ignora

    const local = stats[p.local];
    const visitante = stats[p.visitante];

    local.pj++; visitante.pj++;
    local.gf += p.golesLocal;  local.gc += p.golesVisitante;
    visitante.gf += p.golesVisitante; visitante.gc += p.golesLocal;

    if(p.golesLocal > p.golesVisitante){
      local.pg++; local.pts += 3;
      visitante.pp++;
    } else if(p.golesLocal < p.golesVisitante){
      visitante.pg++; visitante.pts += 3;
      local.pp++;
    } else {
      local.pe++; local.pts += 1;
      visitante.pe++; visitante.pts += 1;
    }
  });

  // Calculamos diferencia de gol y convertimos a array ordenado
  const tabla = Object.values(stats).map(e => {
    e.dif = e.gf - e.gc;
    return e;
  });

  // Orden oficial: 1º por puntos, 2º por diferencia de gol, 3º por goles a favor
  tabla.sort((a,b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);

  return tabla;
}

// Devuelve los "numPorGrupo" mejores de cada grupo, ordenados primero por posición
// dentro de su grupo (1eros antes que 2dos) y luego por fuerza (Pts, Dif, GF).
// Esto evita que dos 1eros de grupos distintos se enfrenten antes que un 1ero contra un 2do.
function obtenerClasificados(numPorGrupo = 2){
  const d = disciplinas[disciplinaActual];
  let clasificados = [];

  d.grupos.forEach((equiposDelGrupo, idxGrupo) => {
    const partidosDelGrupo = d.partidos[idxGrupo];
    const tabla = calcularTabla(equiposDelGrupo, partidosDelGrupo);
    const top = tabla.slice(0, numPorGrupo);

    top.forEach((e, pos) => {
      clasificados.push({
        equipo: e.equipo,
        posGrupo: pos + 1,   // 1 = ganó su grupo, 2 = quedó segundo, etc.
        pts: e.pts, dif: e.dif, gf: e.gf
      });
    });
  });

  // Orden de siembra: primero todos los 1eros (ordenados entre sí por fuerza),
  // después todos los 2dos (ordenados entre sí por fuerza), etc.
  clasificados.sort((a, b) =>
    a.posGrupo - b.posGrupo ||
    b.pts - a.pts || b.dif - a.dif || b.gf - a.gf
  );

  return clasificados;
}

// Siguiente potencia de 2 igual o mayor a n (6 clasificados -> 8; 4 -> 4; 10 -> 16)
function siguientePotenciaDeDos(n){
  let p = 1;
  while(p < n) p *= 2;
  return p;
}

// Orden de siembra estándar de brackets (evita que los mejores sembrados se crucen muy pronto)
function ordenSiembra(n){
  if(n === 1) return [1];
  const prev = ordenSiembra(n / 2);
  const resultado = [];
  prev.forEach(s => { resultado.push(s); resultado.push(n + 1 - s); });
  return resultado;
}

function generarBracket(numPorGrupo = 2){
  const d = disciplinas[disciplinaActual];
  const clasificados = obtenerClasificados(numPorGrupo);

  const tamanoBracket = siguientePotenciaDeDos(clasificados.length);
  const orden = ordenSiembra(tamanoBracket);

  // Asignamos: siembra 1 = mejor clasificado, siembra 2 = segundo mejor, etc.
  const porSiembra = {};
  clasificados.forEach((c, idx) => { porSiembra[idx + 1] = c.equipo; });

  // Colocamos cada siembra en su posición del bracket; lo que sobra queda como 'BYE'
  const slots = orden.map(siembra => porSiembra[siembra] || 'BYE');

  // Ronda 1: si un equipo le toca contra 'BYE', pasa automáticamente sin jugar
  const ronda1 = [];
  for(let i = 0; i < slots.length; i += 2){
    const local = slots[i];
    const visitante = slots[i + 1];
    let ganador = null;
    if(local === 'BYE') ganador = visitante;
    else if(visitante === 'BYE') ganador = local;
    ronda1.push({ local, visitante, ganador });
  }

  const rondas = [ronda1];

  // Rondas siguientes: se arman vacías ("Por definir") hasta que se jueguen las anteriores
  while(rondas[rondas.length - 1].length > 1){
    const anterior = rondas[rondas.length - 1];
    const siguiente = [];
    for(let i = 0; i < anterior.length; i += 2){
      siguiente.push({
        local: anterior[i].ganador || 'Por definir',
        visitante: anterior[i + 1].ganador || 'Por definir',
        ganador: null
      });
    }
    rondas.push(siguiente);
  }

  d.bracket = rondas;
  guardarEstado();
}

function propagarDesde(numRonda){
  const d = disciplinas[disciplinaActual];
  for(let r = numRonda + 1; r < d.bracket.length; r++){
    const anterior = d.bracket[r - 1];
    const actual = d.bracket[r];
    for(let i = 0; i < actual.length; i++){
      actual[i].local = anterior[i * 2].ganador || 'Por definir';
      actual[i].visitante = anterior[i * 2 + 1].ganador || 'Por definir';
      actual[i].ganador = null; // si cambió el rival, hay que re-definir el ganador de esta ronda
    }
  }
}

function seleccionarGanador(numRonda, numPartido, equipoGanador){
  const d = disciplinas[disciplinaActual];
  d.bracket[numRonda][numPartido].ganador = equipoGanador;
  propagarDesde(numRonda);
  guardarEstado();
  renderizarBracket();
}

function deshacerGanador(numRonda, numPartido){
  const d = disciplinas[disciplinaActual];
  const partido = d.bracket[numRonda][numPartido];

  const confirmar = confirm(
    '¿Deshacer el resultado de "' + partido.local + ' vs ' + partido.visitante + '"?\n' +
    'Esto también borrará los avances que dependían de este partido en las rondas siguientes.'
  );
  if(!confirmar) return;

  partido.ganador = null;
  propagarDesde(numRonda);
  guardarEstado();
  renderizarBracket();
}

const nombresRonda = {
  8: ['Cuartos de final', 'Semifinal', 'Final', 'Campeón'],
  4: ['Semifinal', 'Final', 'Campeón'],
  2: ['Final', 'Campeón']
};

function renderizarBracket(){
  const d = disciplinas[disciplinaActual];
  if(!d.bracket){ return; }

  const cont = document.getElementById('bracket-eliminacion');
  cont.innerHTML = '';

  const tamanoInicial = d.bracket[0].length * 2; // cuántos equipos entraron a la ronda 1
  const etiquetas = nombresRonda[tamanoInicial] || d.bracket.map((_, i) => 'Ronda ' + (i + 1));

  d.bracket.forEach((ronda, numRonda) => {
    const rondaDiv = document.createElement('div');
    rondaDiv.className = 'ronda';

    const label = document.createElement('div');
    label.className = 'ronda-label';
    label.textContent = etiquetas[numRonda] || ('Ronda ' + (numRonda + 1));
    rondaDiv.appendChild(label);

    ronda.forEach((partido, numPartido) => {
      const matchDiv = document.createElement('div');
      matchDiv.className = 'match';

      // Si es la última ronda (1 solo "partido" = la final), mostramos el campeón aparte
      const esFinal = ronda.length === 1 && partido.ganador;

      ['local', 'visitante'].forEach(lado => {
        const nombre = partido[lado];
        const div = document.createElement('div');
        const esGanador = partido.ganador && partido.ganador === nombre;
        div.className = esGanador ? 'win' : '';
        div.textContent = nombre;

        // Solo se puede elegir ganador si ambos equipos ya están definidos (no 'BYE' ni 'Por definir')
        const jugable = nombre && nombre !== 'BYE' && nombre !== 'Por definir' &&
                         partido.local !== 'Por definir' && partido.visitante !== 'Por definir' &&
                         partido.local !== 'BYE' && partido.visitante !== 'BYE';

        const esBye = partido.local === 'BYE' || partido.visitante === 'BYE';

        if(jugable && !partido.ganador){
          // Partido listo para jugarse: clic para marcar ganador
          div.style.cursor = 'pointer';
          div.title = 'Clic para marcar como ganador';
          div.onclick = () => seleccionarGanador(numRonda, numPartido, nombre);
        } else if(partido.ganador && !esBye){
          // Partido ya decidido (y NO es un bye automático): clic para deshacer
          div.style.cursor = 'pointer';
          div.title = 'Clic para deshacer este resultado';
          div.onclick = () => deshacerGanador(numRonda, numPartido);
        }

        matchDiv.appendChild(div);
      });

      rondaDiv.appendChild(matchDiv);

      if(esFinal){
        const campeonDiv = document.createElement('div');
        campeonDiv.className = 'ronda';
        campeonDiv.innerHTML =
          '<div class="ronda-label">Campeón</div>' +
          '<div class="match" style="border:2px solid var(--oro);"><div class="win">🏆 ' + partido.ganador + '</div></div>';
        cont.appendChild(rondaDiv);
        cont.appendChild(campeonDiv);
        return;
      }
    });

    if(!(ronda.length === 1 && ronda[0].ganador)){
      cont.appendChild(rondaDiv);
    }
  });
}

let grupoTablaActual = 0; // índice del grupo que se está viendo en la pantalla de Tabla

function renderizarTabla(){
  const d = disciplinas[disciplinaActual];
  if(!d.partidos) return; // por si acaso todavía no se generaron partidos

  document.querySelector('#s3 h1').textContent =
    'Partidos y tabla de posiciones — Grupo ' + (grupoTablaActual + 1);

  // --- Selector de grupo (si hay más de uno) ---
  const selectorCont = document.getElementById('selector-grupo-tabla');
  selectorCont.innerHTML = '';
  if(d.numGrupos > 1){
    d.grupos.forEach((_, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn' + (idx === grupoTablaActual ? ' oro' : '');
      btn.textContent = 'Grupo ' + (idx + 1);
      btn.onclick = () => { grupoTablaActual = idx; renderizarTabla(); };
      selectorCont.appendChild(btn);
    });
  }

  const equiposDelGrupo = d.grupos[grupoTablaActual];
  const partidosDelGrupo = d.partidos[grupoTablaActual];

  // --- Tabla de partidos con inputs editables ---
  const contPartidos = document.getElementById('partidos-grupo');
  contPartidos.innerHTML = '';
  partidosDelGrupo.forEach((p, idx) => {
    const jugado = p.golesLocal !== null && p.golesVisitante !== null;
    const fila = document.createElement('tr');
    fila.innerHTML =
      '<td>' + p.local + '</td>' +
      '<td><input type="number" min="0" style="width:40px" value="' + (p.golesLocal ?? '') + '" data-idx="' + idx + '" data-campo="golesLocal"></td>' +
      '<td>vs</td>' +
      '<td><input type="number" min="0" style="width:40px" value="' + (p.golesVisitante ?? '') + '" data-idx="' + idx + '" data-campo="golesVisitante"></td>' +
      '<td>' + p.visitante + '</td>' +
      '<td><span class="pill" style="' + (jugado ? '' : 'background:var(--linea);color:#555') + '">' + (jugado ? 'Finalizado' : 'Pendiente') + '</span></td>';
    contPartidos.appendChild(fila);
  });

  // Conectamos cada input para que, al cambiar, actualice los datos y recalcule todo
  contPartidos.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = Number(e.target.dataset.idx);
      const campo = e.target.dataset.campo;
      const valor = e.target.value === '' ? null : Number(e.target.value);
      d.partidos[grupoTablaActual][idx][campo] = valor;
      guardarEstado();
      renderizarTabla(); // recalcula y redibuja todo de nuevo
    });
  });

  // --- Tabla de posiciones calculada ---
  const tabla = calcularTabla(equiposDelGrupo, partidosDelGrupo);
  const contTabla = document.getElementById('tabla-posiciones');
  contTabla.innerHTML =
    '<tr><th>Pos</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>Dif</th><th>Pts</th></tr>';
  tabla.forEach((e, pos) => {
    const esTop = pos < 2; // resaltamos los 2 primeros lugares (clasificados), ajustable
    contTabla.innerHTML +=
      '<tr' + (esTop ? ' class="top3"' : '') + '>' +
      '<td>' + (pos+1) + '</td><td>' + e.equipo + '</td><td>' + e.pj + '</td><td>' + e.pg + '</td>' +
      '<td>' + e.pe + '</td><td>' + e.pp + '</td><td>' + (e.dif > 0 ? '+' : '') + e.dif + '</td><td>' + e.pts + '</td></tr>';
  });
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
  if(i === 2){
    renderizarGrupos();
  }
  if(i === 3){
    grupoTablaActual = 0; // siempre que se entra a Tabla, arranca mostrando el Grupo 1
    renderizarTabla();
  }
  if(i === 4){
    generarBracket(2); // el "2" es cuántos clasifican por grupo — ya lo dejamos fijo en 2, según tu regla
    renderizarBracket();
  }
}

// Mapa de "a qué pantalla regresar" desde cada pantalla actual
const pantallaAnterior = {
  1: 0,  // Sorteo → Inicio
  2: 1,  // Grupos → Sorteo
  3: 2,  // Tabla → Grupos
  4: 3,  // Eliminación → Tabla
  5: 0   // Mundial de 40 → Inicio (porque se accede directo desde Inicio)
};

function irAtras(actual){
  ir(pantallaAnterior[actual]);
}

cargarEstado();
seleccionarDisciplina('hombres', false);
ir(0);