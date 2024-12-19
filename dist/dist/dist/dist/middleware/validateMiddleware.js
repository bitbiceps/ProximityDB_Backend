"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateRegistration = exports.validateLogin = void 0;
var validateRegistration = exports.validateRegistration = function validateRegistration(req, res, next) {
  var _req$body = req.body,
    fullName = _req$body.fullName,
    email = _req$body.email,
    password = _req$body.password,
    phoneNumber = _req$body.phoneNumber,
    termsAccepted = _req$body.termsAccepted;
  if (!fullName || !email || !password || !phoneNumber || !termsAccepted) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }
  next();
};
var validateLogin = exports.validateLogin = function validateLogin(req, res, next) {
  var _req$body2 = req.body,
    email = _req$body2.email,
    password = _req$body2.password;
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }
  next();
};