const express = require('express');
const pool = require('../models/db'); // Asegúrate de que esta ruta sea correcta

// Función para realizar depósito
const realizarDeposito = async (req, res) => {
    const { cuenta_id, monto } = req.body;

    // Validar que el usuario tenga rol 2
    if (req.user.rol_id !== 2) {
        return res.status(403).json({ error: 'Acceso denegado: No tienes permiso para realizar transacciones' });
    }

    try {
        if (monto <= 0) {
            return res.status(400).json({ error: 'El monto debe ser mayor que 0' });
        }

        // Verificar el estado de la cuenta
        console.log(`Consulta de cuenta: ${cuenta_id}`);
        const cuentaQuery = await pool.query('SELECT estado FROM sbCuenta WHERE nroCuenta = $1', [cuenta_id]);
        console.log(cuentaQuery.rows);
        
        if (cuentaQuery.rows.length === 0 || !cuentaQuery.rows[0].estado) {
            return res.status(403).json({ error: 'Cuenta inactiva o no encontrada' });
        }

        const query = 'UPDATE sbCuenta SET monto = monto + $1 WHERE nroCuenta = $2 RETURNING *';
        const result = await pool.query(query, [monto, cuenta_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        // Registrar la transacción
        await pool.query('INSERT INTO sbTransaccion (cuenta_id, tipo, monto) VALUES ($1, $2, $3)', [cuenta_id, 'deposito', monto]);

        return res.status(200).json({ message: 'Depósito realizado con éxito', cuenta: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Función para realizar retiro
const realizarRetiro = async (req, res) => {
    const { cuenta_id, monto } = req.body;

    // Validar que el usuario tenga rol 2
    if (req.user.rol_id !== 2) {
        return res.status(403).json({ error: 'Acceso denegado: No tienes permiso para realizar transacciones' });
    }

    try {
        if (monto <= 0) {
            return res.status(400).json({ error: 'El monto debe ser mayor que 0' });
        }

        // Verificar el estado de la cuenta
        const cuentaQuery = await pool.query('SELECT estado, monto FROM sbCuenta WHERE nroCuenta = $1', [cuenta_id]);
        if (cuentaQuery.rows.length === 0 || !cuentaQuery.rows[0].estado) {
            return res.status(403).json({ error: 'Cuenta inactiva o no encontrada' });
        }

        if (cuentaQuery.rows[0].monto < monto) {
            return res.status(400).json({ error: 'Saldo insuficiente para el retiro' });
        }

        const query = 'UPDATE sbCuenta SET monto = monto - $1 WHERE nroCuenta = $2 RETURNING *';
        const result = await pool.query(query, [monto, cuenta_id]);

        // Registrar la transacción
        await pool.query('INSERT INTO sbTransaccion (cuenta_id, tipo, monto) VALUES ($1, $2, $3)', [cuenta_id, 'retiro', monto]);

        return res.status(200).json({ message: 'Retiro realizado con éxito', cuenta: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Función para realizar transferencia
const realizarTransferencia = async (req, res) => {
    const { cuenta_id, cuentaDestino_id, monto } = req.body;

    // Validar que el usuario tenga rol 2
    if (req.user.rol_id !== 2) {
        return res.status(403).json({ error: 'Acceso denegado: No tienes permiso para realizar transacciones' });
    }

    try {
        if (monto <= 0) {
            return res.status(400).json({ error: 'El monto debe ser mayor que 0' });
        }

        // Verificar el estado de la cuenta de origen
        const cuentaOrigenQuery = await pool.query('SELECT estado, monto FROM sbCuenta WHERE nroCuenta = $1', [cuenta_id]);
        if (cuentaOrigenQuery.rows.length === 0 || !cuentaOrigenQuery.rows[0].estado) {
            return res.status(403).json({ error: 'Cuenta de origen inactiva o no encontrada' });
        }

        // Verificar el estado de la cuenta de destino
        const cuentaDestinoQuery = await pool.query('SELECT estado FROM sbCuenta WHERE nroCuenta = $1', [cuentaDestino_id]);
        if (cuentaDestinoQuery.rows.length === 0 || !cuentaDestinoQuery.rows[0].estado) {
            return res.status(403).json({ error: 'Cuenta de destino inactiva o no encontrada' });
        }

        if (cuentaOrigenQuery.rows[0].monto < monto) {
            return res.status(400).json({ error: 'Saldo insuficiente para la transferencia' });
        }

        // Realizar la transferencia
        await pool.query('UPDATE sbCuenta SET monto = monto - $1 WHERE nroCuenta = $2', [monto, cuenta_id]);
        await pool.query('UPDATE sbCuenta SET monto = monto + $1 WHERE nroCuenta = $2', [monto, cuentaDestino_id]);

        // Registrar la transacción
        await pool.query('INSERT INTO sbTransaccion (cuenta_id, cuentaDestino_id, tipo, monto) VALUES ($1, $2, $3, $4)', [cuenta_id, cuentaDestino_id, 'transferencia', monto]);

        return res.status(200).json({ message: 'Transferencia realizada con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Función para ver las transacciones
const verTransacciones = async (req, res) => {
    // Obtener el cuenta_id del header
    const cuenta_id = req.headers['cuenta_id'];

    // Validar que el usuario tenga rol 2
    if (req.user.rol_id !== 2) {
        return res.status(403).json({ error: 'Acceso denegado: No tienes permiso para ver transacciones' });
    }

    try {
        // Consultar las transacciones de la cuenta
        const transaccionesQuery = await pool.query('SELECT * FROM sbTransaccion WHERE cuenta_id = $1', [cuenta_id]);

        if (transaccionesQuery.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron transacciones para esta cuenta' });
        }

        return res.status(200).json({ transacciones: transaccionesQuery.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Función para ver todas las transacciones
const verTodasLasTransacciones = async (req, res) => {
    // Validar que el usuario tenga rol 1
    if (req.user.rol_id !== 1) {
        return res.status(403).json({ error: 'Acceso denegado: No tienes permiso para ver todas las transacciones' });
    }

    try {
        // Consultar todas las transacciones
        const transaccionesQuery = await pool.query('SELECT * FROM sbTransaccion');

        if (transaccionesQuery.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron transacciones' });
        }

        return res.status(200).json({ transacciones: transaccionesQuery.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Exportar las funciones
module.exports = {
    realizarDeposito,
    realizarRetiro,
    realizarTransferencia,
    verTransacciones,
    verTodasLasTransacciones 
};
