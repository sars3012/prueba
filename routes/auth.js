const express = require('express');
const { login, register, editUser, toggleUserStatus, listarUsuarios } = require('../controllers/authController'); // Asegúrate de importar editUser
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Ruta de login
router.post('/login', login);

router.get('/usuarios', authenticateToken, listarUsuarios);

// Ruta para crear nuevos usuarios (requiere token)
router.post('/register', authenticateToken, register);

// Ruta para editar usuarios (requiere token)
router.put('/editar/:identificacion', authenticateToken, editUser); 

// Ruta para activar/desactivar usuarios (requiere token)
router.put('/estado/:identificacion', authenticateToken, toggleUserStatus); 

module.exports = router;
