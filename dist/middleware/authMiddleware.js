import jwt from "jsonwebtoken";
export var verifyToken = function verifyToken(req, res, next) {
  var authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({
      message: "No token provided"
    });
  }
  var token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      message: "No token provided"
    });
  }
  try {
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded, "Token:", token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
      error: error.message
    });
  }
};