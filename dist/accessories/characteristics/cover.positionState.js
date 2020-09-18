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
  exports.CoverPositionStateCharacteristic = undefined;

  class CoverPositionStateCharacteristic extends _base.TuyaWebCharacteristic {
    static HomekitCharacteristic(accessory) {
      return accessory.platform.Characteristic.PositionState;
    }

    setProps(char) {
      return char === null || char === void 0 ? void 0 : char.setProps({
        format: _homebridge.Formats.UINT8,
        minValue: 0,
        maxValue: 2
      });
    }

    static isSupportedByAccessory(accessory) {
      return accessory.deviceConfig.dev_type === 'cover';
    }

    getRemoteValue(callback) {
      this.accessory.log.debug('Triggered GET PositionState');
      this.accessory.getDeviceState().then(data => {
        this.debug('[GET] %s', data);
        this.updateValue(0, callback);
      }).catch(this.accessory.handleError('GET', callback));
    }

    updateValue(value, callback) {
      this.debug('[UPDATE]', value, this.homekitCharacteristic);
      this.accessory.service.setCharacteristic(this.homekitCharacteristic, value);
      callback && callback(null, value);
    }

  }

  exports.CoverPositionStateCharacteristic = CoverPositionStateCharacteristic;
  CoverPositionStateCharacteristic.Title = 'Characteristic.Cover.PositionState';
});