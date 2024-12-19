"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    "default": e
  };
}
var userSchema = new _mongoose["default"].Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  planId: {
    type: Number,
    "default": 0
  },
  paymentStatus: {
    type: Boolean,
    "default": false
  },
  termsAccepted: {
    type: Boolean,
    required: true
  },
  isVerified: {
    type: Boolean,
    "default": false
  }
}, {
  timestamps: true
});
var _default = exports["default"] = _mongoose["default"].model("User", userSchema);