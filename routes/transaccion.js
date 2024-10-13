const express = require('express');
const {
    realizarDeposito,
    realizarRetiro,
    realizarTransferencia,
    verTransacciones,
    verTodasLasTransacciones // Importa la nueva función
} = require('../controllers/transactionController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Ruta para realizar depósito
router.post('/deposito', authenticateToken, realizarDeposito);

// Ruta para realizar retiro
router.post('/retiro', authenticateToken, realizarRetiro);

// Ruta para realizar transferencia
router.post('/transferencia', authenticateToken, realizarTransferencia);

// Ruta para ver transacciones de un usuario específico
router.get('/transacciones', authenticateToken, verTransacciones);

// Ruta para ver todas las transacciones (solo rol 1)
router.get('/todas', authenticateToken, verTodasLasTransacciones);

module.exports = router;
