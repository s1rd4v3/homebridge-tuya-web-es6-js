"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./active", "./brightness", "./colorTemperature", "./cover.currentPosition", "./cover.targetPosition", "./cover.positionState", "./hue", "./on", "./rotationSpeed", "./saturation"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./active"), require("./brightness"), require("./colorTemperature"), require("./cover.currentPosition"), require("./cover.targetPosition"), require("./cover.positionState"), require("./hue"), require("./on"), require("./rotationSpeed"), require("./saturation"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.active, global.brightness, global.colorTemperature, global.cover, global.cover, global.cover, global.hue, global.on, global.rotationSpeed, global.saturation);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _active, _brightness, _colorTemperature, _cover, _cover2, _cover3, _hue, _on, _rotationSpeed, _saturation) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_active).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _active[key];
      }
    });
  });
  Object.keys(_brightness).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _brightness[key];
      }
    });
  });
  Object.keys(_colorTemperature).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _colorTemperature[key];
      }
    });
  });
  Object.keys(_cover).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _cover[key];
      }
    });
  });
  Object.keys(_cover2).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _cover2[key];
      }
    });
  });
  Object.keys(_cover3).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _cover3[key];
      }
    });
  });
  Object.keys(_hue).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _hue[key];
      }
    });
  });
  Object.keys(_on).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _on[key];
      }
    });
  });
  Object.keys(_rotationSpeed).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _rotationSpeed[key];
      }
    });
  });
  Object.keys(_saturation).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _saturation[key];
      }
    });
  });
  var COLOR_MODES = exports.COLOR_MODES = ['color', 'colour'];
});