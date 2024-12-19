"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyToken = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    "default": e
  };
}
var verifyToken = function verifyToken(req, res, next) {
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
    var decoded = _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET);
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
exports.verifyToken = verifyToken;