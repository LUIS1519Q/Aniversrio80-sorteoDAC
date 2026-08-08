// --- Datos por disciplina ---
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
    numGrupos: 2, // 2 grupos de 4
    equipos: ['Bloqueo Total','Remate DAC','Saque Alto','Red Sur','Los Rematadores','Ace Aéreo','Cancha Norte','Voley 80']
  }
};

let mundial40 = {
  parejas: [],
  bracket: null
};

let instituciones = {};

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
  if(!confirm('¿Eliminar la institución "' + nombre + '"?')) return;
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

  if(mundial40.bracket) generarBracketMundial();
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
    alert('Esta pareja ya jugó su primer partido.');
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
  if(parejaYaJugo(nombrePareja(pareja))){ alert('Esta pareja ya jugó.'); return; }
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
  if(!mundial40.bracket) return;
  if(!confirm('¿Rehacer el sorteo del Mundial de 40?')) return;
  mundial40.bracket = null;
  guardarEstado();
  renderizarBracketMundial();
}

function cambiarNumGrupos(valorTexto){
  if(!esOrganizador()) return;
  const nuevo = Number(valorTexto);
  const d = disciplinas[disciplinaActual];
  if(nuevo === d.numGrupos) return;
  if(!confirm('Cambiar el número de grupos reiniciará el sorteo.')) {
    seleccionarDisciplina(disciplinaActual, false);
    return;
  }
  d.numGrupos = nuevo;
  d.grupos = [];
  for(let i = 0; i < nuevo; i++) d.grupos.push([]);
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
  if(!confirm('¿Deshacer este resultado?')) return;
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

    if(!(ronda.length === 1 && ronda[0].ganador)) cont.appendChild(rondaDiv);
  });
}

function guardarHistorial(paquete){
  const marcaTiempo = Date.now();
  window.firebaseSet(window.firebaseRef(window.firebaseDB, 'historial/' + marcaTiempo), paquete).catch(e => console.error(e));
}

function limpiarUndefined(valor){
  if(Array.isArray(valor)) return valor.map(limpiarUndefined);
  if(valor && typeof valor === 'object'){
    const limpio = {};
    Object.keys(valor).forEach(clave => {
      if(valor[clave] !== undefined) limpio[clave] = limpiarUndefined(valor[clave]);
    });
    return limpio;
  }
  return valor;
}

function guardarEstado(){
  const paqueteOriginal = { disciplinas: disciplinas, mundial40: mundial40, instituciones: instituciones };
  const paquete = limpiarUndefined(paqueteOriginal);
  window.firebaseSet(window.firebaseRef(window.firebaseDB, 'estado'), paquete)
    .then(() => guardarHistorial(paquete))
    .catch(error => console.error('Error al guardar en Firebase:', error));
}

function convertirArraysFirebase(valor){
  if(Array.isArray(valor)) return valor.map(convertirArraysFirebase);
  if(valor && typeof valor === 'object'){
    const claves = Object.keys(valor);
    const esArrayConvertido = claves.length > 0 && claves.every(k => /^\d+$/.test(k));
    if(esArrayConvertido){
      const maxIndice = Math.max(...claves.map(Number));
      const arr = [];
      for(let i = 0; i <= maxIndice; i++) arr[i] = valor[i] !== undefined ? convertirArraysFirebase(valor[i]) : [];
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
    if(!snapshot.exists()) return true;

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
            calendarioSabado: guardado.calendarioSabado || undefined,
            calendarioVoley: guardado.calendarioVoley || undefined,
            semifinal: guardado.semifinal || undefined,
            final: guardado.final || undefined,
            tercerPuesto: guardado.tercerPuesto || undefined,
            cuartoPuesto: guardado.cuartoPuesto || undefined,
            quintoPuesto: guardado.quintoPuesto || undefined,
            tiposEquipo: guardado.tiposEquipo || undefined,
            jugadoresPorEquipo: guardado.jugadoresPorEquipo || undefined,
            rondaUno: guardado.rondaUno || undefined,
            semifinalesBasquet: guardado.semifinalesBasquet || undefined,
            perdedoresBasquet: guardado.perdedoresBasquet || undefined,
            finalBasquet: guardado.finalBasquet || undefined,
            tercerPuestoBasquet: guardado.tercerPuestoBasquet || undefined,
            cuartoPuestoBasquet: guardado.cuartoPuestoBasquet || undefined,
            quintoPuestoBasquet: guardado.quintoPuestoBasquet || undefined
          };
        }
      });
    }

    if(datosGuardados.mundial40) mundial40 = datosGuardados.mundial40;
    if(datosGuardados.instituciones) instituciones = datosGuardados.instituciones;

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
  if(esOrganizador()){ alert('Ya estás en modo organizador.'); return; }
  if(pedirPin()){ aplicarModoLectura(); ir(0); }
}
function pedirPin(){
  const intento = prompt('Ingresa el PIN de organizador:');
  if(intento === null) return false;
  if(intento.trim() === PIN_ORGANIZADOR){
    sessionStorage.setItem('modoOrganizador', 'true');
    return true;
  } else {
    alert('PIN incorrecto.');
    return false;
  }
}

function aplicarModoLectura(){
  const modoLectura = !esOrganizador();
  const idsAOcultar = [
    'card-agregar-equipo', 'botones-sorteo', 'card-inscribir-pareja',
    'boton-generar-bracket-mundial', 'boton-regenerar-bracket', 'card-num-grupos',
    'boton-generar-calendario-futbol', 'boton-generar-semifinal', 'boton-generar-final',
    'boton-generar-3ra-ronda', 'boton-generar-ronda1-basquet', 'btn-generar-fase2-basquet',
    'boton-generar-calendario-voley', 'boton-generar-semifinal-voley', 'boton-generar-final-voley'
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

  const selectorTipoEquipo = document.getElementById('tipo-nuevo-equipo');
  if(selectorTipoEquipo) selectorTipoEquipo.style.display = (clave === 'basquet') ? '' : 'none';
  renderizarEquiposBasquet();
  renderizarJugadoresMixtos();

  const esBasquet = (clave === 'basquet');
  const cardNumGrupos = document.getElementById('card-num-grupos');
  const bloqueSorteoGrupos = document.getElementById('bloque-sorteo-grupos');
  const cardRonda1Basquet = document.getElementById('card-ronda1-basquet');

  if(cardNumGrupos) cardNumGrupos.style.display = esBasquet ? 'none' : (esOrganizador() ? '' : 'none');
  if(bloqueSorteoGrupos) bloqueSorteoGrupos.style.display = esBasquet ? 'none' : '';
  if(cardRonda1Basquet) cardRonda1Basquet.style.display = esBasquet ? '' : 'none';

  if(esBasquet){
    if(navegar) ir(1);
    return;
  }

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
      btnEditar.onclick = () => editarEquipo(nombre);
      li.appendChild(btnEditar);
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = '🗑️';
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
  if(pendientes.length === 0){ alert('Ya no quedan equipos por sortear.'); return; }
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
    alert('Fútbol Masculino debe estar sorteado en exactamente 2 grupos.');
    return;
  }
  const grupoChico = dH.grupos.find(g => g.length === 3);
  const grupoGrande = dH.grupos.find(g => g.length === 4);
  if(!grupoChico || !grupoGrande){ alert('Los grupos deben ser de 3 y 4 equipos.'); return; }

  const roundsGrande = rondasRoundRobin(grupoGrande);
  const roundsChico = rondasRoundRobin(grupoChico);
  const equiposFem = (dM.equipos || []).slice(0, 3);
  const roundsFem = equiposFem.length === 3 ? rondasRoundRobin(equiposFem) : [[], [], []];

  const DUR = 45, DESCANSO = 5, ORGANIZACION = 5;
  const calendario = [];
  let horaMin = horaATotalMinutos('11:00');

  for(let i = 0; i < 3; i++){
    const partidosRonda = [];
    roundsGrande[i].forEach(p => partidosRonda.push({ tipo: 'M', local: p.local, visitante: p.visitante }));
    roundsChico[i].forEach(p => partidosRonda.push({ tipo: 'M', local: p.local, visitante: p.visitante }));
    if(roundsFem[i] && roundsFem[i].length) {
      roundsFem[i].forEach(p => partidosRonda.push({ tipo: 'F', local: p.local, visitante: p.visitante }));
    }
    calendario.push({ filaTipo: 'juego', horaIni: horaMin, horaFin: horaMin + DUR, partidos: partidosRonda });
    horaMin += DUR;
    if(i < 2){
      calendario.push({ filaTipo: 'descanso', horaIni: horaMin, horaFin: horaMin + DESCANSO });
      horaMin += DESCANSO;
      calendario.push({ filaTipo: 'organizacion', horaIni: horaMin, horaFin: horaMin + ORGANIZACION });
      horaMin += ORGANIZACION;
    }
  }

  calendario.push({ filaTipo: 'descanso', horaIni: horaMin, horaFin: horaMin + DESCANSO });
  horaMin += DESCANSO;
  calendario.push({ filaTipo: 'organizacion', horaIni: horaMin, horaFin: horaMin + ORGANIZACION });
  horaMin += ORGANIZACION;
  calendario.push({
    filaTipo: 'juego',
    horaIni: horaMin, horaFin: horaMin + DUR,
    partidos: [
      { tipo: 'M', local: '1ro Grupo (3)', visitante: '2do Grupo (4)', pendienteDeTabla: true },
      { tipo: 'M', local: '2do Grupo (3)', visitante: '3ro Grupo (4)', pendienteDeTabla: true },
      { tipo: 'M', local: '3ro Grupo (3)', visitante: '4to Grupo (4)', pendienteDeTabla: true }
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
      if(local !== 'BYE' && visitante !== 'BYE') partidos.push({ local, visitante });
    }
    rondas.push(partidos);
    const ultimo = arr[n - 1];
    for(let i = n - 1; i > 1; i--) arr[i] = arr[i - 1];
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
    cont.innerHTML = '<p class="add-note">Aún no se ha generado el calendario. Sortea Fútbol en 2 grupos y da clic en "Generar calendario".</p>';
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
        if(p.esCruce){
          const marcador = (typeof p.golesLocal === 'number' && typeof p.golesVisitante === 'number')
            ? ' (' + p.golesLocal + '-' + p.golesVisitante + ')'
            : ' (por jugar)';
          etiqueta += marcador;
        }
        if(idx < 4) celdas[idx] = etiqueta;
      });
      html += '<tr><td>' + horaTexto + '</td><td>Juego</td><td>' + celdas[0] + '</td><td>' + celdas[1] + '</td><td>' + celdas[2] + '</td><td>' + celdas[3] + '</td></tr>';
    }
  });
  tabla.innerHTML = html;
  cont.appendChild(tabla);
}

function generarTerceraRondaGrupoA(){
  const dH = disciplinas.hombres;
  if(!dH.grupos || !dH.partidos) return;

  const idxChico = dH.grupos.findIndex(g => g.length === 3);
  const idxGrande = dH.grupos.findIndex(g => g.length === 4);
  if(idxChico === -1 || idxGrande === -1) return;

  const tablaChico = calcularTabla(dH.grupos[idxChico], dH.partidos[idxChico]);
  const tablaGrande = calcularTabla(dH.grupos[idxGrande], dH.partidos[idxGrande]);
  if(tablaChico.some(e => e.pj < 2) || tablaGrande.some(e => e.pj < 3)){
    alert('Faltan partidos de la fase de grupos por jugar.'); return;
  }

  const ultimaRonda = dH.calendarioSabado[dH.calendarioSabado.length - 1];
  ultimaRonda.partidos = [
    { tipo: 'M', local: tablaChico[0].equipo, visitante: tablaGrande[1].equipo, golesLocal: null, golesVisitante: null, esCruce: true },
    { tipo: 'M', local: tablaChico[1].equipo, visitante: tablaGrande[2].equipo, golesLocal: null, golesVisitante: null, esCruce: true },
    { tipo: 'M', local: tablaChico[2].equipo, visitante: tablaGrande[3].equipo, golesLocal: null, golesVisitante: null, esCruce: true }
  ];
  guardarEstado();
  renderizarCalendarioFutbol();
  renderizarTerceraRondaGrupoA();
}

function actualizarMarcadorTerceraRonda(numPartido, campo, valor){
  const dH = disciplinas.hombres;
  const ultimaRonda = dH.calendarioSabado[dH.calendarioSabado.length - 1];
  ultimaRonda.partidos[numPartido][campo] = valor;
  guardarEstado();
  renderizarTerceraRondaGrupoA();
  renderizarCalendarioFutbol();
}

function renderizarTerceraRondaGrupoA(){
  const cont = document.getElementById('tercera-ronda-grupoA');
  if(!cont) return;
  cont.innerHTML = '';
  const dH = disciplinas.hombres;
  const ultimaRonda = dH.calendarioSabado && dH.calendarioSabado[dH.calendarioSabado.length - 1];
  const tienePartidos = ultimaRonda && ultimaRonda.partidos && ultimaRonda.partidos.length === 3 && ultimaRonda.partidos[0].esCruce;
  if(!tienePartidos){
    cont.innerHTML = '<p class="add-note">Aún no se ha generado la 3ra ronda.</p>'; return;
  }

  const soloLectura = !esOrganizador();
  let html = '<table><tr><th>Partido</th><th>Grupo A</th><th>Marcador</th><th>Grupo B</th></tr>';
  ultimaRonda.partidos.forEach((p, idx) => {
    html += '<tr><td>3ra ronda ' + (idx + 1) + '</td><td>' + p.local + '</td>' +
      '<td><input type="number" min="0" class="input-3ra" style="width:36px;" data-numpartido="' + idx + '" data-campo="golesLocal" value="' + (p.golesLocal ?? '') + '"' + (soloLectura ? ' disabled' : '') + '> - ' +
      '<input type="number" min="0" class="input-3ra" style="width:36px;" data-numpartido="' + idx + '" data-campo="golesVisitante" value="' + (p.golesVisitante ?? '') + '"' + (soloLectura ? ' disabled' : '') + '></td>' +
      '<td>' + p.visitante + '</td></tr>';
  });
  html += '</table>';
  cont.innerHTML = html;

  cont.querySelectorAll('.input-3ra').forEach(input => {
    input.addEventListener('change', (e) => {
      const numPartido = Number(e.target.dataset.numpartido);
      const campo = e.target.dataset.campo;
      const valor = e.target.value === '' ? null : Number(e.target.value);
      actualizarMarcadorTerceraRonda(numPartido, campo, valor);
    });
  });

  renderizarTablaFinalGrupoA();
  renderizarCandidatos5to();
}

function renderizarTablaFinalGrupoA(){
  const cont = document.getElementById('tabla-final-grupoA');
  if(!cont) return;
  const dH = disciplinas.hombres;
  if(!dH.grupos || dH.grupos.findIndex(g => g.length === 3) === -1){ cont.innerHTML = ''; return; }
  const tabla = calcularTablaFinalGrupoA();
  let html = '<b>Tabla final de Grupo A (2 partidos internos + 3ra ronda)</b>';
  html += '<table><tr><th>Pos</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>Dif</th><th>Pts</th></tr>';
  tabla.forEach((e, pos) => {
    html += '<tr' + (pos < 2 ? ' class="top3"' : '') + '>' +
      '<td>' + (pos + 1) + '</td><td>' + e.equipo + '</td><td>' + e.pj + '</td><td>' + e.pg + '</td>' +
      '<td>' + e.pe + '</td><td>' + e.pp + '</td><td>' + (e.dif > 0 ? '+' : '') + e.dif + '</td><td>' + e.pts + '</td></tr>';
  });
  html += '</table>';
  cont.innerHTML = html;
}

function renderizarCandidatos5to(){
  const cont = document.getElementById('candidatos-5to-puesto');
  if(!cont) return;
  const dH = disciplinas.hombres;
  const idxGrande = dH.grupos.findIndex(g => g.length === 4);
  const idxChico = dH.grupos.findIndex(g => g.length === 3);
  if(idxGrande === -1 || idxChico === -1 || !dH.partidos){ cont.innerHTML = ''; return; }

  const ultimaRonda = dH.calendarioSabado && dH.calendarioSabado[dH.calendarioSabado.length - 1];
  if(!ultimaRonda || !ultimaRonda.partidos || !ultimaRonda.partidos[0].esCruce){ cont.innerHTML = ''; return; }

  const tablaAFinal = calcularTablaFinalGrupoA();
  const tablaB = calcularTabla(dH.grupos[idxGrande], dH.partidos[idxGrande]);

  const candidatos = [];
  const terceroA = tablaAFinal[2];
  candidatos.push({ equipo: terceroA.equipo, origen: '3ro Grupo A (+1 pto bono)', pts: terceroA.pts + 1, dif: terceroA.dif, gf: terceroA.gf });

  [{ e: tablaB[2], origen: '3ro Grupo B' }, { e: tablaB[3], origen: '4to Grupo B' }].forEach(item => {
    const gano = gano3raRondaEquipoB(item.e.equipo);
    candidatos.push({ equipo: item.e.equipo, origen: item.origen + (gano ? ' (+1 pto, ganó 3ra ronda)' : ' (0 pto)'), pts: item.e.pts + (gano ? 1 : 0), dif: item.e.dif, gf: item.e.gf });
  });
  candidatos.sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);

  let html = '<b>Candidatos al 5to puesto</b>';
  html += '<table><tr><th>Pos</th><th>Equipo</th><th>Origen</th><th>Pts (con bono)</th><th>Dif</th><th>GF</th></tr>';
  candidatos.forEach((c, pos) => {
    html += '<tr' + (pos === 0 ? ' class="top3"' : '') + '>' +
      '<td>' + (pos + 1) + '</td><td>' + c.equipo + '</td><td>' + c.origen + '</td>' +
      '<td>' + c.pts + '</td><td>' + (c.dif > 0 ? '+' : '') + c.dif + '</td><td>' + c.gf + '</td></tr>';
  });
  html += '</table>';
  if(candidatos.length) html += '<p class="add-note">🏅 5to lugar: <b>' + candidatos[0].equipo + '</b></p>';
  cont.innerHTML = html;
}

function calcularTablaFinalGrupoA(){
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
  return Object.values(stats).sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
}

function gano3raRondaEquipoB(nombreEquipo){
  const dH = disciplinas.hombres;
  const ultimaRonda = dH.calendarioSabado && dH.calendarioSabado[dH.calendarioSabado.length - 1];
  if(!ultimaRonda || !ultimaRonda.partidos) return false;
  const partido = ultimaRonda.partidos.find(p => p.visitante === nombreEquipo);
  if(!partido || typeof partido.golesLocal !== 'number' || typeof partido.golesVisitante !== 'number') return false;
  return partido.golesVisitante > partido.golesLocal;
}

function generarSemifinalFutbol(){
  const dH = disciplinas.hombres;
  const ultimaRonda = dH.calendarioSabado && dH.calendarioSabado[dH.calendarioSabado.length - 1];
  if(!ultimaRonda || !ultimaRonda.partidos || ultimaRonda.partidos.some(p => typeof p.golesLocal !== 'number')) {
    alert('Faltan resultados de la 3ra ronda de Grupo A.'); return;
  }
  const tablaAFinal = calcularTablaFinalGrupoA();
  const idxGrande = dH.grupos.findIndex(g => g.length === 4);
  const tablaB = calcularTabla(dH.grupos[idxGrande], dH.partidos[idxGrande]);
  dH.semifinal = [
    { local: tablaAFinal[0].equipo, visitante: tablaB[1].equipo, golesLocal: null, golesVisitante: null, ganador: null },
    { local: tablaB[0].equipo, visitante: tablaAFinal[1].equipo, golesLocal: null, golesVisitante: null, ganador: null }
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
      alert('No puede haber empate en Semifinal.');
      partido.golesLocal = null; partido.golesVisitante = null; partido.ganador = null;
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
  if(!dH.semifinal){ cont.innerHTML = '<p class="add-note">Aún no se ha generado la Semifinal.</p>'; return; }

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
      actualizarMarcadorSemifinal(Number(e.target.dataset.numpartido), e.target.dataset.campo, e.target.value === '' ? null : Number(e.target.value));
    });
  });
}

function generarFinalYPuestosFutbol(){
  const dH = disciplinas.hombres;
  if(!dH.semifinal || dH.semifinal.some(p => !p.ganador)){
    alert('Completa ambas Semifinales primero.'); return;
  }
  const ganadores = dH.semifinal.map(p => p.ganador);
  const perdedores = dH.semifinal.map(p => p.ganador === p.local ? p.visitante : p.local);

  dH.final = { local: ganadores[0], visitante: ganadores[1], golesLocal: null, golesVisitante: null, ganador: null };

  const perdedoresConDif = dH.semifinal.map((p, idx) => {
    const perdioLocal = p.ganador !== p.local;
    const dif = perdioLocal ? (p.golesLocal - p.golesVisitante) : (p.golesVisitante - p.golesLocal);
    return { equipo: perdedores[idx], dif };
  });
  perdedoresConDif.sort((a, b) => b.dif - a.dif);
  dH.tercerPuesto = perdedoresConDif[0].equipo;
  dH.cuartoPuesto = perdedoresConDif[1].equipo;

  const idxGrande = dH.grupos.findIndex(g => g.length === 4);
  const tablaAFinal = calcularTablaFinalGrupoA();
  const tablaB = calcularTabla(dH.grupos[idxGrande], dH.partidos[idxGrande]);

  const candidatos = [];
  candidatos.push({ equipo: tablaAFinal[2].equipo, pts: tablaAFinal[2].pts + 1, dif: tablaAFinal[2].dif, gf: tablaAFinal[2].gf });
  [tablaB[2], tablaB[3]].forEach(e => {
    const gano = gano3raRondaEquipoB(e.equipo);
    candidatos.push({ equipo: e.equipo, pts: e.pts + (gano ? 1 : 0), dif: e.dif, gf: e.gf });
  });
  candidatos.sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
  dH.quintoPuesto = candidatos[0].equipo;

  guardarEstado();
  renderizarFinalYPuestosFutbol();
}

function actualizarMarcadorFinal(campo, valor){
  const dH = disciplinas.hombres;
  dH.final[campo] = valor;
  if(typeof dH.final.golesLocal === 'number' && typeof dH.final.golesVisitante === 'number'){
    if(dH.final.golesLocal === dH.final.golesVisitante){
      alert('No puede haber empate.');
      dH.final.golesLocal = null; dH.final.golesVisitante = null; dH.final.ganador = null;
    } else {
      dH.final.ganador = dH.final.golesLocal > dH.final.golesVisitante ? dH.final.local : dH.final.visitante;
    }
  } else { dH.final.ganador = null; }
  guardarEstado();
  renderizarFinalYPuestosFutbol();
}

function renderizarFinalYPuestosFutbol(){
  const cont = document.getElementById('final-puestos-futbol');
  if(!cont) return;
  cont.innerHTML = '';
  const dH = disciplinas.hombres;
  if(!dH.final){ cont.innerHTML = '<p class="add-note">Aún no se ha generado la Final.</p>'; return; }

  const soloLectura = !esOrganizador();
  let html = '<table><tr><th>Puesto</th><th>Detalle</th></tr>';
  html += '<tr><td>FINAL (1ro/2do)</td><td>' + dH.final.local +
    ' <input type="number" min="0" id="final-golesLocal" style="width:36px;" value="' + (dH.final.golesLocal ?? '') + '"' + (soloLectura ? ' disabled' : '') + '> - ' +
    '<input type="number" min="0" id="final-golesVisitante" style="width:36px;" value="' + (dH.final.golesVisitante ?? '') + '"' + (soloLectura ? ' disabled' : '') + '> ' + dH.final.visitante +
    (dH.final.ganador ? ' 🏆 ' + dH.final.ganador : '') + '</td></tr>';
  html += '<tr><td>3er puesto</td><td>' + (dH.tercerPuesto || '—') + '</td></tr>';
  html += '<tr><td>4to puesto</td><td>' + (dH.cuartoPuesto || '—') + '</td></tr>';
  html += '<tr><td>5to puesto</td><td>' + (dH.quintoPuesto || '—') + '</td></tr>';
  html += '</table>';
  cont.innerHTML = html;

  const inputLocal = document.getElementById('final-golesLocal');
  const inputVisitante = document.getElementById('final-golesVisitante');
  if(inputLocal) inputLocal.addEventListener('change', (e) => actualizarMarcadorFinal('golesLocal', e.target.value === '' ? null : Number(e.target.value)));
  if(inputVisitante) inputVisitante.addEventListener('change', (e) => actualizarMarcadorFinal('golesVisitante', e.target.value === '' ? null : Number(e.target.value)));
}

function renderizarGrupos(){
  const d = disciplinas[disciplinaActual];
  const esBasquet = (disciplinaActual === 'basquet');
  const esVoley = (disciplinaActual === 'voley');
  const esFutbol = (disciplinaActual === 'hombres' || disciplinaActual === 'mujeres');

  document.getElementById('contenedor-grupos-futbol').style.display = esFutbol ? '' : 'none';
  document.getElementById('contenedor-grupos-basquet').style.display = esBasquet ? '' : 'none';
  document.getElementById('contenedor-grupos-voley').style.display = esVoley ? '' : 'none';

  if(esBasquet){
    document.querySelector('#contenedor-grupos-basquet h1').textContent = 'Grupos generados — ' + d.titulo;
    renderizarGruposBasquet();
    renderizarCalendarioBasquet();
    return;
  }

  if(esVoley){
    document.querySelector('#contenedor-grupos-voley h1').textContent = 'Grupos generados — ' + d.titulo;
    const cont = document.getElementById('voley-grupos-container');
    cont.innerHTML = '';
    cont.style.gridTemplateColumns = 'repeat(' + d.numGrupos + ', 1fr)';
    d.grupos.forEach((equiposDelGrupo, idx) => {
      const box = document.createElement('div');
      box.className = 'grupo-box';
      let html = `<h3>GRUPO ${idx + 1}</h3><ul>`;
      if(equiposDelGrupo.length === 0){
        html += '<li style="font-style:italic;color:#aab3bb;">— sin equipos —</li>';
      } else {
        equiposDelGrupo.forEach((nombre, pos) => { html += `<li><b>${pos + 1}</b> ${nombre}</li>`; });
      }
      html += '</ul>';
      box.innerHTML = html;
      cont.appendChild(box);
    });
    renderizarCalendarioVoley();
    renderizarSemifinalVoley();
    renderizarFinalVoley();
    return;
  }

  document.querySelector('#s2 h1').textContent = 'Grupos generados — ' + d.titulo;

  const cont = document.querySelector('#contenedor-grupos-futbol .grupos');
  cont.innerHTML = '';
  cont.style.gridTemplateColumns = 'repeat(' + d.numGrupos + ', 1fr)';

  d.grupos.forEach((equiposDelGrupo, idx) => {
    const box = document.createElement('div');
    box.className = 'grupo-box';
    let html = '<h3>GRUPO ' + (idx + 1) + '</h3><ul>';
    if(equiposDelGrupo.length === 0){
      html += '<li style="font-style:italic;color:#aab3bb;">— sin equipos —</li>';
    } else {
      equiposDelGrupo.forEach((nombre, pos) => { html += '<li><b>' + (pos + 1) + '</b> ' + nombre + '</li>'; });
    }
    html += '</ul>';
    box.innerHTML = html;
    cont.appendChild(box);
  });
}

function renderizarGruposBasquet(){
  const d = disciplinas.basquet;
  const g1 = document.getElementById('basquet-g1');
  const g2 = document.getElementById('basquet-g2');
  g1.innerHTML = '';
  g2.innerHTML = '';

  if(!d.rondaUno){
    g1.innerHTML = '<li style="font-style:italic;color:#aab3bb;">— sin llaves generadas —</li>';
    g2.innerHTML = '<li style="font-style:italic;color:#aab3bb;">— sin llaves generadas —</li>';
    return;
  }

  const armarLi = (p) => `<li><b>${p.llave.split(' ')[1]}</b>: ${p.local} vs ${p.visitante}</li>`;
  g1.innerHTML = armarLi(d.rondaUno[0]) + armarLi(d.rondaUno[1]);
  g2.innerHTML = armarLi(d.rondaUno[2]) + armarLi(d.rondaUno[3]);
}

function renderizarCalendarioBasquet(){
  const cont = document.getElementById('calendario-basquet');
  if(!cont) return;
  const d = disciplinas.basquet;
  
  if(!d.rondaUno){
    cont.innerHTML = '<p class="add-note">Genera la Ronda 1 en "2. Sorteo" para ver el calendario dinámico.</p>';
    return;
  }

  let html = '<table><tr><th>Hora</th><th>Partido / Instancia</th></tr>';
  let hora = horaATotalMinutos('09:00'); 

  const agregarFila = (texto) => {
    html += `<tr><td>${minutosAHora(hora)} - ${minutosAHora(hora+45)}</td><td>${texto}</td></tr>`;
    hora += 50; 
  };

  d.rondaUno.forEach(p => agregarFila(`<b>${p.llave.split(' ')[0]} ${p.llave.split(' ')[1]}</b>: ${p.local} vs ${p.visitante}`));
  
  if(d.perdedoresBasquet){
    d.perdedoresBasquet.forEach((p,i) => agregarFila(`<b>Llave Perdedores G${i+1}</b>: ${p.local} vs ${p.visitante}`));
  } else {
    agregarFila('Llave de Perdedores Grupo 1 (por definir)');
    agregarFila('Llave de Perdedores Grupo 2 (por definir)');
  }

  if(d.semifinalesBasquet){
    d.semifinalesBasquet.forEach((p,i) => agregarFila(`<b>Semifinal Grupo ${i+1}</b>: ${p.local} vs ${p.visitante}`));
  } else {
    agregarFila('Semifinal Grupo 1 (por definir)');
    agregarFila('Semifinal Grupo 2 (por definir)');
  }

  if(d.finalBasquet){
    agregarFila(`<b>Final</b>: ${d.finalBasquet.local} vs ${d.finalBasquet.visitante}`);
  } else {
    agregarFila('Final (por definir)');
  }

  html += '</table>';
  cont.innerHTML = html;
}

// ----- ECUAVOLEY CALENDAR & FINALS -----

function generarCalendarioVoley(){
  const d = disciplinas.voley;
  if(!d.grupos || d.grupos.length !== 2){ alert('Ecuavoley requiere exactamente 2 grupos.'); return; }
  if(!d.partidos) generarPartidos(); // Genera d.partidos[0] y [1] con 6 partidos c/u

  d.calendarioVoley = [];
  let c = 1;
  for(let i=0; i<6; i++){
    d.calendarioVoley.push({ grupo: 0, pIdx: i, cancha: c, ini: null, fin: null });
    c = c === 3 ? 1 : c + 1;
    d.calendarioVoley.push({ grupo: 1, pIdx: i, cancha: c, ini: null, fin: null });
    c = c === 3 ? 1 : c + 1;
  }
  guardarEstado();
  renderizarCalendarioVoley();
}

function registrarTiempoVoley(idx, tipo){
  const d = disciplinas.voley;
  const p = d.calendarioVoley[idx];
  const ahora = new Date();
  const str = ahora.getHours().toString().padStart(2,'0') + ':' + ahora.getMinutes().toString().padStart(2,'0');
  p[tipo] = str;
  guardarEstado();
  renderizarCalendarioVoley();
}

function renderizarCalendarioVoley(){
  const cont = document.getElementById('calendario-voley');
  if(!cont) return;
  const d = disciplinas.voley;
  if(!d.calendarioVoley){ cont.innerHTML = '<p class="add-note">Aún no se ha generado el calendario. Haz clic en el botón superior.</p>'; return; }

  let html = '';
  const soloLectura = !esOrganizador();

  for(let c=1; c<=3; c++){
    const parts = d.calendarioVoley.map((cal, i) => ({cal, i})).filter(x => x.cal.cancha === c);
    html += `<div style="flex:1; min-width:250px; border:1px solid var(--linea); padding:8px; border-radius:6px; background:var(--azul-profundo);">
      <h4 style="margin-top:0; color:var(--oro);">Cancha ${c}</h4>`;
    parts.forEach(x => {
      const partido = d.partidos[x.cal.grupo][x.cal.pIdx];
      html += `<div style="font-size:13px; margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed var(--linea);">
        <b style="color:var(--azul-cielo);">G${x.cal.grupo+1}</b>: ${partido.local} vs ${partido.visitante}<br>
        <div style="margin-top:6px; display:flex; gap:6px; align-items:center;">`;
      if(!soloLectura){
        html += `<button class="btn" style="font-size:10px; padding:3px 6px;" onclick="registrarTiempoVoley(${x.i}, 'ini')">▶️ Iniciar</button>
                 <button class="btn" style="font-size:10px; padding:3px 6px; background:var(--rojo-tab);" onclick="registrarTiempoVoley(${x.i}, 'fin')">🏁 Terminar</button>`;
      }
      html += `<span style="color:var(--hueso); font-size:11px;">Ini: <b>${x.cal.ini || '--:--'}</b> | Fin: <b>${x.cal.fin || '--:--'}</b></span>
        </div></div>`;
    });
    html += `</div>`;
  }
  cont.innerHTML = html;
}

function generarSemifinalVoley(){
  const d = disciplinas.voley;
  if(!d.partidos || d.partidos.flat().some(p => typeof p.golesLocal !== 'number')){
    alert('Faltan resultados en la fase de grupos (ingrésalos en la pantalla "4. Tabla posiciones").'); return;
  }
  const tA = calcularTabla(d.grupos[0], d.partidos[0]);
  const tB = calcularTabla(d.grupos[1], d.partidos[1]);
  d.semifinal = [
    { local: tA[0].equipo, visitante: tB[1].equipo, golesLocal: null, golesVisitante: null, ganador: null },
    { local: tB[0].equipo, visitante: tA[1].equipo, golesLocal: null, golesVisitante: null, ganador: null }
  ];
  guardarEstado();
  renderizarSemifinalVoley();
}

function actualizarMarcadorSemiVoley(idx, campo, valor){
  const d = disciplinas.voley;
  const p = d.semifinal[idx];
  p[campo] = valor;
  if(typeof p.golesLocal === 'number' && typeof p.golesVisitante === 'number'){
    if(p.golesLocal === p.golesVisitante){
      alert('Sin empates en Semifinal.'); p.golesLocal = null; p.golesVisitante = null; p.ganador = null;
    } else {
      p.ganador = p.golesLocal > p.golesVisitante ? p.local : p.visitante;
    }
  } else p.ganador = null;
  guardarEstado(); renderizarSemifinalVoley();
}

function renderizarSemifinalVoley(){
  const cont = document.getElementById('semifinal-voley');
  if(!cont) return;
  const d = disciplinas.voley;
  if(!d.semifinal){ cont.innerHTML = '<p class="add-note">Aún no se ha generado la Semifinal.</p>'; return; }
  const soloLectura = !esOrganizador();
  let html = '<table><tr><th>Semifinal</th><th>Local</th><th>Sets/Pts</th><th>Visitante</th><th>Ganador</th></tr>';
  d.semifinal.forEach((p, idx) => {
    html += `<tr><td>SF${idx+1}</td><td>${p.local}</td>
      <td><input type="number" min="0" style="width:36px;" value="${p.golesLocal ?? ''}" onchange="actualizarMarcadorSemiVoley(${idx}, 'golesLocal', this.value===''?null:Number(this.value))" ${soloLectura?'disabled':''}> -
      <input type="number" min="0" style="width:36px;" value="${p.golesVisitante ?? ''}" onchange="actualizarMarcadorSemiVoley(${idx}, 'golesVisitante', this.value===''?null:Number(this.value))" ${soloLectura?'disabled':''}></td>
      <td>${p.visitante}</td><td>${p.ganador||'—'}</td></tr>`;
  });
  cont.innerHTML = html + '</table>';
}

function generarFinalVoley(){
  const d = disciplinas.voley;
  if(!d.semifinal || d.semifinal.some(p => !p.ganador)){ alert('Completa los marcadores de las Semifinales primero.'); return; }
  const ganadores = d.semifinal.map(p => p.ganador);
  const perdedores = d.semifinal.map(x => x.ganador === x.local ? x.visitante : x.local);
  
  d.final = { local: ganadores[0], visitante: ganadores[1], golesLocal: null, golesVisitante: null, ganador: null };
  
  const dif = (pt) => Math.abs(pt.golesLocal - pt.golesVisitante);
  const perdTabla = [
    { equipo: perdedores[0], dif: dif(d.semifinal[0]) },
    { equipo: perdedores[1], dif: dif(d.semifinal[1]) }
  ].sort((a,b) => b.dif - a.dif);
  
  d.tercerPuesto = perdTabla[0].equipo;
  d.cuartoPuesto = perdTabla[1].equipo;

  guardarEstado(); renderizarFinalVoley();
}

function actualizarMarcadorFinalVoley(campo, valor){
  const d = disciplinas.voley;
  d.final[campo] = valor;
  if(typeof d.final.golesLocal === 'number' && typeof d.final.golesVisitante === 'number'){
    if(d.final.golesLocal === d.final.golesVisitante){ alert('Sin empates en la Final.'); d.final.golesLocal=null; d.final.golesVisitante=null; d.final.ganador=null; }
    else d.final.ganador = d.final.golesLocal > d.final.golesVisitante ? d.final.local : d.final.visitante;
  } else d.final.ganador = null;
  guardarEstado(); renderizarFinalVoley();
}

function renderizarFinalVoley(){
  const cont = document.getElementById('final-puestos-voley');
  if(!cont) return;
  const d = disciplinas.voley;
  if(!d.final){ cont.innerHTML = '<p class="add-note">Aún no se ha generado la Final.</p>'; return; }
  const soloLectura = !esOrganizador();
  const f = d.final;
  cont.innerHTML = `<table>
    <tr><th>Puesto</th><th>Detalle</th></tr>
    <tr><td>FINAL (1ro/2do)</td><td>${f.local} <input type="number" style="width:36px;" value="${f.golesLocal??''}" onchange="actualizarMarcadorFinalVoley('golesLocal', this.value===''?null:Number(this.value))" ${soloLectura?'disabled':''}> -
    <input type="number" style="width:36px;" value="${f.golesVisitante??''}" onchange="actualizarMarcadorFinalVoley('golesVisitante', this.value===''?null:Number(this.value))" ${soloLectura?'disabled':''}> ${f.visitante} ${f.ganador?'🏆 '+f.ganador:''}</td></tr>
    <tr><td>3er Puesto</td><td>${d.tercerPuesto || '—'} (Perdedor de Semifinales con mayor dif. pts)</td></tr>
    <tr><td>4to Puesto</td><td>${d.cuartoPuesto || '—'} (Perdedor de Semifinales con menor dif. pts)</td></tr>
  </table>`;
}

function generarCombinaciones(equipos){
  const partidos = [];
  for(let i = 0; i < equipos.length; i++){
    for(let j = i + 1; j < equipos.length; j++){
      partidos.push({ local: equipos[i], visitante: equipos[j], golesLocal: null, golesVisitante: null });
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
      const encontrado = grupoPrevio.find(pv => (pv.local === p.local && pv.visitante === p.visitante));
      if(encontrado){ p.golesLocal = encontrado.golesLocal; p.golesVisitante = encontrado.golesVisitante; }
    });
    return nuevos;
  });
  guardarEstado();
}

function calcularTabla(equiposDelGrupo, partidosDelGrupo){
  const stats = {};
  equiposDelGrupo.forEach(nombre => { stats[nombre] = { equipo: nombre, pj:0, pg:0, pe:0, pp:0, gf:0, gc:0, dif:0, pts:0 }; });
  partidosDelGrupo.forEach(p => {
    if(typeof p.golesLocal !== 'number' || typeof p.golesVisitante !== 'number') return;
    if(!stats[p.local] || !stats[p.visitante]) return;
    
    const local = stats[p.local]; const visitante = stats[p.visitante];
    local.pj++; visitante.pj++;
    local.gf += p.golesLocal;  local.gc += p.golesVisitante;
    visitante.gf += p.golesVisitante; visitante.gc += p.golesLocal;

    if(p.golesLocal > p.golesVisitante){ local.pg++; local.pts += 3; visitante.pp++; }
    else if(p.golesLocal < p.golesVisitante){ visitante.pg++; visitante.pts += 3; local.pp++; }
    else { local.pe++; local.pts += 1; visitante.pe++; visitante.pts += 1; }
  });
  const tabla = Object.values(stats).map(e => { e.dif = e.gf - e.gc; return e; });
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
    tabla.forEach((e, pos) => { candidatosTodos.push({ equipo: e.equipo, posGrupo: pos + 1, grupoIdx: idxGrupo, pts: e.pts, dif: e.dif, gf: e.gf }); });
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
      resto.sort((a, b) => a.posGrupo - b.posGrupo || b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
      extras = resto.slice(0, faltantes);
    }
    clasificados = ganadores.concat(extras);
  }
  clasificados.sort((a, b) => a.posGrupo - b.posGrupo || b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
  return clasificados;
}

function siguientePotenciaDeDos(n){ let p = 1; while(p < n) p *= 2; return p; }
function ordenSiembra(n){
  if(n === 1) return [1];
  const prev = ordenSiembra(n / 2);
  const resultado = [];
  prev.forEach(s => { resultado.push(s); resultado.push(n + 1 - s); });
  return resultado;
}

function armarCrucesSinRepetirGrupo(clasificados){
  const ganadores = clasificados.filter(c => c.posGrupo === 1).slice().sort((a,b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
  const otrosDisponibles = clasificados.filter(c => c.posGrupo !== 1).slice().sort((a,b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
  const resultado = [];
  ganadores.forEach(ganador => {
    let idxElegido = -1;
    for(let i = otrosDisponibles.length - 1; i >= 0; i--){
      if(otrosDisponibles[i].grupoIdx !== ganador.grupoIdx){ idxElegido = i; break; }
    }
    if(idxElegido === -1 && otrosDisponibles.length > 0) idxElegido = otrosDisponibles.length - 1;

    if(idxElegido !== -1){
      const rival = otrosDisponibles.splice(idxElegido, 1)[0];
      resultado.push(ganador.equipo, rival.equipo);
    } else { resultado.push(ganador.equipo); }
  });
  while(otrosDisponibles.length > 0){ resultado.push(otrosDisponibles.shift().equipo); }
  return resultado;
}

function generarBracket(numPorGrupo = 2){
  const d = disciplinas[disciplinaActual];
  const clasificados = obtenerClasificados(numPorGrupo);
  const bracketPrevio = d.bracket;
  const nombresOrdenados = armarCrucesSinRepetirGrupo(clasificados);
  const tamanoBracket = siguientePotenciaDeDos(nombresOrdenados.length);
  while(nombresOrdenados.length < tamanoBracket) nombresOrdenados.push('BYE');
  
  const slots = nombresOrdenados;
  const ronda1 = [];
  for(let i = 0; i < slots.length; i += 2){
    const local = slots[i]; const visitante = slots[i + 1];
    let ganador = null; let golesLocal = null; let golesVisitante = null;

    if(local === 'BYE') ganador = visitante;
    else if(visitante === 'BYE') ganador = local;

    if(bracketPrevio && bracketPrevio[0]){
      const previo = bracketPrevio[0].find(p => (p.local === local && p.visitante === visitante) || (p.local === visitante && p.visitante === local));
      if(previo){
        if(previo.local === local){ golesLocal = previo.golesLocal ?? null; golesVisitante = previo.golesVisitante ?? null; }
        else { golesLocal = previo.golesVisitante ?? null; golesVisitante = previo.golesLocal ?? null; }
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
      siguiente.push({ local: anterior[i].ganador || 'Por definir', visitante: anterior[i + 1].ganador || 'Por definir', ganador: null, golesLocal: null, golesVisitante: null });
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
      actual[i].ganador = null; actual[i].golesLocal = null; actual[i].golesVisitante = null;
    }
  }
}

function actualizarMarcadorEliminacion(numRonda, numPartido, campo, valor){
  const d = disciplinas[disciplinaActual];
  const partido = d.bracket[numRonda][numPartido];
  partido[campo] = valor;

  if(typeof partido.golesLocal === 'number' && typeof partido.golesVisitante === 'number'){
    if(partido.golesLocal === partido.golesVisitante){
      alert('No puede haber empate en eliminación directa.');
      partido.golesLocal = null; partido.golesVisitante = null; partido.ganador = null;
    } else {
      partido.ganador = partido.golesLocal > partido.golesVisitante ? partido.local : partido.visitante;
    }
  } else { partido.ganador = null; }

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
  if(!d.bracket) return;
  const cont = document.getElementById('bracket-eliminacion');
  cont.innerHTML = '';

  const tamanoInicial = d.bracket[0].length * 2;
  const etiquetas = nombresRonda[tamanoInicial] || d.bracket.map((_, i) => 'Ronda ' + (i + 1));

  d.bracket.forEach((ronda, numRonda) => {
    const rondaDiv = document.createElement('div'); rondaDiv.className = 'ronda';
    const label = document.createElement('div'); label.className = 'ronda-label';
    label.textContent = etiquetas[numRonda] || ('Ronda ' + (numRonda + 1));
    rondaDiv.appendChild(label);

    ronda.forEach((partido, numPartido) => {
      const matchDiv = document.createElement('div'); matchDiv.className = 'match';
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
        inputGoles.type = 'number'; inputGoles.min = '0'; inputGoles.style.cssText = 'width:36px;';
        inputGoles.value = partido[campoGoles] ?? ''; inputGoles.disabled = soloLectura;
        inputGoles.addEventListener('change', (e) => actualizarMarcadorEliminacion(numRonda, numPartido, campoGoles, e.target.value === '' ? null : Number(e.target.value)));
        fila.appendChild(inputGoles);
        matchDiv.appendChild(fila);
      });
      rondaDiv.appendChild(matchDiv);

      if(esFinal){
        const campeonDiv = document.createElement('div'); campeonDiv.className = 'ronda';
        campeonDiv.innerHTML = '<div class="ronda-label">Campeón</div><div class="match" style="border:2px solid var(--oro);"><div class="win">🏆 ' + partido.ganador + '</div></div>';
        cont.appendChild(rondaDiv); cont.appendChild(campeonDiv);
        return;
      }
    });
    if(!(ronda.length === 1 && ronda[0].ganador)) cont.appendChild(rondaDiv);
  });
}

let grupoTablaActual = 0;

function renderizarTabla(){
  const d = disciplinas[disciplinaActual];
  if(!d.partidos) return;

  document.getElementById('titulo-tabla-normal').textContent = 'Partidos y tabla de posiciones — Grupo ' + (grupoTablaActual + 1);

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
      d.partidos[grupoTablaActual][idx][campo] = e.target.value === '' ? null : Number(e.target.value);
      guardarEstado();
      renderizarTabla();
    });
  });

  const tabla = calcularTabla(equiposDelGrupo, partidosDelGrupo);
  const contTabla = document.getElementById('tabla-posiciones');
  contTabla.innerHTML = '<tr><th>Pos</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>Dif</th><th>Pts</th></tr>';
  tabla.forEach((e, pos) => {
    const esTop = pos < 2;
    contTabla.innerHTML +=
      '<tr' + (esTop ? ' class="top3"' : '') + '>' +
      '<td>' + (pos+1) + '</td><td>' + e.equipo + '</td><td>' + e.pj + '</td><td>' + e.pg + '</td>' +
      '<td>' + e.pe + '</td><td>' + e.pp + '</td><td>' + (e.dif > 0 ? '+' : '') + e.dif + '</td><td>' + e.pts + '</td></tr>';
  });

  const cardTerceraRonda = document.getElementById('card-tercera-ronda-grupoA');
  if(cardTerceraRonda){
    const esGrupoChicoDeFutbol = (disciplinaActual === 'hombres' && equiposDelGrupo.length === 3);
    cardTerceraRonda.style.display = esGrupoChicoDeFutbol ? '' : 'none';
    if(esGrupoChicoDeFutbol) renderizarTerceraRondaGrupoA();
  }
}

function renderizarTablasBasquet() {
  const cont = document.getElementById('tablas-basquet');
  if(!cont) return;
  const d = disciplinas.basquet;
  if(!d.semifinalesBasquet || !d.perdedoresBasquet) { cont.innerHTML = ''; return; }

  const perd = (p) => p.ganador === p.local ? p.visitante : p.local;
  const dif = (p) => Math.abs(p.golesLocal - p.golesVisitante);
  const gfPerd = (p) => p.ganador === p.local ? p.golesVisitante : p.golesLocal;
  const gfGan = (p) => p.ganador === p.local ? p.golesLocal : p.golesVisitante;

  const terceros = [
    { equipo: perd(d.semifinalesBasquet[0]), dif: dif(d.semifinalesBasquet[0]), gf: gfPerd(d.semifinalesBasquet[0]) },
    { equipo: perd(d.semifinalesBasquet[1]), dif: dif(d.semifinalesBasquet[1]), gf: gfPerd(d.semifinalesBasquet[1]) }
  ];
  terceros.sort((a,b) => b.dif - a.dif || b.gf - a.gf);

  const quintos = [
    { equipo: d.perdedoresBasquet[0].ganador, dif: dif(d.perdedoresBasquet[0]), gf: gfGan(d.perdedoresBasquet[0]) },
    { equipo: d.perdedoresBasquet[1].ganador, dif: dif(d.perdedoresBasquet[1]), gf: gfGan(d.perdedoresBasquet[1]) }
  ];
  quintos.sort((a,b) => b.dif - a.dif || b.gf - a.gf);

  let html = '<div style="display:flex; gap:20px; flex-wrap:wrap;">';

  html += '<div class="card" style="flex:1; min-width:300px;"><b>Tabla 3er y 4to Puesto (Perdedores Semis)</b>';
  html += '<table style="margin-top:8px;"><tr><th>Pos</th><th>Equipo</th><th>Dif Ptos</th><th>Pts Anotados</th></tr>';
  terceros.forEach((e, pos) => {
    html += `<tr ${pos===0?'class="top3"':''}><td>${pos+3}</td><td>${e.equipo}</td><td>+${e.dif}</td><td>${e.gf}</td></tr>`;
  });
  html += '</table></div>';

  html += '<div class="card" style="flex:1; min-width:300px;"><b>Tabla 5to Puesto (Ganadores Llave Perdedores)</b>';
  html += '<table style="margin-top:8px;"><tr><th>Pos</th><th>Equipo</th><th>Dif Ptos</th><th>Pts Anotados</th></tr>';
  quintos.forEach((e, pos) => {
    html += `<tr ${pos===0?'class="top3"':''}><td>${pos+5}</td><td>${e.equipo}</td><td>+${e.dif}</td><td>${e.gf}</td></tr>`;
  });
  html += '</table></div>';

  html += '</div>';
  cont.innerHTML = html;
}

function rehacerSorteo(){
  const d = disciplinas[disciplinaActual];
  if(!confirm('¿Seguro que quieres rehacer el sorteo de "' + d.titulo + '"?\nTodos los equipos volverán a la lista de pendientes.')) return;
  d.grupos = [];
  for(let i=0; i<d.numGrupos; i++) d.grupos.push([]);
  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
}

function agregarEquipo(){
  const input = document.getElementById('nuevo-equipo');
  const nombre = input.value.trim();
  if(!nombre) return;
  const d = disciplinas[disciplinaActual];
  if(d.equipos.includes(nombre)){ alert('Ya existe un equipo con ese nombre.'); return; }

  d.equipos.push(nombre);
  if(disciplinaActual === 'basquet'){
    const selectorTipo = document.getElementById('tipo-nuevo-equipo');
    const tipo = selectorTipo ? selectorTipo.value : 'mixto';
    if(!d.tiposEquipo) d.tiposEquipo = {};
    d.tiposEquipo[nombre] = tipo;
    if(tipo === 'mixto'){
      if(!d.jugadoresPorEquipo) d.jugadoresPorEquipo = {};
      d.jugadoresPorEquipo[nombre] = [];
    }
  }
  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
  input.value = '';
}

function agregarJugadorMixto(nombreEquipo){
  const nombreJugador = prompt('Nombre y apellido del jugador/a:');
  if(!nombreJugador || !nombreJugador.trim()) return;
  const genero = confirm('¿Es mujer? (Aceptar = Mujer, Cancelar = Hombre)') ? 'mujer' : 'hombre';

  const d = disciplinas.basquet;
  if(!d.jugadoresPorEquipo) d.jugadoresPorEquipo = {};
  if(!d.jugadoresPorEquipo[nombreEquipo]) d.jugadoresPorEquipo[nombreEquipo] = [];
  d.jugadoresPorEquipo[nombreEquipo].push({ nombre: nombreJugador.trim(), genero });
  guardarEstado();
  renderizarJugadoresMixtos();
}

function eliminarJugadorMixto(nombreEquipo, idx){
  const d = disciplinas.basquet;
  d.jugadoresPorEquipo[nombreEquipo].splice(idx, 1);
  guardarEstado();
  renderizarJugadoresMixtos();
}

function cambiarTipoEquipoBasquet(nombre, nuevoTipo) {
  const d = disciplinas.basquet;
  if (!d.tiposEquipo) d.tiposEquipo = {};
  d.tiposEquipo[nombre] = nuevoTipo;
  if (nuevoTipo === 'mixto') {
    if (!d.jugadoresPorEquipo) d.jugadoresPorEquipo = {};
    if (!d.jugadoresPorEquipo[nombre]) d.jugadoresPorEquipo[nombre] = [];
  } else {
    if (d.jugadoresPorEquipo && d.jugadoresPorEquipo[nombre]) delete d.jugadoresPorEquipo[nombre];
  }
  guardarEstado();
  renderizarEquiposBasquet();
  renderizarJugadoresMixtos();
}

function renderizarEquiposBasquet(){
  const cardEquipos = document.getElementById('card-equipos-basquet');
  const cont = document.getElementById('lista-equipos-basquet');
  if(!cardEquipos || !cont) return;
  if(disciplinaActual !== 'basquet'){ cardEquipos.style.display = 'none'; return; }
  cardEquipos.style.display = '';

  const d = disciplinas.basquet;
  const tipos = d.tiposEquipo || {};
  if(!d.equipos || d.equipos.length === 0){ cont.innerHTML = '<p class="add-note">Aún no hay equipos agregados.</p>'; return; }

  let html = '<ul style="list-style:none;margin:0;padding:0;">';
  d.equipos.forEach(nombre => {
    const tipo = tipos[nombre] || 'mixto';
    html += '<li style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px dashed var(--linea);">';
    html += '<span style="flex:1;">' + nombre + '</span>';
    
    if(esOrganizador()){
      html += '<select style="padding:4px;font-size:12px;border-radius:4px;" onchange="cambiarTipoEquipoBasquet(\'' + nombre.replace(/'/g, "\\'") + '\', this.value)">';
      html += '<option value="hombres"' + (tipo === 'hombres' ? ' selected' : '') + '>Hombres</option>';
      html += '<option value="mixto"' + (tipo === 'mixto' ? ' selected' : '') + '>Mixto</option>';
      html += '<option value="mujeres"' + (tipo === 'mujeres' ? ' selected' : '') + '>Mujeres</option>';
      html += '</select>';
      html += '<button style="font-size:11px;margin-left:8px;" onclick="eliminarEquipoBasquet(\'' + nombre.replace(/'/g, "\\'") + '\')">🗑️</button>';
    } else {
      const etiquetasTipo = { hombres: 'Hombres', mixto: 'Mixto', mujeres: 'Mujeres' };
      const coloresTipo = { hombres: 'var(--azul-cielo)', mixto: 'var(--oro)', mujeres: '#E878B4' };
      html += '<span style="font-size:10px;background:' + (coloresTipo[tipo] || '#888') + ';color:var(--azul-profundo);padding:2px 8px;border-radius:10px;font-weight:bold;">' + (etiquetasTipo[tipo] || tipo) + '</span>';
    }
    html += '</li>';
  });
  html += '</ul>';
  cont.innerHTML = html;
}

function eliminarEquipoBasquet(nombre){
  if(!confirm('¿Eliminar el equipo "' + nombre + '"?')) return;
  const d = disciplinas.basquet;
  const idx = d.equipos.indexOf(nombre);
  if(idx !== -1) d.equipos.splice(idx, 1);
  if(d.tiposEquipo) delete d.tiposEquipo[nombre];
  if(d.jugadoresPorEquipo) delete d.jugadoresPorEquipo[nombre];
  guardarEstado();
  renderizarEquiposBasquet();
  renderizarJugadoresMixtos();
}

function renderizarJugadoresMixtos(){
  const cardJugadores = document.getElementById('card-jugadores-mixtos');
  const cont = document.getElementById('lista-jugadores-mixtos');
  if(!cardJugadores || !cont) return;
  if(disciplinaActual !== 'basquet'){ cardJugadores.style.display = 'none'; return; }
  cardJugadores.style.display = '';

  const d = disciplinas.basquet;
  const tipos = d.tiposEquipo || {};
  const equiposMixtos = d.equipos.filter(nombre => tipos[nombre] === 'mixto');
  if(equiposMixtos.length === 0){ cont.innerHTML = '<p class="add-note">Aún no hay equipos marcados como Mixto.</p>'; return; }

  let html = '';
  equiposMixtos.forEach(nombreEquipo => {
    const jugadores = (d.jugadoresPorEquipo && d.jugadoresPorEquipo[nombreEquipo]) || [];
    const numMujeres = jugadores.filter(j => j.genero === 'mujer').length;
    const cumple = numMujeres >= 2;

    html += '<div style="margin-bottom:14px;padding-bottom:10px;border-bottom:1px dashed var(--linea);">';
    html += '<b>' + nombreEquipo + '</b> — <span style="color:' + (cumple ? 'var(--oro-suave)' : 'var(--rojo-tab)') + ';">' + numMujeres + ' mujer(es)' + (cumple ? ' ✔️' : ' ⚠️ faltan mínimo 2') + '</span>';
    if(esOrganizador()){
      html += ' <button class="btn" style="font-size:11px;padding:3px 8px;" onclick="agregarJugadorMixto(\'' + nombreEquipo.replace(/'/g, "\\'") + '\')">+ jugador</button>';
    }
    html += '<ul style="list-style:none;margin:6px 0 0 0;padding:0;">';
    jugadores.forEach((j, idx) => {
      html += '<li style="font-size:12px;padding:3px 0;">' + j.nombre + ' (' + (j.genero === 'mujer' ? 'Mujer' : 'Hombre') + ')';
      if(esOrganizador()) html += ' <button style="font-size:10px;" onclick="eliminarJugadorMixto(\'' + nombreEquipo.replace(/'/g, "\\'") + '\', ' + idx + ')">🗑️</button>';
      html += '</li>';
    });
    html += '</ul></div>';
  });
  cont.innerHTML = html;
}

function generarRondaUnoBasquet(){
  const d = disciplinas.basquet;
  const tipos = d.tiposEquipo || {};
  const equiposHombres = d.equipos.filter(n => tipos[n] === 'hombres');
  const equiposMixtos = d.equipos.filter(n => tipos[n] === 'mixto');
  const equiposMujeres = d.equipos.filter(n => tipos[n] === 'mujeres');

  if(equiposHombres.length !== 3 || equiposMixtos.length !== 4 || equiposMujeres.length !== 1){
    alert('Necesitas exactamente 3 Hombres, 4 Mixtos y 1 Mujeres.'); return;
  }
  const jugadoresPorEquipo = d.jugadoresPorEquipo || {};
  const mixtosSinCumplir = equiposMixtos.filter(n => {
    const jugadores = jugadoresPorEquipo[n] || [];
    return jugadores.filter(j => j.genero === 'mujer').length < 2;
  });
  if(mixtosSinCumplir.length > 0){ alert('Mixtos incompletos: ' + mixtosSinCumplir.join(', ')); return; }

  const mixtosMezclados = mezclarAlAzar(equiposMixtos);
  const hombresMezclados = mezclarAlAzar(equiposHombres);

  d.rondaUno = [
    { local: hombresMezclados[0], visitante: hombresMezclados[1], golesLocal: null, golesVisitante: null, ganador: null, llave: 'Llave 1 (H-H)' },
    { local: hombresMezclados[2], visitante: mixtosMezclados[0], golesLocal: null, golesVisitante: null, ganador: null, llave: 'Llave 2 (H-M)' },
    { local: equiposMujeres[0], visitante: mixtosMezclados[1], golesLocal: null, golesVisitante: null, ganador: null, llave: 'Llave 3 (F-M)' },
    { local: mixtosMezclados[2], visitante: mixtosMezclados[3], golesLocal: null, golesVisitante: null, ganador: null, llave: 'Llave 4 (M-M)' }
  ];
  guardarEstado();
  alert('Ronda 1 generada con éxito. Revisa el calendario en la pestaña "3. Grupos".');
  ir(2);
}

function generarFaseDosBasquet(){
  const d = disciplinas.basquet;
  if(!d.rondaUno || d.rondaUno.some(p => !p.ganador)){
    alert("Completa todos los marcadores de la Ronda 1 primero.");
    return;
  }

  const p1 = d.rondaUno[0], p2 = d.rondaUno[1], p3 = d.rondaUno[2], p4 = d.rondaUno[3];
  const perdedor = (p) => p.ganador === p.local ? p.visitante : p.local;

  d.semifinalesBasquet = [
    { local: p1.ganador, visitante: p2.ganador, golesLocal: null, golesVisitante: null, ganador: null, llave: 'Grupo 1' },
    { local: p3.ganador, visitante: p4.ganador, golesLocal: null, golesVisitante: null, ganador: null, llave: 'Grupo 2' }
  ];
  d.perdedoresBasquet = [
    { local: perdedor(p1), visitante: perdedor(p2), golesLocal: null, golesVisitante: null, ganador: null, llave: 'Grupo 1' },
    { local: perdedor(p3), visitante: perdedor(p4), golesLocal: null, golesVisitante: null, ganador: null, llave: 'Grupo 2' }
  ];
  guardarEstado();
  renderizarMarcadoresBasquet();
  renderizarCalendarioBasquet();
}

function generarFinalBasquet(){
  const d = disciplinas.basquet;
  if(!d.semifinalesBasquet || d.semifinalesBasquet.some(p => !p.ganador)){
    alert("Completa todos los marcadores de Semifinales primero."); return;
  }
  if(!d.perdedoresBasquet || d.perdedoresBasquet.some(p => !p.ganador)){
    alert("Completa todos los marcadores de Llave de Perdedores primero."); return;
  }

  const sf1 = d.semifinalesBasquet[0], sf2 = d.semifinalesBasquet[1];
  d.finalBasquet = { local: sf1.ganador, visitante: sf2.ganador, golesLocal: null, golesVisitante: null, ganador: null };

  const perd = (p) => p.ganador === p.local ? p.visitante : p.local;
  const dif = (p) => Math.abs(p.golesLocal - p.golesVisitante);
  const gfPerd = (p) => p.ganador === p.local ? p.golesVisitante : p.golesLocal;
  const gfGan = (p) => p.ganador === p.local ? p.golesLocal : p.golesVisitante;

  const terceros = [
    { equipo: perd(sf1), dif: dif(sf1), gf: gfPerd(sf1) },
    { equipo: perd(sf2), dif: dif(sf2), gf: gfPerd(sf2) }
  ];
  terceros.sort((a,b) => b.dif - a.dif || b.gf - a.gf);
  d.tercerPuestoBasquet = terceros[0].equipo;
  d.cuartoPuestoBasquet = terceros[1].equipo;

  const quintos = [
    { equipo: d.perdedoresBasquet[0].ganador, dif: dif(d.perdedoresBasquet[0]), gf: gfGan(d.perdedoresBasquet[0]) },
    { equipo: d.perdedoresBasquet[1].ganador, dif: dif(d.perdedoresBasquet[1]), gf: gfGan(d.perdedoresBasquet[1]) }
  ];
  quintos.sort((a,b) => b.dif - a.dif || b.gf - a.gf);
  d.quintoPuestoBasquet = quintos[0].equipo;

  guardarEstado();
  renderizarEliminatoriaBasquet();
  renderizarCalendarioBasquet();
}

function rehacerFinalBasquet(){
  if(!confirm('¿Seguro que quieres borrar la Final y los puestos de Básquet?')) return;
  const d = disciplinas.basquet;
  d.finalBasquet = undefined;
  d.tercerPuestoBasquet = undefined;
  d.cuartoPuestoBasquet = undefined;
  d.quintoPuestoBasquet = undefined;
  guardarEstado();
  renderizarEliminatoriaBasquet();
  renderizarCalendarioBasquet();
}

function actualizarMarcadorBasquet(nombreArray, idx, campo, valorStr){
  const d = disciplinas.basquet;
  const valor = valorStr === '' ? null : Number(valorStr);
  const partido = nombreArray === 'finalBasquet' ? d.finalBasquet : d[nombreArray][idx];
  partido[campo] = valor;

  if(typeof partido.golesLocal === 'number' && typeof partido.golesVisitante === 'number'){
    if(partido.golesLocal === partido.golesVisitante){
      alert('No puede haber empate en Básquet. Corrige el marcador.');
      partido.golesLocal = null; partido.golesVisitante = null; partido.ganador = null;
    } else {
      partido.ganador = partido.golesLocal > partido.golesVisitante ? partido.local : partido.visitante;
    }
  } else { partido.ganador = null; }

  guardarEstado();
  if(nombreArray === 'finalBasquet') renderizarEliminatoriaBasquet();
  else renderizarMarcadoresBasquet();
  renderizarCalendarioBasquet();
}

function renderizarMarcadoresBasquet(){
  const d = disciplinas.basquet;
  const contRonda1 = document.getElementById('marcadores-ronda1-basquet');
  const contFase2 = document.getElementById('marcadores-fase2-basquet');
  const cardFase2 = document.getElementById('card-fase2-basquet');

  if(!d.rondaUno){
    contRonda1.innerHTML = '<p class="add-note">Falta generar Ronda 1 en Sorteo.</p>';
    cardFase2.style.display = 'none'; 
    renderizarTablasBasquet();
    return;
  }
  cardFase2.style.display = '';

  const armarTabla = (partidos, nombreArray) => {
    let html = '<table><tr><th>Llave</th><th>Local</th><th>Marcador</th><th>Visitante</th><th>Ganador</th></tr>';
    partidos.forEach((p, idx) => {
      const soloLectura = !esOrganizador();
      html += `<tr><td>${p.llave}</td><td>${p.local}</td><td>
        <input type="number" min="0" style="width:36px;" value="${p.golesLocal ?? ''}" onchange="actualizarMarcadorBasquet('${nombreArray}', ${idx}, 'golesLocal', this.value)" ${soloLectura?'disabled':''}> -
        <input type="number" min="0" style="width:36px;" value="${p.golesVisitante ?? ''}" onchange="actualizarMarcadorBasquet('${nombreArray}', ${idx}, 'golesVisitante', this.value)" ${soloLectura?'disabled':''}>
        </td><td>${p.visitante}</td><td>${p.ganador || '—'}</td></tr>`;
    });
    return html + '</table>';
  };

  contRonda1.innerHTML = armarTabla(d.rondaUno, 'rondaUno');

  if(d.semifinalesBasquet && d.perdedoresBasquet){
    contFase2.innerHTML = '<b>Semifinales (Ganadores)</b><br>' + armarTabla(d.semifinalesBasquet, 'semifinalesBasquet') +
                          '<br><b>Llave de Perdedores (5to lugar)</b><br>' + armarTabla(d.perdedoresBasquet, 'perdedoresBasquet');
  } else {
    contFase2.innerHTML = '<p class="add-note">Aún no se ha generado la fase 2.</p>';
  }

  renderizarTablasBasquet();
}

function renderizarEliminatoriaBasquet(){
  const d = disciplinas.basquet;
  const cont = document.getElementById('final-basquet-contenedor');
  if(!d.semifinalesBasquet || !d.perdedoresBasquet){ cont.innerHTML = '<p class="add-note">Falta generar y completar resultados en la Tabla de Posiciones.</p>'; return; }
  if(!d.finalBasquet){ cont.innerHTML = '<div class="btn-row"><button class="btn oro" onclick="generarFinalBasquet()">🥇 Generar Final y Puestos</button></div>'; return; }

  const f = d.finalBasquet;
  const soloLectura = !esOrganizador();
  let html = '';
  
  if(!soloLectura){
    html += '<div class="btn-row" style="margin-bottom:10px;"><button class="btn" onclick="rehacerFinalBasquet()" style="background:var(--rojo-tab);">🔄 Rehacer Final</button></div>';
  }
  
  html += '<table><tr><th>Puesto</th><th>Detalle</th></tr>';
  html += `<tr><td>FINAL (1ro/2do)</td><td>${f.local}
     <input type="number" style="width:36px;" value="${f.golesLocal ?? ''}" onchange="actualizarMarcadorBasquet('finalBasquet', 0, 'golesLocal', this.value)" ${soloLectura?'disabled':''}> -
     <input type="number" style="width:36px;" value="${f.golesVisitante ?? ''}" onchange="actualizarMarcadorBasquet('finalBasquet', 0, 'golesVisitante', this.value)" ${soloLectura?'disabled':''}>
     ${f.visitante} ${f.ganador ? '🏆 ' + f.ganador : ''}</td></tr>`;

  html += `<tr><td>3er Puesto</td><td>${d.tercerPuestoBasquet || '—'} (Perdedor Semifinales con mayor dif. pts)</td></tr>`;
  html += `<tr><td>4to Puesto</td><td>${d.cuartoPuestoBasquet || '—'} (Perdedor Semifinales con menor dif. pts)</td></tr>`;
  html += `<tr><td>5to Puesto</td><td>${d.quintoPuestoBasquet || '—'} (Ganador Llave Perdedores con mayor dif. pts)</td></tr>`;
  html += '</table>';
  cont.innerHTML = html;
}

function ir(i, btn){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('s'+i).classList.add('active');
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  if(btn){btn.classList.add('active');} else{document.querySelectorAll('nav button')[i].classList.add('active');}

  if(i === 2){
    renderizarGrupos();
    if(disciplinaActual !== 'basquet' && disciplinaActual !== 'voley') renderizarCalendarioFutbol();
  }
  if(i === 3){
    if(disciplinaActual === 'basquet') {
      document.getElementById('contenedor-tabla-futbol').style.display = 'none';
      document.getElementById('contenedor-marcadores-basquet').style.display = '';
      renderizarMarcadoresBasquet();
    } else {
      document.getElementById('contenedor-tabla-futbol').style.display = '';
      document.getElementById('contenedor-marcadores-basquet').style.display = 'none';
      
      const card3ra = document.getElementById('card-tercera-ronda-grupoA');
      if(card3ra) {
        card3ra.style.display = (disciplinaActual === 'hombres' && disciplinas[disciplinaActual].grupos && disciplinas[disciplinaActual].grupos[0] && disciplinas[disciplinaActual].grupos[0].length===3) ? '' : 'none';
      }
      grupoTablaActual = 0; renderizarTabla();
    }
  }
  if(i === 4){
    if(disciplinaActual === 'basquet') {
      document.getElementById('contenedor-eliminacion-futbol').style.display = 'none';
      document.getElementById('contenedor-eliminacion-basquet').style.display = '';
      document.getElementById('s4-voley-msg').style.display = 'none';
      renderizarEliminatoriaBasquet();
    } else if(disciplinaActual === 'voley') {
      document.getElementById('contenedor-eliminacion-futbol').style.display = 'none';
      document.getElementById('contenedor-eliminacion-basquet').style.display = 'none';
      document.getElementById('s4-voley-msg').style.display = '';
    } else {
      document.getElementById('contenedor-eliminacion-futbol').style.display = '';
      document.getElementById('contenedor-eliminacion-basquet').style.display = 'none';
      document.getElementById('s4-voley-msg').style.display = 'none';
      if(!disciplinas[disciplinaActual].bracket) generarBracket(2);
      renderizarBracket();
    }
  }
  if(i === 5){
    renderizarListaParejas();
    if(mundial40.bracket) renderizarBracketMundial();
  }
  if(i === 6){ renderizarInstituciones(); }
}

const pantallaAnterior = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 0, 6: 0 };
function irAtras(actual){ ir(pantallaAnterior[actual]); }

async function iniciarApp(){
  const cargaExitosa = await cargarEstado();
  if(!cargaExitosa){
    document.body.innerHTML = '<div style="padding:40px;text-align:center;"><h1>⚠️ No se pudo conectar con la base de datos</h1><p>Recarga la página (F5).</p></div>';
    return;
  }
  if(!esOrganizador()) pedirPin();
  aplicarModoLectura();
  seleccionarDisciplina('hombres', false);
  ir(0);
}

// Global functions for events
window.cambiarTipoEquipoBasquet = cambiarTipoEquipoBasquet;
window.eliminarEquipoBasquet = eliminarEquipoBasquet;
window.agregarJugadorMixto = agregarJugadorMixto;
window.eliminarJugadorMixto = eliminarJugadorMixto;
window.actualizarMarcadorBasquet = actualizarMarcadorBasquet;
window.generarCalendarioBasquet = renderizarCalendarioBasquet;
window.generarFaseDosBasquet = generarFaseDosBasquet;
window.generarFinalBasquet = generarFinalBasquet;
window.rehacerFinalBasquet = rehacerFinalBasquet;
window.generarCalendarioVoley = generarCalendarioVoley;
window.registrarTiempoVoley = registrarTiempoVoley;
window.generarSemifinalVoley = generarSemifinalVoley;
window.actualizarMarcadorSemiVoley = actualizarMarcadorSemiVoley;
window.generarFinalVoley = generarFinalVoley;
window.actualizarMarcadorFinalVoley = actualizarMarcadorFinalVoley;

iniciarApp();