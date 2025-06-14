const jwt = require('jsonwebtoken');
const redisClient = require('./redis').redisClient;

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const isBlacklisted = await redisClient.get(token);

  if (isBlacklisted) {
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
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const isBlacklisted = await redisClient.get(token);

  if (isBlacklisted) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, function (err, dcd) {
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
  });
};

module.exports = {
  isAuthenticated,
  isAdmin,
};
