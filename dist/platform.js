"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./settings", "./TuyaWebApi", "./accessories", "./errors", "./helpers/DeviceList"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./settings"), require("./TuyaWebApi"), require("./accessories"), require("./errors"), require("./helpers/DeviceList"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.settings, global.TuyaWebApi, global.accessories, global.errors, global.DeviceList);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _settings, _TuyaWebApi, _accessories, _errors, _DeviceList) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TuyaWebPlatform = undefined;

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

  /**
   * HomebridgePlatform
   * This class is the main constructor for your plugin, this is where you should
   * parse the user config and discover/register accessories with Homebridge.
   */
  class TuyaWebPlatform {
    constructor(log, config, api) {
      var _this = this;

      this.log = log;
      this.config = config;
      this.api = api;
      this.Service = this.api.hap.Service;
      this.Characteristic = this.api.hap.Characteristic; // this is used to track restored cached accessories
      // eslint-disable-next-line @typescript-eslint/no-explicit-any

      this.accessories = new Map();
      this.failedToInitAccessories = new Map();
      this.log.debug('Finished initializing platform:', this.config.name);

      if (!config || !config.options) {
        this.log.info('No options found in configuration file, disabling plugin.');
        return;
      }

      var options = config.options;

      if (options.username === undefined || options.password === undefined || options.countryCode === undefined) {
        this.log.error('Missing required config parameter.');
        return;
      }

      if (options.platform !== undefined && !_TuyaWebApi.TuyaPlatforms.includes(options.platform)) {
        this.log.error('Invalid platform provided, received %s but must be one of %s', options.platform, _TuyaWebApi.TuyaPlatforms);
      } // Set cloud polling interval


      this.pollingInterval = config.options.pollingInterval; // Create Tuya Web API instance

      this.tuyaWebApi = new _TuyaWebApi.TuyaWebApi(options.username, options.password, options.countryCode, options.platform, this.log); // When this event is fired it means Homebridge has restored all cached accessories from disk.
      // Dynamic Platform plugins should only register new accessories after this event was fired,
      // in order to ensure they weren't added to homebridge already. This event can also be used
      // to start discovery of new accessories.

      this.api.on('didFinishLaunching', _asyncToGenerator(function* () {
        var _a;

        try {
          yield _this.tuyaWebApi.getOrRefreshToken(); // run the method to discover / register your devices as accessories

          yield _this.discoverDevices();

          if (_this.pollingInterval) {
            //Tuya will probably still complain if we fetch a new request on the exact second.
            var pollingInterval = Math.max(_this.pollingInterval, _settings.TUYA_DISCOVERY_TIMEOUT + 5);
            (_a = _this.log) === null || _a === void 0 ? void 0 : _a.info('Enable cloud polling with interval %ss', pollingInterval); // Set interval for refreshing device states

            setInterval(() => {
              _this.refreshDeviceStates().catch(error => {
                _this.log.error(error.message);
              });
            }, pollingInterval * 1000);
          }
        } catch (e) {
          if (e instanceof _errors.AuthenticationError) {
            _this.log.error('Authentication error: %s', e.message);
          } else {
            _this.log.error(e.message);

            _this.log.debug(e);
          }
        }
      }));
    }
    /**
         * This function is invoked when homebridge restores cached accessories from disk at startup.
         * It should be used to setup event handlers for characteristics and update respective values.
         */


    configureAccessory(accessory) {
      this.log.info('Loading accessory from cache:', accessory.displayName); // add the restored accessory to the accessories cache so we can track if it has already been registered

      this.accessories.set(accessory.UUID, accessory);
    }

    removeAccessory(accessory) {
      this.log.info('Removing accessory:', accessory.displayName);
      this.api.unregisterPlatformAccessories(_settings.PLUGIN_NAME, _settings.PLATFORM_NAME, [accessory]);
      this.accessories.delete(accessory.UUID);
    } // Called from device classes


    registerPlatformAccessory(accessory) {
      this.log.debug('Register Platform Accessory (%s)', accessory.displayName);
      this.api.registerPlatformAccessories(_settings.PLUGIN_NAME, _settings.PLATFORM_NAME, [accessory]);
      this.accessories.set(accessory.UUID, accessory);
    }

    refreshDeviceStates(devices) {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var _a, _b;

        devices = devices || _this2.filterDeviceList(yield _this2.tuyaWebApi.getAllDeviceStates());

        if (!devices) {
          return;
        } // Refresh device states


        for (var device of devices) {
          var uuid = _this2.api.hap.uuid.generate(device.id);

          var homebridgeAccessory = _this2.accessories.get(uuid);

          if (homebridgeAccessory) {
            (_a = homebridgeAccessory.controller) === null || _a === void 0 ? void 0 : _a.updateAccessory(device);
          } else if (!((_b = _this2.failedToInitAccessories.get(device.dev_type)) === null || _b === void 0 ? void 0 : _b.includes(uuid))) {
            _this2.log.error('Could not find Homebridge device with UUID (%s) for Tuya device (%s)', uuid, device.name);
          }
        }
      })();
    }

    addAccessory(device) {
      var deviceType = device.dev_type || 'switch';
      var uuid = this.api.hap.uuid.generate(device.id);
      var homebridgeAccessory = this.accessories.get(uuid); // Construct new accessory

      /* eslint-disable @typescript-eslint/no-explicit-any */

      switch (deviceType) {
        case 'dimmer':
          new _accessories.DimmerAccessory(this, homebridgeAccessory, device);
          break;

        case 'cover':
          new _accessories.CoverAccessory(this, homebridgeAccessory, device);
          break;

        case 'fan':
          new _accessories.FanAccessory(this, homebridgeAccessory, device);
          break;

        case 'light':
          new _accessories.LightAccessory(this, homebridgeAccessory, device);
          break;

        case 'outlet':
          new _accessories.OutletAccessory(this, homebridgeAccessory, device);
          break;

        case 'scene':
          new _accessories.SceneAccessory(this, homebridgeAccessory, device);
          break;

        case 'switch':
          new _accessories.SwitchAccessory(this, homebridgeAccessory, device);
          break;

        default:
          if (!this.failedToInitAccessories.get(deviceType)) {
            this.log.warn('Could not init class for device type [%s]', deviceType);
            this.failedToInitAccessories.set(deviceType, []);
          }

          this.failedToInitAccessories.set(deviceType, [uuid, ...this.failedToInitAccessories.get(deviceType)]);
          break;
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */

    }

    filterDeviceList(devices) {
      if (!devices) {
        return [];
      }

      var allowedSceneIds = this.getAllowedSceneIds(devices);
      var hiddenAccessoryIds = this.getHiddenAccessoryIds(devices);
      return devices.filter(d => d.dev_type !== 'scene' || allowedSceneIds.includes(d.id)).filter(d => !hiddenAccessoryIds.includes(d.id));
    }

    discoverDevices() {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        var devices = (yield _this3.tuyaWebApi.discoverDevices()) || []; // Is device type overruled in config defaults?

        var parsedDefaults = _this3.parseDefaultsForDevices(devices);

        for (var defaults of parsedDefaults) {
          defaults.device.dev_type = defaults.device_type;

          _this3.log.info('Device type for "%s" is overruled in config to: "%s"', defaults.device.name, defaults.device.dev_type);
        }

        devices = _this3.filterDeviceList(devices);
        var cachedDeviceIds = [..._this3.accessories.keys()];
        var availableDeviceIds = devices.map(d => _this3.generateUUID(d.id));

        for (var cachedDeviceId of cachedDeviceIds) {
          if (!availableDeviceIds.includes(cachedDeviceId)) {
            var device = _this3.accessories.get(cachedDeviceId);

            _this3.log.warn('Device: %s - is no longer available and will be removed', device.displayName);

            _this3.removeAccessory(device);
          }
        } // loop over the discovered devices and register each one if it has not already been registered


        for (var _device of devices) {
          _this3.addAccessory(_device);
        }

        yield _this3.refreshDeviceStates(devices);
      })();
    }
    /**
         * Returns a validated set of defaults and their devices for which the type will need to be overridden.
         * @param devices
         * @private
         */


    parseDefaultsForDevices(devices) {
      var _this4 = this;

      var defaults = this.config.defaults;

      if (!defaults) {
        return [];
      }

      var parsedDefaults = [];

      var _loop = function _loop(configuredDefault) {
        if (!configuredDefault.id) {
          _this4.log.warn('Missing required `id` property on device type overwrite, received:\r\n%s', JSON.stringify(configuredDefault, undefined, 2));

          return "continue";
        }

        if (!configuredDefault.device_type) {
          _this4.log.warn('Missing required `device_type` property on device type overwrite, received:\r\n%s', JSON.stringify(configuredDefault, undefined, 2));

          return "continue";
        }

        configuredDefault.device_type = configuredDefault.device_type.toLowerCase();
        var device = devices.find(device => device.id === configuredDefault.id || device.name === configuredDefault.id);

        if (!device) {
          _this4.log.warn('Tried adding default for device: "%s" which is not a valid device-id or device-name.', configuredDefault.id);

          return "continue";
        }

        if (!_TuyaWebApi.TuyaDeviceTypes.includes(configuredDefault.device_type)) {
          _this4.log.warn('Added defaults for device: "%s" - device-type "%s" is not a valid device-type.', device.name, configuredDefault.device_type);

          return "continue";
        }

        parsedDefaults.push(_objectSpread(_objectSpread({}, configuredDefault), {}, {
          device
        }));
      };

      for (var configuredDefault of defaults) {
        var _ret = _loop(configuredDefault);

        if (_ret === "continue") continue;
      }

      return parsedDefaults;
    }
    /**
         * Returns a list of all allowed scene Ids.
         * @param devices
         * @private
         */


    getAllowedSceneIds(devices) {
      if (!this.config.scenes) {
        return [];
      }

      var sceneList = new _DeviceList.DeviceList(devices.filter(d => d.dev_type === 'scene'));

      if (!Array.isArray(this.config.scenesWhitelist) || this.config.scenesWhitelist.length === 0) {
        return sceneList.all;
      }

      var allowedSceneIds = [];

      for (var toAllowSceneIdentifier of this.config.scenesWhitelist) {
        var deviceIdentifier = sceneList.find(toAllowSceneIdentifier);

        if (deviceIdentifier) {
          allowedSceneIds.push(deviceIdentifier);
          continue;
        }

        this.log.warn('Tried allowing non-existing scene %s', toAllowSceneIdentifier);
      }

      return [...new Set(allowedSceneIds)];
    }
    /**
       * Returns a list of all devices that are not supposed to be exposed.
       * @param devices
       * @private
       */


    getHiddenAccessoryIds(devices) {
      if (!this.config.hiddenAccessories) {
        return [];
      }

      if (!Array.isArray(this.config.hiddenAccessories) || this.config.hiddenAccessories.length === 0) {
        return [];
      }

      var deviceList = new _DeviceList.DeviceList(devices);
      var hiddenAccessoryIdentifiers = [];

      for (var toDisallowAccessoryIdentifier of this.config.hiddenAccessories) {
        var deviceIdentifier = deviceList.find(toDisallowAccessoryIdentifier);

        if (deviceIdentifier) {
          hiddenAccessoryIdentifiers.push(deviceIdentifier);
          continue;
        }

        this.log.warn('Tried disallowing non-existing device %s', toDisallowAccessoryIdentifier);
      }

      return [...new Set(hiddenAccessoryIdentifiers)];
    }

    get platformAccessory() {
      return this.api.platformAccessory;
    }

    get generateUUID() {
      return this.api.hap.uuid.generate;
    }

  }

  exports.TuyaWebPlatform = TuyaWebPlatform;
});