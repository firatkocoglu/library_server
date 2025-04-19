const jwt = require('jsonwebtoken');
const redisClient = require('../middleware/redis.js').redisClient;

const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1]; //

  const isBlacklisted = await redisClient.get(token);
  if (isBlacklisted) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = decoded;
  next();
};

const isAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1]; //
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const isBlacklisted = await redisClient.get(token);
  if (isBlacklisted) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (decoded.isAdmin === false) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  req.user = decoded;
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
};
