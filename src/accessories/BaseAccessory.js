import { Categories, LogLevel } from 'homebridge';
import debounce from 'lodash.debounce';
import { PLUGIN_NAME, TUYA_DEVICE_TIMEOUT } from '../settings';
import { inspect } from 'util';
import { DebouncedPromise } from '../helpers/DebouncedPromise';
import { RatelimitError } from '../errors';
class Cache {
  constructor() {
    this.validUntil = 0;
  }

  get valid() {
    return this.validUntil > Cache.getCurrentEpoch() && this.value !== undefined;
  }

  set(data) {
    this.validUntil = Cache.getCurrentEpoch() + TUYA_DEVICE_TIMEOUT + 5;
    this.value = data;
  }

  renew() {
    const data = this.get(true);
    if (data) {
      this.set(data);
    }
  }

  merge(data) {
    this.value = { ...this.value, ...data };
  }

  /**
       *
       * @param always - return the cache even if cache is not valid
       */
  get(always = false) {
    if (!always && !this.valid) {
      return null;
    }
    return this.value || null;
  }

  static getCurrentEpoch() {
    return Math.ceil((new Date()).getTime() / 1000);
  }
}
export class BaseAccessory {
  constructor(platform, homebridgeAccessory, deviceConfig, categoryType) {
    this.platform = platform;
    this.homebridgeAccessory = homebridgeAccessory;
    this.deviceConfig = deviceConfig;
    this.categoryType = categoryType;
    this.cache = new Cache();
    this.updateCallbackList = new Map();
    this.debouncedDeviceStateRequest = debounce(this.resolveDeviceStateRequest, 500, { maxWait: 1500 });
    this.log = platform.log;
    this.deviceId = deviceConfig.id;
    this.log.debug('[%s] deviceConfig: %s', this.deviceConfig.name, inspect(this.deviceConfig));
    switch (categoryType) {
      case Categories.LIGHTBULB:
        this.serviceType = platform.Service.Lightbulb;
        break;
      case Categories.SWITCH:
        this.serviceType = platform.Service.Switch;
        break;
      case Categories.OUTLET:
        this.serviceType = platform.Service.Outlet;
        break;
      case Categories.FAN:
        this.serviceType = platform.Service.Fanv2;
        break;
      case Categories.WINDOW_COVERING:
        this.serviceType = platform.Service.WindowCovering;
        break;
      default:
        this.serviceType = platform.Service.AccessoryInformation;
    }
    // Retrieve existing of create new Bridged Accessory
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
    }
    // Create service
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

  setCharacteristic(characteristic, value, updateHomekit = false) {
    updateHomekit && this.service?.getCharacteristic(characteristic).updateValue(value);
  }

  onIdentify() {
    this.log.info('[IDENTIFY] %s', this.name);
  }

  cachedValue(always = false) {
    return this.cache.get(always);
  }

  async resolveDeviceStateRequest() {
    const promise = this.debouncedDeviceStateRequestPromise;
    if (!promise) {
      this.error('Could not find base accessory promise.');
      return;
    }
    this.debug('Unsetting debouncedDeviceStateRequestPromise');
    this.debouncedDeviceStateRequestPromise = undefined;
    const cached = this.cache.get();
    if (cached !== null) {
      this.debug('Resolving resolveDeviceStateRequest from cache');
      return promise.resolve(cached);
    }
    this.platform.tuyaWebApi.getDeviceState(this.deviceId)
      .then((data) => {
        if (data) {
          this.debug('Set device state request cache');
          this.cache.set(data);
        }
        this.debug('Resolving resolveDeviceStateRequest from remote');
        promise.resolve(data);
      })
      .catch((error) => {
        if (error instanceof RatelimitError) {
          this.debug('Renewing cache due to RateLimitError');
          const data = this.cache.get(true);
          if (data) {
            this.cache.renew();
            return promise.resolve(data);
          }
        }
        promise.reject(error);
      });
  }

  async getDeviceState() {
    this.debug('Requesting device state');
    if (!this.debouncedDeviceStateRequestPromise) {
      this.debug('Creating new debounced promise');
      this.debouncedDeviceStateRequestPromise = new DebouncedPromise();
    }
    this.debug('Triggering debouncedDeviceStateRequest');
    this.debouncedDeviceStateRequest();
    return this.debouncedDeviceStateRequestPromise.promise;
  }

  async setDeviceState(method, payload, cache) {
    this.cache.merge(cache);
    return this.platform.tuyaWebApi.setDeviceState(this.deviceId, method, payload);
  }

  updateAccessory(device) {
    const setCharacteristic = (characteristic, value) => {
      const char = accessoryInformationService.getCharacteristic(characteristic) ||
                accessoryInformationService.addCharacteristic(characteristic);
      if (char) {
        char.setValue(value);
      }
    };
    this.homebridgeAccessory.displayName = device.name;
    this.homebridgeAccessory._associatedHAPAccessory.displayName = device.name;
    const accessoryInformationService = (this.homebridgeAccessory.getService(this.platform.Service.AccessoryInformation) ||
            this.homebridgeAccessory.addService(this.platform.Service.AccessoryInformation));
    setCharacteristic(this.platform.Characteristic.Name, device.name);
    setCharacteristic(this.platform.Characteristic.SerialNumber, this.deviceConfig.id);
    setCharacteristic(this.platform.Characteristic.Manufacturer, PLUGIN_NAME);
    setCharacteristic(this.platform.Characteristic.Model, this.categoryType);
    // Update device specific state
    this.updateState(device.data);
  }

  updateState(data) {
    this.cache.set(data);
    for (const [, callback] of this.updateCallbackList) {
      if (callback !== null) {
        callback(data);
      }
    }
  }

  addUpdateCallback(char, callback) {
    this.updateCallbackList.set(char, callback);
  }

  handleError(type, callback) {
    return (error) => {
      this.error('[%s] %s', type, error.message);
      callback(error);
    };
  }

  shortcutLog(logLevel, message, ...args) {
    this.log.log(logLevel, `[%s] - ${message}`, this.name, ...args);
  }

  debug(message, ...args) {
    this.shortcutLog(LogLevel.DEBUG, message, ...args);
  }

  info(message, ...args) {
    this.shortcutLog(LogLevel.INFO, message, ...args);
  }

  warn(message, ...args) {
    this.shortcutLog(LogLevel.WARN, message, ...args);
  }

  error(message, ...args) {
    this.shortcutLog(LogLevel.ERROR, message, ...args);
  }
}
