"use strict";

var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _mongoose = _interopRequireDefault(require("mongoose"));
var _authRoutes = _interopRequireDefault(require("./routes/authRoutes.js"));
var _paymentRoutes = _interopRequireDefault(require("./routes/paymentRoutes.js"));
var _articleRoutes = _interopRequireDefault(require("./routes/articleRoutes.js"));
var _webhookRoutes = _interopRequireDefault(require("./routes/webhookRoutes.js"));
var _topicRoutes = _interopRequireDefault(require("./routes/topicRoutes.js"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    "default": e
  };
}
var app = (0, _express["default"])();
var db = process.env.DB.replace("<db_password>", process.env.password);
_mongoose["default"].connect(db).then(function () {
  return console.log("Database connected successfully!!");
})["catch"](function (err) {
  return console.log("Error connecting to database", err);
});
app.use((0, _cors["default"])({
  origin: "http://localhost:5173"
}));
app.use("/webhooks", _express["default"].raw({
  type: "application/json"
}), _webhookRoutes["default"]);
app.use("/pay", _express["default"].json(), _paymentRoutes["default"]);
app.use("/api/auth", _express["default"].json(), _authRoutes["default"]);
app.use("/article", _express["default"].json(), _articleRoutes["default"]);
app.use("/topic", _express["default"].json(), _topicRoutes["default"]);
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  return console.log("Server running on port ".concat(PORT));
});