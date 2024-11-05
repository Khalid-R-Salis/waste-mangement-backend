const jwt = require("jsonwebtoken");

// AUTH MIDDLEWARE TO PROTECT ROUTES
exports.authMiddleware = (req, res, next) => {
  try {
    const authHeaders = req.headers.authorization;
    const token = authHeaders.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res
        .status(401)
        .json({ message: "Token verification failed, authorization denied" });
    }
    req.user = verified.id;
    next();
  } catch (e) {
    res.status(500).json({ message: e.message });
    console.log('Error from jwt', e)
  }
};
