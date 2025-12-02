const search = document.getElementById('search');
const area = document.getElementById('area');
const grado = document.getElementById('grado');
const aprendizaje = document.getElementById('aprendizaje');
const results = document.getElementById('results');

async function buscarActividades() {
  const params = new URLSearchParams({
    q: search.value,
    area: area.value,
    grado: grado.value,
    aprendizaje: aprendizaje.value
  });

  const res = await fetch(`/api/actividades?${params.toString()}`);
  const data = await res.json();

  results.innerHTML = '';
  if (data.length === 0) {
    results.innerHTML = '<p>No se encontraron resultados.</p>';
    return;
  }

 data.forEach(act => {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>${act.nombre}</h3>
    <p>${act.descripcion}</p>
    <small><b>Área:</b> ${act.area} | <b>Grado:</b> ${act.grado}</small><br>
    <small><b>Aprendizaje esperado:</b> ${act.aprendizaje}</small><br><br>
    <button class="btn-descargar" onclick="descargarActividad(${act.id})">📥 Descargar</button>
  `;
  results.appendChild(card);
});
}

[search, area, grado, aprendizaje].forEach(el =>
  el.addEventListener('input', buscarActividades)
);

window.addEventListener('load', buscarActividades);
function descargarActividad(id) {
  window.location.href = `/api/descargar/${id}`;
}
