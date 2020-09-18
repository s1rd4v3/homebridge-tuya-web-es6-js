"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "homebridge", "./base", "../../helpers/MapRange"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("homebridge"), require("./base"), require("../../helpers/MapRange"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.homebridge, global.base, global.MapRange);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _homebridge, _base, _MapRange) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RotationSpeedCharacteristic = undefined;

  class RotationSpeedCharacteristic extends _base.TuyaWebCharacteristic {
    constructor() {
      super(...arguments);
      this.range = _MapRange.MapRange.from(this.minStep, this.maxSpeedLevel * this.minStep).to(1, this.maxSpeedLevel);
    }

    static HomekitCharacteristic(accessory) {
      return accessory.platform.Characteristic.RotationSpeed;
    }

    setProps(char) {
      return char === null || char === void 0 ? void 0 : char.setProps({
        unit: _homebridge.Units.PERCENTAGE,
        format: _homebridge.Formats.INT,
        minValue: 0,
        maxValue: 100,
        minStep: this.minStep
      });
    }

    static isSupportedByAccessory(accessory) {
      return accessory.deviceConfig.data.speed_level !== undefined && accessory.deviceConfig.data.speed !== undefined;
    }

    get maxSpeedLevel() {
      var data = this.accessory.deviceConfig.data;
      return data.speed_level;
    }

    get minStep() {
      return Math.floor(100 / this.maxSpeedLevel);
    }

    getRemoteValue(callback) {
      this.accessory.getDeviceState().then(data => {
        this.debug('[GET] %s', data === null || data === void 0 ? void 0 : data.speed);
        this.updateValue(data, callback);
      }).catch(this.accessory.handleError('GET', callback));
    }

    setRemoteValue(homekitValue, callback) {
      // Set device state in Tuya Web API
      var value = this.range.map(Number(homekitValue)); // Set value to 1 if value is too small

      value = value < 1 ? 1 : value; // Set value to minSpeedLevel if value is too large

      value = value > this.maxSpeedLevel ? this.maxSpeedLevel : value;
      this.accessory.setDeviceState('windSpeedSet', {
        value
      }, {
        speed: value
      }).then(() => {
        this.debug('[SET] %s %s', homekitValue, value);
        callback();
      }).catch(this.accessory.handleError('SET', callback));
    }

    updateValue(data, callback) {
      if ((data === null || data === void 0 ? void 0 : data.speed) !== undefined) {
        var speed = this.range.inverseMap(Number(data.speed));
        this.accessory.setCharacteristic(this.homekitCharacteristic, speed, !callback);
        callback && callback(null, speed);
      }
    }

  }

  exports.RotationSpeedCharacteristic = RotationSpeedCharacteristic;
  RotationSpeedCharacteristic.Title = 'Characteristic.RotationSpeed';
});