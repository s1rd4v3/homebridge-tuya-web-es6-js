"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./BaseAccessory", "lodash.debounce", "../helpers/DebouncedPromise", "./characteristics"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./BaseAccessory"), require("lodash.debounce"), require("../helpers/DebouncedPromise"), require("./characteristics"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.BaseAccessory, global.lodash, global.DebouncedPromise, global.characteristics);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _BaseAccessory, _lodash, _DebouncedPromise, _characteristics) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ColorAccessory = undefined;

  var _lodash2 = _interopRequireDefault(_lodash);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  class ColorAccessory extends _BaseAccessory.BaseAccessory {
    constructor() {
      super(...arguments);
      this.setColorDebounced = (0, _lodash2.default)(() => {
        var {
          resolve,
          reject
        } = this.debouncePromise;
        this.debouncePromise = undefined;
        var hue = Number(this.hue !== undefined ? this.hue : _characteristics.HueCharacteristic.DEFAULT_VALUE);
        var saturation = Number(this.saturation !== undefined ? this.saturation : _characteristics.SaturationCharacteristic.DEFAULT_VALUE);
        this.setRemoteColor({
          hue,
          saturation
        }).then(resolve).catch(reject);
      }, 100, {
        maxWait: 500
      });
    }

    setRemoteColor(color) {
      var _this = this;

      return _asyncToGenerator(function* () {
        var cachedValue = _this.cachedValue(true);

        var brightness = Number(cachedValue ? cachedValue.brightness : _characteristics.BrightnessCharacteristic.DEFAULT_VALUE);
        var tuyaData = {
          hue: color.hue,
          saturation: color.saturation / 100,
          brightness
        };
        yield _this.setDeviceState('colorSet', {
          color: tuyaData
        }, {
          color,
          color_mode: _characteristics.COLOR_MODES[0]
        });
      })();
    }

    setColor(color) {
      if (!this.debouncePromise) {
        this.debouncePromise = new _DebouncedPromise.DebouncedPromise();
      }

      this.hue = color.hue !== undefined ? color.hue : this.hue;
      this.saturation = color.saturation !== undefined ? color.saturation : this.saturation;
      this.setColorDebounced();
      return this.debouncePromise.promise;
    }

  }

  exports.ColorAccessory = ColorAccessory;
});