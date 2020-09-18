"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./base"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./base"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.base);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _base) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ActiveCharacteristic = undefined;

  class ActiveCharacteristic extends _base.TuyaWebCharacteristic {
    static HomekitCharacteristic(accessory) {
      return accessory.platform.Characteristic.Active;
    }

    static isSupportedByAccessory(accessory) {
      return accessory.deviceConfig.data.state !== undefined;
    }

    getRemoteValue(callback) {
      this.accessory.getDeviceState().then(data => {
        this.debug('[GET] %s', data === null || data === void 0 ? void 0 : data.state);
        this.updateValue(data, callback);
      }).catch(this.accessory.handleError('GET', callback));
    }

    setRemoteValue(homekitValue, callback) {
      // Set device state in Tuya Web API
      var value = homekitValue ? 1 : 0;
      this.accessory.setDeviceState('turnOnOff', {
        value
      }, {
        state: homekitValue
      }).then(() => {
        this.debug('[SET] %s %s', homekitValue, value);
        callback();
      }).catch(this.accessory.handleError('SET', callback));
    }

    updateValue(data, callback) {
      if ((data === null || data === void 0 ? void 0 : data.state) !== undefined) {
        var stateValue = String(data.state).toLowerCase() === 'true';
        this.accessory.setCharacteristic(this.homekitCharacteristic, stateValue, !callback);
        callback && callback(null, stateValue);
      }
    }

  }

  exports.ActiveCharacteristic = ActiveCharacteristic;
  ActiveCharacteristic.Title = 'Characteristic.Active';
});