const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        console.log("decc",decoded,"tttttttttt",token)
        req.userId = decoded.userId;
        next(); 
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
};