import { LogLevel } from 'homebridge';
export class TuyaWebCharacteristic {
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

  log(logLevel, message, ...args) {
    this.accessory.log.log(logLevel, `[%s] %s - ${message}`, this.accessory.name, this.title, ...args);
  }

  debug(message, ...args) {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message, ...args) {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message, ...args) {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message, ...args) {
    this.log(LogLevel.ERROR, message, ...args);
  }

  enable() {
    this.debug('Enabled');
    const char = this.setProps(this.accessory.service?.getCharacteristic(this.homekitCharacteristic));
    if (char) {
      this.getRemoteValue && char.on('get', this.getRemoteValue.bind(this));
      this.setRemoteValue && char.on('set', this.setRemoteValue.bind(this));
    }
    this.updateValue && this.accessory.addUpdateCallback(this.homekitCharacteristic, this.updateValue.bind(this));
  }

  disable() {
    this.debug('Characteristic not supported');
    this.accessory.service?.removeCharacteristic(new this.homekitCharacteristic);
  }
}
