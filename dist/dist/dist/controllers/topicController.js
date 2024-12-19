function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function _regeneratorRuntime() {
  "use strict";

  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
  _regeneratorRuntime = function _regeneratorRuntime() {
    return e;
  };
  var t,
    e = {},
    r = Object.prototype,
    n = r.hasOwnProperty,
    o = Object.defineProperty || function (t, e, r) {
      t[e] = r.value;
    },
    i = "function" == typeof Symbol ? Symbol : {},
    a = i.iterator || "@@iterator",
    c = i.asyncIterator || "@@asyncIterator",
    u = i.toStringTag || "@@toStringTag";
  function define(t, e, r) {
    return Object.defineProperty(t, e, {
      value: r,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), t[e];
  }
  try {
    define({}, "");
  } catch (t) {
    define = function define(t, e, r) {
      return t[e] = r;
    };
  }
  function wrap(t, e, r, n) {
    var i = e && e.prototype instanceof Generator ? e : Generator,
      a = Object.create(i.prototype),
      c = new Context(n || []);
    return o(a, "_invoke", {
      value: makeInvokeMethod(t, r, c)
    }), a;
  }
  function tryCatch(t, e, r) {
    try {
      return {
        type: "normal",
        arg: t.call(e, r)
      };
    } catch (t) {
      return {
        type: "throw",
        arg: t
      };
    }
  }
  e.wrap = wrap;
  var h = "suspendedStart",
    l = "suspendedYield",
    f = "executing",
    s = "completed",
    y = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var p = {};
  define(p, a, function () {
    return this;
  });
  var d = Object.getPrototypeOf,
    v = d && d(d(values([])));
  v && v !== r && n.call(v, a) && (p = v);
  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
  function defineIteratorMethods(t) {
    ["next", "throw", "return"].forEach(function (e) {
      define(t, e, function (t) {
        return this._invoke(e, t);
      });
    });
  }
  function AsyncIterator(t, e) {
    function invoke(r, o, i, a) {
      var c = tryCatch(t[r], t, o);
      if ("throw" !== c.type) {
        var u = c.arg,
          h = u.value;
        return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
          invoke("next", t, i, a);
        }, function (t) {
          invoke("throw", t, i, a);
        }) : e.resolve(h).then(function (t) {
          u.value = t, i(u);
        }, function (t) {
          return invoke("throw", t, i, a);
        });
      }
      a(c.arg);
    }
    var r;
    o(this, "_invoke", {
      value: function value(t, n) {
        function callInvokeWithMethodAndArg() {
          return new e(function (e, r) {
            invoke(t, n, e, r);
          });
        }
        return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(e, r, n) {
    var o = h;
    return function (i, a) {
      if (o === f) throw Error("Generator is already running");
      if (o === s) {
        if ("throw" === i) throw a;
        return {
          value: t,
          done: !0
        };
      }
      for (n.method = i, n.arg = a;;) {
        var c = n.delegate;
        if (c) {
          var u = maybeInvokeDelegate(c, n);
          if (u) {
            if (u === y) continue;
            return u;
          }
        }
        if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
          if (o === h) throw o = s, n.arg;
          n.dispatchException(n.arg);
        } else "return" === n.method && n.abrupt("return", n.arg);
        o = f;
        var p = tryCatch(e, r, n);
        if ("normal" === p.type) {
          if (o = n.done ? s : l, p.arg === y) continue;
          return {
            value: p.arg,
            done: n.done
          };
        }
        "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
      }
    };
  }
  function maybeInvokeDelegate(e, r) {
    var n = r.method,
      o = e.iterator[n];
    if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
    var i = tryCatch(o, e.iterator, r.arg);
    if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
    var a = i.arg;
    return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
  }
  function pushTryEntry(t) {
    var e = {
      tryLoc: t[0]
    };
    1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
  }
  function resetTryEntry(t) {
    var e = t.completion || {};
    e.type = "normal", delete e.arg, t.completion = e;
  }
  function Context(t) {
    this.tryEntries = [{
      tryLoc: "root"
    }], t.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(e) {
    if (e || "" === e) {
      var r = e[a];
      if (r) return r.call(e);
      if ("function" == typeof e.next) return e;
      if (!isNaN(e.length)) {
        var o = -1,
          i = function next() {
            for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next;
            return next.value = t, next.done = !0, next;
          };
        return i.next = i;
      }
    }
    throw new TypeError(_typeof(e) + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), o(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
    var e = "function" == typeof t && t.constructor;
    return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
  }, e.mark = function (t) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
  }, e.awrap = function (t) {
    return {
      __await: t
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
    return this;
  }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
    void 0 === i && (i = Promise);
    var a = new AsyncIterator(wrap(t, r, n, o), i);
    return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
      return t.done ? t.value : a.next();
    });
  }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
    return this;
  }), define(g, "toString", function () {
    return "[object Generator]";
  }), e.keys = function (t) {
    var e = Object(t),
      r = [];
    for (var n in e) r.push(n);
    return r.reverse(), function next() {
      for (; r.length;) {
        var t = r.pop();
        if (t in e) return next.value = t, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, e.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(e) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
    },
    stop: function stop() {
      this.done = !0;
      var t = this.tryEntries[0].completion;
      if ("throw" === t.type) throw t.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(e) {
      if (this.done) throw e;
      var r = this;
      function handle(n, o) {
        return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
      }
      for (var o = this.tryEntries.length - 1; o >= 0; --o) {
        var i = this.tryEntries[o],
          a = i.completion;
        if ("root" === i.tryLoc) return handle("end");
        if (i.tryLoc <= this.prev) {
          var c = n.call(i, "catchLoc"),
            u = n.call(i, "finallyLoc");
          if (c && u) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          } else if (c) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
          } else {
            if (!u) throw Error("try statement without catch or finally");
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(t, e) {
      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
        var o = this.tryEntries[r];
        if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
          var i = o;
          break;
        }
      }
      i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
      var a = i ? i.completion : {};
      return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
    },
    complete: function complete(t, e) {
      if ("throw" === t.type) throw t.arg;
      return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
    },
    finish: function finish(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
      }
    },
    "catch": function _catch(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.tryLoc === t) {
          var n = r.completion;
          if ("throw" === n.type) {
            var o = n.arg;
            resetTryEntry(r);
          }
          return o;
        }
      }
      throw Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(e, r, n) {
      return this.delegate = {
        iterator: values(e),
        resultName: r,
        nextLoc: n
      }, "next" === this.method && (this.arg = t), y;
    }
  }, e;
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
import OpenAI from "openai"; // Assuming you have OpenAI set up
import articleModel from "../models/articleModels.js";
import topicModel from "../models/topicModel.js"; // Assuming you have a topicModel
import openAi from "../openAi.js";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY || "your-openai-api-key", // Your OpenAI API key here
// });

export var handleTopicCreation = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var articleId, article, existingTopic, response, rawTopics, cleanedTopics, finalTopics, newTopic, newTopicDetails;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          articleId = req.body.articleId; // Find the article by ID
          _context.next = 4;
          return articleModel.findOne({
            _id: articleId
          });
        case 4:
          article = _context.sent;
          if (article) {
            _context.next = 7;
            break;
          }
          return _context.abrupt("return", res.status(404).json({
            message: "Article not found"
          }));
        case 7:
          if (!article.topics) {
            _context.next = 13;
            break;
          }
          _context.next = 10;
          return topicModel.findOne({
            _id: article.topics
          });
        case 10:
          existingTopic = _context.sent;
          if (!existingTopic) {
            _context.next = 13;
            break;
          }
          return _context.abrupt("return", res.status(200).json({
            message: "Success",
            topic: existingTopic
          }));
        case 13:
          _context.next = 15;
          return openAi.writer.chat.completions.create({
            model: "gpt-3.5-turbo",
            // Or "gpt-4" if you want to use GPT-4
            messages: [{
              role: "system",
              content: "You are an AI that generates an array of 3 relevant topics based on an article's content. Please avoid using numbers in the topics."
            }, {
              role: "user",
              content: "Based on the following article, generate 3 relevant \n          -It should be list of strings for example [\"topic\",\"topic\",\"topic\"]\n          topics:\n".concat(article.value) // Assuming article.value is the content
            }],
            max_tokens: 100,
            // Increase token count for longer responses
            temperature: 0.7 // Adjust creativity level if necessary
          });
        case 15:
          response = _context.sent;
          // Clean up the response: remove unwanted characters and split into topics
          rawTopics = response.choices[0].message.content.trim().split("\n");
          cleanedTopics = rawTopics.map(function (line) {
            return line.trim();
          }) // Trim spaces
          .filter(function (line) {
            return line && !line.toLowerCase().includes("topics:");
          }) // Remove empty or "topics:" lines
          .map(function (line) {
            return line.replace(/^[\d\-\.\s]+/, "");
          }); // Remove leading numbers and dashes
          // If no valid topics are generated, use placeholders
          finalTopics = cleanedTopics.length ? cleanedTopics : ["Enhancing Memory Through Lifestyle Changes", "The Impact of Sleep on Memory Consolidation", "Cognitive Benefits of Physical and Mental Activities"]; // Create a new Topic document with the list of generated topics
          _context.next = 21;
          return topicModel.create({
            topics: finalTopics.map(function (topic) {
              return {
                value: topic,
                updateRequested: false,
                verifyRequested: false
              };
            })
          });
        case 21:
          newTopic = _context.sent;
          // Update the article with the newly created Topic document's _id
          article.topics = newTopic._id;
          _context.next = 25;
          return article.save();
        case 25:
          _context.next = 27;
          return topicModel.findById(newTopic._id);
        case 27:
          newTopicDetails = _context.sent;
          return _context.abrupt("return", res.status(200).json({
            message: "Success",
            topic: newTopicDetails
          }));
        case 31:
          _context.prev = 31;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0.message);
          return _context.abrupt("return", res.status(500).json({
            message: "An error occurred",
            error: _context.t0.message
          }));
        case 35:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 31]]);
  }));
  return function handleTopicCreation(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
export var getTopicById = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var topicId, topic;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          // Extract the topicId from the query parameter
          topicId = req.query.topicId; // Validate the topicId
          if (topicId) {
            _context2.next = 4;
            break;
          }
          return _context2.abrupt("return", res.status(400).json({
            message: "Topic ID is required"
          }));
        case 4:
          _context2.next = 6;
          return topicModel.findOne({
            _id: topicId
          });
        case 6:
          topic = _context2.sent;
          if (topic) {
            _context2.next = 9;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: "Something went wrong"
          }));
        case 9:
          return _context2.abrupt("return", res.status(200).json({
            message: "Success",
            topic: topic
          }));
        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          res.status(500).json({
            message: "Error retrieving topic",
            error: _context2.t0.message
          });
        case 16:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 12]]);
  }));
  return function getTopicById(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
export var handleUpdateTopicRequest = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var _req$body, topicId, index, topic, topicToUpdate;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _req$body = req.body, topicId = _req$body.topicId, index = _req$body.index; // Get topicId and index from params
          // Find the topic document by its ID
          _context3.next = 4;
          return topicModel.findOne({
            "topics._id": topicId
          });
        case 4:
          topic = _context3.sent;
          if (topic) {
            _context3.next = 7;
            break;
          }
          return _context3.abrupt("return", res.status(404).json({
            message: "Topic document not found"
          }));
        case 7:
          if (!(index < 0 || index >= topic.topics.length)) {
            _context3.next = 9;
            break;
          }
          return _context3.abrupt("return", res.status(400).json({
            message: "Invalid index"
          }));
        case 9:
          // Find the topic at the given index in the `topics` array
          topicToUpdate = topic.topics[index]; // Toggle the `updateRequested` field of the found topic
          console.log(topicToUpdate);
          topicToUpdate.updateRequested = !topicToUpdate.updateRequested;

          // Save the updated topic document
          _context3.next = 14;
          return topic.save();
        case 14:
          return _context3.abrupt("return", res.status(200).json({
            message: "Topic updateRequested status toggled successfully",
            updatedTopic: topicToUpdate // Return the updated topic object
          }));
        case 17:
          _context3.prev = 17;
          _context3.t0 = _context3["catch"](0);
          console.error("Error updating topic:", _context3.t0);
          return _context3.abrupt("return", res.status(500).json({
            message: "Error updating topic",
            error: _context3.t0.message
          }));
        case 21:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 17]]);
  }));
  return function handleUpdateTopicRequest(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
export var handleVerifyTopicRequest = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var _req$body2, topicId, index, topic, topicToUpdate;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _req$body2 = req.body, topicId = _req$body2.topicId, index = _req$body2.index; // Get topicId and index from body
          // Find the topic document by its ID
          console.log("topic", topicId, index);
          _context4.next = 5;
          return topicModel.findOne({
            "topics._id": topicId
          });
        case 5:
          topic = _context4.sent;
          console.log("topic", topic);
          if (topic) {
            _context4.next = 9;
            break;
          }
          return _context4.abrupt("return", res.status(404).json({
            message: "Topic document not found"
          }));
        case 9:
          if (!(index < 0 || index >= topic.topics.length)) {
            _context4.next = 11;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            message: "Invalid index"
          }));
        case 11:
          // Find the topic at the given index in the `topics` array
          topicToUpdate = topic.topics[index]; // Toggle the `verifyRequested` field of the found topic
          topicToUpdate.updateRequested = false;
          topicToUpdate.verifyRequested = true;

          // Save the updated topic document
          _context4.next = 16;
          return topic.save();
        case 16:
          return _context4.abrupt("return", res.status(200).json({
            message: "Topic verifyRequested status toggled successfully",
            updatedTopic: topicToUpdate // Return the updated topic object
          }));
        case 19:
          _context4.prev = 19;
          _context4.t0 = _context4["catch"](0);
          console.error("Error updating topic:", _context4.t0);
          return _context4.abrupt("return", res.status(500).json({
            message: "Error updating topic",
            error: _context4.t0.message
          }));
        case 23:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 19]]);
  }));
  return function handleVerifyTopicRequest(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();
export var handleUpdateSuggestion = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var _req$body3, topicId, suggestion, topic;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _req$body3 = req.body, topicId = _req$body3.topicId, suggestion = _req$body3.suggestion; // Get topicId and suggestion from the request body
          console.log("fghjk", topicId, suggestion);
          // Find the topic document by its ID
          _context5.next = 5;
          return topicModel.findOne({
            _id: topicId
          });
        case 5:
          topic = _context5.sent;
          if (topic) {
            _context5.next = 8;
            break;
          }
          return _context5.abrupt("return", res.status(404).json({
            message: "Topic document not found"
          }));
        case 8:
          // Update the suggestion field of the found topic
          topic.suggestion = suggestion || ""; // Set the suggestion to the value passed, or default to an empty string

          // Save the updated topic document
          _context5.next = 11;
          return topic.save();
        case 11:
          return _context5.abrupt("return", res.status(200).json({
            message: "Suggestion updated successfully",
            updatedTopic: topic // Return the updated topic document
          }));
        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5["catch"](0);
          console.error("Error updating suggestion:", _context5.t0);
          return _context5.abrupt("return", res.status(500).json({
            message: "Error updating suggestion",
            error: _context5.t0.message
          }));
        case 18:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 14]]);
  }));
  return function handleUpdateSuggestion(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();
export var handleSubmitTopic = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    var _id, topic;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _id = req.body._id; // Get topicId from the request body
          console.log("resqq", req.body);
          console.log("topicId", _id);
          // Find the topic document by its ID
          _context6.next = 6;
          return topicModel.findById(_id);
        case 6:
          topic = _context6.sent;
          if (topic) {
            _context6.next = 9;
            break;
          }
          return _context6.abrupt("return", res.status(404).json({
            message: "Topic document not found"
          }));
        case 9:
          // Set the `submitted` field to `true`
          topic.submitted = true;

          // Reset the `updateRequested` and `verifyRequested` fields for all topics in the `topics` array
          topic.topics.forEach(function (t) {
            t.updateRequested = false;
            t.verifyRequested = false;
          });

          // Set the suggestion to `null`
          topic.suggestion = null;

          // Save the updated topic document
          _context6.next = 14;
          return topic.save();
        case 14:
          return _context6.abrupt("return", res.status(200).json({
            message: "Topic submitted successfully",
            updatedTopic: topic // Return the updated topic document
          }));
        case 17:
          _context6.prev = 17;
          _context6.t0 = _context6["catch"](0);
          console.error("Error submitting topic:", _context6.t0);
          return _context6.abrupt("return", res.status(500).json({
            message: "Error submitting topic",
            error: _context6.t0.message
          }));
        case 21:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 17]]);
  }));
  return function handleSubmitTopic(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();