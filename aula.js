// Carga módulos desde modulos.json y arma: panel de módulos + lista de clases + reproductor.
// Para agregar/editar contenido: solo edita modulos.json, no toques este archivo.

let MODULOS = [];
let moduloActivoId = null;

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
          <span class="cuenta-modulo">${modulo.clases.length} clase${modulo.clases.length === 1 ? '' : 's'}</span>
        </span>
      `;
      boton.addEventListener('click', () => mostrarModulo(modulo.id));
      panel.appendChild(boton);
    });

    // Abre el primer módulo automáticamente
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

  // Marca la pestaña activa
  document.querySelectorAll('.modulo-tab').forEach((tab) => {
    tab.classList.toggle('activo', Number(tab.dataset.moduloId) === moduloId);
  });

  // Título del módulo
  document.getElementById('titulo-modulo-activo').textContent = modulo.titulo;
  document.getElementById('cuenta-total-modulo').textContent =
    `${modulo.clases.length} clase${modulo.clases.length === 1 ? '' : 's'} en este módulo`;

  // Lista de clases del módulo
  const lista = document.getElementById('lista-clases');
  lista.innerHTML = '';
  modulo.clases.forEach((clase) => {
    const item = document.createElement('div');
    item.className = 'clase';
    item.style.cursor = 'pointer';
    item.innerHTML = `
      <div class="indice">${String(clase.id).padStart(2, '0')}</div>
      <div>
        <h3>${clase.titulo}</h3>
        <p>${clase.descripcion}</p>
      </div>
      <span class="estado disponible">${clase.duracion}</span>
    `;
    item.addEventListener('click', () => mostrarVideo(clase));
    lista.appendChild(item);
  });

  // Reproduce la primera clase del módulo automáticamente
  if (modulo.clases.length) mostrarVideo(modulo.clases[0]);
}

function mostrarVideo(clase) {
  const reproductor = document.getElementById('reproductor');
  const titulo = document.getElementById('titulo-reproductor');
  const iframe = document.getElementById('iframe-video');
  const id = extraerIdDrive(clase.driveId);

  titulo.textContent = `${String(clase.id).padStart(2, '0')} — ${clase.titulo}`;
  iframe.src = `https://drive.google.com/file/d/${id}/preview`;
  reproductor.style.display = 'block';

  document.querySelectorAll('.clase').forEach((el) => el.classList.remove('activa'));
}

cargarModulos();
