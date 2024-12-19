"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _authController = require("../controllers/authController.js");
var _validateMiddleware = require("../middleware/validateMiddleware.js");
var _authMiddleware = require("../middleware/authMiddleware.js");
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    "default": e
  };
}
var router = _express["default"].Router();
router.post("/register", _validateMiddleware.validateRegistration, _authController.registerUser);
router.post("/login", _validateMiddleware.validateLogin, _authController.loginUser);
router.get("/verify/:token", _authController.verifyEmail);

// router.get("/home", verifyToken, getUser);
var _default = exports["default"] = router;