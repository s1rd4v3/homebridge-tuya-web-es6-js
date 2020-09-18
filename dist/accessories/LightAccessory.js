"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "homebridge", "./characteristics", "./ColorAccessory"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("homebridge"), require("./characteristics"), require("./ColorAccessory"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.homebridge, global.characteristics, global.ColorAccessory);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _homebridge, _characteristics, _ColorAccessory) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LightAccessory = undefined;
  var COLOR_MODES = ['color', 'colour'];

  class LightAccessory extends _ColorAccessory.ColorAccessory {
    constructor(platform, homebridgeAccessory, deviceConfig) {
      super(platform, homebridgeAccessory, deviceConfig, _homebridge.Categories.LIGHTBULB);
      new _characteristics.OnCharacteristic(this);
      new _characteristics.BrightnessCharacteristic(this);
      new _characteristics.ColorTemperatureCharacteristic(this);
      new _characteristics.HueCharacteristic(this);
      new _characteristics.SaturationCharacteristic(this);
    }

  }

  exports.LightAccessory = LightAccessory;
});