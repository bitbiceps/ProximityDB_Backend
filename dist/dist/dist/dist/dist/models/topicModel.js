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
// Define the Topic schema
var topicSchema = new _mongoose["default"].Schema({
  // Array of topics where each topic has additional fields like `updateRequested` and `verifyRequested`
  topics: {
    type: [{
      value: String,
      updateRequested: {
        type: Boolean,
        "default": false
      },
      verifyRequested: {
        type: Boolean,
        "default": false
      }
    }],
    "default": []
  },
  // Boolean to track if the article has been submitted
  submitted: {
    type: Boolean,
    "default": false
  },
  // Suggestion as a plain object
  suggestion: {
    type: String,
    "default": null
  }
}, {
  timestamps: true
});

// Create the Topic model using the schema
var topicModel = _mongoose["default"].model("Topic", topicSchema);
var _default = exports["default"] = topicModel;