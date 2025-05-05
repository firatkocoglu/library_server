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

  jwt.verify(token, process.env.JWT_SECRET, function (err, dcd) {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    } else {
      req.user = dcd;
      next();
    }
  });
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

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET,
    function (err, dcd) {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(403).json({ message: 'Invalid token' });
      } else {
        if (dcd.isAdmin === false) {
          return res
            .status(403)
            .json({ message: 'You are not authorized to this operation.' });
        }
        req.user = dcd;
        next();
      }
    }
  );
};

module.exports = {
  isAuthenticated,
  isAdmin,
};
