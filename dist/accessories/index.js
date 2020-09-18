"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./BaseAccessory", "./CoverAccessory", "./DimmerAccessory", "./FanAccessory", "./LightAccessory", "./OutletAccessory", "./SceneAccessory", "./SwitchAccessory"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./BaseAccessory"), require("./CoverAccessory"), require("./DimmerAccessory"), require("./FanAccessory"), require("./LightAccessory"), require("./OutletAccessory"), require("./SceneAccessory"), require("./SwitchAccessory"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.BaseAccessory, global.CoverAccessory, global.DimmerAccessory, global.FanAccessory, global.LightAccessory, global.OutletAccessory, global.SceneAccessory, global.SwitchAccessory);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _BaseAccessory, _CoverAccessory, _DimmerAccessory, _FanAccessory, _LightAccessory, _OutletAccessory, _SceneAccessory, _SwitchAccessory) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_BaseAccessory).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _BaseAccessory[key];
      }
    });
  });
  Object.keys(_CoverAccessory).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _CoverAccessory[key];
      }
    });
  });
  Object.keys(_DimmerAccessory).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _DimmerAccessory[key];
      }
    });
  });
  Object.keys(_FanAccessory).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _FanAccessory[key];
      }
    });
  });
  Object.keys(_LightAccessory).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _LightAccessory[key];
      }
    });
  });
  Object.keys(_OutletAccessory).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _OutletAccessory[key];
      }
    });
  });
  Object.keys(_SceneAccessory).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _SceneAccessory[key];
      }
    });
  });
  Object.keys(_SwitchAccessory).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _SwitchAccessory[key];
      }
    });
  });
});