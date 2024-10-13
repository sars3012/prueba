const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401); // No token, no acceso

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token no válido
        req.user = user; // Asegúrate de que el rol está en user
        next();
    });
};

module.exports = authenticateToken;
