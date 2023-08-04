// Función para enviar un mensaje de Whatsapp
function enviarMensajeWhatsapp() {
  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value;
  const acompanantes = document.getElementById("acompanantes").value;
  const mensaje = `¡Hola! Confirmo mi asistencia para el cumpleaños de Marelo. Yo, ${nombre} ${apellido}, voy a ir con los siguientes acompañantes: ${acompanantes || 'Ninguno'}.`;

  const link = `https://wa.me/5493576464053?text=${encodeURIComponent(mensaje)}`;
  window.open(link, "_blank");
}

// Playlist
const clientId = 'b2e75648ebaa4e72a27e103d84bc867a';
const clientSecret = 'f04e030ee3ef4a23a4155f972e3a98c8';
const redirectUri = 'http://127.0.0.1:5500/index.html';
const apiUrl = 'https://api.spotify.com/v1';

// Función para obtener el token de acceso
function getAccessToken() {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const data = new URLSearchParams();

  data.append('grant_type', 'client_credentials');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://accounts.spotify.com/api/token', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `Basic ${credentials}`);

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.access_token);
      } else {
        reject(new Error(xhr.statusText));
      }
    };

    xhr.onerror = function () {
      reject(new Error('Error de red o CORS bloqueado'));
    };

    xhr.send(data);
  });
}

// Función para buscar canciones en Spotify
async function buscarCancion() {
  const token = await getAccessToken();
  const query = document.getElementById('search').value;
  const searchUrl = `${apiUrl}/search?q=${encodeURIComponent(query)}&type=track`;

  fetch(searchUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
    .then(response => response.json())
    .then(data => mostrarResultados(data.tracks.items))
    .catch(error => console.error('Error en la búsqueda:', error));
}

//Función para convertir ms en minutos
function formatDuration(duration_ms) {
  const totalSeconds = Math.floor(duration_ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Función para mostrar los resultados de la búsqueda
function mostrarResultados(canciones) {
  const resultsList = document.getElementById('results');
  const containerResults = document.getElementById('containerResults');

  containerResults.innerHTML = '';
  resultsList.innerHTML = '';

  const h2 = document.createElement('h2');
  const hr = document.createElement('hr');

  h2.innerHTML = 'Resultados Principales';

  containerResults.appendChild(h2);
  containerResults.appendChild(hr);

  canciones.forEach(cancion => {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');
    const span = document.createElement('span');
    const div = document.createElement('div');
    const div2 = document.createElement('div');

    div.innerHTML = `<img src="${cancion.album.images[0].url}" alt="${cancion.album.name}">`;
    h3.innerText = cancion.name;
    p.innerHTML = `${cancion.artists[0].name}`;
    span.innerHTML = formatDuration(cancion.duration_ms);
    li.onclick = () => agregarCancionALista(cancion.name, cancion.artists[0].name, formatDuration(cancion.duration_ms));

    div2.classList.add('infoSong');

    div2.appendChild(h3);
    div2.appendChild(p);
    div.appendChild(div2);
    div.appendChild(span);
    li.appendChild(div);

    resultsList.appendChild(li);
  });

  containerResults.appendChild(resultsList);

  containerResults.style.display = 'flex';
}

// Conexiones con el servidor

window.addEventListener('load', async () => {
  cargarCancionesDesdeLocalStorage();
  selectedSongs = await cargarCancionesDesdeServidor();
  actualizarTablaHTML();
});

let selectedSongs = [];

// Función para cargar las canciones desde el servidor
async function cargarCancionesDesdeServidor() {
  try {
    const response = await fetch('http://3.94.121.6:3000/playlist', {
      method: 'GET',
      mode: 'cors',
    });
    const playlistData = await response.json();
    return playlistData;
  } catch (error) {
    console.error('Error al cargar la playlist desde el servidor:', error);
    return [];
  }
}

// Función para agregar canciones a la playlist
async function agregarCancionALista(nombre, artista, duracion) {
  const selectedSong = {
    orden: selectedSongs.length + 1,
    nombre: nombre,
    artista: artista,
    duracion: duracion,
  };

  selectedSongs.push(selectedSong);

  try {
    await fetch('http://3.94.121.6:3000/playlist', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedSongs),
    });

    actualizarTablaHTML();
    alert('Canción agregada a la playlist 😎');
  } catch (error) {
    alert('Error al agregar la canción a la playlist 😢');
    console.error('Error al guardar la playlist en JSON:', error);
  }
}

// Función para cargar las canciones desde el Local Storage
function cargarCancionesDesdeLocalStorage() {
  const storedCanciones = localStorage.getItem('cancionesSeleccionadas');
  if (storedCanciones) {
    selectedSongs = JSON.parse(storedCanciones);
  }
}

// Función para actualizar la tabla HTML
function actualizarTablaHTML() {
  const tabla = document.getElementById('tabla');
  tabla.innerHTML = '';

  selectedSongs.forEach((cancion, index) => {
    const row = tabla.insertRow();
    row.insertCell().textContent = cancion.orden;

    const nameArtistCell = row.insertCell();
    nameArtistCell.innerHTML = `<span class="nombre">${cancion.nombre}</span><span class="artista">${cancion.artista}</span>`;
    nameArtistCell.classList.add('name-artist-cell');

    const durationCell = row.insertCell();
    durationCell.textContent = cancion.duracion;
    durationCell.classList.add('duration-cell');
  });
}