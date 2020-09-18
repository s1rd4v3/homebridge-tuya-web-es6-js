"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "homebridge", "./base"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("homebridge"), require("./base"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.homebridge, global.base);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _homebridge, _base) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CoverTargetPositionCharacteristic = undefined;

  class CoverTargetPositionCharacteristic extends _base.TuyaWebCharacteristic {
    static HomekitCharacteristic(accessory) {
      return accessory.platform.Characteristic.TargetPosition;
    }

    setProps(char) {
      return char === null || char === void 0 ? void 0 : char.setProps({
        unit: _homebridge.Units.PERCENTAGE,
        format: _homebridge.Formats.INT,
        minValue: 0,
        maxValue: 100,
        minStep: 1
      });
    }

    static isSupportedByAccessory(accessory) {
      return accessory.deviceConfig.dev_type === 'cover';
    }

    getRemoteValue(callback) {
      this.accessory.log.debug('Triggered GET TargetPosition');
      this.debug('[GET] %s', this.accessory.homebridgeAccessory.context.lastValue);
      this.updateValue(this.accessory.homebridgeAccessory.context.lastValue, callback);
    }

    setRemoteValue(homekitValue, callback) {
      this.accessory.log.debug('Triggered SET TargetPosition');
      var value = homekitValue ? 1 : 0;
      this.accessory.setDeviceState('turnOnOff', {
        value
      }).then(() => {
        this.debug('[SET] %s %s', homekitValue, value);
        this.accessory.homebridgeAccessory.context.lastValue = homekitValue;
        this.updateValue(homekitValue);
        callback(null);
      }).catch(this.accessory.handleError('SET', callback));
    }

    updateValue(value, callback) {
      this.debug('[UPDATE]', value);
      this.accessory.setCharacteristic(this.homekitCharacteristic, value, !callback);
      this.accessory.setCharacteristic(this.accessory.platform.Characteristic.CurrentPosition, value, !callback);
      callback && callback(null, value);
    }

  }

  exports.CoverTargetPositionCharacteristic = CoverTargetPositionCharacteristic;
  CoverTargetPositionCharacteristic.Title = 'Characteristic.Cover.TargetPosition';
});