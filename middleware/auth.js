const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
    try{ 
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;
    req.auth = {
        id: userId

    };
    next();
}catch (error) {
    res.status(401).json({ error: 'Requête non authentifiée !' });
}
};