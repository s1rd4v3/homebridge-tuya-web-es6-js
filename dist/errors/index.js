"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./AuthenticationError", "./RateLimitError"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./AuthenticationError"), require("./RateLimitError"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.AuthenticationError, global.RateLimitError);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _AuthenticationError, _RateLimitError) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_AuthenticationError).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _AuthenticationError[key];
      }
    });
  });
  Object.keys(_RateLimitError).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _RateLimitError[key];
      }
    });
  });
});