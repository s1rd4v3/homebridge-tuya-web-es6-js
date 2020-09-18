"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./base", "../../helpers/MapRange"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./base"), require("../../helpers/MapRange"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.base, global.MapRange);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _base, _MapRange) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ColorTemperatureCharacteristic = undefined;

  // Homekit uses mired light units, Tuya uses kelvin
  // Mired = 1.000.000/Kelvin
  class ColorTemperatureCharacteristic extends _base.TuyaWebCharacteristic {
    constructor() {
      super(...arguments);
      this.rangeMapper = _MapRange.MapRange.from(1000000 / 140, 1000000 / 500).to(10000, 1000);
    }

    static HomekitCharacteristic(accessory) {
      return accessory.platform.Characteristic.ColorTemperature;
    }

    static isSupportedByAccessory(accessory) {
      return accessory.deviceConfig.data.color_temp !== undefined;
    }

    getRemoteValue(callback) {
      this.accessory.getDeviceState().then(data => {
        this.debug('[GET] %s', data === null || data === void 0 ? void 0 : data.color_temp);
        this.updateValue(data, callback);
      }).catch(this.accessory.handleError('GET', callback));
    }

    setRemoteValue(homekitValue, callback) {
      if (typeof homekitValue !== 'number') {
        var errorMsg = "Received unexpected temperature value \"".concat(homekitValue, "\" of type ").concat(typeof homekitValue);
        this.warn(errorMsg);
        callback(new Error(errorMsg));
        return;
      } // Set device state in Tuya Web API


      var value = Math.round(this.rangeMapper.map(1000000 / homekitValue));
      this.accessory.setDeviceState('colorTemperatureSet', {
        value
      }, {
        color_temp: homekitValue
      }).then(() => {
        this.debug('[SET] %s %s', homekitValue, value);
        callback();
      }).catch(this.accessory.handleError('SET', callback));
    }

    updateValue(data, callback) {
      if ((data === null || data === void 0 ? void 0 : data.color_temp) !== undefined) {
        var homekitColorTemp = Math.round(this.rangeMapper.inverseMap(1000000 / data.color_temp));
        this.accessory.setCharacteristic(this.homekitCharacteristic, homekitColorTemp, !callback);
        callback && callback(null, homekitColorTemp);
      }
    }

  }

  exports.ColorTemperatureCharacteristic = ColorTemperatureCharacteristic;
  ColorTemperatureCharacteristic.Title = 'Characteristic.ColorTemperature';
});