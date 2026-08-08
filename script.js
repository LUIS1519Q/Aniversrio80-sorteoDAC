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
    equipos: ['ADMINISTRATIVA','COTOPAXI','FINANCIERO','EPMSA','ZONAL','LMDS','RADAR','TALMA']
  },
  voley: {
    titulo: 'Ecuavoley',
    numGrupos: 2, // 2 grupos de 4
    equipos: ['Bloqueo Total','Remate DAC','Saque Alto','Red Sur','Los Rematadores','Ace Aéreo','Cancha Norte','Voley 80']
  }
};

// --- Datos FIJOS confirmados con el jefe (imágenes) ---
const FUTBOL_EQUIPOS_FIJOS = ['RADAR','LMDS','TALMA','ADMINISTRATIVA','EPMSA','COTOPAXI','ZONAL'];
const FUTBOL_PARTIDOS_BASE_FIJOS = [
  { local: 'RADAR', visitante: 'LMDS' },
  { local: 'TALMA', visitante: 'ADMINISTRATIVA' },
  { local: 'EPMSA', visitante: 'COTOPAXI' },
  { local: 'ADMINISTRATIVA', visitante: 'LMDS' },
  { local: 'ZONAL', visitante: 'TALMA' },
  { local: 'COTOPAXI', visitante: 'RADAR' },
  { local: 'EPMSA', visitante: 'ZONAL' }
];

const BASQUET_QF_FIJOS = [
  { local: 'ADMINISTRATIVA', visitante: 'COTOPAXI', llave: 'QF1' },
  { local: 'FINANCIERO', visitante: 'EPMSA', llave: 'QF2' },
  { local: 'ZONAL', visitante: 'LMDS', llave: 'QF3' },
  { local: 'RADAR', visitante: 'TALMA', llave: 'QF4' }
];

const ECUAVOLEY_QF_FIJOS = [
  { local: 'RADAR', visitante: 'LMDS', llave: 'QF1' },
  { local: 'TALMA', visitante: 'ZONAL', llave: 'QF2' },
  { local: 'TRANSPORTACIÓN', visitante: 'TALMA', llave: 'QF3' },
  { local: 'EPMSA', visitante: 'ADMINISTRATIVA', llave: 'QF4' },
  { local: 'COTOPAXI', visitante: 'LMDS', llave: 'QF5' }
];

let mundial40 = {
  parejas: [],
  bracket: null
};

let jenga = {
  participantes: [],
  bracket: null,
  numMazos: 5
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
  const inputInst = document.getElementById('mundial-institucion');
  const j1 = input1.value.trim();
  const j2 = input2.value.trim();

  if(!j1 || !j2){ alert('Debes ingresar el nombre de ambos jugadores.'); return; }

  const nueva = { id: Date.now(), jugador1: j1, jugador2: j2, institucion: inputInst ? inputInst.value.trim() : '' };
  mundial40.parejas.push(nueva);

  if(mundial40.bracket) generarBracketMundial();
  guardarEstado();
  renderizarListaParejas();
  if(mundial40.bracket) renderizarBracketMundial();

  input1.value = ''; input2.value = '';
  if(inputInst) inputInst.value = '';
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
    span.textContent = nombrePareja(pareja) + (pareja.institucion ? ' — ' + pareja.institucion : '');
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
  const paqueteOriginal = { disciplinas: disciplinas, mundial40: mundial40, instituciones: instituciones, jenga: jenga };
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
            // Fútbol masculino fijo
            partidosFijos: guardado.partidosFijos || undefined,
            tablaFutbolFinal: guardado.tablaFutbolFinal || undefined,
            semifinalFutbolFija: guardado.semifinalFutbolFija || undefined,
            finalFutbolFija: guardado.finalFutbolFija || undefined,
            tercerPuestoFijo: guardado.tercerPuestoFijo || undefined,
            cuartoPuestoFijo: guardado.cuartoPuestoFijo || undefined,
            quintoPuestoFijo: guardado.quintoPuestoFijo || undefined,
            sextoPuestoFijo: guardado.sextoPuestoFijo || undefined,
            septimoPuestoFijo: guardado.septimoPuestoFijo || undefined,
            // Básquet fijo
            rondaUno: guardado.rondaUno || undefined,
            semifinalesBasquet: guardado.semifinalesBasquet || undefined,
            perdedoresBasquet: guardado.perdedoresBasquet || undefined,
            finalBasquet: guardado.finalBasquet || undefined,
            tercerPuestoBasquet: guardado.tercerPuestoBasquet || undefined,
            cuartoPuestoBasquet: guardado.cuartoPuestoBasquet || undefined,
            quintoPuestoBasquet: guardado.quintoPuestoBasquet || undefined,
            // Ecuavoley fijo
            cuartosVoley: guardado.cuartosVoley || undefined,
            tablaGanadoresVoley: guardado.tablaGanadoresVoley || undefined,
            tablaPerdedoresVoley: guardado.tablaPerdedoresVoley || undefined,
            semifinalesGanadoresVoley: guardado.semifinalesGanadoresVoley || undefined,
            semifinalesPerdedoresVoley: guardado.semifinalesPerdedoresVoley || undefined,
            finalGanadoresVoley: guardado.finalGanadoresVoley || undefined,
            finalPerdedoresVoley: guardado.finalPerdedoresVoley || undefined,
            tercerPuestoVoley: guardado.tercerPuestoVoley || undefined,
            cuartoPuestoVoley: guardado.cuartoPuestoVoley || undefined,
            septimoPuestoVoley: guardado.septimoPuestoVoley || undefined,
            octavoPuestoVoley: guardado.octavoPuestoVoley || undefined
          };
        }
      });
    }

    if(datosGuardados.mundial40) mundial40 = datosGuardados.mundial40;
    if(datosGuardados.instituciones) instituciones = datosGuardados.instituciones;
    if(datosGuardados.jenga) jenga = datosGuardados.jenga;

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
    'card-inscribir-jenga', 'boton-generar-bracket-jenga'
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

  const esBasquet = (clave === 'basquet');
  const esHombres = (clave === 'hombres');
  const esVoley = (clave === 'voley');
  const cardNumGrupos = document.getElementById('card-num-grupos');
  const bloqueSorteoGrupos = document.getElementById('bloque-sorteo-grupos');

  // Fútbol Hombres, Básquet y Ecuavoley ya no usan sorteo manual: son fijos y confirmados.
  if(esBasquet || esHombres || esVoley){
    if(cardNumGrupos) cardNumGrupos.style.display = 'none';
    if(bloqueSorteoGrupos) bloqueSorteoGrupos.style.display = 'none';
    if(navegar) ir(2);
    return;
  }

  if(cardNumGrupos) cardNumGrupos.style.display = esOrganizador() ? '' : 'none';
  if(bloqueSorteoGrupos) bloqueSorteoGrupos.style.display = '';

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

function horaATotalMinutos(hhmm){
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutosAHora(total){
  const h = Math.floor(total / 60);
  const m = total % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

// ===== FÚTBOL MASCULINO — CALENDARIO FIJO (7 partidos confirmados) =====

function inicializarFutbolFijo(){
  const dH = disciplinas.hombres;
  if(!dH.partidosFijos){
    dH.partidosFijos = FUTBOL_PARTIDOS_BASE_FIJOS.map(p => ({ local: p.local, visitante: p.visitante, golesLocal: null, golesVisitante: null }));
    guardarEstado();
  }
}

function actualizarMarcadorFutbolFijo(idx, campo, valorStr){
  const dH = disciplinas.hombres;
  dH.partidosFijos[idx][campo] = valorStr === '' ? null : Number(valorStr);
  guardarEstado();
  renderizarFutbolFijo();
}

function calcularTablaFutbolFija(){
  const dH = disciplinas.hombres;
  return calcularTabla(FUTBOL_EQUIPOS_FIJOS, dH.partidosFijos || []);
}

function generarSemifinalFutbolFija(){
  const dH = disciplinas.hombres;
  if(!dH.partidosFijos || dH.partidosFijos.some(p => typeof p.golesLocal !== 'number' || typeof p.golesVisitante !== 'number')){
    alert('Completa los 7 partidos primero.'); return;
  }
  const tabla = calcularTablaFutbolFija();
  dH.tablaFutbolFinal = tabla;
  dH.semifinalFutbolFija = [
    { local: tabla[0].equipo, visitante: tabla[3].equipo, golesLocal: null, golesVisitante: null, ganador: null },
    { local: tabla[1].equipo, visitante: tabla[2].equipo, golesLocal: null, golesVisitante: null, ganador: null }
  ];
  guardarEstado();
  renderizarFutbolFijo();
}

function actualizarMarcadorSemifinalFutbolFija(idx, campo, valorStr){
  const dH = disciplinas.hombres;
  const p = dH.semifinalFutbolFija[idx];
  p[campo] = valorStr === '' ? null : Number(valorStr);
  if(typeof p.golesLocal === 'number' && typeof p.golesVisitante === 'number'){
    if(p.golesLocal === p.golesVisitante){ alert('No puede haber empate.'); p.golesLocal = null; p.golesVisitante = null; p.ganador = null; }
    else p.ganador = p.golesLocal > p.golesVisitante ? p.local : p.visitante;
  } else p.ganador = null;
  guardarEstado();
  renderizarFutbolFijo();
}

function generarFinalFutbolFija(){
  const dH = disciplinas.hombres;
  if(!dH.semifinalFutbolFija || dH.semifinalFutbolFija.some(p => !p.ganador)){ alert('Completa ambas Semifinales primero.'); return; }
  const sf1 = dH.semifinalFutbolFija[0], sf2 = dH.semifinalFutbolFija[1];
  dH.finalFutbolFija = { local: sf1.ganador, visitante: sf2.ganador, golesLocal: null, golesVisitante: null, ganador: null };

  const perd1 = sf1.ganador === sf1.local ? sf1.visitante : sf1.local;
  const perd2 = sf2.ganador === sf2.local ? sf2.visitante : sf2.local;
  const tabla = dH.tablaFutbolFinal || calcularTablaFutbolFija();
  const posEnTabla = (equipo) => tabla.findIndex(e => e.equipo === equipo);
  if(posEnTabla(perd1) < posEnTabla(perd2)){ dH.tercerPuestoFijo = perd1; dH.cuartoPuestoFijo = perd2; }
  else { dH.tercerPuestoFijo = perd2; dH.cuartoPuestoFijo = perd1; }

  dH.quintoPuestoFijo = tabla[4].equipo;
  dH.sextoPuestoFijo = tabla[5].equipo;
  dH.septimoPuestoFijo = tabla[6].equipo;

  guardarEstado();
  renderizarFutbolFijo();
}

function actualizarMarcadorFinalFutbolFija(campo, valorStr){
  const dH = disciplinas.hombres;
  const f = dH.finalFutbolFija;
  f[campo] = valorStr === '' ? null : Number(valorStr);
  if(typeof f.golesLocal === 'number' && typeof f.golesVisitante === 'number'){
    if(f.golesLocal === f.golesVisitante){ alert('No puede haber empate.'); f.golesLocal = null; f.golesVisitante = null; f.ganador = null; }
    else f.ganador = f.golesLocal > f.golesVisitante ? f.local : f.visitante;
  } else f.ganador = null;
  guardarEstado();
  renderizarFutbolFijo();
}

function rehacerFutbolFijo(){
  if(!confirm('¿Seguro que quieres borrar los resultados de Fútbol Masculino (partidos, semis, final y puestos)?')) return;
  const dH = disciplinas.hombres;
  dH.partidosFijos = FUTBOL_PARTIDOS_BASE_FIJOS.map(p => ({ local: p.local, visitante: p.visitante, golesLocal: null, golesVisitante: null }));
  dH.tablaFutbolFinal = undefined;
  dH.semifinalFutbolFija = undefined;
  dH.finalFutbolFija = undefined;
  dH.tercerPuestoFijo = undefined;
  dH.cuartoPuestoFijo = undefined;
  dH.quintoPuestoFijo = undefined;
  dH.sextoPuestoFijo = undefined;
  dH.septimoPuestoFijo = undefined;
  guardarEstado();
  renderizarFutbolFijo();
}

function renderizarFutbolFijo(){
  const cont = document.getElementById('futbol-fijo-contenedor');
  if(!cont) return;
  inicializarFutbolFijo();
  const dH = disciplinas.hombres;
  const soloLectura = !esOrganizador();

  let html = '';
  if(!soloLectura){
    html += '<div class="btn-row" style="margin-bottom:10px;"><button class="btn" onclick="rehacerFutbolFijo()" style="background:var(--rojo-tab);">🔄 Rehacer todo</button></div>';
  }

  html += '<b>Partidos (fijos, confirmados)</b><table><tr><th>Local</th><th>Marcador</th><th>Visitante</th></tr>';
  dH.partidosFijos.forEach((p, idx) => {
    html += `<tr><td>${p.local}</td><td>
      <input type="number" min="0" style="width:36px;" value="${p.golesLocal ?? ''}" onchange="actualizarMarcadorFutbolFijo(${idx}, 'golesLocal', this.value)" ${soloLectura?'disabled':''}> -
      <input type="number" min="0" style="width:36px;" value="${p.golesVisitante ?? ''}" onchange="actualizarMarcadorFutbolFijo(${idx}, 'golesVisitante', this.value)" ${soloLectura?'disabled':''}>
      </td><td>${p.visitante}</td></tr>`;
  });
  html += '</table>';

  const tabla = calcularTablaFutbolFija();
  html += '<b style="display:block;margin-top:14px;">Tabla general</b><table><tr><th>Pos</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>Dif</th><th>Pts</th></tr>';
  tabla.forEach((e, pos) => {
    html += `<tr ${pos<4?'class="top3"':''}><td>${pos+1}</td><td>${e.equipo}</td><td>${e.pj}</td><td>${e.pg}</td><td>${e.pe}</td><td>${e.pp}</td><td>${e.dif>0?'+':''}${e.dif}</td><td>${e.pts}</td></tr>`;
  });
  html += '</table><p class="add-note" style="font-size:11px;">Top 4 clasifican a Semifinal (1ro vs 4to, 2do vs 3ro). 5to, 6to, 7mo quedan definidos por esta tabla.</p>';

  if(!dH.semifinalFutbolFija && !soloLectura){
    html += '<div class="btn-row" style="margin-top:14px;"><button class="btn oro" onclick="generarSemifinalFutbolFija()">🏆 Generar Semifinal (Top 4)</button></div>';
  }
  if(dH.semifinalFutbolFija){
    html += '<b style="display:block;margin-top:14px;">Semifinal</b><table><tr><th>Local</th><th>Marcador</th><th>Visitante</th><th>Ganador</th></tr>';
    dH.semifinalFutbolFija.forEach((p, idx) => {
      html += `<tr><td>${p.local}</td><td>
        <input type="number" min="0" style="width:36px;" value="${p.golesLocal ?? ''}" onchange="actualizarMarcadorSemifinalFutbolFija(${idx}, 'golesLocal', this.value)" ${soloLectura?'disabled':''}> -
        <input type="number" min="0" style="width:36px;" value="${p.golesVisitante ?? ''}" onchange="actualizarMarcadorSemifinalFutbolFija(${idx}, 'golesVisitante', this.value)" ${soloLectura?'disabled':''}>
        </td><td>${p.visitante}</td><td>${p.ganador || '—'}</td></tr>`;
    });
    html += '</table>';
  }

  if(dH.semifinalFutbolFija && dH.semifinalFutbolFija.every(p=>p.ganador) && !dH.finalFutbolFija && !soloLectura){
    html += '<div class="btn-row" style="margin-top:14px;"><button class="btn oro" onclick="generarFinalFutbolFija()">🥇 Generar Final y Puestos</button></div>';
  }

  if(dH.finalFutbolFija){
    const f = dH.finalFutbolFija;
    html += '<b style="display:block;margin-top:14px;">Final y puestos</b><table><tr><th>Puesto</th><th>Detalle</th></tr>';
    html += `<tr><td>FINAL (1ro/2do)</td><td>${f.local}
      <input type="number" style="width:36px;" value="${f.golesLocal ?? ''}" onchange="actualizarMarcadorFinalFutbolFija('golesLocal', this.value)" ${soloLectura?'disabled':''}> -
      <input type="number" style="width:36px;" value="${f.golesVisitante ?? ''}" onchange="actualizarMarcadorFinalFutbolFija('golesVisitante', this.value)" ${soloLectura?'disabled':''}> ${f.visitante}${f.ganador?' 🏆 '+f.ganador:''}</td></tr>`;
    html += `<tr><td>3er puesto</td><td>${dH.tercerPuestoFijo || '—'}</td></tr>`;
    html += `<tr><td>4to puesto</td><td>${dH.cuartoPuestoFijo || '—'}</td></tr>`;
    html += `<tr><td>5to puesto</td><td>${dH.quintoPuestoFijo || '—'}</td></tr>`;
    html += `<tr><td>6to puesto</td><td>${dH.sextoPuestoFijo || '—'}</td></tr>`;
    html += `<tr><td>7mo puesto</td><td>${dH.septimoPuestoFijo || '—'}</td></tr>`;
    html += '</table>';
  }

  cont.innerHTML = html;
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
  if(!d.grupos) return;
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

function siguientePotenciaDeDos(n){ let p = 1; while(p < n) p *= 2; return p; }
function ordenSiembra(n){
  if(n === 1) return [1];
  const prev = ordenSiembra(n / 2);
  const resultado = [];
  prev.forEach(s => { resultado.push(s); resultado.push(n + 1 - s); });
  return resultado;
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
      const d2 = disciplinas[disciplinaActual];
      if(!d2.partidos || !d2.partidos[grupoTablaActual]) return;
      d2.partidos[grupoTablaActual][idx][campo] = e.target.value === '' ? null : Number(e.target.value);
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
}

function obtenerClasificados(numPorGrupo = 2){
  const d = disciplinas[disciplinaActual];
  const numGrupos = d.grupos.length;
  let candidatosTodos = [];
  d.grupos.forEach((equiposDelGrupo, idxGrupo) => {
    const partidosDelGrupo = (d.partidos && d.partidos[idxGrupo]) || [];
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

function renderizarGrupos(){
  const d = disciplinas[disciplinaActual];
  const esBasquet = (disciplinaActual === 'basquet');
  const esVoley = (disciplinaActual === 'voley');
  const esHombres = (disciplinaActual === 'hombres');
  const esFutbolNormal = (disciplinaActual === 'mujeres');

  document.getElementById('contenedor-grupos-futbol').style.display = esFutbolNormal ? '' : 'none';
  document.getElementById('contenedor-futbol-fijo').style.display = esHombres ? '' : 'none';
  document.getElementById('contenedor-grupos-basquet').style.display = esBasquet ? '' : 'none';
  document.getElementById('contenedor-grupos-voley').style.display = esVoley ? '' : 'none';

  if(esHombres){ renderizarFutbolFijo(); return; }
  if(esBasquet){ renderizarGruposBasquet(); return; }
  if(esVoley){ renderizarEliminacionVoley(); return; }

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

// ===== BÁSQUET — CUARTOS FIJOS (8 equipos, sin validación de género) =====

function generarRondaUnoBasquet(){
  const d = disciplinas.basquet;
  d.rondaUno = BASQUET_QF_FIJOS.map(p => ({ local: p.local, visitante: p.visitante, golesLocal: null, golesVisitante: null, ganador: null, llave: p.llave }));
  d.semifinalesBasquet = undefined;
  d.perdedoresBasquet = undefined;
  d.finalBasquet = undefined;
  d.tercerPuestoBasquet = undefined;
  d.cuartoPuestoBasquet = undefined;
  d.quintoPuestoBasquet = undefined;
  guardarEstado();
  renderizarGruposBasquet();
  renderizarMarcadoresBasquet();
}

function rehacerCuartosBasquet(){
  if(!confirm('¿Rehacer los Cuartos de Básquet? Se perderán semis, final y puestos.')) return;
  generarRondaUnoBasquet();
}

function renderizarGruposBasquet(){
  const d = disciplinas.basquet;
  const cont = document.getElementById('basquet-cuartos-contenedor');
  if(!cont) return;
  const soloLectura = !esOrganizador();

  if(!d.rondaUno){
    let html = '<p class="add-note">Cuartos de Final fijos (confirmados):</p><ul>';
    BASQUET_QF_FIJOS.forEach(p => { html += `<li>${p.llave}: ${p.local} vs ${p.visitante}</li>`; });
    html += '</ul>';
    if(!soloLectura) html += '<div class="btn-row"><button class="btn oro" onclick="generarRondaUnoBasquet()">🏀 Generar Cuartos</button></div>';
    cont.innerHTML = html;
    return;
  }

  let html = '';
  if(esOrganizador()) html += '<div class="btn-row" style="margin-bottom:10px;"><button class="btn" onclick="rehacerCuartosBasquet()" style="background:var(--rojo-tab);">🔄 Rehacer Cuartos</button></div>';
  html += '<b>Cuartos de Final</b><table><tr><th>Llave</th><th>Local</th><th>Marcador</th><th>Visitante</th><th>Ganador</th></tr>';

  d.rondaUno.forEach((p, idx) => {
    html += `<tr><td>${p.llave}</td><td>${p.local}</td><td>
      <input type="number" min="0" style="width:36px;" value="${p.golesLocal ?? ''}" onchange="actualizarMarcadorBasquet('rondaUno', ${idx}, 'golesLocal', this.value)" ${soloLectura?'disabled':''}> -
      <input type="number" min="0" style="width:36px;" value="${p.golesVisitante ?? ''}" onchange="actualizarMarcadorBasquet('rondaUno', ${idx}, 'golesVisitante', this.value)" ${soloLectura?'disabled':''}>
      </td><td>${p.visitante}</td><td>${p.ganador || '—'}</td></tr>`;
  });
  html += '</table>';
  cont.innerHTML = html;
}

function generarFaseDosBasquet(){
  const d = disciplinas.basquet;
  if(!d.rondaUno || d.rondaUno.some(p => !p.ganador)){
    alert("Completa todos los marcadores de Cuartos primero.");
    return;
  }

  const p1 = d.rondaUno[0], p2 = d.rondaUno[1], p3 = d.rondaUno[2], p4 = d.rondaUno[3];
  const perdedor = (p) => p.ganador === p.local ? p.visitante : p.local;

  d.semifinalesBasquet = [
    { local: p1.ganador, visitante: p2.ganador, golesLocal: null, golesVisitante: null, ganador: null, llave: 'Semifinal 1' },
    { local: p3.ganador, visitante: p4.ganador, golesLocal: null, golesVisitante: null, ganador: null, llave: 'Semifinal 2' }
  ];
  d.perdedoresBasquet = [
    { local: perdedor(p1), visitante: perdedor(p2), golesLocal: null, golesVisitante: null, ganador: null, llave: 'Llave Perdedores 1' },
    { local: perdedor(p3), visitante: perdedor(p4), golesLocal: null, golesVisitante: null, ganador: null, llave: 'Llave Perdedores 2' }
  ];
  guardarEstado();
  renderizarMarcadoresBasquet();
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
  else { renderizarMarcadoresBasquet(); renderizarGruposBasquet(); }
}

function renderizarMarcadoresBasquet(){
  const d = disciplinas.basquet;
  const contFase2 = document.getElementById('marcadores-fase2-basquet');
  const cardFase2 = document.getElementById('card-fase2-basquet');
  if(!contFase2 || !cardFase2) return;

  if(!d.rondaUno || d.rondaUno.some(p => !p.ganador)){
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

  if(!d.semifinalesBasquet && !esOrganizador()){
    contFase2.innerHTML = '<p class="add-note">Aún no se ha generado la fase 2.</p>';
  } else if(!d.semifinalesBasquet){
    contFase2.innerHTML = '<div class="btn-row"><button class="btn oro" onclick="generarFaseDosBasquet()">🏆 Generar Semis y Perdedores</button></div>';
  } else {
    contFase2.innerHTML = '<b>Semifinales (Ganadores)</b><br>' + armarTabla(d.semifinalesBasquet, 'semifinalesBasquet') +
                          '<br><b>Llave de Perdedores (5to lugar)</b><br>' + armarTabla(d.perdedoresBasquet, 'perdedoresBasquet');
  }

  renderizarTablasBasquet();
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

function renderizarEliminatoriaBasquet(){
  const d = disciplinas.basquet;
  const cont = document.getElementById('final-basquet-contenedor');
  if(!cont) return;
  if(!d.semifinalesBasquet || !d.perdedoresBasquet || d.semifinalesBasquet.some(p=>!p.ganador) || d.perdedoresBasquet.some(p=>!p.ganador)){
    cont.innerHTML = '<p class="add-note">Falta generar y completar resultados en la Tabla de Posiciones.</p>'; return;
  }
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

// ===== ECUAVOLEY — CUARTOS FIJOS + TABLA GANADORES/PERDEDORES =====

function generarCuartosVoley(){
  const d = disciplinas.voley;
  d.cuartosVoley = ECUAVOLEY_QF_FIJOS.map(p => ({ local: p.local, visitante: p.visitante, golesLocal: null, golesVisitante: null, ganador: null, llave: p.llave }));
  d.tablaGanadoresVoley = undefined;
  d.tablaPerdedoresVoley = undefined;
  d.semifinalesGanadoresVoley = undefined;
  d.semifinalesPerdedoresVoley = undefined;
  d.finalGanadoresVoley = undefined;
  d.finalPerdedoresVoley = undefined;
  d.tercerPuestoVoley = undefined;
  d.cuartoPuestoVoley = undefined;
  d.septimoPuestoVoley = undefined;
  d.octavoPuestoVoley = undefined;
  guardarEstado();
  renderizarEliminacionVoley();
}

function actualizarMarcadorCuartoVoley(idx, campo, valorStr){
  const d = disciplinas.voley;
  const p = d.cuartosVoley[idx];
  p[campo] = valorStr === '' ? null : Number(valorStr);
  if(typeof p.golesLocal === 'number' && typeof p.golesVisitante === 'number'){
    if(p.golesLocal === p.golesVisitante){ alert('No puede haber empate.'); p.golesLocal = null; p.golesVisitante = null; p.ganador = null; }
    else p.ganador = p.golesLocal > p.golesVisitante ? p.local : p.visitante;
  } else p.ganador = null;
  guardarEstado();
  renderizarEliminacionVoley();
}

function generarTablasVoley(){
  const d = disciplinas.voley;
  if(!d.cuartosVoley || d.cuartosVoley.some(p => !p.ganador)){ alert('Completa los 5 partidos de Cuartos primero.'); return; }
  const dif = (p) => Math.abs(p.golesLocal - p.golesVisitante);
  const gfGan = (p) => p.ganador === p.local ? p.golesLocal : p.golesVisitante;
  const gfPerd = (p) => p.ganador === p.local ? p.golesVisitante : p.golesLocal;
  const perd = (p) => p.ganador === p.local ? p.visitante : p.local;

  d.tablaGanadoresVoley = d.cuartosVoley.map(p => ({ equipo: p.ganador, dif: dif(p), gf: gfGan(p), llave: p.llave }))
    .sort((a,b) => b.dif - a.dif || b.gf - a.gf);
  d.tablaPerdedoresVoley = d.cuartosVoley.map(p => ({ equipo: perd(p), dif: dif(p), gf: gfPerd(p), llave: p.llave }))
    .sort((a,b) => b.dif - a.dif || b.gf - a.gf);

  guardarEstado();
  renderizarEliminacionVoley();
}

function generarSemifinalesVoley(){
  const d = disciplinas.voley;
  if(!d.tablaGanadoresVoley || !d.tablaPerdedoresVoley){ alert('Genera las tablas primero.'); return; }
  const tg = d.tablaGanadoresVoley, tp = d.tablaPerdedoresVoley;
  d.semifinalesGanadoresVoley = [
    { local: tg[0].equipo, visitante: tg[3].equipo, golesLocal: null, golesVisitante: null, ganador: null },
    { local: tg[1].equipo, visitante: tg[2].equipo, golesLocal: null, golesVisitante: null, ganador: null }
  ];
  d.semifinalesPerdedoresVoley = [
    { local: tp[0].equipo, visitante: tp[3].equipo, golesLocal: null, golesVisitante: null, ganador: null },
    { local: tp[1].equipo, visitante: tp[2].equipo, golesLocal: null, golesVisitante: null, ganador: null }
  ];
  guardarEstado();
  renderizarEliminacionVoley();
}

function actualizarMarcadorSemiVoleyDirecta(grupo, idx, campo, valorStr){
  const d = disciplinas.voley;
  const arr = grupo === 'ganadores' ? d.semifinalesGanadoresVoley : d.semifinalesPerdedoresVoley;
  const p = arr[idx];
  p[campo] = valorStr === '' ? null : Number(valorStr);
  if(typeof p.golesLocal === 'number' && typeof p.golesVisitante === 'number'){
    if(p.golesLocal === p.golesVisitante){ alert('No puede haber empate.'); p.golesLocal = null; p.golesVisitante = null; p.ganador = null; }
    else p.ganador = p.golesLocal > p.golesVisitante ? p.local : p.visitante;
  } else p.ganador = null;
  guardarEstado();
  renderizarEliminacionVoley();
}

function generarFinalesVoley(){
  const d = disciplinas.voley;
  if(!d.semifinalesGanadoresVoley || d.semifinalesGanadoresVoley.some(p=>!p.ganador)){ alert('Completa las Semifinales de la Llave Campeonato.'); return; }
  if(!d.semifinalesPerdedoresVoley || d.semifinalesPerdedoresVoley.some(p=>!p.ganador)){ alert('Completa las Semifinales de la Llave 5to al 8vo.'); return; }

  const dif = (p) => Math.abs(p.golesLocal - p.golesVisitante);
  const perd = (p) => p.ganador === p.local ? p.visitante : p.local;
  const gfPerd = (p) => p.ganador === p.local ? p.golesVisitante : p.golesLocal;

  const sg1 = d.semifinalesGanadoresVoley[0], sg2 = d.semifinalesGanadoresVoley[1];
  d.finalGanadoresVoley = { local: sg1.ganador, visitante: sg2.ganador, golesLocal: null, golesVisitante: null, ganador: null };
  const terc = [{equipo: perd(sg1), dif: dif(sg1), gf: gfPerd(sg1)}, {equipo: perd(sg2), dif: dif(sg2), gf: gfPerd(sg2)}].sort((a,b)=>b.dif-a.dif||b.gf-a.gf);
  d.tercerPuestoVoley = terc[0].equipo;
  d.cuartoPuestoVoley = terc[1].equipo;

  const sp1 = d.semifinalesPerdedoresVoley[0], sp2 = d.semifinalesPerdedoresVoley[1];
  d.finalPerdedoresVoley = { local: sp1.ganador, visitante: sp2.ganador, golesLocal: null, golesVisitante: null, ganador: null };
  const sept = [{equipo: perd(sp1), dif: dif(sp1), gf: gfPerd(sp1)}, {equipo: perd(sp2), dif: dif(sp2), gf: gfPerd(sp2)}].sort((a,b)=>b.dif-a.dif||b.gf-a.gf);
  d.septimoPuestoVoley = sept[0].equipo;
  d.octavoPuestoVoley = sept[1].equipo;

  guardarEstado();
  renderizarEliminacionVoley();
}

function actualizarMarcadorFinalVoleyDirecta(grupo, campo, valorStr){
  const d = disciplinas.voley;
  const f = grupo === 'ganadores' ? d.finalGanadoresVoley : d.finalPerdedoresVoley;
  f[campo] = valorStr === '' ? null : Number(valorStr);
  if(typeof f.golesLocal === 'number' && typeof f.golesVisitante === 'number'){
    if(f.golesLocal === f.golesVisitante){ alert('No puede haber empate.'); f.golesLocal = null; f.golesVisitante = null; f.ganador = null; }
    else f.ganador = f.golesLocal > f.golesVisitante ? f.local : f.visitante;
  } else f.ganador = null;
  guardarEstado();
  renderizarEliminacionVoley();
}

function rehacerEliminacionVoley(){
  if(!confirm('¿Rehacer toda la eliminación de Ecuavoley?')) return;
  const d = disciplinas.voley;
  d.cuartosVoley = undefined;
  d.tablaGanadoresVoley = undefined;
  d.tablaPerdedoresVoley = undefined;
  d.semifinalesGanadoresVoley = undefined;
  d.semifinalesPerdedoresVoley = undefined;
  d.finalGanadoresVoley = undefined;
  d.finalPerdedoresVoley = undefined;
  d.tercerPuestoVoley = undefined;
  d.cuartoPuestoVoley = undefined;
  d.septimoPuestoVoley = undefined;
  d.octavoPuestoVoley = undefined;
  guardarEstado();
  renderizarEliminacionVoley();
}

function renderizarEliminacionVoley(){
  const cont = document.getElementById('eliminacion-directa-voley');
  if(!cont) return;
  const d = disciplinas.voley;
  const soloLectura = !esOrganizador();
  let html = '';

  if(!soloLectura){
    html += '<div class="btn-row" style="margin-bottom:10px;">';
    if(!d.cuartosVoley) html += '<button class="btn oro" onclick="generarCuartosVoley()">🏐 Generar Cuartos (5 partidos fijos)</button>';
    else html += '<button class="btn" onclick="rehacerEliminacionVoley()" style="background:var(--rojo-tab);">🔄 Rehacer todo</button>';
    html += '</div>';
  }

  if(!d.cuartosVoley){ cont.innerHTML = html + '<p class="add-note">Aún no se han generado los Cuartos de Final.</p>'; return; }

  html += '<b>Cuartos de Final</b><table><tr><th>Llave</th><th>Local</th><th>Marcador</th><th>Visitante</th><th>Ganador</th></tr>';
  d.cuartosVoley.forEach((p, idx) => {
    html += `<tr><td>${p.llave}</td><td>${p.local}</td><td>
      <input type="number" min="0" style="width:36px;" value="${p.golesLocal ?? ''}" onchange="actualizarMarcadorCuartoVoley(${idx}, 'golesLocal', this.value)" ${soloLectura?'disabled':''}> -
      <input type="number" min="0" style="width:36px;" value="${p.golesVisitante ?? ''}" onchange="actualizarMarcadorCuartoVoley(${idx}, 'golesVisitante', this.value)" ${soloLectura?'disabled':''}>
      </td><td>${p.visitante}</td><td>${p.ganador || '—'}</td></tr>`;
  });
  html += '</table>';

  if(!d.tablaGanadoresVoley && !soloLectura){
    html += '<div class="btn-row" style="margin-top:14px;"><button class="btn oro" onclick="generarTablasVoley()">📊 Generar Tablas de Ganadores/Perdedores</button></div>';
  }

  if(d.tablaGanadoresVoley && d.tablaPerdedoresVoley){
    html += '<div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:14px;">';
    html += '<div style="flex:1;min-width:260px;"><b>Tabla de Ganadores</b><table><tr><th>Pos</th><th>Equipo</th><th>Dif</th><th>Pts</th></tr>';
    d.tablaGanadoresVoley.forEach((e, pos) => {
      html += `<tr ${pos<4?'class="top3"':''}><td>${pos+1}</td><td>${e.equipo}</td><td>+${e.dif}</td><td>${e.gf}</td></tr>`;
    });
    html += '</table><p class="add-note" style="font-size:11px;">Top 4 pasan a Semifinal. 5to queda eliminado.</p></div>';

    html += '<div style="flex:1;min-width:260px;"><b>Tabla de Perdedores</b><table><tr><th>Pos</th><th>Equipo</th><th>Dif</th><th>Pts</th></tr>';
    d.tablaPerdedoresVoley.forEach((e, pos) => {
      html += `<tr ${pos<4?'class="top3"':''}><td>${pos+1}</td><td>${e.equipo}</td><td>+${e.dif}</td><td>${e.gf}</td></tr>`;
    });
    html += '</table><p class="add-note" style="font-size:11px;">Top 4 pasan a Semifinal. 5to queda eliminado.</p></div>';
    html += '</div>';
  }

  if(d.tablaGanadoresVoley && !d.semifinalesGanadoresVoley && !soloLectura){
    html += '<div class="btn-row" style="margin-top:14px;"><button class="btn oro" onclick="generarSemifinalesVoley()">🏆 Generar Semifinales (Ganadores y Perdedores)</button></div>';
  }

  const armarFilaSemi = (p, grupo, idx) => `<tr><td>${p.local}</td><td>
      <input type="number" min="0" style="width:36px;" value="${p.golesLocal ?? ''}" onchange="actualizarMarcadorSemiVoleyDirecta('${grupo}', ${idx}, 'golesLocal', this.value)" ${soloLectura?'disabled':''}> -
      <input type="number" min="0" style="width:36px;" value="${p.golesVisitante ?? ''}" onchange="actualizarMarcadorSemiVoleyDirecta('${grupo}', ${idx}, 'golesVisitante', this.value)" ${soloLectura?'disabled':''}>
      </td><td>${p.visitante}</td><td>${p.ganador || '—'}</td></tr>`;

  if(d.semifinalesGanadoresVoley){
    html += '<b style="display:block;margin-top:14px;">Semifinal — Llave Campeonato (1ro-4to)</b><table><tr><th>Local</th><th>Marcador</th><th>Visitante</th><th>Ganador</th></tr>';
    d.semifinalesGanadoresVoley.forEach((p, idx) => { html += armarFilaSemi(p, 'ganadores', idx); });
    html += '</table>';
  }
  if(d.semifinalesPerdedoresVoley){
    html += '<b style="display:block;margin-top:14px;">Semifinal — Llave 5to al 8vo</b><table><tr><th>Local</th><th>Marcador</th><th>Visitante</th><th>Ganador</th></tr>';
    d.semifinalesPerdedoresVoley.forEach((p, idx) => { html += armarFilaSemi(p, 'perdedores', idx); });
    html += '</table>';
  }

  if(d.semifinalesGanadoresVoley && d.semifinalesGanadoresVoley.every(p=>p.ganador) &&
     d.semifinalesPerdedoresVoley && d.semifinalesPerdedoresVoley.every(p=>p.ganador) &&
     !d.finalGanadoresVoley && !soloLectura){
    html += '<div class="btn-row" style="margin-top:14px;"><button class="btn oro" onclick="generarFinalesVoley()">🥇 Generar Finales y Puestos</button></div>';
  }

  if(d.finalGanadoresVoley){
    const f = d.finalGanadoresVoley;
    html += '<b style="display:block;margin-top:14px;">Final Campeonato (1ro-4to)</b><table><tr><th>Puesto</th><th>Detalle</th></tr>';
    html += `<tr><td>FINAL (1ro/2do)</td><td>${f.local}
      <input type="number" style="width:36px;" value="${f.golesLocal ?? ''}" onchange="actualizarMarcadorFinalVoleyDirecta('ganadores', 'golesLocal', this.value)" ${soloLectura?'disabled':''}> -
      <input type="number" style="width:36px;" value="${f.golesVisitante ?? ''}" onchange="actualizarMarcadorFinalVoleyDirecta('ganadores', 'golesVisitante', this.value)" ${soloLectura?'disabled':''}> ${f.visitante}${f.ganador?' 🏆 '+f.ganador:''}</td></tr>`;
    html += `<tr><td>3er puesto</td><td>${d.tercerPuestoVoley || '—'}</td></tr>`;
    html += `<tr><td>4to puesto</td><td>${d.cuartoPuestoVoley || '—'}</td></tr>`;
    html += '</table>';
  }
  if(d.finalPerdedoresVoley){
    const f = d.finalPerdedoresVoley;
    html += '<b style="display:block;margin-top:14px;">Final 5to al 8vo puesto</b><table><tr><th>Puesto</th><th>Detalle</th></tr>';
    html += `<tr><td>5to/6to</td><td>${f.local}
      <input type="number" style="width:36px;" value="${f.golesLocal ?? ''}" onchange="actualizarMarcadorFinalVoleyDirecta('perdedores', 'golesLocal', this.value)" ${soloLectura?'disabled':''}> -
      <input type="number" style="width:36px;" value="${f.golesVisitante ?? ''}" onchange="actualizarMarcadorFinalVoleyDirecta('perdedores', 'golesVisitante', this.value)" ${soloLectura?'disabled':''}> ${f.visitante}${f.ganador?' 🥉 '+f.ganador:''}</td></tr>`;
    html += `<tr><td>7mo puesto</td><td>${d.septimoPuestoVoley || '—'}</td></tr>`;
    html += `<tr><td>8vo puesto</td><td>${d.octavoPuestoVoley || '—'}</td></tr>`;
    html += '</table>';
  }

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
  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
  input.value = '';
}

function ir(i, btn){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('s'+i).classList.add('active');
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  if(btn){btn.classList.add('active');} else{document.querySelectorAll('nav button')[i].classList.add('active');}

  if(i === 2){
    renderizarGrupos();
  }
  if(i === 3){
    const esFijo = (disciplinaActual === 'hombres' || disciplinaActual === 'basquet' || disciplinaActual === 'voley');
    document.getElementById('contenedor-tabla-futbol').style.display = esFijo ? 'none' : '';
    document.getElementById('s3-fijo-msg').style.display = esFijo ? '' : 'none';
    if(!esFijo){ grupoTablaActual = 0; renderizarTabla(); }
  }
  if(i === 4){
    const esFijo = (disciplinaActual === 'hombres' || disciplinaActual === 'basquet' || disciplinaActual === 'voley');
    document.getElementById('contenedor-eliminacion-futbol').style.display = esFijo ? 'none' : '';
    document.getElementById('s4-fijo-msg').style.display = esFijo ? '' : 'none';
    if(!esFijo){
      if(!disciplinas[disciplinaActual].bracket) generarBracket(2);
      renderizarBracket();
    }
  }
  if(i === 5){
    renderizarListaParejas();
    if(mundial40.bracket) renderizarBracketMundial();
    renderizarListaJenga();
    if(jenga.bracket) renderizarBracketJenga();
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

// ---- JENGA ----
function cambiarTabMundial(tab){
  document.getElementById('bloque-mundial').style.display = tab === 'mundial' ? '' : 'none';
  document.getElementById('bloque-jenga').style.display = tab === 'jenga' ? '' : 'none';
  document.getElementById('tab-mundial').className = 'btn' + (tab === 'mundial' ? ' oro' : '');
  document.getElementById('tab-jenga').className = 'btn' + (tab === 'jenga' ? ' oro' : '');
}

function actualizarMazosJenga(val){
  jenga.numMazos = Number(val) || 5;
  guardarEstado();
}

function inscribirJenga(){
  const input1 = document.getElementById('jenga-jugador1');
  const inputInst = document.getElementById('jenga-institucion');
  const nombre = input1.value.trim();
  if(!nombre){ alert('Ingresa el nombre del participante/pareja.'); return; }

  jenga.participantes.push({ id: Date.now(), nombre, institucion: inputInst ? inputInst.value.trim() : '' });
  if(jenga.bracket) generarBracketJenga();
  guardarEstado();
  renderizarListaJenga();
  if(jenga.bracket) renderizarBracketJenga();
  input1.value = '';
  if(inputInst) inputInst.value = '';
}

function eliminarJengaParticipante(id){
  if(!confirm('¿Eliminar participante?')) return;
  jenga.participantes = jenga.participantes.filter(p => p.id !== id);
  if(jenga.bracket) generarBracketJenga();
  guardarEstado();
  renderizarListaJenga();
  if(jenga.bracket) renderizarBracketJenga();
}

function renderizarListaJenga(){
  const cont = document.getElementById('lista-jenga');
  if(!cont) return;
  if(jenga.participantes.length === 0){ cont.innerHTML = '<p class="add-note">Aún no hay participantes.</p>'; return; }
  cont.innerHTML = '';
  jenga.participantes.forEach(p => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px dashed var(--linea);';
    div.innerHTML = '<span>' + p.nombre + (p.institucion ? ' — ' + p.institucion : '') + '</span>';
    if(esOrganizador()){
      const btn = document.createElement('button');
      btn.textContent = '🗑️';
      btn.onclick = () => eliminarJengaParticipante(p.id);
      div.appendChild(btn);
    }
    cont.appendChild(div);
  });
  const inputMazos = document.getElementById('jenga-num-mazos');
  if(inputMazos) inputMazos.value = jenga.numMazos || 5;
}

function generarBracketJenga(){
  if(jenga.participantes.length < 2){ jenga.bracket = null; return; }
  const bracketPrevio = jenga.bracket;
  const nombres = mezclarAlAzar(jenga.participantes.map(p => p.nombre));
  const tamano = siguientePotenciaDeDos(nombres.length);
  const orden = ordenSiembra(tamano);
  const porSiembra = {};
  nombres.forEach((n, i) => { porSiembra[i + 1] = n; });
  const slots = orden.map(s => porSiembra[s] || 'BYE');

  const ronda1 = [];
  for(let i = 0; i < slots.length; i += 2){
    const local = slots[i], visitante = slots[i + 1];
    let ganador = null;
    if(local === 'BYE') ganador = visitante;
    else if(visitante === 'BYE') ganador = local;
    if(bracketPrevio && bracketPrevio[0]){
      const previo = bracketPrevio[0].find(p => (p.local === local && p.visitante === visitante) || (p.local === visitante && p.visitante === local));
      if(previo && previo.ganador) ganador = previo.ganador;
    }
    ronda1.push({ local, visitante, ganador });
  }

  const rondas = [ronda1];
  while(rondas[rondas.length - 1].length > 1){
    const anterior = rondas[rondas.length - 1];
    const siguiente = [];
    for(let i = 0; i < anterior.length; i += 2){
      siguiente.push({ local: anterior[i].ganador || 'Por definir', visitante: anterior[i+1].ganador || 'Por definir', ganador: null });
    }
    rondas.push(siguiente);
  }
  jenga.bracket = rondas;
  guardarEstado();
}

function rehacerSorteoJenga(){
  if(!jenga.bracket) return;
  if(!confirm('¿Rehacer el sorteo de Jenga?')) return;
  jenga.bracket = null;
  guardarEstado();
  renderizarBracketJenga();
}

function seleccionarGanadorJenga(numRonda, numPartido, ganador){
  jenga.bracket[numRonda][numPartido].ganador = ganador;
  propagarDesdeJenga(numRonda);
  guardarEstado();
  renderizarBracketJenga();
}

function deshacerGanadorJenga(numRonda, numPartido){
  if(!confirm('¿Deshacer este resultado?')) return;
  jenga.bracket[numRonda][numPartido].ganador = null;
  propagarDesdeJenga(numRonda);
  guardarEstado();
  renderizarBracketJenga();
}

function propagarDesdeJenga(numRonda){
  for(let r = numRonda + 1; r < jenga.bracket.length; r++){
    const anterior = jenga.bracket[r - 1];
    const actual = jenga.bracket[r];
    for(let i = 0; i < actual.length; i++){
      actual[i].local = anterior[i*2].ganador || 'Por definir';
      actual[i].visitante = anterior[i*2+1].ganador || 'Por definir';
      actual[i].ganador = null;
    }
  }
}

function renderizarBracketJenga(){
  const cont = document.getElementById('bracket-jenga');
  if(!cont) return;
  cont.innerHTML = '';
  if(!jenga.bracket){ cont.innerHTML = '<p class="add-note">Inscribe al menos 2 participantes para generar el bracket.</p>'; return; }

  const tamanoInicial = jenga.bracket[0].length * 2;
  const etiquetas = nombresRondaMundial[tamanoInicial] || jenga.bracket.map((_, i) => 'Ronda ' + (i+1));

  jenga.bracket.forEach((ronda, numRonda) => {
    const rondaDiv = document.createElement('div'); rondaDiv.className = 'ronda';
    const label = document.createElement('div'); label.className = 'ronda-label';
    label.textContent = etiquetas[numRonda] || ('Ronda ' + (numRonda+1));
    rondaDiv.appendChild(label);

    ronda.forEach((partido, numPartido) => {
      const matchDiv = document.createElement('div'); matchDiv.className = 'match';
      const esFinal = ronda.length === 1 && partido.ganador;
      const esBye = partido.local === 'BYE' || partido.visitante === 'BYE';

      ['local','visitante'].forEach(lado => {
        const nombre = partido[lado];
        const div = document.createElement('div');
        const esGanador = partido.ganador && partido.ganador === nombre;
        div.className = esGanador ? 'win' : '';
        div.textContent = nombre;
        const jugable = nombre && nombre !== 'BYE' && nombre !== 'Por definir' && !esBye && partido.local !== 'Por definir' && partido.visitante !== 'Por definir';
        if(jugable && !partido.ganador && esOrganizador()){
          div.style.cursor = 'pointer';
          div.onclick = () => seleccionarGanadorJenga(numRonda, numPartido, nombre);
        } else if(partido.ganador && !esBye && esOrganizador()){
          div.style.cursor = 'pointer';
          div.onclick = () => deshacerGanadorJenga(numRonda, numPartido);
        }
        matchDiv.appendChild(div);
      });
      rondaDiv.appendChild(matchDiv);

      if(esFinal){
        const campeonDiv = document.createElement('div'); campeonDiv.className = 'ronda';
        campeonDiv.innerHTML = '<div class="ronda-label">Campeón</div><div class="match" style="border:2px solid var(--oro);"><div class="win">🏆 ' + partido.ganador + '</div></div>';
        cont.appendChild(rondaDiv); cont.appendChild(campeonDiv); return;
      }
    });
    if(!(ronda.length === 1 && ronda[0].ganador)) cont.appendChild(rondaDiv);
  });
}

function eliminarEquipo(nombre){
  if(!confirm('¿Eliminar el equipo "' + nombre + '"?')) return;
  const d = disciplinas[disciplinaActual];
  const idx = d.equipos.indexOf(nombre);
  if(idx !== -1) d.equipos.splice(idx, 1);
  if(d.grupos){
    d.grupos.forEach(g => {
      const i = g.indexOf(nombre);
      if(i !== -1) g.splice(i, 1);
    });
  }
  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
}

function editarEquipo(nombreAnterior){
  const d = disciplinas[disciplinaActual];
  const nuevoNombre = prompt('Nuevo nombre del equipo:', nombreAnterior);
  if(!nuevoNombre || !nuevoNombre.trim() || nuevoNombre.trim() === nombreAnterior) return;
  const nuevo = nuevoNombre.trim();
  if(d.equipos.includes(nuevo)){ alert('Ya existe un equipo con ese nombre.'); return; }
  const idx = d.equipos.indexOf(nombreAnterior);
  if(idx !== -1) d.equipos[idx] = nuevo;
  if(d.grupos) d.grupos.forEach(g => {
    const i = g.indexOf(nombreAnterior);
    if(i !== -1) g[i] = nuevo;
  });
  if(d.partidos) d.partidos.forEach(grupoParts => {
    grupoParts.forEach(p => {
      if(p.local === nombreAnterior) p.local = nuevo;
      if(p.visitante === nombreAnterior) p.visitante = nuevo;
    });
  });
  guardarEstado();
  seleccionarDisciplina(disciplinaActual, false);
}

// Global functions for events
window.actualizarMarcadorBasquet = actualizarMarcadorBasquet;
window.generarFaseDosBasquet = generarFaseDosBasquet;
window.generarFinalBasquet = generarFinalBasquet;
window.rehacerFinalBasquet = rehacerFinalBasquet;
window.generarRondaUnoBasquet = generarRondaUnoBasquet;
window.cambiarTabMundial = cambiarTabMundial;
window.actualizarMazosJenga = actualizarMazosJenga;
window.inscribirJenga = inscribirJenga;
window.generarBracketJenga = generarBracketJenga;
window.rehacerSorteoJenga = rehacerSorteoJenga;
window.eliminarEquipo = eliminarEquipo;
window.editarEquipo = editarEquipo;
window.actualizarMarcadorFutbolFijo = actualizarMarcadorFutbolFijo;
window.generarSemifinalFutbolFija = generarSemifinalFutbolFija;
window.actualizarMarcadorSemifinalFutbolFija = actualizarMarcadorSemifinalFutbolFija;
window.generarFinalFutbolFija = generarFinalFutbolFija;
window.actualizarMarcadorFinalFutbolFija = actualizarMarcadorFinalFutbolFija;
window.rehacerFutbolFijo = rehacerFutbolFijo;
window.generarCuartosVoley = generarCuartosVoley;
window.actualizarMarcadorCuartoVoley = actualizarMarcadorCuartoVoley;
window.generarTablasVoley = generarTablasVoley;
window.generarSemifinalesVoley = generarSemifinalesVoley;
window.actualizarMarcadorSemiVoleyDirecta = actualizarMarcadorSemiVoleyDirecta;
window.generarFinalesVoley = generarFinalesVoley;
window.actualizarMarcadorFinalVoleyDirecta = actualizarMarcadorFinalVoleyDirecta;
window.rehacerEliminacionVoley = rehacerEliminacionVoley;
window.rehacerCuartosBasquet = rehacerCuartosBasquet;
iniciarApp();