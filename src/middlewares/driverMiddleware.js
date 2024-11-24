const jwt = require("jsonwebtoken");

exports.driverMiddleware = (req, res, next) => {
  const authHeaders = req.headers.authorization;
  const token = authHeaders.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified && verified.role === "staff") {
      req.user = verified;
      next();
    } else {
      return res.status(403).json({ message: "Access denied. Staff only." });
    }
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token verification failed, authorization denied" });
  }
};
