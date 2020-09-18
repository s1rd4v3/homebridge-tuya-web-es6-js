"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "homebridge", "lodash.debounce", "../settings", "util", "../helpers/DebouncedPromise", "../errors"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("homebridge"), require("lodash.debounce"), require("../settings"), require("util"), require("../helpers/DebouncedPromise"), require("../errors"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.homebridge, global.lodash, global.settings, global.util, global.DebouncedPromise, global.errors);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _homebridge, _lodash, _settings, _util, _DebouncedPromise, _errors) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.BaseAccessory = undefined;

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

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  class Cache {
    constructor() {
      this.validUntil = 0;
    }

    get valid() {
      return this.validUntil > Cache.getCurrentEpoch() && this.value !== undefined;
    }

    set(data) {
      this.validUntil = Cache.getCurrentEpoch() + _settings.TUYA_DEVICE_TIMEOUT + 5;
      this.value = data;
    }

    renew() {
      var data = this.get(true);

      if (data) {
        this.set(data);
      }
    }

    merge(data) {
      this.value = _objectSpread(_objectSpread({}, this.value), data);
    }
    /**
         *
         * @param always - return the cache even if cache is not valid
         */


    get() {
      var always = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!always && !this.valid) {
        return null;
      }

      return this.value || null;
    }

    static getCurrentEpoch() {
      return Math.ceil(new Date().getTime() / 1000);
    }

  }

  class BaseAccessory {
    constructor(platform, homebridgeAccessory, deviceConfig, categoryType) {
      this.platform = platform;
      this.homebridgeAccessory = homebridgeAccessory;
      this.deviceConfig = deviceConfig;
      this.categoryType = categoryType;
      this.cache = new Cache();
      this.updateCallbackList = new Map();
      this.debouncedDeviceStateRequest = (0, _lodash2.default)(this.resolveDeviceStateRequest, 500, {
        maxWait: 1500
      });
      this.log = platform.log;
      this.deviceId = deviceConfig.id;
      this.log.debug('[%s] deviceConfig: %s', this.deviceConfig.name, (0, _util.inspect)(this.deviceConfig));

      switch (categoryType) {
        case _homebridge.Categories.LIGHTBULB:
          this.serviceType = platform.Service.Lightbulb;
          break;

        case _homebridge.Categories.SWITCH:
          this.serviceType = platform.Service.Switch;
          break;

        case _homebridge.Categories.OUTLET:
          this.serviceType = platform.Service.Outlet;
          break;

        case _homebridge.Categories.FAN:
          this.serviceType = platform.Service.Fanv2;
          break;

        case _homebridge.Categories.WINDOW_COVERING:
          this.serviceType = platform.Service.WindowCovering;
          break;

        default:
          this.serviceType = platform.Service.AccessoryInformation;
      } // Retrieve existing of create new Bridged Accessory


      if (this.homebridgeAccessory) {
        this.homebridgeAccessory.controller = this;

        if (!this.homebridgeAccessory.context.deviceId) {
          this.homebridgeAccessory.context.deviceId = this.deviceConfig.id;
        }

        this.log.info('Existing Accessory found [Name: %s] [Tuya ID: %s] [HomeBridge ID: %s]', this.homebridgeAccessory.displayName, this.homebridgeAccessory.context.deviceId, this.homebridgeAccessory.UUID);
        this.homebridgeAccessory.displayName = this.deviceConfig.name;
      } else {
        this.homebridgeAccessory = new this.platform.platformAccessory(this.deviceConfig.name, this.platform.generateUUID(this.deviceConfig.id), categoryType);
        this.homebridgeAccessory.context.deviceId = this.deviceConfig.id;
        this.homebridgeAccessory.controller = this;
        this.log.info('Created new Accessory [Name: %s] [Tuya ID: %s] [HomeBridge ID: %s]', this.homebridgeAccessory.displayName, this.homebridgeAccessory.context.deviceId, this.homebridgeAccessory.UUID);
        this.platform.registerPlatformAccessory(this.homebridgeAccessory);
      } // Create service


      this.service = this.homebridgeAccessory.getService(this.serviceType);

      if (this.service) {
        this.service.setCharacteristic(platform.Characteristic.Name, this.deviceConfig.name);
      } else {
        this.log.debug('Creating New Service %s', this.deviceConfig.id);
        this.service = this.homebridgeAccessory.addService(this.serviceType, this.deviceConfig.name);
      }

      this.homebridgeAccessory.on('identify', this.onIdentify.bind(this));
    }

    get name() {
      return this.homebridgeAccessory.displayName;
    }

    setCharacteristic(characteristic, value) {
      var _this$service;

      var updateHomekit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      updateHomekit && ((_this$service = this.service) === null || _this$service === void 0 ? void 0 : _this$service.getCharacteristic(characteristic).updateValue(value));
    }

    onIdentify() {
      this.log.info('[IDENTIFY] %s', this.name);
    }

    cachedValue() {
      var always = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return this.cache.get(always);
    }

    resolveDeviceStateRequest() {
      var _this = this;

      return _asyncToGenerator(function* () {
        var promise = _this.debouncedDeviceStateRequestPromise;

        if (!promise) {
          _this.error('Could not find base accessory promise.');

          return;
        }

        _this.debug('Unsetting debouncedDeviceStateRequestPromise');

        _this.debouncedDeviceStateRequestPromise = undefined;

        var cached = _this.cache.get();

        if (cached !== null) {
          _this.debug('Resolving resolveDeviceStateRequest from cache');

          return promise.resolve(cached);
        }

        _this.platform.tuyaWebApi.getDeviceState(_this.deviceId).then(data => {
          if (data) {
            _this.debug('Set device state request cache');

            _this.cache.set(data);
          }

          _this.debug('Resolving resolveDeviceStateRequest from remote');

          promise.resolve(data);
        }).catch(error => {
          if (error instanceof _errors.RatelimitError) {
            _this.debug('Renewing cache due to RateLimitError');

            var data = _this.cache.get(true);

            if (data) {
              _this.cache.renew();

              return promise.resolve(data);
            }
          }

          promise.reject(error);
        });
      })();
    }

    getDeviceState() {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        _this2.debug('Requesting device state');

        if (!_this2.debouncedDeviceStateRequestPromise) {
          _this2.debug('Creating new debounced promise');

          _this2.debouncedDeviceStateRequestPromise = new _DebouncedPromise.DebouncedPromise();
        }

        _this2.debug('Triggering debouncedDeviceStateRequest');

        _this2.debouncedDeviceStateRequest();

        return _this2.debouncedDeviceStateRequestPromise.promise;
      })();
    }

    setDeviceState(method, payload, cache) {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        _this3.cache.merge(cache);

        return _this3.platform.tuyaWebApi.setDeviceState(_this3.deviceId, method, payload);
      })();
    }

    updateAccessory(device) {
      var setCharacteristic = (characteristic, value) => {
        var char = accessoryInformationService.getCharacteristic(characteristic) || accessoryInformationService.addCharacteristic(characteristic);

        if (char) {
          char.setValue(value);
        }
      };

      this.homebridgeAccessory.displayName = device.name;
      this.homebridgeAccessory._associatedHAPAccessory.displayName = device.name;
      var accessoryInformationService = this.homebridgeAccessory.getService(this.platform.Service.AccessoryInformation) || this.homebridgeAccessory.addService(this.platform.Service.AccessoryInformation);
      setCharacteristic(this.platform.Characteristic.Name, device.name);
      setCharacteristic(this.platform.Characteristic.SerialNumber, this.deviceConfig.id);
      setCharacteristic(this.platform.Characteristic.Manufacturer, _settings.PLUGIN_NAME);
      setCharacteristic(this.platform.Characteristic.Model, this.categoryType); // Update device specific state

      this.updateState(device.data);
    }

    updateState(data) {
      this.cache.set(data);

      for (var [, callback] of this.updateCallbackList) {
        if (callback !== null) {
          callback(data);
        }
      }
    }

    addUpdateCallback(char, callback) {
      this.updateCallbackList.set(char, callback);
    }

    handleError(type, callback) {
      return error => {
        this.error('[%s] %s', type, error.message);
        callback(error);
      };
    }

    shortcutLog(logLevel, message) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      this.log.log(logLevel, "[%s] - ".concat(message), this.name, ...args);
    }

    debug(message) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      this.shortcutLog(_homebridge.LogLevel.DEBUG, message, ...args);
    }

    info(message) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      this.shortcutLog(_homebridge.LogLevel.INFO, message, ...args);
    }

    warn(message) {
      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }

      this.shortcutLog(_homebridge.LogLevel.WARN, message, ...args);
    }

    error(message) {
      for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        args[_key5 - 1] = arguments[_key5];
      }

      this.shortcutLog(_homebridge.LogLevel.ERROR, message, ...args);
    }

  }

  exports.BaseAccessory = BaseAccessory;
});