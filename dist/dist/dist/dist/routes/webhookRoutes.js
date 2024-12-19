"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _paymentController = require("../controllers/paymentController.js");
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    "default": e
  };
}
var router = _express["default"].Router();
router.post("/stripe", _express["default"].raw({
  type: "application/json"
}), _paymentController.handlePaymentWebhook);
var _default = exports["default"] = router;