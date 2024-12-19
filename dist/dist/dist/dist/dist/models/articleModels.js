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
// Define the Article schema
var articleSchema = new _mongoose["default"].Schema({
  // Content of the article
  value: {
    type: String,
    required: true,
    "default": ""
  },
  // Boolean to track if the article has been submitted
  submitted: {
    type: Boolean,
    "default": false
  },
  // Reference to a single Topic document (ObjectId or null)
  topics: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Topic",
    // Reference to the Topic model/collection
    "default": null // Default is null, meaning no topic is associated initially
  },
  // Photo related to the article, initially null
  photo: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Photo",
    // Assuming 'Photo' is the name of the related collection for photo documents
    "default": null
  },
  // Boolean to track if a change is requested for the article
  updateRequested: {
    type: Boolean,
    "default": false
  },
  // Reference to the User document
  userId: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User",
    // Reference to the User model/collection
    required: true // Ensures every article is associated with a user
  }
}, {
  timestamps: true
} // Adds createdAt and updatedAt fields
);

// Create the Article model using the schema
var articleModel = _mongoose["default"].model("Article", articleSchema);
var _default = exports["default"] = articleModel;