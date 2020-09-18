"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./index", "util", "./base"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./index"), require("util"), require("./base"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.index, global.util, global.base);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _index, _util, _base) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.BrightnessCharacteristic = undefined;

  class BrightnessCharacteristic extends _base.TuyaWebCharacteristic {
    static HomekitCharacteristic(accessory) {
      return accessory.platform.Characteristic.Brightness;
    }

    static isSupportedByAccessory(accessory) {
      var _a;

      var configData = accessory.deviceConfig.data;
      return configData.brightness !== undefined || ((_a = configData.color) === null || _a === void 0 ? void 0 : _a.brightness) !== undefined;
    }

    getRemoteValue(callback) {
      this.accessory.getDeviceState().then(data => {
        var _a;

        this.debug('[GET] %s', (data === null || data === void 0 ? void 0 : data.brightness) || ((_a = data === null || data === void 0 ? void 0 : data.color) === null || _a === void 0 ? void 0 : _a.brightness));
        this.updateValue(data, callback);
      }).catch(this.accessory.handleError('GET', callback));
    }

    setRemoteValue(homekitValue, callback) {
      // Set device state in Tuya Web API
      var value = homekitValue / 10 * 9 + 10;
      this.accessory.setDeviceState('brightnessSet', {
        value
      }, {
        brightness: homekitValue
      }).then(() => {
        this.debug('[SET] %s', value);
        callback();
      }).catch(this.accessory.handleError('SET', callback));
    }

    updateValue(data, callback) {
      // data.brightness only valid for color_mode != color > https://github.com/PaulAnnekov/tuyaha/blob/master/tuyaha/devices/light.py
      // however, according to local tuya app, calculation for color_mode=color is still incorrect (even more so in lower range)
      var stateValue;

      if ((data === null || data === void 0 ? void 0 : data.color_mode) !== undefined && (data === null || data === void 0 ? void 0 : data.color_mode) in _index.COLOR_MODES && (data === null || data === void 0 ? void 0 : data.color.brightness) !== undefined) {
        stateValue = Number(data.color.brightness);
      } else if (data === null || data === void 0 ? void 0 : data.brightness) {
        stateValue = Math.round(Number(data.brightness) / 255 * 100);
      }

      if (stateValue) {
        this.accessory.setCharacteristic(this.homekitCharacteristic, stateValue, !callback);
        callback && callback(null, stateValue);
        return;
      }

      this.error('Tried to set brightness but failed to parse data. \n %s', (0, _util.inspect)(data));
    }

  }

  exports.BrightnessCharacteristic = BrightnessCharacteristic;
  BrightnessCharacteristic.Title = 'Characteristic.Brightness';
  BrightnessCharacteristic.DEFAULT_VALUE = 100;
});