const express = require('express');
const authRoutes = require('./routes/auth');
const transaccionRoutes = require('./routes/transaccion'); // Importar la nueva ruta de transacciones
require('dotenv').config();

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Opcional: Habilitar CORS si se necesita
const cors = require('cors');
app.use(cors());

// Usar las rutas de autenticación
app.use('/api/auth', authRoutes);

// Usar las rutas de transacciones
app.use('/api/transaccion', transaccionRoutes);

// Middleware para manejo de errores genéricos
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
