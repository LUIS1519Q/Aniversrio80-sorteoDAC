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

let mundial40 = {
  parejas: [],   // cada una: {id, jugador1, jugador2}
  bracket: null
};

// --- Instituciones y en qué disciplinas participan ---
let instituciones = {};
// Estructura: { "Nombre Institucion": { futbolMasculino:true, futbolFemenino:false, basquet:true, ecuavoley:true, mundial40:false, jenga:false } }

const disciplinasParaCheckbox = [
  { clave: 'futbolMasculino', etiqueta: 'Fútbol Masculino' },
  { clave: 'futbolFemenino', etiqueta: 'Fútbol Femenino' },
  { clave: 'basquet', etiqueta: 'Básquet' },
  { clave: 'ecuavoley', etiqueta: 'Ecuavoley' },
  { clave: 'mundial40', etiqueta: 'Mundial de 40' },
  { clave: 'jenga', etiqueta: 'Jenga' }
];

function agregarInstitucion(){
  const input = document.getElementById('nueva-institucion');
  const nombre = input.value.trim();
  if(!nombre) return;

  if(instituciones[nombre]){
    alert('Ya existe una institución con ese nombre.');
    return;
  }

  const participacion = {};
  disciplinasParaCheckbox.forEach(d => { participacion[d.clave] = false; });
  instituciones[nombre] = participacion;

  guardarEstado();
  renderizarInstituciones();
  input.value = '';
}

function cambiarParticipacion(nombreInstitucion, claveDisciplina, activo){
  if(!esOrganizador()) return;
  if(!instituciones[nombreInstitucion]) return;
  instituciones[nombreInstitucion][claveDisciplina] = activo;
  guardarEstado();
}

function eliminarInstitucion(nombre){
  if(!confirm('¿Eliminar la institución "' + nombre + '"? Esto no borra sus resultados ya jugados en ninguna disciplina, solo la quita de esta lista.')) return;
  delete instituciones[nombre];
  guardarEstado();
  renderizarInstituciones();
}

function renderizarInstituciones(){
  const cont = document.getElementById('lista-instituciones');
  if(!cont) return;
  cont.innerHTML = '';

  const nombres = Object.keys(instituciones);
  if(nombres.length === 0){
    cont.innerHTML = '<p class="add-note">Aún no hay instituciones registradas.</p>';
    return;
  }

  nombres.forEach(nombre => {
    const fila = document.createElement('div');
    fila.style.cssText = 'display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:10px 0;border-bottom:1px dashed var(--linea);';

    const spanNombre = document.createElement('span');
    spanNombre.textContent = nombre;
    spanNombre.style.cssText = 'font-weight:bold;min-width:220px;';
    fila.appendChild(spanNombre);

    disciplinasParaCheckbox.forEach(d => {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:12px;color:var(--hueso);';

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = !!instituciones[nombre][d.clave];
      check.disabled = !esOrganizador();
      check.onchange = () => cambiarParticipacion(nombre, d.clave, check.checked);

      label.appendChild(check);
      label.appendChild(document.createTextNode(d.etiqueta));
      fila.appendChild(label);
    });

    if(esOrganizador()){
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = '🗑️';
      btnEliminar.onclick = () => eliminarInstitucion(nombre);
      fila.appendChild(btnEliminar);
    }

    cont.appendChild(fila);
  });
}

function nombrePareja(pareja){
  return pareja.jugador1 + ' / ' + pareja.jugador2;
}

function inscribirPareja(){
  const input1 = document.getElementById('mundial-jugador1');
  const input2 = document.getElementById('mundial-jugador2');
  const j1 = input1.value.trim();
  const j2 = input2.value.trim();

  if(!j1 || !j2){
    alert('Debes ingresar el nombre de ambos jugadores.');
    return;
  }

  const nueva = { id: Date.now(), jugador1: j1, jugador2: j2 };
  mundial40.parejas.push(nueva);

  if(mundial40.bracket){
    generarBracketMundial();
  }

  guardarEstado();
  renderizarListaParejas();
  if(mundial40.bracket) renderizarBracketMundial();

  input1.value = '';
  input2.value = '';
}

function parejaYaJugo(nombrePar){
  if(!mundial40.bracket) return false;
  const ronda1 = mundial40.bracket[0];
  const partido = ronda1.find(p => p.local === nombrePar || p.visitante === nombrePar);
  return partido ? !!partido.ganador : false;
}

function editarPareja(id){
  const pareja = mundial40.parejas.find(p => p.id === id);
  if(!pareja) return;

  if(parejaYaJugo(nombrePareja(pareja))){
    alert('Esta pareja ya jugó su primer partido, no se puede editar.');
    return;
  }

  const nuevoJ1 = prompt('Jugador 1:', pareja.jugador1);
  if(!nuevoJ1 || !nuevoJ1.trim()) return;
  const nuevoJ2 = prompt('Jugador 2:', pareja.jugador2);
  if(!nuevoJ2 || !nuevoJ2.trim()) return;

  pareja.jugador1 = nuevoJ1.trim();
  pareja.jugador2 = nuevoJ2.trim();

  if(mundial40.bracket) generarBracketMundial();
  guardarEstado();
  renderizarListaParejas();
  if(mundial40.bracket) renderizarBracketMundial();
}

function eliminarPareja(id){
  const pareja = mundial40.parejas.find(p => p.id === id);
  if(!pareja) return;

  if(parejaYaJugo(nombrePareja(pareja))){
    alert('Esta pareja ya jugó su primer partido, no se puede eliminar.');
    return;
  }

  if(!confirm('¿Eliminar la pareja "' + nombrePareja(pareja) + '"?')) return;

  mundial40.parejas = mundial40.parejas.filter(p => p.id !== id);

  if(mundial40.bracket) generarBracketMundial();
  guardarEstado();
  renderizarListaParejas();
  if(mundial40.bracket) renderizarBracketMundial();
}

function mezclarAlAzar(array){
  const copia = [...array];
  for(let i = copia.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function generarBracketMundial(){
  if(mundial40.parejas.length < 2){
    mundial40.bracket = null;
    return;
  }

  const bracketPrevio = mundial40.bracket;

  const nombres = mundial40.parejas.map(nombrePareja);
  const mezcladas = mezclarAlAzar(nombres);

  const tamanoBracket = siguientePotenciaDeDos(mezcladas.length);
  const orden = ordenSiembra(tamanoBracket);

  const porSiembra = {};
  mezcladas.forEach((nombre, idx) => { porSiembra[idx + 1] = nombre; });

  const slots = orden.map(siembra => porSiembra[siembra] || 'BYE');

  const ronda1 = [];
  for(let i = 0; i < slots.length; i += 2){
    const local = slots[i];
    const visitante = slots[i + 1];
    let ganador = null;
    if(local === 'BYE') ganador = visitante;
    else if(visitante === 'BYE') ganador = local;

    if(bracketPrevio && bracketPrevio[0]){
      const previo = bracketPrevio[0].find(p =>
        (p.local === local && p.visitante === visitante) ||
        (p.local === visitante && p.visitante === local)
      );
      if(previo && previo.ganador) ganador = previo.ganador;
    }

    ronda1.push({ local, visitante, ganador });
  }

  const rondas = [ronda1];
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

  mundial40.bracket = rondas;
  guardarEstado();
}

function rehacerSorteoMundial(){
  if(!mundial40.bracket){
    alert('Todavía no hay un bracket generado para rehacer.');
    return;
  }

  const confirmar = confirm(
    '¿Seguro que quieres rehacer el sorteo del Mundial de 40?\n' +
    'El bracket actual se va a borrar. Las parejas inscritas NO se eliminan, solo se sortean de nuevo.'
  );
  if(!confirmar) return;

  mundial40.bracket = null;
  guardarEstado();
  renderizarBracketMundial();
}

function cambiarNumGrupos(valorTexto){
  if(!esOrganizador()) return;

  const nuevo = Number(valorTexto);
  const d = disciplinas[disciplinaActual];

  if(nuevo === d.numGrupos) return;

  const confirmar = confirm(
    'Cambiar el número de grupos a ' + nuevo + ' va a reiniciar el sorteo actual.\n' +
    'Todos los equipos volverán a la lista de pendientes. Esta acción no se puede deshacer.'
  );

  if(!confirmar){
    seleccionarDisciplina(disciplinaActual, false);
    return;
  }

  d.numGrupos = nuevo;
  d.grupos = [];
  for(let i = 0; i < nuevo; i++){
    d.grupos.push([]);
  }
  d.partidos = undefined;
  d.bracket = undefined;

  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
}

function renderizarListaParejas(){
  const cont = document.getElementById('lista-parejas-mundial');
  if(!cont) return;
  cont.innerHTML = '';

  if(mundial40.parejas.length === 0){
    cont.innerHTML = '<p class="add-note">Aún no hay parejas inscritas.</p>';
    return;
  }

  mundial40.parejas.forEach(pareja => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px dashed var(--linea);';

    const span = document.createElement('span');
    span.textContent = nombrePareja(pareja);
    div.appendChild(span);

    if(!parejaYaJugo(nombrePareja(pareja)) && esOrganizador()){
      const btnEditar = document.createElement('button');
      btnEditar.textContent = '✏️';
      btnEditar.onclick = () => editarPareja(pareja.id);
      div.appendChild(btnEditar);

      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = '🗑️';
      btnEliminar.onclick = () => eliminarPareja(pareja.id);
      div.appendChild(btnEliminar);
    }

    cont.appendChild(div);
  });
}

function seleccionarGanadorMundial(numRonda, numPartido, ganador){
  mundial40.bracket[numRonda][numPartido].ganador = ganador;
  propagarDesdeMundial(numRonda);
  guardarEstado();
  renderizarBracketMundial();
}

function deshacerGanadorMundial(numRonda, numPartido){
  const partido = mundial40.bracket[numRonda][numPartido];
  if(!confirm('¿Deshacer el resultado de "' + partido.local + ' vs ' + partido.visitante + '"?')) return;
  partido.ganador = null;
  propagarDesdeMundial(numRonda);
  guardarEstado();
  renderizarBracketMundial();
}

function propagarDesdeMundial(numRonda){
  for(let r = numRonda + 1; r < mundial40.bracket.length; r++){
    const anterior = mundial40.bracket[r - 1];
    const actual = mundial40.bracket[r];
    for(let i = 0; i < actual.length; i++){
      actual[i].local = anterior[i * 2].ganador || 'Por definir';
      actual[i].visitante = anterior[i * 2 + 1].ganador || 'Por definir';
      actual[i].ganador = null;
    }
  }
}

const nombresRondaMundial = {
  2: ['Final','Campeón'], 4: ['Semifinal','Final','Campeón'],
  8: ['Cuartos de final','Semifinal','Final','Campeón'],
  16: ['Octavos de final','Cuartos de final','Semifinal','Final','Campeón'],
  32: ['1/16','Octavos de final','Cuartos de final','Semifinal','Final','Campeón']
};

function renderizarBracketMundial(){
  const cont = document.getElementById('bracket-mundial40');
  if(!cont) return;
  cont.innerHTML = '';

  if(!mundial40.bracket){
    cont.innerHTML = '<p class="add-note">Inscribe al menos 2 parejas para generar el bracket.</p>';
    return;
  }

  const tamanoInicial = mundial40.bracket[0].length * 2;
  const etiquetas = nombresRondaMundial[tamanoInicial] || mundial40.bracket.map((_, i) => 'Ronda ' + (i+1));

  mundial40.bracket.forEach((ronda, numRonda) => {
    const rondaDiv = document.createElement('div');
    rondaDiv.className = 'ronda';
    const label = document.createElement('div');
    label.className = 'ronda-label';
    label.textContent = etiquetas[numRonda] || ('Ronda ' + (numRonda+1));
    rondaDiv.appendChild(label);

    ronda.forEach((partido, numPartido) => {
      const matchDiv = document.createElement('div');
      matchDiv.className = 'match';
      const esFinal = ronda.length === 1 && partido.ganador;
      const esBye = partido.local === 'BYE' || partido.visitante === 'BYE';

      ['local','visitante'].forEach(lado => {
        const nombre = partido[lado];
        const div = document.createElement('div');
        const esGanador = partido.ganador && partido.ganador === nombre;
        div.className = esGanador ? 'win' : '';
        div.textContent = nombre;

        const jugable = nombre && nombre !== 'BYE' && nombre !== 'Por definir' &&
                         partido.local !== 'Por definir' && partido.visitante !== 'Por definir' &&
                         partido.local !== 'BYE' && partido.visitante !== 'BYE';

        if(jugable && !partido.ganador && esOrganizador()){
          div.style.cursor = 'pointer';
          div.onclick = () => seleccionarGanadorMundial(numRonda, numPartido, nombre);
        } else if(partido.ganador && !esBye && esOrganizador()){
          div.style.cursor = 'pointer';
          div.onclick = () => deshacerGanadorMundial(numRonda, numPartido);
        }
        matchDiv.appendChild(div);
      });

      rondaDiv.appendChild(matchDiv);

      if(esFinal){
        const campeonDiv = document.createElement('div');
        campeonDiv.className = 'ronda';
        campeonDiv.innerHTML = '<div class="ronda-label">Campeón</div><div class="match" style="border:2px solid var(--oro);"><div class="win">🏆 ' + partido.ganador + '</div></div>';
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

function guardarHistorial(paquete){
  const marcaTiempo = Date.now();
  window.firebaseSet(window.firebaseRef(window.firebaseDB, 'historial/' + marcaTiempo), paquete)
    .catch(error => {
      console.error('Error al guardar historial:', error);
    });
}

function limpiarUndefined(valor){
  if(Array.isArray(valor)){
    return valor.map(limpiarUndefined);
  }

  if(valor && typeof valor === 'object'){
    const limpio = {};
    Object.keys(valor).forEach(clave => {
      if(valor[clave] !== undefined){
        limpio[clave] = limpiarUndefined(valor[clave]);
      }
    });
    return limpio;
  }

  return valor;
}

const STORAGE_KEY = 'dgac_estado_disciplinas';

function guardarEstado(){
  const paqueteOriginal = { disciplinas: disciplinas, mundial40: mundial40, instituciones: instituciones };
  const paquete = limpiarUndefined(paqueteOriginal);
  window.firebaseSet(window.firebaseRef(window.firebaseDB, 'estado'), paquete)
    .then(() => {
      guardarHistorial(paquete);
    })
    .catch(error => {
      console.error('Error al guardar en Firebase:', error);
    });
}

function convertirArraysFirebase(valor){
  if(Array.isArray(valor)){
    return valor.map(convertirArraysFirebase);
  }

  if(valor && typeof valor === 'object'){
    const claves = Object.keys(valor);
    const esArrayConvertido = claves.length > 0 && claves.every(k => /^\d+$/.test(k));

    if(esArrayConvertido){
      const maxIndice = Math.max(...claves.map(Number));
      const arr = [];
      for(let i = 0; i <= maxIndice; i++){
        arr[i] = valor[i] !== undefined ? convertirArraysFirebase(valor[i]) : [];
      }
      return arr;
    } else {
      const nuevo = {};
      claves.forEach(k => { nuevo[k] = convertirArraysFirebase(valor[k]); });
      return nuevo;
    }
  }

  return valor;
}

async function cargarEstado(){
  try {
    const snapshot = await window.firebaseGet(window.firebaseRef(window.firebaseDB, 'estado'));

    if(!snapshot.exists()){
      return true;
    }

    const datosGuardados = convertirArraysFirebase(snapshot.val());

    if(datosGuardados.disciplinas){
      Object.keys(datosGuardados.disciplinas).forEach(clave => {
        if(disciplinas[clave]){
          const guardado = datosGuardados.disciplinas[clave];
          disciplinas[clave] = {
            titulo: guardado.titulo || disciplinas[clave].titulo,
            numGrupos: guardado.numGrupos || disciplinas[clave].numGrupos,
            equipos: guardado.equipos || [],
            grupos: guardado.grupos || undefined,
            partidos: guardado.partidos || undefined,
            bracket: guardado.bracket || undefined,
            calendarioSabado: guardado.calendarioSabado || undefined
          };
        }
      });
    }

    if(datosGuardados.mundial40){
      mundial40 = datosGuardados.mundial40;
    }

    if(datosGuardados.instituciones){
      instituciones = datosGuardados.instituciones;
    }

    return true;
  } catch (error) {
    console.error('Error al cargar desde Firebase:', error);
    return false;
  }
}

const PIN_ORGANIZADOR = 'dgac26';

function esOrganizador(){
  return sessionStorage.getItem('modoOrganizador') === 'true';
}
function intentarModoOrganizador(){
  if(esOrganizador()){
    alert('Ya estás en modo organizador.');
    return;
  }

  const exito = pedirPin();
  if(exito){
    aplicarModoLectura();
    ir(0);
  }
}
function pedirPin(){
  const intento = prompt('Ingresa el PIN de organizador (o cancela para ver en modo lectura):');
  if(intento === null) return false;

  if(intento.trim() === PIN_ORGANIZADOR){
    sessionStorage.setItem('modoOrganizador', 'true');
    return true;
  } else {
    alert('PIN incorrecto. Sigues en modo lectura.');
    return false;
  }
}

function aplicarModoLectura(){
  const modoLectura = !esOrganizador();

  const idsAOcultar = [
    'card-agregar-equipo',
    'botones-sorteo',
    'card-inscribir-pareja',
    'boton-generar-bracket-mundial',
    'boton-regenerar-bracket',
    'card-num-grupos',
    'boton-generar-calendario-futbol',
    'boton-generar-semifinal'
  ];
  idsAOcultar.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.display = modoLectura ? 'none' : '';
  });
}
let disciplinaActual = 'hombres';

function seleccionarDisciplina(clave, navegar){
  if(navegar === undefined) navegar = true;
  disciplinaActual = clave;
  const d = disciplinas[clave];
  document.getElementById('titulo-sorteo').textContent = 'Sorteo de equipos — ' + d.titulo;

  const selectorNumGrupos = document.getElementById('selector-num-grupos');
  selectorNumGrupos.innerHTML = '';
  for(let i = 1; i <= 8; i++){
    const opcion = document.createElement('option');
    opcion.value = i;
    opcion.textContent = i + (i === 1 ? ' grupo' : ' grupos');
    if(i === d.numGrupos) opcion.selected = true;
    selectorNumGrupos.appendChild(opcion);
  }

  if(!d.grupos){
    d.grupos = [];
    for(let i=0; i<d.numGrupos; i++){ d.grupos.push([]); }
  }

  const asignados = {};
  d.grupos.forEach((grupoArray, idx) => {
    grupoArray.forEach(nombre => { asignados[nombre] = idx + 1; });
  });

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

      if(esOrganizador()){
        const selectGrupo = document.createElement('select');
        selectGrupo.style.marginLeft = '6px';
        for(let i = 1; i <= d.numGrupos; i++){
          const opcion = document.createElement('option');
          opcion.value = i - 1;
          opcion.textContent = 'Grupo ' + i;
          if(i === asignados[nombre]) opcion.selected = true;
          selectGrupo.appendChild(opcion);
        }
        li.appendChild(selectGrupo);

        const btnMover = document.createElement('button');
        btnMover.textContent = '↔️ Mover';
        btnMover.onclick = () => colocarEquipoEnGrupo(nombre, Number(selectGrupo.value));
        li.appendChild(btnMover);
      }
    } else if(esOrganizador()){
      const selectGrupo = document.createElement('select');
      selectGrupo.style.marginLeft = '6px';
      for(let i = 1; i <= d.numGrupos; i++){
        const opcion = document.createElement('option');
        opcion.value = i - 1;
        opcion.textContent = 'Grupo ' + i;
        selectGrupo.appendChild(opcion);
      }
      li.appendChild(selectGrupo);

      const btnColocar = document.createElement('button');
      btnColocar.textContent = '🎯 Colocar';
      btnColocar.onclick = () => colocarEquipoEnGrupo(nombre, Number(selectGrupo.value));
      li.appendChild(btnColocar);

      const btnSortear = document.createElement('button');
      btnSortear.textContent = '🎲 Sortear';
      btnSortear.onclick = () => sortearEquipoEspecifico(nombre);
      li.appendChild(btnSortear);

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

  const cont = document.querySelector('.grupos-sorteo');
  cont.innerHTML = '';
  cont.style.gridTemplateColumns = 'repeat(' + d.numGrupos + ', 1fr)';
  for(let i=1; i<=d.numGrupos; i++){
    const box = document.createElement('div');
    box.className = 'grupo-box';
    box.innerHTML = '<h3>GRUPO ' + i + '</h3><ul id="g' + i + '" class="grupo-ul"></ul>';
    cont.appendChild(box);
  }

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

function sortearUno(){
  const d = disciplinas[disciplinaActual];

  const yaAsignados = new Set(d.grupos.flat());
  const pendientes = d.equipos.filter(nombre => !yaAsignados.has(nombre));

  if(pendientes.length === 0){
    alert('Ya no quedan equipos por sortear.');
    return;
  }

  const nombre = pendientes[Math.floor(Math.random() * pendientes.length)];

  const minTamano = Math.min(...d.grupos.map(g => g.length));

  const candidatos = [];
  d.grupos.forEach((grupoArray, idx) => {
    if(grupoArray.length === minTamano) candidatos.push(idx);
  });

  const grupoIdxCero = candidatos[Math.floor(Math.random() * candidatos.length)];
  d.grupos[grupoIdxCero].push(nombre);

  guardarEstado();

  seleccionarDisciplina(disciplinaActual, false);
}

function sortearEquipoEspecifico(nombre){
  const d = disciplinas[disciplinaActual];

  d.grupos.forEach(g => {
    const idx = g.indexOf(nombre);
    if(idx !== -1) g.splice(idx, 1);
  });

  const minTamano = Math.min(...d.grupos.map(g => g.length));
  const candidatos = [];
  d.grupos.forEach((grupoArray, idx) => {
    if(grupoArray.length === minTamano) candidatos.push(idx);
  });

  const grupoIdx = candidatos[Math.floor(Math.random() * candidatos.length)];
  d.grupos[grupoIdx].push(nombre);

  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
}

function colocarEquipoEnGrupo(nombre, grupoIdx){
  const d = disciplinas[disciplinaActual];

  d.grupos.forEach(g => {
    const idx = g.indexOf(nombre);
    if(idx !== -1) g.splice(idx, 1);
  });

  d.grupos[grupoIdx].push(nombre);

  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
}

function generarCalendarioFutbolSabado(){
  const dH = disciplinas.hombres;
  const dM = disciplinas.mujeres;

  if(!dH.grupos || dH.grupos.length !== 2){
    alert('Fútbol Masculino debe estar sorteado en exactamente 2 grupos (3 y 4 equipos) antes de generar el calendario.');
    return;
  }

  const grupoChico = dH.grupos.find(g => g.length === 3);
  const grupoGrande = dH.grupos.find(g => g.length === 4);

  if(!grupoChico || !grupoGrande){
    alert('Los grupos deben ser exactamente de 3 y 4 equipos.');
    return;
  }

  // Round robin del grupo de 4 (metodo del circulo, sin bye, 3 rondas x 2 partidos)
  const roundsGrande = rondasRoundRobin(grupoGrande);
  // Round robin del grupo de 3 (con bye, 3 rondas x 1 partido real)
  const roundsChico = rondasRoundRobin(grupoChico);

  // Partidos de Futbol Femenino (round robin de 3, con bye)
  const equiposFem = (dM.equipos || []).slice(0, 3);
  const roundsFem = equiposFem.length === 3 ? rondasRoundRobin(equiposFem) : [[], [], []];

  const DUR = 45;
  const DESCANSO = 5;
  const ORGANIZACION = 5;

  const calendario = [];
  let horaMin = horaATotalMinutos('11:00');

  for(let i = 0; i < 3; i++){
    const partidosRonda = [];
    roundsGrande[i].forEach(p => partidosRonda.push({ tipo: 'M', local: p.local, visitante: p.visitante }));
    roundsChico[i].forEach(p => partidosRonda.push({ tipo: 'M', local: p.local, visitante: p.visitante }));
    if(roundsFem[i] && roundsFem[i].length) {
      roundsFem[i].forEach(p => partidosRonda.push({ tipo: 'F', local: p.local, visitante: p.visitante }));
    }

    calendario.push({
      filaTipo: 'juego',
      horaIni: horaMin, horaFin: horaMin + DUR,
      partidos: partidosRonda
    });
    horaMin += DUR;

    if(i < 2){
      calendario.push({ filaTipo: 'descanso', horaIni: horaMin, horaFin: horaMin + DESCANSO });
      horaMin += DESCANSO;
      calendario.push({ filaTipo: 'organizacion', horaIni: horaMin, horaFin: horaMin + ORGANIZACION });
      horaMin += ORGANIZACION;
    }
  }

  // Ronda 4: los cruces (1ro GrupoA vs 3ro GrupoB, 2do GrupoA vs 4to GrupoB) - se agregan como
  // placeholders, se completan cuando la tabla este lista (Pieza 1b)
  calendario.push({ filaTipo: 'descanso', horaIni: horaMin, horaFin: horaMin + DESCANSO });
  horaMin += DESCANSO;
  calendario.push({ filaTipo: 'organizacion', horaIni: horaMin, horaFin: horaMin + ORGANIZACION });
  horaMin += ORGANIZACION;
  calendario.push({
    filaTipo: 'juego',
    horaIni: horaMin, horaFin: horaMin + DUR,
    partidos: [
      { tipo: 'M', local: '1ro Grupo (3)', visitante: '3ro Grupo (4)', pendienteDeTabla: true },
      { tipo: 'M', local: '2do Grupo (3)', visitante: '4to Grupo (4)', pendienteDeTabla: true }
    ]
  });

  dH.calendarioSabado = calendario;
  guardarEstado();
  renderizarCalendarioFutbol();
}

function rondasRoundRobin(equipos){
  const arr = equipos.slice();
  if(arr.length % 2 !== 0) arr.push('BYE');
  const n = arr.length;
  const rondas = [];
  for(let r = 0; r < n - 1; r++){
    const partidos = [];
    for(let i = 0; i < n / 2; i++){
      const local = arr[i];
      const visitante = arr[n - 1 - i];
      if(local !== 'BYE' && visitante !== 'BYE'){
        partidos.push({ local, visitante });
      }
    }
    rondas.push(partidos);
    const ultimo = arr[n - 1];
    for(let i = n - 1; i > 1; i--){ arr[i] = arr[i - 1]; }
    arr[1] = ultimo;
  }
  return rondas;
}

function horaATotalMinutos(hhmm){
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutosAHora(total){
  const h = Math.floor(total / 60);
  const m = total % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function renderizarCalendarioFutbol(){
  const cont = document.getElementById('calendario-futbol-sabado');
  if(!cont) return;
  cont.innerHTML = '';

  const dH = disciplinas.hombres;
  if(!dH.calendarioSabado){
    cont.innerHTML = '<p class="add-note">Aún no se ha generado el calendario. Sortea Fútbol Masculino en 2 grupos (3 y 4 equipos) y da clic en "Generar calendario del sábado".</p>';
    return;
  }

  const tabla = document.createElement('table');
  let html = '<tr><th>Hora</th><th>Tipo</th><th>Cancha 1</th><th>Cancha 2</th><th>Cancha 3</th><th>Cancha 4</th></tr>';

  dH.calendarioSabado.forEach(fila => {
    const horaTexto = minutosAHora(fila.horaIni) + '-' + minutosAHora(fila.horaFin);
    if(fila.filaTipo === 'descanso'){
      html += '<tr style="background:rgba(232,184,75,.15);"><td>' + horaTexto + '</td><td>Descanso (5 min)</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>';
    } else if(fila.filaTipo === 'organizacion'){
      html += '<tr style="background:rgba(112,48,160,.15);"><td>' + horaTexto + '</td><td>Organización (5 min)</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>';
    } else {
      const celdas = ['', '', '', ''];
      fila.partidos.forEach((p, idx) => {
        let etiqueta = p.local + ' vs ' + p.visitante + ' (' + p.tipo + ')';
        if(p.pendienteDeTabla) etiqueta += ' ⚠️ pendiente';
        if(idx < 4) celdas[idx] = { texto: etiqueta, esCruce: !!p.esCruce, idx };
      });
      html += '<tr><td>' + horaTexto + '</td><td>Juego</td>' +
        celdas.map(c => '<td>' + (c ? escapeCeldaHTML(c) : '') + '</td>').join('') +
        '</tr>';
    }
  });

  tabla.innerHTML = html;
  cont.appendChild(tabla);

  // Conectar los inputs de marcador de los cruces (si existen en esta tabla)
  cont.querySelectorAll('.input-cruce').forEach(input => {
    input.addEventListener('change', (e) => {
      const numPartido = Number(e.target.dataset.numpartido);
      const campo = e.target.dataset.campo;
      const valor = e.target.value === '' ? null : Number(e.target.value);
      actualizarMarcadorCruce(numPartido, campo, valor);
    });
  });
}

function escapeCeldaHTML(c){
  if(!c.esCruce) return c.texto;
  const dH = disciplinas.hombres;
  const ultimaRonda = dH.calendarioSabado[dH.calendarioSabado.length - 1];
  const p = ultimaRonda.partidos[c.idx];
  const soloLectura = !esOrganizador();
  return p.local + ' <input type="number" min="0" class="input-cruce" style="width:36px;" data-numpartido="' + c.idx + '" data-campo="golesLocal" value="' + (p.golesLocal ?? '') + '"' + (soloLectura ? ' disabled' : '') + '> vs ' +
    '<input type="number" min="0" class="input-cruce" style="width:36px;" data-numpartido="' + c.idx + '" data-campo="golesVisitante" value="' + (p.golesVisitante ?? '') + '"' + (soloLectura ? ' disabled' : '') + '> ' + p.visitante;
}

function calcularClasificadosFutbolMasculino(){
  const dH = disciplinas.hombres;
  if(!dH.grupos || dH.grupos.length !== 2 || !dH.partidos){
    alert('Faltan datos: primero sortea 2 grupos (3 y 4 equipos) y genera/juega los partidos de grupo (pantalla "Ver partidos y tabla").');
    return null;
  }
  const idxChico = dH.grupos.findIndex(g => g.length === 3);
  const idxGrande = dH.grupos.findIndex(g => g.length === 4);
  if(idxChico === -1 || idxGrande === -1){
    alert('Los grupos deben ser exactamente de 3 y 4 equipos.');
    return null;
  }
  const tablaChico = calcularTabla(dH.grupos[idxChico], dH.partidos[idxChico]);
  const tablaGrande = calcularTabla(dH.grupos[idxGrande], dH.partidos[idxGrande]);
  return { idxChico, idxGrande, tablaChico, tablaGrande };
}

function generarCrucesFutbol(){
  const datos = calcularClasificadosFutbolMasculino();
  if(!datos) return;
  const { tablaChico, tablaGrande } = datos;

  if(tablaChico.some(e => e.pj < 2) || tablaGrande.some(e => e.pj < 3)){
    alert('Todavía faltan partidos de la fase de grupos por jugar. Completa esos resultados antes de generar los cruces.');
    return;
  }

  const primero1 = tablaChico[0].equipo;
  const segundo1 = tablaChico[1].equipo;
  const tercero2 = tablaGrande[2].equipo;
  const cuarto2 = tablaGrande[3].equipo;

  const dH = disciplinas.hombres;
  const ultimaRonda = dH.calendarioSabado[dH.calendarioSabado.length - 1];
  ultimaRonda.partidos = [
    { tipo: 'M', local: primero1, visitante: tercero2, golesLocal: null, golesVisitante: null, esCruce: true },
    { tipo: 'M', local: segundo1, visitante: cuarto2, golesLocal: null, golesVisitante: null, esCruce: true }
  ];

  guardarEstado();
  renderizarCalendarioFutbol();
}

function actualizarMarcadorCruce(numPartido, campo, valor){
  const dH = disciplinas.hombres;
  const ultimaRonda = dH.calendarioSabado[dH.calendarioSabado.length - 1];
  ultimaRonda.partidos[numPartido][campo] = valor;
  guardarEstado();
  renderizarCalendarioFutbol();
}

function calcularTablaExtendidaChico(){
  const dH = disciplinas.hombres;
  const idxChico = dH.grupos.findIndex(g => g.length === 3);
  const tablaBase = calcularTabla(dH.grupos[idxChico], dH.partidos[idxChico]);
  const stats = {};
  tablaBase.forEach(e => { stats[e.equipo] = Object.assign({}, e); });

  const ultimaRonda = dH.calendarioSabado && dH.calendarioSabado[dH.calendarioSabado.length - 1];
  if(ultimaRonda && ultimaRonda.partidos){
    ultimaRonda.partidos.forEach(p => {
      if(typeof p.golesLocal !== 'number' || typeof p.golesVisitante !== 'number') return;
      if(!stats[p.local]) return;
      const e = stats[p.local];
      e.pj++; e.gf += p.golesLocal; e.gc += p.golesVisitante;
      if(p.golesLocal > p.golesVisitante){ e.pg++; e.pts += 3; }
      else if(p.golesLocal < p.golesVisitante){ e.pp++; }
      else { e.pe++; e.pts += 1; }
      e.dif = e.gf - e.gc;
    });
  }
  return Object.values(stats).sort((a,b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
}

function calcularTablaExtendidaGrande(){
  const dH = disciplinas.hombres;
  const idxGrande = dH.grupos.findIndex(g => g.length === 4);
  const tablaBase = calcularTabla(dH.grupos[idxGrande], dH.partidos[idxGrande]);
  const stats = {};
  tablaBase.forEach(e => { stats[e.equipo] = Object.assign({}, e); });

  const ultimaRonda = dH.calendarioSabado && dH.calendarioSabado[dH.calendarioSabado.length - 1];
  if(ultimaRonda && ultimaRonda.partidos){
    ultimaRonda.partidos.forEach(p => {
      if(typeof p.golesLocal !== 'number' || typeof p.golesVisitante !== 'number') return;
      if(!stats[p.visitante]) return;
      const e = stats[p.visitante];
      e.pj++; e.gf += p.golesVisitante; e.gc += p.golesLocal;
      if(p.golesVisitante > p.golesLocal){ e.pg++; e.pts += 3; }
      else if(p.golesVisitante < p.golesLocal){ e.pp++; }
      else { e.pe++; e.pts += 1; }
      e.dif = e.gf - e.gc;
    });
  }
  return Object.values(stats).sort((a,b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
}

function generarSemifinalFutbol(){
  const dH = disciplinas.hombres;
  if(!dH.calendarioSabado){
    alert('Primero genera el calendario y los cruces.');
    return;
  }

  const tablaChicoExt = calcularTablaExtendidaChico();
  if(tablaChicoExt.some(e => e.pj < 3)){
    alert('Todavía faltan resultados de los cruces. Completa esos 2 partidos antes de generar la Semifinal.');
    return;
  }

  const idxGrande = dH.grupos.findIndex(g => g.length === 4);
  const tablaGrande = calcularTabla(dH.grupos[idxGrande], dH.partidos[idxGrande]);

  const primeroChico = tablaChicoExt[0].equipo;
  const segundoChico = tablaChicoExt[1].equipo;
  const primeroGrande = tablaGrande[0].equipo;
  const segundoGrande = tablaGrande[1].equipo;

  dH.semifinal = [
    { local: primeroChico, visitante: segundoGrande, golesLocal: null, golesVisitante: null, ganador: null },
    { local: primeroGrande, visitante: segundoChico, golesLocal: null, golesVisitante: null, ganador: null }
  ];

  guardarEstado();
  renderizarSemifinalFutbol();
}

function actualizarMarcadorSemifinal(numPartido, campo, valor){
  const dH = disciplinas.hombres;
  const partido = dH.semifinal[numPartido];
  partido[campo] = valor;

  if(typeof partido.golesLocal === 'number' && typeof partido.golesVisitante === 'number'){
    if(partido.golesLocal === partido.golesVisitante){
      alert('No puede haber empate en Semifinal. Corrige el marcador.');
      partido.golesLocal = null;
      partido.golesVisitante = null;
      partido.ganador = null;
    } else {
      partido.ganador = partido.golesLocal > partido.golesVisitante ? partido.local : partido.visitante;
    }
  } else {
    partido.ganador = null;
  }

  guardarEstado();
  renderizarSemifinalFutbol();
}

function renderizarSemifinalFutbol(){
  const cont = document.getElementById('semifinal-futbol');
  if(!cont) return;
  cont.innerHTML = '';

  const dH = disciplinas.hombres;
  if(!dH.semifinal){
    cont.innerHTML = '<p class="add-note">Aún no se ha generado la Semifinal. Completa los cruces y da clic en "Generar Semifinal".</p>';
    return;
  }

  const soloLectura = !esOrganizador();
  let html = '<table><tr><th>Semifinal</th><th>Local</th><th>Marcador</th><th>Visitante</th><th>Ganador</th></tr>';
  dH.semifinal.forEach((p, idx) => {
    html += '<tr><td>SF' + (idx + 1) + '</td><td>' + p.local + '</td>' +
      '<td><input type="number" min="0" class="input-semi" style="width:36px;" data-numpartido="' + idx + '" data-campo="golesLocal" value="' + (p.golesLocal ?? '') + '"' + (soloLectura ? ' disabled' : '') + '> - ' +
      '<input type="number" min="0" class="input-semi" style="width:36px;" data-numpartido="' + idx + '" data-campo="golesVisitante" value="' + (p.golesVisitante ?? '') + '"' + (soloLectura ? ' disabled' : '') + '></td>' +
      '<td>' + p.visitante + '</td><td>' + (p.ganador || '—') + '</td></tr>';
  });
  html += '</table>';
  cont.innerHTML = html;

  cont.querySelectorAll('.input-semi').forEach(input => {
    input.addEventListener('change', (e) => {
      const numPartido = Number(e.target.dataset.numpartido);
      const campo = e.target.dataset.campo;
      const valor = e.target.value === '' ? null : Number(e.target.value);
      actualizarMarcadorSemifinal(numPartido, campo, valor);
    });
  });
}

function renderizarGrupos(){
  const d = disciplinas[disciplinaActual];
  document.querySelector('#s2 h1').textContent = 'Grupos generados — ' + d.titulo;

  const cardCalendario = document.getElementById('card-calendario-futbol');
  if(cardCalendario){
    const esFutbol = (disciplinaActual === 'hombres' || disciplinaActual === 'mujeres');
    cardCalendario.style.display = esFutbol ? '' : 'none';
  }

  const cardSemifinal = document.getElementById('card-semifinal-futbol');
  if(cardSemifinal){
    cardSemifinal.style.display = (disciplinaActual === 'hombres') ? '' : 'none';
    if(disciplinaActual === 'hombres') renderizarSemifinalFutbol();
  }

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

function generarCombinaciones(equipos){
  const partidos = [];
  for(let i = 0; i < equipos.length; i++){
    for(let j = i + 1; j < equipos.length; j++){
      partidos.push({
        local: equipos[i],
        visitante: equipos[j],
        golesLocal: null,
        golesVisitante: null
      });
    }
  }
  return partidos;
}

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

function calcularTabla(equiposDelGrupo, partidosDelGrupo){
  const stats = {};
  equiposDelGrupo.forEach(nombre => {
    stats[nombre] = { equipo: nombre, pj:0, pg:0, pe:0, pp:0, gf:0, gc:0, dif:0, pts:0 };
  });

  partidosDelGrupo.forEach(p => {
    if(typeof p.golesLocal !== 'number' || typeof p.golesVisitante !== 'number') return;

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

  const tabla = Object.values(stats).map(e => {
    e.dif = e.gf - e.gc;
    return e;
  });

  tabla.sort((a,b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);

  return tabla;
}

function obtenerClasificados(numPorGrupo = 2){
  const d = disciplinas[disciplinaActual];
  const numGrupos = d.grupos.length;

  let candidatosTodos = [];
  d.grupos.forEach((equiposDelGrupo, idxGrupo) => {
    const partidosDelGrupo = d.partidos[idxGrupo];
    const tabla = calcularTabla(equiposDelGrupo, partidosDelGrupo);
    tabla.forEach((e, pos) => {
      candidatosTodos.push({
        equipo: e.equipo,
        posGrupo: pos + 1,
        grupoIdx: idxGrupo,
        pts: e.pts, dif: e.dif, gf: e.gf
      });
    });
  });

  let clasificados;

  if(numGrupos === 1 || numGrupos % 2 === 0){
    clasificados = candidatosTodos.filter(c => c.posGrupo <= numPorGrupo);
  } else {
    const ganadores = candidatosTodos.filter(c => c.posGrupo === 1);
    const tamanoObjetivo = siguientePotenciaDeDos(ganadores.length);
    const faltantes = tamanoObjetivo - ganadores.length;

    let extras = [];
    if(faltantes > 0){
      const resto = candidatosTodos.filter(c => c.posGrupo > 1);
      resto.sort((a, b) =>
        a.posGrupo - b.posGrupo ||
        b.pts - a.pts || b.dif - a.dif || b.gf - a.gf
      );
      extras = resto.slice(0, faltantes);
    }

    clasificados = ganadores.concat(extras);
  }

  clasificados.sort((a, b) =>
    a.posGrupo - b.posGrupo ||
    b.pts - a.pts || b.dif - a.dif || b.gf - a.gf
  );

  return clasificados;
}

function siguientePotenciaDeDos(n){
  let p = 1;
  while(p < n) p *= 2;
  return p;
}

function ordenSiembra(n){
  if(n === 1) return [1];
  const prev = ordenSiembra(n / 2);
  const resultado = [];
  prev.forEach(s => { resultado.push(s); resultado.push(n + 1 - s); });
  return resultado;
}

function armarCrucesSinRepetirGrupo(clasificados){
  const ganadores = clasificados.filter(c => c.posGrupo === 1)
    .slice().sort((a,b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);

  const otrosDisponibles = clasificados.filter(c => c.posGrupo !== 1)
    .slice().sort((a,b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);

  const resultado = [];

  ganadores.forEach(ganador => {
    let idxElegido = -1;
    for(let i = otrosDisponibles.length - 1; i >= 0; i--){
      if(otrosDisponibles[i].grupoIdx !== ganador.grupoIdx){
        idxElegido = i;
        break;
      }
    }
    if(idxElegido === -1 && otrosDisponibles.length > 0){
      idxElegido = otrosDisponibles.length - 1;
    }

    if(idxElegido !== -1){
      const rival = otrosDisponibles.splice(idxElegido, 1)[0];
      resultado.push(ganador.equipo, rival.equipo);
    } else {
      resultado.push(ganador.equipo);
    }
  });

  while(otrosDisponibles.length > 0){
    resultado.push(otrosDisponibles.shift().equipo);
  }

  return resultado;
}

function generarBracket(numPorGrupo = 2){
  const d = disciplinas[disciplinaActual];
  const clasificados = obtenerClasificados(numPorGrupo);
  const bracketPrevio = d.bracket;

  const nombresOrdenados = armarCrucesSinRepetirGrupo(clasificados);
  const tamanoBracket = siguientePotenciaDeDos(nombresOrdenados.length);
  while(nombresOrdenados.length < tamanoBracket){
    nombresOrdenados.push('BYE');
  }
  const slots = nombresOrdenados;

  const ronda1 = [];
  for(let i = 0; i < slots.length; i += 2){
    const local = slots[i];
    const visitante = slots[i + 1];
    let ganador = null;
    let golesLocal = null;
    let golesVisitante = null;

    if(local === 'BYE') ganador = visitante;
    else if(visitante === 'BYE') ganador = local;

    if(bracketPrevio && bracketPrevio[0]){
      const previo = bracketPrevio[0].find(p =>
        (p.local === local && p.visitante === visitante) ||
        (p.local === visitante && p.visitante === local)
      );
      if(previo){
        if(previo.local === local){
          golesLocal = previo.golesLocal ?? null;
          golesVisitante = previo.golesVisitante ?? null;
        } else {
          golesLocal = previo.golesVisitante ?? null;
          golesVisitante = previo.golesLocal ?? null;
        }
        if(previo.ganador) ganador = previo.ganador;
      }
    }

    ronda1.push({ local, visitante, ganador, golesLocal, golesVisitante });
  }

  const rondas = [ronda1];

  while(rondas[rondas.length - 1].length > 1){
    const anterior = rondas[rondas.length - 1];
    const siguiente = [];
    for(let i = 0; i < anterior.length; i += 2){
      siguiente.push({
        local: anterior[i].ganador || 'Por definir',
        visitante: anterior[i + 1].ganador || 'Por definir',
        ganador: null,
        golesLocal: null,
        golesVisitante: null
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
      actual[i].ganador = null;
      actual[i].golesLocal = null;
      actual[i].golesVisitante = null;
    }
  }
}

function actualizarMarcadorEliminacion(numRonda, numPartido, campo, valor){
  const d = disciplinas[disciplinaActual];
  const partido = d.bracket[numRonda][numPartido];
  partido[campo] = valor;

  if(typeof partido.golesLocal === 'number' && typeof partido.golesVisitante === 'number'){
    if(partido.golesLocal === partido.golesVisitante){
      alert('No puede haber empate en eliminación directa. Corrige el marcador.');
      partido.golesLocal = null;
      partido.golesVisitante = null;
      partido.ganador = null;
    } else {
      partido.ganador = partido.golesLocal > partido.golesVisitante ? partido.local : partido.visitante;
    }
  } else {
    partido.ganador = null;
  }

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

  const tamanoInicial = d.bracket[0].length * 2;
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

      const esFinal = ronda.length === 1 && partido.ganador;
      const esBye = partido.local === 'BYE' || partido.visitante === 'BYE';
      const noDefinido = partido.local === 'Por definir' || partido.visitante === 'Por definir';
      const soloLectura = !esOrganizador() || esBye || noDefinido;

      ['local','visitante'].forEach(lado => {
        const nombre = partido[lado];
        const campoGoles = lado === 'local' ? 'golesLocal' : 'golesVisitante';
        const fila = document.createElement('div');
        fila.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:6px;';

        const esGanador = partido.ganador && partido.ganador === nombre;

        const spanNombre = document.createElement('span');
        spanNombre.textContent = nombre;
        if(esGanador) spanNombre.style.cssText = 'color:var(--oro-suave);font-weight:bold;';
        fila.appendChild(spanNombre);

        const inputGoles = document.createElement('input');
        inputGoles.type = 'number';
        inputGoles.min = '0';
        inputGoles.style.cssText = 'width:36px;';
        inputGoles.value = partido[campoGoles] ?? '';
        inputGoles.disabled = soloLectura;
        inputGoles.addEventListener('change', (e) => {
          const valor = e.target.value === '' ? null : Number(e.target.value);
          actualizarMarcadorEliminacion(numRonda, numPartido, campoGoles, valor);
        });
        fila.appendChild(inputGoles);

        matchDiv.appendChild(fila);
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
let grupoTablaActual = 0;

function renderizarTabla(){
  const d = disciplinas[disciplinaActual];
  if(!d.partidos) return;

  document.querySelector('#s3 h1').textContent =
    'Partidos y tabla de posiciones — Grupo ' + (grupoTablaActual + 1);

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

  const contPartidos = document.getElementById('partidos-grupo');
  contPartidos.innerHTML = '';
  partidosDelGrupo.forEach((p, idx) => {
    const jugado = typeof p.golesLocal === 'number' && typeof p.golesVisitante === 'number';
    const fila = document.createElement('tr');
    const soloLectura = !esOrganizador();
    fila.innerHTML =
      '<td>' + p.local + '</td>' +
      '<td><input type="number" min="0" style="width:40px" value="' + (p.golesLocal ?? '') + '" data-idx="' + idx + '" data-campo="golesLocal"' + (soloLectura ? ' disabled' : '') + '></td>' +
      '<td>vs</td>' +
      '<td><input type="number" min="0" style="width:40px" value="' + (p.golesVisitante ?? '') + '" data-idx="' + idx + '" data-campo="golesVisitante"' + (soloLectura ? ' disabled' : '') + '></td>' +
      '<td>' + p.visitante + '</td>' +
      '<td><span class="pill" style="' + (jugado ? '' : 'background:var(--linea);color:#555') + '">' + (jugado ? 'Finalizado' : 'Pendiente') + '</span></td>';
    contPartidos.appendChild(fila);
  });

  contPartidos.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', (e) => {
      if(!esOrganizador()) return;
      const idx = Number(e.target.dataset.idx);
      const campo = e.target.dataset.campo;
      const valor = e.target.value === '' ? null : Number(e.target.value);
      d.partidos[grupoTablaActual][idx][campo] = valor;
      guardarEstado();
      renderizarTabla();
    });
  });

  const tabla = calcularTabla(equiposDelGrupo, partidosDelGrupo);
  const contTabla = document.getElementById('tabla-posiciones');
  contTabla.innerHTML =
    '<tr><th>Pos</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>Dif</th><th>Pts</th></tr>';
  tabla.forEach((e, pos) => {
    const esTop = pos < 2;
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

  d.grupos = [];
  for(let i=0; i<d.numGrupos; i++){
    d.grupos.push([]);
  }

  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
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

  d.equipos.push(nombre);
  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
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
    renderizarCalendarioFutbol();
  }
  if(i === 3){
    grupoTablaActual = 0;
    renderizarTabla();
  }
  if(i === 4){
    if(!disciplinas[disciplinaActual].bracket){
      generarBracket(2);
    }
    renderizarBracket();
  }
  if(i === 5){
    renderizarListaParejas();
    if(mundial40.bracket) renderizarBracketMundial();
  }
  if(i === 6){
    renderizarInstituciones();
  }
}

const pantallaAnterior = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 0,
  6: 0
};

function irAtras(actual){
  ir(pantallaAnterior[actual]);
}

async function iniciarApp(){
  const cargaExitosa = await cargarEstado();

  if(!cargaExitosa){
    document.body.innerHTML =
      '<div style="padding:40px;text-align:center;font-family:sans-serif;">' +
      '<h1>⚠️ No se pudo conectar con la base de datos</h1>' +
      '<p>Por seguridad, la app no va a continuar para evitar guardar datos incorrectos.</p>' +
      '<p>Verifica tu conexión a internet y recarga la página (F5).</p>' +
      '</div>';
    return;
  }

  if(!esOrganizador()){
    pedirPin();
  }

  aplicarModoLectura();
  seleccionarDisciplina('hombres', false);
  ir(0);
}

iniciarApp();