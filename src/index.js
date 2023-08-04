const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Función para cargar las canciones desde el archivo playlist.json
function cargarCancionesDesdeJSON() {
    try {
        const playlistData = fs.readFileSync('playlist.json', 'utf8');
        return JSON.parse(playlistData);
    } catch (error) {
        console.error('Error al cargar la playlist desde JSON:', error);
        return [];
    }
}

// Ruta para obtener las canciones almacenadas
app.get('/playlist', (req, res) => {
    const canciones = cargarCancionesDesdeJSON();
    res.json(canciones);
});

// Ruta para recibir las canciones desde el cliente y guardarlas en el archivo playlist.json
app.put('/playlist', (req, res) => {
    const selectedSongs = req.body;

    fs.writeFile('playlist.json', JSON.stringify(selectedSongs), (err) => {
        if (err) {
            console.error('Error al guardar la playlist en JSON:', err);
            res.status(500).json({ error: 'Error al guardar la playlist en JSON' });
        } else {
            console.log('Playlist guardada correctamente');
            res.json({ message: 'Playlist guardada correctamente' });
        }
    });
});

// Ruta para la solicitud GET en la ruta raíz '/'
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente 🤓');
  });

// Iniciar el servidor y escuchar en el puerto 3000
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port} 🚀`);
});
