const authorizationMiddleware = (roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).send({ error: 'Unauthorized access.' });
    }
  };
};

module.exports = authorizationMiddleware;
