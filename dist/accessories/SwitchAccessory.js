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
  exports.SwitchAccessory = undefined;

  class SwitchAccessory extends _BaseAccessory.BaseAccessory {
    constructor(platform, homebridgeAccessory, deviceConfig) {
      super(platform, homebridgeAccessory, deviceConfig, _homebridge.Categories.SWITCH);
      new _characteristics.OnCharacteristic(this);
    }

  }

  exports.SwitchAccessory = SwitchAccessory;
});