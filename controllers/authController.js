const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../models/db');

// Función para validar la contraseña (mínimo 8 caracteres, máximo 20, al menos una letra y un número)
function validarContrasena(contrasena) {
    // Actualización del regex para incluir caracteres alfabéticos y especiales
    const regex = /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñ])(?=.*\d)[A-Za-zÁÉÍÓÚáéíóúÑñ\d]{8,20}$/;
    console.log('Validando contraseña:', contrasena); // Verifica si el valor correcto llega
    return regex.test(contrasena);
}

// Función para manejar el login
const login = async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        // Verificar si el correo existe
        const userQuery = 'SELECT * FROM sbUsuario WHERE correo = $1';
        const userResult = await pool.query(userQuery, [correo]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Correo no existe' });
        }

        const user = userResult.rows[0];

        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(contraseña, user.contraseña);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        // Generar el token
        const token = jwt.sign({ 
            id: user.identificacion, 
            correo: user.correo,
            rol_id: user.rol_id // Asegúrate de acceder al rol correcto aquí
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Responder con el token y la información del usuario (sin la contraseña)
        const { contraseña: _, ...userData } = user; // Eliminar la contraseña de los datos del usuario
        res.json({ token, userData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const register = async (req, res) => {
    const { nombre, identificacion, correo, contraseña, rol_id } = req.body;

    // Validar el rol_id
    const rolesValidos = [1, 2]; // Suponiendo que 1 es 'admin' y 2 es 'cliente'
    if (!rolesValidos.includes(rol_id)) {
        return res.status(400).json({ error: 'Rol inválido. Debe ser 1 (admin) o 2 (cliente).' });
    }

    // Inicializar arrays para actualizaciones
    const updates = [];
    const values = [];

    // Validar que la contraseña tenga letras y números
    if (contraseña) {
        console.log('Contraseña antes de validar:', contraseña);
        if (!validarContrasena(contraseña)) {
            return res.status(400).json({
                error: 'La contraseña debe contener al menos una letra, un número y tener entre 8 y 20 caracteres.'
            });
        }
        // Encriptar la contraseña si es válida
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        updates.push(`contraseña = $${values.length + 1}`);
        values.push(hashedPassword);
    }
    
    // Solo permitir usuarios con rol_id 1 (admin) a crear nuevos usuarios
    if (req.user.rol_id !== 1) {
        return res.status(403).json({ error: 'No tienes permiso para crear nuevos usuarios.', rol: req.user.rol_id });
    }

    try {
        // Verificar si el correo ya existe
        const existingUserQuery = 'SELECT * FROM sbUsuario WHERE correo = $1';
        const existingUserResult = await pool.query(existingUserQuery, [correo]);

        if (existingUserResult.rows.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar nuevo usuario
        const insertUserQuery = `
            INSERT INTO sbUsuario (identificacion, nombre, correo, contraseña, rol_id, estado)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const newUserResult = await pool.query(insertUserQuery, [identificacion, nombre, correo, hashedPassword, rol_id, true]);

        const newUser = newUserResult.rows[0];

        // Generar número de cuenta aleatorio de 10 cifras
        const nroCuenta = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        // Insertar cuenta en sbCuenta
        const insertAccountQuery = `
            INSERT INTO sbCuenta (nroCuenta, monto, usuario_id)
            VALUES ($1, $2, $3) RETURNING *`;
        const initialAmount = 1000000; // Monto inicial
        const newAccountResult = await pool.query(insertAccountQuery, [nroCuenta, initialAmount, newUser.identificacion]);

        // Responder con el nuevo usuario y su cuenta (sin la contraseña)
        delete newUser.contraseña; // No enviar la contraseña en la respuesta
        res.status(201).json({
            user: newUser,
            account: newAccountResult.rows[0] // Incluir los detalles de la cuenta creada
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const editUser = async (req, res) => {
    const { nombre, correo, contraseña } = req.body; // Campos opcionales
    const userId = req.params.identificacion; // Obtener el ID del usuario desde la ruta
    console.log('Datos recibidos:', { nombre, correo, contraseña });

    // Solo permitir usuarios con rol_id 1 (admin) a editar usuarios
    if (req.user.rol_id !== 1) {
        return res.status(403).json({ error: 'No tienes permiso para editar usuarios.', rol: req.user.rol_id });
    }

    try {
        // Verificar si el usuario a editar existe
        const userQuery = 'SELECT * FROM sbUsuario WHERE identificacion = $1';
        const userResult = await pool.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const user = userResult.rows[0];

        // Crear un array para almacenar las actualizaciones
        const updates = [];
        const values = [];

        // Actualizar solo los campos que estén presentes en la solicitud
        if (nombre) {
            updates.push(`nombre = $${values.length + 1}`);
            values.push(nombre);
        }

        if (correo) {
            updates.push(`correo = $${values.length + 1}`);
            values.push(correo);
        }

        if (contraseña) {
            console.log('Contraseña a validar:', contraseña); // Depuración
            if (!validarContrasena(contraseña)) {
                return res.status(400).json({
                    error: 'La contraseña debe contener al menos una letra, un número y tener entre 8 y 20 caracteres.'
                });
            }
        
            // Encriptar la nueva contraseña
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            updates.push(`contraseña = $${values.length + 1}`);
            values.push(hashedPassword);
        }
        
        // Si no se ha proporcionado ningún campo para actualizar
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
        }

        // Actualizar el usuario con los campos proporcionados
        const updateUserQuery = `
            UPDATE sbUsuario
            SET ${updates.join(', ')}
            WHERE identificacion = $${values.length + 1} RETURNING *`;

        values.push(userId); // Añadir el ID del usuario al final de los valores

        const updatedUserResult = await pool.query(updateUserQuery, values);
        const updatedUser = updatedUserResult.rows[0];

        // Eliminar la contraseña del usuario actualizado antes de devolver la respuesta
        delete updatedUser.contraseña;

        // Enviar respuesta de éxito
        res.status(200).json({ mensaje: 'Usuario modificado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Función para manejar la activación/desactivación de usuarios
const toggleUserStatus = async (req, res) => {
    const userId = req.params.identificacion; // Obtener el ID del usuario desde la ruta

    // Solo permitir usuarios con rol_id 1 (admin) a cambiar el estado de los usuarios
    if (req.user.rol_id !== 1) {
        return res.status(403).json({ error: 'No tienes permiso para cambiar el estado de usuarios.', rol: req.user.rol_id });
    }

    try {
        // Verificar si el usuario existe
        const userQuery = 'SELECT * FROM sbUsuario WHERE identificacion = $1';
        const userResult = await pool.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Obtener el estado actual del usuario
        const user = userResult.rows[0];
        const newState = !user.estado; // Cambiar el estado (true a false o viceversa)

        // Actualizar el estado del usuario en la base de datos
        const updateStatusQuery = `
            UPDATE sbUsuario
            SET estado = $1
            WHERE identificacion = $2 RETURNING *`;

        const updatedUserResult = await pool.query(updateStatusQuery, [newState, userId]);

        const updatedUser = updatedUserResult.rows[0];

        // Responder con el usuario actualizado (sin la contraseña)
        delete updatedUser.contraseña; // No enviar la contraseña en la respuesta
        if(updatedUser.estado == true){
            res.status(200).json({ mensaje: 'Usuario activado' });
        }else{
            res.status(200).json({ mensaje: 'Usuario desactivado' });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Función para listar los usuarios
const listarUsuarios = async (req, res) => {
    // Solo permitir usuarios con rol_id 1 (admin) a listar usuarios
    if (req.user.rol_id !== 1) {
        return res.status(403).json({ error: 'No tienes permiso para listar usuarios.', rol: req.user.rol_id });
    }

    try {
        // Consulta para obtener todos los usuarios
        const userQuery = 'SELECT identificacion, nombre, correo, rol_id, estado FROM sbUsuario';
        const userResult = await pool.query(userQuery);

        // Procesar los resultados y eliminar las contraseñas
        const usuarios = userResult.rows.map(({ contraseña, ...userData }) => userData); // Eliminar la contraseña de los datos

        // Enviar la lista de usuarios
        return res.status(200).json(usuarios); // Asegúrate de que aquí se devuelve la respuesta correctamente
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' }); // Siempre devolver un JSON en caso de error
    }
};

// Exportar la función listarUsuarios junto con las otras funciones
module.exports = {
    login,
    register,
    editUser,
    toggleUserStatus,
    listarUsuarios // Asegúrate de añadir esta línea para exportar la nueva función
};

