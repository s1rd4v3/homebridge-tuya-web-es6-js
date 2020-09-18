"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./BaseAccessory", "homebridge", "./characteristics/momentaryOn"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./BaseAccessory"), require("homebridge"), require("./characteristics/momentaryOn"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.BaseAccessory, global.homebridge, global.momentaryOn);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _BaseAccessory, _homebridge, _momentaryOn) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SceneAccessory = undefined;

  class SceneAccessory extends _BaseAccessory.BaseAccessory {
    constructor(platform, homebridgeAccessory, deviceConfig) {
      super(platform, homebridgeAccessory, deviceConfig, _homebridge.Categories.SWITCH);
      new _momentaryOn.MomentaryOnCharacteristic(this);
    }

  }

  exports.SceneAccessory = SceneAccessory;
});