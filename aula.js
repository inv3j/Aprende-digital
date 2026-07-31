// Carga las clases desde clases.json y arma el índice + reproductor.
// Para agregar una clase nueva: solo edita clases.json, no toques este archivo.

async function cargarClases() {
  const contenedor = document.getElementById('lista-clases');
  try {
    const respuesta = await fetch('clases.json');
    if (!respuesta.ok) throw new Error('No se pudo cargar clases.json');
    const clases = await respuesta.json();

    contenedor.innerHTML = '';

    clases.forEach((clase) => {
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
      contenedor.appendChild(item);
    });

    // Abre la primera clase automáticamente
    if (clases.length) mostrarVideo(clases[0]);

  } catch (error) {
    contenedor.innerHTML = '<p style="color:#C1382F;">No pudimos cargar tus clases. Escríbenos por WhatsApp si el problema sigue.</p>';
    console.error(error);
  }
}

function mostrarVideo(clase) {
  const reproductor = document.getElementById('reproductor');
  const titulo = document.getElementById('titulo-reproductor');
  const iframe = document.getElementById('iframe-video');

  titulo.textContent = `${String(clase.id).padStart(2, '0')} — ${clase.titulo}`;
  iframe.src = `https://drive.google.com/file/d/${clase.driveId}/preview`;
  reproductor.style.display = 'block';
  reproductor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

cargarClases();
