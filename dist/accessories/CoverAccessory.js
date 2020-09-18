"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./BaseAccessory", "homebridge", "./characteristics"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./BaseAccessory"), require("homebridge"), require("./characteristics"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.BaseAccessory, global.homebridge, global.characteristics);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _BaseAccessory, _homebridge, _characteristics) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CoverAccessory = undefined;

  class CoverAccessory extends _BaseAccessory.BaseAccessory {
    constructor(platform, homebridgeAccessory, deviceConfig) {
      super(platform, homebridgeAccessory, deviceConfig, _homebridge.Categories.WINDOW_COVERING);
      homebridgeAccessory.context.lastValue = homebridgeAccessory.context.lastValue || 0;
      new _characteristics.CoverCurrentPositionCharacteristic(this);
      new _characteristics.CoverTargetPositionCharacteristic(this);
    }

  }

  exports.CoverAccessory = CoverAccessory;
});