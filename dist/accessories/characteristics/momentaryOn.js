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
  exports.MomentaryOnCharacteristic = undefined;

  class MomentaryOnCharacteristic extends _base.TuyaWebCharacteristic {
    static HomekitCharacteristic(accessory) {
      return accessory.platform.Characteristic.On;
    }

    static isSupportedByAccessory() {
      return true;
    }

    getRemoteValue(callback) {
      var value = 0;
      this.debug('[GET] %s', value);
      this.updateValue(undefined, callback);
    }

    setRemoteValue(homekitValue, callback) {
      // Set device state in Tuya Web API
      var value = homekitValue ? 1 : 0;

      if (value === 0) {
        callback();
        return;
      }

      this.accessory.setDeviceState('turnOnOff', {
        value
      }, {}).then(() => {
        this.debug('[SET] %s %s', homekitValue, value);
        callback();

        var reset = () => {
          var _a;

          (_a = this.accessory.service) === null || _a === void 0 ? void 0 : _a.setCharacteristic(this.homekitCharacteristic, 0);
        };

        setTimeout(reset.bind(this), 100);
      }).catch(this.accessory.handleError('SET', callback));
    }

    updateValue(data, callback) {
      callback && callback(null, 0);
    }

  }

  exports.MomentaryOnCharacteristic = MomentaryOnCharacteristic;
  MomentaryOnCharacteristic.Title = 'Characteristic.MomentaryOn';
});