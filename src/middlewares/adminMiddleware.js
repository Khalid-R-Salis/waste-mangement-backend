const jwt = require("jsonwebtoken");

exports.adminMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified && verified.role === "admin") {
      req.user = verified;
      next();
    } else {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token verification failed, authorization denied" });
  }
};
