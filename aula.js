// Carga módulos desde modulos.json y arma: navegación de módulos + migas de pan +
// reproductor + botones anterior/siguiente + lista de contenido.
// Para agregar/editar contenido: solo edita modulos.json, no toques este archivo.

let MODULOS = [];
let moduloActivoId = null;
let claseActivaId = null;

function extraerIdDrive(valor) {
  const coincidencia = valor.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return coincidencia ? coincidencia[1] : valor.trim();
}

async function cargarModulos() {
  const panel = document.getElementById('panel-modulos');
  try {
    const respuesta = await fetch('modulos.json');
    if (!respuesta.ok) throw new Error('No se pudo cargar modulos.json');
    MODULOS = await respuesta.json();

    panel.innerHTML = '';
    MODULOS.forEach((modulo) => {
      const boton = document.createElement('button');
      boton.className = 'modulo-tab';
      boton.dataset.moduloId = modulo.id;
      boton.innerHTML = `
        <span class="num-modulo">${String(modulo.id).padStart(2, '0')}</span>
        <span class="info-modulo">
          <span class="titulo-modulo">${modulo.titulo}</span>
          <span class="cuenta-modulo">${modulo.clases.length} elemento${modulo.clases.length === 1 ? '' : 's'}</span>
        </span>
      `;
      boton.addEventListener('click', () => mostrarModulo(modulo.id));
      panel.appendChild(boton);
    });

    if (MODULOS.length) mostrarModulo(MODULOS[0].id);

  } catch (error) {
    panel.innerHTML = '<p style="color:#C1382F;">No pudimos cargar el contenido. Escríbenos por WhatsApp si el problema sigue.</p>';
    console.error(error);
  }
}

function mostrarModulo(moduloId) {
  moduloActivoId = moduloId;
  const modulo = MODULOS.find((m) => m.id === moduloId);
  if (!modulo) return;

  document.querySelectorAll('.modulo-tab').forEach((tab) => {
    tab.classList.toggle('activo', Number(tab.dataset.moduloId) === moduloId);
  });

  document.getElementById('titulo-modulo-activo').textContent = modulo.titulo;
  document.getElementById('cuenta-total-modulo').textContent =
    `${modulo.clases.length} elemento${modulo.clases.length === 1 ? '' : 's'} en este módulo`;

  const cajaMensaje = document.getElementById('mensaje-modulo');
  if (modulo.mensaje) {
    cajaMensaje.textContent = modulo.mensaje;
    cajaMensaje.style.display = 'block';
  } else {
    cajaMensaje.style.display = 'none';
  }

  renderizarListaClases(modulo);

  if (modulo.clases.length) mostrarContenido(modulo.clases[0].id);
  else document.getElementById('reproductor').style.display = 'none';
}

function renderizarListaClases(modulo) {
  const lista = document.getElementById('lista-clases');
  lista.innerHTML = '';
  modulo.clases.forEach((clase) => {
    const item = document.createElement('div');
    item.className = 'clase';
    item.dataset.claseId = clase.id;
    item.style.cursor = 'pointer';
    const icono = clase.tipo === 'documento' ? '📄' : '▶️';
    item.innerHTML = `
      <div class="indice">${icono}</div>
      <div>
        <h3>${clase.titulo}</h3>
        <p>${clase.descripcion}</p>
      </div>
      <span class="estado disponible">${clase.duracion || ''}</span>
    `;
    item.addEventListener('click', () => mostrarContenido(clase.id));
    lista.appendChild(item);
  });
}

function mostrarContenido(claseId) {
  const modulo = MODULOS.find((m) => m.id === moduloActivoId);
  if (!modulo) return;
  const indiceActual = modulo.clases.findIndex((c) => c.id === claseId);
  if (indiceActual === -1) return;
  const clase = modulo.clases[indiceActual];
  claseActivaId = claseId;

  const reproductor = document.getElementById('reproductor');
  const titulo = document.getElementById('titulo-reproductor');
  const envoltura = document.getElementById('envoltura-video');
  const iframe = document.getElementById('iframe-video');
  const id = extraerIdDrive(clase.driveId);

  titulo.textContent = clase.titulo;
  iframe.src = `https://drive.google.com/file/d/${id}/preview`;
  envoltura.classList.toggle('documento', clase.tipo === 'documento');
  envoltura.classList.toggle('vertical', clase.vertical === true);
  reproductor.style.display = 'block';

  // Migas de pan: "Módulo X de Y · Nombre — Clase N de Total"
  const numModulo = MODULOS.findIndex((m) => m.id === moduloActivoId) + 1;
  document.getElementById('migas').textContent =
    `Módulo ${numModulo} de ${MODULOS.length} · ${modulo.titulo} — Elemento ${indiceActual + 1} de ${modulo.clases.length}`;

  // Resaltar la clase activa en la lista
  document.querySelectorAll('.clase').forEach((el) => {
    el.classList.toggle('activa', Number(el.dataset.claseId) === claseId);
  });

  // Botones Anterior / Siguiente
  const btnAnterior = document.getElementById('btn-anterior');
  const btnSiguiente = document.getElementById('btn-siguiente');

  const hayModuloAnterior = MODULOS.findIndex((m) => m.id === moduloActivoId) > 0;
  const hayModuloSiguiente = MODULOS.findIndex((m) => m.id === moduloActivoId) < MODULOS.length - 1;

  btnAnterior.disabled = indiceActual === 0 && !hayModuloAnterior;
  btnAnterior.textContent = indiceActual === 0 ? '‹ Módulo anterior' : '‹ Anterior';

  btnSiguiente.disabled = indiceActual === modulo.clases.length - 1 && !hayModuloSiguiente;
  btnSiguiente.textContent = indiceActual === modulo.clases.length - 1 ? 'Siguiente módulo ›' : 'Siguiente ›';

  // Sube el scroll hasta el reproductor para que quede claro qué está viendo
  reproductor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function irAnterior() {
  const modulo = MODULOS.find((m) => m.id === moduloActivoId);
  const indiceActual = modulo.clases.findIndex((c) => c.id === claseActivaId);

  if (indiceActual > 0) {
    mostrarContenido(modulo.clases[indiceActual - 1].id);
  } else {
    const indiceModulo = MODULOS.findIndex((m) => m.id === moduloActivoId);
    if (indiceModulo > 0) {
      const moduloAnterior = MODULOS[indiceModulo - 1];
      mostrarModulo(moduloAnterior.id);
      const ultimaClase = moduloAnterior.clases[moduloAnterior.clases.length - 1];
      if (ultimaClase) mostrarContenido(ultimaClase.id);
    }
  }
}

function irSiguiente() {
  const modulo = MODULOS.find((m) => m.id === moduloActivoId);
  const indiceActual = modulo.clases.findIndex((c) => c.id === claseActivaId);

  if (indiceActual < modulo.clases.length - 1) {
    mostrarContenido(modulo.clases[indiceActual + 1].id);
  } else {
    const indiceModulo = MODULOS.findIndex((m) => m.id === moduloActivoId);
    if (indiceModulo < MODULOS.length - 1) {
      mostrarModulo(MODULOS[indiceModulo + 1].id);
    }
  }
}

document.getElementById('btn-anterior').addEventListener('click', irAnterior);
document.getElementById('btn-siguiente').addEventListener('click', irSiguiente);

cargarModulos();
