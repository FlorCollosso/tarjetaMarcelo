function enviarMensajeWhatsapp() {
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const acompanantes = document.getElementById("acompanantes").value;
    const mensaje = `¡Hola! Confirmo mi asistencia para el cumpleaños de Marelo. Yo, ${nombre} ${apellido}, voy a ir con los siguientes acompañantes: ${acompanantes || 'Ninguno'}.`;
    
    const link = `https://wa.me/5493576447120?text=${encodeURIComponent(mensaje)}`;
    window.open(link, "_blank");
}

// Playlist

    const clientId = 'b2e75648ebaa4e72a27e103d84bc867a';
    const clientSecret = 'f04e030ee3ef4a23a4155f972e3a98c8';
    const redirectUri = 'http://127.0.0.1:5500/index.html';
    
    const apiUrl = 'https://api.spotify.com/v1';
    
    let playlistId = '4X0mBqn4uPJAx9fUvwJRpa';

    function getAccessToken() {
      const credentials = btoa(`${clientId}:${clientSecret}`);
    
      const data = new URLSearchParams();
      data.append('grant_type', 'client_credentials');
      data.append('scope', 'playlist-modify-public playlist-modify-private');
    
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://accounts.spotify.com/api/token', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('Authorization', `Basic ${credentials}`);
        xhr.setRequestHeader('Cookie', '__Host-device_id=AQADHqVNsrx2jxCFtjZKqbEs4Gn0vKNVN25BM_GsYFdGZSpoAAyRCVlMcMGikqeKQXAj-N_GJWmWB7izusTj06U5tv2W4q_Endk; sp_tr=false');
    
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
    
      resultsList.innerHTML = '';
    
      const h2 = document.createElement('h2');
      const hr = document.createElement('hr');
      h2.innerHTML = 'Resultados Principales';
      containerResults.appendChild(hr);
      containerResults.appendChild(h2);
    
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
        li.onclick = () => agregarCancionALista(cancion.uri, playlistId);
    
        div2.classList.add('infoSong');
    
        div2.appendChild(h3);
        div2.appendChild(p);
        div.appendChild(div2);
        div.appendChild(span);
        li.appendChild(div);
    
        // Agregamos el <li> directamente al contenedor de resultados
        resultsList.appendChild(li);
      });
    
      containerResults.style.display = 'flex';
    }

    // Función para agregar una canción a la lista de reproducción
    async function agregarCancionALista(cancionUri, listaId) {
      const token = await getAccessToken();
      const playlistUrl = `${apiUrl}/playlists/${listaId}/tracks`;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const data = {
        uris: [cancionUri]
      };

      fetch(playlistUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      })
      .then(response => {
        if (response.ok) {
          alert('Canción agregada correctamente a la lista.');
        } else {
          alert('Error al agregar la canción a la lista.');
        }
      })
      .catch(error => {
        console.error('Error al agregar la canción:', error);
      });
    }