import { PLATFORM_NAME, PLUGIN_NAME, TUYA_DISCOVERY_TIMEOUT } from './settings';
import { TuyaDeviceTypes, TuyaPlatforms, TuyaWebApi } from './TuyaWebApi';
import { CoverAccessory, DimmerAccessory, FanAccessory, LightAccessory, OutletAccessory, SceneAccessory, SwitchAccessory } from './accessories';
import { AuthenticationError } from './errors';
import { DeviceList } from './helpers/DeviceList';
/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class TuyaWebPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;
    // this is used to track restored cached accessories
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.accessories = new Map();
    this.failedToInitAccessories = new Map();
    this.log.debug('Finished initializing platform:', this.config.name);
    if (!config || !config.options) {
      this.log.info('No options found in configuration file, disabling plugin.');
      return;
    }
    const options = config.options;
    if (options.username === undefined || options.password === undefined || options.countryCode === undefined) {
      this.log.error('Missing required config parameter.');
      return;
    }
    if (options.platform !== undefined && !TuyaPlatforms.includes(options.platform)) {
      this.log.error('Invalid platform provided, received %s but must be one of %s', options.platform, TuyaPlatforms);
    }
    // Set cloud polling interval
    this.pollingInterval = config.options.pollingInterval;
    // Create Tuya Web API instance
    this.tuyaWebApi = new TuyaWebApi(options.username, options.password, options.countryCode, options.platform, this.log);
    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', async () => {
      var _a;
      try {
        await this.tuyaWebApi.getOrRefreshToken();
        // run the method to discover / register your devices as accessories
        await this.discoverDevices();
        if (this.pollingInterval) {
          //Tuya will probably still complain if we fetch a new request on the exact second.
          const pollingInterval = Math.max(this.pollingInterval, TUYA_DISCOVERY_TIMEOUT + 5);
          (_a = this.log) === null || _a === void 0 ? void 0 : _a.info('Enable cloud polling with interval %ss', pollingInterval);
          // Set interval for refreshing device states
          setInterval(() => {
            this.refreshDeviceStates().catch((error) => {
              this.log.error(error.message);
            });
          }, pollingInterval * 1000);
        }
      } catch (e) {
        if (e instanceof AuthenticationError) {
          this.log.error('Authentication error: %s', e.message);
        } else {
          this.log.error(e.message);
          this.log.debug(e);
        }
      }
    });
  }

  /**
       * This function is invoked when homebridge restores cached accessories from disk at startup.
       * It should be used to setup event handlers for characteristics and update respective values.
       */
  configureAccessory(accessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.set(accessory.UUID, accessory);
  }

  removeAccessory(accessory) {
    this.log.info('Removing accessory:', accessory.displayName);
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    this.accessories.delete(accessory.UUID);
  }

  // Called from device classes
  registerPlatformAccessory(accessory) {
    this.log.debug('Register Platform Accessory (%s)', accessory.displayName);
    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    this.accessories.set(accessory.UUID, accessory);
  }

  async refreshDeviceStates(devices) {
    var _a, _b;
    devices = devices || this.filterDeviceList(await this.tuyaWebApi.getAllDeviceStates());
    if (!devices) {
      return;
    }
    // Refresh device states
    for (const device of devices) {
      const uuid = this.api.hap.uuid.generate(device.id);
      const homebridgeAccessory = this.accessories.get(uuid);
      if (homebridgeAccessory) {
        (_a = homebridgeAccessory.controller) === null || _a === void 0 ? void 0 : _a.updateAccessory(device);
      } else if (!((_b = this.failedToInitAccessories.get(device.dev_type)) === null || _b === void 0 ? void 0 : _b.includes(uuid))) {
        this.log.error('Could not find Homebridge device with UUID (%s) for Tuya device (%s)', uuid, device.name);
      }
    }
  }

  addAccessory(device) {
    const deviceType = device.dev_type || 'switch';
    const uuid = this.api.hap.uuid.generate(device.id);
    const homebridgeAccessory = this.accessories.get(uuid);
    // Construct new accessory
    /* eslint-disable @typescript-eslint/no-explicit-any */
    switch (deviceType) {
      case 'dimmer':
        new DimmerAccessory(this, homebridgeAccessory, device);
        break;
      case 'cover':
        new CoverAccessory(this, homebridgeAccessory, device);
        break;
      case 'fan':
        new FanAccessory(this, homebridgeAccessory, device);
        break;
      case 'light':
        new LightAccessory(this, homebridgeAccessory, device);
        break;
      case 'outlet':
        new OutletAccessory(this, homebridgeAccessory, device);
        break;
      case 'scene':
        new SceneAccessory(this, homebridgeAccessory, device);
        break;
      case 'switch':
        new SwitchAccessory(this, homebridgeAccessory, device);
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
    const allowedSceneIds = this.getAllowedSceneIds(devices);
    const hiddenAccessoryIds = this.getHiddenAccessoryIds(devices);
    return devices
      .filter(d => d.dev_type !== 'scene' || allowedSceneIds.includes(d.id))
      .filter(d => !hiddenAccessoryIds.includes(d.id));
  }

  async discoverDevices() {
    let devices = await this.tuyaWebApi.discoverDevices() || [];
    // Is device type overruled in config defaults?
    const parsedDefaults = this.parseDefaultsForDevices(devices);
    for (const defaults of parsedDefaults) {
      defaults.device.dev_type = defaults.device_type;
      this.log.info('Device type for "%s" is overruled in config to: "%s"', defaults.device.name, defaults.device.dev_type);
    }
    devices = this.filterDeviceList(devices);
    const cachedDeviceIds = [...this.accessories.keys()];
    const availableDeviceIds = devices.map(d => this.generateUUID(d.id));
    for (const cachedDeviceId of cachedDeviceIds) {
      if (!availableDeviceIds.includes(cachedDeviceId)) {
        const device = this.accessories.get(cachedDeviceId);
        this.log.warn('Device: %s - is no longer available and will be removed', device.displayName);
        this.removeAccessory(device);
      }
    }
    // loop over the discovered devices and register each one if it has not already been registered
    for (const device of devices) {
      this.addAccessory(device);
    }
    await this.refreshDeviceStates(devices);
  }

  /**
       * Returns a validated set of defaults and their devices for which the type will need to be overridden.
       * @param devices
       * @private
       */
  parseDefaultsForDevices(devices) {
    const defaults = this.config.defaults;
    if (!defaults) {
      return [];
    }
    const parsedDefaults = [];
    for (const configuredDefault of defaults) {
      if (!configuredDefault.id) {
        this.log.warn('Missing required `id` property on device type overwrite, received:\r\n%s', JSON.stringify(configuredDefault, undefined, 2));
        continue;
      }
      if (!configuredDefault.device_type) {
        this.log.warn('Missing required `device_type` property on device type overwrite, received:\r\n%s', JSON.stringify(configuredDefault, undefined, 2));
        continue;
      }
      configuredDefault.device_type = configuredDefault.device_type.toLowerCase();
      const device = devices.find(device => device.id === configuredDefault.id || device.name === configuredDefault.id);
      if (!device) {
        this.log.warn('Tried adding default for device: "%s" which is not a valid device-id or device-name.', configuredDefault.id);
        continue;
      }
      if (!TuyaDeviceTypes.includes(configuredDefault.device_type)) {
        this.log.warn('Added defaults for device: "%s" - device-type "%s" is not a valid device-type.', device.name, configuredDefault.device_type);
        continue;
      }
      parsedDefaults.push({ ...configuredDefault, device });
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
    const sceneList = new DeviceList(devices.filter(d => d.dev_type === 'scene'));
    if (!Array.isArray(this.config.scenesWhitelist) || this.config.scenesWhitelist.length === 0) {
      return sceneList.all;
    }
    const allowedSceneIds = [];
    for (const toAllowSceneIdentifier of this.config.scenesWhitelist) {
      const deviceIdentifier = sceneList.find(toAllowSceneIdentifier);
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
    const deviceList = new DeviceList(devices);
    const hiddenAccessoryIdentifiers = [];
    for (const toDisallowAccessoryIdentifier of this.config.hiddenAccessories) {
      const deviceIdentifier = deviceList.find(toDisallowAccessoryIdentifier);
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
