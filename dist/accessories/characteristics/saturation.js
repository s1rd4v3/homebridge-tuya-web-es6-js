"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./index", "./base"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./index"), require("./base"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.index, global.base);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _index, _base) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SaturationCharacteristic = undefined;

  class SaturationCharacteristic extends _base.TuyaWebCharacteristic {
    static HomekitCharacteristic(accessory) {
      return accessory.platform.Characteristic.Saturation;
    }

    static isSupportedByAccessory(accessory) {
      var configData = accessory.deviceConfig.data;
      return configData.color_mode !== undefined;
    }

    getRemoteValue(callback) {
      this.accessory.getDeviceState().then(data => {
        var _a;

        this.debug('[GET] %s', (_a = data === null || data === void 0 ? void 0 : data.color) === null || _a === void 0 ? void 0 : _a.saturation);
        this.updateValue(data, callback);
      }).catch(this.accessory.handleError('GET', callback));
    }

    setRemoteValue(homekitValue, callback) {
      // Set device state in Tuya Web API
      var value = homekitValue;
      this.accessory.setColor({
        saturation: value
      }).then(() => {
        this.debug('[SET] %s', value);
        callback();
      }).catch(this.accessory.handleError('SET', callback));
    }

    updateValue(data, callback) {
      var _a;

      var stateValue = SaturationCharacteristic.DEFAULT_VALUE;

      if ((data === null || data === void 0 ? void 0 : data.color_mode) !== undefined && (data === null || data === void 0 ? void 0 : data.color_mode) in _index.COLOR_MODES && ((_a = data === null || data === void 0 ? void 0 : data.color) === null || _a === void 0 ? void 0 : _a.saturation)) {
        stateValue = Number(data.color.saturation);
      }

      this.accessory.setCharacteristic(this.homekitCharacteristic, stateValue, !callback);
      callback && callback(null, stateValue);
    }

  }

  exports.SaturationCharacteristic = SaturationCharacteristic;
  SaturationCharacteristic.Title = 'Characteristic.Saturation';
  SaturationCharacteristic.DEFAULT_VALUE = 0;
});