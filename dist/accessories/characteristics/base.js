"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "homebridge"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("homebridge"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.homebridge);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _homebridge) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TuyaWebCharacteristic = undefined;

  class TuyaWebCharacteristic {
    constructor(accessory) {
      this.accessory = accessory;
      this.accessory = accessory;

      if (!this.staticInstance.isSupportedByAccessory(accessory)) {
        this.disable();
        return;
      }

      this.enable();
    }

    static isSupportedByAccessory(accessory) {
      accessory.log.error('Method `isSupportedByAccessory must be overwritten by Characteristic, missing for %s', this.Title);
      return false;
    }

    setProps(characteristic) {
      return characteristic;
    }

    get staticInstance() {
      return this.constructor;
    }

    get title() {
      return this.staticInstance.Title;
    }

    get homekitCharacteristic() {
      return this.staticInstance.HomekitCharacteristic(this.accessory);
    }

    log(logLevel, message) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      this.accessory.log.log(logLevel, "[%s] %s - ".concat(message), this.accessory.name, this.title, ...args);
    }

    debug(message) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      this.log(_homebridge.LogLevel.DEBUG, message, ...args);
    }

    info(message) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      this.log(_homebridge.LogLevel.INFO, message, ...args);
    }

    warn(message) {
      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }

      this.log(_homebridge.LogLevel.WARN, message, ...args);
    }

    error(message) {
      for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        args[_key5 - 1] = arguments[_key5];
      }

      this.log(_homebridge.LogLevel.ERROR, message, ...args);
    }

    enable() {
      var _this$accessory$servi;

      this.debug('Enabled');
      var char = this.setProps((_this$accessory$servi = this.accessory.service) === null || _this$accessory$servi === void 0 ? void 0 : _this$accessory$servi.getCharacteristic(this.homekitCharacteristic));

      if (char) {
        this.getRemoteValue && char.on('get', this.getRemoteValue.bind(this));
        this.setRemoteValue && char.on('set', this.setRemoteValue.bind(this));
      }

      this.updateValue && this.accessory.addUpdateCallback(this.homekitCharacteristic, this.updateValue.bind(this));
    }

    disable() {
      var _this$accessory$servi2;

      this.debug('Characteristic not supported');
      (_this$accessory$servi2 = this.accessory.service) === null || _this$accessory$servi2 === void 0 ? void 0 : _this$accessory$servi2.removeCharacteristic(new this.homekitCharacteristic());
    }

  }

  exports.TuyaWebCharacteristic = TuyaWebCharacteristic;
});